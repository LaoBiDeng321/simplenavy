/**
 * Loader - 启动加载动画控制器
 * 时序：
 *   Phase 1  空白区开出若干「终端窗」，扫描打印仓库里的文本文件
 *            - 1 个常驻窗：image/favicon.png 的 ASCII 点位图（最先出现、最后消失）
 *            - 3 个轮转窗：把 js/loader-docs.js 里的全部文本文件分三组，并行逐个打印
 *            进度 = 已扫描字数 / 全部字数（不含图片等其它资源）
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

        /* 扫描阶段 */
        scanPhase: 2400,    // 整段扫描的时长（每个窗口都跑满这段）
        leadIn: 130,        // 窗口淡入后停顿，再开始打印
        stagger: 110,       // 各窗口入场的错开间隔
        docHold: 30,        // 单个文件打印完到下一个文件
        fadeOut: 200,       // 窗口退场时长
        logoOut: 260,       // logo 比其它窗口晚退场的间隔
        minDoc: 120         // 单文件最短扫描时长
    };

    var WINDOW_COUNT = 3;

    /* logo：由 image/favicon.png 转成的 ASCII 点位图（构建期生成） */
    var LOGO_ART = "                  .......\n             .:-==+++++++===-.                                :=====:             -==:\n           .=+++++++++++++++++=-                             .+++++++=           .++++=\n          :+++++++++++++++++++++-                            :++++++++=.         :++++++-\n         .+++++++++++=++++++++++:                            :++++++++++:        :+++++++.\n         =++++++++-..  .:=++++=:                             :+++++++++++:       :+++++++.\n        .++++++++=        .::.                               :++++++++++++-      :+++++++.\n         =++++++++-.                           :*-           :+++++++++++++=.    :+++++++.\n         :++++++++++=---::..                   -%+           :+++++++++++++++:   :+++++++.\n          -+++++++++++++++++=::.               -#=           :+++++++=++++++++:  :+++++++.\n           .=+++++++++++++++++++-              -%=           :+++++++..=+++++++- :+++++++.\n             .:-=++++++++++++++++=             -%=           :+++++++.  =+++++++=-+++++++.\n                 ..::-==++++++++++:        =+++*#*++++       .+++++++.   -+++++++++++++++.\n            ..          .-++++++++=........*%#######%#:......-+++++++.    -++++++++++++++.\n         .-+++=-.         =++++++**++++++++++***#*+*++++++++++***++++.     .=++++++++++++.\n        :++++++++=:     .=++++++++-         .* -%= +:        :+++++++.      .=+++++++++++.\n        =++++++++++=---=++++++++++.        .*- =#+ :*.       :+++++++.       .=++++++++++.\n         -+++++++++++++++++++++++:         ++.*####:=*       :+++++++:         :+++++++++.\n          .=+++++++++++++++++++=.         :* .#####: +-      .+++++++.          :++++++++.\n            .:-=+++++++++++=-:.           +. .#####:  +.      -+++++-            .=+++++=\n                .:------:.            .+=**==+#####+==**=+:     ...                ....\n                                      :##################%-\n                                      :###################-\n                                      :###################-\n                                    .:=###################+:.\n                              -==***#########################***=+-\n...:-:::---:::-:::....        -%##################################:\n-+++++++++++++++++++++==--::...+#################################+::::::..\n =++++++++++++++++++++++++++++++#################################+++++++++==--:....      ....::-\n .++++++++++++++++++++++++++++++*###############################*++++++++++++++++++++++++++++++:\n  .+++++++++++++++++++++++++++++*###############################++++++++++++++++++++++++++++++:\n   .+++++++++++++++++++++++++++++*#############################*+++++++++++++++++++++++++++++:\n    .=+++++++++++++++++++*********#############################*+*+++++*****************++*+.\n      =*+++++++*******************########*********************************************+**+.\n       :***********************************++++++++++++++++++++***********************+**-\n        .=**++**+*+++++************+++**********************************************+**=.\n          :*##*####********++++++*****************************************++++++++++*+-\n            -#%#############*******++++************************+++++++***********##*=\n              -+#%#################*******++++++++++++++++***********###########%*=.\n                :=*%########################*************####################%#*:\n                   -+#%%##################################################%#+-.\n                     .:=##%%#########################################%%%#+-.\n                         :==*##%#################################%##*+=:\n                             ..-+*###%#####################%%##**=:.\n                                  ..---+*+*%#########%*+*+---..";

    /* 清单缺失时的兜底文档 */
    var FALLBACK_DOCS = [
        { name: 'README.md', text: '# SIMPLE NAVY\n\n文档清单 js/loader-docs.js 未加载，使用内置文本。\n' },
        { name: 'LICENSE', text: 'MIT License\n\nCopyright (c) 2026 Other Shore Game Studio\n' }
    ];

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

        /* 减少动态效果：不出扫描窗，直接快速收尾 */
        if (REDUCED || !layer) {
            render(100);
            loader.classList.add('is-leaving');
            setTimeout(function () { finish(loader); }, 150);
            return;
        }

        var docs = (window.LOADER_DOCS && window.LOADER_DOCS.length ? window.LOADER_DOCS : FALLBACK_DOCS)
            .map(function (doc, i) {
                return { id: i, name: doc.name, text: String(doc.text) };
            });

        var docsChars = docs.reduce(function (sum, d) { return sum + d.text.length; }, 0);
        var totalChars = docsChars + LOGO_ART.length;
        var scanned = docs.map(function () { return 0; });
        var logoScanned = 0;
        var openWindows = 0;
        var logoWin = null;

        /* 按字数把文档贪心均分到各窗口，保证每个窗口扫描时长接近 */
        var queues = [];
        for (var q = 0; q < WINDOW_COUNT; q++) { queues.push([]); }
        var queueChars = queues.map(function () { return 0; });
        docs.slice().sort(function (a, b) { return b.text.length - a.text.length; })
            .forEach(function (doc) {
                var k = queueChars.indexOf(Math.min.apply(null, queueChars));
                queues[k].push(doc);
                queueChars[k] += doc.text.length;
            });

        /* 每个窗口都跑满 scanPhase，窗口内按字数分配各文件的时长 */
        queues.forEach(function (queue, qi) {
            var sum = queueChars[qi] || 1;
            queue.forEach(function (doc) {
                doc.duration = Math.max(TIMING.minDoc, doc.text.length / sum * TIMING.scanPhase);
            });
        });

        var queueTotals = queues.map(function (queue) {
            return queue.reduce(function (s, d) { return s + d.duration + TIMING.docHold; }, 0);
        });
        var logoDuration = Math.max.apply(null, queueTotals.concat([TIMING.scanPhase]));

        startLogo();
        queues.forEach(function (queue, qi) {
            if (!queue.length) return;
            setTimeout(function () { runWindow(queue, qi); }, qi * TIMING.stagger);
        });

        function sumScanned() {
            var sum = logoScanned;
            for (var i = 0; i < scanned.length; i++) sum += scanned[i];
            return sum;
        }

        /** 渲染全局进度到左条 / 底部细线 / 百分比读数 */
        function render(progress) {
            var p = clamp(progress, 0, 100) / 100;
            if (fill) fill.style.transform = 'scaleY(' + p + ')';
            if (trackFill) trackFill.style.transform = 'scaleX(' + p + ')';
            if (count) count.textContent = pad3(progress);
        }

        function renderProgress() {
            render(totalChars > 0 ? 100 * sumScanned() / totalChars : 100);
        }

        /* ---------------- 常驻 logo 窗 ---------------- */
        function startLogo() {
            var win = buildWindow('terminal — ./image/favicon.png', '$ img2ascii ./image/favicon.png', true);
            place(win, 0, true);
            layer.appendChild(win);
            logoWin = win;

            var text = win.querySelector('.term-text');
            var countEl = win.querySelector('.term-count');
            var pctEl = win.querySelector('.term-pct');

            fadeIn(win);

            var started = false;
            setTimeout(function () {
                started = true;
                var start = null;
                var shown = -1;

                requestAnimationFrame(function step(now) {
                    if (start === null) start = now;
                    var t = Math.min((now - start) / logoDuration, 1);
                    var revealed = Math.floor(LOGO_ART.length * t);

                    if (revealed !== shown) {
                        shown = revealed;
                        text.textContent = LOGO_ART.slice(0, revealed);
                        text.scrollTop = text.scrollHeight;
                        countEl.textContent = revealed + ' / ' + LOGO_ART.length;
                        pctEl.textContent = Math.round(t * 100) + '%';
                        logoScanned = revealed;
                        renderProgress();
                    }

                    if (t < 1 || !started) {
                        requestAnimationFrame(step);
                    } else {
                        logoScanned = LOGO_ART.length;
                        text.textContent = LOGO_ART;
                        countEl.textContent = LOGO_ART.length + ' / ' + LOGO_ART.length;
                        pctEl.textContent = '100%';
                        win.classList.add('is-done');
                        renderProgress();
                        scheduleFinishCheck();
                    }
                });
            }, TIMING.leadIn);
        }

        /* ---------------- 轮转扫文档的窗口 ---------------- */
        function runWindow(queue, qi) {
            var win = buildWindow('terminal — ./' + queue[0].name, '$ cat ./' + queue[0].name, false);
            place(win, qi + 1, false);
            layer.appendChild(win);
            openWindows += 1;

            var title = win.querySelector('.term-title');
            var prompt = win.querySelector('.term-prompt');
            var text = win.querySelector('.term-text');
            var countEl = win.querySelector('.term-count');
            var pctEl = win.querySelector('.term-pct');

            fadeIn(win);

            var idx = -1;

            function nextDoc() {
                idx += 1;
                if (idx >= queue.length) {
                    win.classList.add('is-done');
                    win.classList.add('is-out');
                    setTimeout(function () { win.remove(); }, TIMING.fadeOut + 60);
                    openWindows -= 1;
                    scheduleFinishCheck();
                    return;
                }

                var doc = queue[idx];
                title.textContent = 'terminal — ./' + doc.name;
                prompt.textContent = '$ cat ./' + doc.name;
                text.textContent = '';
                pctEl.textContent = '0%';
                countEl.textContent = '0 / ' + doc.text.length;

                var start = null;
                var shown = -1;
                var delay = idx === 0 ? TIMING.leadIn : 0;

                setTimeout(function () {
                    requestAnimationFrame(function step(now) {
                        if (start === null) start = now;
                        var t = Math.min((now - start) / doc.duration, 1);
                        var revealed = Math.floor(doc.text.length * t);

                        if (revealed !== shown) {
                            shown = revealed;
                            text.textContent = doc.text.slice(0, revealed);
                            text.scrollTop = text.scrollHeight;
                            countEl.textContent = revealed + ' / ' + doc.text.length;
                            pctEl.textContent = Math.round(t * 100) + '%';
                            scanned[doc.id] = revealed;
                            renderProgress();
                        }

                        if (t < 1) {
                            requestAnimationFrame(step);
                        } else {
                            scanned[doc.id] = doc.text.length;
                            text.textContent = doc.text;
                            text.scrollTop = text.scrollHeight;
                            countEl.textContent = doc.text.length + ' / ' + doc.text.length;
                            pctEl.textContent = '100%';
                            renderProgress();
                            setTimeout(nextDoc, TIMING.docHold);
                        }
                    });
                }, delay);
            }

            nextDoc();
        }

        function fadeIn(win) {
            requestAnimationFrame(function () {
                requestAnimationFrame(function () { win.classList.add('is-on'); });
            });
        }

        function scheduleFinishCheck() {
            if (openWindows === 0 && logoScanned >= LOGO_ART.length) {
                finishScan();
            }
        }

        /* ---------------- 收尾：logo 最后退场 → 扫场 ---------------- */
        var finished = false;
        function finishScan() {
            if (finished) return;
            finished = true;
            render(100);
            if (logoWin) {
                var last = logoWin;
                logoWin = null;
                setTimeout(function () {
                    last.classList.add('is-out');
                    setTimeout(function () { last.remove(); }, TIMING.fadeOut + 60);
                }, TIMING.logoOut);
                setTimeout(onFull, TIMING.logoOut + TIMING.fadeOut + 120);
            } else {
                setTimeout(onFull, TIMING.holdAtFull);
            }
        }

        /** 组装终端窗结构 */
        function buildWindow(titleText, promptText, isLogo) {
            var win = document.createElement('div');
            win.className = 'term-win' + (isLogo ? ' is-logo' : '');
            win.innerHTML =
                '<div class="term-head">' +
                    '<span class="term-dots"><i></i><i></i><i></i></span>' +
                    '<span class="term-title">' + titleText + '</span>' +
                '</div>' +
                '<div class="term-body">' +
                    '<div class="term-prompt">' + promptText + '</div>' +
                    '<pre class="term-text"></pre>' +
                    '<div class="term-beam"></div>' +
                '</div>' +
                '<div class="term-foot">' +
                    '<span class="term-count">0</span>' +
                    '<span class="term-meta"><span class="term-pct">0%</span><span class="term-caret"></span></span>' +
                '</div>';
            return win;
        }

        /**
         * 随机摆放窗口：位置不写死（锚点 + 抖动），窗口之间可以重叠
         * 后出现的窗口 z-index 更高，自然遮挡先出现的窗口
         */
        function place(win, i, isLogo) {
            var lw = layer.clientWidth || 960;
            var lh = layer.clientHeight || 480;
            var narrow = lw <= 460;

            var w;
            var h;

            if (narrow) {
                w = Math.round(clamp(lw * 0.82, 220, 320));
                h = Math.round(clamp(lh * (isLogo ? 0.5 : 0.4), 140, isLogo ? 380 : 260));
            } else {
                w = Math.round(clamp(lw * (isLogo ? 0.46 : 0.36), 300, isLogo ? 640 : 540));
                h = Math.round(clamp(lh * (isLogo ? 0.64 : 0.5), 170, isLogo ? 430 : 340));
                w = Math.min(w, lw - 10);
                h = Math.min(h, lh - 10);
            }

            var maxX = Math.max(0, lw - w);
            var maxY = Math.max(0, lh - h);

            var anchors = narrow
                ? [{ x: 0.02, y: 0.02 }, { x: 0.08, y: 0.34 }, { x: 0.14, y: 0.66 }, { x: 0.04, y: 0.50 }]
                : [{ x: 0.02, y: 0.02 }, { x: 0.30, y: 0.08 }, { x: 0.54, y: 0.46 }, { x: 0.16, y: 0.56 }];

            var a = anchors[i % anchors.length];
            var jx = maxX * 0.10;
            var jy = maxY * 0.10;

            var x = clamp(maxX * a.x + rand(-jx, jx), 0, maxX);
            var y = clamp(maxY * a.y + rand(-jy, jy), 0, maxY);

            win.style.width = w + 'px';
            win.style.height = h + 'px';
            win.style.left = Math.round(x) + 'px';
            win.style.top = Math.round(y) + 'px';
            win.style.zIndex = String(10 + i * 2);
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
