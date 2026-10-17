/**
 * Loader - 启动加载动画控制器
 * 时序：
 *   Phase 1  每个文本文件各开一个终端窗，全部同时扫描（不截断、不限窗口数）
 *            - 常驻窗：image/favicon.png 的彩色 ASCII 点位图，最先出现、最后消失
 *            - 进度 = 已扫描字数 / 全部字数，所有窗口扫描速度一致
 *   Phase 2  满值停顿后，遮罩自最左侧滑向最右侧（黄色前缘扫场）
 *   Phase 3  停顿片刻，派发 loader:done，主体元素渐显
 */

(function () {
    'use strict';

    var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var TIMING = {
        holdAtFull: 280,    // 满值后停顿
        wipe: 780,          // 遮罩左 → 右滑场时长（与 CSS 过渡一致）
        pauseAfterWipe: 380,// 滑场后的停顿，随后渐显主体

        rate: 12000,        // 扫描速度：字符 / 秒（所有窗口统一）
        stagger: 260,       // 各窗口入场的随机错开上限（乱一点）
        docHold: 120,       // 单个文件扫完到淡出的停顿
        fadeOut: 220,       // 窗口退场时长
        logoOut: 320,       // logo 比其它窗口晚退场的间隔
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
            var fallback = new Promise(function (resolve) {
                setTimeout(function () {
                    resolve({ name: name, text: '<unreadable>\n' });
                }, TIMING.fetchTimeout);
            });
            var load = fetchText(name)
                .then(function (text) { return { name: name, text: text }; })
                .catch(function () { return { name: name, text: '<unreadable>\n' }; });
            return Promise.race([load, fallback]);
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
            var remaining = docs.length + 1;   // 文档窗 + logo 窗
            var finished = false;

            function sum() {
                var s = logoScanned;
                for (var i = 0; i < scanned.length; i++) s += scanned[i];
                return s;
            }

            function renderProgress() {
                render(total > 0 ? 100 * sum() / total : 100);
            }

            /* ---------- logo 窗：彩色 ASCII 点位图 ---------- */
            var logoWin = spawnWindow(0, 'terminal — ./image/favicon.png', '$ img2ascii ./image/favicon.png', true);
            var logoCount = logoWin.querySelector('.term-count');
            var logoPct = logoWin.querySelector('.term-pct');
            var logoState = {
                runs: logo.runs,
                palette: LOGO.palette || [],
                runIdx: 0,
                offset: 0,
                done: 0,
                chars: logo.chars
            };

            requestAnimationFrame(function () {
                requestAnimationFrame(function () { logoWin.classList.add('is-on'); });
            });

            var logoStart = null;
            var logoDuration = logo.chars / TIMING.rate * 1000;

            requestAnimationFrame(function logoFrame(now) {
                if (logoStart === null) logoStart = now;
                var t = Math.min((now - logoStart) / logoDuration, 1);
                var revealed = Math.floor(logo.chars * t);
                revealLogo(logoWin, logoState, revealed);
                logoCount.textContent = revealed + ' / ' + logo.chars;
                logoPct.textContent = Math.round(t * 100) + '%';
                logoScanned = revealed;
                renderProgress();

                if (t < 1) {
                    requestAnimationFrame(logoFrame);
                } else {
                    logoWin.classList.add('is-done');
                    logoCount.textContent = logo.chars + ' / ' + logo.chars;
                    logoPct.textContent = '100%';
                    logoScanned = logo.chars;
                    renderProgress();
                    remaining -= 1;
                    maybeFinish();
                }
            });

            /* ---------- 每个文档一个窗口，全部同时开 ---------- */
            docs.forEach(function (doc, i) {
                var delay = Math.floor(rand(0, TIMING.stagger));
                var win = spawnWindow(i + 1, 'terminal — ./' + doc.name, '$ cat ./' + doc.name, false);

                setTimeout(function () {
                    requestAnimationFrame(function () {
                        requestAnimationFrame(function () { win.classList.add('is-on'); });
                    });
                    scanDoc(win, doc, i);
                }, delay);
            });

            function spawnWindow(index, title, prompt, isLogo) {
                var win = document.createElement('div');
                win.className = 'term-win' + (isLogo ? ' is-logo' : '');
                win.style.zIndex = String(10 + index * 2);
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
                place(win, isLogo);
                layer.appendChild(win);
                return win;
            }

            /** 单个文档：按统一速度逐字追加，滚到底部 */
            function scanDoc(win, doc, i) {
                var pre = win.querySelector('.term-text');
                var countEl = win.querySelector('.term-count');
                var pctEl = win.querySelector('.term-pct');
                var len = doc.text.length;
                var duration = len / TIMING.rate * 1000;
                var startAt = null;
                var shown = 0;
                var lastScroll = 0;

                requestAnimationFrame(function frame(now) {
                    if (startAt === null) startAt = now;
                    var t = Math.min((now - startAt) / duration, 1);
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

                    remaining -= 1;
                    maybeFinish();
                });
            }

            /** 彩色 logo：按颜色分段追加 span，空白/换行用纯文本 */
            function revealLogo(win, state, revealed) {
                var pre = win.querySelector('.term-text');
                while (state.runIdx < state.runs.length) {
                    var need = revealed - state.done;
                    if (need <= 0) return;

                    var run = state.runs[state.runIdx];
                    var remain = run.text.length - state.offset;
                    var take = Math.min(remain, need);
                    var chunk = run.text.slice(state.offset, state.offset + take);
                    var node;

                    if (run.color && run.text !== '\n') {
                        node = document.createElement('span');
                        node.style.color = state.palette[parseInt(run.color, 10)] || '';
                        node.textContent = chunk;
                    } else {
                        node = document.createTextNode(chunk);
                    }
                    pre.appendChild(node);

                    state.offset += take;
                    state.done += take;
                    if (state.offset >= run.text.length) {
                        state.runIdx += 1;
                        state.offset = 0;
                    }
                }
            }

            function maybeFinish() {
                if (remaining > 0 || finished) return;
                finished = true;
                render(100);

                /* logo 最后退场：等其它窗口都消失后再淡出 */
                setTimeout(function () {
                    logoWin.classList.add('is-out');
                    setTimeout(function () { logoWin.remove(); }, TIMING.fadeOut + 60);
                }, TIMING.logoOut);
                setTimeout(onFull, TIMING.logoOut + TIMING.fadeOut + 140);
            }

            /** 随机摆放：位置、尺寸都不写死，窗口可随意重叠 */
            function place(win, isLogo) {
                var lw = layer.clientWidth || 960;
                var lh = layer.clientHeight || 480;
                var narrow = lw <= 460;

                var w = isLogo
                    ? Math.min(Math.round(clamp(lw * 0.44, 360, 640)), lw - 12)
                    : Math.round(rand(narrow ? 200 : 300, Math.min(narrow ? lw - 16 : 560, lw - 12)));
                var h = isLogo
                    ? Math.min(Math.round(clamp(lh * 0.6, 220, 420)), lh - 12)
                    : Math.round(rand(narrow ? 120 : 170, Math.min(narrow ? 280 : 360, lh - 12)));

                var maxX = Math.max(0, lw - w);
                var maxY = Math.max(0, lh - h);

                win.style.width = w + 'px';
                win.style.height = h + 'px';
                win.style.left = Math.round(rand(0, maxX)) + 'px';
                win.style.top = Math.round(rand(0, maxY)) + 'px';
            }
        }

        /** 把 logo 行数据摊平成「同色连续片段」队列 */
        function buildLogoModel() {
            var runs = [];
            var chars = 0;
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
            });
            return { runs: runs, chars: chars };
        }

        /** 满值停顿后触发扫场 */
        function onFull() {
            render(100);
            setTimeout(startWipe, TIMING.holdAtFull);
        }

        /** 遮罩自最左侧滑向最右侧 */
        function startWipe() {
            loader.classList.add('is-wiping');
            setTimeout(function () {
                /* 滑场到位后的停顿，随后渐显主体 */
                setTimeout(function () { finish(loader); }, TIMING.pauseAfterWipe);
            }, TIMING.wipe);
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
