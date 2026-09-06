/**
 * I18N - 文案与代码分离
 * 所有用户可见文案集中于此配置，HTML 通过 data-i18n 键引用。
 * 支持 zh-CN / en-US，语言偏好持久化于 localStorage。
 */

(function () {
    'use strict';

    var DICT = {
        'zh-CN': {
            'meta.title': 'Simple NAVY - 单机海战游戏',

            'topbar.brandSub': '单机海战游戏',
            'nav.home': '首页',
            'nav.intro': '关于',
            'nav.unlock': '进度',
            'nav.features': '玩法',
            'nav.requirements': '配置',
            'nav.footer': '联系',

            'loader.status': '正在同步协议资源',
            'loader.line': 'SYSTEM BOOT // 协议链路已建立',

            'hero.kicker': 'SINGLE-PLAYER NAVAL WARFARE // 无需联网',
            'hero.subtitle': '单机海战游戏',
            'hero.description': '真正的单机海战体验，无需联网，永不关服',
            'hero.qq': 'QQ群下载',
            'hero.baidu': '百度网盘',
            'hero.scroll': '向下滚动',
            'hero.readout1': '坐标 // TALOS-II 南纬海域',
            'hero.readout2': '运营状态 // 持续更新',
            'hero.vertical': 'SIMPLE NAVY // NAVAL WARFARE',

            'intro.title': '关于游戏',
            'intro.tag': '// ABOUT',
            'intro.p1': 'Simple NAVY 是一款轻度肝氪的单机海战游戏，由独立开发者倾力打造。开发者体验过众多海战游戏，怀揣着对海战的热爱，决心为玩家带来一款不会因服务器关闭而无法游玩的海战游戏。',
            'intro.p2': '本游戏将陆续更新来自人类海军历史或架空设计的不同类型的舰船，以及丰富多样的玩法，为玩家带来原汁原味的海战体验。',
            'intro.warning': '当前版本存在一些BUG，建议非迫不得已先不要下载试玩，待功能完善后再体验',

            'unlock.title': '100%进度模式',
            'unlock.tag': '// UNLOCK ALL',
            'unlock.desc': '本游戏支持100%进度模式，即解锁全部内容！',
            'unlock.shortcut': '快捷键',
            'unlock.method': '或在主界面左下角菜单 → debug → unlock all asset but not save',
            'unlock.note': '注意：一旦在游戏运行中按下此键，后续获得的资源是不可保存的，除非重启游戏',

            'features.title': '特色玩法',
            'features.tag': '// FEATURES',
            'features.1.title': '单机海战',
            'features.1.desc': '真正的单机游戏，无需联网即可畅玩',
            'features.2.title': '轻度肝氪',
            'features.2.desc': '不肝不氪的轻松玩法，享受纯粹乐趣',
            'features.3.title': '多种舰船',
            'features.3.desc': '来自历史或架空设计的各类舰船',
            'features.4.title': '丰富玩法',
            'features.4.desc': '多样化的游戏玩法，不同海战体验',
            'features.5.title': '深度自定义',
            'features.5.desc': '自定义涂装机制，打造专属战舰',
            'features.6.title': '武器系统',
            'features.6.desc': '轮射、分组、自动化等多种控制',

            'requirements.title': '系统需求',
            'requirements.tag': '// SPECS',
            'requirements.min.badge': '最低配置',
            'requirements.min.title': 'Windows 最低配置',
            'requirements.rec.badge': '推荐配置',
            'requirements.rec.title': 'Windows 推荐配置',
            'req.os': '操作系统',
            'req.cpu': '处理器',
            'req.ram': '内存',
            'req.gpu': '显卡',
            'req.disk': '存储空间',
            'req.dx': 'DirectX',
            'req.min.os': 'Windows 10（64 位）',
            'req.min.cpu': 'AMD Ryzen 5 5600G',
            'req.min.ram': '8 GB',
            'req.min.gpu': 'GTX 1050 Ti',
            'req.min.disk': '5 GB',
            'req.min.dx': '版本 11',
            'req.rec.os': 'Windows 11（64 位）',
            'req.rec.cpu': 'AMD Ryzen 9 7945HX',
            'req.rec.ram': '16 GB',
            'req.rec.gpu': 'RTX 4060',
            'req.rec.disk': '10 GB',
            'req.rec.dx': '版本 11',

            'footer.title': '感谢支持',
            'footer.subtitle': '感谢每一位玩家的支持与陪伴',
            'footer.desc': 'SIMPLE NAVY 将持续更新，为玩家带来更多精彩内容',
            'footer.qq': '加入QQ群',
            'footer.brandSub': '单机海战游戏',
            'footer.dev.label': '开发',
            'footer.dev.value': '彼岸游戏工作室',
            'footer.vendor.label': '供应商',
            'footer.vendor.value': 'luoshaoqing',
            'footer.qqgroup.label': '官方 QQ 群',
            'footer.lang.label': '支持语言',
            'footer.lang.value': 'zh-CN, en-US',
            'footer.rating.label': '适龄分级',
            'footer.rating.value': '12周岁+',
            'footer.version.label': '版本号',
            'footer.version.value': '25.09.21',
            'footer.copy': '© 2026 Simple NAVY.',
            'footer.note': '网页开发与游戏开发非同一人 | 相关信息仅供参考',

            'modal.title': '愚人节玩笑',
            'modal.message': '你被愚人节玩笑选中了，是否下载原神',
            'modal.yes': '是',
            'modal.no': '否'
        },

        'en-US': {
            'meta.title': 'Simple NAVY - Single-player Naval Warfare',

            'topbar.brandSub': 'Single-player Naval Warfare',
            'nav.home': 'Home',
            'nav.intro': 'About',
            'nav.unlock': 'Unlock',
            'nav.features': 'Features',
            'nav.requirements': 'Specs',
            'nav.footer': 'Contact',

            'loader.status': 'SYNCING PROTOCOL ASSETS',
            'loader.line': 'SYSTEM BOOT // LINK ESTABLISHED',

            'hero.kicker': 'SINGLE-PLAYER NAVAL WARFARE // OFFLINE',
            'hero.subtitle': 'Single-player Naval Warfare',
            'hero.description': 'True single-player naval combat. No internet required. Never shuts down.',
            'hero.qq': 'QQ Group',
            'hero.baidu': 'Baidu Netdisk',
            'hero.scroll': 'Scroll',
            'hero.readout1': 'COORD // TALOS-II SOUTHERN SEA',
            'hero.readout2': 'STATUS // ONGOING UPDATES',
            'hero.vertical': 'SIMPLE NAVY // NAVAL WARFARE',

            'intro.title': 'About the Game',
            'intro.tag': '// ABOUT',
            'intro.p1': 'Simple NAVY is a lightly grind-and-spend friendly single-player naval warfare game, crafted by an independent developer. Having played countless naval games, the developer set out with a love for naval combat to bring players a game that will never become unplayable due to server shutdowns.',
            'intro.p2': 'The game will keep adding ships of various types drawn from real naval history or original designs, along with diverse gameplay, delivering an authentic naval warfare experience.',
            'intro.warning': 'The current version contains some bugs. We suggest waiting for a more polished release before downloading.',

            'unlock.title': '100% Progress Mode',
            'unlock.tag': '// UNLOCK ALL',
            'unlock.desc': 'This game supports 100% progress mode — unlock all content!',
            'unlock.shortcut': 'Hotkey',
            'unlock.method': 'Or via main menu (bottom-left) → debug → unlock all asset but not save',
            'unlock.note': 'Note: If pressed while the game is running, resources gained afterwards cannot be saved unless you restart the game.',

            'features.title': 'Features',
            'features.tag': '// FEATURES',
            'features.1.title': 'Offline Combat',
            'features.1.desc': 'A true single-player game — play without any connection',
            'features.2.title': 'Light Grind',
            'features.2.desc': 'Relaxed pacing, enjoy the pure fun of naval battle',
            'features.3.title': 'Various Ships',
            'features.3.desc': 'Ships from naval history or original designs',
            'features.4.title': 'Rich Gameplay',
            'features.4.desc': 'Diverse mechanics for different naval experiences',
            'features.5.title': 'Deep Customization',
            'features.5.desc': 'Custom paint schemes to build your own warship',
            'features.6.title': 'Weapon System',
            'features.6.desc': 'Broadside fire, grouping, automation and more',

            'requirements.title': 'System Requirements',
            'requirements.tag': '// SPECS',
            'requirements.min.badge': 'Minimum',
            'requirements.min.title': 'Windows Minimum',
            'requirements.rec.badge': 'Recommended',
            'requirements.rec.title': 'Windows Recommended',
            'req.os': 'OS',
            'req.cpu': 'Processor',
            'req.ram': 'Memory',
            'req.gpu': 'Graphics',
            'req.disk': 'Storage',
            'req.dx': 'DirectX',
            'req.min.os': 'Windows 10 (64-bit)',
            'req.min.cpu': 'AMD Ryzen 5 5600G',
            'req.min.ram': '8 GB',
            'req.min.gpu': 'GTX 1050 Ti',
            'req.min.disk': '5 GB',
            'req.min.dx': 'Version 11',
            'req.rec.os': 'Windows 11 (64-bit)',
            'req.rec.cpu': 'AMD Ryzen 9 7945HX',
            'req.rec.ram': '16 GB',
            'req.rec.gpu': 'RTX 4060',
            'req.rec.disk': '10 GB',
            'req.rec.dx': 'Version 11',

            'footer.title': 'Thank You',
            'footer.subtitle': 'Thanks to every player for the support and company',
            'footer.desc': 'SIMPLE NAVY keeps updating to bring more exciting content',
            'footer.qq': 'Join QQ Group',
            'footer.brandSub': 'Single-player Naval Warfare',
            'footer.dev.label': 'Developer',
            'footer.dev.value': 'OtherShore Game Studio',
            'footer.vendor.label': 'Vendor',
            'footer.vendor.value': 'luoshaoqing',
            'footer.qqgroup.label': 'Official QQ Group',
            'footer.lang.label': 'Languages',
            'footer.lang.value': 'zh-CN, en-US',
            'footer.rating.label': 'Age Rating',
            'footer.rating.value': '12+',
            'footer.version.label': 'Version',
            'footer.version.value': '25.09.21',
            'footer.copy': '© 2026 Simple NAVY.',
            'footer.note': 'Web dev and game dev are different people | For reference only',

            'modal.title': 'April Fools',
            'modal.message': 'You have been selected by an April Fools prank. Download Genshin Impact?',
            'modal.yes': 'Yes',
            'modal.no': 'No'
        }
    };

    var STORAGE_KEY = 'simplenavy-lang';

    /** 取当前语言（localStorage > 浏览器语言 > 默认中文） */
    function getLang() {
        var saved = null;
        try {
            saved = localStorage.getItem(STORAGE_KEY);
        } catch (e) { /* 隐私模式下忽略 */ }
        if (saved && DICT[saved]) return saved;
        var nav = (navigator.language || 'zh-CN');
        return DICT[nav] ? nav : (nav.toLowerCase().indexOf('zh') === 0 ? 'zh-CN' : 'en-US');
    }

    /** 取词条，缺失时回落中文 */
    function t(lang, key) {
        return (DICT[lang] && DICT[lang][key]) || (DICT['zh-CN'][key] || key);
    }

    /** 将词条应用到所有 [data-i18n] 节点，并更新 <html lang> 与标题 */
    function apply(lang) {
        document.documentElement.lang = lang;
        document.title = t(lang, 'meta.title');

        document.querySelectorAll('[data-i18n]').forEach(function (el) {
            var key = el.getAttribute('data-i18n');
            var text = t(lang, key);
            if (text) el.textContent = text;
        });

        /* 语言按钮激活态 */
        document.querySelectorAll('.lang-btn').forEach(function (btn) {
            btn.classList.toggle('active', btn.dataset.lang === lang);
        });

        try {
            localStorage.setItem(STORAGE_KEY, lang);
        } catch (e) { /* 忽略 */ }

        document.dispatchEvent(new CustomEvent('i18n:applied', { detail: { lang: lang } }));
    }

    /* 暴露给 main.js：初始化与切换 */
    window.I18N = {
        apply: apply,
        getLang: getLang,
        t: function (key) { return t(getLang(), key); }
    };
})();
