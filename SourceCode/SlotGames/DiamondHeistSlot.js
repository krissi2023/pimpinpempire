/**
 * DiamondHeistSlot.js - "Diamond Heist Slots" for Pimpin's Empire
 * Urban-themed slot machine with progressive jackpot and character bonuses
 * 
 * @author Krissi & K
 * @version 1.8.0
 */

class DiamondHeistSlot {
    constructor() {
        this.gameState = 'waiting'; // waiting, spinning, finished
        this.currentBet = 0;
        this.minBet = 1;
        this.maxBet = 100;
        this.reelSize = 5; // 5x3 slot machine
        
        // Player and game state
        this.player = null;
        this.currentSpin = [];
        this.winLines = [];
        this.totalWinnings = 0;
        this.jackpotAmount = 50000; // Progressive jackpot
        
        // Game symbols with urban pimp theme
        this.symbols = {
            // Common symbols (lower payouts)
            cash: { name: '💵', value: 2, rarity: 25, description: 'Cash Money' },
            gold: { name: '🥇', value: 3, rarity: 20, description: 'Gold Chain' },
            car: { name: '🚗', value: 4, rarity: 15, description: 'Luxury Ride' },
            
            // Medium symbols
            diamond: { name: '💎', value: 8, rarity: 12, description: 'Diamond' },
            crown: { name: '👑', value: 10, rarity: 10, description: 'Empire Crown' },
            
            // High value symbols
            pimpindapaul: { name: '🤴', value: 20, rarity: 8, description: 'PimpinDapaul' },
            diamond_char: { name: '💃', value: 25, rarity: 6, description: 'Diamond' },
            
            // Special symbols
            wild: { name: '🌟', value: 0, rarity: 3, description: 'Wild Card' },
            scatter: { name: '🎰', value: 0, rarity: 2, description: 'Scatter Bonus' },
            jackpot: { name: '💰', value: 0, rarity: 1, description: 'Jackpot Symbol' }
        };
        
        // Paylines (5x3 grid, multiple winning combinations)
        this.paylines = [
            // Horizontal lines
            [[0,0], [0,1], [0,2], [0,3], [0,4]], // Top row
            [[1,0], [1,1], [1,2], [1,3], [1,4]], // Middle row
            [[2,0], [2,1], [2,2], [2,3], [2,4]], // Bottom row
            
            // Diagonal lines
            [[0,0], [1,1], [2,2], [1,3], [0,4]], // V shape
            [[2,0], [1,1], [0,2], [1,3], [2,4]], // ^ shape
            
            // Zigzag patterns
            [[0,0], [1,1], [0,2], [1,3], [0,4]], // Top zigzag
            [[2,0], [1,1], [2,2], [1,3], [2,4]], // Bottom zigzag
        ];
        
        // Game statistics
        this.gameStats = {
            totalSpins: 0,
            totalWinnings: 0,
            biggestWin: 0,
            jackpotHits: 0,
            bonusRounds: 0
        };
        
        // Urban street language for different events
        this.streetTalk = {
            spin: [
                "Let's see what the reels bring! Time to get paid!",
                "Spinning those reels! May the empire smile upon you!",
                "Here we go! Let's see if luck is on your side!",
                "Reels spinning! Time to see if you got that magic touch!"
            ],
            win: [
                "Winner! You just hit it big! That's how champions play!",
                "Boom! The slots are feeling your energy tonight!",
                "Jackpot energy! You just made the reels respect you!",
                "That's what I'm talking about! The empire rewards the bold!"
            ],
            bigWin: [
                "BIG WIN! You just went off! That's some serious cash!",
                "MASSIVE HIT! The slots just paid you like royalty!",
                "HUGE WIN! You're making these reels work for you!",
                "INCREDIBLE! That's how legends are made right there!"
            ],
            jackpot: [
                "JACKPOT! HOLY SMOKES! You just hit the ultimate prize!",
                "PROGRESSIVE JACKPOT! You are officially slot royalty!",
                "MAXIMUM PAYOUT! The empire bows down to your luck!",
                "LEGENDARY JACKPOT! This is the stuff of legends!"
            ],
            bonus: [
                "BONUS ROUND! The reels are about to shower you with riches!",
                "FREE SPINS! Time to spin without spending - that's smart play!",
                "SCATTER BONUS! Multiple ways to win coming your way!",
                "BONUS TIME! The empire rewards loyal players!"
            ]
        };
        
        console.log('🎰 Diamond Heist Slots initialized - Time to hit the jackpot!');
    }

    /**
     * Start a new slot spin
     * @param {Player} player - Player instance
     * @param {number} betAmount - Bet amount
     * @returns {object} Spin result
     */
    spin(player, betAmount) {
        if (!player || typeof player.canAfford !== 'function') {
            return { success: false, message: 'Invalid player object' };
        }

        if (betAmount < this.minBet || betAmount > this.maxBet) {
            return { 
                success: false, 
                message: `Bet must be between $${this.minBet} and $${this.maxBet}` 
            };
        }

        if (!player.canAfford(betAmount)) {
            return { 
                success: false, 
                message: `Insufficient bankroll. You need $${betAmount}, but only have $${player.empire.resources}` 
            };
        }

        // Place bet
        const betResult = player.spendResources(betAmount, 'slots_bet');
        if (!betResult) {
            return { success: false, message: 'Failed to place bet' };
        }

        // Initialize spin
        this.player = player;
        this.currentBet = betAmount;
        this.gameState = 'spinning';
        this.currentSpin = this.generateSpin();
        this.winLines = this.checkWinLines();
        this.totalWinnings = this.calculateWinnings();
        
        // Update statistics
        this.gameStats.totalSpins++;
        this.gameStats.totalWinnings += this.totalWinnings;
        if (this.totalWinnings > this.gameStats.biggestWin) {
            this.gameStats.biggestWin = this.totalWinnings;
        }

        // Pay out winnings
        if (this.totalWinnings > 0) {
            player.addResources(this.totalWinnings, 'slots_win');
            
            // Add experience based on win size
            const experienceGain = Math.floor(this.totalWinnings / 10) + 5;
            player.addExperience(experienceGain, 'slots_win');
        }

        this.gameState = 'finished';
        
        // Determine message type
        let messageType = 'spin';
        if (this.hasJackpotWin()) {
            messageType = 'jackpot';
            this.gameStats.jackpotHits++;
        } else if (this.totalWinnings >= this.currentBet * 10) {
            messageType = 'bigWin';
        } else if (this.totalWinnings > 0) {
            messageType = 'win';
        }

        const message = this.getRandomStreetTalk(messageType);
        
        console.log(`🎰 Spin complete! Bet: $${betAmount}, Won: $${this.totalWinnings}, Reels: ${this.getReelDisplay()}`);

        return {
            success: true,
            message: message,
            reels: this.currentSpin,
            winLines: this.winLines,
            totalWinnings: this.totalWinnings,
            netGain: this.totalWinnings - betAmount,
            isJackpot: this.hasJackpotWin(),
            isBigWin: this.totalWinnings >= this.currentBet * 10,
            multiplier: this.totalWinnings > 0 ? (this.totalWinnings / betAmount).toFixed(2) : 0,
            state: this.getGameState()
        };
    }

    /**
     * Generate a random spin result
     * @returns {array} 5x3 grid of symbols
     */
    generateSpin() {
        const reels = [];
        const symbolKeys = Object.keys(this.symbols);
        
        for (let reel = 0; reel < this.reelSize; reel++) {
            const reelColumn = [];
            for (let row = 0; row < 3; row++) {
                // Weighted random selection based on rarity
                const randomSymbol = this.getWeightedRandomSymbol(symbolKeys);
                reelColumn.push(randomSymbol);
            }
            reels.push(reelColumn);
        }
        
        return reels;
    }

    /**
     * Get weighted random symbol based on rarity
     * @param {array} symbolKeys - Available symbol keys
     * @returns {string} Selected symbol key
     */
    getWeightedRandomSymbol(symbolKeys) {
        const totalWeight = symbolKeys.reduce((sum, key) => sum + this.symbols[key].rarity, 0);
        let random = Math.random() * totalWeight;
        
        for (const key of symbolKeys) {
            random -= this.symbols[key].rarity;
            if (random <= 0) return key;
        }
        
        return symbolKeys[0]; // Fallback
    }

    /**
     * Check all paylines for winning combinations
     * @returns {array} Array of winning lines
     */
    checkWinLines() {
        const winningLines = [];
        
        this.paylines.forEach((payline, index) => {
            const lineSymbols = payline.map(([row, col]) => this.currentSpin[col][row]);
            const winData = this.checkLineForWin(lineSymbols, payline, index);
            
            if (winData.isWin) {
                winningLines.push(winData);
            }
        });
        
        return winningLines;
    }

    /**
     * Check a single payline for wins
     * @param {array} lineSymbols - Symbols in the line
     * @param {array} positions - Positions of the symbols
     * @param {number} lineIndex - Index of the payline
     * @returns {object} Win data
     */
    checkLineForWin(lineSymbols, positions, lineIndex) {
        // Count consecutive matching symbols from left to right
        let matchCount = 1;
        let symbolType = lineSymbols[0];
        
        // Handle wild cards
        if (symbolType === 'wild') {
            symbolType = lineSymbols.find(s => s !== 'wild') || 'wild';
        }
        
        for (let i = 1; i < lineSymbols.length; i++) {
            const currentSymbol = lineSymbols[i];
            
            if (currentSymbol === symbolType || currentSymbol === 'wild' || symbolType === 'wild') {
                matchCount++;
                if (symbolType === 'wild' && currentSymbol !== 'wild') {
                    symbolType = currentSymbol;
                }
            } else {
                break;
            }
        }
        
        // Need at least 3 matching symbols for a win
        const isWin = matchCount >= 3;
        
        return {
            isWin: isWin,
            symbolType: symbolType,
            matchCount: matchCount,
            positions: positions.slice(0, matchCount),
            lineIndex: lineIndex,
            payout: isWin ? this.calculateLinePayout(symbolType, matchCount) : 0
        };
    }

    /**
     * Calculate payout for a winning line
     * @param {string} symbolType - Type of symbol
     * @param {number} matchCount - Number of matching symbols
     * @returns {number} Payout amount
     */
    calculateLinePayout(symbolType, matchCount) {
        if (!this.symbols[symbolType]) return 0;
        
        const baseValue = this.symbols[symbolType].value;
        
        // Multiplier based on match count
        let multiplier = 1;
        if (matchCount === 3) multiplier = 1;
        else if (matchCount === 4) multiplier = 3;
        else if (matchCount === 5) multiplier = 10;
        
        return baseValue * multiplier * this.currentBet;
    }

    /**
     * Calculate total winnings from all winning lines
     * @returns {number} Total winnings
     */
    calculateWinnings() {
        let total = 0;
        
        // Add payline winnings
        this.winLines.forEach(line => {
            total += line.payout;
        });
        
        // Check for scatter bonuses
        const scatterCount = this.countSymbol('scatter');
        if (scatterCount >= 3) {
            const scatterBonus = this.currentBet * scatterCount * 2;
            total += scatterBonus;
            this.gameStats.bonusRounds++;
        }
        
        // Check for jackpot
        if (this.hasJackpotWin()) {
            total += this.jackpotAmount;
            this.jackpotAmount = 50000; // Reset jackpot
        } else {
            // Progressive jackpot grows with each spin
            this.jackpotAmount += Math.floor(this.currentBet * 0.1);
        }
        
        return total;
    }

    /**
     * Count occurrences of a specific symbol on the reels
     * @param {string} symbolType - Symbol to count
     * @returns {number} Number of occurrences
     */
    countSymbol(symbolType) {
        let count = 0;
        this.currentSpin.forEach(reel => {
            reel.forEach(symbol => {
                if (symbol === symbolType) count++;
            });
        });
        return count;
    }

    /**
     * Check if current spin has jackpot win
     * @returns {boolean} True if jackpot win
     */
    hasJackpotWin() {
        // Jackpot requires 5 jackpot symbols anywhere on reels
        return this.countSymbol('jackpot') >= 5;
    }

    /**
     * Get display string for current reels
     * @returns {string} Reel display
     */
    getReelDisplay() {
        return this.currentSpin.map(reel => 
            reel.map(symbol => this.symbols[symbol]?.name || symbol).join('')
        ).join(' | ');
    }

    /**
     * Get random street talk message
     * @param {string} category - Message category
     * @returns {string} Random message
     */
    getRandomStreetTalk(category) {
        const messages = this.streetTalk[category] || ['Keep spinning!'];
        return messages[Math.floor(Math.random() * messages.length)];
    }

    /**
     * Get symbol info for display
     * @param {string} symbolKey - Symbol key
     * @returns {object} Symbol information
     */
    getSymbolInfo(symbolKey) {
        return this.symbols[symbolKey] || { name: '?', value: 0, description: 'Unknown' };
    }

    /**
     * Get paytable information
     * @returns {object} Paytable data
     */
    getPaytable() {
        const paytable = {};
        
        Object.keys(this.symbols).forEach(key => {
            const symbol = this.symbols[key];
            if (symbol.value > 0) {
                paytable[key] = {
                    symbol: symbol.name,
                    description: symbol.description,
                    payouts: {
                        three: symbol.value * this.currentBet,
                        four: symbol.value * 3 * this.currentBet,
                        five: symbol.value * 10 * this.currentBet
                    }
                };
            }
        });
        
        return paytable;
    }

    /**
     * Get current game state
     * @returns {object} Game state
     */
    getGameState() {
        return {
            gameState: this.gameState,
            currentBet: this.currentBet,
            reels: this.currentSpin,
            winLines: this.winLines,
            totalWinnings: this.totalWinnings,
            jackpotAmount: this.jackpotAmount,
            gameStats: this.gameStats,
            symbols: this.symbols,
            paytable: this.getPaytable()
        };
    }

    /**
     * Reset the game
     */
    resetGame() {
        this.gameState = 'waiting';
        this.currentBet = 0;
        this.currentSpin = [];
        this.winLines = [];
        this.totalWinnings = 0;
        
        console.log('🔄 Diamond Heist Slots reset');
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DiamondHeistSlot;
}

// Global access for browser
if (typeof window !== 'undefined') {
    window.DiamondHeistSlot = DiamondHeistSlot;
}