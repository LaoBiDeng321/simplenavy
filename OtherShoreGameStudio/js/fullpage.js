/**
 * OtherShoreGameStudio - Fullpage 全屏滚动
 * 职责：分区切换（滚轮/键盘/触摸/指示器）、导航高亮、入场动画调度
 * 约束：
 *   - 加载期间（body.is-loading）锁定全部滚动/键盘/触摸输入
 *   - 首/末分区边界放行原生滚动（末页内容超高时可内部滚动）
 */

(function () {
    'use strict';

    var container = document.getElementById('fullpage');
    var sections = document.querySelectorAll('.fp-section');
    var fpNavLinks = document.querySelectorAll('.fp-nav-link');

    var currentIndex = 0;
    var isScrolling = false;
    var touchStartY = 0;

    /** 加载层是否仍在工作（锁定输入） */
    function isLocked() {
        return document.body.classList.contains('is-loading');
    }

    function goToSection(index) {
        if (isScrolling || isLocked() || index < 0 || index >= sections.length) return;
        if (index === currentIndex) return;

        isScrolling = true;
        currentIndex = index;

        var offset = index * 100;
        container.style.transform = 'translateY(-' + offset + 'vh)';

        // 更新导航
        updateNavigation();

        // 触发动画
        setTimeout(function () {
            animateSection(index);
        }, 400);

        setTimeout(function () {
            isScrolling = false;
        }, 800);
    }

    function updateNavigation() {
        fpNavLinks.forEach(function (link, index) {
            link.classList.toggle('active', index === currentIndex);
        });
    }

    function animateSection(index) {
        var section = sections[index];
        var animatedElements = section.querySelectorAll('.animate-on-scroll');

        animatedElements.forEach(function (el) {
            el.classList.remove('is-visible');
        });

        animatedElements.forEach(function (el, i) {
            setTimeout(function () {
                el.classList.add('is-visible');
            }, i * 100 + 100);
        });
    }

    // 鼠标滚轮（累积阈值，防触控板误触；边界放行原生滚动）
    var wheelAccumulator = 0;
    window.addEventListener('wheel', function (e) {
        if (isLocked()) {
            e.preventDefault();
            return;
        }

        if (isScrolling) {
            e.preventDefault();
            return;
        }

        // 已在首/末分区时不再切换，放行内部滚动
        var atEdge = (wheelAccumulator > 0 && currentIndex >= sections.length - 1) ||
                     (wheelAccumulator < 0 && currentIndex <= 0);

        wheelAccumulator += e.deltaY;

        if (Math.abs(wheelAccumulator) > 50) {
            if (atEdge) {
                wheelAccumulator = 0;
                return; // 不拦截，允许末页/首页内容区原生滚动
            }

            e.preventDefault();

            if (wheelAccumulator > 0) {
                goToSection(currentIndex + 1);
            } else {
                goToSection(currentIndex - 1);
            }

            wheelAccumulator = 0;
        }
    }, { passive: false });

    // 键盘（边界放行，配合末页内部滚动）
    window.addEventListener('keydown', function (e) {
        if (isLocked()) {
            e.preventDefault();
            return;
        }
        if (isScrolling) return;

        switch (e.key) {
            case 'ArrowDown':
            case 'PageDown':
                if (currentIndex >= sections.length - 1) return;
                e.preventDefault();
                goToSection(currentIndex + 1);
                break;
            case 'ArrowUp':
            case 'PageUp':
                if (currentIndex <= 0) return;
                e.preventDefault();
                goToSection(currentIndex - 1);
                break;
            case 'Home':
                if (currentIndex <= 0) return;
                e.preventDefault();
                goToSection(0);
                break;
            case 'End':
                if (currentIndex >= sections.length - 1) return;
                e.preventDefault();
                goToSection(sections.length - 1);
                break;
        }
    });

    // 触摸（边界放行，末页可原生拖动）
    window.addEventListener('touchstart', function (e) {
        if (isLocked()) {
            e.preventDefault();
            return;
        }
        touchStartY = e.touches[0].clientY;
    }, { passive: false });

    window.addEventListener('touchend', function (e) {
        if (isLocked() || isScrolling) return;

        var diff = touchStartY - e.changedTouches[0].clientY;
        var atEdge = (diff > 0 && currentIndex >= sections.length - 1) ||
                     (diff < 0 && currentIndex <= 0);

        if (Math.abs(diff) > 50 && !atEdge) {
            if (diff > 0) {
                goToSection(currentIndex + 1);
            } else {
                goToSection(currentIndex - 1);
            }
        }
    }, { passive: true });

    // 右侧导航点击
    fpNavLinks.forEach(function (link) {
        link.addEventListener('click', function () {
            var index = parseInt(link.dataset.section, 10);
            goToSection(index);
        });
    });

    /* 暴露给 HTML 内联调用（Hero CTA 按钮） */
    window.goToSection = goToSection;

    // 初始动画：等待加载层完成后再触发首屏渐显
    function startIntro() {
        setTimeout(function () {
            animateSection(0);
        }, 60);
    }

    if (document.getElementById('loader')) {
        document.addEventListener('loader:done', startIntro);
    } else {
        setTimeout(startIntro, 300);
    }
})();
