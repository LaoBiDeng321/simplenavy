"""生成开屏扫描所需的两份资源

    python scripts/build-loader-assets.py

产出：
  js/loader-docs.js   文本文件清单（只存路径，正文由浏览器 fetch 读取，不截断）
  js/loader-logo.js   image/favicon.png 的彩色 ASCII 点位图（保留原图配色）

排除：图片、字体等二进制，以及 .svg（矢量化图标，不进扫描清单）
"""

from __future__ import annotations

import json
import os

import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DOCS_OUT = os.path.join(ROOT, "js", "loader-docs.js")
LOGO_OUT = os.path.join(ROOT, "js", "loader-logo.js")
FAVICON = os.path.join(ROOT, "image", "favicon.png")

# 只扫「真正的源码与文档」：html / css / js / md / py / LICENSE
# 排除：json、xml、toml、ini、yml/yaml 这类中间物与配置项；svg 属于矢量图；其余为二进制
TEXT_EXTS = {".html", ".htm", ".css", ".js", ".mjs", ".md", ".markdown", ".txt", ".py"}
TEXT_NAMES = {"LICENSE", "README", "Makefile"}

SKIP_DIRS = {".git", "domo_local", "node_modules", ".venv", "venv", "__pycache__", ".idea", ".vscode"}
SKIP_EXTS = {
    ".svg", ".json", ".xml", ".toml", ".ini", ".yml", ".yaml",
    ".gitignore", ".gitattributes", ".lock",
    ".png", ".jpg", ".jpeg", ".webp", ".gif", ".ico", ".woff", ".woff2", ".ttf", ".zip",
}
SKIP_FILES = {os.path.basename(DOCS_OUT), os.path.basename(LOGO_OUT)}

LOGO_COLS = 96
LOGO_PALETTE_SIZE = 6


def is_text(path: str) -> bool:
    name = os.path.basename(path)
    if name in SKIP_FILES:
        return False
    if os.path.splitext(name)[1].lower() in SKIP_EXTS:
        return False
    if name in TEXT_NAMES:
        return True
    return os.path.splitext(name)[1].lower() in TEXT_EXTS


def build_docs() -> list[str]:
    docs = []
    for dirpath, dirnames, filenames in os.walk(ROOT):
        dirnames[:] = sorted(d for d in dirnames if d not in SKIP_DIRS)
        for filename in sorted(filenames):
            full = os.path.join(dirpath, filename)
            if not is_text(full):
                continue
            docs.append(os.path.relpath(full, ROOT).replace("\\", "/"))
    return docs


def build_logo() -> dict:
    img = Image.open(FAVICON).convert("RGB")
    gray = np.array(img.convert("L"))
    ys, xs = np.where(gray < 245)
    img = img.crop((int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1))

    height = max(1, int(LOGO_COLS * img.height / img.width * 0.52))
    img = img.resize((LOGO_COLS, height), Image.LANCZOS)

    # 保留原图配色：只对「有墨」的像素做 k-means，避免白色背景吃掉调色板
    px = np.asarray(img, dtype=np.float64).reshape(-1, 3)
    inky = ~((px[:, 0] > 238) & (px[:, 1] > 238) & (px[:, 2] > 238))
    ink = px[inky]

    rng = np.random.default_rng(7)
    n = min(LOGO_PALETTE_SIZE, len(ink))
    cent = ink[rng.choice(len(ink), n, replace=False)].copy()
    for _ in range(14):
        d = ((ink[:, None, :] - cent[None, :, :]) ** 2).sum(axis=2)
        lab = d.argmin(axis=1)
        for j in range(n):
            sel = ink[lab == j]
            if len(sel):
                cent[j] = sel.mean(axis=0)

    palette = ["#{:02x}{:02x}{:02x}".format(*(int(v) for v in c)) for c in cent]
    lab_full = (((px[:, None, :] - cent[None, :, :]) ** 2).sum(axis=2)).argmin(axis=1)
    lab_full = lab_full.reshape(height, LOGO_COLS)

    rgb = np.asarray(img)
    chars = "@%#*+=-:. "

    lines = []
    for y in range(height):
        text = ""
        colors = ""
        for x in range(LOGO_COLS):
            r, g, b = int(rgb[y, x, 0]), int(rgb[y, x, 1]), int(rgb[y, x, 2])
            if r > 238 and g > 238 and b > 238:
                text += " "
                colors += "0"
                continue
            lum = 0.299 * r + 0.587 * g + 0.114 * b
            text += chars[min(int(lum / 256 * len(chars)), len(chars) - 1)]
            colors += str(int(lab_full[y, x]))
        stripped = text.rstrip()
        lines.append({"s": stripped, "c": colors[: len(stripped)]})

    while lines and not lines[0]["s"]:
        lines.pop(0)
    while lines and not lines[-1]["s"]:
        lines.pop()

    return {"palette": palette, "lines": lines}


def main() -> None:
    docs = build_docs()
    with open(DOCS_OUT, "w", encoding="utf-8", newline="\n") as fh:
        fh.write("/* 由 scripts/build-loader-assets.py 生成，请勿手改 */\n")
        fh.write("window.LOADER_DOCS = " + json.dumps(docs, ensure_ascii=False) + ";\n")

    logo = build_logo()
    with open(LOGO_OUT, "w", encoding="utf-8", newline="\n") as fh:
        fh.write("/* 由 scripts/build-loader-assets.py 生成，请勿手改 */\n")
        fh.write("window.LOADER_LOGO = " + json.dumps(logo, ensure_ascii=False) + ";\n")

    total_chars = 0
    for rel in docs:
        try:
            with open(os.path.join(ROOT, rel), encoding="utf-8") as fh:
                total_chars += len(fh.read().replace("\r\n", "\n").replace("\r", "\n"))
        except (OSError, UnicodeDecodeError):
            pass

    print(f"docs: {len(docs)} files, {total_chars} chars")
    print(f"logo: {len(logo['lines'])} lines, palette {logo['palette']}")


if __name__ == "__main__":
    main()
