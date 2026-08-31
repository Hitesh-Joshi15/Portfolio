// ===================================
// DEVELOPER MINI GAMES COLLECTION
// ===================================


// Note: HighScoreManager class is now in highscore-manager.js
// This allows it to be shared across all games

// ===================================
// GAME HUB
// ===================================
class GameHub {
    constructor() {
        this.container = document.getElementById('typingGame');
        if (!this.container) {
            console.error('Game container not found!');
            return;
        }
        
        this.currentGame = null;
        this.games = {
            typing: new TypingGame(this),
            memory: new MemoryGame(this),
            reaction: new ReactionGame(this),
            quiz: new CodeQuiz(this),
            wordtetris: new WordTetris(this),
            terminal: new TerminalHacker(this),
            sqldetective: new SQLDetective(this),
            binary: new BinaryConverter(this),
            cssbattle: new CSSBattle(this),
            regex: new RegexGolf(this),
            minesweeper: new Minesweeper(this),
            pathfinder: new PathFinder(this)
        };
        
        this.init();
    }
    
    init() {
        this.showMenu();
        this.createFAB();
    }
    
    showMenu() {
        // In-game "Back" buttons land here directly — stop the running game
        // first or its timers keep ticking behind the menu.
        if (this.currentGame) {
            this.currentGame.cleanup();
            this.currentGame = null;
        }
        this.container.innerHTML = `
            <div class="game-hub glass-effect">
                <div class="game-hub-header">
                    <h2><i class="fas fa-gamepad"></i> Developer Games</h2>
                    <button class="game-close" onclick="gameHub.hide()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="game-grid">
                    <div class="game-card" onclick="gameHub.startGame('typing')">
                        <div class="game-card-icon">
                            <i class="fas fa-keyboard"></i>
                        </div>
                        <h3>Code Typing</h3>
                        <p>Test your typing speed with code snippets</p>
                        <div class="game-card-badge">Speed</div>
                    </div>
                    
                    <div class="game-card" onclick="gameHub.startGame('memory')">
                        <div class="game-card-icon">
                            <i class="fas fa-brain"></i>
                        </div>
                        <h3>Memory Match</h3>
                        <p>Match pairs of programming icons</p>
                        <div class="game-card-badge">Memory</div>
                    </div>
                    
                    <div class="game-card" onclick="gameHub.startGame('reaction')">
                        <div class="game-card-icon">
                            <i class="fas fa-bolt"></i>
                        </div>
                        <h3>Reflex Tester</h3>
                        <p>Test your reaction time</p>
                        <div class="game-card-badge">Reflexes</div>
                    </div>
                    
                    <div class="game-card" onclick="gameHub.startGame('quiz')">
                        <div class="game-card-icon">
                            <i class="fas fa-question-circle"></i>
                        </div>
                        <h3>Code Quiz</h3>
                        <p>Answer programming questions</p>
                        <div class="game-card-badge">Knowledge</div>
                    </div>
                    
                    <div class="game-card" onclick="gameHub.startGame('wordtetris')">
                        <div class="game-card-icon">
                            <i class="fas fa-cubes"></i>
                        </div>
                        <h3>Word Tetris</h3>
                        <p>Stack blocks and form words!</p>
                        <div class="game-card-badge">Puzzle</div>
                    </div>
                    
                    <div class="game-card" onclick="gameHub.startGame('terminal')">
                        <div class="game-card-icon">
                            <i class="fas fa-terminal"></i>
                        </div>
                        <h3>Terminal Hacker</h3>
                        <p>Navigate systems using terminal commands</p>
                        <div class="game-card-badge">Adventure</div>
                    </div>
                    
                    <div class="game-card" onclick="gameHub.startGame('sqldetective')">
                        <div class="game-card-icon">
                            <i class="fas fa-database"></i>
                        </div>
                        <h3>SQL Detective</h3>
                        <p>Crack mystery cases with SQL queries</p>
                        <div class="game-card-badge">Deduction</div>
                    </div>
                    
                    <div class="game-card" onclick="gameHub.startGame('binary')">
                        <div class="game-card-icon">
                            <i class="fas fa-microchip"></i>
                        </div>
                        <h3>Binary Converter</h3>
                        <p>Speed challenge: convert numbers instantly</p>
                        <div class="game-card-badge">Logic</div>
                    </div>
                    
                    <div class="game-card" onclick="gameHub.startGame('cssbattle')">
                        <div class="game-card-icon">
                            <i class="fas fa-palette"></i>
                        </div>
                        <h3>CSS Battle</h3>
                        <p>Recreate designs with minimal code</p>
                        <div class="game-card-badge">Design</div>
                    </div>
                    
                    <div class="game-card" onclick="gameHub.startGame('regex')">
                        <div class="game-card-icon">
                            <i class="fas fa-code"></i>
                        </div>
                        <h3>Regex Golf</h3>
                        <p>Match strings with shortest regex pattern</p>
                        <div class="game-card-badge">Patterns</div>
                    </div>
                    
                    <div class="game-card" onclick="gameHub.startGame('minesweeper')">
                        <div class="game-card-icon">
                            <i class="fas fa-bomb"></i>
                        </div>
                        <h3>Minesweeper</h3>
                        <p>Classic game with bitwise operations</p>
                        <div class="game-card-badge">Strategy</div>
                    </div>
                    
                    <div class="game-card" onclick="gameHub.startGame('pathfinder')">
                        <div class="game-card-icon">
                            <i class="fas fa-route"></i>
                        </div>
                        <h3>Path Finder</h3>
                        <p>Visualize A*, Dijkstra, BFS algorithms</p>
                        <div class="game-card-badge">Algorithms</div>
                    </div>
                </div>
                
                <div class="game-hub-footer">
                    <p><i class="fas fa-trophy"></i> Challenge yourself and improve your skills!</p>
                </div>
            </div>
        `;
    }
    
    startGame(gameType) {
        this.currentGame = this.games[gameType];
        if (this.currentGame) {
            this.currentGame.start();
            if (window.soundSystem) window.soundSystem.play('whoosh');
        }
    }
    
    backToMenu() {
        // Always stop the running game — leaked timers/listeners from here
        // used to break later games (negative clock, dead Backspace).
        if (this.currentGame) {
            this.currentGame.cleanup();
        }
        this.currentGame = null;
        this.showMenu();
        if (window.soundSystem) window.soundSystem.play('click');
    }
    
    show() {
        this.container.classList.add('active');
        document.body.classList.add('game-center-open'); // hides the FAB while inside
        if (window.soundSystem) window.soundSystem.play('whoosh');
    }
    
    hide() {
        this.container.classList.remove('active');
        document.body.classList.remove('game-center-open');
        if (this.currentGame) {
            this.currentGame.cleanup();
            this.currentGame = null;
        }
        setTimeout(() => this.showMenu(), 300);
        if (window.soundSystem) window.soundSystem.play('click');
    }
    
    createFAB() {
        if (document.querySelector('.game-fab')) return; // never stack duplicates
        const fab = document.createElement('button');
        fab.className = 'game-fab glass-effect';
        fab.innerHTML = '<i class="fas fa-gamepad"></i>';
        fab.title = 'Play Developer Games';
        fab.setAttribute('aria-label', 'Play Developer Games');
        fab.addEventListener('click', () => {
            this.show();
        });
        document.body.appendChild(fab);
        
        // Visible immediately — body.loading-active CSS keeps it hidden until the
        // intro loader ends (however long or short that takes).
        fab.classList.add('visible');
    }
}

// ===================================
// GAME 1: CODE TYPING
// ===================================

class TypingGame {
    constructor(hub) {
        this.hub = hub;
        this.score = 0;
        this.timeLeft = 60;
        this.isPlaying = false;
        this.currentCode = '';
        this.currentIndex = 0;
        this.timer = null;
        this.accuracy = 100;
        this.totalTyped = 0;
        this.errors = 0;
        this.scoreManager = new HighScoreManager('typingGame');
        this.deck = []; // shuffled snippet order, refilled when exhausted
        
        this.codeSnippets = [
            'function hello() { return "world"; }',
            'const array = [1, 2, 3].map(x => x * 2);',
            'class Component extends React.Component { }',
            'async function fetchData() { await api.get(); }',
            'let value = a > b ? a : b;',
            'document.querySelector(".className");',
            'const { name, age } = person;',
            'arr.filter(x => x > 5).sort((a,b) => a-b);',
            'const promise = new Promise(resolve => {});',
            'export default function App() { return <div/>; }',
            'import React, { useState } from "react";',
            'npm install --save-dev package-name',
            'git commit -m "feat: add new feature"',
            'console.log("Hello, World!");',
            'setTimeout(() => { console.log("tick"); }, 1000);',
            'const sum = numbers.reduce((a, b) => a + b, 0);',
            'try { riskyOperation(); } catch(e) { }',
            'for (let i = 0; i < 10; i++) { }',
            'while (condition) { doSomething(); }',
            'const obj = { ...spread, key: value };',
            'const [count, setCount] = useState(0);',
            'fetch(url).then(res => res.json());',
            'const unique = [...new Set(items)];',
            'if (x !== null && x !== undefined) { }',
            'localStorage.setItem("theme", "dark");',
            'const sorted = [...arr].sort((a, b) => a - b);',
            'window.addEventListener("resize", onResize);',
            'const { data } = await axios.get("/api/users");',
            'element.classList.toggle("active");',
            'return items.find(item => item.id === id);',
            'JSON.stringify(payload, null, 2);',
            'const total = price * qty * (1 + taxRate);',
            'def greet(name): return f"Hello, {name}"',
            'for i in range(10): print(i * i)',
            'squares = [x ** 2 for x in range(20)]',
            'with open("data.csv") as f: rows = f.readlines()',
            'import numpy as np; arr = np.zeros((3, 3))',
            'df = pd.read_csv("sales.csv")',
            'SELECT name, email FROM users WHERE active = 1;',
            'UPDATE orders SET status = \'shipped\' WHERE id = 42;',
            'git checkout -b feature/login-page',
            'git rebase -i HEAD~3',
            'docker run -p 8080:80 nginx:latest',
            'npx create-react-app my-app --template typescript',
            '<button class="btn" onclick="save()">Save</button>',
            '<img src="logo.png" alt="Company logo" />',
            '.container { display: flex; gap: 1rem; }',
            '@media (max-width: 768px) { .nav { display: none; } }',
            'body { margin: 0; font-family: sans-serif; }',
            'public static void main(String[] args) { }'
        ];
    }
    
    async start() {
        // Make scoreManager globally accessible for leaderboard button
        window.currentScoreManager = this.scoreManager;
        
        // Get high scores (async because it fetches from Firebase)
        const highScoreHTML = await this.scoreManager.getStartScreenHTML();
        if (this.hub.currentGame !== this) return; // player left during the fetch
        
        this.hub.container.innerHTML = `
            <div class="typing-game glass-effect">
                <div class="game-header">
                    <button class="btn-back" onclick="gameHub.backToMenu()">
                        <i class="fas fa-arrow-left"></i>
                    </button>
                    <h3><i class="fas fa-keyboard"></i> Code Typing Challenge</h3>
                    <div class="header-actions">
                        <button class="btn-player-name" id="btnSetName" title="Set your name">
                            <i class="fas fa-user-edit"></i>
                            <span id="playerNameDisplay">${this.scoreManager.getPlayerName() || 'Set Name'}</span>
                        </button>
                        <button class="game-close" onclick="gameHub.hide()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
                
                <div class="game-stats-row">  
                    <div class="stat-box">
                        <i class="fas fa-star"></i>
                        <div>
                            <div class="stat-value" id="gameScore">0</div>
                            <div class="stat-label">Score</div>
                        </div>
                    </div>
                    <div class="stat-box">
                        <i class="fas fa-clock"></i>
                        <div>
                            <div class="stat-value" id="gameTime">60</div>
                            <div class="stat-label">Seconds</div>
                        </div>
                    </div>
                    <div class="stat-box">
                        <i class="fas fa-crosshairs"></i>
                        <div>
                            <div class="stat-value" id="gameAccuracy">100</div>
                            <div class="stat-label">Accuracy%</div>
                        </div>
                    </div>
                </div>
                
                <div class="game-content" id="gameContent">
                    <div class="game-start-screen">
                        <div class="game-icon-large">
                            <i class="fas fa-code"></i>
                        </div>
                        <h4>Speed Typing Challenge</h4>
                        <p class="game-description">Type code snippets as fast and accurately as you can!</p>
                        
                        ${highScoreHTML}
                        
                        <button class="btn-game-start" id="startTyping">
                            <i class="fas fa-play"></i>
                            <span>Start Challenge</span>
                        </button>
                        <div class="game-rules">
                            <div class="rule-item">
                                <i class="fas fa-check-circle"></i>
                                <span>Type exactly as shown</span>
                            </div>
                            <div class="rule-item">
                                <i class="fas fa-check-circle"></i>
                                <span>Longer snippets are worth more points</span>
                            </div>
                            <div class="rule-item">
                                <i class="fas fa-check-circle"></i>
                                <span>60 seconds on the clock</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('startTyping').addEventListener('click', () => this.startGame());
        document.getElementById('btnSetName').addEventListener('click', () => {
            const name = this.scoreManager.promptForName();
            document.getElementById('playerNameDisplay').textContent = name;
        });
    }
    
    startTimer() {
        clearInterval(this.timer); // never let two clocks run at once
        this.timer = setInterval(() => {
            this.timeLeft--;
            document.getElementById('gameTime').textContent = Math.max(0, this.timeLeft);
            
            if (this.timeLeft <= 0) {
                this.endGame();
            } else if (this.timeLeft <= 10) {
                document.getElementById('gameTime').style.color = '#ff0000';
            }
        }, 1000);
    }
    
    // Deal snippets from a shuffled deck so lines don't repeat until all 50 are used.
    _nextSnippet() {
        if (this.deck.length === 0) {
            this.deck = [...this.codeSnippets.keys()];
            for (let i = this.deck.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
            }
            // fresh deck must not open with the line just played
            if (this.codeSnippets[this.deck[this.deck.length - 1]] === this.currentCode) {
                this.deck.unshift(this.deck.pop());
            }
        }
        return this.codeSnippets[this.deck.pop()];
    }
    
    loadNextCode() {
        this.currentCode = this._nextSnippet();
        this.currentIndex = 0;
        
        const content = document.getElementById('gameContent');
        content.innerHTML = `
            <div class="game-active">
                <div class="code-display">
                    <div class="code-text" id="codeText"></div>
                </div>
                <input 
                    type="text" 
                    class="code-input" 
                    id="codeInput" 
                    placeholder="Start typing..."
                    autocomplete="off"
                    spellcheck="false"
                >
                <div class="game-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" id="progressFill"></div>
                    </div>
                </div>
            </div>
        `;
        
        this.updateCodeDisplay();
        
        const input = document.getElementById('codeInput');
        input.focus();
        input.addEventListener('input', (e) => this.handleInput(e));
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.checkCode();
            }
        });
    }
    
    updateCodeDisplay() {
        const display = document.getElementById('codeText');
        if (!display) return;
        
        let html = '';
        for (let i = 0; i < this.currentCode.length; i++) {
            const char = this.currentCode[i];
            if (i < this.currentIndex) {
                html += `<span class="char-correct">${char}</span>`;
            } else if (i === this.currentIndex) {
                html += `<span class="char-current">${char}</span>`;
            } else {
                html += `<span class="char-pending">${char}</span>`;
            }
        }
        
        display.innerHTML = html;
    }
    
    handleInput(e) {
        const input = e.target.value;
        
        if (input === this.currentCode.substring(0, input.length)) {
            this.currentIndex = input.length;
            this.updateCodeDisplay();
            this.updateProgress();
            
            if (window.soundSystem && input.length > 0) {
                window.soundSystem.play('type');
            }
            
            if (input === this.currentCode) {
                this.checkCode();
            }
        } else {
            // Wrong character
            if (window.soundSystem) window.soundSystem.play('error');
            e.target.classList.add('shake');
            setTimeout(() => e.target.classList.remove('shake'), 500);
        }
    }
    
    updateProgress() {
        const progress = (this.currentIndex / this.currentCode.length) * 100;
        const fill = document.getElementById('progressFill');
        if (fill) fill.style.width = `${progress}%`;
    }
    
    checkCode() {
        const input = document.getElementById('codeInput');
        if (input.value === this.currentCode) {
            // longer snippets pay more (~1 pt per 3 chars, min 5)
            this.score += Math.max(5, Math.round(this.currentCode.length / 3));
            this.updateScore();
            if (window.soundSystem) window.soundSystem.play('success');
            
            input.classList.add('correct-flash');
            setTimeout(() => {
                input.classList.remove('correct-flash');
                if (this.isPlaying) this.loadNextCode(); // clock may have run out mid-flash
            }, 300);
        }
    }
    
    updateScore() {
        document.getElementById('gameScore').textContent = this.score;
    }
    
    endGame() {
        if (!this.isPlaying) return; // a stray tick must not rebuild this screen
        this.isPlaying = false;
        clearInterval(this.timer);
        this.timer = null;
        
        // Partial credit: a clean prefix of the unfinished line earns its share
        // of that line's points; any wrong character in the box earns nothing.
        this.lastPartial = 0;
        const inputEl = document.getElementById('codeInput');
        if (inputEl && this.currentCode) {
            const typed = inputEl.value;
            if (typed.length > 0 && typed.length < this.currentCode.length &&
                typed === this.currentCode.substring(0, typed.length)) {
                const full = Math.max(5, Math.round(this.currentCode.length / 3));
                this.lastPartial = Math.round(full * typed.length / this.currentCode.length);
                this.score += this.lastPartial;
                this.updateScore();
            }
        }
        
        // Save local high score
        const isNewRecord = this.scoreManager.saveLocalHighScore(this.score);
        const personalBest = this.scoreManager.getLocalHighScore();
        
        // Submit to global leaderboard (async, but we don't wait for it)
        this.scoreManager.submitGlobalScore(this.score).then(success => {
            if (success) {
                console.log('✅ Score submitted to global leaderboard!');
            }
        });
        
        const content = document.getElementById('gameContent');
        content.innerHTML = `
            <div class="game-end">
                ${isNewRecord ? `
                    <div class="new-record-banner">
                        <i class="fas fa-trophy"></i>
                        <span>NEW PERSONAL RECORD!</span>
                        <i class="fas fa-star"></i>
                    </div>
                ` : ''}
                <div class="game-icon ${this.score > 50 ? 'success' : ''}">
                    <i class="fas fa-${this.score > 50 ? 'trophy' : 'flag-checkered'}"></i>
                </div>
                <h4>Game Over!</h4>
                <div class="final-score">
                    <div class="score-value">${this.score}</div>
                    <div class="score-label">Your Score</div>
                </div>
                ${this.lastPartial > 0 ? `
                    <div class="highscore-info">
                        <i class="fas fa-battery-half"></i>
                        <span>Includes +${this.lastPartial} partial credit for your last line</span>
                    </div>
                ` : ''}
                ${personalBest && !isNewRecord ? `
                    <div class="highscore-info">
                        <i class="fas fa-medal"></i> 
                        <span>Personal Best: ${personalBest.score} by ${personalBest.name}</span>
                    </div>
                ` : ''}
                <div class="score-rating">
                    ${this.getRating()}
                </div>
                <div class="game-actions">
                    <button class="btn btn-secondary" onclick="window.currentScoreManager?.showLeaderboard()">
                        <i class="fas fa-trophy"></i>
                        <span>View Leaderboard</span>
                    </button>
                    <button class="btn btn-primary" id="playAgain">
                        <span>Play Again</span>
                        <i class="fas fa-redo"></i>
                    </button>
                </div>
            </div>
        `;
        
        document.getElementById('playAgain')?.addEventListener('click', () => this.start());
        
        if (window.soundSystem) {
            window.soundSystem.play(isNewRecord ? 'success' : (this.score > 50 ? 'success' : 'notification'));
        }
    }
    
    getRating() {
        if (this.score >= 100) return '🏆 Master Coder!';
        if (this.score >= 70) return '⭐ Expert!';
        if (this.score >= 50) return '👍 Great Job!';
        if (this.score >= 30) return '👌 Good Effort!';
        return '💪 Keep Practicing!';
    }
    
    startGame() {
        this.score = 0;
        this.timeLeft = 60;
        this.isPlaying = true;
        this.errors = 0;
        this.totalTyped = 0;
        this.accuracy = 100;
        this.deck = []; // reshuffle the snippet order each game
        
        this.updateScore();
        this.loadNextCode();
        this.startTimer();
    }
    
    cleanup() {
        if (this.timer) clearInterval(this.timer);
        this.timer = null;
        this.isPlaying = false;
    }
}

// ===================================
// GAME 2: MEMORY MATCH
// ===================================

class MemoryGame {
    constructor(hub) {
        this.hub = hub;
        this.score = 0;
        this.moves = 0;
        this.firstCard = null;
        this.secondCard = null;
        this.lockBoard = false;
        this.matchedPairs = 0;
        this.scoreManager = new HighScoreManager('memoryGame', 'lower');
        
        this.icons = [
            'fa-html5', 'fa-css3-alt', 'fa-js', 'fa-react', 
            'fa-node', 'fa-python', 'fa-git-alt', 'fa-github'
        ];
    }
    
    async start() {
        // Make scoreManager globally accessible for leaderboard button
        window.currentScoreManager = this.scoreManager;
        
        // Get high scores (async because it fetches from Firebase)
        const highScoreHTML = await this.scoreManager.getStartScreenHTML();
        if (this.hub.currentGame !== this) return; // player left during the fetch
        
        this.hub.container.innerHTML = `
            <div class="memory-game glass-effect">
                <div class="game-header">
                    <button class="btn-back" onclick="gameHub.backToMenu()">
                        <i class="fas fa-arrow-left"></i>
                    </button>
                    <h3><i class="fas fa-brain"></i> Memory Match</h3>
                    <div class="header-actions">
                        <button class="btn-player-name" id="btnSetName" title="Set your name">
                            <i class="fas fa-user-edit"></i>
                            <span id="playerNameDisplay">${this.scoreManager.getPlayerName() || 'Set Name'}</span>
                        </button>
                        <button class="game-close" onclick="gameHub.hide()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
                
                <div class="game-stats-row">
                    <div class="stat-box">
                        <i class="fas fa-trophy"></i>
                        <div>
                            <div class="stat-value" id="memoryScore">0</div>
                            <div class="stat-label">Pairs</div>
                        </div>
                    </div>
                    <div class="stat-box">
                        <i class="fas fa-mouse-pointer"></i>
                        <div>
                            <div class="stat-value" id="memoryMoves">0</div>
                            <div class="stat-label">Moves</div>
                        </div>
                    </div>
                </div>
                
                <div class="game-content" id="memoryContent">
                    <div class="game-start-screen">
                        <div class="game-icon-large">
                            <i class="fas fa-brain"></i>
                        </div>
                        <h4>Memory Challenge</h4>
                        <p class="game-description">Match pairs of developer icons</p>
                        
                        ${highScoreHTML}
                        
                        <button class="btn-game-start" id="startMemory">
                            <i class="fas fa-play"></i>
                            <span>Start Game</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('startMemory').addEventListener('click', () => this.startGame());
        document.getElementById('btnSetName').addEventListener('click', () => {
            const name = this.scoreManager.promptForName();
            document.getElementById('playerNameDisplay').textContent = name || 'Set Name';
        });
    }
    
    startGame() {
        this.score = 0;
        this.moves = 0;
        this.matchedPairs = 0;
        this.updateStats();
        
        const cards = this.createCards();
        const content = document.getElementById('memoryContent');
        content.innerHTML = `
            <div class="memory-grid">
                ${cards.map((icon, index) => `
                    <div class="memory-card" data-icon="${icon}" data-index="${index}">
                        <div class="card-front"><i class="fas fa-code"></i></div>
                        <div class="card-back"><i class="fab ${icon}"></i></div>
                    </div>
                `).join('')}
            </div>
        `;
        
        document.querySelectorAll('.memory-card').forEach(card => {
            card.addEventListener('click', () => this.flipCard(card));
        });
    }
    
    createCards() {
        const doubled = [...this.icons, ...this.icons];
        return doubled.sort(() => Math.random() - 0.5);
    }
    
    flipCard(card) {
        if (this.lockBoard) return;
        if (card === this.firstCard) return;
        if (card.classList.contains('flipped')) return;
        
        card.classList.add('flipped');
        if (window.soundSystem) window.soundSystem.play('click');
        
        if (!this.firstCard) {
            this.firstCard = card;
            return;
        }
        
        this.secondCard = card;
        this.moves++;
        this.updateStats();
        this.checkMatch();
    }
    
    checkMatch() {
        const isMatch = this.firstCard.dataset.icon === this.secondCard.dataset.icon;
        
        if (isMatch) {
            this.disableCards();
            this.score++;
            this.matchedPairs++;
            if (window.soundSystem) window.soundSystem.play('success');
            
            if (this.matchedPairs === this.icons.length) {
                setTimeout(() => this.endGame(), 500);
            }
        } else {
            this.unflipCards();
            if (window.soundSystem) window.soundSystem.play('error');
        }
    }
    
    disableCards() {
        this.firstCard.classList.add('matched');
        this.secondCard.classList.add('matched');
        this.resetBoard();
    }
    
    unflipCards() {
        this.lockBoard = true;
        setTimeout(() => {
            this.firstCard.classList.remove('flipped');
            this.secondCard.classList.remove('flipped');
            this.resetBoard();
        }, 1000);
    }
    
    resetBoard() {
        [this.firstCard, this.secondCard, this.lockBoard] = [null, null, false];
    }
    
    updateStats() {
        document.getElementById('memoryScore').textContent = this.score;
        document.getElementById('memoryMoves').textContent = this.moves;
    }
    
    endGame() {
        const content = document.getElementById('memoryContent');
        const rating = this.moves <= 12 ? '🏆 Perfect!' : this.moves <= 20 ? '⭐ Great!' : '👍 Good!';
        
        // For Memory Game, lower moves is better
        const calculatedScore = this.moves; // Use moves directly (lower is better)
        const isNewRecord = this.scoreManager.saveLocalHighScore(calculatedScore);
        const personalBest = this.scoreManager.getLocalHighScore();
        
        // Show initial content with loading indicator for leaderboard button
        content.innerHTML = `
            <div class="game-end">
                ${isNewRecord ? `
                    <div class="new-record-banner">
                        <i class="fas fa-trophy"></i>
                        <span>NEW PERSONAL RECORD!</span>
                        <i class="fas fa-star"></i>
                    </div>
                ` : ''}
                <div class="game-icon success">
                    <i class="fas fa-trophy"></i>
                </div>
                <h4>Congratulations!</h4>
                <div class="final-stats-grid">
                    <div class="stat-item">
                        <div class="stat-value">${this.score}</div>
                        <div class="stat-label">Pairs Matched</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${this.moves}</div>
                        <div class="stat-label">Total Moves</div>
                    </div>
                </div>
                <div class="score-rating">${rating}</div>
                ${personalBest > 0 && !isNewRecord ? `
                    <div class="highscore-info">
                        <i class="fas fa-medal"></i> Best Score: ${personalBest} (Fewest Moves)
                    </div>
                ` : ''}
                <div class="game-actions">
                    <button class="btn btn-secondary" id="viewLeaderboardBtn" disabled style="opacity: 0.5;">
                        <i class="fas fa-spinner fa-spin"></i>
                        <span>Submitting...</span>
                    </button>
                    <button class="btn btn-secondary" onclick="gameHub.games.memory.start()">
                        <i class="fas fa-home"></i>
                        <span>Back to Home</span>
                    </button>
                    <button class="btn btn-primary" id="playAgain">
                        <span>Play Again</span>
                        <i class="fas fa-redo"></i>
                    </button>
                </div>
            </div>
        `;
        
        document.getElementById('playAgain').addEventListener('click', () => this.startGame());
        
        // Submit to global leaderboard AFTER showing UI
        this.scoreManager.submitGlobalScore(calculatedScore)
            .then(success => {
                const btn = document.getElementById('viewLeaderboardBtn');
                if (btn) {
                    btn.disabled = false;
                    btn.style.opacity = '1';
                    if (success) {
                        console.log('✅ Memory Game: Score submitted to global leaderboard');
                        console.log(`📊 Submitted: ${calculatedScore} moves for ${this.scoreManager.getPlayerName() || 'Anonymous'}`);
                        btn.innerHTML = '<i class="fas fa-trophy"></i> <span>View Leaderboard</span>';
                        btn.onclick = () => window.currentScoreManager?.showLeaderboard(true);
                    } else {
                        console.warn('⚠️ Memory Game: Score submission failed');
                        btn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> <span>Submission Failed</span>';
                        btn.onclick = () => window.currentScoreManager?.showLeaderboard(false);
                    }
                }
            })
            .catch(err => {
                console.error('❌ Memory Game: Failed to submit score:', err);
                const btn = document.getElementById('viewLeaderboardBtn');
                if (btn) {
                    btn.disabled = false;
                    btn.style.opacity = '1';
                    btn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> <span>View Leaderboard</span>';
                    btn.onclick = () => window.currentScoreManager?.showLeaderboard(false);
                }
            });
    }
    
    cleanup() {
        this.resetBoard();
    }
}

// ===================================
// GAME 3: REACTION TEST
// ===================================

class ReactionGame {
    constructor(hub) {
        this.hub = hub;
        this.score = 0;
        this.round = 0;
        this.startTime = 0;
        this.times = [];
        this.waiting = false;
        this.timeout = null;
        this.earlyClicks = 0; // Track early click penalties
        this.scoreManager = new HighScoreManager('reactionGame', 'lower');
    }
    
    async start() {
        // Make scoreManager globally accessible for leaderboard button
        window.currentScoreManager = this.scoreManager;
        
        // Get high scores (async because it fetches from Firebase)
        const highScoreHTML = await this.scoreManager.getStartScreenHTML();
        if (this.hub.currentGame !== this) return; // player left during the fetch
        
        this.hub.container.innerHTML = `
            <div class="reaction-game glass-effect">
                <div class="game-header">
                    <button class="btn-back" onclick="gameHub.backToMenu()">
                        <i class="fas fa-arrow-left"></i>
                    </button>
                    <h3><i class="fas fa-bolt"></i> Reaction Test</h3>
                    <div class="header-actions">
                        <button class="btn-player-name" id="btnSetName" title="Set your name">
                            <i class="fas fa-user-edit"></i>
                            <span id="playerNameDisplay">${this.scoreManager.getPlayerName() || 'Set Name'}</span>
                        </button>
                        <button class="game-close" onclick="gameHub.hide()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
                
                <div class="game-stats-row">
                    <div class="stat-box">
                        <i class="fas fa-stopwatch"></i>
                        <div>
                            <div class="stat-value" id="avgTime">0</div>
                            <div class="stat-label">Avg (ms)</div>
                        </div>
                    </div>
                    <div class="stat-box">
                        <i class="fas fa-bullseye"></i>
                        <div>
                            <div class="stat-value" id="roundNum">0</div>
                            <div class="stat-label">Round</div>
                        </div>
                    </div>
                </div>
                
                <div class="game-content" id="reactionContent">
                    <div class="game-start-screen">
                        <div class="game-icon-large">
                            <i class="fas fa-bolt"></i>
                        </div>
                        <h4>Reaction Speed Test</h4>
                        <p class="game-description">Click as fast as you can when the screen turns green!</p>
                        
                        ${highScoreHTML}
                        
                        <button class="btn-game-start" id="startReaction">
                            <i class="fas fa-play"></i>
                            <span>Start Test</span>
                        </button>
                        <div class="game-rules">
                            <div class="rule-item">
                                <i class="fas fa-check-circle"></i>
                                <span>Wait for green screen</span>
                            </div>
                            <div class="rule-item">
                                <i class="fas fa-check-circle"></i>
                                <span>Click immediately</span>
                            </div>
                            <div class="rule-item">
                                <i class="fas fa-check-circle"></i>
                                <span>5 rounds to complete</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('startReaction').addEventListener('click', () => this.startGame());
        document.getElementById('btnSetName').addEventListener('click', () => {
            const name = this.scoreManager.promptForName();
            document.getElementById('playerNameDisplay').textContent = name || 'Set Name';
        });
    }
    
    startGame() {
        this.score = 0;
        this.round = 0;
        this.times = [];
        this.earlyClicks = 0; // Reset early click counter
        this.nextRound();
    }
    
    nextRound() {
        if (this.round >= 5) {
            this.endGame();
            return;
        }
        
        this.round++;
        this.updateStats();
        
        const content = document.getElementById('reactionContent');
        content.innerHTML = `
            <div class="reaction-box waiting" id="reactionBox">
                <div class="reaction-text">
                    <i class="fas fa-hourglass-half"></i>
                    <h4>Wait for green...</h4>
                    <p>Round ${this.round} of 5</p>
                </div>
            </div>
        `;
        
        const box = document.getElementById('reactionBox');
        const delay = 2000 + Math.random() * 3000;
        
        this.waiting = true;
        this.timeout = setTimeout(() => {
            this.startTime = Date.now();
            this.waiting = false;
            box.className = 'reaction-box ready';
            box.innerHTML = `
                <div class="reaction-text">
                    <i class="fas fa-mouse-pointer"></i>
                    <h4>CLICK NOW!</h4>
                </div>
            `;
            if (window.soundSystem) window.soundSystem.play('notification');
        }, delay);
        
        box.addEventListener('click', () => this.handleClick());
    }
    
    handleClick() {
        if (this.waiting) {
            clearTimeout(this.timeout);
            this.earlyClicks++;
            this.round++; // Count this as a completed round
            
            // Add penalty: 5000ms for early click (very bad score)
            this.times.push(5000);
            
            const content = document.getElementById('reactionContent');
            content.innerHTML = `
                <div class="reaction-box too-soon">
                    <div class="reaction-text">
                        <i class="fas fa-exclamation-triangle"></i>
                        <h4>Too Soon!</h4>
                        <p>Wait for green screen</p>
                        <p style="color: #ff6b6b; margin-top: 1rem;">⚠️ Penalty: 5000ms added</p>
                        <button class="btn btn-primary" id="continueBtn">Continue (${this.round}/5)</button>
                    </div>
                </div>
            `;
            if (window.soundSystem) window.soundSystem.play('error');
            document.getElementById('continueBtn').addEventListener('click', () => this.nextRound());
            this.updateStats();
            return;
        }
        
        const reactionTime = Date.now() - this.startTime;
        this.times.push(reactionTime);
        
        const content = document.getElementById('reactionContent');
        content.innerHTML = `
            <div class="reaction-box result">
                <div class="reaction-text">
                    <i class="fas fa-check-circle"></i>
                    <div class="reaction-time">${reactionTime}ms</div>
                    <p>${this.getRating(reactionTime)}</p>
                    <button class="btn btn-primary" id="nextRound">
                        ${this.round < 5 ? 'Next Round' : 'See Results'}
                        <i class="fas fa-arrow-right"></i>
                    </button>
                </div>
            </div>
        `;
        
        if (window.soundSystem) window.soundSystem.play('success');
        this.updateStats();
        
        document.getElementById('nextRound').addEventListener('click', () => this.nextRound());
    }
    
    getRating(time) {
        if (time < 200) return '🚀 Lightning Fast!';
        if (time < 300) return '⚡ Very Quick!';
        if (time < 400) return '👍 Good!';
        return '👌 Nice try!';
    }
    
    updateStats() {
        const avg = this.times.length > 0 
            ? Math.round(this.times.reduce((a, b) => a + b, 0) / this.times.length)
            : 0;
        document.getElementById('avgTime').textContent = avg;
        document.getElementById('roundNum').textContent = this.round;
    }
    
    endGame() {
        // Don't allow submission if player didn't complete any valid rounds
        if (this.times.length === 0) {
            const content = document.getElementById('reactionContent');
            content.innerHTML = `
                <div class="game-end">
                    <div class="game-icon">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <h4>Game Invalid</h4>
                    <p>No valid rounds completed. Score not submitted.</p>
                    <div class="game-actions">
                        <button class="btn btn-secondary" onclick="gameHub.games.reaction.start()">
                            <i class="fas fa-home"></i>
                            <span>Back to Home</span>
                        </button>
                        <button class="btn btn-primary" onclick="gameHub.games.reaction.startGame()">
                            <span>Try Again</span>
                            <i class="fas fa-redo"></i>
                        </button>
                    </div>
                </div>
            `;
            return;
        }
        
        const avg = Math.round(this.times.reduce((a, b) => a + b, 0) / this.times.length);
        const best = Math.min(...this.times);
        const validRounds = this.times.filter(t => t < 5000).length; // Rounds without penalties
        
        // For reaction game, lower time is better
        const calculatedScore = avg; // Use average time directly (lower is better)
        const isNewRecord = this.scoreManager.saveLocalHighScore(calculatedScore);
        const personalBest = this.scoreManager.getLocalHighScore();
        
        const content = document.getElementById('reactionContent');
        content.innerHTML = `
            <div class="game-end">
                ${isNewRecord ? `
                    <div class="new-record-banner">
                        <i class="fas fa-trophy"></i>
                        <span>NEW PERSONAL RECORD!</span>
                        <i class="fas fa-star"></i>
                    </div>
                ` : ''}
                <div class="game-icon success">
                    <i class="fas fa-trophy"></i>
                </div>
                <h4>Test Complete!</h4>
                <div class="final-stats-grid">
                    <div class="stat-item">
                        <div class="stat-value">${avg}ms</div>
                        <div class="stat-label">Average Time</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${best}ms</div>
                        <div class="stat-label">Best Time</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${validRounds}/5</div>
                        <div class="stat-label">Valid Rounds</div>
                    </div>
                </div>
                ${this.earlyClicks > 0 ? `
                    <div class="score-rating" style="color: #ff6b6b;">
                        <i class="fas fa-exclamation-triangle"></i> ${this.earlyClicks} early ${this.earlyClicks === 1 ? 'click' : 'clicks'} penalized
                    </div>
                ` : `<div class="score-rating">${this.getFinalRating(avg)}</div>`}
                ${personalBest > 0 && !isNewRecord ? `
                    <div class="highscore-info">
                        <i class="fas fa-medal"></i> Best Score: ${personalBest}ms (Fastest Average)
                    </div>
                ` : ''}
                <div class="game-actions">
                    <button class="btn btn-secondary" id="viewLeaderboardBtn" disabled style="opacity: 0.5;">
                        <i class="fas fa-spinner fa-spin"></i>
                        <span>Submitting...</span>
                    </button>
                    <button class="btn btn-secondary" onclick="gameHub.games.reaction.start()">
                        <i class="fas fa-home"></i>
                        <span>Back to Home</span>
                    </button>
                    <button class="btn btn-primary" id="playAgain">
                        <span>Try Again</span>
                        <i class="fas fa-redo"></i>
                    </button>
                </div>
            </div>
        `;
        
        document.getElementById('playAgain').addEventListener('click', () => this.startGame());
        
        // Submit to global leaderboard AFTER showing UI
        this.scoreManager.submitGlobalScore(calculatedScore)
            .then(success => {
                const btn = document.getElementById('viewLeaderboardBtn');
                if (btn) {
                    btn.disabled = false;
                    btn.style.opacity = '1';
                    if (success) {
                        console.log('✅ Reaction Game: Score submitted to global leaderboard');
                        btn.innerHTML = '<i class="fas fa-trophy"></i> <span>View Leaderboard</span>';
                        btn.onclick = () => window.currentScoreManager?.showLeaderboard(true);
                    } else {
                        console.warn('⚠️ Reaction Game: Score submission failed');
                        btn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> <span>View Leaderboard</span>';
                        btn.onclick = () => window.currentScoreManager?.showLeaderboard(false);
                    }
                }
            })
            .catch(err => {
                console.error('❌ Reaction Game: Failed to submit score:', err);
                const btn = document.getElementById('viewLeaderboardBtn');
                if (btn) {
                    btn.disabled = false;
                    btn.style.opacity = '1';
                    btn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> <span>View Leaderboard</span>';
                    btn.onclick = () => window.currentScoreManager?.showLeaderboard(false);
                }
            });
    }
    
    getFinalRating(avg) {
        if (avg < 250) return '🏆 Superhuman Reflexes!';
        if (avg < 350) return '⚡ Lightning Fast!';
        if (avg < 450) return '👍 Above Average!';
        return '👌 Good Job!';
    }
    
    cleanup() {
        if (this.timeout) clearTimeout(this.timeout);
    }
}

// ===================================
// GAME 4: CODE QUIZ
// ===================================

class CodeQuiz {
    static ROUND_SIZE = 11;

    constructor(hub) {
        this.hub = hub;
        this.score = 0;
        this.currentQuestion = 0;
        this.scoreManager = new HighScoreManager('codeQuiz');
        this.round = []; // built fresh each game from the question bank
    }

    // Question bank lives in quiz-questions.js (options[0] = correct there).
    get bank() {
        return window.QUIZ_QUESTIONS || [];
    }

    _shuffle(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    _esc(s) {
        const d = document.createElement('div');
        d.textContent = s;
        return d.innerHTML;
    }

    // Pick ROUND_SIZE questions round-robin across shuffled categories so every
    // language is represented, then shuffle play order and each option list.
    _buildRound() {
        const byCat = new Map();
        this.bank.forEach((q) => {
            if (!byCat.has(q.cat)) byCat.set(q.cat, []);
            byCat.get(q.cat).push(q);
        });
        const cats = this._shuffle([...byCat.keys()]);
        byCat.forEach((pool) => this._shuffle(pool));

        const picked = [];
        let guard = 0;
        while (picked.length < CodeQuiz.ROUND_SIZE && guard < 1000) {
            const pool = byCat.get(cats[guard % cats.length]);
            if (pool && pool.length) picked.push(pool.pop());
            guard++;
        }
        this._shuffle(picked);

        this.round = picked.map((src) => {
            const options = this._shuffle([...src.options]);
            return {
                cat: src.cat,
                question: src.q,
                options,
                correct: options.indexOf(src.options[0])
            };
        });
    }
    
    async start() {
        // Make scoreManager globally accessible for leaderboard button
        window.currentScoreManager = this.scoreManager;
        
        // Get high scores (async because it fetches from Firebase)
        const highScoreHTML = await this.scoreManager.getStartScreenHTML();
        if (this.hub.currentGame !== this) return; // player left during the fetch
        
        this.hub.container.innerHTML = `
            <div class="quiz-game glass-effect">
                <div class="game-header">
                    <button class="btn-back" onclick="gameHub.backToMenu()">
                        <i class="fas fa-arrow-left"></i>
                    </button>
                    <h3><i class="fas fa-question-circle"></i> Code Quiz</h3>
                    <div class="header-actions">
                        <button class="btn-player-name" id="btnSetName" title="Set your name">
                            <i class="fas fa-user-edit"></i>
                            <span id="playerNameDisplay">${this.scoreManager.getPlayerName() || 'Set Name'}</span>
                        </button>
                        <button class="game-close" onclick="gameHub.hide()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
                
                <div class="game-stats-row">
                    <div class="stat-box">
                        <i class="fas fa-trophy"></i>
                        <div>
                            <div class="stat-value" id="quizScore">0</div>
                            <div class="stat-label">Score</div>
                        </div>
                    </div>
                    <div class="stat-box">
                        <i class="fas fa-list-ol"></i>
                        <div>
                            <div class="stat-value" id="quizProgress">0/${CodeQuiz.ROUND_SIZE}</div>
                            <div class="stat-label">Progress</div>
                        </div>
                    </div>
                </div>
                
                <div class="game-content" id="quizContent">
                    <div class="game-start-screen">
                        <div class="game-icon-large">
                            <i class="fas fa-graduation-cap"></i>
                        </div>
                        <h4>Programming Quiz</h4>
                        <p class="game-description">HTML, CSS, JavaScript, Python, C, C++, Java, AI &amp; ML — a fresh mix every round!</p>
                        
                        ${highScoreHTML}
                        
                        <button class="btn-game-start" id="startQuiz">
                            <i class="fas fa-play"></i>
                            <span>Start Quiz</span>
                        </button>
                        <div class="quiz-info">
                            <p><i class="fas fa-check-circle"></i> ${CodeQuiz.ROUND_SIZE} random questions from a pool of ${this.bank.length}</p>
                            <p><i class="fas fa-check-circle"></i> Every major language, every round</p>
                            <p><i class="fas fa-check-circle"></i> Answer positions shuffle each game</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('startQuiz').addEventListener('click', () => this.startGame());
        document.getElementById('btnSetName').addEventListener('click', () => {
            const name = this.scoreManager.promptForName();
            document.getElementById('playerNameDisplay').textContent = name || 'Set Name';
        });
    }
    
    startGame() {
        if (!this.bank.length) {
            document.getElementById('quizContent').innerHTML =
                '<p class="game-description">Question bank failed to load — refresh the page and try again.</p>';
            return;
        }
        this.score = 0;
        this.currentQuestion = 0;
        this._buildRound();
        this.showQuestion();
    }
    
    showQuestion() {
        if (this.currentQuestion >= this.round.length) {
            this.endGame();
            return;
        }
        
        const q = this.round[this.currentQuestion];
        const content = document.getElementById('quizContent');
        
        content.innerHTML = `
            <div class="quiz-question">
                <div class="question-number">Question ${this.currentQuestion + 1} of ${this.round.length} &middot; ${this._esc(q.cat)}</div>
                <h4 class="question-text">${this._esc(q.question)}</h4>
                <div class="quiz-options">
                    ${q.options.map((option, index) => `
                        <button class="quiz-option" data-index="${index}">
                            <span class="option-letter">${String.fromCharCode(65 + index)}</span>
                            <span class="option-text">${this._esc(option)}</span>
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
        
        document.querySelectorAll('.quiz-option').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const selectedIndex = parseInt(e.currentTarget.dataset.index);
                this.checkAnswer(selectedIndex, e.currentTarget);
            });
        });
        
        this.updateStats();
    }
    
    checkAnswer(selected, button) {
        const correct = this.round[this.currentQuestion].correct;
        const isCorrect = selected === correct;
        
        document.querySelectorAll('.quiz-option').forEach(btn => {
            btn.disabled = true;
            const index = parseInt(btn.dataset.index);
            if (index === correct) {
                btn.classList.add('correct');
            } else if (index === selected && !isCorrect) {
                btn.classList.add('incorrect');
            }
        });
        
        if (isCorrect) {
            this.score++;
            if (window.soundSystem) window.soundSystem.play('success');
        } else {
            if (window.soundSystem) window.soundSystem.play('error');
        }
        
        this.updateStats();
        
        setTimeout(() => {
            this.currentQuestion++;
            this.showQuestion();
        }, 1500);
    }
    
    updateStats() {
        document.getElementById('quizScore').textContent = this.score;
        document.getElementById('quizProgress').textContent = `${this.currentQuestion}/${this.round.length}`;
    }
    
    endGame() {
        this.updateStats(); // show 11/11 instead of freezing at 10/11
        const percentage = Math.round((this.score / this.round.length) * 100);
        const isNewRecord = this.scoreManager.saveLocalHighScore(this.score);
        const personalBest = this.scoreManager.getLocalHighScore();
        
        // Submit to global leaderboard
        this.scoreManager.submitGlobalScore(this.score)
            .then(success => {
                if (success) {
                    console.log('✅ Score submitted to global leaderboard');
                }
            })
            .catch(err => {
                console.warn('⚠️ Failed to submit score:', err);
            });
        
        const content = document.getElementById('quizContent');
        
        content.innerHTML = `
            <div class="game-end">
                ${isNewRecord ? `
                    <div class="new-record-banner">
                        <i class="fas fa-trophy"></i>
                        <span>NEW PERSONAL RECORD!</span>
                        <i class="fas fa-star"></i>
                    </div>
                ` : ''}
                <div class="game-icon ${percentage >= 70 ? 'success' : ''}">
                    <i class="fas fa-${percentage >= 70 ? 'trophy' : 'medal'}"></i>
                </div>
                <h4>Quiz Complete!</h4>
                <div class="quiz-result">
                    <div class="result-circle">
                        <svg width="150" height="150">
                            <circle cx="75" cy="75" r="65" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="10"/>
                            <circle cx="75" cy="75" r="65" fill="none" stroke="var(--primary-color)" stroke-width="10"
                                stroke-dasharray="${2 * Math.PI * 65}" 
                                stroke-dashoffset="${2 * Math.PI * 65 * (1 - percentage/100)}"
                                transform="rotate(-90 75 75)"/>
                        </svg>
                        <div class="result-percentage">${percentage}%</div>
                    </div>
                </div>
                <div class="final-stats-grid">
                    <div class="stat-item">
                        <div class="stat-value">${this.score}</div>
                        <div class="stat-label">Correct</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${this.round.length - this.score}</div>
                        <div class="stat-label">Wrong</div>
                    </div>
                </div>
                <div class="score-rating">${this.getRating(percentage)}</div>
                ${personalBest > 0 && !isNewRecord ? `
                    <div class="highscore-info">
                        <i class="fas fa-medal"></i> Personal Best: ${personalBest} correct
                    </div>
                ` : ''}
                <div class="game-actions">
                    <button class="btn btn-secondary" onclick="window.currentScoreManager?.showLeaderboard()">
                        <i class="fas fa-trophy"></i>
                        <span>View Leaderboard</span>
                    </button>
                    <button class="btn btn-secondary" onclick="gameHub.games.quiz.start()">
                        <i class="fas fa-home"></i>
                        <span>Back to Home</span>
                    </button>
                    <button class="btn btn-primary" id="playAgain">
                        <span>Try Again</span>
                        <i class="fas fa-redo"></i>
                    </button>
                </div>
            </div>
        `;
        
        document.getElementById('playAgain').addEventListener('click', () => this.startGame());
    }
    
    getRating(percentage) {
        if (percentage === 100) return '🏆 Perfect Score!';
        if (percentage >= 80) return '⭐ Excellent!';
        if (percentage >= 60) return '👍 Good Job!';
        if (percentage >= 40) return '👌 Not Bad!';
        return '💪 Keep Learning!';
    }
    
    cleanup() {
        // Nothing to clean up
    }
}

// ===================================
// GAME 6: TERMINAL HACKER
// ===================================

class TerminalHacker {
    constructor(hub) {
        this.hub = hub;
        this.mode = null;          // 'tutorial' | 'hacker'
        this.task = null;          // active task from the banks
        this.currentPath = '/';
        this.commandsUsed = 0;     // scoring commands only (help/hint excluded)
        this.hintsUsed = 0;
        this.done = false;
        this.scoreManager = new HighScoreManager('terminalHacker');
    }

    get tutorials() { return window.TERMINAL_TUTORIALS || []; }
    get missions() { return window.TERMINAL_MISSIONS || []; }

    async start() {
        // Make scoreManager globally accessible for leaderboard button
        window.currentScoreManager = this.scoreManager;
        const highScoreHTML = await this.scoreManager.getStartScreenHTML();
        if (this.hub.currentGame !== this) return; // player left during the fetch

        this.hub.container.innerHTML = `
            <div class="terminal-game glass-effect">
                <div class="game-header">
                    <button class="btn-back" onclick="gameHub.backToMenu()">
                        <i class="fas fa-arrow-left"></i>
                    </button>
                    <h3><i class="fas fa-terminal"></i> Terminal Hacker</h3>
                    <div class="header-actions">
                        <button class="btn-player-name" id="btnSetName" title="Set your name">
                            <i class="fas fa-user-edit"></i>
                            <span id="playerNameDisplay">${this.scoreManager.getPlayerName() || 'Set Name'}</span>
                        </button>
                        <button class="game-close" onclick="gameHub.hide()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>

                <div class="game-content">
                    <div class="game-start-screen">
                        <div class="game-icon-large">
                            <i class="fas fa-terminal"></i>
                        </div>
                        <h4>Terminal Hacker</h4>
                        <p class="game-description">Learn the terminal, then hack like you mean it.</p>

                        ${highScoreHTML}

                        <div class="game-mode-selector">
                            <h5>Select Mode:</h5>
                            <div class="mode-buttons">
                                <button class="mode-btn" id="terminalTutorialBtn">
                                    <i class="fas fa-graduation-cap"></i>
                                    <span>Tutorial</span>
                                    <small>One random lesson · learn the commands · unscored</small>
                                </button>
                                <button class="mode-btn" id="terminalHackerBtn">
                                    <i class="fas fa-user-secret"></i>
                                    <span>Hacker Mission</span>
                                    <small>One random mission · fewer commands = higher score</small>
                                </button>
                            </div>
                        </div>

                        <div class="game-rules">
                            <div class="rule-item">
                                <i class="fas fa-check-circle"></i>
                                <span>Mission score starts at 100: beat it in par commands to keep it all</span>
                            </div>
                            <div class="rule-item">
                                <i class="fas fa-check-circle"></i>
                                <span>Every command over par costs 8 points, every hint costs 15</span>
                            </div>
                            <div class="rule-item">
                                <i class="fas fa-check-circle"></i>
                                <span>Smart tools (find, grep -r, absolute paths) are how you hit par</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('terminalTutorialBtn').addEventListener('click', () => this.startRound('tutorial'));
        document.getElementById('terminalHackerBtn').addEventListener('click', () => this.startRound('hacker'));
        document.getElementById('btnSetName').addEventListener('click', () => {
            const name = this.scoreManager.promptForName();
            document.getElementById('playerNameDisplay').textContent = name || 'Set Name';
        });
    }

    startRound(mode) {
        const bank = mode === 'tutorial' ? this.tutorials : this.missions;
        if (!bank.length) {
            alert('Task bank failed to load — refresh the page and try again.');
            return;
        }
        this.mode = mode;
        this.task = bank[Math.floor(Math.random() * bank.length)];
        this.currentPath = this.task.startPath || '/';
        this.commandsUsed = 0;
        this.hintsUsed = 0;
        this.done = false;
        this.renderTerminal();
    }

    renderTerminal() {
        const t = this.task;
        const isHacker = this.mode === 'hacker';
        this.hub.container.innerHTML = `
            <div class="terminal-game glass-effect">
                <div class="terminal-header">
                    <button class="back-btn" onclick="gameHub.games.terminal.start()">
                        <i class="fas fa-arrow-left"></i> Back
                    </button>
                    <h2><i class="fas fa-${isHacker ? 'user-secret' : 'graduation-cap'}"></i> ${t.title}</h2>
                    <div class="terminal-score">${isHacker
                        ? `Par: ${t.par} · Used: <span id="terminalUsed">0</span>`
                        : `Practice · Used: <span id="terminalUsed">0</span>`}</div>
                </div>

                <div class="terminal-objective">
                    <i class="fas fa-bullseye"></i> ${t.objective}
                    <button class="hint-btn" onclick="gameHub.games.terminal.giveHint()">
                        <i class="fas fa-lightbulb"></i> Hint${isHacker ? ' (-15)' : ''}
                    </button>
                    <div class="inline-hint" id="terminalHint"></div>
                </div>

                <div class="terminal-window">
                    <div class="terminal-output" id="terminalOutput">
                        <div class="terminal-line">Terminal Hacker v2.0 — ${isHacker ? 'MISSION MODE' : 'TUTORIAL MODE'}</div>
                        ${t.lesson ? `<div class="terminal-line">📘 ${t.lesson}</div>` : ''}
                        <div class="terminal-line">Type 'help' for your toolkit. help/hint are free${isHacker ? '; everything else counts' : ''}.</div>
                        <div class="terminal-line"></div>
                    </div>

                    <div class="terminal-input-line">
                        <span class="terminal-prompt" id="terminalPrompt">user@target:${this.currentPath}$</span>
                        <input type="text" class="terminal-input" id="terminalInput" autocomplete="off" spellcheck="false" autofocus>
                    </div>
                </div>

                <div class="terminal-commands">
                    <span>Toolkit:</span>
                    ${t.allowedCommands.filter(c => c !== 'help').map(c =>
                        `<button onclick="gameHub.games.terminal.prefill('${c}')">${c}</button>`).join('')}
                </div>
            </div>
        `;

        const input = document.getElementById('terminalInput');
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const command = input.value.trim();
                if (command) {
                    this.executeCommand(command);
                    input.value = '';
                }
            }
        });
        input.focus();
    }

    prefill(cmd) {
        const input = document.getElementById('terminalInput');
        if (!input) return;
        input.value = cmd + ' ';
        input.focus();
    }

    // ---- virtual filesystem helpers ----
    _resolve(arg) {
        if (!arg || arg === '/') return '/';
        let path = arg.startsWith('/') ? arg : (this.currentPath === '/' ? '/' + arg : this.currentPath + '/' + arg);
        const parts = [];
        for (const seg of path.split('/')) {
            if (!seg || seg === '.') continue;
            if (seg === '..') parts.pop();
            else parts.push(seg);
        }
        return '/' + parts.join('/');
    }

    _isDir(path) { return Object.prototype.hasOwnProperty.call(this.task.tree, path); }
    _isFile(path) { return Object.prototype.hasOwnProperty.call(this.task.contents, path); }

    _print(text, cls = '') {
        const output = document.getElementById('terminalOutput');
        if (!output) return;
        const line = document.createElement('div');
        line.className = `terminal-line ${cls}`;
        line.style.whiteSpace = 'pre-wrap';
        line.textContent = text;
        output.appendChild(line);
        output.scrollTop = output.scrollHeight;
    }

    executeCommand(command) {
        if (this.done) return;
        const t = this.task;
        const output = document.getElementById('terminalOutput');

        const commandLine = document.createElement('div');
        commandLine.className = 'terminal-line command';
        commandLine.innerHTML = `<span class="terminal-prompt">user@target:${this.currentPath}$</span> `;
        commandLine.appendChild(document.createTextNode(command));
        output.appendChild(commandLine);
        output.scrollTop = output.scrollHeight;

        const parts = command.split(/\s+/);
        const cmd = parts[0].toLowerCase();
        const args = parts.slice(1);

        if (cmd === 'help') {
            this._print(`Toolkit: ${t.allowedCommands.join(', ')}\nhelp and hint are free.`);
            return;
        }
        if (cmd === 'hint') {
            this.giveHint();
            return;
        }
        if (!t.allowedCommands.includes(cmd)) {
            this._print(`bash: ${cmd}: command not found (toolkit: ${t.allowedCommands.join(', ')})`);
            this.commandsUsed++; // typos and wrong tools cost moves too
            this._updateUsed();
            return;
        }

        this.commandsUsed++;
        this._updateUsed();

        switch (cmd) {
            case 'pwd':
                this._print(this.currentPath);
                break;

            case 'ls': {
                const showHidden = args.includes('-a');
                const target = args.find(a => !a.startsWith('-'));
                const dir = target ? this._resolve(target) : this.currentPath;
                if (!this._isDir(dir)) { this._print(`ls: ${target}: no such directory`); break; }
                const entries = this.task.tree[dir] || [];
                const visible = showHidden ? entries : entries.filter(f => !f.startsWith('.'));
                this._print(visible.length ? visible.join('  ') : '(empty)');
                break;
            }

            case 'cd': {
                const dest = args.length ? this._resolve(args[0]) : '/';
                if (this._isDir(dest)) {
                    this.currentPath = dest;
                    const promptEl = document.getElementById('terminalPrompt');
                    if (promptEl) promptEl.textContent = `user@target:${this.currentPath}$`;
                } else {
                    this._print(`cd: ${args[0] || '/'}: no such directory`);
                }
                break;
            }

            case 'cat': {
                if (!args.length) { this._print('cat: missing file operand'); break; }
                const file = this._resolve(args[0]);
                if (this._isFile(file)) {
                    this._print(this.task.contents[file]);
                    if (file === t.target) this._complete();
                } else if (this._isDir(file)) {
                    this._print(`cat: ${args[0]}: is a directory`);
                } else {
                    this._print(`cat: ${args[0]}: no such file`);
                }
                break;
            }

            case 'find': {
                const needle = args.find(a => !a.startsWith('-'));
                if (!needle) { this._print('usage: find <name>'); break; }
                const hits = [];
                for (const [dir, entries] of Object.entries(this.task.tree)) {
                    for (const entry of entries) {
                        if (entry.toLowerCase().includes(needle.toLowerCase())) {
                            hits.push(dir === '/' ? '/' + entry : `${dir}/${entry}`);
                        }
                    }
                }
                this._print(hits.length ? hits.join('\n') : `find: no matches for '${needle}'`);
                break;
            }

            case 'grep': {
                const recursive = args.includes('-r');
                const rest = args.filter(a => !a.startsWith('-'));
                const pattern = rest[0];
                if (!pattern) { this._print('usage: grep <pattern> <file>  |  grep -r <pattern>'); break; }
                if (recursive) {
                    const hits = [];
                    for (const [file, text] of Object.entries(this.task.contents)) {
                        text.split('\n').forEach(line => {
                            if (line.toLowerCase().includes(pattern.toLowerCase())) hits.push(`${file}: ${line.trim()}`);
                        });
                    }
                    this._print(hits.length ? hits.join('\n') : `grep: no matches for '${pattern}'`);
                } else {
                    if (!rest[1]) { this._print('usage: grep <pattern> <file>  |  grep -r <pattern>'); break; }
                    const file = this._resolve(rest[1]);
                    if (!this._isFile(file)) { this._print(`grep: ${rest[1]}: no such file`); break; }
                    const hits = this.task.contents[file].split('\n')
                        .filter(line => line.toLowerCase().includes(pattern.toLowerCase()));
                    this._print(hits.length ? hits.join('\n') : `grep: no matches in ${rest[1]}`);
                }
                break;
            }
        }
    }

    giveHint() {
        if (this.done) return;
        if (this.mode === 'hacker') this.hintsUsed++;
        const el = document.getElementById('terminalHint');
        if (el) el.textContent = `💡 ${this.task.hint}`;
    }

    _updateUsed() {
        const el = document.getElementById('terminalUsed');
        if (el) el.textContent = this.commandsUsed;
    }

    // Score = 100 − 8/extra command over par − 15/hint, floor 10 (finishing still pays).
    _calcScore() {
        const over = Math.max(0, this.commandsUsed - this.task.par);
        return Math.max(10, 100 - over * 8 - this.hintsUsed * 15);
    }

    _complete() {
        this.done = true;
        this._print('🎉 TARGET ACQUIRED — objective complete!');
        setTimeout(() => (this.mode === 'hacker' ? this._showMissionResult() : this._showTutorialResult()), 1200);
    }

    _showTutorialResult() {
        const t = this.task;
        this.hub.container.innerHTML = `
            <div class="game-over glass-effect">
                <h2><i class="fas fa-graduation-cap"></i> Lesson Complete!</h2>
                <div class="final-score">
                    <div class="score-value"><i class="fas fa-check-circle"></i></div>
                    <div class="score-label">${t.title}</div>
                    <div class="score-breakdown">
                        <div>Commands used: ${this.commandsUsed}</div>
                        <div>Pro solution (${t.par} commands): ${t.parSolution}</div>
                    </div>
                    <div>Tutorials are practice — no score, no pressure.</div>
                </div>
                <div class="game-actions">
                    <button class="btn btn-secondary" onclick="gameHub.games.terminal.startRound('tutorial')">
                        <i class="fas fa-book-open"></i>
                        <span>Another Lesson</span>
                    </button>
                    <button class="btn btn-primary" onclick="gameHub.games.terminal.startRound('hacker')">
                        <span>Try a Mission</span>
                        <i class="fas fa-user-secret"></i>
                    </button>
                    <button class="btn btn-secondary" onclick="gameHub.games.terminal.start()">
                        <i class="fas fa-home"></i>
                        <span>Back to Home</span>
                    </button>
                </div>
            </div>
        `;
    }

    _showMissionResult() {
        const t = this.task;
        const score = this._calcScore();
        const over = Math.max(0, this.commandsUsed - t.par);
        const isNewRecord = this.scoreManager.saveLocalHighScore(score);

        this.scoreManager.submitGlobalScore(score)
            .then(ok => { if (ok) console.log('✅ Score submitted to global leaderboard'); })
            .catch(err => console.warn('⚠️ Failed to submit score:', err));

        this.hub.container.innerHTML = `
            <div class="game-over glass-effect">
                ${isNewRecord ? `
                    <div class="new-record-banner">
                        <i class="fas fa-trophy"></i>
                        <span>NEW PERSONAL RECORD!</span>
                        <i class="fas fa-star"></i>
                    </div>
                ` : ''}
                <h2><i class="fas fa-user-secret"></i> Mission Complete!</h2>
                <div class="final-score">
                    <div class="score-value">${score}</div>
                    <div class="score-label">Efficiency Score</div>
                    <div class="score-breakdown">
                        <div>${t.title}</div>
                        <div>Commands: ${this.commandsUsed} (par ${t.par}) ${over ? `→ −${over * 8}` : '→ on par, no penalty!'}</div>
                        <div>Hints: ${this.hintsUsed} ${this.hintsUsed ? `→ −${this.hintsUsed * 15}` : '→ none, nice'}</div>
                        <div>Pro solution: ${t.parSolution}</div>
                    </div>
                    <div>${this.getHackerRank(score)}</div>
                </div>
                <div class="game-actions">
                    <button class="btn btn-secondary" onclick="window.currentScoreManager?.showLeaderboard()">
                        <i class="fas fa-trophy"></i>
                        <span>View Leaderboard</span>
                    </button>
                    <button class="btn btn-secondary" onclick="gameHub.games.terminal.start()">
                        <i class="fas fa-home"></i>
                        <span>Back to Home</span>
                    </button>
                    <button class="btn btn-primary play-again-btn" onclick="gameHub.games.terminal.startRound('hacker')">
                        <span>Next Mission</span>
                        <i class="fas fa-redo"></i>
                    </button>
                </div>
            </div>
        `;
    }

    getHackerRank(score) {
        if (score >= 95) return '🏆 Ghost in the Machine';
        if (score >= 80) return '⚡ Elite Operator';
        if (score >= 60) return '💻 Field Agent';
        return '👍 Script Kiddie — study the pro solution!';
    }

    cleanup() {
        this.done = true;
    }
}

// ===================================
// GAME 6b: SQL DETECTIVE
// ===================================

class SQLDetective {
    constructor(hub) {
        this.hub = hub;
        this.mode = null;        // 'tutorial' | 'case'
        this.task = null;
        this.queriesUsed = 0;
        this.hintsUsed = 0;
        this.wrongGuesses = 0;
        this.done = false;
        this.scoreManager = new HighScoreManager('sqlDetective');
    }

    get tutorials() { return window.SQL_TUTORIALS || []; }
    get cases() { return window.SQL_CASES || []; }

    _esc(s) {
        const d = document.createElement('div');
        d.textContent = String(s);
        return d.innerHTML;
    }

    async start() {
        window.currentScoreManager = this.scoreManager;
        const highScoreHTML = await this.scoreManager.getStartScreenHTML();
        if (this.hub.currentGame !== this) return; // player left during the fetch

        this.hub.container.innerHTML = `
            <div class="terminal-game glass-effect">
                <div class="game-header">
                    <button class="btn-back" onclick="gameHub.backToMenu()">
                        <i class="fas fa-arrow-left"></i>
                    </button>
                    <h3><i class="fas fa-database"></i> SQL Detective</h3>
                    <div class="header-actions">
                        <button class="btn-player-name" id="btnSetName" title="Set your name">
                            <i class="fas fa-user-edit"></i>
                            <span id="playerNameDisplay">${this.scoreManager.getPlayerName() || 'Set Name'}</span>
                        </button>
                        <button class="game-close" onclick="gameHub.hide()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>

                <div class="game-content">
                    <div class="game-start-screen">
                        <div class="game-icon-large">
                            <i class="fas fa-magnifying-glass"></i>
                        </div>
                        <h4>SQL Detective</h4>
                        <p class="game-description">Interrogate the database. Follow the leads. Name the culprit.</p>

                        ${highScoreHTML}

                        <div class="game-mode-selector">
                            <h5>Select Mode:</h5>
                            <div class="mode-buttons">
                                <button class="mode-btn" id="sqlTutorialBtn">
                                    <i class="fas fa-graduation-cap"></i>
                                    <span>SQL Academy</span>
                                    <small>One random lesson · learn SELECT step by step · unscored</small>
                                </button>
                                <button class="mode-btn" id="sqlCaseBtn">
                                    <i class="fas fa-user-secret"></i>
                                    <span>Case File</span>
                                    <small>One random mystery · fewer queries = higher score</small>
                                </button>
                            </div>
                        </div>

                        <div class="game-rules">
                            <div class="rule-item">
                                <i class="fas fa-check-circle"></i>
                                <span>Case score starts at 100: solve at par queries to keep it all</span>
                            </div>
                            <div class="rule-item">
                                <i class="fas fa-check-circle"></i>
                                <span>Every query over par −8 · hints −15 · wrong accusations −10</span>
                            </div>
                            <div class="rule-item">
                                <i class="fas fa-check-circle"></i>
                                <span>Sharp WHERE / LIKE filters are how you hit par</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('sqlTutorialBtn').addEventListener('click', () => this.startRound('tutorial'));
        document.getElementById('sqlCaseBtn').addEventListener('click', () => this.startRound('case'));
        document.getElementById('btnSetName').addEventListener('click', () => {
            const name = this.scoreManager.promptForName();
            document.getElementById('playerNameDisplay').textContent = name || 'Set Name';
        });
    }

    startRound(mode) {
        const bank = mode === 'tutorial' ? this.tutorials : this.cases;
        if (!bank.length) {
            alert('Case files failed to load — refresh the page and try again.');
            return;
        }
        this.mode = mode;
        this.task = bank[Math.floor(Math.random() * bank.length)];
        this.queriesUsed = 0;
        this.hintsUsed = 0;
        this.wrongGuesses = 0;
        this.done = false;
        this.renderGame();
    }

    renderGame() {
        const t = this.task;
        const isCase = this.mode === 'case';
        this.hub.container.innerHTML = `
            <div class="terminal-game glass-effect">
                <div class="terminal-header">
                    <button class="back-btn" onclick="gameHub.games.sqldetective.start()">
                        <i class="fas fa-arrow-left"></i> Back
                    </button>
                    <h2><i class="fas fa-${isCase ? 'user-secret' : 'graduation-cap'}"></i> ${this._esc(t.title)}</h2>
                    <div class="terminal-score">${isCase
                        ? `Par: ${t.par} · Queries: <span id="sqlUsed">0</span>`
                        : `Practice · Queries: <span id="sqlUsed">0</span>`}</div>
                </div>

                <div class="terminal-objective">
                    <i class="fas fa-${isCase ? 'file-lines' : 'bullseye'}"></i> ${this._esc(t.brief)}
                    <button class="hint-btn" onclick="gameHub.games.sqldetective.giveHint()">
                        <i class="fas fa-lightbulb"></i> Hint${isCase ? ' (-15)' : ''}
                    </button>
                    <div class="inline-hint" id="sqlHint"></div>
                </div>
                ${t.lesson ? `<div class="sql-lesson">📘 ${this._esc(t.lesson)}</div>` : ''}

                <div class="sql-layout">
                    <aside class="sql-side">
                        <h5><i class="fas fa-table"></i> Tables</h5>
                        <div class="sql-table-chips">
                            ${Object.keys(t.tables).map(name =>
                                `<button class="sql-table-chip" data-table="${this._esc(name)}">${this._esc(name)}</button>`).join('')}
                        </div>
                        <div class="sql-schema" id="sqlSchema">Click a table to inspect its columns.</div>
                    </aside>

                    <main class="sql-main">
                        <textarea id="sqlEditor" class="sql-editor" rows="3" spellcheck="false"
                            placeholder="SELECT * FROM ${Object.keys(t.tables)[0]} WHERE ..."></textarea>
                        <div class="sql-actions">
                            <button class="btn btn-primary" id="sqlRunBtn">
                                <i class="fas fa-play"></i> Run Query (Ctrl+Enter)
                            </button>
                        </div>
                        <div class="sql-results" id="sqlResults">Results appear here.</div>
                    </main>
                </div>

                <div class="sql-accuse">
                    <label for="sqlAnswer"><i class="fas fa-gavel"></i> ${this._esc(t.question)}</label>
                    <input type="text" id="sqlAnswer" autocomplete="off" spellcheck="false" placeholder="Your answer...">
                    <button class="btn btn-primary" id="sqlAccuseBtn">Solve${isCase ? ' (wrong: -10)' : ''}</button>
                    <span class="sql-accuse-msg" id="sqlAccuseMsg"></span>
                </div>
            </div>
        `;

        document.querySelectorAll('.sql-table-chip').forEach(chip => {
            chip.addEventListener('click', () => this.showSchema(chip.dataset.table));
        });
        document.getElementById('sqlRunBtn').addEventListener('click', () => this.runEditor());
        const editor = document.getElementById('sqlEditor');
        editor.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                this.runEditor();
            }
        });
        const answer = document.getElementById('sqlAnswer');
        answer.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.submitAnswer();
            }
        });
        document.getElementById('sqlAccuseBtn').addEventListener('click', () => this.submitAnswer());
        editor.focus();
    }

    showSchema(name) {
        const table = this.task.tables[name];
        const el = document.getElementById('sqlSchema');
        if (!table || !el) return;
        el.innerHTML = `
            <div class="sql-schema-name">${this._esc(name)}</div>
            ${table.columns.map(c => `<div class="sql-schema-col"><i class="fas fa-grip-lines-vertical"></i>${this._esc(c)}</div>`).join('')}
            <div class="sql-schema-rows">${table.rows.length} rows</div>
        `;
    }

    // ---- mini SQL engine: SELECT cols FROM t [WHERE ...] [ORDER BY c [DIR]] [LIMIT n]
    _query(sql) {
        const t = this.task;
        const q = sql.trim().replace(/;+\s*$/, '');
        const m = q.match(/^select\s+(.+?)\s+from\s+([a-z_]\w*)(?:\s+where\s+(.+?))?(?:\s+order\s+by\s+(\w+)(?:\s+(asc|desc))?)?(?:\s+limit\s+(\d+))?\s*$/i);
        if (!m) throw new Error("Couldn't parse that. Supported: SELECT cols FROM table [WHERE ...] [ORDER BY col [DESC]] [LIMIT n]");
        const [, colsRaw, tableRaw, whereRaw, orderCol, orderDir, limitRaw] = m;

        const tableName = Object.keys(t.tables).find(k => k.toLowerCase() === tableRaw.toLowerCase());
        if (!tableName) throw new Error(`Table '${tableRaw}' not found. Tables: ${Object.keys(t.tables).join(', ')}`);
        const table = t.tables[tableName];
        const colIdx = (name) => {
            const i = table.columns.findIndex(c => c.toLowerCase() === name.toLowerCase());
            if (i === -1) throw new Error(`Column '${name}' not in ${tableName} (has: ${table.columns.join(', ')})`);
            return i;
        };

        let rows = table.rows.slice();
        if (whereRaw) {
            const parts = whereRaw.split(/\s+(and|or)\s+/i); // curated data never contains ' and '/' or ' inside values
            const evalCond = (row, cond) => {
                const cm = cond.trim().match(/^(\w+)\s*(!=|<>|>=|<=|=|>|<|like)\s*(.+)$/i);
                if (!cm) throw new Error(`Bad condition: "${cond.trim()}" (use col = value, col > n, col LIKE '%x%')`);
                const [, col, opRaw, valRaw] = cm;
                const op = opRaw.toLowerCase();
                const cell = row[colIdx(col)];
                let val = valRaw.trim();
                if (/^'.*'$/.test(val)) val = val.slice(1, -1);
                else if (!isNaN(parseFloat(val)) && /^[\d.]+$/.test(val)) val = parseFloat(val);
                else throw new Error(`Text values need quotes: '${val}'`);
                if (op === 'like') {
                    const rx = new RegExp('^' + String(val).replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/%/g, '.*').replace(/_/g, '.') + '$', 'i');
                    return rx.test(String(cell));
                }
                const numeric = typeof cell === 'number' && typeof val === 'number';
                const a = numeric ? cell : String(cell).toLowerCase();
                const b = numeric ? val : String(val).toLowerCase();
                switch (op) {
                    case '=': return a === b;
                    case '!=': case '<>': return a !== b;
                    case '>': return a > b;
                    case '<': return a < b;
                    case '>=': return a >= b;
                    case '<=': return a <= b;
                }
            };
            rows = rows.filter(row => {
                let acc = evalCond(row, parts[0]);
                for (let i = 1; i < parts.length; i += 2) {
                    const rhs = evalCond(row, parts[i + 1]);
                    acc = parts[i].toLowerCase() === 'and' ? (acc && rhs) : (acc || rhs);
                }
                return acc;
            });
        }
        if (orderCol) {
            const oi = colIdx(orderCol);
            const dir = (orderDir || 'asc').toLowerCase() === 'desc' ? -1 : 1;
            rows.sort((r1, r2) => {
                const a = r1[oi], b = r2[oi];
                return (typeof a === 'number' && typeof b === 'number' ? a - b : String(a).localeCompare(String(b))) * dir;
            });
        }
        if (limitRaw) rows = rows.slice(0, parseInt(limitRaw, 10));

        let outIdx;
        if (colsRaw.trim() === '*') outIdx = table.columns.map((_, i) => i);
        else outIdx = colsRaw.split(',').map(s => colIdx(s.trim()));
        return { columns: outIdx.map(i => table.columns[i]), rows: rows.map(r => outIdx.map(i => r[i])) };
    }

    runEditor() {
        if (this.done) return;
        const editor = document.getElementById('sqlEditor');
        const sql = editor.value.trim();
        if (!sql) return;

        this.queriesUsed++; // every run counts — errors included, like real investigation time
        const usedEl = document.getElementById('sqlUsed');
        if (usedEl) usedEl.textContent = this.queriesUsed;

        const results = document.getElementById('sqlResults');
        try {
            const { columns, rows } = this._query(sql);
            if (!rows.length) {
                results.innerHTML = '<div class="sql-empty">0 rows — the lead went cold. Adjust your filters.</div>';
                return;
            }
            results.innerHTML = `
                <table class="sql-table">
                    <thead><tr>${columns.map(c => `<th>${this._esc(c)}</th>`).join('')}</tr></thead>
                    <tbody>${rows.map(r => `<tr>${r.map(v => `<td>${this._esc(v)}</td>`).join('')}</tr>`).join('')}</tbody>
                </table>
                <div class="sql-rowcount">${rows.length} row${rows.length === 1 ? '' : 's'}</div>
            `;
            if (window.soundSystem) window.soundSystem.play('click');
        } catch (err) {
            results.innerHTML = `<div class="sql-error"><i class="fas fa-triangle-exclamation"></i> ${this._esc(err.message)}</div>`;
            if (window.soundSystem) window.soundSystem.play('error');
        }
    }

    giveHint() {
        if (this.done) return;
        if (this.mode === 'case') this.hintsUsed++;
        const el = document.getElementById('sqlHint');
        if (el) el.innerHTML = `💡 ${this._esc(this.task.hint)}`;
    }

    submitAnswer() {
        if (this.done) return;
        const input = document.getElementById('sqlAnswer');
        const msg = document.getElementById('sqlAccuseMsg');
        const guess = (input.value || '').trim().toLowerCase();
        if (!guess) return;
        const correct = String(this.task.answer).trim().toLowerCase();

        if (guess === correct) {
            this.done = true;
            if (window.soundSystem) window.soundSystem.play('success');
            setTimeout(() => (this.mode === 'case' ? this._showCaseResult() : this._showTutorialResult()), 400);
        } else {
            if (this.mode === 'case') this.wrongGuesses++;
            msg.textContent = this.mode === 'case' ? 'Not them. −10 points.' : 'Not quite — run another query.';
            input.classList.add('shake');
            setTimeout(() => input.classList.remove('shake'), 500);
            if (window.soundSystem) window.soundSystem.play('error');
        }
    }

    // Score = 100 − 8/query over par − 15/hint − 10/wrong accusation, floor 10.
    _calcScore() {
        const over = Math.max(0, this.queriesUsed - this.task.par);
        return Math.max(10, 100 - over * 8 - this.hintsUsed * 15 - this.wrongGuesses * 10);
    }

    _proSolution() {
        return this.task.parQueries.join('  →  ');
    }

    _showTutorialResult() {
        const t = this.task;
        this.hub.container.innerHTML = `
            <div class="game-over glass-effect">
                <h2><i class="fas fa-graduation-cap"></i> Lesson Complete!</h2>
                <div class="final-score">
                    <div class="score-value"><i class="fas fa-check-circle"></i></div>
                    <div class="score-label">${this._esc(t.title)}</div>
                    <div class="score-breakdown">
                        <div>Queries used: ${this.queriesUsed}</div>
                        <div>Pro solution (${t.par}): ${this._esc(this._proSolution())}</div>
                    </div>
                    <div>Academy sessions are practice — no score, no pressure.</div>
                </div>
                <div class="game-actions">
                    <button class="btn btn-secondary" onclick="gameHub.games.sqldetective.startRound('tutorial')">
                        <i class="fas fa-book-open"></i>
                        <span>Another Lesson</span>
                    </button>
                    <button class="btn btn-primary" onclick="gameHub.games.sqldetective.startRound('case')">
                        <span>Take a Case</span>
                        <i class="fas fa-user-secret"></i>
                    </button>
                    <button class="btn btn-secondary" onclick="gameHub.games.sqldetective.start()">
                        <i class="fas fa-home"></i>
                        <span>Back to Home</span>
                    </button>
                </div>
            </div>
        `;
    }

    _showCaseResult() {
        const t = this.task;
        const score = this._calcScore();
        const over = Math.max(0, this.queriesUsed - t.par);
        const isNewRecord = this.scoreManager.saveLocalHighScore(score);

        this.scoreManager.submitGlobalScore(score)
            .then(ok => { if (ok) console.log('✅ Score submitted to global leaderboard'); })
            .catch(err => console.warn('⚠️ Failed to submit score:', err));

        this.hub.container.innerHTML = `
            <div class="game-over glass-effect">
                ${isNewRecord ? `
                    <div class="new-record-banner">
                        <i class="fas fa-trophy"></i>
                        <span>NEW PERSONAL RECORD!</span>
                        <i class="fas fa-star"></i>
                    </div>
                ` : ''}
                <h2><i class="fas fa-user-secret"></i> Case Closed!</h2>
                <div class="final-score">
                    <div class="score-value">${score}</div>
                    <div class="score-label">Detective Score</div>
                    <div class="score-breakdown">
                        <div>${this._esc(t.title)} — culprit: ${this._esc(t.answer)}</div>
                        <div>Queries: ${this.queriesUsed} (par ${t.par}) ${over ? `→ −${over * 8}` : '→ on par, no penalty!'}</div>
                        <div>Hints: ${this.hintsUsed} ${this.hintsUsed ? `→ −${this.hintsUsed * 15}` : '→ none, nice'}</div>
                        <div>Wrong accusations: ${this.wrongGuesses} ${this.wrongGuesses ? `→ −${this.wrongGuesses * 10}` : '→ none'}</div>
                        <div>Pro solution: ${this._esc(this._proSolution())}</div>
                    </div>
                    <div>${this.getDetectiveRank(score)}</div>
                </div>
                <div class="game-actions">
                    <button class="btn btn-secondary" onclick="window.currentScoreManager?.showLeaderboard()">
                        <i class="fas fa-trophy"></i>
                        <span>View Leaderboard</span>
                    </button>
                    <button class="btn btn-secondary" onclick="gameHub.games.sqldetective.start()">
                        <i class="fas fa-home"></i>
                        <span>Back to Home</span>
                    </button>
                    <button class="btn btn-primary play-again-btn" onclick="gameHub.games.sqldetective.startRound('case')">
                        <span>Next Case</span>
                        <i class="fas fa-redo"></i>
                    </button>
                </div>
            </div>
        `;
    }

    getDetectiveRank(score) {
        if (score >= 95) return '🏆 Sherlock of SQL';
        if (score >= 80) return '⚡ Chief Inspector';
        if (score >= 60) return '🔎 Field Detective';
        return '👍 Rookie — study the pro solution!';
    }

    cleanup() {
        this.done = true;
    }
}

// ===================================
// GAME 7: BINARY CONVERTER CHALLENGE
// ===================================

class BinaryConverter {
    constructor(hub) {
        this.hub = hub;
        this.score = 0;
        this.streak = 0;
        this.maxStreak = 0;
        this.timeLeft = 60;
        this.currentQuestion = null;
        this.timer = null;
        this.isPlaying = false;
        this.totalQuestions = 0;
        this.correctAnswers = 0;
        this.questionStartTime = null;
        this.modes = ['decimal', 'binary', 'hexadecimal'];
        this.scoreManager = new HighScoreManager('binaryConverter');
    }
    
    async start() {
        // Make scoreManager globally accessible for leaderboard button
        window.currentScoreManager = this.scoreManager;
        
        // Get high scores (async because it fetches from Firebase)
        const highScoreHTML = await this.scoreManager.getStartScreenHTML();
        if (this.hub.currentGame !== this) return; // player left during the fetch
        
        this.score = 0;
        this.streak = 0;
        this.maxStreak = 0;
        this.timeLeft = 60;
        this.totalQuestions = 0;
        this.correctAnswers = 0;
        this.questionStartTime = Date.now();
        this.isPlaying = false;
        
        // Store highScoreHTML for use in showGame
        this.highScoreHTML = highScoreHTML;
        
        this.showGame(); // clock starts on the Start click, not behind the start screen
    }
    
    showGame() {
        // Only show start screen with scoreboard if highScoreHTML is available (first time)
        if (this.highScoreHTML) {
            this.hub.container.innerHTML = `
                <div class="binary-game glass-effect">
                    <div class="game-header">
                        <button class="btn-back" onclick="gameHub.backToMenu()">
                            <i class="fas fa-arrow-left"></i>
                        </button>
                        <h3><i class="fas fa-microchip"></i> Binary Converter</h3>
                        <div class="header-actions">
                            <button class="btn-player-name" id="btnSetName" title="Set your name">
                                <i class="fas fa-user-edit"></i>
                                <span id="playerNameDisplay">${this.scoreManager.getPlayerName() || 'Set Name'}</span>
                            </button>
                            <button class="game-close" onclick="gameHub.hide()">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>
                    
                    <div class="game-content">
                        <div class="game-start-screen">
                            <div class="game-icon-large">
                                <i class="fas fa-microchip"></i>
                            </div>
                            <h4>Binary Converter Challenge</h4>
                            <p class="game-description">Speed challenge: convert numbers instantly</p>
                            
                            ${this.highScoreHTML}
                            
                            <button class="btn-game-start" id="startBinary">
                                <i class="fas fa-play"></i>
                                <span>Start Challenge</span>
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            document.getElementById('startBinary').addEventListener('click', () => {
                this.highScoreHTML = null; // Clear it so we don't show start screen again
                this.isPlaying = true;
                this.showGame();
                this.generateQuestion(); // Generate first question
                this.startTimer(); // Start timer
            });
            document.getElementById('btnSetName').addEventListener('click', () => {
                const name = this.scoreManager.promptForName();
                document.getElementById('playerNameDisplay').textContent = name || 'Set Name';
            });
            return;
        }
        
        this.hub.container.innerHTML = `
            <div class="binary-game glass-effect">
                <div class="game-header">
                    <button class="back-btn" onclick="gameHub.showMenu()">
                        <i class="fas fa-arrow-left"></i> Back
                    </button>
                    <h2><i class="fas fa-microchip"></i> Binary Converter</h2>
                    <div class="game-stats">
                        <span><i class="fas fa-clock"></i> <span id="binaryTime">60</span>s</span>
                        <span><i class="fas fa-fire"></i> <span id="binaryStreak">0</span>x</span>
                    </div>
                </div>
                
                <div class="binary-score">Score: <span id="binaryScore">0</span></div>
                
                <div class="binary-question-container">
                    <div class="binary-question" id="binaryQuestion">
                        Loading...
                    </div>
                    
                    <div class="binary-input-container">
                        <input type="text" id="binaryInput" class="binary-input" placeholder="Enter answer..." autocomplete="off" autofocus>
                        <button class="submit-btn" id="binarySubmit">
                            <i class="fas fa-check"></i> Submit
                        </button>
                    </div>
                    
                    <div class="binary-feedback" id="binaryFeedback"></div>
                </div>
                
                <div class="binary-reference">
                    <h4>Quick Reference:</h4>
                    <div class="reference-grid">
                        <div><strong>Decimal:</strong> 0-9</div>
                        <div><strong>Binary:</strong> 0-1</div>
                        <div><strong>Hex:</strong> 0-9, A-F</div>
                    </div>
                </div>
            </div>
        `;
        
        const input = document.getElementById('binaryInput');
        const submit = document.getElementById('binarySubmit');
        
        const handleSubmit = () => this.checkAnswer();
        
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleSubmit();
        });
        
        submit.addEventListener('click', handleSubmit);
    }
    
    generateQuestion() {
        const fromBase = this.modes[Math.floor(Math.random() * this.modes.length)];
        let toBase;
        do {
            toBase = this.modes[Math.floor(Math.random() * this.modes.length)];
        } while (toBase === fromBase);
        
        const number = Math.floor(Math.random() * 256); // 0-255
        
        let questionText;
        let correctAnswer;
        
        switch(fromBase) {
            case 'decimal':
                questionText = number;
                if (toBase === 'binary') {
                    correctAnswer = number.toString(2);
                } else {
                    correctAnswer = number.toString(16).toUpperCase();
                }
                break;
            case 'binary':
                questionText = number.toString(2);
                if (toBase === 'decimal') {
                    correctAnswer = number.toString(10);
                } else {
                    correctAnswer = number.toString(16).toUpperCase();
                }
                break;
            case 'hexadecimal':
                questionText = number.toString(16).toUpperCase();
                if (toBase === 'decimal') {
                    correctAnswer = number.toString(10);
                } else {
                    correctAnswer = number.toString(2);
                }
                break;
        }
        
        this.currentQuestion = {
            from: fromBase,
            to: toBase,
            question: questionText,
            answer: correctAnswer,
            number: number
        };
        
        const questionEl = document.getElementById('binaryQuestion');
        questionEl.innerHTML = `
            <div class="conversion-task">
                <div class="from-base">
                    <span class="base-label">${fromBase.toUpperCase()}</span>
                    <span class="number-display">${questionText}</span>
                </div>
                <i class="fas fa-arrow-right conversion-arrow"></i>
                <div class="to-base">
                    <span class="base-label">${toBase.toUpperCase()}</span>
                    <span class="number-display">?</span>
                </div>
            </div>
        `;
        
        document.getElementById('binaryInput').value = '';
        document.getElementById('binaryInput').focus();
        this.questionStartTime = Date.now();
    }
    
    checkAnswer() {
        if (!this.isPlaying) return;
        const input = document.getElementById('binaryInput');
        const userAnswer = input.value.trim().toUpperCase();
        const correctAnswer = this.currentQuestion.answer.toUpperCase();
        const feedback = document.getElementById('binaryFeedback');
        
        // Calculate time taken for this question
        const timeTaken = (Date.now() - this.questionStartTime) / 1000;
        
        this.totalQuestions++;
        
        if (userAnswer === correctAnswer) {
            this.correctAnswers++;
            this.streak++;
            this.maxStreak = Math.max(this.maxStreak, this.streak);
            
            // Base points: +10 per correct answer
            let points = 10;
            
            // Speed bonus: +5 if answered within 5 seconds
            if (timeTaken <= 5) {
                points += 5;
            }
            
            // Streak bonus: 3+ correct = +10, 5+ correct = +25
            if (this.streak >= 5) {
                points += 25;
            } else if (this.streak >= 3) {
                points += 10;
            }
            
            this.score += points;
            
            const bonusText = timeTaken <= 5 ? ' (Speed bonus!)' : this.streak >= 3 ? ' (Streak bonus!)' : '';
            feedback.innerHTML = `<div class="correct"><i class="fas fa-check-circle"></i> Correct! +${points} points${bonusText}</div>`;
            feedback.className = 'binary-feedback correct';
            
            if (window.soundSystem) window.soundSystem.play('success');
        } else {
            this.streak = 0;
            feedback.innerHTML = `<div class="incorrect"><i class="fas fa-times-circle"></i> Wrong! Answer: ${correctAnswer}</div>`;
            feedback.className = 'binary-feedback incorrect';
            
            if (window.soundSystem) window.soundSystem.play('error');
        }
        
        document.getElementById('binaryScore').textContent = this.score;
        document.getElementById('binaryStreak').textContent = this.streak;
        
        setTimeout(() => {
            if (!this.isPlaying) return; // round may have ended during the pause
            const fb = document.getElementById('binaryFeedback');
            if (fb) fb.innerHTML = '';
            this.generateQuestion();
        }, 1500);
    }
    
    startTimer() {
        clearInterval(this.timer); // never let two clocks run at once
        this.timer = setInterval(() => {
            this.timeLeft--;
            const el = document.getElementById('binaryTime');
            if (el) el.textContent = Math.max(0, this.timeLeft);
            
            if (this.timeLeft <= 0) {
                this.gameOver();
            }
        }, 1000);
    }
    
    gameOver() {
        if (!this.isPlaying) return; // a stray tick must not rebuild this screen
        this.isPlaying = false;
        clearInterval(this.timer);
        this.timer = null;
        const accuracy = this.totalQuestions > 0 ? Math.round((this.correctAnswers / this.totalQuestions) * 100) : 0;
        
        // Save local high score
        const isNewRecord = this.scoreManager.saveLocalHighScore(this.score);
        
        // Submit to global leaderboard
        this.scoreManager.submitGlobalScore(this.score)
            .then(success => {
                if (success) {
                    console.log('✅ Score submitted to global leaderboard');
                }
            })
            .catch(err => {
                console.warn('⚠️ Failed to submit score:', err);
            });
        
        this.hub.container.innerHTML = `
            <div class="game-over glass-effect">
                <h2><i class="fas fa-flag-checkered"></i> Time's Up!</h2>
                <div class="final-stats">
                    <div class="stat-item">
                        <i class="fas fa-trophy"></i>
                        <div>
                            <div class="stat-label">Final Score</div>
                            <div class="stat-value">${this.score}</div>
                        </div>
                    </div>
                    <div class="stat-item">
                        <i class="fas fa-check"></i>
                        <div>
                            <div class="stat-label">Accuracy</div>
                            <div class="stat-value">${accuracy}%</div>
                        </div>
                    </div>
                    <div class="stat-item">
                        <i class="fas fa-fire"></i>
                        <div>
                            <div class="stat-label">Best Streak</div>
                            <div class="stat-value">${this.maxStreak}x</div>
                        </div>
                    </div>
                </div>
                <div class="rating">${this.getRating(this.score)}</div>
                <div class="game-actions">
                    <button class="btn btn-secondary" onclick="window.currentScoreManager?.showLeaderboard()">
                        <i class="fas fa-trophy"></i>
                        <span>View Leaderboard</span>
                    </button>
                    <button class="btn btn-secondary" onclick="gameHub.games.binary.start()">
                        <i class="fas fa-home"></i>
                        <span>Back to Home</span>
                    </button>
                    <button class="btn btn-primary play-again-btn" onclick="gameHub.games.binary.start()">
                        <span>Play Again</span>
                        <i class="fas fa-redo"></i>
                    </button>
                </div>
            </div>
        `;
    }
    
    getRating(score) {
        if (score >= 500) return '🏆 Binary Master!';
        if (score >= 300) return '⚡ Quick Converter!';
        if (score >= 150) return '👍 Good Skills!';
        return '💪 Keep Practicing!';
    }
    
    cleanup() {
        if (this.timer) clearInterval(this.timer);
        this.timer = null;
        this.isPlaying = false;
    }
}

// ===================================
// GAME 8: CSS BATTLE
// ===================================

class CSSBattle {
    static ROUND_MARKS = [25, 35, 40]; // easy, medium, hard
    static W = 240;
    static H = 180;

    constructor(hub) {
        this.hub = hub;
        this.rounds = [];        // one random target per tier
        this.roundIndex = 0;
        this.marks = [];         // locked-in marks per round
        this.matches = [];       // locked-in match % per round
        this.pendingMarks = null;  // latest graded attempt (resubmit to improve)
        this.pendingMatch = null;
        this.codeLength = 0;
        this.scoreManager = new HighScoreManager('cssBattle');
    }

    get bank() { return window.CSS_TARGETS || []; }
    get totalScore() { return this.marks.reduce((a, b) => a + b, 0); }

    async start() {
        // Make scoreManager globally accessible for leaderboard button
        window.currentScoreManager = this.scoreManager;
        const highScoreHTML = await this.scoreManager.getStartScreenHTML();
        if (this.hub.currentGame !== this) return; // player left during the fetch

        this.hub.container.innerHTML = `
            <div class="css-battle-game glass-effect">
                <div class="game-header">
                    <button class="btn-back" onclick="gameHub.backToMenu()">
                        <i class="fas fa-arrow-left"></i>
                    </button>
                    <h3><i class="fas fa-palette"></i> CSS Battle</h3>
                    <div class="header-actions">
                        <button class="btn-player-name" id="btnSetName" title="Set your name">
                            <i class="fas fa-user-edit"></i>
                            <span id="playerNameDisplay">${this.scoreManager.getPlayerName() || 'Set Name'}</span>
                        </button>
                        <button class="game-close" onclick="gameHub.hide()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>

                <div class="game-content">
                    <div class="game-start-screen">
                        <div class="game-icon-large">
                            <i class="fas fa-palette"></i>
                        </div>
                        <h4>CSS Battle</h4>
                        <p class="game-description">Recreate 3 targets — easy, medium, hard — pixel by pixel.</p>

                        ${highScoreHTML}

                        <button class="btn-game-start" id="startCSSBattle">
                            <i class="fas fa-play"></i>
                            <span>Start Battle</span>
                        </button>
                        <div class="game-rules">
                            <div class="rule-item">
                                <i class="fas fa-check-circle"></i>
                                <span>3 random rounds worth 25 / 35 / 40 marks (100 total)</span>
                            </div>
                            <div class="rule-item">
                                <i class="fas fa-check-circle"></i>
                                <span>Marks = round marks × your pixel-match accuracy</span>
                            </div>
                            <div class="rule-item">
                                <i class="fas fa-check-circle"></i>
                                <span>Resubmit as often as you like — Next Round locks it in</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('startCSSBattle').addEventListener('click', () => this._beginGame());
        document.getElementById('btnSetName').addEventListener('click', () => {
            const name = this.scoreManager.promptForName();
            document.getElementById('playerNameDisplay').textContent = name || 'Set Name';
        });
    }

    _pickTier(tier) {
        const pool = this.bank.filter(t => t.tier === tier);
        return pool[Math.floor(Math.random() * pool.length)];
    }

    _beginGame() {
        if (this.bank.length < 3) {
            alert('Target bank failed to load — refresh the page and try again.');
            return;
        }
        this.rounds = [this._pickTier(1), this._pickTier(2), this._pickTier(3)];
        this.roundIndex = 0;
        this.marks = [];
        this.matches = [];
        this._renderRound();
    }

    _esc(s) {
        const d = document.createElement('div');
        d.textContent = String(s);
        return d.innerHTML;
    }

    _renderRound() {
        const t = this.rounds[this.roundIndex];
        const maxMarks = CSSBattle.ROUND_MARKS[this.roundIndex];
        this.pendingMarks = null;
        this.pendingMatch = null;
        this.codeLength = 0;

        this.hub.container.innerHTML = `
            <div class="css-battle-game glass-effect">
                <div class="game-header">
                    <button class="back-btn" onclick="gameHub.showMenu()">
                        <i class="fas fa-arrow-left"></i> Back
                    </button>
                    <h2><i class="fas fa-palette"></i> Round ${this.roundIndex + 1}/3 · ${this._esc(t.title)}</h2>
                    <div class="css-score">Worth: ${maxMarks} marks · Total: <span id="cssScore">${this.totalScore}</span>/100</div>
                </div>

                <div class="css-challenge">
                    <h3>${['🟢 Easy', '🟡 Medium', '🔴 Hard'][this.roundIndex]}</h3>
                    <p>${this._esc(t.brief)}</p>
                    <button class="hint-btn" onclick="gameHub.games.cssbattle.showHint()">
                        <i class="fas fa-lightbulb"></i> Hint
                    </button>
                    <div class="inline-hint" id="cssHint"></div>
                </div>

                <div class="css-workspace">
                    <div class="css-editor">
                        <h4>Your CSS (style the provided &lt;div class="box"&gt;):</h4>
                        <textarea id="cssCode" class="css-code-input" spellcheck="false" placeholder=".box {
    position: absolute;
    left: 80px; top: 50px;
    width: 80px; height: 80px;
    background: #e53935;
}"></textarea>
                        <div class="css-controls">
                            <span>Characters: <span id="cssLength">0</span></span>
                            <button class="update-btn" onclick="gameHub.games.cssbattle.updatePreview()">
                                <i class="fas fa-sync"></i> Preview
                            </button>
                            <button class="submit-btn" onclick="gameHub.games.cssbattle.submitSolution()">
                                <i class="fas fa-check"></i> Submit for Grading
                            </button>
                        </div>
                    </div>

                    <div class="css-previews">
                        <div class="preview-panel">
                            <h4>Target (240×180):</h4>
                            <div class="preview-box target-preview"><img class="css-stage" id="targetStage" alt="target"></div>
                        </div>
                        <div class="preview-panel">
                            <h4>Your Result:</h4>
                            <div class="preview-box your-preview"><img class="css-stage" id="yourStage" alt="your result"></div>
                        </div>
                    </div>
                </div>

                <div id="cssFeedback" class="css-feedback"></div>
            </div>
        `;

        this._renderStage(document.getElementById('targetStage'), t.html);
        this._renderStage(document.getElementById('yourStage'), '');

        const codeInput = document.getElementById('cssCode');
        codeInput.addEventListener('input', () => {
            this.codeLength = codeInput.value.length;
            document.getElementById('cssLength').textContent = this.codeLength;
        });
        codeInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                this.updatePreview();
            }
        });
        codeInput.focus();
    }

    // Both panes render through the same SVG rasterizer, so the preview IS the grader's view.
    _stageUrl(userCssOrHtml, isUserCss) {
        const inner = isUserCss
            ? `<style>${userCssOrHtml}</style><div class="box"></div>`
            : userCssOrHtml;
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${CSSBattle.W}" height="${CSSBattle.H}">` +
            `<foreignObject width="100%" height="100%">` +
            `<div xmlns="http://www.w3.org/1999/xhtml" style="width:${CSSBattle.W}px;height:${CSSBattle.H}px;background:#ffffff;position:relative;overflow:hidden;margin:0">${inner}</div>` +
            `</foreignObject></svg>`;
        return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    }

    _renderStage(imgEl, html) {
        if (imgEl) imgEl.src = this._stageUrl(html, false);
    }

    updatePreview() {
        const css = document.getElementById('cssCode').value;
        const img = document.getElementById('yourStage');
        if (img) img.src = this._stageUrl(css, true);
    }

    async _rasterize(url) {
        const img = new Image();
        await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = () => reject(new Error('render failed'));
            img.src = url;
        });
        const canvas = document.createElement('canvas');
        canvas.width = CSSBattle.W;
        canvas.height = CSSBattle.H;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, CSSBattle.W, CSSBattle.H);
        ctx.drawImage(img, 0, 0);
        return ctx.getImageData(0, 0, CSSBattle.W, CSSBattle.H).data;
    }

    // Ink-based compare: mismatches over the union of painted areas, normalized
    // by the target's painted area. Blank canvas = 0, perfect copy = 1.
    _gradePixels(t, u) {
        let targetInk = 0, mismatch = 0;
        for (let i = 0; i < t.length; i += 4) {
            const tInk = t[i] < 246 || t[i + 1] < 246 || t[i + 2] < 246;
            const uInk = u[i] < 246 || u[i + 1] < 246 || u[i + 2] < 246;
            if (tInk) targetInk++;
            if (tInk || uInk) {
                const diff = Math.abs(t[i] - u[i]) + Math.abs(t[i + 1] - u[i + 1]) + Math.abs(t[i + 2] - u[i + 2]);
                if (diff > 60) mismatch++;
            }
        }
        if (!targetInk) return 1;
        return Math.max(0, 1 - mismatch / targetInk);
    }

    async submitSolution() {
        const t = this.rounds[this.roundIndex];
        const maxMarks = CSSBattle.ROUND_MARKS[this.roundIndex];
        const feedback = document.getElementById('cssFeedback');
        const css = document.getElementById('cssCode').value;

        this.updatePreview(); // grade exactly what the player sees
        feedback.className = 'css-feedback hint';
        feedback.innerHTML = '<div class="hint"><i class="fas fa-spinner fa-spin"></i> Comparing pixels…</div>';

        try {
            const [targetData, userData] = await Promise.all([
                this._rasterize(this._stageUrl(t.html, false)),
                this._rasterize(this._stageUrl(css, true))
            ]);
            const match = this._gradePixels(targetData, userData);
            this.pendingMatch = Math.round(match * 1000) / 10; // one decimal
            this.pendingMarks = Math.round(maxMarks * match);

            const good = match >= 0.9;
            feedback.className = `css-feedback ${good ? 'success' : 'hint'}`;
            feedback.innerHTML = `
                <div class="${good ? 'success' : 'hint'}">
                    <i class="fas fa-${good ? 'check-circle' : 'crosshairs'}"></i>
                    Pixel match: <strong>${this.pendingMatch}%</strong> → <strong>${this.pendingMarks}/${maxMarks}</strong> marks
                    <div>Tweak and resubmit to improve, or lock it in.</div>
                    <button class="btn btn-primary" style="margin-top:0.6rem" onclick="gameHub.games.cssbattle.nextRound()">
                        ${this.roundIndex < 2 ? 'Lock In & Next Round' : 'Lock In & Finish'} <i class="fas fa-arrow-right"></i>
                    </button>
                </div>
            `;
            if (window.soundSystem) window.soundSystem.play(good ? 'success' : 'click');
        } catch (err) {
            feedback.className = 'css-feedback hint';
            feedback.innerHTML = `
                <div class="hint">
                    <i class="fas fa-triangle-exclamation"></i> Couldn't rasterize your CSS for grading (${this._esc(err.message)}).
                    Check the syntax and try again.
                </div>
            `;
        }
    }

    nextRound() {
        if (this.pendingMarks === null) return;
        this.marks.push(this.pendingMarks);
        this.matches.push(this.pendingMatch);
        if (this.roundIndex < 2) {
            this.roundIndex++;
            this._renderRound();
        } else {
            this.showVictory();
        }
    }

    showHint() {
        const t = this.rounds[this.roundIndex];
        const el = document.getElementById('cssHint');
        if (el) el.innerHTML = `<i class="fas fa-lightbulb"></i> ${this._esc(t.hint)}`;
    }

    showVictory() {
        const total = this.totalScore;
        const isNewRecord = this.scoreManager.saveLocalHighScore(total);

        this.scoreManager.submitGlobalScore(total)
            .then(success => {
                if (success) {
                    console.log('✅ Score submitted to global leaderboard');
                }
            })
            .catch(err => {
                console.warn('⚠️ Failed to submit score:', err);
            });

        this.hub.container.innerHTML = `
            <div class="game-over glass-effect">
                ${isNewRecord ? `
                    <div class="new-record-banner">
                        <i class="fas fa-trophy"></i>
                        <span>NEW PERSONAL RECORD!</span>
                        <i class="fas fa-star"></i>
                    </div>
                ` : ''}
                <h2><i class="fas fa-trophy"></i> Battle Complete!</h2>
                <div class="final-score">
                    <div class="score-value">${total}</div>
                    <div class="score-label">out of 100</div>
                    <div class="score-breakdown">
                        ${this.rounds.map((r, i) => `
                            <div>${['🟢', '🟡', '🔴'][i]} ${this._esc(r.title)}: ${this.matches[i]}% match → ${this.marks[i]}/${CSSBattle.ROUND_MARKS[i]}</div>
                        `).join('')}
                    </div>
                    <div>${this.getCSSRating(total)}</div>
                </div>
                <div class="game-actions">
                    <button class="btn btn-secondary" onclick="window.currentScoreManager?.showLeaderboard()">
                        <i class="fas fa-trophy"></i>
                        <span>View Leaderboard</span>
                    </button>
                    <button class="btn btn-secondary" onclick="gameHub.games.cssbattle.start()">
                        <i class="fas fa-home"></i>
                        <span>Back to Home</span>
                    </button>
                    <button class="btn btn-primary play-again-btn" onclick="gameHub.games.cssbattle._beginGame()">
                        <span>Play Again</span>
                        <i class="fas fa-redo"></i>
                    </button>
                </div>
            </div>
        `;
    }

    getCSSRating(score) {
        if (score >= 90) return '🏆 Pixel-Perfect Artist!';
        if (score >= 70) return '⚡ Layout Surgeon!';
        if (score >= 45) return '👍 Style Apprentice!';
        return '💪 Keep Painting!';
    }

    cleanup() {
        this.pendingMarks = null; // stale grades must not carry into a new session
    }
}

// ===================================
// GAME 9: REGEX GOLF
// ===================================

class RegexGolf {
    static TIER_LABELS = ['Warm-up', 'Easy', 'Medium', 'Hard', 'Expert'];

    constructor(hub) {
        this.hub = hub;
        this.score = 0;
        this.currentHole = 0;
        this.holeStartTime = null;
        this.highScoreHTML = null; // Store for start screen
        this.scoreManager = new HighScoreManager('regexGolf');
        this.holes = []; // dealt per game: one random puzzle per tier, 1..5

        // Puzzle pool — tier 1 (easiest) .. 5 (hardest), 4 per tier.
        // A game deals ONE random puzzle from each tier = always 5 holes.
        this.holePool = [
            // ---- Tier 1 ----
            { tier: 1, name: 'Digit Hunt', description: 'Match all lines containing at least one digit', matches: ['abc123', 'test5', '999', 'number1'], nonMatches: ['hello', 'world', 'code', 'tests'], hint: '\\d matches any digit', par: 2 },
            { tier: 1, name: 'Zed Alert', description: 'Match all lines containing the letter z', matches: ['zebra', 'buzz', 'zoo', 'lazy'], nonMatches: ['hello', 'world', 'cat', 'dog'], hint: 'A plain letter matches itself — the whole pattern can be one character', par: 1 },
            { tier: 1, name: 'Double O', description: 'Match all lines containing two o\u2019s in a row', matches: ['moon', 'book', 'floor', 'cool'], nonMatches: ['mon', 'bok', 'flor', 'clean'], hint: 'Literal characters in sequence: oo', par: 2 },
            { tier: 1, name: 'Gerund Spotter', description: 'Match all lines that END with ing', matches: ['coding', 'running', 'typing', 'sing'], nonMatches: ['ringer', 'code', 'run', 'tip'], hint: '$ anchors the match to the end of the line', par: 4 },
            // ---- Tier 2 ----
            { tier: 2, name: 'Capital Start', description: 'Match all lines starting with a CAPITAL letter', matches: ['Hello', 'World', 'Alpha', 'Zeta'], nonMatches: ['hello', 'world', 'alpha', 'zeta'], hint: '^ anchors to the start; [A-Z] is the capital range', par: 6 },
            { tier: 2, name: 'Three Exactly', description: 'Match all lines that are EXACTLY 3 characters long', matches: ['cat', 'dog', 'sun', 'map'], nonMatches: ['cats', 'at', 'sunny', 'a'], hint: 'Anchor both ends: ^ start, $ end, one . per character', par: 5 },
            { tier: 2, name: 'Vowel Pair', description: 'Match all lines containing two vowels in a row', matches: ['rain', 'boat', 'seed', 'loud'], nonMatches: ['rhythm', 'sky', 'dry', 'myth'], hint: '[aeiou] is a vowel class — repeat it with {2}', par: 10 },
            { tier: 2, name: 'Pure Numbers', description: 'Match all lines made of digits ONLY', matches: ['123', '9', '42', '2024'], nonMatches: ['12a', 'a1', 'code', '1.5'], hint: 'Anchor ^ and $ around \\d+ so nothing else sneaks in', par: 7 },
            // ---- Tier 3 ----
            { tier: 3, name: 'Email-ish', description: 'Match valid email-like strings', matches: ['test@email.com', 'user@domain.org', 'hello@site.net'], nonMatches: ['notanemail', '@test.com', 'test@', 'test.com'], hint: 'Require a word char on BOTH sides of the @', par: 5 },
            { tier: 3, name: 'Phone Pattern', description: 'Match phone numbers (XXX-XXX-XXXX format)', matches: ['123-456-7890', '999-888-7777', '555-123-4567'], nonMatches: ['1234567890', '123-45-6789', 'abc-def-ghij'], hint: '\\d{3} is three digits — the dashes are the giveaway', par: 9 },
            { tier: 3, name: 'Hex Colors', description: 'Match hex color codes (#RGB or #RRGGBB)', matches: ['#fff', '#000', '#a1b2c3', '#FF00FF'], nonMatches: ['fff', '#gg', '#12345', 'color'], hint: 'A hex digit is [\\da-fA-F]; group 3 of them and allow the group once or twice, anchored', par: 23 },
            { tier: 3, name: 'Clock Time', description: 'Match times containing digits around a colon (like 09:30)', matches: ['09:30', '23:59', '7:05', '12:00'], nonMatches: ['1230', ':30', '12:', 'ab:cd'], hint: 'A digit, a colon, a digit — in that exact order', par: 5 },
            // ---- Tier 4 ----
            { tier: 4, name: 'Twins', description: 'Match all lines with the SAME character twice in a row', matches: ['book', 'happy', 'jazz', 'coffee'], nonMatches: ['cat', 'dog', 'sun', 'ride'], hint: 'Capture (\\w) then demand it again with the backreference \\1', par: 6 },
            { tier: 4, name: 'Mini Palindrome', description: 'Match 3-letter palindromes (first letter = last letter)', matches: ['mom', 'dad', 'eye', 'pop'], nonMatches: ['cat', 'dog', 'sun', 'map'], hint: 'Anchored: capture the first char, any middle, then \\1', par: 8 },
            { tier: 4, name: 'Binary Purist', description: 'Match lines made ONLY of 0s and 1s', matches: ['1010', '0011', '111', '1000001'], nonMatches: ['102', 'abc', '10a2', '2001'], hint: 'The class [01] repeated, anchored both ends', par: 7 },
            { tier: 4, name: 'Bookends', description: 'Match words that START and END with the same letter', matches: ['level', 'stats', 'rotor', 'sees'], nonMatches: ['cat', 'dog', 'start', 'pine'], hint: 'Capture the first char, allow anything, end on \\1: anchors required', par: 9 },
            // ---- Tier 5 ----
            { tier: 5, name: 'ABC Everywhere', description: 'Match lines containing a, b AND c (any order)', matches: ['abc', 'cab', 'bca', 'xaybzc'], nonMatches: ['ab', 'bc', 'ac', 'xyz'], hint: 'Three lookaheads: (?=.*a)(?=.*b)(?=.*c)', par: 21 },
            { tier: 5, name: 'Letter-Digit Waltz', description: 'Match lines that strictly alternate letter-digit pairs (a1b2...)', matches: ['a1b2', 'x9y8', 'm3n4', 'p5'], nonMatches: ['a12b', '1a2b', 'ab12', 'abc'], hint: 'One pair is [a-z]\\d — repeat the GROUP with + and anchor it', par: 12 },
            { tier: 5, name: 'No E Allowed', description: 'Match all lines that do NOT contain the letter e', matches: ['sky', 'dry', 'gym', 'world'], nonMatches: ['hello', 'test', 'code', 'tree'], hint: '[^e] means "any char except e" — anchor a run of them', par: 8 },
            { tier: 5, name: 'Strong Password', description: 'Match lines containing a digit AND a capital letter', matches: ['Pass1', 'A1b2', 'Zip9', 'R2d2'], nonMatches: ['password', '1234', 'abcd', 'code'], hint: 'Two lookaheads: (?=.*\\d)(?=.*[A-Z])', par: 19 }
        ];
    }
    
    _dealHoles() {
        this.holes = [1, 2, 3, 4, 5].map(tier => {
            const pool = this.holePool.filter(h => h.tier === tier);
            return pool[Math.floor(Math.random() * pool.length)];
        });
    }
    
    async start() {
        // Make scoreManager globally accessible for leaderboard button
        window.currentScoreManager = this.scoreManager;
        
        // Get high scores (async because it fetches from Firebase)
        this.highScoreHTML = await this.scoreManager.getStartScreenHTML();
        if (this.hub.currentGame !== this) return; // player left during the fetch
        
        this.score = 0;
        this.currentHole = 0;
        this.holeStartTime = Date.now();
        this.showHole();
    }
    
    showHole() {
        // Only show start screen with scoreboard on first hole (hole 0)
        if (this.currentHole === 0 && this.highScoreHTML) {
            this.hub.container.innerHTML = `
                <div class="regex-game glass-effect">
                    <div class="game-header">
                        <button class="btn-back" onclick="gameHub.backToMenu()">
                            <i class="fas fa-arrow-left"></i>
                        </button>
                        <h3><i class="fas fa-code"></i> Regex Golf</h3>
                        <div class="header-actions">
                            <button class="btn-player-name" id="btnSetName" title="Set your name">
                                <i class="fas fa-user-edit"></i>
                                <span id="playerNameDisplay">${this.scoreManager.getPlayerName() || 'Set Name'}</span>
                            </button>
                            <button class="game-close" onclick="gameHub.hide()">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>
                    
                    <div class="game-content">
                        <div class="game-start-screen">
                            <div class="game-icon-large">
                                <i class="fas fa-code"></i>
                            </div>
                            <h4>Regex Golf Challenge</h4>
                            <p class="game-description">A 5-hole course, warm-up to expert — random holes every round.</p>
                            
                            ${this.highScoreHTML}
                            
                            <button class="btn-game-start" id="startRegex">
                                <i class="fas fa-play"></i>
                                <span>Start Challenge</span>
                            </button>
                            <div class="game-rules">
                                <div class="rule-item">
                                    <i class="fas fa-check-circle"></i>
                                    <span>5 holes per round, difficulty rises each hole</span>
                                </div>
                                <div class="rule-item">
                                    <i class="fas fa-check-circle"></i>
                                    <span>Per hole: +100 correct, up to +100 for brevity, up to +50 for speed</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            document.getElementById('startRegex').addEventListener('click', () => {
                this.highScoreHTML = null; // Clear it so we don't show start screen again
                this._dealHoles();
                this.showHole();
            });
            document.getElementById('btnSetName').addEventListener('click', () => {
                const name = this.scoreManager.promptForName();
                document.getElementById('playerNameDisplay').textContent = name || 'Set Name';
            });
            return;
        }
        
        const hole = this.holes[this.currentHole];
        this.holeStartTime = Date.now();
        
        this.hub.container.innerHTML = `
            <div class="regex-game glass-effect">
                <div class="game-header">
                    <button class="back-btn" onclick="gameHub.showMenu()">
                        <i class="fas fa-arrow-left"></i> Back
                    </button>
                    <h2><i class="fas fa-code"></i> Hole ${this.currentHole + 1} of 5 · ${hole.name}</h2>
                    <div class="regex-score">Score: <span id="regexScore">${this.score}</span></div>
                </div>
                
                <div class="regex-challenge">
                    <p><span class="regex-tier">${RegexGolf.TIER_LABELS[this.currentHole]}</span> ${hole.description}</p>
                    <div class="regex-par">Par: ${hole.par} characters</div>
                    <button class="hint-btn" onclick="gameHub.games.regex.showHint()">
                        <i class="fas fa-lightbulb"></i> Hint
                    </button>
                    <div class="inline-hint" id="regexHint"></div>
                </div>
                
                <div class="regex-test-strings">
                    <div class="test-column">
                        <h4>✓ Must Match:</h4>
                        <div class="test-list" id="mustMatch">
                            ${hole.matches.map(str => `<div class="test-string">${str}</div>`).join('')}
                        </div>
                    </div>
                    <div class="test-column">
                        <h4>✗ Must NOT Match:</h4>
                        <div class="test-list" id="mustNotMatch">
                            ${hole.nonMatches.map(str => `<div class="test-string">${str}</div>`).join('')}
                        </div>
                    </div>
                </div>
                
                <div class="regex-input-area">
                    <div class="regex-input-wrapper">
                        <span class="regex-slash">/</span>
                        <input type="text" id="regexInput" class="regex-input" placeholder="Enter your regex..." autocomplete="off" autofocus>
                        <span class="regex-slash">/g</span>
                    </div>
                    <div class="regex-stats">
                        <span>Length: <span id="regexLength">0</span></span>
                        <span>Par: ${hole.par}</span>
                    </div>
                    <button class="test-regex-btn" onclick="gameHub.games.regex.testRegex()">
                        <i class="fas fa-play"></i> Test Pattern
                    </button>
                    <button class="submit-btn" onclick="gameHub.games.regex.submitSolution()">
                        <i class="fas fa-check"></i> Submit
                    </button>
                </div>
                
                <div id="regexFeedback" class="regex-feedback"></div>
                
                <div class="regex-quick-ref">
                    <h4>Quick Reference:</h4>
                    <div class="ref-grid">
                        <code>\\d</code> = digit
                        <code>\\w</code> = word char
                        <code>\\s</code> = whitespace
                        <code>.</code> = any char
                        <code>*</code> = 0+ times
                        <code>+</code> = 1+ times
                        <code>?</code> = 0 or 1
                        <code>[abc]</code> = a/b/c
                        <code>^</code> = start
                        <code>$</code> = end
                        <code>{n}</code> = exactly n
                        <code>(x|y)</code> = x or y
                    </div>
                </div>
            </div>
        `;
        
        const input = document.getElementById('regexInput');
        input.addEventListener('input', () => {
            document.getElementById('regexLength').textContent = input.value.length;
        });
    }
    
    testRegex() {
        const pattern = document.getElementById('regexInput').value;
        const hole = this.holes[this.currentHole];
        const feedback = document.getElementById('regexFeedback');
        
        if (!pattern) {
            feedback.innerHTML = '<div class="warning">Please enter a regex pattern</div>';
            feedback.className = 'regex-feedback warning';
            return;
        }
        
        try {
            const regex = new RegExp(pattern, 'g');
            
            // Test matches
            const mustMatchElements = document.querySelectorAll('#mustMatch .test-string');
            const mustNotMatchElements = document.querySelectorAll('#mustNotMatch .test-string');
            
            let allCorrect = true;
            
            mustMatchElements.forEach((el, i) => {
                const str = hole.matches[i];
                const matches = str.match(regex);
                if (matches) {
                    el.classList.add('match-success');
                    el.classList.remove('match-fail');
                } else {
                    el.classList.add('match-fail');
                    el.classList.remove('match-success');
                    allCorrect = false;
                }
            });
            
            mustNotMatchElements.forEach((el, i) => {
                const str = hole.nonMatches[i];
                const matches = str.match(regex);
                if (!matches) {
                    el.classList.add('match-success');
                    el.classList.remove('match-fail');
                } else {
                    el.classList.add('match-fail');
                    el.classList.remove('match-success');
                    allCorrect = false;
                }
            });
            
            if (allCorrect) {
                feedback.innerHTML = '<div class="success">✓ All tests passed! Click Submit when ready.</div>';
                feedback.className = 'regex-feedback success';
            } else {
                feedback.innerHTML = '<div class="error">✗ Some tests failed. Check highlighted strings.</div>';
                feedback.className = 'regex-feedback error';
            }
        } catch (error) {
            feedback.className = 'regex-feedback error';
            feedback.innerHTML = '<div class="error"></div>';
            feedback.firstElementChild.textContent = `Invalid regex: ${error.message}`; // message echoes the user's pattern
        }
    }
    
    submitSolution() {
        const pattern = document.getElementById('regexInput').value;
        const hole = this.holes[this.currentHole];
        const feedback = document.getElementById('regexFeedback');
        
        if (!pattern) {
            feedback.innerHTML = '<div class="warning">Please enter a regex pattern</div>';
            feedback.className = 'regex-feedback warning';
            return;
        }
        
        try {
            const regex = new RegExp(pattern, 'g');
            
            // Verify all matches
            const allMatch = hole.matches.every(str => str.match(regex));
            const noneMatch = hole.nonMatches.every(str => !str.match(regex));
            
            if (allMatch && noneMatch) {
                // Calculate score
                const regexLength = pattern.length;
                const par = hole.par;
                
                // Pattern correctness: +100 for matching all correctly
                const correctnessPoints = 100;
                
                // Regex brevity: shorter is better (100 - length, capped at 100)
                const brevityPoints = Math.max(0, Math.min(100, 100 - regexLength));
                
                // Time bonus: faster completion = more points (max 50 for < 10 seconds)
                const timeElapsed = (Date.now() - this.holeStartTime) / 1000;
                const timeBonus = Math.max(0, Math.floor(Math.min(50, (10 - timeElapsed) * 5)));
                
                const points = correctnessPoints + brevityPoints + timeBonus;
                
                this.score += points;
                document.getElementById('regexScore').textContent = this.score;
                
                const performance = regexLength <= par ? 'Under Par! 🏆' : regexLength === par ? 'Par! 👍' : 'Over Par';
                
                feedback.innerHTML = `
                    <div class="success">
                        <i class="fas fa-check-circle"></i> 
                        Hole Complete! +${points} points<br>
                        ${performance} (${regexLength}/${par} chars) | Time: ${timeElapsed.toFixed(1)}s<br>
                        Correctness: +${correctnessPoints} | Brevity: +${brevityPoints} | Speed: +${timeBonus}
                    </div>
                `;
                feedback.className = 'regex-feedback success';
                
                if (window.soundSystem) window.soundSystem.play('success');
                
                setTimeout(() => {
                    if (this.currentHole < this.holes.length - 1) {
                        this.currentHole++;
                        this.showHole();
                    } else {
                        this.showVictory();
                    }
                }, 2000);
            } else {
                feedback.innerHTML = '<div class="error">✗ Solution does not match all test cases. Click Test Pattern first.</div>';
                feedback.className = 'regex-feedback error';
                if (window.soundSystem) window.soundSystem.play('error');
            }
        } catch (error) {
            feedback.className = 'regex-feedback error';
            feedback.innerHTML = '<div class="error"></div>';
            feedback.firstElementChild.textContent = `Invalid regex: ${error.message}`; // message echoes the user's pattern
        }
    }
    
    showHint() {
        const hole = this.holes[this.currentHole];
        const el = document.getElementById('regexHint');
        if (el) el.innerHTML = `<i class="fas fa-lightbulb"></i> ${hole.hint}`;
    }
    
    showVictory() {
        // Save local high score
        const isNewRecord = this.scoreManager.saveLocalHighScore(this.score);
        
        // Submit to global leaderboard
        this.scoreManager.submitGlobalScore(this.score)
            .then(success => {
                if (success) {
                    console.log('✅ Score submitted to global leaderboard');
                }
            })
            .catch(err => {
                console.warn('⚠️ Failed to submit score:', err);
            });
        
        this.hub.container.innerHTML = `
            <div class="game-over glass-effect">
                <h2><i class="fas fa-trophy"></i> All 5 Holes Complete!</h2>
                <div class="final-score">
                    <div>Total Score: ${this.score}</div>
                    <div>${this.getRegexRating(this.score)}</div>
                </div>
                <div class="game-actions">
                    <button class="btn btn-secondary" onclick="window.currentScoreManager?.showLeaderboard()">
                        <i class="fas fa-trophy"></i>
                        <span>View Leaderboard</span>
                    </button>
                    <button class="btn btn-secondary" onclick="gameHub.games.regex.start()">
                        <i class="fas fa-home"></i>
                        <span>Back to Home</span>
                    </button>
                    <button class="btn btn-primary play-again-btn" onclick="gameHub.games.regex.start()">
                        <span>Play Again</span>
                        <i class="fas fa-redo"></i>
                    </button>
                </div>
            </div>
        `;
    }
    
    getRegexRating(score) {
        if (score >= 500) return '🏆 Regex Master - Code Golf Pro!';
        if (score >= 400) return '⚡ Regex Expert!';
        if (score >= 300) return '👍 Pattern Matcher!';
        return '💪 Keep Practicing Regex!';
    }
    
    cleanup() {
        // Cleanup if needed
    }
}

// ===================================
// GAME 10: MINESWEEPER
// ===================================

class Minesweeper {
    constructor(hub) {
        this.hub = hub;
        this.grid = [];
        this.gridSize = 10;
        this.mineCount = 15;
        this.revealedCount = 0;
        this.flaggedCount = 0;
        this.clickCount = 0;
        this.difficulty = 'medium'; // easy, medium, hard
        this.gameState = 'playing'; // playing, won, lost
        this.startTime = null;
        this.timer = null;
        this.highScoreHTML = null; // Store for start screen
        this.scoreManager = new HighScoreManager('minesweeper');
    }
    
    async start() {
        // Make scoreManager globally accessible for leaderboard button
        window.currentScoreManager = this.scoreManager;
        
        // Get high scores (async because it fetches from Firebase)
        this.highScoreHTML = await this.scoreManager.getStartScreenHTML();
        if (this.hub.currentGame !== this) return; // player left during the fetch
        
        this.grid = [];
        this.revealedCount = 0;
        this.flaggedCount = 0;
        this.clickCount = 0;
        this.difficulty = 'medium';
        this.gameState = 'playing';
        this.startTime = Date.now();
        this.showGame();
        this.initializeGrid();
        this.startTimer();
    }
    
    showGame() {
        // Only show start screen with scoreboard if highScoreHTML is available (first time)
        if (this.highScoreHTML) {
            this.hub.container.innerHTML = `
                <div class="minesweeper-game glass-effect">
                    <div class="game-header">
                        <button class="btn-back" onclick="gameHub.backToMenu()">
                            <i class="fas fa-arrow-left"></i>
                        </button>
                        <h3><i class="fas fa-bomb"></i> Minesweeper</h3>
                        <div class="header-actions">
                            <button class="btn-player-name" id="btnSetName" title="Set your name">
                                <i class="fas fa-user-edit"></i>
                                <span id="playerNameDisplay">${this.scoreManager.getPlayerName() || 'Set Name'}</span>
                            </button>
                            <button class="game-close" onclick="gameHub.hide()">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>
                    
                    <div class="game-content">
                        <div class="game-start-screen">
                            <div class="game-icon-large">
                                <i class="fas fa-bomb"></i>
                            </div>
                            <h4>Minesweeper Challenge</h4>
                            <p class="game-description">Classic game with bitwise operations</p>
                            
                            ${this.highScoreHTML}
                            
                            <button class="btn-game-start" id="startMinesweeper">
                                <i class="fas fa-play"></i>
                                <span>Start Game</span>
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            document.getElementById('startMinesweeper').addEventListener('click', () => {
                this.highScoreHTML = null; // Clear it so we don't show start screen again
                this.showGame();
                this.initializeGrid(); // Initialize the grid
                this.startTimer(); // Start timer
            });
            document.getElementById('btnSetName').addEventListener('click', () => {
                const name = this.scoreManager.promptForName();
                document.getElementById('playerNameDisplay').textContent = name || 'Set Name';
            });
            return;
        }
        
        this.hub.container.innerHTML = `
            <div class="minesweeper-game glass-effect">
                <div class="game-header">
                    <button class="back-btn" onclick="gameHub.showMenu()">
                        <i class="fas fa-arrow-left"></i> Back
                    </button>
                    <h2><i class="fas fa-bomb"></i> Minesweeper</h2>
                </div>
                
                <div class="minesweeper-stats">
                    <div class="stat-box">
                        <i class="fas fa-bomb"></i>
                        <span id="mineCount">${this.mineCount}</span>
                    </div>
                    <div class="stat-box">
                        <i class="fas fa-flag"></i>
                        <span id="flagCount">0</span>
                    </div>
                    <div class="stat-box">
                        <i class="fas fa-clock"></i>
                        <span id="timeCount">0</span>s
                    </div>
                </div>
                
                <div class="minesweeper-info">
                    <p><strong>Left Click:</strong> Reveal cell | <strong>Right Click:</strong> Flag/Unflag</p>
                    <p><strong>Bitwise Mode:</strong> Cells use binary flags (revealed=0x01, flagged=0x02, mine=0x04)</p>
                </div>
                
                <div class="minesweeper-grid" id="mineGrid"></div>
                
                <div class="minesweeper-controls">
                    <button class="new-game-btn" onclick="gameHub.games.minesweeper.start()">
                        <i class="fas fa-redo"></i> New Game
                    </button>
                </div>
            </div>
        `;
    }
    
    initializeGrid() {
        // Create cells
        for (let y = 0; y < this.gridSize; y++) {
            this.grid[y] = [];
            for (let x = 0; x < this.gridSize; x++) {
                this.grid[y][x] = {
                    isMine: false,
                    isRevealed: false,
                    isFlagged: false,
                    neighborMines: 0,
                    bitwise: 0 // 0x01=revealed, 0x02=flagged, 0x04=mine
                };
            }
        }
        
        // Place mines randomly
        let minesPlaced = 0;
        while (minesPlaced < this.mineCount) {
            const x = Math.floor(Math.random() * this.gridSize);
            const y = Math.floor(Math.random() * this.gridSize);
            
            if (!this.grid[y][x].isMine) {
                this.grid[y][x].isMine = true;
                this.grid[y][x].bitwise |= 0x04; // Set mine bit
                minesPlaced++;
            }
        }
        
        // Calculate neighbor counts
        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
                if (!this.grid[y][x].isMine) {
                    this.grid[y][x].neighborMines = this.countNeighborMines(x, y);
                }
            }
        }
        
        this.renderGrid();
    }
    
    countNeighborMines(x, y) {
        let count = 0;
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                if (dx === 0 && dy === 0) continue;
                const nx = x + dx;
                const ny = y + dy;
                if (nx >= 0 && nx < this.gridSize && ny >= 0 && ny < this.gridSize) {
                    if (this.grid[ny][nx].isMine) count++;
                }
            }
        }
        return count;
    }
    
    renderGrid() {
        const gridEl = document.getElementById('mineGrid');
        if (!gridEl) return; // start screen is showing — grid renders after Start
        gridEl.style.gridTemplateColumns = `repeat(${this.gridSize}, 40px)`;
        gridEl.innerHTML = '';
        
        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
                const cell = document.createElement('div');
                cell.className = 'mine-cell';
                cell.dataset.x = x;
                cell.dataset.y = y;
                
                const cellData = this.grid[y][x];
                
                if (cellData.isRevealed) {
                    cell.classList.add('revealed');
                    if (cellData.isMine) {
                        cell.innerHTML = '<i class="fas fa-bomb"></i>';
                        cell.classList.add('mine');
                    } else if (cellData.neighborMines > 0) {
                        cell.textContent = cellData.neighborMines;
                        cell.classList.add(`number-${cellData.neighborMines}`);
                    }
                } else if (cellData.isFlagged) {
                    cell.innerHTML = '<i class="fas fa-flag"></i>';
                    cell.classList.add('flagged');
                }
                
                cell.addEventListener('click', () => this.revealCell(x, y));
                cell.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    this.toggleFlag(x, y);
                });
                
                gridEl.appendChild(cell);
            }
        }
    }
    
    revealCell(x, y) {
        if (this.gameState !== 'playing') return;
        
        const cell = this.grid[y][x];
        if (cell.isRevealed || cell.isFlagged) return;
        
        this.clickCount++; // Track clicks for efficiency scoring
        
        cell.isRevealed = true;
        cell.bitwise |= 0x01; // Set revealed bit
        this.revealedCount++;
        
        if (cell.isMine) {
            this.gameOver(false);
            return;
        }
        
        // If no neighbor mines, reveal neighbors recursively
        if (cell.neighborMines === 0) {
            for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                    if (dx === 0 && dy === 0) continue;
                    const nx = x + dx;
                    const ny = y + dy;
                    if (nx >= 0 && nx < this.gridSize && ny >= 0 && ny < this.gridSize) {
                        this.revealCell(nx, ny);
                    }
                }
            }
        }
        
        this.renderGrid();
        this.checkWin();
    }
    
    toggleFlag(x, y) {
        if (this.gameState !== 'playing') return;
        
        const cell = this.grid[y][x];
        if (cell.isRevealed) return;
        
        cell.isFlagged = !cell.isFlagged;
        if (cell.isFlagged) {
            cell.bitwise |= 0x02; // Set flagged bit
            this.flaggedCount++;
        } else {
            cell.bitwise &= ~0x02; // Clear flagged bit (bitwise NOT and AND)
            this.flaggedCount--;
        }
        
        document.getElementById('flagCount').textContent = this.flaggedCount;
        this.renderGrid();
    }
    
    checkWin() {
        const totalCells = this.gridSize * this.gridSize;
        const safeCells = totalCells - this.mineCount;
        
        if (this.revealedCount === safeCells) {
            this.gameOver(true);
        }
    }
    
    gameOver(won) {
        this.gameState = won ? 'won' : 'lost';
        clearInterval(this.timer);
        
        // Reveal all mines
        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
                if (this.grid[y][x].isMine) {
                    this.grid[y][x].isRevealed = true;
                }
            }
        }
        
        this.renderGrid();
        
        const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
        
        // Calculate score (only if won)
        let calculatedScore = 0;
        if (won) {
            // Base score for winning
            const baseScore = 100;
            
            // Time bonus: (300 - seconds) points, max 300, min 0
            const timeBonus = Math.max(0, Math.min(300, 300 - elapsed));
            
            // Difficulty multiplier: medium = 1.5x (could be easy=1x, hard=2x in future)
            const difficultyMultiplier = this.difficulty === 'hard' ? 2.0 : this.difficulty === 'easy' ? 1.0 : 1.5;
            
            // Efficiency bonus: fewer clicks = better (maxCells - clicks) × 2
            const maxCells = this.gridSize * this.gridSize;
            const efficiencyBonus = Math.max(0, (maxCells - this.clickCount) * 2);
            
            // Calculate final score
            calculatedScore = Math.floor((baseScore + timeBonus + efficiencyBonus) * difficultyMultiplier);
            
            // Save local high score
            const isNewRecord = this.scoreManager.saveLocalHighScore(calculatedScore);
            
            // Submit to global leaderboard
            this.scoreManager.submitGlobalScore(calculatedScore)
                .then(success => {
                    if (success) {
                        console.log('✅ Score submitted to global leaderboard');
                    }
                })
                .catch(err => {
                    console.warn('⚠️ Failed to submit score:', err);
                });
        }
        
        setTimeout(() => {
            this.hub.container.innerHTML = `
                <div class="game-over glass-effect">
                    <h2><i class="fas fa-${won ? 'trophy' : 'bomb'}"></i> ${won ? 'Victory!' : 'Game Over'}</h2>
                    <div class="final-stats">
                        ${won ? `<div class="stat-item">
                            <i class="fas fa-trophy"></i>
                            <div>
                                <div class="stat-label">Final Score</div>
                                <div class="stat-value">${calculatedScore}</div>
                            </div>
                        </div>` : ''}
                        <div class="stat-item">
                            <i class="fas fa-clock"></i>
                            <div>
                                <div class="stat-label">Time</div>
                                <div class="stat-value">${elapsed}s</div>
                            </div>
                        </div>
                        <div class="stat-item">
                            <i class="fas fa-mouse-pointer"></i>
                            <div>
                                <div class="stat-label">Clicks</div>
                                <div class="stat-value">${this.clickCount}</div>
                            </div>
                        </div>
                        <div class="stat-item">
                            <i class="fas fa-flag"></i>
                            <div>
                                <div class="stat-label">Flags Used</div>
                                <div class="stat-value">${this.flaggedCount}</div>
                            </div>
                        </div>
                    </div>
                    <div class="rating">${won ? '🏆 Mine Defused!' : '💣 Try Again!'}</div>
                    <div class="game-actions">
                        <button class="btn btn-secondary" onclick="window.currentScoreManager?.showLeaderboard()">
                            <i class="fas fa-trophy"></i>
                            <span>View Leaderboard</span>
                        </button>
                        <button class="btn btn-secondary" onclick="gameHub.games.minesweeper.start()">
                            <i class="fas fa-home"></i>
                            <span>Back to Home</span>
                        </button>
                        <button class="btn btn-primary play-again-btn" onclick="gameHub.games.minesweeper.start()">
                            <span>Play Again</span>
                            <i class="fas fa-redo"></i>
                        </button>
                    </div>
                </div>
            `;
        }, won ? 1000 : 500);
        
        if (window.soundSystem) window.soundSystem.play(won ? 'success' : 'error');
    }
    
    startTimer() {
        this.timer = setInterval(() => {
            const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
            document.getElementById('timeCount').textContent = elapsed;
        }, 1000);
    }
    
    cleanup() {
        if (this.timer) clearInterval(this.timer);
    }
}

// ===================================
// GAME 11: PATH FINDER VISUALIZER
// ===================================

class PathFinder {
    constructor(hub) {
        this.hub = hub;
        this.grid = [];
        this.gridSize = 20;
        this.startCell = null;
        this.endCell = null;
        this.walls = new Set();
        this.algorithm = 'astar';
        this.isDrawing = false;
        this.drawMode = 'wall'; // wall, start, end
        this.isRunning = false;
        this.score = 0;
        this.pathsFound = 0;
        this._lastScoredMaze = null;
        this.highScoreHTML = null; // Store for start screen
        this.scoreManager = new HighScoreManager('pathFinder');
    }
    
    async start() {
        // Make scoreManager globally accessible for leaderboard button
        window.currentScoreManager = this.scoreManager;
        
        // Get high scores (async because it fetches from Firebase)
        this.highScoreHTML = await this.scoreManager.getStartScreenHTML();
        if (this.hub.currentGame !== this) return; // player left during the fetch
        
        this.grid = [];
        this.startCell = { x: 5, y: 10 };
        this.endCell = { x: 15, y: 10 };
        this.walls = new Set();
        this.isRunning = false;
        this.score = 0;
        this.pathsFound = 0;
        this._lastScoredMaze = null;
        this.showGame();
        this.initializeGrid();
    }
    
    showGame() {
        // Only show start screen with scoreboard if highScoreHTML is available (first time)
        if (this.highScoreHTML) {
            this.hub.container.innerHTML = `
                <div class="pathfinder-game glass-effect">
                    <div class="game-header">
                        <button class="btn-back" onclick="gameHub.backToMenu()">
                            <i class="fas fa-arrow-left"></i>
                        </button>
                        <h3><i class="fas fa-route"></i> Path Finder</h3>
                        <div class="header-actions">
                            <button class="btn-player-name" id="btnSetName" title="Set your name">
                                <i class="fas fa-user-edit"></i>
                                <span id="playerNameDisplay">${this.scoreManager.getPlayerName() || 'Set Name'}</span>
                            </button>
                            <button class="game-close" onclick="gameHub.hide()">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>
                    
                    <div class="game-content">
                        <div class="game-start-screen">
                            <div class="game-icon-large">
                                <i class="fas fa-route"></i>
                            </div>
                            <h4>Path Finder Visualizer</h4>
                            <p class="game-description">Visualize A*, Dijkstra, BFS algorithms</p>
                            
                            ${this.highScoreHTML}
                            
                            <button class="btn-game-start" id="startPathFinder">
                                <i class="fas fa-play"></i>
                                <span>Start Visualizer</span>
                            </button>
                            <div class="game-rules">
                                <div class="rule-item">
                                    <i class="fas fa-check-circle"></i>
                                    <span>Draw a maze, then let an algorithm solve it — each solved run scores</span>
                                </div>
                                <div class="rule-item">
                                    <i class="fas fa-check-circle"></i>
                                    <span>Scoring: 10 pts per wall + 5 pts per path cell + (walls × path ÷ 10) difficulty bonus</span>
                                </div>
                                <div class="rule-item">
                                    <i class="fas fa-check-circle"></i>
                                    <span>Harder mazes with longer paths = bigger scores</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            document.getElementById('startPathFinder').addEventListener('click', () => {
                this.highScoreHTML = null; // Clear it so we don't show start screen again
                this.showGame();
                // Use setTimeout to ensure DOM is ready
                setTimeout(() => this.initializeGrid(), 10);
            });
            document.getElementById('btnSetName').addEventListener('click', () => {
                const name = this.scoreManager.promptForName();
                document.getElementById('playerNameDisplay').textContent = name || 'Set Name';
            });
            return;
        }
        
        this.hub.container.innerHTML = `
            <div class="pathfinder-game glass-effect">
                <div class="game-header">
                    <button class="back-btn" onclick="gameHub.showMenu()">
                        <i class="fas fa-arrow-left"></i> Back
                    </button>
                    <h2><i class="fas fa-route"></i> Path Finder Visualizer</h2>
                    <div class="pathfinder-score">Score: <span id="pathfinderScore">0</span></div>
                </div>
                
                <div class="pathfinder-controls">
                    <div class="algorithm-selector">
                        <label>Algorithm:</label>
                        <select id="algorithmSelect" onchange="gameHub.games.pathfinder.setAlgorithm(this.value)">
                            <option value="astar">A* (A-Star)</option>
                            <option value="dijkstra">Dijkstra</option>
                            <option value="bfs">BFS (Breadth-First)</option>
                            <option value="dfs">DFS (Depth-First)</option>
                        </select>
                    </div>
                    
                    <button class="visualize-btn" onclick="gameHub.games.pathfinder.visualize()">
                        <i class="fas fa-play"></i> Visualize
                    </button>
                    <button class="clear-path-btn" onclick="gameHub.games.pathfinder.clearPath()">
                        <i class="fas fa-eraser"></i> Clear Path
                    </button>
                    <button class="clear-all-btn" onclick="gameHub.games.pathfinder.clearAll()">
                        <i class="fas fa-trash"></i> Clear All
                    </button>
                </div>
                
                <div class="pathfinder-legend">
                    <div class="legend-item"><div class="legend-box start"></div> Start</div>
                    <div class="legend-item"><div class="legend-box end"></div> End</div>
                    <div class="legend-item"><div class="legend-box wall"></div> Wall (Draw)</div>
                    <div class="legend-item"><div class="legend-box visited"></div> Visited</div>
                    <div class="legend-item"><div class="legend-box path"></div> Shortest Path</div>
                </div>
                
                <div class="pathfinder-grid" id="pathGrid"></div>
                
                <div class="pathfinder-info">
                    <p><strong>Instructions:</strong> Click and drag to draw walls. Algorithm will find shortest path from green to red.</p>
                    <p><strong>Scoring:</strong> each solved run earns <strong>walls × 10</strong> + <strong>path length × 5</strong> + difficulty bonus (<strong>walls × path ÷ 10</strong>) — build harder mazes for bigger scores!</p>
                </div>
            </div>
        `;
    }
    
    initializeGrid() {
        const gridEl = document.getElementById('pathGrid');
        if (!gridEl) return; // start screen is showing — grid renders after Start
        gridEl.style.gridTemplateColumns = `repeat(${this.gridSize}, 30px)`;
        gridEl.innerHTML = '';
        
        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
                const cell = document.createElement('div');
                cell.className = 'path-cell';
                cell.dataset.x = x;
                cell.dataset.y = y;
                
                if (this.startCell && x === this.startCell.x && y === this.startCell.y) {
                    cell.classList.add('start');
                } else if (this.endCell && x === this.endCell.x && y === this.endCell.y) {
                    cell.classList.add('end');
                } else if (this.walls.has(`${x},${y}`)) {
                    cell.classList.add('wall');
                }
                
                cell.addEventListener('mousedown', () => {
                    if (this.isRunning) return;
                    this.isDrawing = true;
                    this.handleCellClick(x, y);
                });
                
                cell.addEventListener('mouseenter', () => {
                    if (this.isDrawing && !this.isRunning) {
                        this.handleCellClick(x, y);
                    }
                });
                
                cell.addEventListener('mouseup', () => {
                    this.isDrawing = false;
                });
                
                gridEl.appendChild(cell);
            }
        }
        
        // initializeGrid re-runs on every wall toggle — the document listener
        // must be added exactly once and removed in cleanup().
        if (!this._boundStopDrawing) {
            this._boundStopDrawing = () => { this.isDrawing = false; };
            document.addEventListener('mouseup', this._boundStopDrawing);
        }
    }
    
    handleCellClick(x, y) {
        const key = `${x},${y}`;
        
        // Toggle wall
        if (this.walls.has(key)) {
            this.walls.delete(key);
        } else {
            // Don't allow walls on start/end
            if ((this.startCell && x === this.startCell.x && y === this.startCell.y) ||
                (this.endCell && x === this.endCell.x && y === this.endCell.y)) {
                return;
            }
            this.walls.add(key);
        }
        
        this.initializeGrid();
    }
    
    setAlgorithm(algo) {
        this.algorithm = algo;
    }
    
    _showNote(text) {
        let el = document.getElementById('pathfinderNote');
        if (!el) {
            const info = document.querySelector('.pathfinder-info');
            if (!info) return;
            el = document.createElement('p');
            el.id = 'pathfinderNote';
            el.style.color = 'var(--primary-color)';
            info.appendChild(el);
        }
        el.textContent = text;
    }
    
    async visualize() {
        if (this.isRunning) return;
        if (!this.startCell || !this.endCell) return;
        
        this.isRunning = true;
        this.clearPath();
        
        let result;
        switch(this.algorithm) {
            case 'astar':
                result = await this.aStar();
                break;
            case 'dijkstra':
                result = await this.dijkstra();
                break;
            case 'bfs':
                result = await this.bfs();
                break;
            case 'dfs':
                result = await this.dfs();
                break;
        }
        
        if (result && result.length > 0) {
            await this.animatePath(result);
            
            // Same maze re-runs visualize fine, but only NEW mazes score —
            // otherwise one wall layout could be farmed forever.
            const mazeKey = [...this.walls].sort().join('|');
            if (mazeKey === this._lastScoredMaze) {
                this._showNote('Same maze — redraw the walls to earn more points!');
                this.isRunning = false;
                return;
            }
            this._lastScoredMaze = mazeKey;
            this._showNote('');
            
            // Calculate score after successful pathfinding
            const obstacles = this.walls.size;
            const pathLength = result.length;
            
            // Base points: obstacles × 10
            const basePoints = obstacles * 10;
            
            // Path length bonus: longer successful paths = more points
            const pathLengthBonus = pathLength * 5;
            
            // Difficulty bonus: more obstacles with longer path = multiplier
            const difficultyBonus = Math.floor(obstacles * pathLength / 10);
            
            const earnedPoints = basePoints + pathLengthBonus + difficultyBonus;
            this.score += earnedPoints;
            this.pathsFound++;
            
            // Update score display if element exists
            const scoreEl = document.getElementById('pathfinderScore');
            if (scoreEl) {
                scoreEl.textContent = this.score;
            }
            
            // Save and submit score after each successful path
            this.scoreManager.saveLocalHighScore(this.score);
            this.scoreManager.submitGlobalScore(this.score)
                .then(success => {
                    if (success) {
                        console.log('✅ PathFinder score submitted to global leaderboard');
                    }
                })
                .catch(err => {
                    console.warn('⚠️ Failed to submit PathFinder score:', err);
                });
        }
        
        this.isRunning = false;
    }
    
    async aStar() {
        const visited = new Set();
        const queue = [{ x: this.startCell.x, y: this.startCell.y, g: 0, h: this.heuristic(this.startCell), path: [] }];
        
        while (queue.length > 0) {
            queue.sort((a, b) => (a.g + a.h) - (b.g + b.h));
            const current = queue.shift();
            const key = `${current.x},${current.y}`;
            
            if (visited.has(key)) continue;
            visited.add(key);
            
            await this.animateVisit(current.x, current.y);
            
            if (current.x === this.endCell.x && current.y === this.endCell.y) {
                return [...current.path, { x: current.x, y: current.y }];
            }
            
            const neighbors = this.getNeighbors(current.x, current.y);
            for (const neighbor of neighbors) {
                const nKey = `${neighbor.x},${neighbor.y}`;
                if (!visited.has(nKey)) {
                    queue.push({
                        x: neighbor.x,
                        y: neighbor.y,
                        g: current.g + 1,
                        h: this.heuristic(neighbor),
                        path: [...current.path, { x: current.x, y: current.y }]
                    });
                }
            }
        }
        
        return [];
    }
    
    async dijkstra() {
        const visited = new Set();
        const distances = {};
        const previous = {};
        const queue = [];
        
        // Initialize
        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
                const key = `${x},${y}`;
                distances[key] = Infinity;
                previous[key] = null;
            }
        }
        
        const startKey = `${this.startCell.x},${this.startCell.y}`;
        distances[startKey] = 0;
        queue.push({ x: this.startCell.x, y: this.startCell.y, dist: 0 });
        
        while (queue.length > 0) {
            queue.sort((a, b) => a.dist - b.dist);
            const current = queue.shift();
            const key = `${current.x},${current.y}`;
            
            if (visited.has(key)) continue;
            visited.add(key);
            
            await this.animateVisit(current.x, current.y);
            
            if (current.x === this.endCell.x && current.y === this.endCell.y) {
                return this.reconstructPath(previous);
            }
            
            const neighbors = this.getNeighbors(current.x, current.y);
            for (const neighbor of neighbors) {
                const nKey = `${neighbor.x},${neighbor.y}`;
                const altDist = distances[key] + 1;
                
                if (altDist < distances[nKey]) {
                    distances[nKey] = altDist;
                    previous[nKey] = key;
                    queue.push({ x: neighbor.x, y: neighbor.y, dist: altDist });
                }
            }
        }
        
        return [];
    }
    
    async bfs() {
        const visited = new Set();
        const queue = [{ x: this.startCell.x, y: this.startCell.y, path: [] }];
        
        while (queue.length > 0) {
            const current = queue.shift();
            const key = `${current.x},${current.y}`;
            
            if (visited.has(key)) continue;
            visited.add(key);
            
            await this.animateVisit(current.x, current.y);
            
            if (current.x === this.endCell.x && current.y === this.endCell.y) {
                return [...current.path, { x: current.x, y: current.y }];
            }
            
            const neighbors = this.getNeighbors(current.x, current.y);
            for (const neighbor of neighbors) {
                const nKey = `${neighbor.x},${neighbor.y}`;
                if (!visited.has(nKey)) {
                    queue.push({
                        x: neighbor.x,
                        y: neighbor.y,
                        path: [...current.path, { x: current.x, y: current.y }]
                    });
                }
            }
        }
        
        return [];
    }
    
    async dfs() {
        const visited = new Set();
        const stack = [{ x: this.startCell.x, y: this.startCell.y, path: [] }];
        
        while (stack.length > 0) {
            const current = stack.pop();
            const key = `${current.x},${current.y}`;
            
            if (visited.has(key)) continue;
            visited.add(key);
            
            await this.animateVisit(current.x, current.y);
            
            if (current.x === this.endCell.x && current.y === this.endCell.y) {
                return [...current.path, { x: current.x, y: current.y }];
            }
            
            const neighbors = this.getNeighbors(current.x, current.y);
            for (const neighbor of neighbors.reverse()) {
                const nKey = `${neighbor.x},${neighbor.y}`;
                if (!visited.has(nKey)) {
                    stack.push({
                        x: neighbor.x,
                        y: neighbor.y,
                        path: [...current.path, { x: current.x, y: current.y }]
                    });
                }
            }
        }
        
        return [];
    }
    
    heuristic(cell) {
        // Manhattan distance
        return Math.abs(cell.x - this.endCell.x) + Math.abs(cell.y - this.endCell.y);
    }
    
    getNeighbors(x, y) {
        const neighbors = [];
        const directions = [[0, -1], [1, 0], [0, 1], [-1, 0]]; // Up, Right, Down, Left
        
        for (const [dx, dy] of directions) {
            const nx = x + dx;
            const ny = y + dy;
            
            if (nx >= 0 && nx < this.gridSize && ny >= 0 && ny < this.gridSize) {
                if (!this.walls.has(`${nx},${ny}`)) {
                    neighbors.push({ x: nx, y: ny });
                }
            }
        }
        
        return neighbors;
    }
    
    reconstructPath(previous) {
        const path = [];
        let current = `${this.endCell.x},${this.endCell.y}`;
        
        while (current && current !== `${this.startCell.x},${this.startCell.y}`) {
            const [x, y] = current.split(',').map(Number);
            path.unshift({ x, y });
            current = previous[current];
        }
        
        return path;
    }
    
    async animateVisit(x, y) {
        const cell = document.querySelector(`.path-cell[data-x="${x}"][data-y="${y}"]`);
        if (cell && !cell.classList.contains('start') && !cell.classList.contains('end')) {
            cell.classList.add('visited');
        }
        await this.sleep(10);
    }
    
    async animatePath(path) {
        for (const cell of path) {
            const cellEl = document.querySelector(`.path-cell[data-x="${cell.x}"][data-y="${cell.y}"]`);
            if (cellEl && !cellEl.classList.contains('start') && !cellEl.classList.contains('end')) {
                cellEl.classList.add('path');
            }
            await this.sleep(30);
        }
    }
    
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    clearPath() {
        document.querySelectorAll('.path-cell').forEach(cell => {
            cell.classList.remove('visited', 'path');
        });
    }
    
    clearAll() {
        this.walls.clear();
        this.clearPath();
        this.initializeGrid();
    }
    
    cleanup() {
        this.isRunning = false;
        if (this._boundStopDrawing) {
            document.removeEventListener('mouseup', this._boundStopDrawing);
            this._boundStopDrawing = null;
        }
    }
}

// ===================================
// EXPOSE CLASSES GLOBALLY FOR TESTING
// ===================================
window.GameHub = GameHub;
window.TypingGame = TypingGame;
window.MemoryGame = MemoryGame;
window.ReactionGame = ReactionGame;
window.CodeQuiz = CodeQuiz;
window.TerminalHacker = TerminalHacker;
window.SQLDetective = SQLDetective;
window.BinaryConverter = BinaryConverter;
window.CSSBattle = CSSBattle;
window.RegexGolf = RegexGolf;
window.Minesweeper = Minesweeper;
window.PathFinder = PathFinder;

// Initialize game hub
let gameHub;
document.addEventListener('DOMContentLoaded', () => {
    try {
        gameHub = new GameHub();
        // console.log('✅ Game Hub initialized successfully!');
    } catch (error) {
        console.error('❌ Error initializing Game Hub:', error);
        // Create FAB button anyway as fallback
        createFallbackFAB();
    }
});

// Fallback FAB creation in case main initialization fails
function createFallbackFAB() {
    const fab = document.createElement('button');
    fab.className = 'game-fab glass-effect';
    fab.innerHTML = '<i class="fas fa-gamepad"></i>';
    fab.title = 'Play Developer Games';
    fab.onclick = () => {
        const modal = document.getElementById('typingGame');
        if (modal) {
            modal.classList.add('active');
            if (!modal.innerHTML.trim()) {
                modal.innerHTML = `
                    <div style="text-align: center; color: white; padding: 2rem;">
                        <h2>Games Loading...</h2>
                        <p>Please refresh the page if games don't appear.</p>
                    </div>
                `;
            }
        }
    };
    document.body.appendChild(fab);
    
    // Visible immediately; loading-active CSS hides it until the loader ends.
    fab.classList.add('visible');
}
