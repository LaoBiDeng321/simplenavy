/**
 * Simple NAVY - Main JavaScript
 * 主应用逻辑
 */

document.addEventListener('DOMContentLoaded', () => {
    // 初始化全屏滚动
    initFullPage();
    
    // 初始化愚人节弹窗
    initAprilFools();
    
    // 初始化视差效果
    initParallax();
    
    // 初始化滚动动画
    initScrollAnimations();
});

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
        
        // 触发当前section的动画
        animateSectionElements(currentSection);
    });
    
    // 初始动画
    setTimeout(() => {
        const firstSection = document.querySelector('.fp-section');
        if (firstSection) {
            animateSectionElements(firstSection);
        }
    }, 300);
    
    // 保存实例到全局
    window.fullpage = fp;
}

/**
 * Section元素动画
 */
function animateSectionElements(section) {
    const elements = section.querySelectorAll('.animate-on-scroll');
    
    elements.forEach((el, index) => {
        // 重置动画状态
        el.classList.remove('is-visible');
        
        // 延迟触发动画
        setTimeout(() => {
            el.classList.add('is-visible');
        }, index * 100 + 200);
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
    
    // 弹窗控制
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
    
    // 按钮事件
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
    
    // 点击遮罩关闭
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            hideModal();
        }
    });
    
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
            heroBg.style.transform = `scale(1.1) translateY(${rate * 0.1}px)`;
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
 * 初始化滚动动画
 */
function initScrollAnimations() {
    // 使用 Intersection Observer 监听元素进入视口
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -10% 0px',
        threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
            }
        });
    }, observerOptions);
    
    // 观察所有需要动画的元素
    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        observer.observe(el);
    });
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

/**
 * 平滑滚动到指定元素
 */
function scrollToElement(element, offset = 0) {
    const targetPosition = element.getBoundingClientRect().top + window.pageYOffset - offset;
    
    window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
    });
}

/**
 * 检测元素是否在视口内
 */
function isInViewport(element, threshold = 0) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= -threshold &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) + threshold &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// 导出工具函数到全局
window.utils = {
    throttle,
    debounce,
    scrollToElement,
    isInViewport
};
