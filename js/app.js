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

    // 初始化
    init() {
        this.bindEvents();
        this.loadDownloadPage();
        this.loadSponsorPage();
        this.loadSponsorsPage();
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

        // 更新URL hash
        window.location.hash = pageName;
    },

    // 加载游戏下载页面
    async loadDownloadPage() {
        try {
            // 获取游戏信息
            const gameInfoRes = await API.getGameInfo();
            const gameInfoEl = document.getElementById('gameInfo');

            if (gameInfoRes.success && gameInfoRes.data) {
                const game = gameInfoRes.data;
                setHTML(gameInfoEl, `
                    <div class="game-cover">${game.icon}</div>
                    <div class="game-details">
                        <h1>${game.name}</h1>
                        <div class="game-meta">
                            <span class="version">${game.version}</span>
                            <span> ${game.developer}</span>
                            <span> ${game.releaseDate}</span>
                            <span> ${game.size}</span>
                        </div>
                        <p class="game-description">${game.description}</p>
                    </div>
                `);
            } else {
                setHTML(gameInfoEl, '<div class="no-data">暂无游戏信息</div>');
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
                                    <div class="size">${item.platform === '加入QQ交流群' ? item.version : `版本 ${item.version} · ${item.size}`}</div>
                                    <a href="${item.url}" target="_blank" class="download-btn" style="display: block; text-align: center; text-decoration: none;">
                                        ${item.platform === '加入QQ交流群' ? '加入交流群' : '立即下载'}
                                    </a>
                                </div>
                        `).join('')}
                    </div>
                `);
            } else {
                setHTML(downloadEl, '<div class="no-data">暂无下载链接</div>');
            }
        } catch (error) {
            console.error('加载下载页面失败:', error);
            setHTML(document.getElementById('gameInfo'), '<div class="no-data">加载失败，请刷新重试</div>');
            setHTML(document.getElementById('downloadSection'), '<div class="no-data">加载失败，请刷新重试</div>');
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
                                        ${method.id === 'alipay' ? '<img src="image/alipay.ico" alt="支付宝" style="width: 32px; height: 32px;">' : ''}
                                        ${method.id === 'wechat' ? '<img src="image/wechatpay.webp" alt="微信支付" style="width: 32px; height: 32px;">' : ''}
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
                                <div class="amount-card disabled" data-amount="${item.amount}" onclick="App.selectAmount(${item.amount})">
                                    <div class="amount">${item.amount}</div>
                                    <div class="unit">${item.unit}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    <div class="sponsor-action">
                        <button class="sponsor-btn" id="sponsorButton" onclick="App.handleSponsor()" disabled>确认赞助</button>
                    </div>
                `);
            } else {
                setHTML(sponsorEl, '<div class="no-data">暂无赞助信息</div>');
            }
        } catch (error) {
            console.error('加载赞助页面失败:', error);
            setHTML(document.getElementById('sponsorContent'), '<div class="no-data">加载失败，请刷新重试</div>');
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
                    setHTML(listEl, '<div class="no-data">暂无赞助记录</div>');
                }
            } else {
                setHTML(statsEl, '<div class="no-data">暂无统计数据</div>');
                setHTML(listEl, '<div class="no-data">暂无赞助记录</div>');
            }
        } catch (error) {
            console.error('加载赞助名单失败:', error);
            setHTML(document.getElementById('sponsorsStats'), '<div class="no-data">加载失败</div>');
            setHTML(document.getElementById('sponsorsList'), '<div class="no-data">加载失败</div>');
        }
    }
};

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    App.init();

    // 根据hash初始化页面
    const hash = window.location.hash.slice(1);
    if (hash && ['download', 'sponsor', 'sponsors'].includes(hash)) {
        App.switchPage(hash);
    }
});
