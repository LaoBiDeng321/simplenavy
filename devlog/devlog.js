// 开发日志子站点专用JavaScript功能

document.addEventListener('DOMContentLoaded', function() {
    // 初始化模态框
    initModal();
    
    // 初始化滚动效果
    initScrollEffects();
    
    // 初始化卡片动画
    initCardAnimations();
    
    // 初始化视频功能
    initVideoFunctionality();
    
    // 初始化内容展开/收起功能
    initExpandContent();
});

// 内容展开/收起功能
function initExpandContent() {
    const devlogContents = document.querySelectorAll('.devlog-content');
    
    devlogContents.forEach(content => {
        // 检查内容是否需要展开功能（超过三行）
        const lineHeight = parseInt(window.getComputedStyle(content).lineHeight);
        const maxHeight = parseInt(window.getComputedStyle(content).maxHeight);
        const actualHeight = content.scrollHeight;
        
        if (actualHeight > maxHeight) {
            // 创建展开按钮
            const expandBtn = document.createElement('button');
            expandBtn.className = 'expand-btn collapsed';
            expandBtn.textContent = '展开';
            expandBtn.setAttribute('aria-expanded', 'false');
            
            // 添加点击事件
            expandBtn.addEventListener('click', function() {
                const isExpanded = content.classList.contains('expanded');
                
                if (isExpanded) {
                    // 收起
                    content.classList.remove('expanded');
                    expandBtn.classList.add('collapsed');
                    expandBtn.textContent = '展开';
                    expandBtn.setAttribute('aria-expanded', 'false');
                } else {
                    // 展开
                    content.classList.add('expanded');
                    expandBtn.classList.remove('collapsed');
                    expandBtn.textContent = '收起';
                    expandBtn.setAttribute('aria-expanded', 'true');
                }
            });
            
            // 插入按钮到内容后面
            content.parentNode.insertBefore(expandBtn, content.nextSibling);
        }
    });
}

// 模态框功能
function initModal() {
    const modal = document.getElementById('videoModal');
    const closeBtn = document.querySelector('.close');
    const videoPlayer = document.getElementById('videoPlayer');
    
    // 点击关闭按钮
    closeBtn.addEventListener('click', function() {
        closeModal();
    });
    
    // 点击模态框外部关闭
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // ESC键关闭
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
    
    function closeModal() {
        modal.style.display = 'none';
        // 停止视频播放
        videoPlayer.src = '';
    }
}

// 滚动效果
function initScrollEffects() {
    let lastScrollTop = 0;
    const header = document.querySelector('.devlog-header');
    
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // 头部滚动效果
        if (scrollTop > 100) {
            header.style.background = 'rgba(17, 34, 64, 0.95)';
            header.style.backdropFilter = 'blur(10px)';
        } else {
            header.style.background = 'linear-gradient(135deg, var(--primary) 0%, rgba(17, 34, 64, 0.9) 100%)';
            header.style.backdropFilter = 'none';
        }
        
        lastScrollTop = scrollTop;
    });
}

// 卡片动画
function initCardAnimations() {
    const cards = document.querySelectorAll('.devlog-card');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
}

// 视频播放功能
function initVideoFunctionality() {
    // 为所有视频占位符添加点击事件
    const videoPlaceholders = document.querySelectorAll('.video-placeholder');
    
    videoPlaceholders.forEach(placeholder => {
        // 添加悬停效果
        placeholder.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.02)';
            this.style.boxShadow = '0 8px 25px rgba(100, 255, 218, 0.3)';
        });
        
        placeholder.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
            this.style.boxShadow = 'none';
        });
        
        // 添加键盘支持
        placeholder.setAttribute('tabindex', '0');
        placeholder.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const onclickAttr = this.getAttribute('onclick');
                if (onclickAttr) {
                    // 执行onclick函数
                    eval(onclickAttr);
                }
            }
        });
    });
}

// 播放视频函数 - 在原位置播放
function playVideo(logNumber, videoUrl) {
    // 找到对应的视频占位符
    const videoPlaceholder = document.querySelector(`[onclick*="playVideo('${logNumber}'"]`) || 
                           document.querySelector(`[onclick*="playVideo('${logNumber}',"]`);
    
    if (!videoPlaceholder) {
        console.error(`未找到开发日志 #${logNumber} 的视频占位符`);
        return;
    }
    
    // 获取视频容器
    const videoContainer = videoPlaceholder.closest('.devlog-video');
    if (!videoContainer) {
        console.error(`未找到开发日志 #${logNumber} 的视频容器`);
        return;
    }
    
    // 创建iframe元素
    const iframe = document.createElement('iframe');
    iframe.src = videoUrl;
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    iframe.style.borderRadius = '12px';
    iframe.style.display = 'block';
    iframe.style.margin = '0 auto';
    iframe.allowFullscreen = true;
    
    // 清空容器并添加iframe
    videoContainer.innerHTML = '';
    videoContainer.appendChild(iframe);
    
    // 调整容器样式以适应视频比例 (16:9)
    videoContainer.style.height = '360px';
    videoContainer.style.aspectRatio = '16 / 9';
    videoContainer.style.maxWidth = '100%';
    videoContainer.style.margin = '20px auto'; // 居中对齐
    videoContainer.style.display = 'block';
    
    // 记录视频播放事件（可用于分析）
    console.log(`播放开发日志 #${logNumber} 视频`);
    
    // 发送分析事件（如果有分析工具）
    if (typeof gtag !== 'undefined') {
        gtag('event', 'video_play', {
            'event_category': 'devlog',
            'event_label': `devlog_${logNumber}`
        });
    }
}

// 分享功能
function shareDevlog(logNumber, title) {
    const shareData = {
        title: `Simple NAVY - 开发日志 #${logNumber}`,
        text: title,
        url: window.location.href + `#devlog-${logNumber}`
    };
    
    if (navigator.share) {
        navigator.share(shareData)
            .then(() => console.log('分享成功'))
            .catch((error) => console.log('分享失败:', error));
    } else {
        // 备用分享方式
        const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareData.url)}`;
        window.open(shareUrl, '_blank');
    }
}

// 搜索功能（未来扩展）
function searchDevlogs(query) {
    const cards = document.querySelectorAll('.devlog-card');
    let found = false;
    
    cards.forEach(card => {
        const content = card.textContent.toLowerCase();
        if (content.includes(query.toLowerCase())) {
            card.style.display = 'block';
            found = true;
            
            // 滚动到第一个匹配的卡片
            if (!found) {
                card.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        } else {
            card.style.display = 'none';
        }
    });
    
    return found;
}

// 过滤功能（未来扩展）
function filterDevlogs(criteria) {
    const cards = document.querySelectorAll('.devlog-card');
    
    cards.forEach(card => {
        const logNumber = card.querySelector('.devlog-number').textContent;
        // 根据条件显示/隐藏卡片
        // 这里可以根据需要扩展过滤逻辑
        card.style.display = 'block';
    });
}

// 导出功能（用于其他脚本）
window.DevlogManager = {
    playVideo,
    shareDevlog,
    searchDevlogs,
    filterDevlogs
};

// 性能优化：延迟加载非关键资源
function lazyLoadResources() {
    // 延迟加载图片
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.getAttribute('data-src');
                img.removeAttribute('data-src');
                observer.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// 初始化延迟加载
lazyLoadResources();

// 回到顶部功能
function initBackToTop() {
    const backToTopButton = document.getElementById('backToTop');
    
    if (!backToTopButton) {
        console.error('未找到回到顶部按钮');
        return;
    }
    
    // 监听滚动事件
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // 当滚动超过300px时显示按钮
        if (scrollTop > 300) {
            backToTopButton.classList.add('show');
        } else {
            backToTopButton.classList.remove('show');
        }
    });
    
    // 点击回到顶部
    backToTopButton.addEventListener('click', function() {
        // 平滑滚动到顶部
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        
        // 添加点击动画效果
        this.style.transform = 'scale(0.9)';
        setTimeout(() => {
            this.style.transform = 'scale(1)';
        }, 150);
    });
    
    // 键盘支持（按Home键回到顶部）
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Home') {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    });
}

// 初始化回到顶部功能
initBackToTop();