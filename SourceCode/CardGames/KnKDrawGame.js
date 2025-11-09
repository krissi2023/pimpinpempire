/**
 * KnKDrawGame.js - Implementation of the KnK Draw card game
 * Based on the game design from the project documentation
 * 
 * @author Krissi & K
 * @version 1.8.0
 */

class KnKDrawGame {
    constructor() {
        this.gameType = 'knk-draw';
        this.gameState = 'setup';
        this.players = [];
        this.currentRound = 0;
        this.maxRounds = null; // Game continues until one player has all cards
        this.cardManager = new CardManager();
        this.winner = null;
        
        // Game-specific settings
        this.warCardsCount = 3; // Cards drawn face down during war
        this.gameEvents = [];
        
        console.log('🃏 KnK Draw Game initialized');
    }

    /**
     * Initialize the game with players
     * @param {Array} playerList - Array of Player objects (should be 2 players)
     */
    initialize(playerList = []) {
        if (playerList.length !== 2) {
            console.error('❌ KnK Draw requires exactly 2 players');
            return false;
        }

        this.players = playerList;
        this.setupGame();
        console.log('✅ KnK Draw game initialized with 2 players');
        return true;
    }

    /**
     * Set up the game (A. Setup from game rules)
     */
    setupGame() {
        this.gameState = 'setup';
        
        // 1. Initialize a 52-card deck
        this.cardManager.initializeNewDeck('standard');
        
        // 2. Each player draws 26 cards to form their draw piles
        this.players.forEach((player, index) => {
            player.startGame(this.gameType);
            player.currentGame.drawPile = this.cardManager.dealCards(26);
            player.currentGame.discardPile = [];
            player.currentGame.score = player.currentGame.drawPile.length;
            
            console.log(`🎯 Player ${index + 1} (${player.name}) received 26 cards`);
        });

        this.gameState = 'ready';
        this.logGameEvent('Game setup complete', 'setup');
    }

    /**
     * Start the main game loop
     */
    startGame() {
        if (this.gameState !== 'ready') {
            console.error('❌ Game not ready to start');
            return;
        }

        this.gameState = 'playing';
        this.currentRound = 1;
        
        console.log('🎮 KnK Draw game started!');
        this.logGameEvent('Game started', 'game_start');
        
        // Start the gameplay loop
        this.playRound();
    }

    /**
     * B. Gameplay Loop - Play a single round
     */
    playRound() {
        if (this.gameState !== 'playing') {
            return;
        }

        console.log(`\n🎲 Round ${this.currentRound}`);

        // Check if any player needs to reshuffle
        this.checkAndReshuffle();

        // 1. Draw: Both players simultaneously draw the top card from their draw pile
        const player1Card = this.drawCardFromPile(this.players[0]);
        const player2Card = this.drawCardFromPile(this.players[1]);

        if (!player1Card || !player2Card) {
            console.error('❌ Cannot draw cards - game should have ended');
            return;
        }

        console.log(`${this.players[0].name} plays: ${this.cardManager.getCardDisplayName(player1Card)}`);
        console.log(`${this.players[1].name} plays: ${this.cardManager.getCardDisplayName(player2Card)}`);

        // 2. Compare: The face value of the two cards is compared
        const comparison = this.cardManager.compareCards(player1Card, player2Card);
        
        let cardsWon = [player1Card, player2Card];
        let roundWinner = null;

        if (comparison > 0) {
            // Player 1 wins
            roundWinner = this.players[0];
            console.log(`🏆 ${this.players[0].name} wins the round!`);
        } else if (comparison < 0) {
            // Player 2 wins  
            roundWinner = this.players[1];
            console.log(`🏆 ${this.players[1].name} wins the round!`);
        } else {
            // Tie - WAR!
            console.log('⚔️ WAR! Cards are equal!');
            const warResult = this.handleWar(player1Card, player2Card);
            roundWinner = warResult.winner;
            cardsWon = warResult.cardsWon;
        }

        // Winner collects all cards and places them at the bottom of their discard pile
        if (roundWinner) {
            roundWinner.currentGame.discardPile.push(...cardsWon);
            console.log(`📚 ${roundWinner.name} collected ${cardsWon.length} card(s)`);
            this.logGameEvent(`${roundWinner.name} won round ${this.currentRound}`, 'round_win');
        }

        // Update scores (total cards each player has)
        this.updateScores();

        // C. Check for winning condition
        if (this.checkWinCondition()) {
            this.endGame();
            return;
        }

        // Continue to next round
        this.currentRound++;
        
        // Add a small delay for dramatic effect in UI
        setTimeout(() => {
            this.playRound();
        }, 100);
    }

    /**
     * Handle War scenario when cards are equal
     * @param {Object} card1 - First player's card
     * @param {Object} card2 - Second player's card
     * @returns {Object} War result with winner and cards won
     */
    handleWar(card1, card2) {
        console.log('🔥 War sequence initiated!');
        
        let allCardsInPlay = [card1, card2];
        let player1WarCards = [];
        let player2WarCards = [];

        // Each player draws 3 cards face down, then 1 face up
        for (let i = 0; i < this.warCardsCount; i++) {
            const p1WarCard = this.drawCardFromPile(this.players[0]);
            const p2WarCard = this.drawCardFromPile(this.players[1]);

            if (!p1WarCard || !p2WarCard) {
                // If a player runs out of cards during war, they lose
                const warWinner = p1WarCard ? this.players[0] : this.players[1];
                console.log(`💥 ${warWinner.name} wins the war due to opponent running out of cards!`);
                return {
                    winner: warWinner,
                    cardsWon: [...allCardsInPlay, ...player1WarCards, ...player2WarCards].filter(Boolean)
                };
            }

            player1WarCards.push(p1WarCard);
            player2WarCards.push(p2WarCard);
        }

        allCardsInPlay.push(...player1WarCards, ...player2WarCards);

        // Draw final cards face up for comparison
        const p1FinalCard = this.drawCardFromPile(this.players[0]);
        const p2FinalCard = this.drawCardFromPile(this.players[1]);

        if (!p1FinalCard || !p2FinalCard) {
            const warWinner = p1FinalCard ? this.players[0] : this.players[1];
            console.log(`💥 ${warWinner.name} wins the war due to opponent running out of cards!`);
            return {
                winner: warWinner,
                cardsWon: [...allCardsInPlay].filter(Boolean)
            };
        }

        allCardsInPlay.push(p1FinalCard, p2FinalCard);

        console.log(`${this.players[0].name} war card: ${this.cardManager.getCardDisplayName(p1FinalCard)}`);
        console.log(`${this.players[1].name} war card: ${this.cardManager.getCardDisplayName(p2FinalCard)}`);

        // Compare final cards
        const warComparison = this.cardManager.compareCards(p1FinalCard, p2FinalCard);

        if (warComparison > 0) {
            console.log(`⚔️ ${this.players[0].name} wins the war!`);
            return { winner: this.players[0], cardsWon: allCardsInPlay };
        } else if (warComparison < 0) {
            console.log(`⚔️ ${this.players[1].name} wins the war!`);
            return { winner: this.players[1], cardsWon: allCardsInPlay };
        } else {
            // Another tie! Recursive war
            console.log('🔥 Another tie! War continues!');
            this.logGameEvent('Multiple wars in one round', 'war_chain');
            return this.handleWar(p1FinalCard, p2FinalCard);
        }
    }

    /**
     * Draw a card from player's draw pile, reshuffling discard pile if needed
     * @param {Player} player - Player to draw for
     * @returns {Object|null} Drawn card or null if no cards available
     */
    drawCardFromPile(player) {
        // If draw pile is empty, shuffle discard pile to create new draw pile
        if (player.currentGame.drawPile.length === 0) {
            if (player.currentGame.discardPile.length === 0) {
                // Player has no cards left - they lose
                return null;
            }

            // Shuffle discard pile back into draw pile
            player.currentGame.drawPile = [...player.currentGame.discardPile];
            player.currentGame.discardPile = [];
            
            // Shuffle the new draw pile
            this.shuffleArray(player.currentGame.drawPile);
            
            console.log(`♻️ ${player.name} shuffled discard pile into new draw pile`);
            this.logGameEvent(`${player.name} reshuffled cards`, 'reshuffle');
        }

        return player.currentGame.drawPile.pop();
    }

    /**
     * Check if players need to reshuffle their discard piles
     */
    checkAndReshuffle() {
        this.players.forEach(player => {
            if (player.currentGame.drawPile.length === 0 && player.currentGame.discardPile.length > 0) {
                this.drawCardFromPile(player); // This will trigger reshuffle
            }
        });
    }

    /**
     * Shuffle an array in place using Fisher-Yates algorithm
     * @param {Array} array - Array to shuffle
     */
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    /**
     * Update player scores (total number of cards)
     */
    updateScores() {
        this.players.forEach(player => {
            const totalCards = player.currentGame.drawPile.length + player.currentGame.discardPile.length;
            player.currentGame.score = totalCards;
        });

        console.log(`📊 Scores: ${this.players[0].name}: ${this.players[0].currentGame.score} | ${this.players[1].name}: ${this.players[1].currentGame.score}`);
    }

    /**
     * Check if winning condition is met
     * @returns {boolean} True if game should end
     */
    checkWinCondition() {
        // Check if any player has all 52 cards
        for (const player of this.players) {
            const totalCards = player.currentGame.drawPile.length + player.currentGame.discardPile.length;
            if (totalCards === 52) {
                this.winner = player;
                return true;
            }
            
            // Also check if opponent has 0 cards
            const opponent = this.players.find(p => p !== player);
            const opponentCards = opponent.currentGame.drawPile.length + opponent.currentGame.discardPile.length;
            if (opponentCards === 0) {
                this.winner = player;
                return true;
            }
        }

        // Safety check: if too many rounds, declare winner based on most cards
        if (this.currentRound > 1000) {
            console.log('⏰ Game taking too long, determining winner by card count...');
            this.winner = this.players[0].currentGame.score > this.players[1].currentGame.score ? 
                         this.players[0] : this.players[1];
            return true;
        }

        return false;
    }

    /**
     * End the game and calculate results
     */
    endGame() {
        this.gameState = 'finished';
        
        console.log(`\n🏁 Game Over! ${this.winner.name} wins KnK Draw!`);
        console.log(`🎯 Total rounds played: ${this.currentRound}`);
        
        // Calculate game results
        const winnerData = {
            xp: 100 + Math.min(this.currentRound, 200), // Bonus XP for longer games
            earnings: 500 + (this.currentRound * 2),
            reputation: 20
        };

        const loserData = {
            xp: 25 + Math.min(this.currentRound, 50),
            earnings: 100,
            reputation: 5
        };

        // Update player stats
        const loser = this.players.find(p => p !== this.winner);
        this.winner.endGame('won', winnerData);
        loser.endGame('lost', loserData);

        this.logGameEvent(`${this.winner.name} won the game`, 'game_end');

        // Return game summary
        return {
            winner: this.winner.name,
            loser: loser.name,
            rounds: this.currentRound,
            duration: Date.now() - this.players[0].currentGame.startedAt,
            events: this.gameEvents
        };
    }

    /**
     * Log game events for replay/analysis
     * @param {string} description - Event description
     * @param {string} type - Event type
     */
    logGameEvent(description, type) {
        this.gameEvents.push({
            round: this.currentRound,
            type: type,
            description: description,
            timestamp: Date.now()
        });
    }

    /**
     * Get current game state for UI updates
     * @returns {Object} Current game state
     */
    getGameState() {
        return {
            gameType: this.gameType,
            state: this.gameState,
            currentRound: this.currentRound,
            players: this.players.map(player => ({
                name: player.name,
                cardsInDraw: player.currentGame.drawPile.length,
                cardsInDiscard: player.currentGame.discardPile.length,
                totalCards: player.currentGame.score
            })),
            winner: this.winner ? this.winner.name : null
        };
    }

    /**
     * Handle player actions (for UI interaction)
     * @param {string} action - Action type
     * @param {Object} data - Action data
     */
    handlePlayerAction(action, data) {
        switch (action) {
            case 'start_game':
                this.startGame();
                break;
            case 'next_round':
                if (this.gameState === 'playing') {
                    // Manual round progression for turn-based UI
                    this.playRound();
                }
                break;
            case 'pause_game':
                this.gameState = 'paused';
                break;
            case 'resume_game':
                this.gameState = 'playing';
                break;
            default:
                console.log('Unknown action:', action);
        }
    }

    /**
     * Update method called by main game loop
     * @param {number} deltaTime - Time since last update
     */
    update(deltaTime) {
        // For KnK Draw, most logic is event-driven rather than time-based
        // This method can be used for animations or automatic play
        
        if (this.gameState === 'playing') {
            // Could add automatic round progression here for AI vs AI games
        }
    }

    /**
     * Render method called by main game loop
     */
    render() {
        // This method would update the UI elements for the game
        // For now, just ensure the game state is available
        
        const gameStateElement = document.getElementById('game-state');
        if (gameStateElement) {
            gameStateElement.innerHTML = JSON.stringify(this.getGameState(), null, 2);
        }
    }

    /**
     * Clean up game resources
     */
    cleanup() {
        this.players.forEach(player => {
            player.currentGame.hand = [];
            player.currentGame.drawPile = [];
            player.currentGame.discardPile = [];
        });
        
        this.cardManager.reset();
        console.log('🧹 KnK Draw game cleaned up');
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = KnKDrawGame;
} else {
    window.KnKDrawGame = KnKDrawGame;
}