"""byEhsan boot intro and boot logos for the K36 handheld running ArkOS.

ArkOS plays /boot/logo.mp4 with ffplay before EmulationStation starts, and shows
/boot/logo.bmp and /boot/logo_kernel.bmp while booting. See splash/k36/README.md.

The mark draws on edge by edge, the crown springs in, the signature writes itself,
".com" types on under its tail, and the frame fades to black. Geometry comes from
this repo (base.svg, signature.svg, signature-draw-full.svg); colors follow
docs/CONTEXT.md: the mark is the dark `text` token on the shared dark `background`.
".com" is set in the lockup typeface, Space Grotesk 600.

    pip install -r script/requirement.txt
    python3 script/k36_intro.py            # writes splash/k36/

Outputs: logo.mp4 (640x480, 6 s), logo.bmp (640x480), logo_kernel.bmp (720x720),
preview.png (the settled frame).
"""
import argparse
import math
import subprocess
import sys
from io import BytesIO
from pathlib import Path
from xml.etree import ElementTree as ET

import cairosvg
import imageio_ffmpeg
from PIL import Image, ImageDraw, ImageFont

REPO = Path(__file__).resolve().parent.parent
FONT = REPO / "script" / "fonts" / "SpaceGrotesk[wght].ttf"
BG, INK = "#1d1f20", "#f2f2f3"
SVG = "{http://www.w3.org/2000/svg}"
FPS, DURATION = 30, 6.0
HOLD = 5.0                            # settled frame used for the static BMPs

DOMAIN = ".com"
DOMAIN_RIGHT, DOMAIN_BASELINE, DOMAIN_SIZE = 882, 248, 76   # signature units, under the tail, flush with its end
DOMAIN_START, DOMAIN_STEP, DOMAIN_FADE = 3.95, 0.12, 0.16


def load(name):
    return ET.parse(REPO / name).getroot()


base = load("base.svg")
MARK = {p.get("id"): p for p in base.iter(f"{SVG}path")}
CROWN = next(base.iter(f"{SVG}circle"))
SIG_PATHS = list(load("signature.svg").iter(f"{SVG}path"))
PEN = next(load("signature-draw-full.svg").iter(f"{SVG}path")).get("d")
PEN_LEN = 2442.1                      # measured length, docs/CONTEXT.md
P0_LEN = 4 * math.hypot(72, 38)       # crown facet rhombus
EDGE_LEN = math.hypot(72, 146)        # p1 / p2


def clamp(x):
    return max(0.0, min(1.0, x))


def seg(t, a, b):
    return clamp((t - a) / (b - a))


def ease(x):
    return 4 * x**3 if x < 0.5 else 1 - (-2 * x + 2) ** 3 / 2


def spring(x):
    """0 -> overshoot -> settles at 1."""
    return 0.0 if x <= 0 else 1 - math.exp(-7 * x) * math.cos(9 * x)


def dash(length, progress):
    return f'stroke-dasharray="{length:.2f} {length:.2f}" stroke-dashoffset="{length * (1 - progress):.2f}"'


def layout(W, H, k):
    """k scales the whole lockup (1.0 fits 640x480)."""
    ms, ss = 0.88 * k, 0.47 * k                      # mark / signature scale
    mark_h, sig_h, gap = 184 * ms, 202 * ss, 24 * k  # visible heights
    top = (H - (mark_h + gap + sig_h)) / 2
    return dict(ms=ms, ss=ss, mx=W / 2 - 100 * ms, my=top - 20 * ms,
                sx=W / 2 - 485 * ss, sy=top + mark_h + gap - 72 * ss)


def frame_svg(t, W, H, k=1.0):
    L = layout(W, H, k)
    p0 = ease(seg(t, 0.25, 0.95))
    edges = ease(seg(t, 0.85, 1.45))
    ridge = seg(t, 1.30, 1.70)
    crown = spring(seg(t, 1.40, 1.90))
    pen = ease(seg(t, 1.50, 3.70))
    settle = ease(seg(t, 3.55, 4.00))
    breathe = 1 + 0.035 * math.sin(math.pi * seg(t, 4.30, 5.30))

    m = MARK
    cx, cy, r = (float(CROWN.get(a)) for a in ("cx", "cy", "r"))

    def stroke(pid, length, progress):
        p = m[pid]
        return (f'<path d="{p.get("d")}" stroke-width="{p.get("stroke-width")}" '
                f'{dash(length, progress)} opacity="{1 if progress else 0}"/>')

    ridge_path = m["p3"]
    mark = (
        f'<g transform="translate({L["mx"]:.2f},{L["my"]:.2f}) scale({L["ms"]:.4f}) translate({cx},{cy}) '
        f'scale({breathe:.4f}) translate({-cx},{-cy})" fill="none" stroke="{INK}" '
        f'stroke-linejoin="miter" stroke-miterlimit="10">'
        + stroke("p0", P0_LEN, p0) + stroke("p1", EDGE_LEN, edges) + stroke("p2", EDGE_LEN, edges)
        + f'<path d="{ridge_path.get("d")}" stroke-width="{ridge_path.get("stroke-width")}" '
          f'stroke-dasharray="{ridge_path.get("stroke-dasharray")}" opacity="{ridge:.3f}"/>'
        + f'<circle cx="{cx}" cy="{cy}" r="{r * crown:.3f}" fill="{INK}" stroke="none"/></g>'
    )
    weighted = "".join(
        f'<path d="{p.get("d")}" fill="{INK}" stroke="none"/>' if p.get("id") == "flourish"
        else f'<path d="{p.get("d")}" stroke-width="{p.get("stroke-width")}"/>'
        for p in SIG_PATHS)
    signature = (
        f'<g transform="translate({L["sx"]:.2f},{L["sy"]:.2f}) scale({L["ss"]:.4f})" fill="none" stroke="{INK}" '
        f'stroke-linecap="round" stroke-linejoin="round">'
        f'<path d="{PEN}" stroke-width="4" {dash(PEN_LEN, pen)} opacity="{(1 - settle) if pen else 0:.3f}"/>'
        f'<g opacity="{settle:.3f}">{weighted}</g></g>'
    )
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">'
            f'<rect width="{W}" height="{H}" fill="{BG}"/>{mark}{signature}</svg>')


def draw_domain(im, t, W, H, k):
    """Types ".com" on one character at a time, each fading in."""
    L = layout(W, H, k)
    font = ImageFont.truetype(str(FONT), round(DOMAIN_SIZE * L["ss"]))
    font.set_variation_by_axes([600])
    x0 = L["sx"] + DOMAIN_RIGHT * L["ss"] - font.getlength(DOMAIN)
    y = L["sy"] + DOMAIN_BASELINE * L["ss"]
    ink = tuple(int(INK[i:i + 2], 16) for i in (1, 3, 5))
    for i, ch in enumerate(DOMAIN):
        start = DOMAIN_START + i * DOMAIN_STEP
        a = ease(seg(t, start, start + DOMAIN_FADE))
        if not a:
            continue
        layer = Image.new("RGBA", im.size, (0, 0, 0, 0))
        ImageDraw.Draw(layer).text((x0 + font.getlength(DOMAIN[:i]), y), ch, font=font,
                                   fill=ink + (round(255 * a),), anchor="ls")
        im.alpha_composite(layer)


def render(t, W, H, k=1.0):
    png = cairosvg.svg2png(bytestring=frame_svg(t, W, H, k).encode())
    im = Image.open(BytesIO(png)).convert("RGBA")
    draw_domain(im, t, W, H, k)
    fade = 1 - ease(seg(t, DURATION - 0.65, DURATION - 0.1))   # out to black before ES
    return Image.blend(Image.new("RGB", im.size, "black"), im.convert("RGB"), fade)


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--out", type=Path, default=REPO / "splash" / "k36", help="output directory")
    args = ap.parse_args()
    out = args.out
    out.mkdir(parents=True, exist_ok=True)

    W, H = 640, 480
    enc = subprocess.Popen(
        [imageio_ffmpeg.get_ffmpeg_exe(), "-y", "-loglevel", "error",
         "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
         "-c:v", "libx264", "-profile:v", "main", "-preset", "slow", "-crf", "16",
         "-pix_fmt", "yuv420p", "-movflags", "+faststart", str(out / "logo.mp4")],
        stdin=subprocess.PIPE)
    for i in range(int(DURATION * FPS)):
        enc.stdin.write(render(i / FPS, W, H).tobytes())
    enc.stdin.close()
    if enc.wait():
        sys.exit("ffmpeg failed")
    settled = render(HOLD, W, H)
    settled.save(out / "logo.bmp")                      # settled lockup, 24-bit BMP
    settled.save(out / "preview.png")
    render(HOLD, 720, 720, k=1.25).save(out / "logo_kernel.bmp")
    print(f"wrote logo.mp4, logo.bmp, logo_kernel.bmp, preview.png to {out}")


if __name__ == "__main__":
    main()
