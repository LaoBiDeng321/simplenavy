// 页面板块导航功能 - 启用自然平滑滚动
(function() {
    // 获取所有板块元素，按照在页面中出现的顺序
    const sections = [
        document.getElementById('top'),
        document.getElementById('game-intro'),
        document.getElementById('download'),
        document.getElementById('devlog'),
        document.getElementById('about'),
        document.getElementById('sponsor')
    ].filter(Boolean); // 过滤掉可能不存在的元素
    
    // 启用自然平滑滚动，不阻止默认滚动行为
    window.addEventListener('wheel', function(e) {
        // 允许浏览器处理默认的平滑滚动
        // 不阻止默认行为，让滚动自然进行
    }, { passive: true });
    
    // 移动端：启用自然触摸滚动
    window.addEventListener('touchstart', function(e) {
        // 允许浏览器处理默认的触摸滚动
    }, { passive: true });
    
    window.addEventListener('touchend', function(e) {
        // 允许浏览器处理默认的触摸滚动
    }, { passive: true });
})();