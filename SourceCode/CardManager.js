/**
 * CardManager.js - Handles all card-related operations for Pimpins Empire
 * Manages deck creation, shuffling, dealing, and card game mechanics
 * 
 * @author Krissi & K
 * @version 1.8.0
 */

class CardManager {
    constructor() {
        this.standardDeck = this.createStandardDeck();
        this.currentDeck = [];
        this.discardPile = [];
        this.shuffleCount = 0;
        
        console.log('🃏 CardManager initialized');
    }

    /**
     * Creates a standard 52-card deck
     * @returns {Array} Array of card objects
     */
    createStandardDeck() {
        const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
        const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
        const deck = [];

        suits.forEach(suit => {
            ranks.forEach(rank => {
                deck.push({
                    suit: suit,
                    rank: rank,
                    value: this.getCardValue(rank),
                    id: `${rank}_${suit}`,
                    faceUp: false
                });
            });
        });

        return deck;
    }

    /**
     * Gets the numeric value of a card rank
     * @param {string} rank - Card rank (2-A)
     * @returns {number} Numeric value
     */
    getCardValue(rank) {
        switch (rank) {
            case 'A': return 14; // Ace high
            case 'K': return 13;
            case 'Q': return 12;
            case 'J': return 11;
            default: return parseInt(rank);
        }
    }

    /**
     * Gets the low value of an Ace (for games where Ace can be low)
     * @param {string} rank - Card rank
     * @returns {number} Low value for Ace, normal value for others
     */
    getCardValueLow(rank) {
        if (rank === 'A') return 1;
        return this.getCardValue(rank);
    }

    /**
     * Shuffles the current deck using Fisher-Yates algorithm
     * @param {number} times - Number of times to shuffle (default: 1)
     */
    shuffleDeck(times = 1) {
        for (let shuffle = 0; shuffle < times; shuffle++) {
            for (let i = this.currentDeck.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [this.currentDeck[i], this.currentDeck[j]] = [this.currentDeck[j], this.currentDeck[i]];
            }
            this.shuffleCount++;
        }
        
        console.log(`🔄 Deck shuffled ${times} time(s). Total shuffles: ${this.shuffleCount}`);
    }

    /**
     * Initializes a new deck for a game
     * @param {string} deckType - Type of deck ('standard', 'knk', 'empire')
     */
    initializeNewDeck(deckType = 'standard') {
        switch (deckType) {
            case 'standard':
                this.currentDeck = [...this.standardDeck];
                break;
            case 'knk':
                this.currentDeck = this.createKnKDeck();
                break;
            case 'empire':
                this.currentDeck = this.createEmpireDeck();
                break;
            default:
                this.currentDeck = [...this.standardDeck];
        }

        this.discardPile = [];
        this.shuffleDeck(3); // Shuffle thoroughly
        
        console.log(`🃏 Initialized ${deckType} deck with ${this.currentDeck.length} cards`);
    }

    /**
     * Creates a special KnK Draw deck
     * @returns {Array} KnK deck
     */
    createKnKDeck() {
        // For now, KnK uses standard deck
        // Could be modified to include special cards later
        return [...this.standardDeck];
    }

    /**
     * Creates an Empire-themed deck with special cards
     * @returns {Array} Empire deck
     */
    createEmpireDeck() {
        const empireDeck = [...this.standardDeck];
        
        // Add special Empire cards
        const specialCards = [
            {
                suit: 'empire',
                rank: 'Diamond',
                value: 15,
                id: 'diamond_special',
                faceUp: false,
                special: true,
                effect: 'wild'
            },
            {
                suit: 'empire',
                rank: 'PimpinDapaul',
                value: 16,
                id: 'pimpindapaul_special',
                faceUp: false,
                special: true,
                effect: 'empire_boost'
            },
            {
                suit: 'empire',
                rank: 'Yago',
                value: 15,
                id: 'yago_special',
                faceUp: false,
                special: true,
                effect: 'bridge'
            }
        ];

        return [...empireDeck, ...specialCards];
    }

    /**
     * Deals a specified number of cards from the deck
     * @param {number} count - Number of cards to deal
     * @param {boolean} faceUp - Whether cards should be face up
     * @returns {Array} Array of dealt cards
     */
    dealCards(count, faceUp = false) {
        if (count > this.currentDeck.length) {
            console.warn(`⚠️ Not enough cards in deck. Requested: ${count}, Available: ${this.currentDeck.length}`);
            return [];
        }

        const dealtCards = [];
        for (let i = 0; i < count; i++) {
            const card = this.currentDeck.pop();
            if (card) {
                card.faceUp = faceUp;
                dealtCards.push(card);
            }
        }

        console.log(`🎯 Dealt ${dealtCards.length} card(s). ${this.currentDeck.length} cards remaining`);
        return dealtCards;
    }

    /**
     * Deals a single card
     * @param {boolean} faceUp - Whether card should be face up
     * @returns {Object} Single card object
     */
    dealCard(faceUp = false) {
        const cards = this.dealCards(1, faceUp);
        return cards.length > 0 ? cards[0] : null;
    }

    /**
     * Adds cards to the discard pile
     * @param {Array|Object} cards - Cards to discard
     */
    discardCards(cards) {
        const cardsArray = Array.isArray(cards) ? cards : [cards];
        this.discardPile.push(...cardsArray);
        
        console.log(`🗑️ Discarded ${cardsArray.length} card(s). Discard pile: ${this.discardPile.length} cards`);
    }

    /**
     * Reshuffles discard pile back into deck
     */
    reshuffleDiscardPile() {
        if (this.discardPile.length === 0) {
            console.warn('⚠️ No cards in discard pile to reshuffle');
            return;
        }

        // Reset all cards to face down
        this.discardPile.forEach(card => card.faceUp = false);
        
        // Add discard pile to deck and clear discard pile
        this.currentDeck.push(...this.discardPile);
        this.discardPile = [];
        
        // Shuffle the combined deck
        this.shuffleDeck(2);
        
        console.log(`♻️ Reshuffled discard pile. Deck now has ${this.currentDeck.length} cards`);
    }

    /**
     * Compares two cards for value
     * @param {Object} card1 - First card
     * @param {Object} card2 - Second card
     * @param {boolean} aceLow - Whether Ace should be treated as low
     * @returns {number} -1 if card1 < card2, 0 if equal, 1 if card1 > card2
     */
    compareCards(card1, card2, aceLow = false) {
        const value1 = aceLow ? this.getCardValueLow(card1.rank) : card1.value;
        const value2 = aceLow ? this.getCardValueLow(card2.rank) : card2.value;

        if (value1 < value2) return -1;
        if (value1 > value2) return 1;
        return 0;
    }

    /**
     * Checks if two cards have the same rank
     * @param {Object} card1 - First card
     * @param {Object} card2 - Second card
     * @returns {boolean} True if ranks match
     */
    cardsMatch(card1, card2) {
        return card1.rank === card2.rank;
    }

    /**
     * Checks if two cards have the same suit
     * @param {Object} card1 - First card
     * @param {Object} card2 - Second card
     * @returns {boolean} True if suits match
     */
    sameSuit(card1, card2) {
        return card1.suit === card2.suit;
    }

    /**
     * Gets a card's display name
     * @param {Object} card - Card object
     * @returns {string} Display name
     */
    getCardDisplayName(card) {
        if (card.special) {
            return card.rank;
        }
        
        const suitSymbols = {
            hearts: '♥️',
            diamonds: '♦️',
            clubs: '♣️',
            spades: '♠️'
        };
        
        return `${card.rank}${suitSymbols[card.suit] || ''}`;
    }

    /**
     * Flips a card (changes face up/down status)
     * @param {Object} card - Card to flip
     */
    flipCard(card) {
        card.faceUp = !card.faceUp;
        console.log(`🔄 Card ${this.getCardDisplayName(card)} flipped ${card.faceUp ? 'face up' : 'face down'}`);
    }

    /**
     * Gets deck statistics
     * @returns {Object} Deck statistics
     */
    getDeckStats() {
        return {
            cardsInDeck: this.currentDeck.length,
            cardsInDiscard: this.discardPile.length,
            totalShuffles: this.shuffleCount,
            topCard: this.currentDeck.length > 0 ? this.getCardDisplayName(this.currentDeck[this.currentDeck.length - 1]) : 'None'
        };
    }

    /**
     * Resets the card manager to initial state
     */
    reset() {
        this.currentDeck = [];
        this.discardPile = [];
        this.shuffleCount = 0;
        console.log('🔄 CardManager reset');
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CardManager;
} else {
    window.CardManager = CardManager;
}