/**
 * OtherShoreGameStudio - I18N 文案与代码分离
 * 子页独立字典，语言偏好与主站共享同一 STORAGE_KEY（simplenavy-lang）。
 * HTML 通过 data-i18n 键引用，支持 zh-CN / en-US。
 */

(function () {
    'use strict';

    var DICT = {
        'zh-CN': {
            'oss.meta.title': '彼岸游戏工作室 - Other Shore Game Studio',

            'oss.nav.home': '返回首页',

            'oss.loader.status': '正在启动工作室系统',

            'oss.hero.kicker': '// INDEPENDENT GAME STUDIO',
            'oss.hero.subtitle': '彼岸游戏工作室',
            'oss.hero.cta.works': '查看作品',
            'oss.hero.cta.about': '了解更多',
            'oss.hero.readout': '坐标 // 彼岸 · 独立开发中',
            'oss.hero.scroll': 'SCROLL',

            'oss.about.title': '工作室简介',
            'oss.about.tag': '// ABOUT',
            'oss.about.p1': 'OtherShoreGameStudio（彼岸游戏工作室）是一个专注于独立游戏开发的工作室。我们致力于打造优质的单机游戏体验，让玩家无需担心服务器关闭而无法游玩。',
            'oss.about.p2': '我们的团队虽然规模不大，但充满热情与创意。我们相信，好的游戏应该经得起时间的考验。',
            'oss.about.stat1': '款在研游戏',
            'oss.about.stat2': '位核心成员',
            'oss.about.stat3': '创意可能',
            'oss.about.logo.placeholder': '工作室 LOGO 区域',

            'oss.team.title': '核心团队',
            'oss.team.tag': '// TEAM',
            'oss.team.role1': '总负责人',
            'oss.team.role2': '开发负责人',
            'oss.team.role3': '网页开发',

            'oss.games.title': '游戏作品',
            'oss.games.tag': '// GAMES',
            'oss.games.status': '测试中',
            'oss.games.desc': '一款轻度肝氪的单机海战游戏，100%进度模式，带给你原汁原味的海战体验。',
            'oss.games.notice': '更多游戏作品即将上线，敬请期待！',

            'oss.news.title': '新闻动态',
            'oss.news.tag': '// NEWS',
            'oss.news.1.title': '工作室成立',
            'oss.news.1.desc': 'OtherShoreGameStudio 正式成立',
            'oss.news.2.title': '首个游戏项目启动',
            'oss.news.2.desc': '团队正式启动首个游戏项目的开发工作',
            'oss.news.3.title': '官方网站上线',
            'oss.news.3.desc': '工作室官方网站正式上线',

            'oss.contact.title': '联系我们',
            'oss.contact.tag': '// CONTACT',
            'oss.contact.qq': 'QQ交流群',
            'oss.contact.bili1': 'B站 - 总负责人',
            'oss.contact.bili2': 'B站 - 开发负责人',
            'oss.contact.bili3': 'B站 - 网页开发',
            'oss.contact.github': 'GitHub - 网页',

            'oss.footer.sub': '彼岸游戏工作室',
            'oss.footer.copy': '© 2026 OtherShoreGameStudio. All rights reserved.'
        },

        'en-US': {
            'oss.meta.title': 'Other Shore Game Studio',

            'oss.loader.status': 'BOOTING STUDIO SYSTEM',

            'oss.nav.home': 'Back to Home',

            'oss.hero.kicker': '// INDEPENDENT GAME STUDIO',
            'oss.hero.subtitle': 'Other Shore Game Studio',
            'oss.hero.cta.works': 'Our Games',
            'oss.hero.cta.about': 'Learn More',
            'oss.hero.readout': 'COORD // OTHER SHORE · IN DEVELOPMENT',
            'oss.hero.scroll': 'SCROLL',

            'oss.about.title': 'About the Studio',
            'oss.about.tag': '// ABOUT',
            'oss.about.p1': 'OtherShoreGameStudio is an independent game studio. We are dedicated to crafting quality single-player experiences, so players never have to worry about server shutdowns.',
            'oss.about.p2': 'Our team may be small, but it is full of passion and creativity. We believe good games should stand the test of time.',
            'oss.about.stat1': 'Game in Development',
            'oss.about.stat2': 'Core Members',
            'oss.about.stat3': 'Creative Possibilities',
            'oss.about.logo.placeholder': 'STUDIO LOGO AREA',

            'oss.team.title': 'Core Team',
            'oss.team.tag': '// TEAM',
            'oss.team.role1': 'Project Lead',
            'oss.team.role2': 'Dev Lead',
            'oss.team.role3': 'Web Developer',

            'oss.games.title': 'Our Games',
            'oss.games.tag': '// GAMES',
            'oss.games.status': 'IN TESTING',
            'oss.games.desc': 'A lightly grind-and-spend friendly single-player naval warfare game with 100% progress mode for an authentic naval combat experience.',
            'oss.games.notice': 'More games are on the way. Stay tuned!',

            'oss.news.title': 'News',
            'oss.news.tag': '// NEWS',
            'oss.news.1.title': 'Studio Founded',
            'oss.news.1.desc': 'OtherShoreGameStudio officially established',
            'oss.news.2.title': 'First Game Project Started',
            'oss.news.2.desc': 'The team officially started development of its first game project',
            'oss.news.3.title': 'Website Launched',
            'oss.news.3.desc': 'The studio official website went live',

            'oss.contact.title': 'Contact Us',
            'oss.contact.tag': '// CONTACT',
            'oss.contact.qq': 'QQ Group',
            'oss.contact.bili1': 'Bilibili - Lead',
            'oss.contact.bili2': 'Bilibili - Dev Lead',
            'oss.contact.bili3': 'Bilibili - Web Dev',
            'oss.contact.github': 'GitHub - Web',

            'oss.footer.sub': 'Other Shore Game Studio',
            'oss.footer.copy': '© 2026 OtherShoreGameStudio. All rights reserved.'
        }
    };

    /* 与主站共享语言偏好 */
    var STORAGE_KEY = 'simplenavy-lang';

    function getLang() {
        var saved = null;
        try {
            saved = localStorage.getItem(STORAGE_KEY);
        } catch (e) { /* 隐私模式下忽略 */ }
        if (saved && DICT[saved]) return saved;
        var nav = (navigator.language || 'zh-CN');
        return DICT[nav] ? nav : (nav.toLowerCase().indexOf('zh') === 0 ? 'zh-CN' : 'en-US');
    }

    function t(lang, key) {
        return (DICT[lang] && DICT[lang][key]) || (DICT['zh-CN'][key] || key);
    }

    function apply(lang) {
        document.documentElement.lang = lang;
        document.title = t(lang, 'oss.meta.title');

        document.querySelectorAll('[data-i18n]').forEach(function (el) {
            var key = el.getAttribute('data-i18n');
            var text = t(lang, key);
            if (text) el.textContent = text;
        });

        /* aria-label 国际化（不可见文案同样不硬编码） */
        document.querySelectorAll('[data-i18n-aria]').forEach(function (el) {
            var key = el.getAttribute('data-i18n-aria');
            var text = t(lang, key);
            if (text) el.setAttribute('aria-label', text);
        });

        /* 语言按钮激活态 */
        document.querySelectorAll('.lang-btn').forEach(function (btn) {
            btn.classList.toggle('active', btn.dataset.lang === lang);
        });

        try {
            localStorage.setItem(STORAGE_KEY, lang);
        } catch (e) { /* 忽略 */ }
    }

    /* 初始化 + 语言切换绑定 */
    apply(getLang());

    document.querySelectorAll('.lang-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
            apply(btn.dataset.lang);
        });
    });
})();
