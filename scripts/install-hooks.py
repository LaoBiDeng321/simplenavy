"""把仓库的 git hooks 指向 .githooks/

    python scripts/install-hooks.py

执行后 core.hooksPath = .githooks，提交时就会跑 .githooks/pre-commit
（自动把站点版本号同步成当天 YY.MM.DD）。
"""

from __future__ import annotations

import os
import stat
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def main() -> None:
    subprocess.check_call(["git", "-C", str(ROOT), "config", "core.hooksPath", ".githooks"])
    print("已设置 core.hooksPath = .githooks")

    hook = ROOT / ".githooks" / "pre-commit"
    if hook.exists():
        mode = hook.stat().st_mode
        hook.chmod(mode | stat.S_IXUSR | stat.S_IXGRP | stat.S_IXOTH)
        print(f"已给 {hook.relative_to(ROOT)} 加可执行权限")


if __name__ == "__main__":
    main()
