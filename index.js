// 移动端菜单功能
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const mobileNav = document.querySelector('.mobile-nav');
const mobileNavOverlay = document.querySelector('.mobile-nav-overlay');
const body = document.body;

function toggleMobileMenu() {
    mobileMenuBtn.classList.toggle('active');
    mobileNav.classList.toggle('active');
    mobileNavOverlay.classList.toggle('active');
    body.style.overflow = body.style.overflow === 'hidden' ? '' : 'hidden';
}

mobileMenuBtn.addEventListener('click', toggleMobileMenu);
mobileNavOverlay.addEventListener('click', toggleMobileMenu);

// 点击移动菜单中的链接后关闭菜单
const mobileNavLinks = document.querySelectorAll('.mobile-nav a');
mobileNavLinks.forEach(link => {
    link.addEventListener('click', toggleMobileMenu);
});

// 平滑滚动到锚点
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// 开发日志折叠/展开功能
const logToggleBtn = document.getElementById('logToggleBtn');
const hiddenLogs = document.querySelectorAll('.dev-log.hidden');
let logsVisible = false;

logToggleBtn.addEventListener('click', function() {
    logsVisible = !logsVisible;
    
    // 切换日志显示状态
    hiddenLogs.forEach(log => {
        log.classList.toggle('hidden', !logsVisible);
    });
    
    // 更新按钮文本和图标
    if (logsVisible) {
        logToggleBtn.innerHTML = '<i class="fas fa-minus"></i> 收起';
    } else {
        logToggleBtn.innerHTML = '<i class="fas fa-plus"></i> 查看全部';
    }
});