/**
 * Comic Store System - Core package management and coin distribution
 */
class ComicStore {
    constructor() {
        this.comicSeries = new Map();
        this.packages = new Map();
        this.purchases = new Map();
        this.initializeComicSeries();
        this.initializePackages();
    }

    initializeComicSeries() {
        this.comicSeries.set('diamond-heist', {
            id: 'diamond-heist',
            name: 'The Diamond Heist',
            description: 'Follow the thrilling diamond heist adventure',
            theme: { primaryColor: '#FFD700', backgroundColor: '#000011' },
            arcadeBonus: 0.25
        });

        this.comicSeries.set('pimpin-dapaul', {
            id: 'pimpin-dapaul',
            name: 'Pimpin Dapaul',
            description: 'Street-smart adventures in the urban jungle',
            theme: { primaryColor: '#8B5CF6', backgroundColor: '#1F2937' },
            arcadeBonus: 0.35
        });

        this.comicSeries.set('yago-digital', {
            id: 'yago-digital',
            name: 'Yago the Digital Sidekick',
            description: 'Cyberpunk adventures in the digital realm',
            theme: { primaryColor: '#00FFFF', backgroundColor: '#0F0F23' },
            arcadeBonus: 0.10
        });
    }

    initializePackages() {
        // Starter Packages - $4.99
        this.packages.set('diamond-heist-starter', {
            id: 'diamond-heist-starter', seriesId: 'diamond-heist',
            name: 'Diamond Heist Starter Pack', price: 4.99, type: 'starter',
            contents: { goldCoins: 500, ppcCoins: 100, comicPages: 5, wallpapers: 2, wordSearches: 1 }
        });
        
        // Premium Packages - $12.99
        this.packages.set('diamond-heist-premium', {
            id: 'diamond-heist-premium', seriesId: 'diamond-heist',
            name: 'Diamond Heist Premium Collection', price: 12.99, type: 'premium',
            contents: { goldCoins: 1500, ppcCoins: 400, comicPages: 15, wallpapers: 8, wordSearches: 3, puzzles: 2 }
        });
    }

    processSuccessfulPurchase(paymentIntentId, packageId, userId) {
        const package = this.getPackage(packageId);
        if (!package) throw new Error(`Package ${packageId} not found`);
        
        const purchaseId = `purchase_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const purchase = {
            id: purchaseId, paymentIntentId, packageId, userId, package,
            timestamp: new Date(),
            coins: { gold: package.contents.goldCoins || 0, ppc: package.contents.ppcCoins || 0 }
        };
        
        this.purchases.set(purchaseId, purchase);
        return purchase;
    }

    getAllPackages() { return Array.from(this.packages.values()); }
    getPackage(packageId) { return this.packages.get(packageId); }
    getSeries(seriesId) { return this.comicSeries.get(seriesId); }
    getAllSeries() { return Array.from(this.comicSeries.values()); }
    getUserPurchases(userId) { return Array.from(this.purchases.values()).filter(p => p.userId === userId); }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ComicStore;
} else if (typeof window !== 'undefined') {
    window.ComicStore = ComicStore;
}
