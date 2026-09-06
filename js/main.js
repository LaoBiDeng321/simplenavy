/**
 * Simple NAVY (ENDFIELD Edition) - Main JavaScript
 * 主应用逻辑：i18n、全屏滚动、入场动画、愚人节弹窗
 */

document.addEventListener('DOMContentLoaded', () => {
    // 初始化文案（先于一切 UI 渲染）
    initI18n();

    // 初始化全屏滚动
    initFullPage();

    // 初始化愚人节弹窗
    initAprilFools();

    // 初始化视差效果
    initParallax();

    // 加载动画完成后，触发首屏渐显
    initRevealAfterLoader();
});

/**
 * 初始化多语言：应用当前语言，绑定语言切换按钮
 */
function initI18n() {
    if (window.I18N) {
        window.I18N.apply(window.I18N.getLang());
    }

    document.querySelectorAll('.lang-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
            if (window.I18N) {
                window.I18N.apply(btn.dataset.lang);
            }
        });
    });
}

/**
 * 初始化全屏滚动
 */
function initFullPage() {
    const fp = new FullPage({
        containerId: 'fullpage',
        scrollSpeed: 800,
        scrollDelay: 1000,
        easing: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
        loop: false,
        keyboard: true,
        touch: true,
        mousewheel: true
    });

    // 监听section变化事件
    document.getElementById('fullpage').addEventListener('fp:sectionChange', (e) => {
        const { currentIndex, currentSection } = e.detail;

        // 添加section激活状态
        document.querySelectorAll('.fp-section').forEach((section, index) => {
            section.classList.toggle('is-active', index === currentIndex);
        });

        // 同步顶栏导航激活态
        document.querySelectorAll('.tb-link').forEach((link, index) => {
            link.classList.toggle('active', index === currentIndex);
        });

        // 触发当前section的动画
        animateSectionElements(currentSection);
    });

    // 保存实例到全局
    window.fullpage = fp;
}

/**
 * 加载动画完成后触发首屏入场
 * 时序由 loader.js 派发的 loader:done 事件驱动
 */
function initRevealAfterLoader() {
    const firstSection = document.querySelector('.fp-section');

    const reveal = () => {
        if (firstSection) {
            animateSectionElements(firstSection);
        }
        // 顶栏随入场淡入
        document.querySelector('.topbar')?.classList.add('is-visible');
    };

    // 若加载动画缺失（如调试禁用），直接入场
    if (!document.getElementById('loader')) {
        reveal();
        return;
    }

    document.addEventListener('loader:done', reveal, { once: true });
}

/**
 * Section元素动画：逐个渐显
 */
function animateSectionElements(section) {
    const elements = section.querySelectorAll('.animate-on-scroll');

    elements.forEach((el, index) => {
        // 重置动画状态
        el.classList.remove('is-visible');

        // 延迟触发动画
        setTimeout(() => {
            el.classList.add('is-visible');
        }, index * 110 + 120);
    });
}

/**
 * 初始化愚人节弹窗
 */
function initAprilFools() {
    // 从URL参数获取概率设置
    const getUrlParam = (name) => {
        const params = new URLSearchParams(window.location.search);
        return params.get(name);
    };

    const urlProbability = getUrlParam('aprilFoolsProbability');
    if (urlProbability !== null) {
        localStorage.setItem('aprilFoolsProbability', urlProbability);
        const cleanUrl = window.location.pathname + window.location.hash;
        window.history.replaceState({}, document.title, cleanUrl);
    }

    // 愚人节配置
    const aprilFoolsConfig = {
        targetDate: '04-01',
        probability: parseFloat(localStorage.getItem('aprilFoolsProbability')) || 40,
        originalUrl: 'https://ys-api.mihoyo.com/event/download_porter/link/ys_cn/official/pc_backup316',
        isActive: false
    };

    // 检查是否是愚人节
    const checkAprilFools = () => {
        const today = new Date();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const todayMD = `${month}-${day}`;

        if (todayMD === aprilFoolsConfig.targetDate) {
            aprilFoolsConfig.isActive = true;
        }
    };

    checkAprilFools();

    // 弹窗控制（强制选择：仅提供两个按钮，无遮罩关闭）
    const modal = document.getElementById('aprilFoolsModal');
    const yesBtn = document.getElementById('aprilFoolsYes');
    const noBtn = document.getElementById('aprilFoolsNo');
    let pendingUrl = null;

    const showModal = (url) => {
        pendingUrl = url;
        modal.style.display = 'flex';

        // 强制重绘以触发过渡动画
        modal.offsetHeight;

        requestAnimationFrame(() => {
            modal.classList.add('show');
        });
    };

    const hideModal = () => {
        modal.classList.remove('show');

        setTimeout(() => {
            modal.style.display = 'none';
            pendingUrl = null;
        }, 300);
    };

    // 按钮事件（同级等权重）
    if (yesBtn) {
        yesBtn.addEventListener('click', () => {
            if (pendingUrl) {
                window.location.href = pendingUrl;
            }
            hideModal();
        });
    }

    if (noBtn) {
        noBtn.addEventListener('click', hideModal);
    }

    // 下载按钮点击事件
    const downloadButtons = document.querySelectorAll('.download-card');
    downloadButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (!aprilFoolsConfig.isActive) return;

            const url = btn.getAttribute('href');
            if (!url || url.startsWith('#')) return;

            e.preventDefault();

            const random = Math.random() * 100;
            if (random < aprilFoolsConfig.probability) {
                showModal(aprilFoolsConfig.originalUrl);
            } else {
                window.location.href = url;
            }
        });
    });

    // 导出配置到全局
    window.aprilFoolsConfig = aprilFoolsConfig;
}

/**
 * 初始化视差效果
 */
function initParallax() {
    const heroBg = document.querySelector('.hero-bg-image');
    if (!heroBg) return;

    let ticking = false;

    const updateParallax = () => {
        const scrolled = window.pageYOffset;
        const rate = scrolled * 0.3;

        if (heroBg) {
            heroBg.style.transform = `scale(1.06) translateY(${rate * 0.1}px)`;
        }

        ticking = false;
    };

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(updateParallax);
            ticking = true;
        }
    }, { passive: true });
}

/**
 * 工具函数：节流
 */
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * 工具函数：防抖
 */
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

// 导出工具函数到全局
window.utils = {
    throttle,
    debounce
};
