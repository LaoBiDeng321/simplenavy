"""生成开屏扫描用的文本清单 js/loader-docs.js

每次改动站点文本文件后重跑一次：

    python scripts/build-loader-docs.py

规则：
  1. 遍历仓库内所有文本类文件（html / css / js / md / json / svg / py / yml / gitignore / LICENSE ...）
  2. 跳过 .git、domo_local、node_modules、.venv 等目录，以及本脚本生成的目标文件
  3. 每个文件只取开头 SAMPLE_CHARS 个字符，避免开屏扫描 27 万字符
"""

from __future__ import annotations

import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "js", "loader-docs.js")

SAMPLE_CHARS = 320

TEXT_EXTS = {
    ".html", ".htm", ".css", ".js", ".mjs", ".json", ".md", ".markdown",
    ".txt", ".svg", ".py", ".yml", ".yaml", ".xml", ".toml", ".ini",
    ".gitignore", ".gitattributes", ".c", ".cpp", ".h", ".sh", ".ps1",
}
TEXT_NAMES = {"LICENSE", "README", "Makefile"}

SKIP_DIRS = {".git", "domo_local", "node_modules", ".venv", "venv", "__pycache__", ".idea", ".vscode"}
SKIP_FILES = {OUT}


def is_text(path: str) -> bool:
    name = os.path.basename(path)
    if name in SKIP_FILES:
        return False
    if name in TEXT_NAMES:
        return True
    return os.path.splitext(name)[1].lower() in TEXT_EXTS


def collect() -> list[dict]:
    docs = []
    for dirpath, dirnames, filenames in os.walk(ROOT):
        dirnames[:] = sorted(d for d in dirnames if d not in SKIP_DIRS)
        for filename in sorted(filenames):
            full = os.path.join(dirpath, filename)
            if not is_text(full):
                continue
            rel = os.path.relpath(full, ROOT).replace("\\", "/")
            try:
                with open(full, encoding="utf-8") as fh:
                    text = fh.read().replace("\r\n", "\n").replace("\r", "\n")
            except (UnicodeDecodeError, OSError):
                continue
            sample = text[:SAMPLE_CHARS]
            if not sample.strip():
                continue
            docs.append({"name": rel, "text": sample})
    return docs


def main() -> None:
    docs = collect()
    lines = [
        "/* 由 scripts/build-loader-docs.py 生成，请勿手改；改完文本文件后重跑脚本 */",
        "window.LOADER_DOCS = [",
    ]
    for i, doc in enumerate(docs):
        comma = "," if i < len(docs) - 1 else ""
        lines.append(
            "    " + json.dumps(doc, ensure_ascii=False) + comma
        )
    lines.append("];")

    with open(OUT, "w", encoding="utf-8", newline="\n") as fh:
        fh.write("\n".join(lines) + "\n")

    total = sum(len(d["text"]) for d in docs)
    print(f"docs: {len(docs)}  chars: {total}  ->  {os.path.relpath(OUT, ROOT)}")


if __name__ == "__main__":
    main()
