// ===================================
// HIGH SCORE MANAGER (LocalStorage + Firebase Global Leaderboard)
// ===================================
class HighScoreManager {
    constructor(gameName, scoringMode = 'higher', opts = {}) {
        this.gameName = gameName;
        this.localKey = `highscore_${gameName}`;
        this.globalKey = `global_highscore_${gameName}`;
        this.playerNameKey = 'playerName'; // Shared across all games
        this.cachedGlobalTop = null; // Cache top score
        this.cacheExpiry = 0; // Timestamp when cache expires
        this.scoringMode = scoringMode; // 'higher' or 'lower' (for games where lower score is better)
        this.variants = opts.variants || null; // e.g. mode/difficulty combos -> grouped leaderboard
    }

    // Names live in shared Firestore + localStorage — strip HTML-significant
    // chars at the boundary so no template ever renders markup from a name.
    _sanitizeName(name) {
        return String(name ?? '')
            .replace(/[<>&"'`]/g, '')
            .replace(/\s+/g, ' ')
            .trim()
            .slice(0, 30);
    }

    // ---- inappropriate-name filter ----
    // There is no sign-in, so names are honor-system; this keeps obscene ones
    // off the public boards. Checked at save time AND at render time (render
    // covers names written straight to Firestore, bypassing the client).
    static get _NAME_BLOCK_SUBSTR() {
        // Unambiguous even inside other words (leet-normalized, letters only).
        return ['fuck', 'fock', 'fuk', 'fuq', 'fux', 'fcuk', 'phuck', 'fckin',
            'shit', 'bitch', 'biatch', 'cunt', 'nigger', 'nigga', 'faggot',
            'whore', 'slut', 'rapist', 'porn', 'penis', 'vagina', 'boob',
            'blowjob', 'handjob', 'dildo', 'wanker', 'retard', 'dickhead',
            'asshole', 'jackass', 'dumbass', 'pedo', 'hitler', 'nazi',
            'chutiya', 'chutia', 'madarchod', 'motherchod', 'behenchod',
            'bhenchod', 'bhosdi', 'bhosad', 'lauda', 'lawda', 'gandu',
            'gaand', 'randi', 'jhaat', 'tatti', 'haraami', 'harami', 'kutti',
            'kamini', 'hijra', 'chinaal', 'chinal', 'rakhail'];
    }

    static get _NAME_BLOCK_TOKEN() {
        // Too short/common for substring matching — must equal a whole token
        // (so Assassin, Cassandra, Sexton, Dickens all stay legal).
        return ['ass', 'sex', 'cum', 'tit', 'tits', 'hoe', 'fag', 'dick',
            'cock', 'rape', 'anal', 'nude', 'nudes', 'xxx', 'lund', 'lode',
            'gand', 'raand', 'chod'];
    }

    // Lowercase + undo common leetspeak so 'F0¢k_U' style spellings match.
    _normalizeForFilter(name) {
        const leet = { '0': 'o', '1': 'i', '3': 'e', '4': 'a', '5': 's', '7': 't', '8': 'b', '@': 'a', '$': 's', '!': 'i', '+': 't', '¢': 'c', '€': 'e' };
        return String(name ?? '')
            .toLowerCase()
            .replace(/[013457 8@$!+¢€]/g, (ch) => leet[ch] ?? ch);
    }

    _isNameClean(name) {
        const norm = this._normalizeForFilter(name);
        const squashed = norm.replace(/[^a-z]/g, '');                 // 'f.u.c.k' -> 'fuck'
        const collapsed = squashed.replace(/(.)\1+/g, '$1');          // 'fuuuck' -> 'fuck'
        for (const w of HighScoreManager._NAME_BLOCK_SUBSTR) {
            if (squashed.includes(w) || collapsed.includes(w)) return false;
        }
        const tokens = norm.split(/[^a-z]+/).filter(Boolean);
        for (const t of tokens) {
            if (HighScoreManager._NAME_BLOCK_TOKEN.includes(t)) return false;
        }
        return true;
    }

    // What the leaderboard shows: hostile/obscene names become 'Anonymous'.
    _displayName(name) {
        const clean = this._sanitizeName(name);
        if (!clean || !this._isNameClean(clean)) return 'Anonymous';
        return clean;
    }

    // Escape remote-sourced values before they hit innerHTML (leaderboards
    // render OTHER players' data — treat all of it as hostile).
    _esc(value) {
        const d = document.createElement('div');
        d.textContent = String(value ?? '');
        return d.innerHTML;
    }

    // PLAYER NAME MANAGEMENT
    getPlayerName() {
        const name = this._sanitizeName(localStorage.getItem(this.playerNameKey) || '');
        // A profane name planted in localStorage must never reach a submission.
        return this._isNameClean(name) ? name : '';
    }

    setPlayerName(name) {
        const clean = this._sanitizeName(name);
        if (!this._isNameClean(clean)) return false; // rejected — keep the old name
        localStorage.setItem(this.playerNameKey, clean);
        return true;
    }

    promptForName() {
        const currentName = this.getPlayerName();
        let message = 'Enter your name for the leaderboards:';
        for (let attempt = 0; attempt < 3; attempt++) {
            const raw = prompt(message, currentName || 'Anonymous');
            if (raw === null) break; // user cancelled
            const name = this._sanitizeName(raw);
            if (!name) break;
            if (this._isNameClean(name)) {
                this.setPlayerName(name);
                return name;
            }
            message = 'That name isn\'t allowed on the leaderboards — please pick another:';
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
                score: Number(parsed.score) || 0,
                name: this._sanitizeName(parsed.name || 'You') || 'You',
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
        score = Math.floor(Number(score));
        if (!Number.isFinite(score) || score < 0) return false; // corrupt values must never become a record
        score = Math.min(score, 100000); // same ceiling as the global leaderboard
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
     * @param {string|null} variant - Optional mode/difficulty label stored with the score
     * @returns {Promise<boolean>} - True if submission succeeded
     */
    async submitGlobalScore(score, variant = null) {
        // Reject garbage before it reaches the shared leaderboard; clamp to the
        // Firestore rules ceiling so valid runs never bounce.
        score = Math.floor(Number(score));
        if (!Number.isFinite(score) || score < 0) {
            console.warn('⚠️ Invalid score — not submitted:', score);
            return false;
        }
        score = Math.min(score, 100000);

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
            if (variant) scoreData.variant = variant;
            
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
     * @returns {Promise<Array>} - Array of top scores
     */
    async getTop10Scores(limitN = 10) {
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
                .limit(limitN)
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
                    timestamp: data.timestamp,
                    variant: data.variant || null
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
                name: this._displayName(data.playerName),
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
                            <div class="score-preview-value">${Number(personal.score) || 0}</div>
                            <div class="score-preview-name">${this._esc(this._displayName(personal.name))}</div>
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
                            <div class="score-preview-value">${Number(global.score) || 0}</div>
                            <div class="score-preview-name">${this._esc(this._displayName(global.name))}</div>
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
        
        // Fetch fresh data (variant mode pulls a deeper list so every category is represented)
        const scores = await this.getTop10Scores(this.variants ? 50 : 10);
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
            ` : (this.variants ? this._renderGroupedList(scores, personal) : `
                <div class="leaderboard-list">${this._renderRows(scores, personal)}</div>
            `)}
            
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
    
    // Rows for one ranked list; medals for the top three of that list.
    // Every field here came from Firestore (other players) — escape/coerce all of it.
    _renderRows(scores, personal) {
        return scores.map((score, index) => {
            const isYou = personal && score.playerName === personal.name && score.score === personal.score;
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '';
            const chip = score.variant ? `<span class="player-variant">${this._esc(score.variant)}</span>` : '';
            
            return `
                <div class="leaderboard-item ${isYou ? 'is-you' : ''} ${index < 3 ? 'top-three' : ''}">
                    <div class="leaderboard-rank">${medal || (index + 1)}</div>
                    <div class="leaderboard-player">
                        <div class="player-name">${this._esc(this._displayName(score.playerName))}${isYou ? ' (You)' : ''} ${chip}</div>
                        <div class="player-date">${this._esc(score.date)}</div>
                    </div>
                    <div class="leaderboard-score">${Number(score.score) || 0}</div>
                </div>
            `;
        }).join('');
    }
    
    // One ranked section per variant (plus Classic for pre-category scores).
    _renderGroupedList(scores, personal) {
        const groups = new Map(this.variants.map(v => [v, []]));
        const legacy = [];
        scores.forEach(s => {
            if (s.variant && groups.has(s.variant)) groups.get(s.variant).push(s);
            else legacy.push(s);
        });
        if (legacy.length) groups.set('Classic (before categories)', legacy);
        
        let html = '';
        groups.forEach((list, label) => {
            if (!list.length) return;
            html += `
                <div class="leaderboard-section-title">${label}</div>
                <div class="leaderboard-list">${this._renderRows(list.slice(0, 5), personal)}</div>
            `;
        });
        return html;
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
            sqlDetective: 'SQL Detective',
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
