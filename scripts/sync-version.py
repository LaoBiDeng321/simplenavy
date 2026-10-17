"""同步站点版本号（VER）

    python scripts/sync-version.py           # 用当天日期 YY.MM.DD
    python scripts/sync-version.py 26.10.17  # 指定版本

会改三处：
    index.html     加载动画里的 <span class="loader-ver">VER …</span>
    js/i18n.js     英文 'footer.version.value'
    js/i18n.js     中文 'footer.version.value'

改完不会自动提交，交给 .githooks/pre-commit 去 git add。
"""

from __future__ import annotations

import datetime
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# 形如 25.09.21
VERSION_RE = r"\d{2}\.\d{2}\.\d{2}"

TARGETS = [
    (
        ROOT / "index.html",
        re.compile(r'(<span class="loader-ver">VER )' + VERSION_RE + r"(</span>)"),
    ),
    (
        ROOT / "js" / "i18n.js",
        re.compile(r"('footer\.version\.value':\s*')" + VERSION_RE + r"(')"),
    ),
]


def pick_version() -> str:
    if len(sys.argv) > 1:
        version = sys.argv[1].strip()
    else:
        version = datetime.date.today().strftime("%y.%m.%d")
    if not re.fullmatch(VERSION_RE, version):
        raise SystemExit(f"版本号格式应为 YY.MM.DD，收到：{version}")
    return version


def main() -> None:
    version = pick_version()
    updated = 0

    for path, pattern in TARGETS:
        if not path.exists():
            continue
        text = path.read_text(encoding="utf-8")

        def replace(match: re.Match[str]) -> str:
            return match.group(1) + version + match.group(2)

        new_text, count = pattern.subn(replace, text)
        if count and new_text != text:
            path.write_text(new_text, encoding="utf-8", newline="\n")
            updated += count
            print(f"  {path.relative_to(ROOT)}: {count} 处 → {version}")

    print(f"版本号：{version}（更新 {updated} 处）")


if __name__ == "__main__":
    main()
