#!/usr/bin/env python3
import argparse
import math
import os
import random
import re
from io import BytesIO
from xml.etree import ElementTree as ET

import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageChops
import cairosvg

W, H = 800, 480


def parse_hex_color(s: str):
    s = s.strip()
    if not re.fullmatch(r"#([0-9a-fA-F]{6})", s):
        raise ValueError("Color must be #RRGGBB, e.g. #B8C7D9")
    return (int(s[1:3], 16), int(s[3:5], 16), int(s[5:7], 16))


def clamp8(x): return max(0, min(255, int(x)))


def mix(a, b, t):
    return (clamp8(a[0] + (b[0] - a[0]) * t),
            clamp8(a[1] + (b[1] - a[1]) * t),
            clamp8(a[2] + (b[2] - a[2]) * t))


def load_font(size: int, font_path: str | None):
    candidates = []
    if font_path:
        candidates.append(font_path)
    candidates += [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSansCondensed.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
    ]
    for p in candidates:
        try:
            return ImageFont.truetype(p, size=size)
        except Exception:
            pass
    return ImageFont.load_default()


def fit_text(draw: ImageDraw.ImageDraw, text: str, max_width: int, base_size: int, font_path: str | None):
    size = base_size
    while size >= 10:
        font = load_font(size, font_path)
        bbox = draw.textbbox((0, 0), text, font=font)
        w = bbox[2] - bbox[0]
        if w <= max_width:
            return font
        size -= 1
    return load_font(10, font_path)


def recolor_svg(svg_path: str, rgb):
    """Rewrite fill/stroke in SVG to the given color, return bytes."""
    color = "#{:02x}{:02x}{:02x}".format(*rgb)
    data = open(svg_path, "rb").read()

    try:
        root = ET.fromstring(data)

        def walk(el):
            for attr in ("fill", "stroke"):
                v = el.get(attr)
                if v and v.lower() not in ("none", "transparent"):
                    el.set(attr, color)

            style = el.get("style")
            if style:
                def replace_prop(prop, s):
                    pat = re.compile(rf"({prop}\s*:\s*)([^;]+)", re.IGNORECASE)
                    def _r(m):
                        v = m.group(2).strip()
                        if v.lower() in ("none", "transparent"):
                            return m.group(0)
                        return m.group(1) + color
                    return pat.sub(_r, s)
                style = replace_prop("fill", style)
                style = replace_prop("stroke", style)
                el.set("style", style)

            for c in list(el):
                walk(c)

        walk(root)
        return ET.tostring(root, encoding="utf-8", xml_declaration=True)

    except Exception:
        txt = data.decode("utf-8", errors="ignore")
        txt = re.sub(r'fill="(?!none|transparent)[^"]+"', f'fill="{color}"', txt, flags=re.IGNORECASE)
        txt = re.sub(r'stroke="(?!none|transparent)[^"]+"', f'stroke="{color}"', txt, flags=re.IGNORECASE)
        txt = re.sub(r'(fill\s*:\s*)(?!none|transparent)[^;"]+', rf"\1{color}", txt, flags=re.IGNORECASE)
        txt = re.sub(r'(stroke\s*:\s*)(?!none|transparent)[^;"]+', rf"\1{color}", txt, flags=re.IGNORECASE)
        return txt.encode("utf-8")


def render_svg(svg_bytes: bytes, out_w: int, out_h: int):
    png_bytes = cairosvg.svg2png(bytestring=svg_bytes, output_width=out_w, output_height=out_h)
    return Image.open(BytesIO(png_bytes)).convert("RGBA")


def gradient_background(seed: int):
    """Dark futuristic base with lighting gradient + subtle color tint."""
    rng = random.Random(seed)
    top = (6, 8, 10)
    bottom = (0, 0, 0)
    tint = (8, 16, 22)

    arr = np.zeros((H, W, 3), dtype=np.uint8)
    for y in range(H):
        t = y / max(1, H - 1)
        base = mix(top, bottom, t)
        # slight cyan tint that grows towards center-right
        k = 0.18 * (1.0 - abs((y / H) - 0.55))
        base = mix(base, tint, k)
        arr[y, :, :] = base

    img = Image.fromarray(arr, mode="RGB").convert("RGBA")

    # Add a soft spotlight ellipse (like a sci-fi panel glow)
    glow = Image.new("L", (W, H), 0)
    gd = ImageDraw.Draw(glow)
    cx = int(W * 0.65)
    cy = int(H * 0.42)
    for r in range(420, 0, -8):
        a = int(120 * (1 - r / 420))
        gd.ellipse([cx - r, cy - r, cx + r, cy + r], outline=a, width=10)
    glow = glow.filter(ImageFilter.GaussianBlur(18))
    img = Image.composite(Image.new("RGBA", (W, H), (20, 35, 45, 255)), img, glow)

    # Add subtle vignette
    vig = Image.new("L", (W, H), 0)
    vd = ImageDraw.Draw(vig)
    cx, cy = W / 2, H / 2
    maxr = math.hypot(cx, cy)
    for r in range(int(maxr), 0, -10):
        a = int(160 * (1 - r / maxr))
        vd.ellipse([cx - r, cy - r, cx + r, cy + r], outline=a, width=16)
    vig = vig.filter(ImageFilter.GaussianBlur(22))
    img = Image.composite(Image.new("RGBA", (W, H), (0, 0, 0, 255)), img, vig)

    return img


def add_futuristic_pattern(base: Image.Image, seed: int, accent_rgb):
    """Minimal tech pattern: grid, diagonal lines, HUD rectangles, and neon accents."""
    rng = random.Random(seed)
    img = base.copy()
    d = ImageDraw.Draw(img)

    grid_a = (14, 18, 22, 140)
    grid_b = (10, 12, 15, 120)

    spacing = 28
    for x in range(0, W + 1, spacing):
        d.line([(x, 0), (x, H)], fill=grid_b, width=1)
    for y in range(0, H + 1, spacing):
        d.line([(0, y), (W, y)], fill=grid_b, width=1)

    for i in range(-H, W, spacing * 2):
        d.line([(i, 0), (i + H, H)], fill=grid_a, width=1)

    # HUD rectangles (thin) + occasional accent corners
    for _ in range(21):
        x1 = rng.randint(20, W - 220)
        y1 = rng.randint(20, H - 80)
        w = rng.randint(80, 240)
        h = rng.randint(24, 90)
        x2, y2 = x1 + w, y1 + h
        d.rectangle([x1, y1, x2, y2], outline=(24, 32, 40, 160), width=1)

        if rng.random() < 0.35:
            # small accent segment in text color
            ax1 = x1 + rng.randint(0, max(1, w - 50))
            ax2 = min(x2, ax1 + rng.randint(30, 70))
            d.line([(ax1, y1), (ax2, y1)], fill=(accent_rgb[0], accent_rgb[1], accent_rgb[2], 120), width=2)

    # Big angled accent line (very subtle)
   #  d.line([(int(W * 0.52), 0), (W, int(H * 0.62))], fill=(accent_rgb[0], accent_rgb[1], accent_rgb[2], 65), width=2)

    return img


def add_scanlines_and_noise(img: Image.Image, seed: int, scan_strength=0.10, noise_strength=0.06):
    rng = np.random.default_rng(seed)
    out = img.copy().convert("RGBA")

    # Scanlines (darken every other row slightly)
    if scan_strength > 0:
        sl = np.zeros((H, W), dtype=np.uint8)
        for y in range(H):
            if y % 2 == 0:
                sl[y, :] = int(255 * scan_strength)
        sl_img = Image.fromarray(sl, mode="L")
        out = Image.composite(Image.new("RGBA", (W, H), (0, 0, 0, 255)), out, sl_img)

    # Noise
    if noise_strength > 0:
        n = (rng.random((H, W)) * 255).astype(np.uint8)
        n_img = Image.fromarray(n, mode="L")
        n_img = n_img.filter(ImageFilter.GaussianBlur(0.6))
        # use noise as a very faint lighten/darken
        overlay = Image.new("RGBA", (W, H), (255, 255, 255, 0))
        overlay.putalpha((n_img.point(lambda p: int((p - 128) * noise_strength + 128))).convert("L"))
        out = ImageChops.soft_light(out, overlay)

    return out


def glow_layer(src_rgba: Image.Image, blur=10, alpha=140):
    a = src_rgba.split()[-1]
    glow = Image.new("RGBA", src_rgba.size, (255, 255, 255, 0))
    glow.putalpha(a)
    glow = glow.filter(ImageFilter.GaussianBlur(blur))
    # scale alpha
    r, g, b, ga = glow.split()
    ga = ga.point(lambda p: int(p * (alpha / 255.0)))
    glow = Image.merge("RGBA", (r, g, b, ga))
    return glow


def metallic_text(draw: ImageDraw.ImageDraw, pos, text, font, base_rgb):
    """Fake a 'metal' look by vertical highlights + glow + crisp top layer."""
    x, y = pos

    # Make text mask
    tmp = Image.new("L", (W, H), 0)
    td = ImageDraw.Draw(tmp)
    td.text((x, y), text, font=font, fill=255)

    # Create vertical gradient inside text mask
    grad = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    garr = np.zeros((H, W, 4), dtype=np.uint8)
    for yy in range(H):
        t = yy / max(1, H - 1)
        # highlight band near top
        h1 = math.exp(-((t - 0.38) ** 2) / (2 * 0.004))
        h2 = math.exp(-((t - 0.52) ** 2) / (2 * 0.010))
        k = 0.25 + 0.55 * h1 + 0.25 * h2
        col = mix((base_rgb[0]//2, base_rgb[1]//2, base_rgb[2]//2), base_rgb, min(1.0, k))
        garr[yy, :, 0] = col[0]
        garr[yy, :, 1] = col[1]
        garr[yy, :, 2] = col[2]
        garr[yy, :, 3] = 255
    grad = Image.fromarray(garr, mode="RGBA")

    # Apply gradient only where text is
    mask = tmp
    metal = Image.composite(grad, Image.new("RGBA", (W, H), (0, 0, 0, 0)), mask)

    # Outer glow
    glow = Image.new("RGBA", (W, H), (base_rgb[0], base_rgb[1], base_rgb[2], 0))
    glow.putalpha(mask)
    glow = glow.filter(ImageFilter.GaussianBlur(8))
    # reduce glow alpha
    r, g, b, a = glow.split()
    a = a.point(lambda p: int(p * 0.45))
    glow = Image.merge("RGBA", (r, g, b, a))

    # Crisp stroke-ish shadow
    shadow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow)
    for dx, dy in [(-2, 0), (2, 0), (0, -2), (0, 2)]:
        sd.text((x + dx, y + dy), text, font=font, fill=(0, 0, 0, 120))
    shadow = shadow.filter(ImageFilter.GaussianBlur(1.5))

    return shadow, glow, metal


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--svg", default="logo.svg")
    ap.add_argument("--title", default="CM3588+")
    ap.add_argument("--subtitle", default="ByEhsan.com")
    ap.add_argument("--color", default="#B8C7D9")
    ap.add_argument("--seed", type=int, default=1337)
    ap.add_argument("--font", default=None)
    ap.add_argument("--out-bmp", default="logo_kernel.bmp")
    ap.add_argument("--out-png", default="bootsplash_preview.png")

    # knobs
    ap.add_argument("--logo-w", type=int, default=240)
    ap.add_argument("--logo-h", type=int, default=240)
    ap.add_argument("--pattern", type=float, default=1.0, help="0..1 pattern visibility")
    ap.add_argument("--scan", type=float, default=0.20, help="0..0.2 scanlines strength")
    ap.add_argument("--noise", type=float, default=0.2, help="0..0.2 noise strength")
    args = ap.parse_args()

    accent = parse_hex_color(args.color)

    # Background stack
    bg = gradient_background(args.seed)
    bg = add_futuristic_pattern(bg, args.seed + 14, accent)
    bg = add_scanlines_and_noise(bg, args.seed + 28, scan_strength=args.scan, noise_strength=args.noise)
    canvas = bg.copy().convert("RGBA")

    # Layout
    padding_x = 54
    center_y = H // 2

    # SVG recolor + render
    svg_bytes = recolor_svg(args.svg, accent)
    logo = render_svg(svg_bytes, args.logo_w, args.logo_h)

    # Extra glow under logo
    logo_glow = glow_layer(logo, blur=14, alpha=160)
    logo_x = padding_x
    logo_y = center_y - args.logo_h // 2 - 10
    canvas.alpha_composite(logo_glow, (logo_x, logo_y))
    canvas.alpha_composite(logo, (logo_x, logo_y))

    # Text area
    text_x = logo_x + args.logo_w + 36
    text_max_w = W - text_x - padding_x

    draw = ImageDraw.Draw(canvas)
    title_font = fit_text(draw, args.title, text_max_w, base_size=72, font_path=args.font)
    sub_font = fit_text(draw, args.subtitle, text_max_w, base_size=36, font_path=args.font)

    tb = draw.textbbox((0, 0), args.title, font=title_font)
    sb = draw.textbbox((0, 0), args.subtitle, font=sub_font)
    title_h = tb[3] - tb[1]
    sub_h = sb[3] - sb[1]
    gap = 28
    block_h = title_h + gap + sub_h
    top_y = center_y - block_h // 2
    title_y = top_y
    sub_y = title_y + title_h + gap

    # Metallic text (shadow + glow + metal fill)
    shadow1, glow1, metal1 = metallic_text(draw, (text_x, title_y), args.title, title_font, accent)
    shadow2, glow2, metal2 = metallic_text(draw, (text_x + gap, sub_y), args.subtitle, sub_font, accent)

    canvas = Image.alpha_composite(canvas, shadow1)
    canvas = Image.alpha_composite(canvas, glow1)
    canvas = Image.alpha_composite(canvas, metal1)

    canvas = Image.alpha_composite(canvas, shadow2)
    canvas = Image.alpha_composite(canvas, glow2)
    canvas = Image.alpha_composite(canvas, metal2)

    # Thin accent divider line (neon)
    d2 = ImageDraw.Draw(canvas)
    line_y = sub_y - 8
    line_end = min(text_x + text_max_w, text_x + 460)
   #  d2.line([(text_x, line_y), (line_end, line_y)], fill=(accent[0], accent[1], accent[2], 160), width=2)
    # faint echo line
    d2.line([(text_x, line_y + 4), (line_end - 40, line_y + 4)], fill=(accent[0], accent[1], accent[2], 70), width=1)

    # Export
    preview = canvas.convert("RGB")
    preview.save(args.out_png, "PNG")
    preview.save(args.out_bmp, "BMP")  # 24-bit RGB BMP

    print("Written:")
    print(" ", os.path.abspath(args.out_bmp))
    print(" ", os.path.abspath(args.out_png))


if __name__ == "__main__":
    main()
