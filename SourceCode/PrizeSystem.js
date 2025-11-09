class PrizeSystem {
    constructor() {
        this.prizes = new Map();
        this.userTickets = new Map();
        this.redemptions = new Map();
        this.initializePrizes();
    }

    initializePrizes() {
        this.prizes.set('paypal-5', {
            id: 'paypal-5', name: '$5 PayPal Cash', category: 'digital',
            ticketCost: 10, value: 5.00, description: 'Instant PayPal transfer'
        });
        this.prizes.set('amazon-10', {
            id: 'amazon-10', name: '$10 Amazon Gift Card', category: 'giftcard',
            ticketCost: 20, value: 10.00, description: 'Digital Amazon gift card code'
        });
        this.prizes.set('gaming-headset', {
            id: 'gaming-headset', name: 'Gaming Headset', category: 'physical',
            ticketCost: 150, value: 80.00, description: 'High-quality gaming headset'
        });
    }

    calculateTicketsFromGame(gameResult, gameType, seriesBonus = 0) {
        let baseTickets = 0;
        
        switch (gameType) {
            case 'blackjack': baseTickets = gameResult.won ? gameResult.payout * 0.1 : 0; break;
            case 'slots': baseTickets = Math.floor(gameResult.winAmount * 0.05); break;
            case 'high-low': baseTickets = gameResult.won ? gameResult.streak * 2 : 0; break;
            default: baseTickets = gameResult.won ? 1 : 0;
        }

        return Math.floor(baseTickets * (1 + seriesBonus));
    }

    addTicketsToUser(userId, tickets) {
        const current = this.userTickets.get(userId) || 0;
        this.userTickets.set(userId, current + tickets);
        return this.userTickets.get(userId);
    }

    getUserTickets(userId) { return this.userTickets.get(userId) || 0; }
    getAllPrizes() { return Array.from(this.prizes.values()); }
    getPrizesByCategory(category) { return this.getAllPrizes().filter(p => p.category === category); }

    async redeemPrize(userId, prizeId, userInfo = {}) {
        const prize = this.prizes.get(prizeId);
        if (!prize) throw new Error('Prize not found');
        
        const userTickets = this.getUserTickets(userId);
        if (userTickets < prize.ticketCost) throw new Error('Insufficient tickets');

        this.userTickets.set(userId, userTickets - prize.ticketCost);

        const redemption = {
            id: `redemption_${Date.now()}`, userId, prizeId, prize, userInfo,
            timestamp: new Date(), status: 'fulfilled'
        };

        this.redemptions.set(redemption.id, redemption);
        return redemption;
    }

    getUserRedemptions(userId) {
        return Array.from(this.redemptions.values()).filter(r => r.userId === userId);
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = PrizeSystem;
} else if (typeof window !== 'undefined') {
    window.PrizeSystem = PrizeSystem;
}
