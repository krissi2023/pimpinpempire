/**
 * Player.js - Player management system for Pimpins Empire
 * Handles player data, statistics, empire progression, and game state
 * 
 * @author Krissi & K
 * @version 1.8.0
 */

class Player {
    constructor(name = 'Player', type = 'human') {
        this.id = this.generatePlayerId();
        this.name = name;
        this.type = type; // 'human', 'ai', 'guest'
        this.createdAt = Date.now();
        
        // Empire stats
        this.empire = {
            level: 1,
            experience: 0,
            resources: 1000,
            reputation: 0,
            titles: []
        };
        
        // Game statistics
        this.stats = {
            gamesPlayed: 0,
            gamesWon: 0,
            totalEarnings: 0,
            favoriteGame: null,
            achievements: [],
            winStreak: 0,
            bestWinStreak: 0
        };
        
        // Current game state
        this.currentGame = {
            hand: [],
            bet: 0,
            score: 0,
            status: 'waiting', // 'waiting', 'playing', 'won', 'lost'
            actions: []
        };
        
        // Player settings
        this.settings = {
            autoPlay: false,
            soundEnabled: true,
            animationsEnabled: true,
            theme: 'empire',
            difficulty: 'normal'
        };

        console.log(`👤 Player "${this.name}" created with ID: ${this.id}`);
    }

    /**
     * Generates a unique player ID
     * @returns {string} Unique player ID
     */
    generatePlayerId() {
        return 'player_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Empire Management
     */
    
    /**
     * Adds experience points and handles level ups
     * @param {number} xp - Experience points to add
     * @param {string} source - Source of the XP (game type, achievement, etc.)
     */
    addExperience(xp, source = 'game') {
        const oldLevel = this.empire.level;
        this.empire.experience += xp;
        
        // Check for level up
        const newLevel = this.calculateLevel(this.empire.experience);
        if (newLevel > oldLevel) {
            this.levelUp(oldLevel, newLevel);
        }
        
        console.log(`📈 ${this.name} gained ${xp} XP from ${source}. Total XP: ${this.empire.experience}`);
    }

    /**
     * Calculates player level based on experience
     * @param {number} experience - Total experience points
     * @returns {number} Player level
     */
    calculateLevel(experience) {
        // Level formula: Level = floor(sqrt(XP / 100)) + 1
        // Level 1: 0-99 XP, Level 2: 100-399 XP, Level 3: 400-899 XP, etc.
        return Math.floor(Math.sqrt(experience / 100)) + 1;
    }

    /**
     * Handles level up process
     * @param {number} oldLevel - Previous level
     * @param {number} newLevel - New level
     */
    levelUp(oldLevel, newLevel) {
        this.empire.level = newLevel;
        
        // Level up rewards
        const resourceBonus = (newLevel - oldLevel) * 200;
        const reputationBonus = (newLevel - oldLevel) * 10;
        
        this.empire.resources += resourceBonus;
        this.empire.reputation += reputationBonus;
        
        // Check for title unlocks
        this.checkTitleUnlocks();
        
        console.log(`🎉 ${this.name} leveled up! ${oldLevel} → ${newLevel}`);
        console.log(`💰 Bonus: ${resourceBonus} resources, ${reputationBonus} reputation`);
        
        // Return level up data for UI display
        return {
            oldLevel,
            newLevel,
            resourceBonus,
            reputationBonus,
            newTitles: this.empire.titles.filter(title => title.level === newLevel)
        };
    }

    /**
     * Checks for new title unlocks based on level and achievements
     */
    checkTitleUnlocks() {
        const potentialTitles = [
            { name: 'Rising Star', level: 2, description: 'Reached level 2' },
            { name: 'Empire Builder', level: 5, description: 'Reached level 5' },
            { name: 'High Roller', level: 10, description: 'Reached level 10' },
            { name: 'Card Master', level: 15, description: 'Mastered the cards' },
            { name: 'Diamond Elite', level: 20, description: 'Elite empire status' },
            { name: 'Pimpin Royalty', level: 25, description: 'True royalty achieved' }
        ];

        potentialTitles.forEach(title => {
            if (this.empire.level >= title.level && !this.hasTitle(title.name)) {
                this.empire.titles.push({
                    name: title.name,
                    description: title.description,
                    level: title.level,
                    unlockedAt: Date.now()
                });
                console.log(`👑 ${this.name} unlocked title: "${title.name}"`);
            }
        });
    }

    /**
     * Checks if player has a specific title
     * @param {string} titleName - Name of the title to check
     * @returns {boolean} True if player has the title
     */
    hasTitle(titleName) {
        return this.empire.titles.some(title => title.name === titleName);
    }

    /**
     * Resource Management
     */
    
    /**
     * Adds resources to player's empire
     * @param {number} amount - Amount to add
     * @param {string} source - Source of the resources
     */
    addResources(amount, source = 'game') {
        this.empire.resources += amount;
        this.stats.totalEarnings += amount;
        
        console.log(`💰 ${this.name} gained ${amount} resources from ${source}. Total: ${this.empire.resources}`);
    }

    /**
     * Spends resources if player has enough
     * @param {number} amount - Amount to spend
     * @param {string} purpose - What the resources are for
     * @returns {boolean} True if transaction successful
     */
    spendResources(amount, purpose = 'purchase') {
        if (this.empire.resources >= amount) {
            this.empire.resources -= amount;
            console.log(`💸 ${this.name} spent ${amount} resources for ${purpose}. Remaining: ${this.empire.resources}`);
            return true;
        } else {
            console.log(`❌ ${this.name} doesn't have enough resources. Need: ${amount}, Have: ${this.empire.resources}`);
            return false;
        }
    }

    /**
     * Adds reputation points
     * @param {number} amount - Reputation to add
     * @param {string} source - Source of the reputation
     */
    addReputation(amount, source = 'game') {
        this.empire.reputation += amount;
        console.log(`⭐ ${this.name} gained ${amount} reputation from ${source}. Total: ${this.empire.reputation}`);
    }

    /**
     * Game State Management
     */
    
    /**
     * Starts a new game for the player
     * @param {string} gameType - Type of game being started
     */
    startGame(gameType) {
        this.currentGame = {
            hand: [],
            bet: 0,
            score: 0,
            status: 'playing',
            actions: [],
            gameType: gameType,
            startedAt: Date.now()
        };
        
        console.log(`🎮 ${this.name} started playing ${gameType}`);
    }

    /**
     * Ends the current game and updates statistics
     * @param {string} result - Game result ('won', 'lost', 'draw')
     * @param {Object} gameData - Additional game data (score, earnings, etc.)
     */
    endGame(result, gameData = {}) {
        this.stats.gamesPlayed++;
        
        if (result === 'won') {
            this.stats.gamesWon++;
            this.stats.winStreak++;
            
            if (this.stats.winStreak > this.stats.bestWinStreak) {
                this.stats.bestWinStreak = this.stats.winStreak;
            }
            
            // Award experience and resources for winning
            this.addExperience(gameData.xp || 50, this.currentGame.gameType);
            if (gameData.earnings) {
                this.addResources(gameData.earnings, 'game_win');
            }
            this.addReputation(gameData.reputation || 5, 'game_win');
            
        } else if (result === 'lost') {
            this.stats.winStreak = 0;
            // Small consolation XP for playing
            this.addExperience(gameData.xp || 10, this.currentGame.gameType);
        }

        this.currentGame.status = result;
        this.currentGame.endedAt = Date.now();
        
        // Update favorite game
        this.updateFavoriteGame();
        
        // Check for achievements
        this.checkAchievements();
        
        console.log(`🏁 ${this.name} finished game with result: ${result}`);
        
        return {
            result: result,
            gamesPlayed: this.stats.gamesPlayed,
            winRate: this.getWinRate(),
            winStreak: this.stats.winStreak
        };
    }

    /**
     * Updates the player's favorite game based on play frequency
     */
    updateFavoriteGame() {
        // This would track which games the player plays most
        // For now, just set it to the current game type
        if (this.currentGame.gameType) {
            this.stats.favoriteGame = this.currentGame.gameType;
        }
    }

    /**
     * Hand Management
     */
    
    /**
     * Adds a card to player's hand
     * @param {Object} card - Card to add
     */
    addCardToHand(card) {
        this.currentGame.hand.push(card);
        console.log(`🃏 ${this.name} received card: ${card.rank}${card.suit ? ` of ${card.suit}` : ''}`);
    }

    /**
     * Removes a card from player's hand
     * @param {string} cardId - ID of card to remove
     * @returns {Object} Removed card or null
     */
    removeCardFromHand(cardId) {
        const cardIndex = this.currentGame.hand.findIndex(card => card.id === cardId);
        if (cardIndex !== -1) {
            const removedCard = this.currentGame.hand.splice(cardIndex, 1)[0];
            console.log(`🗑️ ${this.name} played card: ${removedCard.rank}`);
            return removedCard;
        }
        return null;
    }

    /**
     * Clears player's hand
     */
    clearHand() {
        this.currentGame.hand = [];
        console.log(`🧹 ${this.name}'s hand cleared`);
    }

    /**
     * Gets hand value for games like Blackjack
     * @param {boolean} aceLow - Whether to count Aces as low
     * @returns {number} Total hand value
     */
    getHandValue(aceLow = false) {
        return this.currentGame.hand.reduce((total, card) => {
            if (aceLow && card.rank === 'A') {
                return total + 1;
            }
            return total + card.value;
        }, 0);
    }

    /**
     * Statistics and Achievements
     */
    
    /**
     * Gets player's win rate as a percentage
     * @returns {number} Win rate percentage
     */
    getWinRate() {
        if (this.stats.gamesPlayed === 0) return 0;
        return Math.round((this.stats.gamesWon / this.stats.gamesPlayed) * 100);
    }

    /**
     * Checks for achievement unlocks
     */
    checkAchievements() {
        const achievements = [
            {
                id: 'first_win',
                name: 'First Victory',
                description: 'Win your first game',
                condition: () => this.stats.gamesWon >= 1
            },
            {
                id: 'veteran_player',
                name: 'Veteran Player',
                description: 'Play 100 games',
                condition: () => this.stats.gamesPlayed >= 100
            },
            {
                id: 'win_streak_5',
                name: 'Hot Streak',
                description: 'Win 5 games in a row',
                condition: () => this.stats.winStreak >= 5
            },
            {
                id: 'high_roller',
                name: 'High Roller',
                description: 'Earn 10,000 total resources',
                condition: () => this.stats.totalEarnings >= 10000
            }
        ];

        achievements.forEach(achievement => {
            if (!this.hasAchievement(achievement.id) && achievement.condition()) {
                this.unlockAchievement(achievement);
            }
        });
    }

    /**
     * Checks if player has specific achievement
     * @param {string} achievementId - Achievement ID to check
     * @returns {boolean} True if player has achievement
     */
    hasAchievement(achievementId) {
        return this.stats.achievements.some(ach => ach.id === achievementId);
    }

    /**
     * Unlocks an achievement for the player
     * @param {Object} achievement - Achievement object to unlock
     */
    unlockAchievement(achievement) {
        this.stats.achievements.push({
            ...achievement,
            unlockedAt: Date.now()
        });
        
        // Award bonus XP and resources for achievements
        this.addExperience(100, 'achievement');
        this.addResources(200, 'achievement');
        
        console.log(`🏆 ${this.name} unlocked achievement: "${achievement.name}"`);
    }

    /**
     * Data Management
     */
    
    /**
     * Gets player summary for UI display
     * @returns {Object} Player summary
     */
    getSummary() {
        return {
            id: this.id,
            name: this.name,
            level: this.empire.level,
            resources: this.empire.resources,
            reputation: this.empire.reputation,
            winRate: this.getWinRate(),
            gamesPlayed: this.stats.gamesPlayed,
            currentTitle: this.empire.titles.length > 0 ? this.empire.titles[this.empire.titles.length - 1].name : 'Newcomer'
        };
    }

    /**
     * Exports player data for saving
     * @returns {Object} Complete player data
     */
    export() {
        return {
            id: this.id,
            name: this.name,
            type: this.type,
            createdAt: this.createdAt,
            empire: this.empire,
            stats: this.stats,
            settings: this.settings,
            lastSaved: Date.now()
        };
    }

    /**
     * Imports player data from save
     * @param {Object} data - Saved player data
     */
    import(data) {
        Object.assign(this, data);
        console.log(`📥 Loaded player data for ${this.name}`);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Player;
} else {
    window.Player = Player;
}