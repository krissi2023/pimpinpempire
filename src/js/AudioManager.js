/**
 * AudioManager.js - Urban Audio System for Pimpin's Empire
 * Handles background music, sound effects, and audio controls
 * 
 * @author Krissi & K
 * @version 1.8.0
 */

class AudioManager {
    constructor() {
        this.isEnabled = true;
        this.masterVolume = 0.7;
        this.musicVolume = 0.5;
        this.sfxVolume = 0.8;
        
        // Audio contexts and sources
        this.audioContext = null;
        this.currentMusic = null;
        this.soundEffects = new Map();
        this.musicTracks = new Map();
        
        // Audio state
        this.currentTrack = null;
        this.isMusicPlaying = false;
        this.isMuted = false;
        
        // Urban music tracks (using Web Audio API with generated tones for demo)
        this.trackList = {
            main_theme: {
                name: 'Empire Vibes',
                tempo: 85,
                key: 'Dm',
                description: 'Main arcade theme with urban beats'
            },
            blackjack_theme: {
                name: 'High Stakes',
                tempo: 95,
                key: 'Am',
                description: 'Smooth jazz-influenced track for card games'
            },
            slots_theme: {
                name: 'Jackpot Dreams',
                tempo: 120,
                key: 'Em',
                description: 'Energetic track for slot machines'
            },
            win_celebration: {
                name: 'Victory Lap',
                tempo: 130,
                key: 'C',
                description: 'Celebration music for big wins'
            }
        };
        
        // Sound effects library
        this.sfxList = {
            // UI sounds
            button_hover: { frequency: 800, duration: 0.1, type: 'sine' },
            button_click: { frequency: 400, duration: 0.15, type: 'square' },
            menu_open: { frequency: 600, duration: 0.2, type: 'sine' },
            menu_close: { frequency: 300, duration: 0.2, type: 'sine' },
            
            // Card game sounds
            card_deal: { frequency: 200, duration: 0.1, type: 'noise' },
            card_flip: { frequency: 350, duration: 0.08, type: 'sine' },
            chip_place: { frequency: 150, duration: 0.12, type: 'triangle' },
            
            // Game results
            win_small: { frequency: 523, duration: 0.3, type: 'sine' }, // C5
            win_medium: { frequency: 659, duration: 0.4, type: 'sine' }, // E5
            win_big: { frequency: 784, duration: 0.5, type: 'sine' }, // G5
            win_jackpot: { frequency: 1047, duration: 1.0, type: 'sine' }, // C6
            
            lose: { frequency: 165, duration: 0.5, type: 'triangle' }, // E3
            
            // Slot machine sounds
            reel_spin: { frequency: 100, duration: 0.05, type: 'noise' },
            reel_stop: { frequency: 250, duration: 0.1, type: 'square' },
            
            // Special events
            level_up: { frequency: 440, duration: 0.6, type: 'sine' }, // A4
            achievement: { frequency: 880, duration: 0.4, type: 'sine' }, // A5
            
            // Ambient sounds
            casino_ambience: { frequency: 60, duration: 2.0, type: 'brown_noise' }
        };
        
        console.log('🎵 AudioManager initialized - Ready to drop the beats!');
    }

    /**
     * Initialize the audio system
     * @returns {Promise<boolean>} Success status
     */
    async initialize() {
        try {
            // Create audio context
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Generate audio tracks
            await this.generateMusicTracks();
            
            // Pre-generate common sound effects
            this.generateSoundEffects();
            
            // Set up audio control events
            this.setupAudioControls();
            
            console.log('🎵 Audio system initialized successfully!');
            return true;
            
        } catch (error) {
            console.warn('⚠️ Audio initialization failed:', error);
            this.isEnabled = false;
            return false;
        }
    }

    /**
     * Generate procedural music tracks
     */
    async generateMusicTracks() {
        for (const [trackId, trackInfo] of Object.entries(this.trackList)) {
            const track = this.createMusicTrack(trackInfo);
            this.musicTracks.set(trackId, track);
        }
    }

    /**
     * Create a procedural music track
     * @param {object} trackInfo - Track configuration
     * @returns {object} Audio track data
     */
    createMusicTrack(trackInfo) {
        const { tempo, key } = trackInfo;
        const bpm = tempo;
        const beatDuration = 60 / bpm;
        
        // Urban chord progressions based on key
        const chordProgressions = {
            'Dm': [220, 246.94, 293.66, 261.63], // D minor progression
            'Am': [220, 246.94, 261.63, 293.66], // A minor progression
            'Em': [164.81, 185, 220, 196], // E minor progression
            'C': [261.63, 293.66, 329.63, 349.23] // C major progression
        };
        
        return {
            progression: chordProgressions[key] || chordProgressions['Dm'],
            tempo: bpm,
            beatDuration: beatDuration,
            trackInfo: trackInfo
        };
    }

    /**
     * Generate sound effect audio buffers
     */
    generateSoundEffects() {
        for (const [sfxId, sfxConfig] of Object.entries(this.sfxList)) {
            const buffer = this.createSoundEffect(sfxConfig);
            this.soundEffects.set(sfxId, buffer);
        }
    }

    /**
     * Create a sound effect audio buffer
     * @param {object} config - Sound configuration
     * @returns {AudioBuffer} Generated audio buffer
     */
    createSoundEffect(config) {
        const { frequency, duration, type } = config;
        const sampleRate = this.audioContext.sampleRate;
        const length = sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, length, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < length; i++) {
            const t = i / sampleRate;
            let sample = 0;
            
            switch (type) {
                case 'sine':
                    sample = Math.sin(2 * Math.PI * frequency * t);
                    break;
                case 'square':
                    sample = Math.sin(2 * Math.PI * frequency * t) > 0 ? 1 : -1;
                    break;
                case 'triangle':
                    sample = (2 / Math.PI) * Math.asin(Math.sin(2 * Math.PI * frequency * t));
                    break;
                case 'noise':
                    sample = Math.random() * 2 - 1;
                    break;
                case 'brown_noise':
                    // Simple brown noise approximation
                    sample = (Math.random() * 2 - 1) * 0.1;
                    break;
                default:
                    sample = Math.sin(2 * Math.PI * frequency * t);
            }
            
            // Apply envelope (fade in/out)
            const envelope = Math.min(t * 10, 1) * Math.min((duration - t) * 10, 1);
            data[i] = sample * envelope * 0.3; // Reduce volume
        }
        
        return buffer;
    }

    /**
     * Play background music track
     * @param {string} trackId - Track identifier
     * @param {boolean} loop - Whether to loop the track
     */
    async playMusic(trackId, loop = true) {
        if (!this.isEnabled || this.isMuted) return;
        
        // Stop current music
        this.stopMusic();
        
        try {
            // Resume audio context if needed
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }
            
            const track = this.musicTracks.get(trackId);
            if (!track) {
                console.warn(`Music track "${trackId}" not found`);
                return;
            }
            
            // Create procedural music playback
            this.currentTrack = trackId;
            this.isMusicPlaying = true;
            
            this.playProceduralMusic(track, loop);
            
            console.log(`🎵 Playing: ${track.trackInfo.name}`);
            
        } catch (error) {
            console.warn('Failed to play music:', error);
        }
    }

    /**
     * Play procedural music
     * @param {object} track - Track data
     * @param {boolean} loop - Whether to loop
     */
    playProceduralMusic(track, loop) {
        const { progression, beatDuration } = track;
        let beatIndex = 0;
        
        const playBeat = () => {
            if (!this.isMusicPlaying) return;
            
            const frequency = progression[beatIndex % progression.length];
            this.playTone(frequency, beatDuration * 0.8, 'sine', this.musicVolume * 0.3);
            
            beatIndex++;
            
            setTimeout(playBeat, beatDuration * 1000);
        };
        
        // Start the beat
        playBeat();
    }

    /**
     * Stop background music
     */
    stopMusic() {
        this.isMusicPlaying = false;
        this.currentTrack = null;
    }

    /**
     * Play a sound effect
     * @param {string} sfxId - Sound effect identifier
     * @param {number} volume - Volume multiplier (0-1)
     */
    playSFX(sfxId, volume = 1.0) {
        if (!this.isEnabled || this.isMuted) return;
        
        try {
            const buffer = this.soundEffects.get(sfxId);
            if (!buffer) {
                console.warn(`Sound effect "${sfxId}" not found`);
                return;
            }
            
            const source = this.audioContext.createBufferSource();
            const gainNode = this.audioContext.createGain();
            
            source.buffer = buffer;
            gainNode.gain.value = this.sfxVolume * volume * this.masterVolume;
            
            source.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            source.start();
            
        } catch (error) {
            console.warn('Failed to play sound effect:', error);
        }
    }

    /**
     * Play a simple tone
     * @param {number} frequency - Frequency in Hz
     * @param {number} duration - Duration in seconds
     * @param {string} type - Oscillator type
     * @param {number} volume - Volume (0-1)
     */
    playTone(frequency, duration, type = 'sine', volume = 0.5) {
        if (!this.isEnabled || this.isMuted) return;
        
        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.frequency.value = frequency;
            oscillator.type = type;
            
            gainNode.gain.setValueAtTime(volume * this.masterVolume, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.start();
            oscillator.stop(this.audioContext.currentTime + duration);
            
        } catch (error) {
            console.warn('Failed to play tone:', error);
        }
    }

    /**
     * Play win celebration based on win size
     * @param {number} winAmount - Amount won
     * @param {number} betAmount - Original bet
     */
    playWinCelebration(winAmount, betAmount) {
        const multiplier = winAmount / betAmount;
        
        if (multiplier >= 20) {
            // Jackpot win
            this.playSFX('win_jackpot');
            setTimeout(() => this.playMusic('win_celebration'), 500);
        } else if (multiplier >= 10) {
            // Big win
            this.playSFX('win_big');
        } else if (multiplier >= 3) {
            // Medium win
            this.playSFX('win_medium');
        } else if (multiplier > 1) {
            // Small win
            this.playSFX('win_small');
        }
    }

    /**
     * Set master volume
     * @param {number} volume - Volume (0-1)
     */
    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
    }

    /**
     * Set music volume
     * @param {number} volume - Volume (0-1)
     */
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
    }

    /**
     * Set sound effects volume
     * @param {number} volume - Volume (0-1)
     */
    setSFXVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
    }

    /**
     * Toggle mute state
     */
    toggleMute() {
        this.isMuted = !this.isMuted;
        
        if (this.isMuted) {
            this.stopMusic();
        } else if (this.currentTrack) {
            this.playMusic(this.currentTrack);
        }
        
        return this.isMuted;
    }

    /**
     * Toggle audio system on/off
     */
    toggleAudio() {
        this.isEnabled = !this.isEnabled;
        
        if (!this.isEnabled) {
            this.stopMusic();
        }
        
        return this.isEnabled;
    }

    /**
     * Set up audio control event listeners
     */
    setupAudioControls() {
        // Listen for user interaction to start audio context
        const startAudio = async () => {
            if (this.audioContext && this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
                console.log('🎵 Audio context resumed');
            }
            
            // Remove listeners after first interaction
            document.removeEventListener('click', startAudio);
            document.removeEventListener('keydown', startAudio);
        };
        
        document.addEventListener('click', startAudio);
        document.addEventListener('keydown', startAudio);
    }

    /**
     * Get current audio status
     * @returns {object} Audio status
     */
    getStatus() {
        return {
            isEnabled: this.isEnabled,
            isMuted: this.isMuted,
            currentTrack: this.currentTrack,
            isMusicPlaying: this.isMusicPlaying,
            masterVolume: this.masterVolume,
            musicVolume: this.musicVolume,
            sfxVolume: this.sfxVolume,
            availableTracks: Object.keys(this.trackList),
            availableSFX: Object.keys(this.sfxList)
        };
    }

    /**
     * Clean up audio resources
     */
    destroy() {
        this.stopMusic();
        
        if (this.audioContext) {
            this.audioContext.close();
        }
        
        this.soundEffects.clear();
        this.musicTracks.clear();
        
        console.log('🔇 Audio system destroyed');
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AudioManager;
}

// Global access for browser
if (typeof window !== 'undefined') {
    window.AudioManager = AudioManager;
}