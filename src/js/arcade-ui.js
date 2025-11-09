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
                this.showComingSoon('Blackjack Royalty');
                break;
            case 'high-low':
                this.showComingSoon('High-Low Empire');
                break;
            default:
                this.showComingSoon('This Game');
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

    showComingSoon(gameName) {
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