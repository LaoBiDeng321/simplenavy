//从 JSON 文件读取数据

const API = {
    // 模拟网络延迟
    delay(ms = 10) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    // 独立的缓存
    caches: {
        gameData: null,
        sponsorData: null,
        sponsorsData: null
    },

    // 加载游戏数据
    async loadGameData() {
        if (!this.caches.gameData) {
            const response = await fetch('data/game_data.json');
            if (!response.ok) {
                throw new Error('Failed to load data from data/game_data.json');
            }
            this.caches.gameData = await response.json();
        }
        return this.caches.gameData;
    },

    // 加载赞助数据
    async loadSponsorData() {
        if (!this.caches.sponsorData) {
            const response = await fetch('data/sponsor_data.json');
            if (!response.ok) {
                throw new Error('Failed to load data from data/sponsor_data.json');
            }
            this.caches.sponsorData = await response.json();
        }
        return this.caches.sponsorData;
    },

    // 加载赞助名单数据
    async loadSponsorsData() {
        if (!this.caches.sponsorsData) {
            const response = await fetch('data/sponsors_data.json');
            if (!response.ok) {
                throw new Error('Failed to load data from data/sponsors_data.json');
            }
            this.caches.sponsorsData = await response.json();
        }
        return this.caches.sponsorsData;
    },

    // 获取游戏信息
    async getGameInfo() {
        await this.delay();
        const data = await this.loadGameData();
        return {
            success: true,
            data: data.gameInfo
        };
    },

    // 获取下载链接
    async getDownloads() {
        await this.delay();
        const data = await this.loadGameData();
        return {
            success: true,
            data: data.downloads
        };
    },

    // 获取赞助方式
    async getSponsorMethods() {
        await this.delay();
        const data = await this.loadSponsorData();
        return {
            success: true,
            data: data.sponsorMethods
        };
    },

    // 获取赞助金额选项
    async getSponsorAmounts() {
        await this.delay();
        const data = await this.loadSponsorData();
        return {
            success: true,
            data: data.sponsorAmounts
        };
    },

    // 获取赞助名单
    async getSponsors() {
        await this.delay();
        const data = await this.loadSponsorsData();
        
        // 计算真实统计数据
        const list = data.sponsors.list || [];
        const totalAmount = list.reduce((sum, item) => sum + item.amount, 0);
        const totalCount = list.length;
        
        // 计算当月赞助数据
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        const monthlySponsors = list.filter(item => {
            const sponsorDate = new Date(item.date);
            return sponsorDate.getMonth() === currentMonth && sponsorDate.getFullYear() === currentYear;
        });
        
        const monthlyAmount = monthlySponsors.reduce((sum, item) => sum + item.amount, 0);
        const monthlyCount = monthlySponsors.length;
        
        // 按时间先后排序（最新的在前）
        const sortedList = [...list].sort((a, b) => new Date(b.date) - new Date(a.date));
        
        return {
            success: true,
            data: {
                stats: {
                    totalAmount: totalAmount,
                    totalCount: totalCount,
                    monthlyAmount: monthlyAmount, // 只统计当月金额
                    monthlyCount: monthlyCount    // 只统计当月人数
                },
                list: sortedList
            }
        };
    },

    // 提交赞助
    async submitSponsor(method, amount) {
        await this.delay(800);
        return {
            success: true,
            data: {
                orderId: "SP" + Date.now(),
                method: method,
                amount: amount,
                qrCode: "#qrcode-placeholder"
            }
        };
    }
};