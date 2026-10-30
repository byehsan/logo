#!/bin/sh
# Puts the byEhsan "Powered" capsule in the top-right of the nes-box system view.
# Runs before EmulationStation on every boot (byehsan-powered.service) and only changes
# something when the theme lacks it, so a theme update just gets it re-added.
T=/roms/themes/es-theme-nes-box
SRC=/opt/byehsan
[ -f "$T/theme.xml" ] || exit 0

cmp -s "$SRC/byehsan-powered.svg" "$T/_inc/images/byehsan-powered.svg" \
  || cp "$SRC/byehsan-powered.svg" "$T/_inc/images/byehsan-powered.svg"

grep -q byehsan_powered "$T/theme.xml" && exit 0
[ -f "$T/theme.xml.orig" ] || cp "$T/theme.xml" "$T/theme.xml.orig"
sed '/<\/theme>/,$d' "$T/theme.xml" > "$T/theme.xml.tmp"
grep -q "<theme>" "$T/theme.xml.tmp" || { rm -f "$T/theme.xml.tmp"; exit 1; }
cat "$SRC/theme-block.xml" >> "$T/theme.xml.tmp"
echo "</theme>" >> "$T/theme.xml.tmp"
mv "$T/theme.xml.tmp" "$T/theme.xml"
sync
