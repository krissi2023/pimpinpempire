/**
 * HighLowGame.js - "High-Low Empire" for Pimpin's Empire
 * Quick betting game: predict if next card is higher or lower
 * 
 * @author Krissi & K
 * @version 1.8.0
 */

class HighLowGame {
    constructor() {
        this.cardManager = new CardManager();
        this.gameState = 'waiting'; // waiting, playing, finished
        this.currentBet = 0;
        this.minBet = 5;
        this.maxBet = 200;
        
        // Game cards
        this.currentCard = null;
        this.nextCard = null;
        this.previousCards = [];
        
        // Player and game state
        this.player = null;
        this.streak = 0;
        this.maxStreak = 0;
        this.totalWinnings = 0;
        this.baseMultiplier = 1.8; // Base payout multiplier
        
        // Game statistics
        this.gameStats = {
            gamesPlayed: 0,
            correctGuesses: 0,
            wrongGuesses: 0,
            bestStreak: 0,
            totalEarnings: 0,
            averageMultiplier: 0
        };
        
        // Street language for different events
        this.streetTalk = {
            correct: [
                "Correct! You read that card like a true hustler!",
                "That's right! You got that sixth sense working!",
                "Called it! Your street smarts are on point!",
                "Boom! You just showed those cards who's boss!",
                "Right on the money! Keep that energy flowing!"
            ],
            wrong: [
                "Cards got you this time! But real players bounce back!",
                "That's how the game goes sometimes. Learn and adapt!",
                "Wrong call, but champions use losses as lessons!",
                "The cards surprised you there, but you'll get the next one!",
                "That's the hustle - sometimes you win, sometimes you learn!"
            ],
            streak: [
                "Streak building! You're getting in the zone!",
                "Hot streak! The cards are feeling your energy!",
                "On fire! This is how legends are made!",
                "Unstoppable! You're reading these cards like a book!",
                "Streak master! The empire recognizes your skills!"
            ],
            cashout: [
                "Smart cash out! That's how you secure the bag!",
                "Good timing! You know when to hold and when to fold!",
                "Wise move! Taking profits like a true boss!",
                "Cash secured! That's some real business sense!",
                "Perfect timing! You just played it perfectly!"
            ]
        };
        
        console.log('📈 High-Low Empire game initialized - Time to predict and profit!');
    }

    /**
     * Start a new High-Low game
     * @param {Player} player - Player instance
     * @param {number} betAmount - Initial bet amount
     * @returns {object} Game start result
     */
    startGame(player, betAmount) {
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

        // Place initial bet
        const betResult = player.spendResources(betAmount, 'highlow_bet');
        if (!betResult) {
            return { success: false, message: 'Failed to place bet' };
        }

        // Initialize game
        this.player = player;
        this.currentBet = betAmount;
        this.gameState = 'playing';
        this.streak = 0;
        this.totalWinnings = 0;
        this.previousCards = [];

        // Check deck and reshuffle if needed
        if (this.cardManager.needsReshuffle(10)) {
            this.cardManager.resetDeck();
            console.log('🔄 Fresh deck shuffled for High-Low Empire');
        }

        // Deal first card
        this.currentCard = this.cardManager.dealCards(1)[0];
        
        console.log(`📈 High-Low Empire started! First card: ${this.currentCard.name}`);

        return {
            success: true,
            message: 'High-Low Empire started! Predict if the next card will be higher or lower!',
            currentCard: this.currentCard,
            availableActions: ['predict_higher', 'predict_lower'],
            state: this.getGameState()
        };
    }

    /**
     * Make a prediction (higher or lower)
     * @param {string} prediction - 'higher' or 'lower'
     * @returns {object} Prediction result
     */
    makePrediction(prediction) {
        if (this.gameState !== 'playing') {
            return { success: false, message: 'No active game to make prediction' };
        }

        if (!['higher', 'lower'].includes(prediction)) {
            return { success: false, message: 'Prediction must be "higher" or "lower"' };
        }

        // Deal next card
        this.nextCard = this.cardManager.dealCards(1)[0];
        
        // Compare cards
        const currentValue = this.getCardValue(this.currentCard);
        const nextValue = this.getCardValue(this.nextCard);
        
        let isCorrect = false;
        let actualResult = '';
        
        if (nextValue > currentValue) {
            actualResult = 'higher';
            isCorrect = prediction === 'higher';
        } else if (nextValue < currentValue) {
            actualResult = 'lower';
            isCorrect = prediction === 'lower';
        } else {
            // Same value - player loses on ties
            actualResult = 'same';
            isCorrect = false;
        }

        // Update statistics
        this.gameStats.gamesPlayed++;
        
        if (isCorrect) {
            this.gameStats.correctGuesses++;
            this.streak++;
            this.maxStreak = Math.max(this.maxStreak, this.streak);
            this.gameStats.bestStreak = Math.max(this.gameStats.bestStreak, this.streak);
            
            // Calculate payout with streak multiplier
            const streakBonus = 1 + (this.streak - 1) * 0.2; // 20% bonus per streak
            const totalMultiplier = this.baseMultiplier * streakBonus;
            const winnings = Math.floor(this.currentBet * totalMultiplier);
            
            this.totalWinnings += winnings;
            this.gameStats.totalEarnings += winnings;
            this.player.addResources(winnings, 'highlow_win');
            this.player.addExperience(5 + this.streak, 'highlow_correct');
            
            console.log(`✅ Correct! ${this.currentCard.name} → ${this.nextCard.name} (${actualResult}). Streak: ${this.streak}, Winnings: $${winnings}`);
            
            // Move to next round
            this.previousCards.push(this.currentCard);
            this.currentCard = this.nextCard;
            this.nextCard = null;
            
            const message = this.getRandomStreetTalk(this.streak > 1 ? 'streak' : 'correct');
            
            return {
                success: true,
                correct: true,
                message: message,
                prediction: prediction,
                actualResult: actualResult,
                previousCard: this.previousCards[this.previousCards.length - 1],
                currentCard: this.currentCard,
                streak: this.streak,
                winnings: winnings,
                totalMultiplier: totalMultiplier,
                availableActions: ['predict_higher', 'predict_lower', 'cash_out'],
                state: this.getGameState()
            };
            
        } else {
            this.gameStats.wrongGuesses++;
            const lostAmount = this.totalWinnings + this.currentBet;
            
            console.log(`❌ Wrong! ${this.currentCard.name} → ${this.nextCard.name} (${actualResult}, predicted ${prediction}). Lost: $${lostAmount}`);
            
            this.gameState = 'finished';
            
            const message = this.getRandomStreetTalk('wrong');
            
            return {
                success: true,
                correct: false,
                message: message,
                prediction: prediction,
                actualResult: actualResult,
                previousCard: this.currentCard,
                nextCard: this.nextCard,
                streak: this.streak,
                finalStreak: this.streak,
                maxStreak: this.maxStreak,
                lostAmount: lostAmount,
                state: this.getGameState()
            };
        }
    }

    /**
     * Cash out current winnings
     * @returns {object} Cash out result
     */
    cashOut() {
        if (this.gameState !== 'playing') {
            return { success: false, message: 'No active game to cash out' };
        }

        if (this.streak === 0) {
            return { success: false, message: 'No winnings to cash out' };
        }

        // Player keeps their winnings and gets back original bet
        const totalPayout = this.totalWinnings + this.currentBet;
        this.player.addResources(this.currentBet, 'highlow_cashout'); // Return original bet
        
        console.log(`💰 Cashed out! Streak: ${this.streak}, Total payout: $${totalPayout}`);
        
        this.gameState = 'finished';
        
        // Award experience based on streak
        this.player.addExperience(10 + (this.streak * 2), 'highlow_cashout');
        
        const message = this.getRandomStreetTalk('cashout');
        
        return {
            success: true,
            message: message,
            cashedOut: true,
            finalStreak: this.streak,
            maxStreak: this.maxStreak,
            totalWinnings: this.totalWinnings,
            originalBet: this.currentBet,
            totalPayout: totalPayout,
            state: this.getGameState()
        };
    }

    /**
     * Get the numeric value of a card for comparison
     * @param {object} card - Card object
     * @returns {number} Card value (1-13)
     */
    getCardValue(card) {
        if (card.rank === 'ace') return 1;
        if (card.rank === 'jack') return 11;
        if (card.rank === 'queen') return 12;
        if (card.rank === 'king') return 13;
        return parseInt(card.rank);
    }

    /**
     * Calculate potential winnings for next correct guess
     * @returns {number} Potential winnings
     */
    calculatePotentialWinnings() {
        const streakBonus = 1 + this.streak * 0.2;
        const totalMultiplier = this.baseMultiplier * streakBonus;
        return Math.floor(this.currentBet * totalMultiplier);
    }

    /**
     * Get the probability hint for next card
     * @returns {object} Probability analysis
     */
    getProbabilityHint() {
        if (!this.currentCard) return null;
        
        const currentValue = this.getCardValue(this.currentCard);
        const deckStatus = this.cardManager.getDeckStatus();
        
        // Count remaining cards higher and lower
        let higherCards = 0;
        let lowerCards = 0;
        let sameCards = 0;
        
        for (let rank = 1; rank <= 13; rank++) {
            const cardsOfRank = 4; // 4 suits per rank
            if (rank > currentValue) higherCards += cardsOfRank;
            else if (rank < currentValue) lowerCards += cardsOfRank;
            else sameCards += cardsOfRank;
        }
        
        // Adjust for current card (already dealt)
        if (currentValue >= 1 && currentValue <= 13) {
            sameCards -= 1;
        }
        
        const totalCards = higherCards + lowerCards + sameCards;
        const higherPercent = Math.round((higherCards / totalCards) * 100);
        const lowerPercent = Math.round((lowerCards / totalCards) * 100);
        
        return {
            higherPercent: higherPercent,
            lowerPercent: lowerPercent,
            higherCards: higherCards,
            lowerCards: lowerCards,
            totalCards: totalCards,
            recommendation: higherPercent > lowerPercent ? 'higher' : 'lower',
            confidence: Math.abs(higherPercent - lowerPercent)
        };
    }

    /**
     * Get random street talk message
     * @param {string} category - Message category
     * @returns {string} Random message
     */
    getRandomStreetTalk(category) {
        const messages = this.streetTalk[category] || ['Keep grinding!'];
        return messages[Math.floor(Math.random() * messages.length)];
    }

    /**
     * Get current game state
     * @returns {object} Game state
     */
    getGameState() {
        return {
            gameState: this.gameState,
            currentBet: this.currentBet,
            currentCard: this.currentCard,
            nextCard: this.nextCard,
            previousCards: this.previousCards,
            streak: this.streak,
            maxStreak: this.maxStreak,
            totalWinnings: this.totalWinnings,
            potentialWinnings: this.gameState === 'playing' ? this.calculatePotentialWinnings() : 0,
            probabilityHint: this.gameState === 'playing' ? this.getProbabilityHint() : null,
            availableActions: this.getAvailableActions(),
            gameStats: this.gameStats,
            deckStatus: this.cardManager.getDeckStatus()
        };
    }

    /**
     * Get available actions for current game state
     * @returns {array} Available actions
     */
    getAvailableActions() {
        if (this.gameState !== 'playing') return [];
        
        const actions = ['predict_higher', 'predict_lower'];
        
        // Cash out is available if player has winnings
        if (this.streak > 0) {
            actions.push('cash_out');
        }
        
        return actions;
    }

    /**
     * Get game statistics
     * @returns {object} Game statistics
     */
    getStatistics() {
        const accuracy = this.gameStats.gamesPlayed > 0 ? 
            Math.round((this.gameStats.correctGuesses / this.gameStats.gamesPlayed) * 100) : 0;
        
        const avgMultiplier = this.gameStats.correctGuesses > 0 ?
            (this.gameStats.totalEarnings / (this.gameStats.correctGuesses * this.currentBet)).toFixed(2) : 0;
        
        return {
            ...this.gameStats,
            accuracy: accuracy,
            averageMultiplier: avgMultiplier,
            profitLoss: this.gameStats.totalEarnings
        };
    }

    /**
     * Reset the game
     */
    resetGame() {
        this.gameState = 'waiting';
        this.currentBet = 0;
        this.currentCard = null;
        this.nextCard = null;
        this.previousCards = [];
        this.streak = 0;
        this.totalWinnings = 0;
        this.cardManager.resetDeck();
        
        console.log('🔄 High-Low Empire game reset');
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HighLowGame;
}

// Global access for browser
if (typeof window !== 'undefined') {
    window.HighLowGame = HighLowGame;
}