"""Draw the 9 print artworks as self-contained SVGs (all text converted to outlines)."""
import re, sys
from pathlib import Path
import uharfbuzz as hb
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

ROOT = Path(sys.argv[1])
FONTS, OUT = ROOT / "assets/fonts", ROOT / "assets/print"
OUT.mkdir(parents=True, exist_ok=True)

INK, YELLOW, BLUE, WHITE = "#111111", "#FFD60A", "#0D99FF", "#FFFFFF"
GREY, GREY_HI = "#D9D5C9", "#F0EDE4"


def n(v):
    return f"{v:.2f}".rstrip("0").rstrip(".")


class Font:
    def __init__(self, file, wght=None):
        self.face = hb.Face(hb.Blob.from_file_path(str(FONTS / file)))
        self.font = hb.Font(self.face)
        if wght:
            self.font.set_variations({"wght": wght})
        self.upm = self.face.upem

    def _shape(self, text, rtl, features):
        buf = hb.Buffer()
        buf.add_str(text)
        buf.direction = "rtl" if rtl else "ltr"
        buf.script = "Arab" if rtl else "Latn"
        buf.language = "ar" if rtl else "en"
        hb.shape(self.font, buf, features or {})
        return buf

    def width(self, text, size, rtl=False, features=None):
        buf = self._shape(text, rtl, features)
        return sum(p.x_advance for p in buf.glyph_positions) * size / self.upm

    def path(self, text, size, x, y, rtl=False, anchor="start", features=None):
        """Outline `text` with its baseline at y. anchor: start (left edge at x), middle, end (right edge at x)."""
        buf = self._shape(text, rtl, features)
        s = size / self.upm
        w = sum(p.x_advance for p in buf.glyph_positions) * s
        x0 = x - (w if anchor == "end" else w / 2 if anchor == "middle" else 0)
        pen = SVGPathPen({}, ntos=n)
        cx = 0
        for info, pos in zip(buf.glyph_infos, buf.glyph_positions):
            tp = TransformPen(pen, (s, 0, 0, -s, x0 + (cx + pos.x_offset) * s, y - pos.y_offset * s))
            self.font.draw_glyph_with_pen(info.codepoint, tp)
            cx += pos.x_advance
        return pen.getCommands()


MONO_M = Font("CascadiaCode-VF.ttf", 500)
MONO_B = Font("CascadiaCode-VF.ttf", 650)
SANS_M = Font("IBMPlexSansArabic-Medium.ttf")
SANS_B = Font("IBMPlexSansArabic-Bold.ttf")
NOLIG = {"calt": False, "liga": False}

mark_svg = (ROOT / "assets/brand/logo-mark.svg").read_text()
MARK_W, MARK_H = map(float, re.search(r'viewBox="0 0 ([\d.]+) ([\d.]+)"', mark_svg).groups())
MARK_BODY = "".join(re.findall(r"<(?:path|circle)[^>]*/>", mark_svg))


def mark(x, y, h, fill="currentColor"):
    s = h / MARK_H
    return f'<g transform="translate({n(x)} {n(y)}) scale({n(s)})" fill="{fill}">{MARK_BODY}</g>', MARK_W * s


def svg(name, w, h, body, label, color=INK):
    out = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {n(w)} {n(h)}" role="img" '
           f'aria-label="{label}" style="color:{color}">\n<title>{label}</title>\n{body}\n</svg>\n')
    (OUT / f"{name}.svg").write_text(out)
    print(f"{name}.svg  {n(w)}x{n(h)}  {len(out)} bytes")


# ---------- 1. Hoodie: logo selected in a design tool ----------
def hoodie():
    W, pad, box = 360, 30, 300
    bx, by = pad, pad
    mh = 214
    g, mw = mark(0, 0, mh)
    g, _ = mark(bx + (box - mw) / 2, by + (box - mh) / 2, mh)
    hs = 13
    handles = "".join(
        f'<rect x="{n(cx - hs / 2)}" y="{n(cy - hs / 2)}" width="{hs}" height="{hs}" fill="{WHITE}" '
        f'stroke="var(--sel,{BLUE})" stroke-width="2.5"/>'
        for cx in (bx, bx + box) for cy in (by, by + box))
    label = "Y · 120 × 120"
    fs = 17
    lw = SANS_M.width(label, fs) + 20
    ly = by + box + 14
    pill = (f'<rect x="{n(bx + box / 2 - lw / 2)}" y="{n(ly)}" width="{n(lw)}" height="28" rx="5" fill="var(--sel,{BLUE})"/>'
            f'<path fill="{WHITE}" d="{SANS_M.path(label, fs, bx + box / 2, ly + 20, anchor="middle")}"/>')
    body = (g + f'<rect x="{bx}" y="{by}" width="{box}" height="{box}" fill="none" stroke="var(--sel,{BLUE})" '
            f'stroke-width="2.5"/>' + handles + pill)
    svg("print-hoodie-selection", W, ly + 28 + pad, body, "Yehia Tech logo selected in a design tool, Y · 120 × 120")


# ---------- 2. T-shirt: git diff in Arabic ----------
def tee():
    fs = 60
    cell = MONO_B.width("0", fs)
    pad, cells = 24, 17
    W = pad * 2 + cells * cell
    right = W - pad
    lh = 92
    y1, y2 = pad + 62, pad + 62 + lh
    red, green = "var(--del,#CF222E)", "var(--add,#1A7F37)"
    l1 = (MONO_B.path("-", fs, pad, y1, features=NOLIG)
          + MONO_B.path("أنا بكتب كود", fs, right, y1, rtl=True, anchor="end"))
    ar2 = "أنا بسوق الـ"
    wa = MONO_B.width(ar2, fs, rtl=True)
    l2 = (MONO_B.path("+", fs, pad, y2, features=NOLIG)
          + MONO_B.path(ar2, fs, right, y2, rtl=True, anchor="end")
          + MONO_B.path("AI", fs, right - wa - cell, y2, anchor="end", features=NOLIG))
    body = f'<path fill="{red}" d="{l1}"/>\n<path fill="{green}" d="{l2}"/>'
    svg("print-tee-diff", W, y2 + pad + 14, body, "git diff: - أنا بكتب كود / + أنا بسوق الـ AI")


# ---------- 3. Mug: context window progress bar ----------
def mug():
    W, pad = 1100, 20
    fs = 34
    label = MONO_M.path("context window", fs, pad, pad + 30, features=NOLIG)
    by, bh = pad + 52, 22
    bw = W - 2 * pad
    fill = 0.78
    body = (f'<path fill="currentColor" d="{label}"/>'
            f'<rect x="{pad}" y="{by}" width="{bw}" height="{bh}" rx="{bh / 2}" fill="none" stroke="currentColor" stroke-width="3"/>'
            f'<rect x="{pad + 6}" y="{by + 6}" width="{n((bw - 12) * fill)}" height="{bh - 12}" rx="{(bh - 12) / 2}" fill="currentColor"/>')
    svg("print-mug-context", W, by + bh + pad, body, "context window progress bar")


# ---------- 4. Stickers ----------
SH = 9  # hard shadow offset


def card(x, y, w, h, rx, fill=WHITE, sw=6):
    return (f'<rect x="{x + SH}" y="{y + SH}" width="{w}" height="{h}" rx="{rx}" fill="{INK}"/>'
            f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" fill="{fill}" stroke="{INK}" stroke-width="{sw}"/>')


CMD = ("M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6"
       "a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z")


def keycap(name, legend, arabic, w=280, fill=WHITE, cmd=False):
    pad, h = 12, 280
    x, y = pad, pad
    body = card(x, y, w, h, 40, fill)
    body += (f'<rect x="{x + 22}" y="{y + 16}" width="{w - 44}" height="{h - 50}" rx="24" fill="none" '
             f'stroke="{INK}" stroke-width="3" opacity=".28"/>')
    lx, ly, fs = x + 44, y + 84, 46
    if cmd:
        k = 40 / 24
        body += (f'<path transform="translate({lx} {ly - 37}) scale({n(k)})" d="{CMD}" fill="none" stroke="{INK}" '
                 f'stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"/>')
        lx += 48
    body += f'<path fill="{INK}" d="{MONO_B.path(legend, fs, lx, ly, features=NOLIG)}"/>'
    body += f'<path fill="{INK}" d="{SANS_B.path(arabic, 62, x + w - 44, y + h - 62, rtl=True, anchor="end")}"/>'
    svg(name, w + 2 * pad + SH, h + 2 * pad + SH, body, f"{legend} = {arabic}")


def typing():
    pad, w, h = 12, 380, 250
    x, y = pad, pad
    body = card(x, y, w, h, 36)
    bx, by, bw, bh = x + w - 34 - 170, y + 34, 170, 92
    body += f'<rect x="{bx}" y="{by}" width="{bw}" height="{bh}" rx="46" fill="{INK}"/>'
    body += f'<path d="M{bx + bw - 30} {by + bh - 14} q 22 14 34 26 q -30 2 -54 -12z" fill="{INK}"/>'
    for i, op in enumerate((1, .6, .3)):
        body += f'<circle cx="{bx + bw - 45 - i * 40}" cy="{by + bh / 2}" r="11" fill="{YELLOW}" opacity="{op}"/>'
    body += f'<path fill="{INK}" d="{SANS_M.path("يحيى بيكتب…", 40, x + w - 38, y + h - 44, rtl=True, anchor="end", features={"rlig": False})}"/>'
    svg("sticker-typing", w + 2 * pad + SH, h + 2 * pad + SH, body, "يحيى بيكتب…")


def skeleton():
    pad, w, h = 12, 300, 340
    x, y = pad, pad
    mh = 170
    _, mw = mark(0, 0, mh)
    g, _ = mark(x + (w - mw) / 2, y + 36, mh, "url(#sk)")
    defs = (f'<defs><linearGradient id="sk" gradientUnits="userSpaceOnUse" x1="{x}" y1="{y}" x2="{x + w}" y2="{y + h * .6}">'
            f'<stop offset="0" stop-color="{GREY}"/><stop offset=".42" stop-color="{GREY}"/>'
            f'<stop offset=".52" stop-color="{GREY_HI}"/><stop offset=".62" stop-color="{GREY}"/>'
            f'<stop offset="1" stop-color="{GREY}"/></linearGradient></defs>')
    bars = (f'<rect x="{x + 50}" y="{y + 240}" width="{w - 100}" height="22" rx="11" fill="url(#sk)"/>'
            f'<rect x="{x + 90}" y="{y + 278}" width="{w - 180}" height="22" rx="11" fill="url(#sk)"/>')
    svg("sticker-skeleton", w + 2 * pad + SH, h + 2 * pad + SH, defs + card(x, y, w, h, 36) + g + bars,
        "Yehia Tech logo as a skeleton loader")


def aaa():
    pad, w, h = 12, 300, 340
    x, y = pad, pad
    mh = 180
    _, mw = mark(0, 0, mh)
    g, _ = mark(x + (w - mw) / 2, y + 34, mh, INK)
    label, fs = "AAA contrast", 22
    lw = MONO_B.width(label, fs, features=NOLIG)
    pw, ph = lw + 66, 46
    px, py = x + (w - pw) / 2, y + h - ph - 30
    badge = (f'<rect x="{n(px)}" y="{n(py)}" width="{n(pw)}" height="{ph}" rx="{ph / 2}" fill="{INK}"/>'
             f'<circle cx="{n(px + 25)}" cy="{n(py + ph / 2)}" r="13" fill="{YELLOW}"/>'
             f'<path d="M{n(px + 18.5)} {n(py + ph / 2 + .5)}l4.5 4.5 8.5-9" fill="none" stroke="{INK}" stroke-width="3" '
             f'stroke-linecap="round" stroke-linejoin="round"/>'
             f'<path fill="{YELLOW}" d="{MONO_B.path(label, fs, px + 48, py + ph / 2 + 8, features=NOLIG)}"/>')
    svg("sticker-aaa", w + 2 * pad + SH, h + 2 * pad + SH, card(x, y, w, h, 36, YELLOW) + g + badge,
        "Yehia Tech logo with an AAA contrast badge")


hoodie(); tee(); mug()
keycap("sticker-key-cmdz", "Z", "ارجع", cmd=True)
keycap("sticker-key-esc", "Esc", "اهرب")
keycap("sticker-key-enter", "Enter", "يلا", w=400, fill=YELLOW)
typing(); skeleton(); aaa()
