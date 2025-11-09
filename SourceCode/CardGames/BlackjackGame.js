/**
 * BlackjackGame.js - "Blackjack Royalty" for Pimpin's Empire
 * Classic 21 with urban street style and empire progression
 * 
 * @author Krissi & K
 * @version 1.8.0
 */

class BlackjackGame {
    constructor() {
        this.cardManager = new CardManager();
        this.gameState = 'waiting'; // waiting, betting, dealing, playing, dealer_turn, finished
        this.currentBet = 0;
        this.minBet = 10;
        this.maxBet = 500;
        this.insuranceBet = 0;
        
        // Game participants
        this.player = null;
        this.playerHands = []; // Support for splits
        this.activeHandIndex = 0;
        this.dealerHand = [];
        this.dealerHoleCard = null;
        
        // Game options and rules
        this.allowSplit = true;
        this.allowDoubleDown = true;
        this.allowInsurance = true;
        this.allowSurrender = true;
        this.dealerHitsOn17 = false; // Dealer stands on soft 17
        this.blackjackPayout = 1.5; // 3:2 payout
        this.maxSplits = 3;
        
        // Game results and statistics
        this.gameResult = null;
        this.roundHistory = [];
        this.sessionStats = {
            hands: 0,
            wins: 0,
            losses: 0,
            pushes: 0,
            blackjacks: 0,
            totalWinnings: 0
        };
        
        // Urban street language for different events
        this.streetTalk = {
            blackjack: [
                "BLACKJACK! That's what I'm talking about! You got that cold game!",
                "21 on the deal! You just showed these cards who's boss!",
                "Natural blackjack! That's some royal bloodline right there!",
                "Boom! Blackjack! The streets recognize real talent when they see it!"
            ],
            bust: [
                "Busted! Sometimes the game humbles even the best players.",
                "Over 21! Don't sweat it, that's just how the cards fall sometimes.",
                "Bust! But that's part of the hustle - you bounce back stronger!",
                "21+ means you're out this round, but champions keep playing!"
            ],
            win: [
                "Victory! You just outplayed the house like a true boss!",
                "Winner winner! That's how you handle business at the table!",
                "You won! The empire grows stronger with every smart move!",
                "That's a W! Keep that energy up, champion!"
            ],
            loss: [
                "House wins this time, but real players know how to comeback!",
                "That's an L, but legends are built on learning from every hand!",
                "Dealer got you this round - analyze and come back harder!",
                "Sometimes you win, sometimes you learn. Keep grinding!"
            ],
            push: [
                "Push! Same hand as the dealer - nobody wins, nobody loses!",
                "It's a tie! Both y'all had the same energy this round!",
                "Push means you keep your money - that's still a smart play!",
                "Tied with the house! That shows you got skills!"
            ]
        };
        
        console.log('👑 Blackjack Royalty game initialized - Time to beat the house!');
    }

    /**
     * Start a new blackjack hand
     * @param {Player} player - Player instance
     * @param {number} betAmount - Bet amount
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

        // Place bet
        const betResult = player.spendResources(betAmount, 'blackjack_bet');
        if (!betResult) {
            return { success: false, message: 'Failed to place bet' };
        }

        // Initialize game
        this.player = player;
        this.currentBet = betAmount;
        this.insuranceBet = 0;
        this.playerHands = [[]];
        this.activeHandIndex = 0;
        this.dealerHand = [];
        this.dealerHoleCard = null;
        this.gameResult = null;
        this.gameState = 'dealing';

        // Check deck and reshuffle if needed
        if (this.cardManager.needsReshuffle(20)) {
            this.cardManager.resetDeck();
            console.log('🔄 Fresh deck brought to the table');
        }

        // Deal initial cards (player, dealer, player, dealer hole card)
        this.playerHands[0].push(this.cardManager.dealCards(1)[0]);
        this.dealerHand.push(this.cardManager.dealCards(1)[0]);
        this.playerHands[0].push(this.cardManager.dealCards(1)[0]);
        this.dealerHoleCard = this.cardManager.dealCards(1)[0]; // Face down

        console.log(`🃏 Cards dealt - Player: ${this.playerHands[0].map(c => c.name).join(', ')}, Dealer showing: ${this.dealerHand[0].name}`);

        // Check for natural blackjacks
        const playerTotal = this.calculateHandValue(this.playerHands[0]);
        const dealerTotal = this.calculateHandValue([this.dealerHand[0], this.dealerHoleCard]);
        
        if (playerTotal === 21 || dealerTotal === 21) {
            return this.handleNaturalBlackjacks();
        }

        // Check for insurance if dealer shows ace
        if (this.dealerHand[0].rank === 'ace' && this.allowInsurance) {
            this.gameState = 'insurance_offered';
            return {
                success: true,
                message: 'Dealer showing Ace - Insurance available!',
                gameState: 'insurance_offered',
                playerHand: this.playerHands[0],
                dealerUpCard: this.dealerHand[0],
                availableActions: ['take_insurance', 'decline_insurance'],
                state: this.getGameState()
            };
        }

        this.gameState = 'playing';
        return {
            success: true,
            message: 'Blackjack Royalty started! Make your move!',
            playerHand: this.playerHands[0],
            dealerUpCard: this.dealerHand[0],
            availableActions: this.getAvailableActions(),
            state: this.getGameState()
        };
    }

    /**
     * Handle natural blackjacks (21 on deal)
     * @returns {object} Natural blackjack result
     */
    handleNaturalBlackjacks() {
        const playerTotal = this.calculateHandValue(this.playerHands[0]);
        const dealerTotal = this.calculateHandValue([this.dealerHand[0], this.dealerHoleCard]);
        
        this.gameState = 'finished';

        if (playerTotal === 21 && dealerTotal === 21) {
            // Both have blackjack - push
            this.player.addResources(this.currentBet, 'blackjack_push');
            this.gameResult = {
                outcome: 'push',
                playerTotal: 21,
                dealerTotal: 21,
                payout: this.currentBet,
                netGain: 0,
                message: this.getRandomStreetTalk('push')
            };
        } else if (playerTotal === 21) {
            // Player blackjack
            const payout = this.currentBet + Math.floor(this.currentBet * this.blackjackPayout);
            this.player.addResources(payout, 'blackjack_win');
            this.player.addExperience(25, 'blackjack_natural');
            this.sessionStats.blackjacks++;
            this.gameResult = {
                outcome: 'blackjack',
                playerTotal: 21,
                dealerTotal: dealerTotal,
                payout: payout,
                netGain: payout - this.currentBet,
                message: this.getRandomStreetTalk('blackjack')
            };
        } else {
            // Dealer blackjack
            this.gameResult = {
                outcome: 'dealer_blackjack',
                playerTotal: playerTotal,
                dealerTotal: 21,
                payout: 0,
                netGain: -this.currentBet,
                message: "Dealer's got blackjack! House wins this round."
            };
        }

        this.updateSessionStats();
        return {
            success: true,
            gameResult: this.gameResult,
            playerHand: this.playerHands[0],
            dealerHand: [this.dealerHand[0], this.dealerHoleCard],
            state: this.getGameState()
        };
    }

    /**
     * Player chooses to hit (take another card)
     * @returns {object} Hit result
     */
    hit() {
        if (this.gameState !== 'playing') {
            return { success: false, message: 'Cannot hit at this time' };
        }

        const currentHand = this.playerHands[this.activeHandIndex];
        const newCard = this.cardManager.dealCards(1)[0];
        currentHand.push(newCard);

        const handValue = this.calculateHandValue(currentHand);
        console.log(`🎯 Hit! Drew ${newCard.name}, hand total: ${handValue}`);

        if (handValue > 21) {
            // Bust
            return this.handleBust();
        } else if (handValue === 21) {
            // 21 - automatically stand
            return this.stand();
        }

        return {
            success: true,
            message: `Drew ${newCard.name}! Hand total: ${handValue}`,
            newCard: newCard,
            handValue: handValue,
            availableActions: this.getAvailableActions(),
            state: this.getGameState()
        };
    }

    /**
     * Player chooses to stand (keep current hand)
     * @returns {object} Stand result
     */
    stand() {
        if (this.gameState !== 'playing') {
            return { success: false, message: 'Cannot stand at this time' };
        }

        console.log(`✋ Player stands with ${this.calculateHandValue(this.playerHands[this.activeHandIndex])}`);

        // If player has multiple hands from splits, move to next hand
        if (this.activeHandIndex < this.playerHands.length - 1) {
            this.activeHandIndex++;
            return {
                success: true,
                message: `Moving to next hand (${this.activeHandIndex + 1} of ${this.playerHands.length})`,
                activeHandIndex: this.activeHandIndex,
                availableActions: this.getAvailableActions(),
                state: this.getGameState()
            };
        }

        // All player hands complete - dealer's turn
        return this.playDealerHand();
    }

    /**
     * Player doubles down (double bet, take one card, then stand)
     * @returns {object} Double down result
     */
    doubleDown() {
        if (this.gameState !== 'playing') {
            return { success: false, message: 'Cannot double down at this time' };
        }

        const currentHand = this.playerHands[this.activeHandIndex];
        
        // Can only double on first two cards
        if (currentHand.length !== 2) {
            return { success: false, message: 'Can only double down on first two cards' };
        }

        // Check if player can afford to double the bet
        if (!this.player.canAfford(this.currentBet)) {
            return { 
                success: false, 
                message: `Need $${this.currentBet} more to double down` 
            };
        }

        // Double the bet
        const betResult = this.player.spendResources(this.currentBet, 'blackjack_double');
        if (!betResult) {
            return { success: false, message: 'Failed to place additional bet' };
        }

        this.currentBet *= 2;

        // Deal one card and automatically stand
        const newCard = this.cardManager.dealCards(1)[0];
        currentHand.push(newCard);

        const handValue = this.calculateHandValue(currentHand);
        console.log(`💰 Doubled down! Drew ${newCard.name}, final hand: ${handValue}`);

        if (handValue > 21) {
            // Bust on double down
            return this.handleBust();
        }

        // Move to next hand or dealer's turn
        if (this.activeHandIndex < this.playerHands.length - 1) {
            this.activeHandIndex++;
            return {
                success: true,
                message: `Doubled down and drew ${newCard.name}! Moving to next hand.`,
                newCard: newCard,
                handValue: handValue,
                activeHandIndex: this.activeHandIndex,
                state: this.getGameState()
            };
        }

        return this.playDealerHand();
    }

    /**
     * Player splits their hand (if they have a pair)
     * @returns {object} Split result
     */
    split() {
        if (this.gameState !== 'playing') {
            return { success: false, message: 'Cannot split at this time' };
        }

        const currentHand = this.playerHands[this.activeHandIndex];
        
        // Can only split pairs
        if (currentHand.length !== 2 || 
            currentHand[0].rank !== currentHand[1].rank) {
            return { success: false, message: 'Can only split pairs' };
        }

        // Check split limits
        if (this.playerHands.length >= this.maxSplits) {
            return { success: false, message: `Maximum ${this.maxSplits} splits allowed` };
        }

        // Check if player can afford additional bet
        if (!this.player.canAfford(this.currentBet)) {
            return { 
                success: false, 
                message: `Need $${this.currentBet} to split` 
            };
        }

        // Place additional bet for split
        const betResult = this.player.spendResources(this.currentBet, 'blackjack_split');
        if (!betResult) {
            return { success: false, message: 'Failed to place split bet' };
        }

        // Split the hand
        const splitCard = currentHand.pop();
        const newHand = [splitCard];
        this.playerHands.push(newHand);

        // Deal new cards to both hands
        currentHand.push(this.cardManager.dealCards(1)[0]);
        newHand.push(this.cardManager.dealCards(1)[0]);

        console.log(`🃏 Split! Hand 1: ${currentHand.map(c => c.name).join(', ')}, Hand 2: ${newHand.map(c => c.name).join(', ')}`);

        return {
            success: true,
            message: `Split successful! Playing hand 1 of ${this.playerHands.length}`,
            playerHands: this.playerHands,
            activeHandIndex: this.activeHandIndex,
            availableActions: this.getAvailableActions(),
            state: this.getGameState()
        };
    }

    /**
     * Player takes insurance (bet that dealer has blackjack)
     * @returns {object} Insurance result
     */
    takeInsurance() {
        if (this.gameState !== 'insurance_offered') {
            return { success: false, message: 'Insurance not available' };
        }

        const insuranceAmount = Math.floor(this.currentBet / 2);
        
        if (!this.player.canAfford(insuranceAmount)) {
            return { 
                success: false, 
                message: `Need $${insuranceAmount} for insurance` 
            };
        }

        const betResult = this.player.spendResources(insuranceAmount, 'blackjack_insurance');
        if (!betResult) {
            return { success: false, message: 'Failed to place insurance bet' };
        }

        this.insuranceBet = insuranceAmount;
        this.gameState = 'playing';

        // Check if dealer has blackjack
        const dealerTotal = this.calculateHandValue([this.dealerHand[0], this.dealerHoleCard]);
        
        if (dealerTotal === 21) {
            // Insurance wins 2:1
            const insurancePayout = insuranceAmount * 3; // Original bet + 2:1 payout
            this.player.addResources(insurancePayout, 'insurance_win');
            
            return {
                success: true,
                message: `Insurance pays! Dealer has blackjack. Insurance payout: $${insurancePayout}`,
                insurancePayout: insurancePayout,
                dealerHasBlackjack: true,
                state: this.getGameState()
            };
        }

        return {
            success: true,
            message: `Insurance placed ($${insuranceAmount}). Dealer doesn't have blackjack.`,
            insuranceBet: insuranceAmount,
            state: this.getGameState()
        };
    }

    /**
     * Handle dealer's turn
     * @returns {object} Dealer turn result
     */
    playDealerHand() {
        this.gameState = 'dealer_turn';
        
        // Reveal hole card
        this.dealerHand.push(this.dealerHoleCard);
        let dealerTotal = this.calculateHandValue(this.dealerHand);
        
        console.log(`🎩 Dealer reveals hole card: ${this.dealerHoleCard.name}, total: ${dealerTotal}`);

        // Dealer hits on 16 and below, stands on 17 and above
        // (unless dealerHitsOn17 is true for soft 17)
        while (dealerTotal < 17 || 
               (this.dealerHitsOn17 && dealerTotal === 17 && this.isSoft17(this.dealerHand))) {
            
            const newCard = this.cardManager.dealCards(1)[0];
            this.dealerHand.push(newCard);
            dealerTotal = this.calculateHandValue(this.dealerHand);
            
            console.log(`🎯 Dealer hits and draws ${newCard.name}, total: ${dealerTotal}`);
        }

        console.log(`✋ Dealer stands with ${dealerTotal}`);
        
        // Determine winners for all hands
        return this.determineWinners();
    }

    /**
     * Determine winners and handle payouts
     * @returns {object} Game result
     */
    determineWinners() {
        this.gameState = 'finished';
        const dealerTotal = this.calculateHandValue(this.dealerHand);
        const dealerBust = dealerTotal > 21;
        const results = [];
        let totalPayout = 0;
        let totalNetGain = 0;

        this.playerHands.forEach((hand, index) => {
            const playerTotal = this.calculateHandValue(hand);
            const playerBust = playerTotal > 21;
            let outcome, payout, netGain, message;

            if (playerBust) {
                outcome = 'bust';
                payout = 0;
                netGain = -this.currentBet;
                message = this.getRandomStreetTalk('bust');
            } else if (dealerBust) {
                outcome = 'win';
                payout = this.currentBet * 2;
                netGain = this.currentBet;
                message = this.getRandomStreetTalk('win');
                this.player.addExperience(15, 'blackjack_win');
            } else if (playerTotal > dealerTotal) {
                outcome = 'win';
                payout = this.currentBet * 2;
                netGain = this.currentBet;
                message = this.getRandomStreetTalk('win');
                this.player.addExperience(15, 'blackjack_win');
            } else if (playerTotal < dealerTotal) {
                outcome = 'loss';
                payout = 0;
                netGain = -this.currentBet;
                message = this.getRandomStreetTalk('loss');
            } else {
                outcome = 'push';
                payout = this.currentBet;
                netGain = 0;
                message = this.getRandomStreetTalk('push');
            }

            if (payout > 0) {
                this.player.addResources(payout, 'blackjack_payout');
            }

            totalPayout += payout;
            totalNetGain += netGain;

            results.push({
                handIndex: index,
                hand: hand,
                playerTotal: playerTotal,
                dealerTotal: dealerTotal,
                outcome: outcome,
                payout: payout,
                netGain: netGain,
                message: message
            });
        });

        this.gameResult = {
            results: results,
            dealerHand: this.dealerHand,
            dealerTotal: dealerTotal,
            totalPayout: totalPayout,
            totalNetGain: totalNetGain,
            insuranceBet: this.insuranceBet
        };

        this.updateSessionStats();

        return {
            success: true,
            gameResult: this.gameResult,
            state: this.getGameState()
        };
    }

    /**
     * Handle player bust
     * @returns {object} Bust result
     */
    handleBust() {
        const handValue = this.calculateHandValue(this.playerHands[this.activeHandIndex]);
        console.log(`💥 Bust! Hand total: ${handValue}`);

        // If player has multiple hands, mark this one as bust and continue
        if (this.activeHandIndex < this.playerHands.length - 1) {
            this.activeHandIndex++;
            return {
                success: true,
                message: `Hand busted! Moving to next hand (${this.activeHandIndex + 1} of ${this.playerHands.length})`,
                bust: true,
                handValue: handValue,
                activeHandIndex: this.activeHandIndex,
                state: this.getGameState()
            };
        }

        // All hands complete or only one hand - end game
        return this.determineWinners();
    }

    /**
     * Calculate the total value of a hand
     * @param {array} hand - Array of cards
     * @returns {number} Hand value
     */
    calculateHandValue(hand) {
        let total = 0;
        let aces = 0;

        // First pass: count non-aces and count aces
        hand.forEach(card => {
            if (card.rank === 'ace') {
                aces++;
            } else if (['jack', 'queen', 'king'].includes(card.rank)) {
                total += 10;
            } else {
                total += parseInt(card.rank);
            }
        });

        // Handle aces (count as 11 if possible, otherwise 1)
        for (let i = 0; i < aces; i++) {
            if (total + 11 <= 21) {
                total += 11;
            } else {
                total += 1;
            }
        }

        return total;
    }

    /**
     * Check if hand is a soft 17 (contains ace counted as 11)
     * @param {array} hand - Array of cards
     * @returns {boolean} True if soft 17
     */
    isSoft17(hand) {
        if (this.calculateHandValue(hand) !== 17) return false;
        
        let total = 0;
        let hasAce11 = false;

        hand.forEach(card => {
            if (card.rank === 'ace') {
                if (total + 11 <= 17) {
                    total += 11;
                    hasAce11 = true;
                } else {
                    total += 1;
                }
            } else if (['jack', 'queen', 'king'].includes(card.rank)) {
                total += 10;
            } else {
                total += parseInt(card.rank);
            }
        });

        return hasAce11;
    }

    /**
     * Get available actions for current game state
     * @returns {array} Available actions
     */
    getAvailableActions() {
        const actions = [];
        
        if (this.gameState !== 'playing') {
            return actions;
        }

        const currentHand = this.playerHands[this.activeHandIndex];
        
        // Basic actions
        actions.push('hit', 'stand');
        
        // Double down (only on first two cards)
        if (currentHand.length === 2 && this.allowDoubleDown && 
            this.player.canAfford(this.currentBet)) {
            actions.push('double_down');
        }

        // Split (only pairs on first two cards)
        if (currentHand.length === 2 && this.allowSplit &&
            currentHand[0].rank === currentHand[1].rank &&
            this.playerHands.length < this.maxSplits &&
            this.player.canAfford(this.currentBet)) {
            actions.push('split');
        }

        // Surrender (only on first two cards, not after splits)
        if (currentHand.length === 2 && this.allowSurrender && 
            this.playerHands.length === 1) {
            actions.push('surrender');
        }

        return actions;
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
     * Update session statistics
     */
    updateSessionStats() {
        this.sessionStats.hands++;
        
        if (this.gameResult) {
            if (this.gameResult.results) {
                // Multiple hands (splits)
                this.gameResult.results.forEach(result => {
                    if (result.outcome === 'win') this.sessionStats.wins++;
                    else if (result.outcome === 'loss' || result.outcome === 'bust') this.sessionStats.losses++;
                    else if (result.outcome === 'push') this.sessionStats.pushes++;
                });
                this.sessionStats.totalWinnings += this.gameResult.totalNetGain;
            } else {
                // Single result
                if (this.gameResult.outcome === 'blackjack') {
                    this.sessionStats.wins++;
                    this.sessionStats.blackjacks++;
                } else if (this.gameResult.outcome === 'win') {
                    this.sessionStats.wins++;
                } else if (this.gameResult.outcome === 'loss') {
                    this.sessionStats.losses++;
                } else if (this.gameResult.outcome === 'push') {
                    this.sessionStats.pushes++;
                }
                this.sessionStats.totalWinnings += this.gameResult.netGain;
            }
        }
    }

    /**
     * Get current game state
     * @returns {object} Game state
     */
    getGameState() {
        return {
            gameState: this.gameState,
            currentBet: this.currentBet,
            insuranceBet: this.insuranceBet,
            playerHands: this.playerHands,
            activeHandIndex: this.activeHandIndex,
            dealerHand: this.dealerHand,
            dealerUpCard: this.dealerHand.length > 0 ? this.dealerHand[0] : null,
            availableActions: this.getAvailableActions(),
            gameResult: this.gameResult,
            sessionStats: this.sessionStats,
            deckStatus: this.cardManager.getDeckStatus()
        };
    }

    /**
     * Reset the game
     */
    resetGame() {
        this.gameState = 'waiting';
        this.currentBet = 0;
        this.insuranceBet = 0;
        this.playerHands = [];
        this.activeHandIndex = 0;
        this.dealerHand = [];
        this.dealerHoleCard = null;
        this.gameResult = null;
        this.cardManager.resetDeck();
        
        console.log('🔄 Blackjack Royalty game reset');
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BlackjackGame;
}

// Global access for browser
if (typeof window !== 'undefined') {
    window.BlackjackGame = BlackjackGame;
}