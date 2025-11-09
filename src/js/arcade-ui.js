/**
 * arcade-ui.js - Urban Pimp Arcade UI Controller
 * Handles all UI interactions with authentic street language and style
 * 
 * @author Krissi & K
 * @version 1.8.0
 */

class ArcadeUI {
    constructor() {
        this.currentPlayer = null;
        this.activeGame = null;
        this.gameEngine = null;
        this.isLoading = true;
        this.audioEnabled = true;
        
        // Urban street language for different events
        this.streetTalk = {
            welcome: [
                "Welcome to the empire, player! Time to stack that paper!",
                "Step into the zone where legends are made, young king!",
                "You just entered the dopest arcade in the city, welcome!",
                "Time to show these streets what you're made of!",
                "Welcome to where the magic happens, let's get this bread!"
            ],
            gameStart: [
                "Alright player, let's see what you got!",
                "Time to put your skills where your mouth is!",
                "Let's get this hustle started, show me the magic!",
                "Game time! Let's see if you got that champion energy!",
                "Here we go! Time to turn up and show out!"
            ],
            gameWin: [
                "Yo! That's how you do it! Straight fire!",
                "Damn player, you just went off! That's some cold game right there!",
                "Look at you handling business like a true boss!",
                "That's what I'm talking about! You just leveled up for real!",
                "Smooth moves, champion! The streets are watching and they respect it!"
            ],
            gameLoss: [
                "Nah, you good player! Even legends take L's sometimes!",
                "Don't sweat it, that's just the game talking. You'll bounce back!",
                "Hey, that's how you learn! Next round, you coming back stronger!",
                "Keep your head up! Every pro started where you at right now!",
                "That's just practice, player! The real you is about to show up!"
            ],
            levelUp: [
                "YO! Look at you climbing the ladder! Level up energy!",
                "That's that growth mindset! You just ascended to the next level!",
                "Check you out getting better! The empire recognizes real talent!",
                "Level up! Your swagger just increased significantly!",
                "Now that's what progression looks like! Keep rising!"
            ]
        };

        this.init();
    }

    init() {
        console.log('🎮 Initializing the dopest arcade UI in the city...');
        this.setupEventListeners();
        this.initializePlayer();
        this.handleLoadingScreen();
        this.updatePlayerDisplay();
        
        // Show welcome message after loading
        setTimeout(() => {
            this.showStreetMessage(this.getRandomStreetTalk('welcome'), 'success');
        }, 2000);
    }

    setupEventListeners() {
        // Game selection buttons
        document.addEventListener('click', (event) => {
            if (event.target.classList.contains('play-button') && 
                !event.target.classList.contains('coming-soon')) {
                const gameCard = event.target.closest('.game-card');
                if (gameCard) {
                    const gameType = gameCard.dataset.game;
                    this.startGame(gameType);
                }
            }
        });

        // Back to arcade button
        const backButton = document.getElementById('back-to-arcade');
        if (backButton) {
            backButton.addEventListener('click', () => {
                this.backToArcade();
            });
        }

        // Audio toggle
        const audioToggle = document.getElementById('audio-toggle');
        if (audioToggle) {
            audioToggle.addEventListener('click', () => {
                this.toggleAudio();
            });
        }

        // Help toggle
        const helpToggle = document.getElementById('help-toggle');
        if (helpToggle) {
            helpToggle.addEventListener('click', () => {
                this.toggleHelpModal();
            });
        }

        // Help modal close
        const closeHelp = document.getElementById('close-help');
        if (closeHelp) {
            closeHelp.addEventListener('click', () => {
                this.toggleHelpModal();
            });
        }

        // Close help modal when clicking outside
        const helpModal = document.getElementById('help-modal');
        if (helpModal) {
            helpModal.addEventListener('click', (event) => {
                if (event.target === helpModal) {
                    this.toggleHelpModal();
                }
            });
        }

        // Game card hover effects
        document.querySelectorAll('.game-card').forEach(card => {
            card.addEventListener('mouseenter', () => {
                this.playHoverSound();
                this.showGamePreview(card);
            });
        });

        // Character card interactions
        document.querySelectorAll('.character-card').forEach(card => {
            card.addEventListener('click', () => {
                this.showCharacterDetails(card);
            });
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (event) => {
            this.handleKeyboardShortcuts(event);
        });
    }

    initializePlayer() {
        // Check for existing player data
        const savedData = localStorage.getItem('pimpinspempire_player');
        if (savedData) {
            try {
                const playerData = JSON.parse(savedData);
                this.currentPlayer = new Player(playerData.name, 'human');
                this.currentPlayer.import(playerData);
                console.log('👤 Loaded existing player:', this.currentPlayer.name);
            } catch (error) {
                console.log('📝 Creating new player...');
                this.createNewPlayer();
            }
        } else {
            this.createNewPlayer();
        }
    }

    createNewPlayer() {
        const playerName = this.getPlayerName();
        this.currentPlayer = new Player(playerName, 'human');
        
        // Give them a welcome bonus
        this.currentPlayer.addResources(500, 'welcome_bonus');
        this.currentPlayer.addExperience(25, 'welcome_bonus');
        
        console.log(`🎉 Welcome to the empire, ${playerName}!`);
        this.savePlayerData();
    }

    getPlayerName() {
        const names = ['Fresh Prince', 'Young King', 'Street Legend', 'Future Boss', 'Rising Star'];
        const randomName = names[Math.floor(Math.random() * names.length)];
        
        const inputName = prompt(`Welcome to Pimpins Empire! What should we call you, player?\n\n(Leave blank for: ${randomName})`);
        return inputName?.trim() || randomName;
    }

    handleLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (!loadingScreen) return;

        // Simulate loading process
        const loadingSteps = [
            'Connecting to the streets...',
            'Loading your swagger profile...',
            'Setting up the game tables...',
            'Preparing the empire experience...',
            'Almost ready to ball out!'
        ];

        let step = 0;
        const loadingInterval = setInterval(() => {
            const tipElement = loadingScreen.querySelector('.loading-tip');
            if (tipElement && step < loadingSteps.length) {
                tipElement.textContent = loadingSteps[step];
                step++;
            }
        }, 600);

        // Hide loading screen after 3 seconds
        setTimeout(() => {
            clearInterval(loadingInterval);
            loadingScreen.classList.add('loaded');
            this.isLoading = false;
            
            // Remove from DOM after animation
            setTimeout(() => {
                loadingScreen.remove();
            }, 500);
        }, 3000);
    }

    updatePlayerDisplay() {
        if (!this.currentPlayer) return;

        const levelElement = document.getElementById('player-level');
        const resourcesElement = document.getElementById('player-resources');
        const reputationElement = document.getElementById('player-reputation');

        if (levelElement) {
            levelElement.textContent = this.currentPlayer.empire.level;
        }

        if (resourcesElement) {
            const resources = this.currentPlayer.empire.resources;
            resourcesElement.textContent = `$${resources.toLocaleString()}`;
        }

        if (reputationElement) {
            const rep = this.currentPlayer.empire.reputation;
            let repStatus = 'Fresh';
            
            if (rep >= 100) repStatus = 'Respected';
            if (rep >= 250) repStatus = 'Legendary';
            if (rep >= 500) repStatus = 'Empire Boss';
            
            reputationElement.textContent = repStatus;
        }

        // Update swagger meter
        const swaggerFill = document.querySelector('.swagger-fill');
        const swaggerText = document.querySelector('.swagger-text');
        
        if (swaggerFill && swaggerText) {
            const swaggerLevel = Math.min(100, (this.currentPlayer.empire.level * 20) + (this.currentPlayer.empire.reputation / 5));
            swaggerFill.style.width = `${swaggerLevel}%`;
            
            let swaggerStatus = 'Fresh';
            if (swaggerLevel >= 25) swaggerStatus = 'Smooth';
            if (swaggerLevel >= 50) swaggerStatus = 'Cold';
            if (swaggerLevel >= 75) swaggerStatus = 'Ice Cold';
            if (swaggerLevel >= 90) swaggerStatus = 'Legendary';
            
            swaggerText.textContent = `Swagger Level: ${swaggerStatus}`;
        }
    }

    startGame(gameType) {
        console.log(`🎲 Starting ${gameType} with that champion energy!`);
        
        this.showStreetMessage(this.getRandomStreetTalk('gameStart'), 'info');
        
        switch (gameType) {
            case 'knk-draw':
                this.startKnKDrawGame();
                break;
            case 'blackjack':
                this.startBlackjackGame();
                break;
            case 'high-low':
                this.showComingSoon('High-Low Empire');
                break;
            default:
                this.showComingSoon('This Game');
        }
    }

    startBlackjackGame() {
        // Initialize the game
        const blackjackGame = new BlackjackGame();
        
        // Get bet amount from user
        const betAmount = this.getBetAmount('Blackjack Royalty', blackjackGame.minBet, blackjackGame.maxBet);
        if (betAmount === null) return; // User cancelled
        
        const success = blackjackGame.startGame(this.currentPlayer, betAmount);
        
        if (success.success) {
            this.activeGame = blackjackGame;
            this.showGameInterface('Blackjack Royalty - Beat the House');
            this.renderBlackjackUI();
        } else {
            this.showStreetMessage(`Yo, ${success.message}. Check your bankroll and try again!`, 'error');
        }
    }

    startKnKDrawGame() {
        // Create AI opponent
        const aiPlayer = new Player('Diamond (AI)', 'ai');
        
        // Initialize the game
        const knkGame = new KnKDrawGame();
        const success = knkGame.initialize([this.currentPlayer, aiPlayer]);
        
        if (success) {
            this.activeGame = knkGame;
            this.showGameInterface('KnK Draw - The Original Hustle');
            this.renderKnKDrawUI();
            knkGame.startGame();
        } else {
            this.showStreetMessage('Yo, something went wrong setting up the game. Try again!', 'error');
        }
    }

    showGameInterface(gameTitle) {
        const arcade = document.querySelector('.gaming-floor');
        const gameInterface = document.getElementById('game-interface');
        const gameHeader = document.getElementById('current-game-title');
        
        if (arcade && gameInterface && gameHeader) {
            arcade.style.display = 'none';
            gameInterface.classList.remove('hidden');
            gameHeader.textContent = gameTitle;
        }
    }

    renderKnKDrawUI() {
        const gameContent = document.getElementById('game-content');
        if (!gameContent || !this.activeGame) return;

        gameContent.innerHTML = `
            <div class="knk-draw-interface">
                <div class="game-status">
                    <h3 class="status-title">Game Status</h3>
                    <div id="round-info" class="round-info">Round 1 - Let's get this hustle started!</div>
                </div>
                
                <div class="player-zones">
                    <div class="player-zone your-zone">
                        <h4 class="zone-title">${this.currentPlayer.name}</h4>
                        <div class="card-display">
                            <div id="your-card" class="game-card-display">Ready to draw</div>
                        </div>
                        <div class="card-count">
                            <span id="your-count">${this.currentPlayer.currentGame.drawPile.length + this.currentPlayer.currentGame.discardPile.length}</span> cards
                        </div>
                    </div>
                    
                    <div class="vs-section">
                        <div class="vs-text">VS</div>
                        <button id="draw-cards-btn" class="draw-button">Draw Cards!</button>
                    </div>
                    
                    <div class="player-zone opponent-zone">
                        <h4 class="zone-title">Diamond (AI)</h4>
                        <div class="card-display">
                            <div id="opponent-card" class="game-card-display">Ready to draw</div>
                        </div>
                        <div class="card-count">
                            <span id="opponent-count">${this.activeGame.players[1].currentGame.drawPile.length + this.activeGame.players[1].currentGame.discardPile.length}</span> cards
                        </div>
                    </div>
                </div>
                
                <div class="game-log">
                    <h4 class="log-title">Game Events</h4>
                    <div id="game-events" class="events-container">
                        Game started! Both players have 26 cards. Let's see who's got that champion spirit!
                    </div>
                </div>
            </div>
        `;

        // Add styles for KnK Draw interface
        this.addKnKDrawStyles();
        
        // Set up draw button
        const drawButton = document.getElementById('draw-cards-btn');
        if (drawButton) {
            drawButton.addEventListener('click', () => {
                this.handleCardDraw();
            });
        }
    }

    addKnKDrawStyles() {
        if (document.getElementById('knk-draw-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'knk-draw-styles';
        styles.textContent = `
            .knk-draw-interface {
                display: flex;
                flex-direction: column;
                gap: 30px;
                font-family: 'Orbitron', monospace;
            }
            
            .game-status {
                text-align: center;
                background: linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(138, 43, 226, 0.1));
                padding: 20px;
                border-radius: 15px;
                border: 1px solid var(--empire-gold);
            }
            
            .status-title {
                color: var(--empire-gold);
                margin-bottom: 15px;
                text-shadow: 0 0 10px var(--empire-gold);
            }
            
            .round-info {
                color: var(--empire-cyan);
                font-size: 1.1rem;
                font-weight: bold;
            }
            
            .player-zones {
                display: grid;
                grid-template-columns: 1fr auto 1fr;
                gap: 30px;
                align-items: center;
            }
            
            .player-zone {
                background: linear-gradient(135deg, rgba(0, 0, 0, 0.5), rgba(65, 105, 225, 0.1));
                padding: 25px;
                border-radius: 15px;
                border: 2px solid var(--diamond-blue);
                text-align: center;
            }
            
            .your-zone {
                border-color: var(--empire-gold);
            }
            
            .zone-title {
                color: var(--neon-white);
                margin-bottom: 20px;
                font-size: 1.3rem;
            }
            
            .game-card-display {
                width: 120px;
                height: 160px;
                margin: 0 auto 15px;
                background: linear-gradient(135deg, #333, #666);
                border: 2px solid var(--empire-cyan);
                border-radius: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                color: var(--neon-white);
                transition: all 0.3s ease;
            }
            
            .game-card-display.card-drawn {
                background: linear-gradient(135deg, var(--empire-gold), var(--empire-purple));
                color: var(--shadow-black);
                transform: scale(1.05);
                box-shadow: 0 0 20px var(--empire-gold);
            }
            
            .card-count {
                color: var(--empire-cyan);
                font-weight: bold;
            }
            
            .vs-section {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 20px;
            }
            
            .vs-text {
                font-size: 2rem;
                font-weight: bold;
                color: var(--empire-pink);
                text-shadow: 0 0 15px var(--empire-pink);
            }
            
            .draw-button {
                padding: 15px 30px;
                background: var(--gold-gradient);
                border: none;
                border-radius: 10px;
                color: var(--shadow-black);
                font-size: 1.1rem;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.3s ease;
                text-transform: uppercase;
                letter-spacing: 1px;
                font-family: 'Orbitron', monospace;
            }
            
            .draw-button:hover {
                background: var(--purple-gradient);
                color: var(--neon-white);
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(138, 43, 226, 0.5);
            }
            
            .draw-button:disabled {
                background: #666;
                cursor: not-allowed;
                transform: none;
                box-shadow: none;
            }
            
            .game-log {
                background: rgba(0, 0, 0, 0.5);
                padding: 20px;
                border-radius: 15px;
                border: 1px solid var(--empire-cyan);
            }
            
            .log-title {
                color: var(--empire-cyan);
                margin-bottom: 15px;
                text-align: center;
            }
            
            .events-container {
                max-height: 200px;
                overflow-y: auto;
                color: var(--neon-white);
                line-height: 1.5;
                font-size: 0.9rem;
            }
            
            .event-message {
                margin-bottom: 8px;
                padding: 5px 10px;
                border-left: 3px solid var(--empire-cyan);
                background: rgba(0, 255, 255, 0.05);
            }
            
            .event-win {
                border-left-color: var(--cash-green);
                background: rgba(0, 255, 0, 0.05);
            }
            
            .event-war {
                border-left-color: var(--royal-red);
                background: rgba(220, 20, 60, 0.05);
            }
            
            @media (max-width: 768px) {
                .player-zones {
                    grid-template-columns: 1fr;
                    gap: 20px;
                }
                
                .vs-section {
                    order: 1;
                }
                
                .your-zone {
                    order: 0;
                }
                
                .opponent-zone {
                    order: 2;
                }
            }
        `;
        
        document.head.appendChild(styles);
    }

    handleCardDraw() {
        if (!this.activeGame || this.activeGame.gameState !== 'playing') return;

        const drawButton = document.getElementById('draw-cards-btn');
        if (drawButton) {
            drawButton.disabled = true;
            drawButton.textContent = 'Drawing...';
        }

        // Simulate the card draw with animation
        setTimeout(() => {
            this.updateKnKDrawDisplay();
            
            if (drawButton) {
                drawButton.disabled = false;
                
                if (this.activeGame.gameState === 'finished') {
                    drawButton.textContent = 'Game Over!';
                    drawButton.disabled = true;
                    this.handleGameEnd();
                } else {
                    drawButton.textContent = 'Draw Cards!';
                }
            }
        }, 1000);
    }

    updateKnKDrawDisplay() {
        if (!this.activeGame) return;

        const gameState = this.activeGame.getGameState();
        
        // Update round info
        const roundInfo = document.getElementById('round-info');
        if (roundInfo) {
            if (gameState.state === 'finished') {
                roundInfo.textContent = `Game Over! ${gameState.winner} wins after ${gameState.currentRound} rounds!`;
            } else {
                roundInfo.textContent = `Round ${gameState.currentRound} - Keep that energy up!`;
            }
        }

        // Update card counts
        const yourCount = document.getElementById('your-count');
        const opponentCount = document.getElementById('opponent-count');
        
        if (yourCount) yourCount.textContent = gameState.players[0].totalCards;
        if (opponentCount) opponentCount.textContent = gameState.players[1].totalCards;

        // Add event to log
        this.addGameEvent(`Round ${gameState.currentRound} completed`);
    }

    addGameEvent(message, type = 'normal') {
        const eventsContainer = document.getElementById('game-events');
        if (!eventsContainer) return;

        const eventDiv = document.createElement('div');
        eventDiv.className = `event-message event-${type}`;
        eventDiv.textContent = `[Round ${this.activeGame?.currentRound || '?'}] ${message}`;

        eventsContainer.appendChild(eventDiv);
        eventsContainer.scrollTop = eventsContainer.scrollHeight;
    }

    handleGameEnd() {
        const gameState = this.activeGame.getGameState();
        const isWinner = gameState.winner === this.currentPlayer.name;

        if (isWinner) {
            this.showStreetMessage(this.getRandomStreetTalk('gameWin'), 'success');
        } else {
            this.showStreetMessage(this.getRandomStreetTalk('gameLoss'), 'info');
        }

        // Update player display
        this.updatePlayerDisplay();
        this.savePlayerData();

        // Show game summary
        setTimeout(() => {
            this.showGameSummary(gameState);
        }, 2000);
    }

    showGameSummary(gameState) {
        const summary = `
            Game Summary:
            Winner: ${gameState.winner}
            Rounds: ${gameState.currentRound}
            
            Your empire continues to grow!
            Check your updated stats in the player status.
        `;
        
        alert(summary);
    }

    backToArcade() {
        const arcade = document.querySelector('.gaming-floor');
        const gameInterface = document.getElementById('game-interface');
        
        if (arcade && gameInterface) {
            arcade.style.display = 'block';
            gameInterface.classList.add('hidden');
        }

        // Clean up active game
        if (this.activeGame) {
            this.activeGame.cleanup();
            this.activeGame = null;
        }

        this.showStreetMessage('Welcome back to the arcade floor! Ready for another round?', 'info');
    }

    setupBlackjackControls() {
        // Hit button
        const hitBtn = document.getElementById('hit-btn');
        if (hitBtn) {
            hitBtn.addEventListener('click', () => this.handleBlackjackAction('hit'));
        }

        // Stand button
        const standBtn = document.getElementById('stand-btn');
        if (standBtn) {
            standBtn.addEventListener('click', () => this.handleBlackjackAction('stand'));
        }

        // Double Down button
        const doubleBtn = document.getElementById('double-btn');
        if (doubleBtn) {
            doubleBtn.addEventListener('click', () => this.handleBlackjackAction('double_down'));
        }

        // Split button
        const splitBtn = document.getElementById('split-btn');
        if (splitBtn) {
            splitBtn.addEventListener('click', () => this.handleBlackjackAction('split'));
        }

        // Insurance button
        const insuranceBtn = document.getElementById('insurance-btn');
        if (insuranceBtn) {
            insuranceBtn.addEventListener('click', () => this.handleBlackjackAction('take_insurance'));
        }
    }

    handleBlackjackAction(action) {
        if (!this.activeGame || this.activeGame.constructor.name !== 'BlackjackGame') return;

        let result;
        switch (action) {
            case 'hit':
                result = this.activeGame.hit();
                break;
            case 'stand':
                result = this.activeGame.stand();
                break;
            case 'double_down':
                result = this.activeGame.doubleDown();
                break;
            case 'split':
                result = this.activeGame.split();
                break;
            case 'take_insurance':
                result = this.activeGame.takeInsurance();
                break;
            default:
                return;
        }

        if (result.success) {
            this.addBlackjackEvent(result.message, this.getEventType(result));
            this.updateBlackjackDisplay();
            
            if (result.gameResult) {
                this.handleBlackjackGameEnd(result.gameResult);
            }
        } else {
            this.showStreetMessage(`Yo, ${result.message}`, 'error');
        }
    }

    updateBlackjackDisplay() {
        if (!this.activeGame) return;

        const gameState = this.activeGame.getGameState();
        
        // Update dealer cards
        this.updateDealerCards(gameState);
        
        // Update player hands
        this.updatePlayerHands(gameState);
        
        // Update available actions
        this.updateActionButtons(gameState);
        
        // Update betting info
        const currentBet = document.getElementById('current-bet');
        const currentBankroll = document.getElementById('current-bankroll');
        if (currentBet) currentBet.textContent = gameState.currentBet;
        if (currentBankroll) currentBankroll.textContent = this.currentPlayer.empire.resources;
    }

    updateDealerCards(gameState) {
        const dealerCards = document.getElementById('dealer-cards');
        const dealerTotal = document.getElementById('dealer-total');
        
        if (!dealerCards || !dealerTotal) return;

        dealerCards.innerHTML = '';
        
        // Show dealer's up card
        if (gameState.dealerHand && gameState.dealerHand.length > 0) {
            gameState.dealerHand.forEach(card => {
                const cardElement = this.createCardElement(card);
                dealerCards.appendChild(cardElement);
            });
        }
        
        // Show hole card if game is finished or dealer's turn
        if (gameState.gameState === 'finished' || gameState.gameState === 'dealer_turn') {
            const total = this.activeGame.calculateHandValue(gameState.dealerHand);
            dealerTotal.textContent = `Total: ${total}${total > 21 ? ' - BUST!' : ''}`;
        } else if (gameState.dealerHand && gameState.dealerHand.length > 0) {
            // Show hole card placeholder
            const holeCard = this.createCardElement(null, true);
            dealerCards.appendChild(holeCard);
            dealerTotal.textContent = `Total: ${this.activeGame.calculateHandValue([gameState.dealerHand[0]])} + ?`;
        }
    }

    updatePlayerHands(gameState) {
        const playerHands = document.getElementById('player-hands');
        if (!playerHands) return;

        playerHands.innerHTML = '';
        
        gameState.playerHands.forEach((hand, index) => {
            const handContainer = document.createElement('div');
            handContainer.className = `hand-container${index === gameState.activeHandIndex ? ' active' : ''}`;
            
            const cardArea = document.createElement('div');
            cardArea.id = `player-cards-${index}`;
            cardArea.className = 'card-area';
            
            hand.forEach(card => {
                const cardElement = this.createCardElement(card);
                cardArea.appendChild(cardElement);
            });
            
            const handTotal = document.createElement('div');
            handTotal.id = `player-total-${index}`;
            handTotal.className = 'hand-total';
            const total = this.activeGame.calculateHandValue(hand);
            handTotal.textContent = `Total: ${total}${total > 21 ? ' - BUST!' : ''}${total === 21 && hand.length === 2 ? ' - BLACKJACK!' : ''}`;
            
            if (gameState.playerHands.length > 1) {
                const handLabel = document.createElement('div');
                handLabel.textContent = `Hand ${index + 1}`;
                handLabel.className = 'hand-label';
                handContainer.appendChild(handLabel);
            }
            
            handContainer.appendChild(cardArea);
            handContainer.appendChild(handTotal);
            playerHands.appendChild(handContainer);
        });
    }

    updateActionButtons(gameState) {
        const actions = gameState.availableActions;
        
        document.getElementById('hit-btn').disabled = !actions.includes('hit');
        document.getElementById('stand-btn').disabled = !actions.includes('stand');
        document.getElementById('double-btn').disabled = !actions.includes('double_down');
        document.getElementById('split-btn').disabled = !actions.includes('split');
        
        const insuranceBtn = document.getElementById('insurance-btn');
        if (gameState.gameState === 'insurance_offered') {
            insuranceBtn.classList.remove('hidden');
            insuranceBtn.disabled = false;
        } else {
            insuranceBtn.classList.add('hidden');
        }
    }

    createCardElement(card, isHoleCard = false) {
        const cardElement = document.createElement('div');
        cardElement.className = 'playing-card';
        
        if (isHoleCard) {
            cardElement.classList.add('hole-card');
            cardElement.innerHTML = `
                <div class="card-rank">?</div>
                <div class="card-suit">?</div>
            `;
        } else if (card) {
            const isRed = card.suit === 'hearts' || card.suit === 'diamonds';
            cardElement.classList.add(isRed ? 'red' : 'black');
            
            let displayRank = card.rank.toUpperCase();
            if (displayRank === 'JACK') displayRank = 'J';
            else if (displayRank === 'QUEEN') displayRank = 'Q';
            else if (displayRank === 'KING') displayRank = 'K';
            else if (displayRank === 'ACE') displayRank = 'A';
            
            const suitSymbols = {
                hearts: '♥',
                diamonds: '♦',
                clubs: '♣',
                spades: '♠'
            };
            
            cardElement.innerHTML = `
                <div class="card-rank">${displayRank}</div>
                <div class="card-suit">${suitSymbols[card.suit] || card.suit}</div>
            `;
        }
        
        return cardElement;
    }

    addBlackjackEvent(message, type = 'normal') {
        const eventsContainer = document.getElementById('blackjack-events');
        if (!eventsContainer) return;

        const eventDiv = document.createElement('div');
        eventDiv.className = `event-message event-${type}`;
        eventDiv.textContent = message;

        eventsContainer.appendChild(eventDiv);
        eventsContainer.scrollTop = eventsContainer.scrollHeight;
    }

    getEventType(result) {
        if (result.bust) return 'loss';
        if (result.outcome === 'blackjack') return 'blackjack';
        if (result.outcome === 'win') return 'win';
        if (result.outcome === 'loss') return 'loss';
        return 'normal';
    }

    handleBlackjackGameEnd(gameResult) {
        // Update player display
        this.updatePlayerDisplay();
        this.savePlayerData();

        // Determine overall result message
        let overallMessage = '';
        let totalNetGain = 0;

        if (gameResult.results) {
            // Multiple hands (from splits)
            totalNetGain = gameResult.totalNetGain;
            const wins = gameResult.results.filter(r => r.outcome === 'win' || r.outcome === 'blackjack').length;
            const losses = gameResult.results.filter(r => r.outcome === 'loss' || r.outcome === 'bust').length;
            
            if (wins > losses) {
                overallMessage = this.getRandomStreetTalk('win');
            } else if (losses > wins) {
                overallMessage = this.getRandomStreetTalk('loss');
            } else {
                overallMessage = this.getRandomStreetTalk('push');
            }
        } else {
            // Single hand
            totalNetGain = gameResult.netGain;
            overallMessage = gameResult.message;
        }

        // Show final message
        setTimeout(() => {
            this.showStreetMessage(overallMessage, totalNetGain > 0 ? 'success' : totalNetGain < 0 ? 'error' : 'info');
        }, 1500);

        // Disable all action buttons
        document.querySelectorAll('.game-action-btn').forEach(btn => {
            btn.disabled = true;
        });
    }

    getBetAmount(gameName, minBet, maxBet) {
        const defaultBet = Math.min(50, maxBet);
        const userInput = prompt(
            `${gameName}\n\nPlace your bet, player!\n\nMinimum: $${minBet}\nMaximum: $${maxBet}\nYour bankroll: $${this.currentPlayer.empire.resources}\n\nEnter bet amount:`,
            defaultBet
        );
        
        if (userInput === null) return null; // User cancelled
        
        const betAmount = parseInt(userInput);
        
        if (isNaN(betAmount) || betAmount < minBet || betAmount > maxBet) {
            this.showStreetMessage(`Invalid bet! Must be between $${minBet} and $${maxBet}`, 'error');
            return null;
        }
        
        if (betAmount > this.currentPlayer.empire.resources) {
            this.showStreetMessage(`Not enough bankroll! You need $${betAmount} but only have $${this.currentPlayer.empire.resources}`, 'error');
            return null;
        }
        
        return betAmount;
    }

    renderBlackjackUI() {
        const gameContent = document.getElementById('game-content');
        if (!gameContent || !this.activeGame) return;

        gameContent.innerHTML = `
            <div class="blackjack-interface">
                <div class="game-status">
                    <h3 class="status-title">Blackjack Royalty</h3>
                    <div id="blackjack-status" class="game-status-text">Place your bet and let's see who runs this table!</div>
                </div>
                
                <div class="card-table">
                    <!-- Dealer Section -->
                    <div class="dealer-section">
                        <h4 class="section-title">House Dealer</h4>
                        <div id="dealer-cards" class="card-area">
                            <div class="card-placeholder">Dealer's cards will appear here</div>
                        </div>
                        <div id="dealer-total" class="hand-total">Total: ?</div>
                    </div>
                    
                    <!-- Player Section -->
                    <div class="player-section">
                        <h4 class="section-title">${this.currentPlayer.name} (You)</h4>
                        <div id="player-hands" class="player-hands">
                            <div class="hand-container">
                                <div id="player-cards-0" class="card-area">
                                    <div class="card-placeholder">Your cards will appear here</div>
                                </div>
                                <div id="player-total-0" class="hand-total">Total: 0</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Game Controls -->
                <div class="game-controls">
                    <div class="betting-info">
                        <span class="bet-amount">Bet: $<span id="current-bet">${this.activeGame.currentBet}</span></span>
                        <span class="bankroll">Bankroll: $<span id="current-bankroll">${this.currentPlayer.empire.resources}</span></span>
                    </div>
                    
                    <div class="action-buttons">
                        <button id="hit-btn" class="game-action-btn">Hit Me!</button>
                        <button id="stand-btn" class="game-action-btn">Stand</button>
                        <button id="double-btn" class="game-action-btn">Double Down</button>
                        <button id="split-btn" class="game-action-btn">Split</button>
                        <button id="insurance-btn" class="game-action-btn hidden">Insurance</button>
                    </div>
                </div>
                
                <!-- Game Log -->
                <div class="game-log">
                    <h4 class="log-title">Game Events</h4>
                    <div id="blackjack-events" class="events-container">
                        Welcome to Blackjack Royalty! Time to show the house who's boss!
                    </div>
                </div>
            </div>
        `;

        // Add Blackjack-specific styles
        this.addBlackjackStyles();
        
        // Set up event listeners
        this.setupBlackjackControls();
        
        // Update the display with initial game state
        this.updateBlackjackDisplay();
    }

    addBlackjackStyles() {
        if (document.getElementById('blackjack-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'blackjack-styles';
        styles.textContent = `
            .blackjack-interface {
                display: flex;
                flex-direction: column;
                gap: 25px;
                font-family: 'Orbitron', monospace;
                color: var(--neon-white);
            }
            
            .game-status {
                text-align: center;
                background: linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(138, 43, 226, 0.1));
                padding: 20px;
                border-radius: 15px;
                border: 1px solid var(--empire-gold);
            }
            
            .status-title {
                color: var(--empire-gold);
                margin-bottom: 10px;
                text-shadow: 0 0 10px var(--empire-gold);
                font-size: 1.5rem;
            }
            
            .game-status-text {
                color: var(--empire-cyan);
                font-size: 1.1rem;
                font-weight: bold;
            }
            
            .card-table {
                display: grid;
                grid-template-columns: 1fr;
                gap: 30px;
                background: linear-gradient(135deg, rgba(0, 0, 0, 0.7), rgba(0, 100, 0, 0.1));
                padding: 30px;
                border-radius: 20px;
                border: 2px solid var(--cash-green);
            }
            
            .dealer-section,
            .player-section {
                text-align: center;
            }
            
            .section-title {
                color: var(--empire-gold);
                margin-bottom: 20px;
                font-size: 1.3rem;
                text-shadow: 0 0 10px var(--empire-gold);
            }
            
            .card-area {
                display: flex;
                justify-content: center;
                gap: 10px;
                margin-bottom: 15px;
                min-height: 120px;
                align-items: center;
                flex-wrap: wrap;
            }
            
            .card-placeholder {
                color: var(--empire-cyan);
                font-style: italic;
                opacity: 0.7;
            }
            
            .playing-card {
                width: 80px;
                height: 110px;
                background: linear-gradient(135deg, #fff, #f0f0f0);
                border: 2px solid var(--empire-gold);
                border-radius: 10px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                color: var(--shadow-black);
                font-weight: bold;
                font-size: 0.9rem;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
                transition: transform 0.3s ease;
            }
            
            .playing-card:hover {
                transform: translateY(-5px);
            }
            
            .playing-card.red {
                color: #dc143c;
            }
            
            .playing-card.black {
                color: var(--shadow-black);
            }
            
            .playing-card.hole-card {
                background: linear-gradient(135deg, #4169e1, #1e90ff);
                color: var(--neon-white);
            }
            
            .card-rank {
                font-size: 1.1rem;
                font-weight: bold;
            }
            
            .card-suit {
                font-size: 1.2rem;
                margin-top: 5px;
            }
            
            .hand-total {
                font-size: 1.2rem;
                font-weight: bold;
                color: var(--empire-cyan);
                margin-top: 10px;
            }
            
            .player-hands {
                display: flex;
                justify-content: center;
                gap: 30px;
                flex-wrap: wrap;
            }
            
            .hand-container {
                display: flex;
                flex-direction: column;
                align-items: center;
            }
            
            .hand-container.active {
                border: 2px solid var(--empire-gold);
                border-radius: 15px;
                padding: 15px;
                background: rgba(255, 215, 0, 0.1);
            }
            
            .game-controls {
                background: rgba(0, 0, 0, 0.5);
                padding: 25px;
                border-radius: 15px;
                border: 1px solid var(--empire-cyan);
            }
            
            .betting-info {
                display: flex;
                justify-content: space-around;
                margin-bottom: 20px;
                font-size: 1.1rem;
                font-weight: bold;
            }
            
            .bet-amount {
                color: var(--empire-gold);
            }
            
            .bankroll {
                color: var(--cash-green);
            }
            
            .action-buttons {
                display: flex;
                justify-content: center;
                gap: 15px;
                flex-wrap: wrap;
            }
            
            .game-action-btn {
                padding: 12px 25px;
                background: var(--gold-gradient);
                border: none;
                border-radius: 8px;
                color: var(--shadow-black);
                font-size: 1rem;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.3s ease;
                text-transform: uppercase;
                letter-spacing: 1px;
                font-family: 'Orbitron', monospace;
                min-width: 120px;
            }
            
            .game-action-btn:hover:not(:disabled) {
                background: var(--purple-gradient);
                color: var(--neon-white);
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(138, 43, 226, 0.5);
            }
            
            .game-action-btn:disabled {
                background: #666;
                cursor: not-allowed;
                transform: none;
                box-shadow: none;
                opacity: 0.5;
            }
            
            .game-action-btn.hidden {
                display: none;
            }
            
            .game-log {
                background: rgba(0, 0, 0, 0.5);
                padding: 20px;
                border-radius: 15px;
                border: 1px solid var(--empire-cyan);
            }
            
            .log-title {
                color: var(--empire-cyan);
                margin-bottom: 15px;
                text-align: center;
            }
            
            .events-container {
                max-height: 150px;
                overflow-y: auto;
                color: var(--neon-white);
                line-height: 1.5;
                font-size: 0.9rem;
            }
            
            .event-message {
                margin-bottom: 8px;
                padding: 5px 10px;
                border-left: 3px solid var(--empire-cyan);
                background: rgba(0, 255, 255, 0.05);
            }
            
            .event-win {
                border-left-color: var(--cash-green);
                background: rgba(0, 255, 0, 0.05);
            }
            
            .event-loss {
                border-left-color: var(--royal-red);
                background: rgba(220, 20, 60, 0.05);
            }
            
            .event-blackjack {
                border-left-color: var(--empire-gold);
                background: rgba(255, 215, 0, 0.1);
                animation: goldGlow 0.5s ease;
            }
            
            @keyframes goldGlow {
                0% { background: rgba(255, 215, 0, 0.3); }
                100% { background: rgba(255, 215, 0, 0.1); }
            }
            
            @media (max-width: 768px) {
                .card-table {
                    padding: 20px;
                }
                
                .action-buttons {
                    gap: 10px;
                }
                
                .game-action-btn {
                    min-width: 100px;
                    padding: 10px 15px;
                    font-size: 0.9rem;
                }
                
                .playing-card {
                    width: 70px;
                    height: 95px;
                }
            }
        `;
        
        document.head.appendChild(styles);
    }

    setupBlackjackControls() {
        this.showStreetMessage(`${gameName} is coming soon! We're putting the finishing touches on that masterpiece!`, 'info');
    }

    toggleAudio() {
        this.audioEnabled = !this.audioEnabled;
        const audioInfo = document.querySelector('.audio-info');
        const audioToggle = document.getElementById('audio-toggle');
        
        if (audioInfo) {
            audioInfo.textContent = `Vibes: ${this.audioEnabled ? 'ON' : 'OFF'}`;
        }
        
        if (audioToggle) {
            audioToggle.textContent = this.audioEnabled ? '🎵' : '🔇';
        }
    }

    toggleHelpModal() {
        const helpModal = document.getElementById('help-modal');
        if (helpModal) {
            helpModal.classList.toggle('hidden');
            
            // Show message about help
            if (!helpModal.classList.contains('hidden')) {
                console.log('📚 Showing keyboard shortcuts and pro tips...');
            }
        }
    }

    playHoverSound() {
        if (!this.audioEnabled) return;
        // Placeholder for hover sound effect
        console.log('🎵 Hover sound effect');
    }

    showGamePreview(gameCard) {
        const gameTitle = gameCard.querySelector('.game-title')?.textContent;
        if (gameTitle) {
            console.log(`👀 Previewing: ${gameTitle}`);
        }
    }

    showCharacterDetails(characterCard) {
        const characterName = characterCard.querySelector('.character-name')?.textContent;
        const characterBio = characterCard.querySelector('.character-bio')?.textContent;
        
        if (characterName && characterBio) {
            alert(`${characterName}\n\n${characterBio}`);
        }
    }

    handleKeyboardShortcuts(event) {
        if (event.ctrlKey || event.metaKey) return;

        switch (event.key.toLowerCase()) {
            case 'escape':
                // Close help modal first, then back to arcade if in game
                const helpModal = document.getElementById('help-modal');
                if (helpModal && !helpModal.classList.contains('hidden')) {
                    this.toggleHelpModal();
                } else if (this.activeGame) {
                    this.backToArcade();
                }
                break;
            case ' ':
                if (this.activeGame && document.getElementById('draw-cards-btn')) {
                    event.preventDefault();
                    this.handleCardDraw();
                }
                break;
            case 'm':
                this.toggleAudio();
                break;
            case 'h':
            case '?':
                this.toggleHelpModal();
                break;
        }
    }

    getRandomStreetTalk(category) {
        const messages = this.streetTalk[category] || ['Let\'s keep it moving!'];
        return messages[Math.floor(Math.random() * messages.length)];
    }

    showStreetMessage(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `street-notification ${type}`;
        notification.textContent = message;
        
        // Add styles if not already added
        if (!document.getElementById('notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'notification-styles';
            styles.textContent = `
                .street-notification {
                    position: fixed;
                    top: 80px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: linear-gradient(135deg, rgba(0, 0, 0, 0.9), rgba(138, 43, 226, 0.3));
                    color: var(--neon-white);
                    padding: 15px 25px;
                    border-radius: 10px;
                    border: 2px solid var(--empire-cyan);
                    z-index: 2000;
                    animation: notificationSlide 0.5s ease, notificationFade 0.5s ease 3s;
                    font-family: 'Orbitron', monospace;
                    font-weight: bold;
                    text-align: center;
                    max-width: 90%;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
                }
                
                .street-notification.success {
                    border-color: var(--cash-green);
                    background: linear-gradient(135deg, rgba(0, 255, 0, 0.1), rgba(0, 0, 0, 0.9));
                }
                
                .street-notification.error {
                    border-color: var(--royal-red);
                    background: linear-gradient(135deg, rgba(220, 20, 60, 0.1), rgba(0, 0, 0, 0.9));
                }
                
                @keyframes notificationSlide {
                    from { transform: translateX(-50%) translateY(-100px); opacity: 0; }
                    to { transform: translateX(-50%) translateY(0); opacity: 1; }
                }
                
                @keyframes notificationFade {
                    from { opacity: 1; }
                    to { opacity: 0; }
                }
            `;
            document.head.appendChild(styles);
        }

        document.body.appendChild(notification);

        // Remove after animation
        setTimeout(() => {
            notification.remove();
        }, 4000);
    }

    savePlayerData() {
        if (this.currentPlayer) {
            try {
                localStorage.setItem('pimpinspempire_player', JSON.stringify(this.currentPlayer.export()));
                console.log('💾 Player data saved successfully');
            } catch (error) {
                console.error('❌ Failed to save player data:', error);
            }
        }
    }

    // Auto-save every 30 seconds
    startAutoSave() {
        setInterval(() => {
            this.savePlayerData();
        }, 30000);
    }
}

// Initialize the arcade UI when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (window.gameEngine) {
        console.log('🎮 Initializing arcade UI...');
        window.arcadeUI = new ArcadeUI();
        window.arcadeUI.startAutoSave();
    }
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ArcadeUI;
} else {
    window.ArcadeUI = ArcadeUI;
}