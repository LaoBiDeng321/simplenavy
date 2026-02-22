// 主应用逻辑

// 安全的HTML设置函数
function setHTML(element, html) {
    if (element) {
        element.innerHTML = html;
    }
}

const App = {
    // 当前选中的赞助方式和金额
    selectedMethod: null,
    selectedAmount: null,
    
    // 页面加载状态
    pageLoaded: {
        download: false,
        sponsor: false,
        sponsors: false
    },

    // 初始化
    init() {
        this.bindEvents();
        // 只加载默认页面（游戏下载页面）
        this.loadDownloadPage();
    },

    // 绑定事件
    bindEvents() {
        // 导航切换
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.dataset.page;
                this.switchPage(page);
            });
        });
    },

    // 切换页面
    switchPage(pageName) {
        // 更新导航状态
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.dataset.page === pageName) {
                link.classList.add('active');
            }
        });

        // 切换页面显示
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        document.getElementById(pageName).classList.add('active');

        // 按需加载页面数据
        this.loadPageData(pageName);

        // 更新URL hash
        window.location.hash = pageName;
    },
    
    // 按需加载页面数据
    loadPageData(pageName) {
        if (!this.pageLoaded[pageName]) {
            switch (pageName) {
                case 'download':
                    this.loadDownloadPage();
                    break;
                case 'sponsor':
                    this.loadSponsorPage();
                    break;
                case 'sponsors':
                    this.loadSponsorsPage();
                    break;
            }
            this.pageLoaded[pageName] = true;
        }
    },

    // 加载游戏下载页面
    async loadDownloadPage() {
        try {
            // 获取游戏信息
            const gameInfoRes = await API.getGameInfo();
            const gameInfoEl = document.getElementById('gameInfo');

            if (gameInfoRes.success && gameInfoRes.data) {
                const game = gameInfoRes.data;
                // 确保中英文描述之间有换行
                let descriptionWithBreak = game.description;
                // 检查是否已经有换行符，如果没有则添加
                if (!descriptionWithBreak.includes('<br>')) {
                    descriptionWithBreak = descriptionWithBreak.replace(/\n/g, '<br>');
                    // 如果没有换行符，尝试根据中英文文本分割
                    if (!descriptionWithBreak.includes('<br>')) {
                        // 查找英文句子结束和中文开始的位置
                        const match = descriptionWithBreak.match(/([^。]+)\s*([^<]+)/);
                        if (match && match.length === 3) {
                            descriptionWithBreak = match[1] + '<br>' + match[2];
                        }
                    }
                }
                setHTML(gameInfoEl, `
                    <div class="game-cover">${game.icon}</div>
                    <div class="game-details">
                        <h1>${game.name}</h1>
                        <div class="game-meta">
                            <span class="version">${game.version}</span>
                        </div>
                        <p class="game-description">${descriptionWithBreak}</p>
                    </div>
                `);
            } else {
                setHTML(gameInfoEl, `<div class="no-data">暂无数据</div>`);
            }

            // 获取下载链接
            const downloadRes = await API.getDownloads();
            const downloadEl = document.getElementById('downloadSection');

            if (downloadRes.success && downloadRes.data && downloadRes.data.length > 0) {
                const downloads = downloadRes.data;
                setHTML(downloadEl, `
                    <h2>选择平台下载</h2>
                    <div class="download-grid">
                        ${downloads.map(item => `
                            <div class="download-card">
                                    <div class="platform">${item.icon} ${item.platform}</div>
                                    <div class="size">${item.platform === '加入QQ交流群' ? item.version : `版本：${item.version}<br>${item.size}`}</div>
                                    <a href="${item.url}" target="_blank" class="download-btn" style="display: block; text-align: center; text-decoration: none;">
                                        ${item.platform === '加入QQ交流群' ? '加入交流群' : '立即下载'}
                                    </a>
                                </div>
                        `).join('')}
                    </div>
                `);
            } else {
                setHTML(downloadEl, `<div class="no-data">暂无数据</div>`);
            }
        } catch (error) {
            console.error('加载下载页面失败:', error);
            setHTML(document.getElementById('gameInfo'), `<div class="no-data">暂无数据</div>`);
            setHTML(document.getElementById('downloadSection'), `<div class="no-data">暂无数据</div>`);
        }
    },

    // 处理下载
    handleDownload(platform) {
        alert(`开始下载 ${platform} 版本...`);
    },

    // 加载赞助页面
    async loadSponsorPage() {
        try {
            // 获取赞助方式
            const methodsRes = await API.getSponsorMethods();
            // 获取赞助金额
            const amountsRes = await API.getSponsorAmounts();

            const sponsorEl = document.getElementById('sponsorContent');

            if (methodsRes.success && amountsRes.success) {
                const methods = methodsRes.data;
                const amounts = amountsRes.data;

                setHTML(sponsorEl, `
                    <div class="sponsor-methods">
                        <h3>选择支付方式</h3>
                        <div class="method-grid">
                            ${methods.map(method => `
                                <div class="method-card" data-method="${method.id}" onclick="App.selectMethod('${method.id}')">
                                    <div class="icon">
                                        ${method.id === 'alipay' ? '<img src="svg/alipay.svg" alt="支付宝" style="width: 32px; height: 32px;">' : ''}
                                        ${method.id === 'wechat' ? '<img src="svg/wechat.svg" alt="微信支付" style="width: 32px; height: 32px;">' : ''}
                                    </div>
                                    <div class="name">${method.name}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    <div class="sponsor-amounts">
                        <h3>选择赞助金额</h3>
                        <div class="amount-grid">
                            ${amounts.map(item => `
                                <div class="amount-card disabled" data-amount="${item.amount}" onclick="App.selectAmount(${item.amount})"><div class="amount">${item.amount}</div>
                                    <div class="unit">${item.unit}</div>
                                </div>
                            `).join('')}
                            <div class="amount-card disabled custom-amount-card">
                                <div class="amount">
                                    <input type="number" id="customAmountInput" class="custom-amount-input" placeholder="请输入金额" min="1" max="100" step="0.01" oninput="App.handleCustomAmountInput(this)" onblur="App.formatCustomAmount(this)">
                                </div>
                                <div class="unit">元/yuan</div>
                                <div class="error-message" id="customAmountError"></div>
                                <div class="success-message" id="customAmountSuccess"></div>
                            </div>
                        </div>
                    </div>
                    <div class="sponsor-action">
                        <button class="sponsor-btn" id="sponsorButton" onclick="App.handleSponsor()" disabled>确认赞助</button>
                    </div>
                `);
            } else {
                setHTML(sponsorEl, `<div class="no-data">暂无数据</div>`);
            }
        } catch (error) {
            console.error('加载赞助页面失败:', error);
            setHTML(document.getElementById('sponsorContent'), `<div class="no-data">暂无数据</div>`);
        }
    },
    // 选择支付方式
    selectMethod(methodId) {
        this.selectedMethod = methodId;
        
        // 更新支付方式状态
        document.querySelectorAll('.method-card').forEach(card => {
            card.classList.remove('active');
            if (card.dataset.method === methodId) {
                card.classList.add('active');
            }
        });
        
        // 启用金额选项
        const amountCards = document.querySelectorAll('.amount-card');
        amountCards.forEach(card => {
            card.classList.remove('disabled');
        });
        
        // 启用自定义金额输入框
        const customAmountInput = document.getElementById('customAmountInput');
        if (customAmountInput) {
            customAmountInput.disabled = false;
        }
        
        // 更新金额选项主题
        const sponsorContent = document.getElementById('sponsorContent');
        sponsorContent.classList.remove('theme-alipay', 'theme-wechat');
        if (methodId === 'alipay') {
            sponsorContent.classList.add('theme-alipay');
        } else if (methodId === 'wechat') {
            sponsorContent.classList.add('theme-wechat');
        }
        
        // 检查是否可以启用确认按钮
        this.checkSponsorButton();
    },

    // 选择金额
    selectAmount(amount) {
        this.selectedAmount = amount;
        document.querySelectorAll('.amount-card').forEach(card => {
            card.classList.remove('active');
            if (parseInt(card.dataset.amount) === amount) {
                card.classList.add('active');
            }
        });
        
        // 检查是否可以启用确认按钮
        this.checkSponsorButton();
    },
    
    // 处理自定义金额输入
    handleCustomAmountInput(input) {
        const amount = parseFloat(input.value);
        const errorElement = document.getElementById('customAmountError');
        const successElement = document.getElementById('customAmountSuccess');
        const customAmountCard = document.querySelector('.custom-amount-card');
        
        // 验证输入有效性
        if (isNaN(amount) || amount <= 0) {
            errorElement.textContent = '当然仅支持正数，不要玩了';
            successElement.textContent = '';
            this.selectedAmount = null;
            customAmountCard.classList.remove('active');
        } else if (amount < 1) {
            errorElement.textContent = '为了避免赞助冲击，暂时不支持小于1.00元，请见谅';
            successElement.textContent = '';
            this.selectedAmount = null;
            customAmountCard.classList.remove('active');
        } else if (amount > 100) {
            errorElement.textContent = '太多了，不敢要';
            successElement.textContent = '';
            this.selectedAmount = null;
            customAmountCard.classList.remove('active');
        } else {
            errorElement.textContent = '';
            successElement.textContent = '有效金额';
            this.selectedAmount = amount;
            
            // 移除其他金额卡片的激活状态
            document.querySelectorAll('.amount-card').forEach(card => {
                if (!card.classList.contains('custom-amount-card')) {
                    card.classList.remove('active');
                }
            });
            
            // 激活自定义金额卡片
            customAmountCard.classList.add('active');
        }
        
        // 检查是否可以启用确认按钮
        this.checkSponsorButton();
    },
    
    // 格式化自定义金额（在失去焦点时）
    formatCustomAmount(input) {
        const value = input.value;
        if (value) {
            const amount = parseFloat(value);
            if (!isNaN(amount)) {
                input.value = amount.toFixed(2);
            }
        }
    },

    // 检查是否可以启用确认赞助按钮
    checkSponsorButton() {
        const sponsorButton = document.getElementById('sponsorButton');
        if (sponsorButton) {
            if (this.selectedMethod && this.selectedAmount !== null) {
                sponsorButton.disabled = false;
            } else {
                sponsorButton.disabled = true;
            }
        }
    },

    // 处理赞助
    handleSponsor() {
        // 显示暂不支持此功能提示
        alert('暂不支持此功能');
    },

    // 加载赞助名单页面
    async loadSponsorsPage() {
        try {
            const res = await API.getSponsors();
            const statsEl = document.getElementById('sponsorsStats');
            const listEl = document.getElementById('sponsorsList');

            if (res.success && res.data) {
                const { stats, list } = res.data;

                // 渲染统计
                setHTML(statsEl, `
                    <div class="stat-card">
                        <div class="number">¥${stats.totalAmount.toLocaleString()}</div>
                        <div class="label">累计赞助总额</div>
                    </div>
                    <div class="stat-card">
                        <div class="number">${stats.totalCount}</div>
                        <div class="label">总赞助人数</div>
                    </div>
                    <div class="stat-card">
                        <div class="number">¥${stats.monthlyAmount.toLocaleString()}</div>
                        <div class="label">本月赞助</div>
                    </div>
                    <div class="stat-card">
                        <div class="number">${stats.monthlyCount}</div>
                        <div class="label">本月人数</div>
                    </div>
                `);

                // 渲染列表
                if (list && list.length > 0) {
                    setHTML(listEl, `
                        <h3>赞助名单</h3>
                        <table class="sponsor-table">
                            <thead>
                                <tr>
                                    <th>昵称</th>
                                    <th>金额</th>
                                    <th>日期</th>
                                    <th>留言</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${list.map((sponsor) => {
                                    return `
                                        <tr>
                                            <td>${sponsor.name}</td>
                                            <td class="amount">¥${sponsor.amount}</td>
                                            <td>${sponsor.date}</td>
                                            <td class="message" title="${sponsor.message}">${sponsor.message || '-'}</td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    `);
                } else {
                    setHTML(listEl, `<div class="no-data">暂无数据</div>`);
                }
            } else {
                setHTML(statsEl, `<div class="no-data">暂无数据</div>`);
                setHTML(listEl, `<div class="no-data">暂无数据</div>`);
            }
        } catch (error) {
            console.error('加载赞助名单失败:', error);
            setHTML(document.getElementById('sponsorsStats'), `<div class="no-data">暂无数据</div>`);
            setHTML(document.getElementById('sponsorsList'), `<div class="no-data">暂无数据</div>`);
        }
    }
};

// 主题切换功能
const ThemeManager = {
    init() {
        // 强制使用深色模式作为默认值
        this.applyTheme('dark');
        // 保存深色模式到localStorage
        localStorage.setItem('themePreference', 'dark');

        // 绑定主题切换按钮事件
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                const currentTheme = document.body.classList.contains('dark-theme') ? 'dark' : 'light';
                const newTheme = currentTheme === 'light' ? 'dark' : 'light';
                this.applyTheme(newTheme);
                localStorage.setItem('themePreference', newTheme);
            });
        }
    },

    applyTheme(theme) {
        if (theme === 'dark') {
            document.body.classList.add('dark-theme');
        } else {
            document.body.classList.remove('dark-theme');
        }
    }
};

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    App.init();
    ThemeManager.init();
});