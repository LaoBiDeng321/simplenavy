/**
 * OtherShoreGameStudio - Loader 启动加载动画控制器
 * 时序：
 *   Phase 1  底部通栏横向进度条自左向右 0 → 100（进度模拟 + 等待资源就绪）
 *   Phase 2  满值停顿后，遮罩自底部向上滑出（下缘黄色前缘上扫）
 *   Phase 3  停顿片刻，派发 loader:done，主体元素渐显
 */

(function () {
    'use strict';

    var PREFERS_REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* 时序参数（毫秒） */
    var TIMING = {
        fill: 1900,         // 进度条 0 → 99 的模拟时长
        snap: 220,          // 99 → 100 的收尾时长
        holdAtFull: 320,    // 满值后停顿
        wipe: 780,          // 遮罩底部 → 顶部滑场时长（与 CSS 过渡一致）
        pauseAfterWipe: 460 // 滑场后的停顿，随后渐显主体
    };

    /** 就绪等待：模拟进度跑完且 window 资源加载完成后才允许满值 */
    var windowLoaded = document.readyState === 'complete';
    window.addEventListener('load', function () { windowLoaded = true; });

    /** 缓动：easeInOutSine */
    function easeInOutSine(t) {
        return 0.5 - Math.cos(Math.PI * t) / 2;
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

        var fill = loader.querySelector('.oss-loader-track-fill');
        var count = document.getElementById('ossLoaderCount');

        document.body.classList.add('is-loading');

        /* 减少动态效果：跳过模拟与扫场，直接快速淡出 */
        if (PREFERS_REDUCED_MOTION) {
            if (fill) fill.style.transform = 'scaleX(1)';
            if (count) count.textContent = '100';
            loader.classList.add('is-leaving');
            setTimeout(function () { finish(loader); }, 150);
            return;
        }

        var start = null;

        function frame(now) {
            if (start === null) start = now;
            var elapsed = now - start;
            var t = Math.min(elapsed / TIMING.fill, 1);

            /* 模拟进度上限 99，等待真实资源就绪后才放行到 100 */
            var cap = windowLoaded ? 99.5 : 99;
            var progress = Math.min(easeInOutSine(t) * 100, cap);

            render(progress);

            if (t < 1 || !windowLoaded) {
                requestAnimationFrame(frame);
            } else {
                /* 收尾：99 → 100 */
                var snapStart = null;
                requestAnimationFrame(function snapFrame(now2) {
                    if (snapStart === null) snapStart = now2;
                    var t2 = Math.min((now2 - snapStart) / TIMING.snap, 1);
                    render(99 + easeInOutSine(t2));
                    if (t2 < 1) {
                        requestAnimationFrame(snapFrame);
                    } else {
                        onFull();
                    }
                });
            }
        }

        /** 渲染进度到进度条与百分比读数 */
        function render(progress) {
            if (fill) fill.style.transform = 'scaleX(' + (progress / 100) + ')';
            if (count) count.textContent = pad3(progress);
        }

        /** 满值停顿后触发上滑扫场 */
        function onFull() {
            render(100);
            if (count) count.textContent = '100';
            setTimeout(startWipe, TIMING.holdAtFull);
        }

        /** 遮罩自底部向上滑出 */
        function startWipe() {
            loader.classList.add('is-wiping');
            setTimeout(function () {
                /* 滑场到位后的停顿，随后渐显主体 */
                setTimeout(function () { finish(loader); }, TIMING.pauseAfterWipe);
            }, TIMING.wipe);
        }

        requestAnimationFrame(frame);
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

        /* 通知 fullpage.js 开始主体渐显动画 */
        document.dispatchEvent(new CustomEvent('loader:done'));
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initLoader);
    } else {
        initLoader();
    }
})();
