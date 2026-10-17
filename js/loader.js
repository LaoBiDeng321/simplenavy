/**
 * Loader - 启动加载动画控制器
 * 时序：
 *   Phase 1  每个源码/文档各开一个终端窗，全部同时扫描（不截断、不限窗口数）
 *            进度 = 已扫描字数 / 全部字数，所有窗口扫描速度一致
 *   Phase 2  文档扫完 → logo 窗最后登场（位于最上层、居中）打印彩色 ASCII 点位图
 *   Phase 3  满值停顿后，遮罩自最左侧滑向最右侧（黄色前缘扫场）→ 主体渐显
 */

(function () {
    'use strict';

    var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var TIMING = {
        holdAtFull: 280,    // 满值后停顿
        wipe: 780,          // 遮罩左 → 右滑场时长（与 CSS 过渡一致）
        pauseAfterWipe: 380,// 滑场后的停顿，随后渐显主体

        rate: 12000,        // 扫描速度：字符 / 秒（所有窗口统一）
        stagger: 260,       // 文档窗口入场的随机错开上限（乱一点）
        docHold: 120,       // 单个文件扫完到淡出的停顿
        fadeOut: 220,       // 窗口退场时长
        finaleDelay: 180,   // 文档全部扫完后，logo 登场的间隔
        logoHold: 340,      // logo 扫完后停留
        fetchTimeout: 1500  // 单个文件读取超时
    };

    var LOGO = window.LOADER_LOGO || { palette: ['#cfd3cd'], lines: [] };
    var DOCS = window.LOADER_DOCS || [];

    function clamp(v, min, max) {
        return Math.min(Math.max(v, min), max);
    }

    function rand(min, max) {
        return min + Math.random() * (max - min);
    }

    /** 三位数补零显示，如 007 */
    function pad3(n) {
        return String(Math.round(n)).padStart(3, '0');
    }

    /** 读取文本文件（正文完整读取，不截断） */
    function fetchText(url) {
        return fetch(url, { cache: 'force-cache' })
            .then(function (res) {
                if (!res.ok) throw new Error('HTTP ' + res.status);
                return res.text();
            })
            .then(function (text) {
                return text.replace(/\r\n?/g, '\n');
            });
    }

    function initLoader() {
        var loader = document.getElementById('loader');
        if (!loader) {
            finish(null);
            return;
        }

        var fill = loader.querySelector('.loader-bar-fill');
        var trackFill = loader.querySelector('.loader-track-fill');
        var count = document.getElementById('loaderCount');
        var layer = document.getElementById('loaderScan');

        document.body.classList.add('is-loading');

        /** 渲染全局进度到左条 / 底部细线 / 百分比读数 */
        function render(progress) {
            var p = clamp(progress, 0, 100) / 100;
            if (fill) fill.style.transform = 'scaleY(' + p + ')';
            if (trackFill) trackFill.style.transform = 'scaleX(' + p + ')';
            if (count) count.textContent = pad3(progress);
        }

        /* 减少动态效果：不出扫描窗，直接快速收尾 */
        if (REDUCED || !layer) {
            render(100);
            loader.classList.add('is-leaving');
            setTimeout(function () { finish(loader); }, 150);
            return;
        }

        render(0);

        /* ---------- 文档：并行读取完整正文 ---------- */
        var pending = DOCS.map(function (name) {
            var timeout = new Promise(function (resolve) {
                setTimeout(function () {
                    resolve({ name: name, text: '<unreadable>\n' });
                }, TIMING.fetchTimeout);
            });
            var load = fetchText(name)
                .then(function (text) { return { name: name, text: text }; })
                .catch(function () { return { name: name, text: '<unreadable>\n' }; });
            return Promise.race([load, timeout]);
        });

        Promise.all(pending).then(function (docs) {
            docs = docs.filter(function (d) { return d.text.length > 0; });
            start(docs);
        });

        function start(docs) {
            var logo = buildLogoModel();
            var total = logo.chars + docs.reduce(function (s, d) { return s + d.text.length; }, 0);
            var scanned = docs.map(function () { return 0; });
            var logoScanned = 0;
            var docsRemaining = docs.length;

            function sum() {
                var s = logoScanned;
                for (var i = 0; i < scanned.length; i++) s += scanned[i];
                return s;
            }

            function renderProgress() {
                render(total > 0 ? 100 * sum() / total : 100);
            }

            function buildWindow(title, prompt, isLogo) {
                var win = document.createElement('div');
                win.className = 'term-win' + (isLogo ? ' is-logo' : '');
                win.innerHTML =
                    '<div class="term-head">' +
                        '<span class="term-dots"><i></i><i></i><i></i></span>' +
                        '<span class="term-title">' + title + '</span>' +
                    '</div>' +
                    '<div class="term-body">' +
                        '<div class="term-prompt">' + prompt + '</div>' +
                        '<pre class="term-text"></pre>' +
                        '<div class="term-beam"></div>' +
                    '</div>' +
                    '<div class="term-foot">' +
                        '<span class="term-count">0</span>' +
                        '<span class="term-meta"><span class="term-pct">0%</span><span class="term-caret"></span></span>' +
                    '</div>';
                layer.appendChild(win);
                return win;
            }

            function fadeIn(win) {
                requestAnimationFrame(function () {
                    requestAnimationFrame(function () { win.classList.add('is-on'); });
                });
            }

            /* ---------------- 文档窗：全部同时扫 ---------------- */
            docs.forEach(function (doc, i) {
                var win = buildWindow('terminal — ./' + doc.name, '$ cat ./' + doc.name, false);
                win.style.zIndex = String(10 + i * 2);
                placeDoc(win);

                setTimeout(function () {
                    fadeIn(win);
                    scanDoc(win, doc, i);
                }, Math.floor(rand(0, TIMING.stagger)));
            });

            function scanDoc(win, doc, i) {
                var pre = win.querySelector('.term-text');
                var countEl = win.querySelector('.term-count');
                var pctEl = win.querySelector('.term-pct');
                var len = doc.text.length;
                var duration = len / TIMING.rate * 1000;
                var startedAt = null;
                var shown = 0;
                var lastScroll = 0;

                requestAnimationFrame(function frame(now) {
                    if (startedAt === null) startedAt = now;
                    var t = Math.min((now - startedAt) / duration, 1);
                    var revealed = Math.floor(len * t);

                    if (revealed > shown) {
                        pre.appendChild(document.createTextNode(doc.text.slice(shown, revealed)));
                        shown = revealed;
                        countEl.textContent = shown + ' / ' + len;
                        pctEl.textContent = Math.round(t * 100) + '%';
                        scanned[i] = shown;
                        renderProgress();
                        if (now - lastScroll > 90) {
                            pre.scrollTop = pre.scrollHeight;
                            lastScroll = now;
                        }
                    }

                    if (t < 1) {
                        requestAnimationFrame(frame);
                        return;
                    }

                    if (shown < len) {
                        pre.appendChild(document.createTextNode(doc.text.slice(shown)));
                        shown = len;
                    }
                    countEl.textContent = len + ' / ' + len;
                    pctEl.textContent = '100%';
                    pre.scrollTop = pre.scrollHeight;
                    scanned[i] = len;
                    renderProgress();

                    win.classList.add('is-done');
                    setTimeout(function () {
                        win.classList.add('is-out');
                        setTimeout(function () { win.remove(); }, TIMING.fadeOut + 60);
                    }, TIMING.docHold);

                    docsRemaining -= 1;
                    if (docsRemaining === 0) {
                        setTimeout(startLogoFinale, TIMING.finaleDelay);
                    }
                });
            }

            /* ---------------- 压轴：logo 最后登场、最上层 ---------------- */
            function startLogoFinale() {
                var win = buildWindow(
                    'terminal — ./image/favicon.png',
                    '$ img2ascii ./image/favicon.png',
                    true
                );
                win.style.zIndex = '900';   // 永远压在所有文档窗之上
                placeLogo(win);
                fadeIn(win);

                var pre = win.querySelector('.term-text');
                var countEl = win.querySelector('.term-count');
                var pctEl = win.querySelector('.term-pct');

                /* 按窗口实际可容纳的尺寸算字号，保证整幅点阵完整显示 */
                fitLogo(pre, win);

                var duration = logo.chars / TIMING.rate * 1000;
                var runs = logo.runs;
                var palette = LOGO.palette || [];
                var runIdx = 0;
                var offset = 0;
                var shownChars = 0;
                var startedAt = null;
                var lastScroll = 0;

                requestAnimationFrame(function frame(now) {
                    if (startedAt === null) startedAt = now;
                    var t = Math.min((now - startedAt) / duration, 1);
                    var revealed = Math.floor(logo.chars * t);

                    while (revealed > shownChars && runIdx < runs.length) {
                        var run = runs[runIdx];
                        var take = Math.min(run.text.length - offset, revealed - shownChars);
                        var chunk = run.text.slice(offset, offset + take);
                        var node;

                        if (run.color && run.text !== '\n') {
                            node = document.createElement('span');
                            node.style.color = palette[parseInt(run.color, 10)] || '';
                            node.textContent = chunk;
                        } else {
                            node = document.createTextNode(chunk);
                        }
                        pre.appendChild(node);

                        offset += take;
                        shownChars += take;
                        if (offset >= run.text.length) {
                            runIdx += 1;
                            offset = 0;
                        }
                    }

                    logoScanned = shownChars;
                    countEl.textContent = shownChars + ' / ' + logo.chars;
                    pctEl.textContent = Math.round(t * 100) + '%';
                    renderProgress();
                    if (now - lastScroll > 120) {
                        pre.scrollTop = pre.scrollHeight;
                        lastScroll = now;
                    }

                    if (t < 1) {
                        requestAnimationFrame(frame);
                        return;
                    }

                    logoScanned = logo.chars;
                    countEl.textContent = logo.chars + ' / ' + logo.chars;
                    pctEl.textContent = '100%';
                    renderProgress();
                    win.classList.add('is-done');

                    setTimeout(function () {
                        win.classList.add('is-out');
                        setTimeout(function () { win.remove(); }, TIMING.fadeOut + 60);
                        setTimeout(onFull, TIMING.fadeOut + 160);
                    }, TIMING.logoHold);
                });
            }

            /** 把行数据摊平成「同色连续片段」队列 */
            function buildLogoModel() {
                var runs = [];
                var chars = 0;
                var maxCols = 0;
                (LOGO.lines || []).forEach(function (line) {
                    var s = line.s || '';
                    var c = line.c || '';
                    var start = 0;
                    while (start < s.length) {
                        var color = c.charAt(start);
                        var end = start + 1;
                        while (end < s.length && c.charAt(end) === color) end += 1;
                        runs.push({ text: s.slice(start, end), color: color });
                        start = end;
                    }
                    runs.push({ text: '\n', color: '' });
                    chars += s.length + 1;
                    if (s.length > maxCols) maxCols = s.length;
                });
                return { runs: runs, chars: chars, rows: (LOGO.lines || []).length, cols: maxCols };
            }

            /** 让点阵按窗口可用空间缩放（等宽字体 0.6em 字宽、行高 1.05） */
            function fitLogo(pre, win) {
                var body = win.querySelector('.term-body');
                if (!body) return;
                var cellW = Math.max(1, logo.cols * 0.6);
                var cellH = Math.max(1, logo.rows * 1.05);
                var size = Math.min((body.clientWidth - 18) / cellW, (body.clientHeight - 14) / cellH);
                pre.style.fontSize = clamp(size, 2.4, 12).toFixed(2) + 'px';
            }

            function placeDoc(win) {
                var lw = layer.clientWidth || 960;
                var lh = layer.clientHeight || 480;
                var narrow = lw <= 460;

                var w = Math.round(rand(narrow ? 200 : 300, Math.min(narrow ? lw - 16 : 560, lw - 12)));
                var h = Math.round(rand(narrow ? 120 : 170, Math.min(narrow ? 280 : 360, lh - 12)));

                win.style.width = w + 'px';
                win.style.height = h + 'px';
                win.style.left = Math.round(rand(0, Math.max(0, lw - w))) + 'px';
                win.style.top = Math.round(rand(0, Math.max(0, lh - h))) + 'px';
            }

            function placeLogo(win) {
                var lw = layer.clientWidth || 960;
                var lh = layer.clientHeight || 480;

                var w = Math.min(Math.round(clamp(lw * 0.72, 420, 940)), lw - 16);
                var h = Math.min(Math.round(clamp(lh * 0.82, 300, 620)), lh - 16);

                win.style.width = w + 'px';
                win.style.height = h + 'px';
                /* 居中登场，压在最上层 */
                win.style.left = Math.round((lw - w) / 2) + 'px';
                win.style.top = Math.round((lh - h) / 2) + 'px';
            }

            /* 进度满值：等 logo 扫完后由 startLogoFinale 触发 */
            function onFull() {
                render(100);
                setTimeout(startWipe, TIMING.holdAtFull);
            }

            function startWipe() {
                loader.classList.add('is-wiping');
                setTimeout(function () {
                    setTimeout(function () { finish(loader); }, TIMING.pauseAfterWipe);
                }, TIMING.wipe);
            }

        }
    }

    /** 结束加载：解锁交互，派发完成事件，移除节点 */
    function finish(loader) {
        document.body.classList.remove('is-loading');
        document.body.classList.add('is-booted');

        if (loader) {
            loader.classList.add('is-leaving');
            setTimeout(function () {
                loader.remove();
            }, 340);
        }

        /* 通知 main.js 开始主体渐显动画 */
        document.dispatchEvent(new CustomEvent('loader:done'));
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initLoader);
    } else {
        initLoader();
    }
})();
