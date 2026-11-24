"""Rebuild logo.png as clean geometry: fitted straight edges, true circles, smooth C.
Outputs logo-full.svg and logo-mark.svg with fill=currentColor, coordinates in source pixels."""
import json, math, subprocess, sys
from pathlib import Path
import numpy as np
from PIL import Image

src, out_dir, work = Path(sys.argv[1]), Path(sys.argv[2]), Path(sys.argv[3])
out_dir.mkdir(parents=True, exist_ok=True)
SCALE = 8

im = Image.open(src).convert("RGBA")
gray = Image.alpha_composite(Image.new("RGBA", im.size, "white"), im).convert("L")
W, H = gray.size
big = gray.resize((W * SCALE, H * SCALE), Image.LANCZOS)
pbm = work / "logo8.pbm"
big.point(lambda v: 0 if v < 128 else 255).convert("1").save(pbm)


def potrace_geojson(extra):
    out = work / "t.json"
    subprocess.run(["potrace", "-b", "geojson", "-t", "20", *extra, "-o", str(out), str(pbm)], check=True)
    feats = json.loads(out.read_text())["features"]
    polys = []
    for f in feats:
        geom = f["geometry"]
        cs = [geom["coordinates"]] if geom["type"] == "Polygon" else geom["coordinates"]
        for poly in cs:
            loops = []
            for ring in poly:
                pts = np.array(ring[:-1], float) / SCALE
                pts[:, 1] = H - pts[:, 1]
                loops.append(pts)
            polys.append(loops)
    return polys


def bbox(loops):
    a = np.vstack(loops)
    return a[:, 0].min(), a[:, 1].min(), a[:, 0].max(), a[:, 1].max()


def area(p):
    x, y = p[:, 0], p[:, 1]
    return 0.5 * float(np.sum(x * np.roll(y, -1) - np.roll(x, -1) * y))


def densify(p, step=0.25):
    out = []
    n = len(p)
    for i in range(n):
        a, b = p[i], p[(i + 1) % n]
        k = max(1, int(np.linalg.norm(b - a) / step))
        for t in range(k):
            out.append(a + (b - a) * t / k)
    return np.array(out)


def dp(points, eps):
    """Douglas-Peucker on an open polyline, returns kept indices."""
    keep = np.zeros(len(points), bool)
    keep[0] = keep[-1] = True
    stack = [(0, len(points) - 1)]
    while stack:
        i, j = stack.pop()
        if j <= i + 1:
            continue
        a, b = points[i], points[j]
        seg = b - a
        L = np.linalg.norm(seg)
        mid = points[i + 1:j]
        if L < 1e-9:
            d = np.linalg.norm(mid - a, axis=1)
        else:
            d = np.abs(seg[0] * (mid[:, 1] - a[1]) - seg[1] * (mid[:, 0] - a[0])) / L
        k = int(np.argmax(d))
        if d[k] > eps:
            keep[i + 1 + k] = True
            stack += [(i, i + 1 + k), (i + 1 + k, j)]
    return np.nonzero(keep)[0]


def fit_edges(loop, eps=0.8):
    """Returns list of edges dict(mean, dir, length) for a straight-edged loop, in order."""
    d = densify(loop)
    c = d.mean(axis=0)
    s = int(np.argmax(np.linalg.norm(d - c, axis=1)))
    d = np.roll(d, -s, axis=0)
    closed = np.vstack([d, d[:1]])
    idx = dp(closed, eps)
    edges = []
    for a, b in zip(idx[:-1], idx[1:]):
        seg = closed[a:b + 1]
        L = np.linalg.norm(closed[b] - closed[a])
        trim = min(1.5, L * 0.25)
        dist_a = np.linalg.norm(seg - closed[a], axis=1)
        dist_b = np.linalg.norm(seg - closed[b], axis=1)
        core = seg[(dist_a > trim) & (dist_b > trim)]
        if len(core) < 3:
            core = seg
        m = core.mean(axis=0)
        u, sv, vt = np.linalg.svd(core - m)
        direction = vt[0]
        if np.dot(direction, closed[b] - closed[a]) < 0:
            direction = -direction
        edges.append(dict(mean=m, dir=direction, length=L, a=closed[a], b=closed[b]))
    return edges


def intersect(e1, e2):
    d1, d2 = e1["dir"], e2["dir"]
    den = d1[0] * d2[1] - d1[1] * d2[0]
    if abs(den) < 0.05:  # nearly parallel: keep the shared vertex
        return e1["b"]
    diff = e2["mean"] - e1["mean"]
    t = (diff[0] * d2[1] - diff[1] * d2[0]) / den
    return e1["mean"] + d1 * t


poly_parts = potrace_geojson(["-a", "0"])        # straight polygons
smooth_parts = potrace_geojson(["-a", "1.0", "-O", "1.0"])  # for curved glyphs

shapes = []  # dict(kind, text, bbox, data)
all_edges = []
for loops in poly_parts:
    x0, y0, x1, y1 = bbox(loops)
    w, h = x1 - x0, y1 - y0
    is_text = h < 60 and ((y0 >= 278 and x0 >= 238) or (y0 >= 343 and x0 >= 195))
    a = abs(area(loops[0]))
    if len(loops) == 1 and abs(w - h) < 2.5 and 0.74 < a / (w * h) < 0.82:
        r = (math.sqrt(a / math.pi) + (w + h) / 4) / 2
        shapes.append(dict(kind="circle", text=is_text, bbox=(x0, y0, x1, y1),
                           data=((x0 + x1) / 2, (y0 + y1) / 2, r)))
        continue
    fitted = [fit_edges(l) for l in loops]
    def gentle(f):
        n = len(f); c = 0
        for i in range(n):
            a, b = f[i - 1]["dir"], f[i]["dir"]
            turn = abs(math.degrees(math.atan2(a[0] * b[1] - a[1] * b[0], float(np.dot(a, b)))))
            c += turn < 35
        return c / n
    if max(gentle(f) for f in fitted) > 0.5:  # curved glyph (the C)
        match = min(smooth_parts, key=lambda s: abs(bbox(s)[0] - x0) + abs(bbox(s)[1] - y0))
        rings = []
        for l in match:
            dd = np.vstack([l, l[:1]])
            rings.append(dd[dp(dd, 0.03)][:-1])
        shapes.append(dict(kind="poly", text=is_text, bbox=(x0, y0, x1, y1), data=rings))
        continue
    fitted = [[e for e in f if e["length"] >= 2.0] for f in fitted]
    shapes.append(dict(kind="edges", text=is_text, bbox=(x0, y0, x1, y1), data=fitted))
    for f in fitted:
        all_edges += f

# snap directions: cluster edge angles (mod 180) so parallel strokes are exactly parallel
angs = np.array([math.degrees(math.atan2(e["dir"][1], e["dir"][0])) % 180 for e in all_edges])
order = np.argsort(-np.array([e["length"] for e in all_edges]))
clusters = []  # [angle_sum_weighted, weight, members]
for i in order:
    a = angs[i]
    for c in clusters:
        ca = c[0] / c[1]
        diff = (a - ca + 90) % 180 - 90
        if abs(diff) < 1.5:
            c[0] += (ca + diff) * all_edges[i]["length"]; c[1] += all_edges[i]["length"]; c[2].append(i)
            break
    else:
        clusters.append([a * all_edges[i]["length"], all_edges[i]["length"], [i]])
for c in clusters:
    ca = (c[0] / c[1]) % 180
    for snap in (0, 90, 180):
        if abs(ca - snap) < 1.5:
            ca = snap % 180
    v = np.array([math.cos(math.radians(ca)), math.sin(math.radians(ca))])
    for i in c[2]:
        e = all_edges[i]
        e["dir"] = v if np.dot(v, e["dir"]) > 0 else -v
print("edge direction clusters:", sorted(round((c[0] / c[1]) % 180, 1) for c in clusters))

for s in shapes:
    if s["kind"] == "edges":
        rings = []
        for f in s["data"]:
            n = len(f)
            rings.append(np.array([intersect(f[i - 1], f[i]) for i in range(n)]))
        s["kind"], s["data"] = "poly", rings


def fmt(v):
    return f"{v:.2f}".rstrip("0").rstrip(".")


def write(name, keep, title):
    sel = [s for s in shapes if keep(s)]
    x0 = min(s["bbox"][0] for s in sel); y0 = min(s["bbox"][1] for s in sel)
    x1 = max(s["bbox"][2] for s in sel); y1 = max(s["bbox"][3] for s in sel)
    body = []
    for s in sel:
        if s["kind"] == "circle":
            cx, cy, r = s["data"]
            body.append(f'  <circle cx="{fmt(cx - x0)}" cy="{fmt(cy - y0)}" r="{fmt(r)}"/>')
        else:
            d = "".join("M" + " ".join(f"{fmt(p[0] - x0)},{fmt(p[1] - y0)}" for p in ring) + "Z" for ring in s["data"])
            body.append(f'  <path d="{d}"/>')
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {fmt(x1 - x0)} {fmt(y1 - y0)}" '
           f'fill="currentColor" role="img" aria-label="{title}">\n  <title>{title}</title>\n'
           + "\n".join(body) + "\n</svg>\n")
    (out_dir / f"{name}.svg").write_text(svg)
    print(name, "viewBox", fmt(x1 - x0), fmt(y1 - y0), "shapes", len(sel), "bytes", len(svg),
          "verts", [sum(len(r) for r in s["data"]) if s["kind"] == "poly" else "circle" for s in sel])


write("logo-full", lambda s: True, "Yehia Tech")
write("logo-mark", lambda s: not s["text"], "Yehia Tech mark")
