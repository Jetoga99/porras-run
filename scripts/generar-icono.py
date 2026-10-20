"""Ícono de PorraRun: corneta de fiesta de la que salen corredores.

Uso: python scripts/generar-icono.py apps/mobile/assets/images [v1|v2|v3]
Requiere: pip install cairosvg pillow
La variante elegida es v3 (azul eléctrico); v1 y v2 quedan como alternativas."""
import math
import sys
import cairosvg

# Poses: listas de trazos en coordenadas locales (pie de apoyo cerca de y=0, cabeza arriba)
POSES = {
    "run": {
        "head": (11, -93),
        "lines": ["M6,-72 L-4,-40", "M4,-66 L22,-56 L35,-70", "M4,-66 L-14,-58 L-25,-42",
                  "M-4,-40 L18,-26 L12,-2", "M-4,-40 L-14,-18 L-37,-22"],
    },
    # salto de celebración: brazos arriba en V, piernas abiertas
    "leap": {
        "head": (2, -106),
        "lines": ["M2,-84 L-4,-46", "M1,-78 L-20,-90 L-36,-108", "M1,-78 L22,-90 L38,-108",
                  "M-4,-46 L18,-34 L40,-28", "M-4,-46 L-20,-30 L-42,-38"],
    },
}


def figure(x, y, s, rot, color, pose="run", sw=14):
    p = POSES[pose]
    hx, hy = p["head"]
    head = f'<circle cx="{hx}" cy="{hy}" r="15" fill="{color}"/>'
    paths = "".join(
        f'<path d="{d}" fill="none" stroke="{color}" stroke-width="{sw}" '
        f'stroke-linecap="round" stroke-linejoin="round"/>' for d in p["lines"])
    return f'<g transform="translate({x},{y}) rotate({rot}) scale({s}) translate(0,52)">{head}{paths}</g>'


def wavy(x0, y0, x1, y1, amp, waves, color, w, n=50):
    dx, dy = x1 - x0, y1 - y0
    L = math.hypot(dx, dy)
    nx, ny = -dy / L, dx / L
    pts = []
    for i in range(n + 1):
        t = i / n
        o = amp * math.sin(t * waves * 2 * math.pi)
        pts.append(f"{x0 + dx * t + nx * o:.1f},{y0 + dy * t + ny * o:.1f}")
    return (f'<path d="M{" ".join(pts)}" fill="none" stroke="{color}" stroke-width="{w}" '
            f'stroke-linecap="round"/>')


def cone(ax, ay, bx, by, cx, cy, fill, rim, deco, style):
    out = (f'<polygon points="{ax},{ay} {bx},{by} {cx},{cy}" fill="{fill}" stroke="{fill}" '
           f'stroke-width="30" stroke-linejoin="round"/>')
    clip_id = f"clip{style}"
    out += (f'<clipPath id="{clip_id}"><polygon points="{ax},{ay} {bx},{by} {cx},{cy}"/></clipPath>'
            f'<g clip-path="url(#{clip_id})">')
    if style == "stripes":
        # bandas paralelas a la boca, como corneta de fiesta
        for k in (0.30, 0.55, 0.78):
            p1 = (ax + (bx - ax) * k, ay + (by - ay) * k)
            p2 = (ax + (cx - ax) * k, ay + (cy - ay) * k)
            out += (f'<line x1="{p1[0]:.0f}" y1="{p1[1]:.0f}" x2="{p2[0]:.0f}" y2="{p2[1]:.0f}" '
                    f'stroke="{deco}" stroke-width="40"/>')
    elif style == "zigzag":
        for k in (0.42, 0.72):
            p1 = (ax + (bx - ax) * k, ay + (by - ay) * k)
            p2 = (ax + (cx - ax) * k, ay + (cy - ay) * k)
            n = 6
            pts = []
            for i in range(n + 1):
                t = i / n
                px, py = p1[0] + (p2[0] - p1[0]) * t, p1[1] + (p2[1] - p1[1]) * t
                # desplazamiento hacia el vértice en los picos
                off = 22 if i % 2 else -22
                vx, vy = ax - px, ay - py
                vl = math.hypot(vx, vy)
                pts.append(f"{px + vx / vl * off:.0f},{py + vy / vl * off:.0f}")
            out += (f'<polyline points="{" ".join(pts)}" fill="none" stroke="{deco}" stroke-width="22" '
                    f'stroke-linejoin="round"/>')
    else:  # dots
        for k, j in ((0.35, 0.5), (0.6, 0.3), (0.6, 0.72), (0.82, 0.5), (0.85, 0.15), (0.85, 0.85)):
            p1 = (ax + (bx - ax) * k, ay + (by - ay) * k)
            p2 = (ax + (cx - ax) * k, ay + (cy - ay) * k)
            out += (f'<circle cx="{p1[0] + (p2[0] - p1[0]) * j:.0f}" cy="{p1[1] + (p2[1] - p1[1]) * j:.0f}" '
                    f'r="24" fill="{deco}"/>')
    out += "</g>"
    out += (f'<line x1="{bx}" y1="{by}" x2="{cx}" y2="{cy}" stroke="{rim}" stroke-width="36" '
            f'stroke-linecap="round"/>')
    return out


def confetti(items):
    out = ""
    for kind, x, y, size, rot, c in items:
        if kind == "o":
            out += f'<circle cx="{x}" cy="{y}" r="{size}" fill="{c}"/>'
        elif kind == "r":
            out += (f'<rect x="{x - size}" y="{y - size / 2.2}" width="{size * 2}" height="{size / 1.1}" '
                    f'rx="4" fill="{c}" transform="rotate({rot} {x} {y})"/>')
        else:  # estrella de 4 puntas
            s = size
            out += (f'<path d="M{x},{y - s} Q{x},{y} {x + s},{y} Q{x},{y} {x},{y + s} '
                    f'Q{x},{y} {x - s},{y} Q{x},{y} {x},{y - s}Z" fill="{c}"/>')
    return out


GEOM = dict(ax=175, ay=865, bx=285, by=470, cx=575, cy=755)
MOUTH = ((285 + 575) / 2, (470 + 755) / 2)


def fan(specs, colors, poses, sw=14):
    mx, my = MOUTH
    out = ""
    for (ang, dist, s), c, p in zip(specs, colors, poses):
        t = math.radians(ang)
        out += figure(round(mx + dist * math.cos(t)), round(my + dist * math.sin(t)), s, 10, c, p, sw)
    return out


FAN = [(-78, 345, 1.8), (-38, 360, 2.2), (0, 345, 1.8)]


# ---------- V1: fondo crema, corneta morada a rayas ----------
def v1(bg=True):
    out = '<rect width="1024" height="1024" fill="#FFF4E6"/>' if bg else ""
    out += confetti([("o", 330, 250, 18, 0, "#FF5D73"), ("r", 610, 135, 18, 30, "#22B8CF"),
                     ("s", 880, 210, 26, 0, "#FFB703"), ("r", 905, 420, 16, -40, "#FF5D73"),
                     ("o", 880, 760, 15, 0, "#22B8CF"), ("s", 700, 880, 22, 0, "#FF5D73"),
                     ("r", 230, 380, 16, 60, "#FFB703"), ("o", 640, 600, 11, 0, "#7B2CBF")])
    out += wavy(500, 560, 600, 500, 12, 1.2, "#FFB703", 18)
    out += wavy(560, 690, 690, 700, 14, 1.3, "#22B8CF", 18)
    out += wavy(440, 470, 400, 330, 12, 1.2, "#FF5D73", 16)
    out += cone(**GEOM, fill="#7B2CBF", rim="#5A189A", deco="#C77DFF", style="stripes")
    out += fan(FAN, ["#FF5D73", "#22B8CF", "#FFB703"], ["run", "leap", "run"])
    return out


# ---------- V2: degradado morado-rosa, corneta amarilla en zigzag ----------
def v2(bg=True):
    out = ('<defs><linearGradient id="g2" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5B2EE0"/>'
           '<stop offset="1" stop-color="#FF4D8D"/></linearGradient></defs>'
           '<rect width="1024" height="1024" fill="url(#g2)"/>') if bg else ""
    out += confetti([("s", 330, 240, 24, 0, "#FFD60A"), ("r", 610, 135, 18, 30, "#7CF3E0"),
                     ("o", 880, 210, 16, 0, "#FFFFFF"), ("r", 905, 430, 16, -40, "#FFD60A"),
                     ("s", 875, 770, 22, 0, "#7CF3E0"), ("o", 700, 880, 13, 0, "#FFD60A"),
                     ("r", 230, 380, 16, 60, "#FFFFFF"), ("o", 640, 600, 11, 0, "#7CF3E0")])
    out += wavy(500, 560, 600, 500, 12, 1.2, "#7CF3E0", 18)
    out += wavy(560, 690, 690, 700, 14, 1.3, "#FFD60A", 18)
    out += cone(**GEOM, fill="#FFD60A", rim="#F2A900", deco="#FF7A00", style="zigzag")
    out += fan(FAN, ["#FFFFFF", "#FFFFFF", "#FFFFFF"], ["run", "leap", "run"])
    return out


# ---------- V3: fondo azul eléctrico, corneta coral con lunares, corredores de colores ----------
def v3(bg=True):
    out = ('<defs><radialGradient id="g3" cx="0.65" cy="0.35" r="0.85"><stop offset="0" stop-color="#3A86FF"/>'
           '<stop offset="1" stop-color="#1D3FA8"/></radialGradient></defs>'
           '<rect width="1024" height="1024" fill="url(#g3)"/>') if bg else ""
    out += confetti([("r", 330, 250, 18, 25, "#FFBE0B"), ("s", 610, 140, 22, 0, "#FFFFFF"),
                     ("o", 880, 210, 17, 0, "#FF5D8F"), ("r", 905, 430, 16, -40, "#FFFFFF"),
                     ("o", 880, 760, 15, 0, "#FFBE0B"), ("r", 700, 880, 16, 20, "#FF5D8F"),
                     ("s", 230, 380, 20, 0, "#FFBE0B"), ("o", 640, 600, 11, 0, "#FFFFFF")])
    out += wavy(500, 560, 600, 500, 12, 1.2, "#FFBE0B", 18)
    out += wavy(560, 690, 690, 700, 14, 1.3, "#FFFFFF", 18)
    out += wavy(440, 470, 400, 330, 12, 1.2, "#FF5D8F", 16)
    out += cone(**GEOM, fill="#FF6B4A", rim="#E04A2B", deco="#FFD3C9", style="dots")
    out += fan(FAN, ["#FFBE0B", "#FFFFFF", "#FF8FB1"], ["leap", "run", "run"])
    return out


VARIANTS = {"v1": v1, "v2": v2, "v3": v3}


def svg(name, size=1024, background=True, scale=1.0):
    body = VARIANTS[name](background)
    t = f"translate({512 - 512 * scale},{512 - 512 * scale}) scale({scale})"
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{size}" height="{size}" viewBox="0 0 1024 1024">'
            f'<g transform="{t}">{body}</g></svg>')


def render(name, path, size=1024, **kw):
    cairosvg.svg2png(bytestring=svg(name, size=size, **kw).encode(), write_to=path,
                     output_width=size, output_height=size)


def background_only(name, path):
    """Solo el fondo (para la capa de fondo del ícono adaptativo de Android)."""
    full = VARIANTS[name](True)
    r = full.index('<rect width="1024" height="1024"')
    bg = full[: full.index("/>", r) + 2]
    cairosvg.svg2png(bytestring=(f'<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" '
                                 f'viewBox="0 0 1024 1024">{bg}</svg>').encode(), write_to=path,
                     output_width=1024, output_height=1024)


def monochrome(src, path):
    """Silueta negra sobre transparente (íconos temáticos de Android 13+)."""
    from PIL import Image
    im = Image.open(src).convert("RGBA")
    black = Image.new("RGBA", im.size, (0, 0, 0, 255))
    black.putalpha(im.getchannel("A"))
    black.save(path)


if __name__ == "__main__":
    out = sys.argv[1] if len(sys.argv) > 1 else "."
    name = sys.argv[2] if len(sys.argv) > 2 else "v3"
    render(name, f"{out}/icon.png")
    render(name, f"{out}/android-icon-foreground.png", background=False, scale=0.62)
    background_only(name, f"{out}/android-icon-background.png")
    monochrome(f"{out}/android-icon-foreground.png", f"{out}/android-icon-monochrome.png")
    render(name, f"{out}/splash-icon.png", background=False)
    render(name, f"{out}/favicon.png", size=48)
