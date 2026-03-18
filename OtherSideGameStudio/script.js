(function() {
    const themeToggle = document.getElementById('themeToggle');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.querySelector('.nav-links');
    const contactForm = document.getElementById('contactForm');
    const header = document.querySelector('.header');

    function initTheme() {
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
        }
    }

    function toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    }

    function toggleMobileMenu() {
        mobileMenuBtn.classList.toggle('active');
        navLinks.classList.toggle('active');
    }

    function closeMobileMenu() {
        mobileMenuBtn.classList.remove('active');
        navLinks.classList.remove('active');
    }

    function handleNavScroll() {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }

    function handleNavActive() {
        const sections = document.querySelectorAll('section[id]');
        const scrollPos = window.scrollY + 100;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                document.querySelectorAll('.nav-links a').forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === '#' + sectionId) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    function smoothScrollTo(target) {
        const element = document.querySelector(target);
        if (element) {
            const headerHeight = header.offsetHeight;
            const elementPosition = element.offsetTop - headerHeight;
            
            window.scrollTo({
                top: elementPosition,
                behavior: 'smooth'
            });
        }
    }

    function initNavLinks() {
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                
                if (href.startsWith('#')) {
                    e.preventDefault();
                    smoothScrollTo(href);
                    closeMobileMenu();
                }
            });
        });
    }

    function handleFormSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(contactForm);
        const type = formData.get('type');
        const name = formData.get('name');
        const email = formData.get('email');
        const message = formData.get('message');
        
        let targetEmail = '3097914916@qq.com';
        if (type === '游戏') {
            targetEmail = ''; // 待添加
        }
        
        const subject = type === '游戏' 
            ? `游戏留言 - ${encodeURIComponent(name)}` 
            : `网站留言 - ${encodeURIComponent(name)}`;
        
        const body = `姓名: ${name}\n邮箱: ${email}\n\n留言内容:\n${message}`;
        
        const mailtoLink = `mailto:${targetEmail}?subject=${subject}&body=${encodeURIComponent(body)}`;
        
        window.location.href = mailtoLink;
        
        alert('感谢您的留言！我们将尽快回复您。');
        contactForm.reset();
    }

    function init() {
        initTheme();
        initNavLinks();

        themeToggle.addEventListener('click', toggleTheme);
        
        mobileMenuBtn.addEventListener('click', toggleMobileMenu);

        if (contactForm) {
            contactForm.addEventListener('submit', handleFormSubmit);
        }

        window.addEventListener('scroll', function() {
            handleNavScroll();
            handleNavActive();
        }, { passive: true });

        window.addEventListener('resize', function() {
            if (window.innerWidth > 768) {
                closeMobileMenu();
            }
        }, { passive: true });

        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                if (href !== '#') {
                    e.preventDefault();
                    smoothScrollTo(href);
                }
            });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
