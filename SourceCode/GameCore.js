/**
 * GameCore.js - The main game loop and engine for Pimpins Empire
 * Based on the game loop pattern described in the project documentation
 * 
 * @author Krissi & K
 * @version 1.8.0
 */

class PimpinsPempireGameEngine {
    constructor() {
        this.gameState = 'INITIALIZING';
        this.deltaTime = 0;
        this.lastFrameTime = 0;
        this.targetFPS = 60;
        this.frameInterval = 1000 / this.targetFPS;
        
        // Core game systems
        this.players = [];
        this.currentGame = null;
        this.assets = {};
        this.eventQueue = [];
        
        // Bind methods to maintain context
        this.gameLoop = this.gameLoop.bind(this);
        this.update = this.update.bind(this);
        this.render = this.render.bind(this);
    }

    /**
     * 1. INITIALIZATION PHASE (Run once at startup)
     */
    async initializeGameEngine() {
        console.log('🎮 Initializing Pimpins Empire Game Engine v1.8.0...');
        
        try {
            await this.loadAssets();
            this.createPlayersAndWorld();
            this.setupEventListeners();
            this.gameState = 'RUNNING';
            
            console.log('✅ Game Engine initialized successfully!');
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize game engine:', error);
            this.gameState = 'ERROR';
            return false;
        }
    }

    async loadAssets() {
        console.log('📦 Loading game assets...');
        
        // TODO: Implement actual asset loading
        // This will load images, sounds, and other resources
        this.assets = {
            cards: {},
            characters: {},
            sounds: {},
            ui: {}
        };
        
        // Simulate asset loading delay
        await new Promise(resolve => setTimeout(resolve, 100));
        console.log('✅ Assets loaded successfully');
    }

    createPlayersAndWorld() {
        console.log('🌍 Creating players and game world...');
        
        // Initialize the game world and default player
        this.players = [];
        this.gameWorld = {
            currentScene: 'MAIN_MENU',
            activeGames: [],
            empire: {
                level: 1,
                resources: 1000,
                reputation: 0
            }
        };
        
        console.log('✅ Game world created');
    }

    setupEventListeners() {
        console.log('🎧 Setting up event listeners...');
        
        // Keyboard events
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
        document.addEventListener('keyup', this.handleKeyUp.bind(this));
        
        // Mouse events
        document.addEventListener('click', this.handleMouseClick.bind(this));
        document.addEventListener('mousemove', this.handleMouseMove.bind(this));
        
        // Window events
        window.addEventListener('resize', this.handleWindowResize.bind(this));
        window.addEventListener('beforeunload', this.handleWindowClose.bind(this));
        
        console.log('✅ Event listeners ready');
    }

    /**
     * 2. THE MAIN LOOP (Run many times per second)
     */
    gameLoop(currentTime) {
        // Calculate delta time
        this.deltaTime = currentTime - this.lastFrameTime;
        
        // Only run the loop if enough time has passed (frame rate limiting)
        if (this.deltaTime >= this.frameInterval) {
            // --- INPUT AND EVENTS ---
            this.processPlayerInput();
            this.handleSystemEvents();
            
            // --- UPDATE (Game Logic) ---
            this.update(this.deltaTime);
            
            // --- RENDER (Drawing) ---
            this.render();
            
            // --- HOUSEKEEPING ---
            this.checkForGameOverConditions();
            
            this.lastFrameTime = currentTime;
        }
        
        // Continue the loop if game is running
        if (this.gameState === 'RUNNING') {
            requestAnimationFrame(this.gameLoop);
        }
    }

    processPlayerInput() {
        // Process any queued input events
        while (this.eventQueue.length > 0) {
            const event = this.eventQueue.shift();
            this.handleEvent(event);
        }
    }

    handleSystemEvents() {
        // Handle window resize, focus changes, etc.
        // This ensures the game runs at the same speed on all computers
    }

    /**
     * Update game logic based on delta time
     * @param {number} dt - Delta time since last frame
     */
    update(dt) {
        // Update physics (if any)
        this.updatePhysics(dt);
        
        // Update game logic
        this.updateGameLogic(dt);
        
        // Update animations
        this.updateAnimations(dt);
        
        // Update current game if one is active
        if (this.currentGame) {
            this.currentGame.update(dt);
        }
    }

    updatePhysics(dt) {
        // For card games, this might handle card movement animations
        // For table games, this could handle piece movements
    }

    updateGameLogic(dt) {
        // Update empire status, player stats, game timers, etc.
        if (this.gameWorld.empire) {
            // Passive empire growth logic could go here
        }
    }

    updateAnimations(dt) {
        // Update any ongoing animations (card flips, UI transitions, etc.)
    }

    /**
     * Render the current game state
     */
    render() {
        // Clear screen
        this.clearScreen();
        
        // Render game world
        this.renderGameWorld();
        
        // Render user interface
        this.renderUserInterface();
        
        // Render current game if active
        if (this.currentGame) {
            this.currentGame.render();
        }
    }

    clearScreen() {
        // Clear the canvas or reset DOM elements
        const gameContainer = document.getElementById('game-container');
        if (gameContainer) {
            // Clear previous frame if using canvas
        }
    }

    renderGameWorld() {
        // Render the main game environment
        // This includes backgrounds, UI elements, character portraits, etc.
    }

    renderUserInterface() {
        // Render HUD, menus, buttons, empire status, etc.
        this.renderEmpireStatus();
        this.renderMainMenu();
    }

    renderEmpireStatus() {
        // Display current empire level, resources, reputation
        const statusElement = document.getElementById('empire-status');
        if (statusElement && this.gameWorld.empire) {
            statusElement.innerHTML = `
                <div class="empire-stats">
                    <span>Level: ${this.gameWorld.empire.level}</span>
                    <span>Resources: ${this.gameWorld.empire.resources}</span>
                    <span>Reputation: ${this.gameWorld.empire.reputation}</span>
                </div>
            `;
        }
    }

    renderMainMenu() {
        // Render main menu based on current scene
        if (this.gameWorld.currentScene === 'MAIN_MENU') {
            // Show main menu options
        }
    }

    checkForGameOverConditions() {
        // Check if any win/lose conditions are met
        // Check for errors or system issues
        if (this.gameState === 'ERROR') {
            this.handleGameError();
        }
    }

    /**
     * Event Handlers
     */
    handleEvent(event) {
        switch (event.type) {
            case 'game_start':
                this.startGame(event.gameType);
                break;
            case 'game_end':
                this.endGame(event.result);
                break;
            case 'player_action':
                this.handlePlayerAction(event.action, event.data);
                break;
            default:
                console.log('Unhandled event:', event);
        }
    }

    handleKeyDown(event) {
        // Queue keyboard events for processing in the main loop
        this.eventQueue.push({
            type: 'keydown',
            key: event.key,
            code: event.code,
            timestamp: Date.now()
        });
    }

    handleKeyUp(event) {
        this.eventQueue.push({
            type: 'keyup',
            key: event.key,
            code: event.code,
            timestamp: Date.now()
        });
    }

    handleMouseClick(event) {
        this.eventQueue.push({
            type: 'click',
            x: event.clientX,
            y: event.clientY,
            button: event.button,
            timestamp: Date.now()
        });
    }

    handleMouseMove(event) {
        // Only queue mouse move events occasionally to avoid flooding
        if (Date.now() - this.lastMouseEvent > 16) { // ~60fps
            this.eventQueue.push({
                type: 'mousemove',
                x: event.clientX,
                y: event.clientY,
                timestamp: Date.now()
            });
            this.lastMouseEvent = Date.now();
        }
    }

    handleWindowResize(event) {
        this.eventQueue.push({
            type: 'resize',
            width: window.innerWidth,
            height: window.innerHeight,
            timestamp: Date.now()
        });
    }

    handleWindowClose(event) {
        this.saveGameData();
    }

    /**
     * Game Management
     */
    startGame(gameType) {
        console.log(`🎲 Starting ${gameType} game...`);
        
        switch (gameType) {
            case 'knk-draw':
                this.currentGame = new KnKDrawGame();
                break;
            case 'blackjack':
                this.currentGame = new BlackjackGame();
                break;
            case 'high-low':
                this.currentGame = new HighLowGame();
                break;
            default:
                console.warn(`Unknown game type: ${gameType}`);
                return;
        }
        
        if (this.currentGame) {
            this.currentGame.initialize();
            this.gameWorld.currentScene = 'GAME_ACTIVE';
        }
    }

    endGame(result) {
        console.log('🏁 Game ended with result:', result);
        
        if (result.won) {
            this.gameWorld.empire.reputation += result.reputationGain || 10;
            this.gameWorld.empire.resources += result.resourceGain || 100;
        }
        
        this.currentGame = null;
        this.gameWorld.currentScene = 'MAIN_MENU';
    }

    handlePlayerAction(action, data) {
        if (this.currentGame) {
            this.currentGame.handlePlayerAction(action, data);
        }
    }

    /**
     * 3. CLEANUP PHASE (Run once on exit)
     */
    saveGameData() {
        console.log('💾 Saving game data...');
        
        const gameData = {
            empire: this.gameWorld.empire,
            players: this.players,
            settings: {
                // Game settings
            },
            timestamp: Date.now()
        };
        
        try {
            localStorage.setItem('pimpinspempire_save', JSON.stringify(gameData));
            console.log('✅ Game data saved successfully');
        } catch (error) {
            console.error('❌ Failed to save game data:', error);
        }
    }

    unloadAssets() {
        console.log('🗑️ Unloading assets...');
        this.assets = {};
    }

    closeGameEngine() {
        console.log('🛑 Closing game engine...');
        
        this.saveGameData();
        this.unloadAssets();
        this.gameState = 'SHUTDOWN';
        
        console.log('👋 Game engine shut down successfully');
    }

    /**
     * Utility Methods
     */
    handleGameError() {
        console.error('❌ Game error detected, attempting recovery...');
        // Attempt to recover from errors
        // If recovery fails, show error message to user
    }

    // Public API for external interaction
    getGameState() {
        return this.gameState;
    }

    getEmpireStatus() {
        return this.gameWorld.empire;
    }

    addPlayer(playerData) {
        this.players.push(playerData);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PimpinsPempireGameEngine;
} else {
    window.PimpinsPempireGameEngine = PimpinsPempireGameEngine;
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DOM loaded, initializing Pimpins Empire...');
    
    window.gameEngine = new PimpinsPempireGameEngine();
    window.gameEngine.initializeGameEngine().then(success => {
        if (success) {
            // Start the main game loop
            requestAnimationFrame(window.gameEngine.gameLoop);
            console.log('🎮 Pimpins Empire is ready to play!');
        } else {
            console.error('❌ Failed to start Pimpins Empire');
        }
    });
});