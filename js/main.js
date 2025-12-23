// 主入口文件 - 整合所有功能模块

// 导入各功能模块
import './smooth-scroll.js';
import './back-to-top.js';
import './christmas.js';
import './page-navigation.js';

// 导航栏滚动效果
document.addEventListener('DOMContentLoaded', function() {
    const header = document.querySelector('header');
    let lastScrollTop = 0;
    
    // 下载区域滚轮交互
    const downloadContainer = document.querySelector('.download-container-horizontal');
    let isInDownloadArea = false;

    // 返回顶部功能
    function handleScroll() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // 控制返回顶部按钮显示/隐藏
        const backToTopBtn = document.getElementById('backToTop');
        if (backToTopBtn) {
            if (scrollTop > 300) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        }
        
        // 导航栏滚动效果
        if (scrollTop > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        lastScrollTop = scrollTop;
    }

    // 下载区域滚轮交互功能
    function handleDownloadWheel(e) {
        if (!isInDownloadArea) return;
        
        e.preventDefault();
        
        const delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
        const scrollAmount = 300; // 每次滚动的距离
        
        // 获取当前滚动位置和最大滚动范围
        const currentScroll = downloadContainer.scrollLeft;
        const maxScroll = downloadContainer.scrollWidth - downloadContainer.clientWidth;
        
        // 检查是否在边界
        const isAtLeftEdge = currentScroll <= 0;
        const isAtRightEdge = currentScroll >= maxScroll;
        
        // 优先水平滚动
        if ((delta > 0 && !isAtLeftEdge) || (delta < 0 && !isAtRightEdge)) {
            // 水平滚动
            const newScrollLeft = currentScroll - (delta * scrollAmount);
            downloadContainer.scrollTo({
                left: newScrollLeft,
                behavior: 'smooth'
            });
        } else {
            // 到达边界后垂直滚动
            window.scrollBy({
                top: delta * scrollAmount,
                behavior: 'smooth'
            });
        }
    }

    // 鼠标进入/离开下载区域
    function handleMouseEnter() {
        isInDownloadArea = true;
    }

    function handleMouseLeave() {
        isInDownloadArea = false;
    }

    // 添加事件监听
    window.addEventListener('scroll', handleScroll);
    
    // 下载区域事件监听
    if (downloadContainer) {
        downloadContainer.addEventListener('wheel', handleDownloadWheel, { passive: false });
        downloadContainer.addEventListener('mouseenter', handleMouseEnter);
        downloadContainer.addEventListener('mouseleave', handleMouseLeave);
    }
});