# Simple NAVY 官网

Simple NAVY 是一款轻度肝氪的单机海战游戏的非官方展示页面。纯静态站点，两个页面，无构建、无依赖。

## 页面导航

| 页面 | 入口 | 内容 |
|---|---|---|
| 主站首页 | [index.html](index.html) | ENDFIELD 工业风整屏滚动，6 屏：`#hero` 首屏 / `#intro` 关于游戏 / `#unlock` 100%进度模式 / `#features` 特色玩法 / `#requirements` 系统需求 / `#footer` 感谢支持 |
| 开发者页 | [OtherShoreGameStudio/index.html](OtherShoreGameStudio/index.html) | OtherShore Game Studio，6 屏：`#home` 首屏 / `#about` 工作室简介 / `#team` 核心团队 / `#games` 游戏作品 / `#news` 新闻动态 / `#contact` 联系我们 |

对外入口（TapTap 商店页、QQ 交流群、百度网盘）落在两页首屏的下载区，改链接时搜 `taptap.cn` / `qm.qq.com` / `pan.baidu.com`。

## 目录导航

### 主站

| 文件 | 作用 |
|---|---|
| [index.html](index.html) | 页面骨架：加载动画、顶栏、整屏容器、6 个 `section`、愚人节弹窗 |
| [css/design-system.css](css/design-system.css) | 设计令牌：配色、字体、间距、全直角规则、按钮/卡片基础样式——改主题先改这里 |
| [css/loader.css](css/loader.css) | 进场加载动画的版式：终端窗外观、扫描线/光带、加载条 |
| [css/fullpage.css](css/fullpage.css) | 整屏滚动与各屏版式：首屏背景、下载台、特色卡片、配置表、页脚 |
| [css/components.css](css/components.css) | 通用组件：顶栏（品牌/语言切换/导航链接/提示气泡）、入场动画 `animate-on-scroll`、弹窗 |
| [css/responsive.css](css/responsive.css) | 断点适配（桌面 → 平板 → 手机） |
| [js/i18n.js](js/i18n.js) | 中英文案表 + 语言切换，全站文案的唯一来源 |
| [js/loader-docs.js](js/loader-docs.js) | 开屏扫描清单：只收源码与文档（html / css / js / md / py / LICENSE，共 21 个），正文由浏览器 `fetch` 完整读取；排除 json / xml / toml / ini / yml 等配置中间物、svg 与图片 |
| [js/loader-logo.js](js/loader-logo.js) | `image/favicon.png` 的彩色 ASCII 点位图（160 列 × 75 行、6 色调色板 + 逐字颜色），保留原图配色 |
| [js/loader.js](js/loader.js) | 启动时序：每个源码/文档各开一个终端窗全部同时扫描（进度 = 已扫描字数 / 总字数）→ logo 最后登场、位于最上层居中打印点阵 → 遮罩扫场 → 派发 `loader:done`；**扫描动画按 UA 只对 PC 启用**，移动端/平板直接快速放行 |
| [js/fullpage.js](js/fullpage.js) | 整屏滚动核心：滚轮/键盘/触摸切换、锚点导航、右侧指示点 |
| [js/main.js](js/main.js) | 主逻辑：i18n 初始化、全屏滚动、入场动画、愚人节弹窗、首屏视差 |
| [scripts/build-loader-assets.py](scripts/build-loader-assets.py) | 重新生成 `loader-docs.js` + `loader-logo.js`：新增/改动文本文件后运行一次 |

### 开发者页

| 文件 | 作用 |
|---|---|
| [OtherShoreGameStudio/index.html](OtherShoreGameStudio/index.html) | 页面骨架，复用主站的设计令牌与顶栏语言切换 |
| [OtherShoreGameStudio/css/oss-loader.css](OtherShoreGameStudio/css/oss-loader.css) | 该页加载动画 |
| [OtherShoreGameStudio/css/oss-components.css](OtherShoreGameStudio/css/oss-components.css) | 通用组件：顶栏、品牌 Logo、按钮、右侧导航点、页脚、入场动画 |
| [OtherShoreGameStudio/css/oss-sections.css](OtherShoreGameStudio/css/oss-sections.css) | 各屏版式：首屏、工作室简介、核心团队、游戏作品、新闻动态、联系我们 |
| [OtherShoreGameStudio/css/oss-responsive.css](OtherShoreGameStudio/css/oss-responsive.css) | 断点适配 |
| [OtherShoreGameStudio/js/i18n.js](OtherShoreGameStudio/js/i18n.js) | 该页中英文案表 |
| [OtherShoreGameStudio/js/loader.js](OtherShoreGameStudio/js/loader.js) | 该页启动动画 |
| [OtherShoreGameStudio/js/fullpage.js](OtherShoreGameStudio/js/fullpage.js) | 该页整屏滚动 |
| `../css/design-system.css` | 共享主站设计令牌，不重复定义主题 |

### 静态资源

| 文件 | 用途 |
|---|---|
| [image/游戏库背景壁纸.png](image/游戏库背景壁纸.png) | 主站首屏背景、开发者页作品封面 |
| [image/favicon.png](image/favicon.png) | 站点图标 |
| [image/taptap_logo.svg](image/taptap_logo.svg) / [image/QQ.svg](image/QQ.svg) / [image/baiduyuanpan.svg](image/baiduyuanpan.svg) | 三个下载入口图标 |
| [image/people.svg](image/people.svg) / [image/bell.svg](image/bell.svg) / [image/grid.svg](image/grid.svg) / [image/star.svg](image/star.svg) / [image/gear.svg](image/gear.svg) / [image/display.svg](image/display.svg) | 特色玩法 6 个卡片图标 |
| [image/exclamation-triangle.svg](image/exclamation-triangle.svg) / [image/info-circle.svg](image/info-circle.svg) | 提示框图标 |
| [image/check.svg](image/check.svg) | 备用的对勾图标（当前页面未引用） |
| [OtherShoreGameStudio/image/Bilibili_tv.svg](OtherShoreGameStudio/image/Bilibili_tv.svg) | 开发者页 B 站图标 |

> 图标统一放 `image/` 根目录复用；`OtherShoreGameStudio/` 只保留自己独有的 B 站图标。

## 改东西从哪下手

| 想改 | 去哪 |
|---|---|
| 文案（中/英） | [js/i18n.js](js/i18n.js)、[OtherShoreGameStudio/js/i18n.js](OtherShoreGameStudio/js/i18n.js)；HTML 里只留 `data-i18n` 键 |
| 配色 / 字体 / 圆角 | [css/design-system.css](css/design-system.css) 的变量，不在别处硬编码色值 |
| 版式、间距 | 主站 [css/fullpage.css](css/fullpage.css)，开发者页 [OtherShoreGameStudio/css/oss-sections.css](OtherShoreGameStudio/css/oss-sections.css) |
| 下载链接、QQ 群、网盘 | 两页 `index.html` 里的 `<a href>` |
| 版本号 | [js/i18n.js](js/i18n.js) 的 `footer.version.value` 与 [index.html](index.html) 加载动画里的 `VER` |
