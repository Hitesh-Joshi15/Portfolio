// ===================================
// HIGH SCORE MANAGER (LocalStorage + Firebase Global Leaderboard)
// ===================================
class HighScoreManager {
    constructor(gameName, scoringMode = 'higher') {
        this.gameName = gameName;
        this.localKey = `highscore_${gameName}`;
        this.globalKey = `global_highscore_${gameName}`;
        this.playerNameKey = 'playerName'; // Shared across all games
        this.cachedGlobalTop = null; // Cache top score
        this.cacheExpiry = 0; // Timestamp when cache expires
        this.scoringMode = scoringMode; // 'higher' or 'lower' (for games where lower score is better)
    }

    // PLAYER NAME MANAGEMENT
    getPlayerName() {
        return localStorage.getItem(this.playerNameKey) || '';
    }

    setPlayerName(name) {
        localStorage.setItem(this.playerNameKey, name.trim());
    }

    promptForName() {
        const currentName = this.getPlayerName();
        const name = prompt(`Enter your name for the leaderboards:`, currentName || 'Anonymous');
        if (name && name.trim()) {
            this.setPlayerName(name.trim());
            return name.trim();
        }
        return currentName || 'Anonymous';
    }

    // LOCAL HIGH SCORE (Personal Best with metadata)
    getLocalHighScore() {
        const data = localStorage.getItem(this.localKey);
        if (!data) return null;
        
        try {
            const parsed = JSON.parse(data);
            return {
                score: parsed.score || 0,
                name: parsed.name || 'You',
                date: parsed.date || 'Unknown'
            };
        } catch(e) {
            // Legacy format (just number)
            const score = parseInt(data);
            return {
                score: isNaN(score) ? 0 : score,
                name: 'You',
                date: 'Unknown'
            };
        }
    }

    saveLocalHighScore(score) {
        const current = this.getLocalHighScore();
        const currentScore = current ? current.score : (this.scoringMode === 'lower' ? Infinity : 0);
        
        // Check if new score is better based on scoring mode
        const isNewRecord = this.scoringMode === 'lower' 
            ? score < currentScore 
            : score > currentScore;
        
        if (isNewRecord) {
            const playerName = this.getPlayerName() || 'Anonymous';
            const data = {
                score: score,
                name: playerName,
                date: new Date().toLocaleDateString()
            };
            localStorage.setItem(this.localKey, JSON.stringify(data));
            return true; // New personal record!
        }
        return false;
    }

    // ===================================
    // FIREBASE GLOBAL LEADERBOARD METHODS
    // ===================================
    
    /**
     * Submit score to Firebase global leaderboard
     * 
     * HOW IT WORKS:
     * 1. Check if Firebase is available
     * 2. Get player name (or use 'Anonymous')
     * 3. Create a document in Firestore with score data
     * 4. Firebase auto-generates a unique ID for this score
     * 
     * FIRESTORE PATH: /leaderboards/{gameName}/scores/{auto-id}
     * 
     * @param {number} score - The score to submit
     * @returns {Promise<boolean>} - True if submission succeeded
     */
    async submitGlobalScore(score) {
        // Check if Firebase is initialized
        if (!window.firebaseDB) {
            console.warn('⚠️ Firebase not initialized. Score not submitted to global leaderboard.');
            return false;
        }
        
        // Ensure authentication is complete (wait up to 5 seconds)
        const auth = firebase.auth();
        let attempts = 0;
        while (!auth.currentUser && attempts < 50) {
            console.log('⏳ Waiting for authentication...');
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        // If still not authenticated after waiting, try to sign in
        if (!auth.currentUser) {
            console.warn('⚠️ User not authenticated. Signing in anonymously...');
            try {
                await auth.signInAnonymously();
                console.log('✅ Anonymous authentication successful');
                // Wait a bit for auth to propagate
                await new Promise(resolve => setTimeout(resolve, 200));
            } catch (authError) {
                console.error('❌ Authentication failed:', authError);
                return false;
            }
        }
        
        try {
            const playerName = this.getPlayerName() || 'Anonymous';
            
            // Prepare the score document
            const scoreData = {
                score: score,
                playerName: playerName,
                userId: auth.currentUser.uid, // Add user ID for tracking
                timestamp: firebase.firestore.FieldValue.serverTimestamp(), // Server time (prevents cheating)
                date: new Date().toLocaleDateString(),
                gameVersion: '1.0' // Optional: track which version of game
            };
            
            // Add to Firestore
            // Path: leaderboards → {gameName} → scores → {auto-generated-id}
            await window.firebaseDB
                .collection('leaderboards')
                .doc(this.gameName)
                .collection('scores')
                .add(scoreData);
            
            // Clear ALL cache so next fetch gets fresh data
            this.cachedGlobalTop = null;
            this.cacheExpiry = 0;
            
            console.log(`✅ Score ${score} submitted to global leaderboard for ${this.gameName}`);
            return true;
            
        } catch (error) {
            console.error('❌ Error submitting score to Firebase:', error);
            
            // Common errors and solutions:
            if (error.code === 'permission-denied') {
                console.error('Fix: Check Firestore Security Rules or Authentication');
            } else if (error.code === 'unavailable') {
                console.error('Fix: Check internet connection');
            }
            
            return false;
        }
    }
    
    /**
     * Get top 10 scores from Firebase
     * 
     * FIRESTORE QUERY EXPLANATION:
     * - collection('leaderboards/{game}/scores') = all scores for this game
     * - orderBy('score', 'desc') = sort highest to lowest
     * - limit(10) = only get top 10
     * - get() = fetch data from server
     * 
     * @returns {Promise<Array>} - Array of top 10 scores
     */
    async getTop10Scores() {
        if (!window.firebaseDB) {
            console.warn('⚠️ Firebase not initialized');
            return [];
        }
        
        try {
            // Sort direction depends on scoring mode
            const sortDirection = this.scoringMode === 'lower' ? 'asc' : 'desc';
            
            const snapshot = await window.firebaseDB
                .collection('leaderboards')
                .doc(this.gameName)
                .collection('scores')
                .orderBy('score', sortDirection)  // Sort based on game mode
                .limit(10)                        // Only get top 10
                .get();                           // Execute query
            
            // Convert Firestore documents to JavaScript objects
            const scores = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                scores.push({
                    id: doc.id,
                    score: data.score,
                    playerName: data.playerName,
                    date: data.date,
                    timestamp: data.timestamp
                });
            });
            
            return scores;
            
        } catch (error) {
            console.error('❌ Error fetching leaderboard:', error);
            return [];
        }
    }
    
    /**
     * Get world record (highest score) with caching
     * 
     * CACHING STRATEGY:
     * - Cache result for 30 seconds
     * - Reduces Firebase reads (save quota)
     * - Still fresh enough for leaderboard
     * 
     * @returns {Promise<Object|null>} - World record data or null
     */
    async getGlobalHighScore() {
        // Check cache first
        const now = Date.now();
        if (this.cachedGlobalTop && now < this.cacheExpiry) {
            return this.cachedGlobalTop;
        }
        
        if (!window.firebaseDB) {
            return null;
        }
        
        try {
            // Sort direction depends on scoring mode
            const sortDirection = this.scoringMode === 'lower' ? 'asc' : 'desc';
            
            const snapshot = await window.firebaseDB
                .collection('leaderboards')
                .doc(this.gameName)
                .collection('scores')
                .orderBy('score', sortDirection)  // Sort based on game mode
                .limit(1)  // Only get #1 score
                .get();
            
            if (snapshot.empty) {
                return null; // No scores yet
            }
            
            const doc = snapshot.docs[0];
            const data = doc.data();
            const worldRecord = {
                score: data.score,
                name: data.playerName,
                date: data.date
            };
            
            // Cache for 30 seconds
            this.cachedGlobalTop = worldRecord;
            this.cacheExpiry = now + 30000;
            
            return worldRecord;
            
        } catch (error) {
            console.error('❌ Error fetching world record:', error);
            return null;
        }
    }

    // Get formatted display for start screen (now async to fetch global scores)
    async getStartScreenHTML() {
        const personal = this.getLocalHighScore();
        const global = await this.getGlobalHighScore(); // Now actually fetches from Firebase!
        
        return `
            <div class="highscore-preview">
                ${personal ? `
                    <div class="score-preview-item personal">
                        <div class="score-preview-icon">
                            <i class="fas fa-user"></i>
                        </div>
                        <div class="score-preview-content">
                            <div class="score-preview-label">Your Best</div>
                            <div class="score-preview-value">${personal.score}</div>
                            <div class="score-preview-name">${personal.name}</div>
                        </div>
                    </div>
                ` : ''}
                ${global ? `
                    <div class="score-preview-item global">
                        <div class="score-preview-icon">
                            <i class="fas fa-globe"></i>
                        </div>
                        <div class="score-preview-content">
                            <div class="score-preview-label">World Record</div>
                            <div class="score-preview-value">${global.score}</div>
                            <div class="score-preview-name">${global.name}</div>
                        </div>
                    </div>
                ` : ''}
                ${!personal && !global ? `
                    <div class="score-preview-empty">
                        <i class="fas fa-trophy"></i>
                        <p>Be the first to set a score!</p>
                    </div>
                ` : ''}
            </div>
            <button class="btn-view-leaderboard" onclick="window.currentScoreManager?.showLeaderboard()">
                <i class="fas fa-list-ol"></i>
                <span>View Global Leaderboard</span>
            </button>
        `;
    }
    
    /**
     * Show leaderboard modal with top 10 scores
     * This creates a popup overlay showing all top scores
     */
    async showLeaderboard(waitForSubmission = false) {
        // Show loading modal first
        const loadingHTML = `
            <div class="leaderboard-modal" id="leaderboardModal">
                <div class="leaderboard-content glass-effect">
                    <div class="leaderboard-header">
                        <h3><i class="fas fa-trophy"></i> Global Leaderboard</h3>
                        <button class="btn-close-leaderboard" onclick="document.getElementById('leaderboardModal').remove()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="leaderboard-loading">
                        <i class="fas fa-spinner fa-spin"></i>
                        <p>Loading leaderboard...</p>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', loadingHTML);
        
        // Wait longer if score was just submitted
        // Firebase needs time to write and propagate the data
        const waitTime = waitForSubmission ? 1500 : 500; // 1.5s after submission, 0.5s for refresh
        console.log(`⏳ Waiting ${waitTime}ms for Firebase to sync...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        
        // Fetch fresh data
        const scores = await this.getTop10Scores();
        const personal = this.getLocalHighScore();
        
        // Update modal content with leaderboard data
        const modal = document.getElementById('leaderboardModal');
        if (!modal) return; // Modal was closed
        
        const content = modal.querySelector('.leaderboard-content');
        content.innerHTML = `
            <div class="leaderboard-header">
                <h3><i class="fas fa-trophy"></i> Global Leaderboard</h3>
                <button class="btn-close-leaderboard" onclick="document.getElementById('leaderboardModal').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="leaderboard-game-title">${this.getGameDisplayName()}</div>
            
            ${scores.length === 0 ? `
                <div class="leaderboard-empty">
                    <i class="fas fa-star"></i>
                    <p>No scores yet. Be the first!</p>
                </div>
            ` : `
                <div class="leaderboard-list">
                    ${scores.map((score, index) => {
                        const isYou = personal && score.playerName === personal.name && score.score === personal.score;
                        const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '';
                        
                        return `
                            <div class="leaderboard-item ${isYou ? 'is-you' : ''} ${index < 3 ? 'top-three' : ''}">
                                <div class="leaderboard-rank">${medal || (index + 1)}</div>
                                <div class="leaderboard-player">
                                    <div class="player-name">${score.playerName}${isYou ? ' (You)' : ''}</div>
                                    <div class="player-date">${score.date}</div>
                                </div>
                                <div class="leaderboard-score">${score.score}</div>
                            </div>
                        `;
                    }).join('')}
                </div>
            `}
            
            <div class="leaderboard-footer">
                <button class="btn btn-secondary" onclick="window.currentScoreManager?.showLeaderboard(); document.getElementById('leaderboardModal')?.remove();">
                    <i class="fas fa-sync-alt"></i> Refresh
                </button>
                <button class="btn btn-primary" onclick="document.getElementById('leaderboardModal').remove()">
                    Close
                </button>
            </div>
        `;
        
        // Add click outside to close
        setTimeout(() => {
            modal.addEventListener('click', (e) => {
                if (e.target.id === 'leaderboardModal') {
                    e.target.remove();
                }
            });
        }, 100);
    }
    
    // Helper to get readable game name
    getGameDisplayName() {
        const names = {
            typingGame: 'Code Typing Challenge',
            wordTetris: 'Word Tetris',
            memoryGame: 'Memory Match',
            reactionGame: 'Reflex Tester',
            codeQuiz: 'Code Quiz',
            terminalHacker: 'Terminal Hacker',
            binaryConverter: 'Binary Converter',
            cssBattle: 'CSS Battle',
            regexGolf: 'Regex Golf',
            minesweeper: 'Minesweeper',
            pathFinder: 'Path Finder'
        };
        return names[this.gameName] || this.gameName;
    }

    // Reset personal high score
    resetLocalHighScore() {
        localStorage.removeItem(this.localKey);
    }

    // Format score display HTML
    getScoreDisplayHTML(currentScore) {
        const personal = this.getLocalHighScore();
        const personalScore = personal ? personal.score : 0;
        const isNewRecord = currentScore > personalScore;
        
        return `
            <div class="highscore-display">
                ${isNewRecord ? `
                    <div class="new-record-badge">
                        <i class="fas fa-trophy"></i> NEW PERSONAL RECORD!
                    </div>
                ` : ''}
                <div class="score-comparison">
                    <div class="current-score">
                        <div class="score-label">Your Score</div>
                        <div class="score-value">${currentScore}</div>
                    </div>
                    ${personal ? `
                        <div class="previous-best">
                            <div class="score-label">Previous Best</div>
                            <div class="score-value">${personalScore}</div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }
}
