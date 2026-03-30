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
        this.currentGame = null;
        this.showMenu();
        if (window.soundSystem) window.soundSystem.play('click');
    }
    
    show() {
        this.container.classList.add('active');
        if (window.soundSystem) window.soundSystem.play('whoosh');
    }
    
    hide() {
        this.container.classList.remove('active');
        if (this.currentGame) {
            this.currentGame.cleanup();
            this.currentGame = null;
        }
        setTimeout(() => this.showMenu(), 300);
        if (window.soundSystem) window.soundSystem.play('click');
    }
    
    createFAB() {
        // console.log('🎮 Creating game FAB button...');
        const fab = document.createElement('button');
        fab.className = 'game-fab glass-effect';
        fab.innerHTML = '<i class="fas fa-gamepad"></i>';
        fab.title = 'Play Developer Games';
        fab.addEventListener('click', () => {
            // console.log('🎮 Game button clicked!');
            this.show();
        });
        document.body.appendChild(fab);
        
        // Show FAB after loader finishes (2.5 seconds to account for loader delay)
        setTimeout(() => {
            fab.classList.add('visible');
            // console.log('✅ Game FAB button now visible');
        }, 2500);
        
        // console.log('✅ Game FAB button added to page. Position:', fab.getBoundingClientRect());
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
            'const obj = { ...spread, key: value };'
        ];
    }
    
    async start() {
        // Make scoreManager globally accessible for leaderboard button
        window.currentScoreManager = this.scoreManager;
        
        // Get high scores (async because it fetches from Firebase)
        const highScoreHTML = await this.scoreManager.getStartScreenHTML();
        
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
                                <span>Complete as many as possible</span>
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
        this.timer = setInterval(() => {
            this.timeLeft--;
            document.getElementById('gameTime').textContent = this.timeLeft;
            
            if (this.timeLeft <= 0) {
                this.endGame();
            } else if (this.timeLeft <= 10) {
                document.getElementById('gameTime').style.color = '#ff0000';
            }
        }, 1000);
    }
    
    loadNextCode() {
        this.currentCode = this.codeSnippets[Math.floor(Math.random() * this.codeSnippets.length)];
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
            this.score += 10;
            this.updateScore();
            if (window.soundSystem) window.soundSystem.play('success');
            
            input.classList.add('correct-flash');
            setTimeout(() => {
                input.classList.remove('correct-flash');
                this.loadNextCode();
            }, 300);
        }
    }
    
    updateScore() {
        document.getElementById('gameScore').textContent = this.score;
    }
    
    endGame() {
        this.isPlaying = false;
        clearInterval(this.timer);
        
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
        
        this.updateScore();
        this.loadNextCode();
        this.startTimer();
    }
    
    cleanup() {
        if (this.timer) clearInterval(this.timer);
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
    constructor(hub) {
        this.hub = hub;
        this.score = 0;
        this.currentQuestion = 0;
        this.scoreManager = new HighScoreManager('codeQuiz');
        this.questions = [
            {
                question: 'What does HTML stand for?',
                options: ['Hyper Text Markup Language', 'High Tech Modern Language', 'Home Tool Markup Language', 'Hyperlinks and Text Markup Language'],
                correct: 0
            },
            {
                question: 'Which CSS property controls text size?',
                options: ['text-size', 'font-size', 'text-style', 'font-style'],
                correct: 1
            },
            {
                question: 'What is the correct way to declare a JavaScript variable?',
                options: ['var name;', 'variable name;', 'v name;', 'declare name;'],
                correct: 0
            },
            {
                question: 'Which symbol is used for single-line comments in JavaScript?',
                options: ['/*', '//', '#', '<!--'],
                correct: 1
            },
            {
                question: 'What does CSS stand for?',
                options: ['Creative Style Sheets', 'Cascading Style Sheets', 'Computer Style Sheets', 'Colorful Style Sheets'],
                correct: 1
            },
            {
                question: 'Which HTML tag is used for the largest heading?',
                options: ['<heading>', '<h6>', '<h1>', '<head>'],
                correct: 2
            },
            {
                question: 'What is the correct syntax for a JavaScript function?',
                options: ['function myFunction()', 'def myFunction()', 'func myFunction()', 'function:myFunction()'],
                correct: 0
            },
            {
                question: 'Which property is used to change background color in CSS?',
                options: ['bgcolor', 'color', 'background-color', 'background'],
                correct: 2
            }
        ];
    }
    
    async start() {
        // Make scoreManager globally accessible for leaderboard button
        window.currentScoreManager = this.scoreManager;
        
        // Get high scores (async because it fetches from Firebase)
        const highScoreHTML = await this.scoreManager.getStartScreenHTML();
        
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
                            <div class="stat-value" id="quizProgress">0/${this.questions.length}</div>
                            <div class="stat-label">Progress</div>
                        </div>
                    </div>
                </div>
                
                <div class="game-content" id="quizContent">
                    <div class="game-start-screen">
                        <div class="game-icon-large">
                            <i class="fas fa-graduation-cap"></i>
                        </div>
                        <h4>Web Development Quiz</h4>
                        <p class="game-description">Test your knowledge of HTML, CSS, and JavaScript!</p>
                        
                        ${highScoreHTML}
                        
                        <button class="btn-game-start" id="startQuiz">
                            <i class="fas fa-play"></i>
                            <span>Start Quiz</span>
                        </button>
                        <div class="quiz-info">
                            <p><i class="fas fa-check-circle"></i> ${this.questions.length} questions</p>
                            <p><i class="fas fa-check-circle"></i> Multiple choice</p>
                            <p><i class="fas fa-check-circle"></i> Instant feedback</p>
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
        this.score = 0;
        this.currentQuestion = 0;
        this.questions.sort(() => Math.random() - 0.5);
        this.showQuestion();
    }
    
    showQuestion() {
        if (this.currentQuestion >= this.questions.length) {
            this.endGame();
            return;
        }
        
        const q = this.questions[this.currentQuestion];
        const content = document.getElementById('quizContent');
        
        content.innerHTML = `
            <div class="quiz-question">
                <div class="question-number">Question ${this.currentQuestion + 1} of ${this.questions.length}</div>
                <h4 class="question-text">${q.question}</h4>
                <div class="quiz-options">
                    ${q.options.map((option, index) => `
                        <button class="quiz-option" data-index="${index}">
                            <span class="option-letter">${String.fromCharCode(65 + index)}</span>
                            <span class="option-text">${option}</span>
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
        const correct = this.questions[this.currentQuestion].correct;
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
        document.getElementById('quizProgress').textContent = `${this.currentQuestion}/${this.questions.length}`;
    }
    
    endGame() {
        const percentage = Math.round((this.score / this.questions.length) * 100);
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
                        <div class="stat-value">${this.questions.length - this.score}</div>
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
        this.currentLevel = 0;
        this.score = 0;
        this.commandHistory = [];
        this.correctCommands = 0;
        this.wrongCommands = 0;
        this.levelsCompleted = 0;
        this.scoreManager = new HighScoreManager('terminalHacker');
        
        this.levels = [
            {
                title: 'Level 1: Navigation',
                objective: 'Find the secret file using ls and cd commands',
                filesystem: {
                    '/': ['home', 'var', 'etc'],
                    '/home': ['user', 'admin'],
                    '/home/user': ['documents', 'downloads', 'secret.txt'],
                    '/home/admin': ['logs', 'config'],
                    '/var': ['log', 'tmp'],
                    '/etc': ['hosts', 'passwd']
                },
                targetFile: '/home/user/secret.txt',
                allowedCommands: ['ls', 'cd', 'pwd', 'cat', 'help'],
                hint: 'Try using "ls" to list files and "cd" to change directory'
            },
            {
                title: 'Level 2: File Search',
                objective: 'Find and read the password file',
                filesystem: {
                    '/': ['bin', 'usr', 'home'],
                    '/bin': ['bash', 'python', 'node'],
                    '/usr': ['local', 'share'],
                    '/usr/local': ['bin', 'lib'],
                    '/home': ['hacker'],
                    '/home/hacker': ['.ssh', 'projects', '.hidden'],
                    '/home/hacker/.hidden': ['password.txt']
                },
                targetFile: '/home/hacker/.hidden/password.txt',
                allowedCommands: ['ls', 'cd', 'pwd', 'cat', 'find', 'help'],
                hint: 'Hidden files start with a dot (.). Use "ls -a" to see them'
            },
            {
                title: 'Level 3: System Access',
                objective: 'Find the root access key',
                filesystem: {
                    '/': ['root', 'home', 'tmp'],
                    '/root': ['access_denied'],
                    '/home': ['user1', 'user2'],
                    '/home/user1': ['notes.txt'],
                    '/home/user2': ['backup'],
                    '/home/user2/backup': ['old_files', 'key.txt'],
                    '/tmp': ['cache', 'sessions']
                },
                targetFile: '/home/user2/backup/key.txt',
                allowedCommands: ['ls', 'cd', 'pwd', 'cat', 'grep', 'find', 'help'],
                hint: 'Explore all user directories. Sometimes backups contain valuable information'
            }
        ];
        
        this.currentPath = '/';
    }
    
    async start() {
        // Make scoreManager globally accessible for leaderboard button
        window.currentScoreManager = this.scoreManager;
        
        // Get high scores (async because it fetches from Firebase)
        const highScoreHTML = await this.scoreManager.getStartScreenHTML();
        
        this.currentLevel = 0;
        this.score = 0;
        this.currentPath = '/';
        this.commandHistory = [];
        
        // Store highScoreHTML for use in showLevel
        this.highScoreHTML = highScoreHTML;
        
        this.showLevel();
    }
    
    showLevel() {
        const level = this.levels[this.currentLevel];
        
        // Only show start screen with scoreboard on first level (level 0)
        if (this.currentLevel === 0 && this.highScoreHTML) {
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
                            <h4>Terminal Hacker Challenge</h4>
                            <p class="game-description">Navigate systems using terminal commands</p>
                            
                            ${this.highScoreHTML}
                            
                            <button class="btn-game-start" id="startTerminal">
                                <i class="fas fa-play"></i>
                                <span>Start Hacking</span>
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            document.getElementById('startTerminal').addEventListener('click', () => {
                this.highScoreHTML = null; // Clear it so we don't show start screen again
                this.showLevel();
            });
            document.getElementById('btnSetName').addEventListener('click', () => {
                const name = this.scoreManager.promptForName();
                document.getElementById('playerNameDisplay').textContent = name || 'Set Name';
            });
            return;
        }
        
        this.hub.container.innerHTML = `
            <div class="terminal-game glass-effect">
                <div class="terminal-header">
                    <button class="back-btn" onclick="gameHub.showMenu()">
                        <i class="fas fa-arrow-left"></i> Back
                    </button>
                    <h2><i class="fas fa-terminal"></i> ${level.title}</h2>
                    <div class="terminal-score">Score: <span id="terminalScore">${this.score}</span></div>
                </div>
                
                <div class="terminal-objective">
                    <i class="fas fa-bullseye"></i> ${level.objective}
                    <button class="hint-btn" onclick="gameHub.games.terminal.showHint()">
                        <i class="fas fa-lightbulb"></i> Hint
                    </button>
                </div>
                
                <div class="terminal-window">
                    <div class="terminal-output" id="terminalOutput">
                        <div class="terminal-line">Welcome to Terminal Hacker v1.0</div>
                        <div class="terminal-line">Type 'help' for available commands</div>
                        <div class="terminal-line">Type 'hint' for a clue</div>
                        <div class="terminal-line"></div>
                    </div>
                    
                    <div class="terminal-input-line">
                        <span class="terminal-prompt" id="terminalPrompt">user@hacker:${this.currentPath}$</span>
                        <input type="text" class="terminal-input" id="terminalInput" autocomplete="off" spellcheck="false" autofocus>
                    </div>
                </div>
                
                <div class="terminal-commands">
                    <span>Quick Commands:</span>
                    <button onclick="gameHub.games.terminal.executeCommand('ls')">ls</button>
                    <button onclick="gameHub.games.terminal.executeCommand('pwd')">pwd</button>
                    <button onclick="gameHub.games.terminal.executeCommand('cd ..')">cd ..</button>
                    <button onclick="gameHub.games.terminal.executeCommand('help')">help</button>
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
    }
    
    executeCommand(command) {
        const level = this.levels[this.currentLevel];
        const output = document.getElementById('terminalOutput');
        
        // Show command in output
        const commandLine = document.createElement('div');
        commandLine.className = 'terminal-line command';
        commandLine.innerHTML = `<span class="terminal-prompt">user@hacker:${this.currentPath}$</span> ${command}`;
        output.appendChild(commandLine);
        
        const parts = command.split(' ');
        const cmd = parts[0].toLowerCase();
        const args = parts.slice(1);
        
        let result = '';
        let isValidCommand = false;
        
        if (!level.allowedCommands.includes(cmd) && cmd !== 'hint') {
            result = `Command '${cmd}' not found. Type 'help' for available commands.`;
            this.wrongCommands++;
        } else {
            isValidCommand = true;
            this.correctCommands++;
            switch(cmd) {
                case 'help':
                    result = `Available commands:\n${level.allowedCommands.join(', ')}`;
                    break;
                    
                case 'hint':
                    result = level.hint;
                    break;
                    
                case 'pwd':
                    result = this.currentPath;
                    break;
                    
                case 'ls':
                    const showHidden = args.includes('-a');
                    const files = level.filesystem[this.currentPath] || [];
                    if (files.length === 0) {
                        result = 'Directory is empty';
                    } else {
                        const filtered = showHidden ? files : files.filter(f => !f.startsWith('.'));
                        result = filtered.join('  ');
                    }
                    break;
                    
                case 'cd':
                    if (args.length === 0) {
                        this.currentPath = '/';
                        result = '';
                    } else if (args[0] === '..') {
                        const parts = this.currentPath.split('/').filter(p => p);
                        parts.pop();
                        this.currentPath = '/' + parts.join('/');
                        if (this.currentPath !== '/') this.currentPath = this.currentPath || '/';
                    } else if (args[0] === '/') {
                        this.currentPath = '/';
                        result = '';
                    } else {
                        const newPath = args[0].startsWith('/') ? args[0] : 
                                       this.currentPath === '/' ? '/' + args[0] : this.currentPath + '/' + args[0];
                        
                        if (level.filesystem[newPath]) {
                            this.currentPath = newPath;
                            result = '';
                        } else {
                            result = `cd: ${args[0]}: No such directory`;
                        }
                    }
                    document.getElementById('terminalPrompt').textContent = `user@hacker:${this.currentPath}$`;
                    break;
                    
                case 'cat':
                    if (args.length === 0) {
                        result = 'cat: missing file operand';
                    } else {
                        const fileName = args[0];
                        const filePath = fileName.startsWith('/') ? fileName : 
                                        this.currentPath === '/' ? '/' + fileName : this.currentPath + '/' + fileName;
                        
                        if (filePath === level.targetFile) {
                            result = `🎉 SUCCESS! You found the secret!\nFile contents: "ACCESS_GRANTED_${Math.random().toString(36).substr(2, 9).toUpperCase()}"`;
                            // Calculate score: levels completed × 100 + correct commands - wrong commands
                            this.levelsCompleted++;
                            this.score = (this.levelsCompleted * 100) + this.correctCommands - this.wrongCommands;
                            document.getElementById('terminalScore').textContent = this.score;
                            setTimeout(() => this.completeLevel(), 2000);
                        } else {
                            // Check if file exists in current directory
                            const files = level.filesystem[this.currentPath] || [];
                            if (files.includes(fileName)) {
                                result = `This file contains: "Not the file you're looking for..."`;
                            } else {
                                result = `cat: ${fileName}: No such file`;
                            }
                        }
                    }
                    break;
                    
                case 'find':
                    result = 'Searching...\n';
                    let found = false;
                    for (const [path, files] of Object.entries(level.filesystem)) {
                        for (const file of files) {
                            if (args.length > 0 && file.includes(args[0])) {
                                result += `${path}/${file}\n`;
                                found = true;
                            }
                        }
                    }
                    if (!found) result += 'No files found';
                    break;
                    
                case 'grep':
                    result = 'grep: Pattern matching simulation\nTry using find or ls instead';
                    break;
            }
        }
        
        if (result) {
            const resultLine = document.createElement('div');
            resultLine.className = 'terminal-line';
            resultLine.style.whiteSpace = 'pre-wrap';
            resultLine.textContent = result;
            output.appendChild(resultLine);
        }
        
        // Auto scroll
        output.scrollTop = output.scrollHeight;
    }
    
    showHint() {
        this.executeCommand('hint');
    }
    
    completeLevel() {
        if (this.currentLevel < this.levels.length - 1) {
            this.currentLevel++;
            this.currentPath = '/';
            this.showLevel();
        } else {
            this.showVictory();
        }
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
                <h2><i class="fas fa-trophy"></i> All Levels Complete!</h2>
                <div class="final-score">
                    <div class="score-value">${this.score}</div>
                    <div class="score-label">Final Score</div>
                    <div class="score-breakdown">
                        <div>Levels: ${this.levelsCompleted} × 100 = ${this.levelsCompleted * 100}</div>
                        <div>Correct Commands: +${this.correctCommands}</div>
                        <div>Wrong Commands: -${this.wrongCommands}</div>
                    </div>
                    <div>${this.getHackerRank(this.score)}</div>
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
                    <button class="btn btn-primary play-again-btn" onclick="gameHub.games.terminal.start()">
                        <span>Play Again</span>
                        <i class="fas fa-redo"></i>
                    </button>
                </div>
            </div>
        `;
    }
    
    getHackerRank(score) {
        if (score >= 300) return '🏆 Elite Hacker';
        if (score >= 200) return '⚡ Pro Hacker';
        return '👍 Junior Hacker';
    }
    
    cleanup() {
        // Cleanup if needed
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
        
        this.score = 0;
        this.streak = 0;
        this.maxStreak = 0;
        this.timeLeft = 60;
        this.totalQuestions = 0;
        this.correctAnswers = 0;
        this.questionStartTime = Date.now();
        
        // Store highScoreHTML for use in showGame
        this.highScoreHTML = highScoreHTML;
        
        this.showGame();
        this.generateQuestion();
        this.startTimer();
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
            feedback.innerHTML = '';
            this.generateQuestion();
        }, 1500);
    }
    
    startTimer() {
        this.timer = setInterval(() => {
            this.timeLeft--;
            document.getElementById('binaryTime').textContent = this.timeLeft;
            
            if (this.timeLeft <= 0) {
                this.gameOver();
            }
        }, 1000);
    }
    
    gameOver() {
        clearInterval(this.timer);
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
    }
}

// ===================================
// GAME 8: CSS BATTLE
// ===================================

class CSSBattle {
    constructor(hub) {
        this.hub = hub;
        this.score = 0;
        this.currentChallenge = 0;
        this.codeLength = 0;
        this.scoreManager = new HighScoreManager('cssBattle');
        
        this.challenges = [
            {
                title: 'Simple Square',
                description: 'Create a centered 100x100px red square',
                target: `
                    <div style="width: 100px; height: 100px; background: red; 
                               position: absolute; top: 50%; left: 50%; 
                               transform: translate(-50%, -50%);"></div>
                `,
                hint: 'Use position: absolute and transform to center',
                maxScore: 100
            },
            {
                title: 'Circle',
                description: 'Create a centered blue circle (100px diameter)',
                target: `
                    <div style="width: 100px; height: 100px; background: blue; 
                               border-radius: 50%; position: absolute; 
                               top: 50%; left: 50%; transform: translate(-50%, -50%);"></div>
                `,
                hint: 'Use border-radius: 50% for a circle',
                maxScore: 100
            },
            {
                title: 'Two Circles',
                description: 'Create two green circles side by side',
                target: `
                    <div style="display: flex; justify-content: center; align-items: center; 
                               height: 100%; gap: 20px;">
                        <div style="width: 80px; height: 80px; background: green; border-radius: 50%;"></div>
                        <div style="width: 80px; height: 80px; background: green; border-radius: 50%;"></div>
                    </div>
                `,
                hint: 'Use flexbox with gap property',
                maxScore: 150
            }
        ];
    }
    
    async start() {
        // Make scoreManager globally accessible for leaderboard button
        window.currentScoreManager = this.scoreManager;
        
        // Get high scores (async because it fetches from Firebase)
        const highScoreHTML = await this.scoreManager.getStartScreenHTML();
        
        this.score = 0;
        this.currentChallenge = 0;
        
        // Store highScoreHTML for use in showChallenge
        this.highScoreHTML = highScoreHTML;
        
        this.showChallenge();
    }
    
    showChallenge() {
        const challenge = this.challenges[this.currentChallenge];
        
        // Only show start screen with scoreboard on first challenge (challenge 0)
        if (this.currentChallenge === 0 && this.highScoreHTML) {
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
                            <h4>CSS Battle Challenge</h4>
                            <p class="game-description">Recreate designs with minimal code</p>
                            
                            ${this.highScoreHTML}
                            
                            <button class="btn-game-start" id="startCSSBattle">
                                <i class="fas fa-play"></i>
                                <span>Start Battle</span>
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            document.getElementById('startCSSBattle').addEventListener('click', () => {
                this.highScoreHTML = null; // Clear it so we don't show start screen again
                this.showChallenge();
            });
            document.getElementById('btnSetName').addEventListener('click', () => {
                const name = this.scoreManager.promptForName();
                document.getElementById('playerNameDisplay').textContent = name || 'Set Name';
            });
            return;
        }
        
        this.hub.container.innerHTML = `
            <div class="css-battle-game glass-effect">
                <div class="game-header">
                    <button class="back-btn" onclick="gameHub.showMenu()">
                        <i class="fas fa-arrow-left"></i> Back
                    </button>
                    <h2><i class="fas fa-palette"></i> CSS Battle ${this.currentChallenge + 1}/${this.challenges.length}</h2>
                    <div class="css-score">Score: <span id="cssScore">${this.score}</span></div>
                </div>
                
                <div class="css-challenge">
                    <h3>${challenge.title}</h3>
                    <p>${challenge.description}</p>
                    <button class="hint-btn" onclick="gameHub.games.cssbattle.showHint()">
                        <i class="fas fa-lightbulb"></i> Hint
                    </button>
                </div>
                
                <div class="css-workspace">
                    <div class="css-editor">
                        <h4>Your CSS Code:</h4>
                        <textarea id="cssCode" class="css-code-input" placeholder="Write your CSS here...
/* Example: */
.box {
    width: 100px;
    height: 100px;
    background: red;
}"></textarea>
                        <div class="css-controls">
                            <span>Characters: <span id="cssLength">0</span></span>
                            <button class="update-btn" onclick="gameHub.games.cssbattle.updatePreview()">
                                <i class="fas fa-sync"></i> Update Preview
                            </button>
                            <button class="submit-btn" onclick="gameHub.games.cssbattle.submitSolution()">
                                <i class="fas fa-check"></i> Submit
                            </button>
                        </div>
                    </div>
                    
                    <div class="css-previews">
                        <div class="preview-panel">
                            <h4>Target:</h4>
                            <div class="preview-box target-preview" id="targetPreview"></div>
                        </div>
                        <div class="preview-panel">
                            <h4>Your Result:</h4>
                            <div class="preview-box your-preview" id="yourPreview"></div>
                        </div>
                    </div>
                </div>
                
                <div id="cssFeedback" class="css-feedback"></div>
            </div>
        `;
        
        // Show target
        document.getElementById('targetPreview').innerHTML = challenge.target;
        
        // Setup code editor
        const codeInput = document.getElementById('cssCode');
        codeInput.addEventListener('input', () => {
            this.codeLength = codeInput.value.length;
            document.getElementById('cssLength').textContent = this.codeLength;
        });
    }
    
    updatePreview() {
        const code = document.getElementById('cssCode').value;
        const preview = document.getElementById('yourPreview');
        
        // Create a style element
        const styleId = 'css-battle-preview-style';
        let styleEl = document.getElementById(styleId);
        if (!styleEl) {
            styleEl = document.createElement('style');
            styleEl.id = styleId;
            document.head.appendChild(styleEl);
        }
        
        // Apply scoped styles
        styleEl.textContent = `#yourPreview { position: relative; } #yourPreview * { margin: 0; padding: 0; box-sizing: border-box; } ` + code;
        
        // For simple challenges, create a div that can be styled
        if (!preview.querySelector('.target-element')) {
            preview.innerHTML = '<div class="target-element box"></div>';
        }
    }
    
    submitSolution() {
        const challenge = this.challenges[this.currentChallenge];
        const feedback = document.getElementById('cssFeedback');
        
        // Visual match percentage (simplified - assume 80-100% based on completion)
        const visualMatch = 85; // Base match percentage for attempting
        
        // Code efficiency: Bonus for shorter code
        const maxChars = 200; // Reasonable max for these challenges
        const usedChars = this.codeLength;
        const efficiencyBonus = Math.max(0, Math.floor(((maxChars - usedChars) / maxChars) * 50));
        
        // Completion bonus
        const completionBonus = 50;
        
        // Calculate total score
        const earnedPoints = Math.floor(visualMatch + efficiencyBonus + completionBonus);
        
        this.score += earnedPoints;
        document.getElementById('cssScore').textContent = this.score;
        
        feedback.innerHTML = `
            <div class="success">
                <i class="fas fa-check-circle"></i> 
                Challenge Complete! +${earnedPoints} points
                <div>Visual Match: ${visualMatch}pts | Efficiency: +${efficiencyBonus}pts | Bonus: +${completionBonus}pts</div>
                <div>Code length: ${this.codeLength} chars</div>
            </div>
        `;
        feedback.className = 'css-feedback success';
        
        if (window.soundSystem) window.soundSystem.play('success');
        
        setTimeout(() => {
            if (this.currentChallenge < this.challenges.length - 1) {
                this.currentChallenge++;
                this.showChallenge();
            } else {
                this.showVictory();
            }
        }, 2000);
    }
    
    showHint() {
        const challenge = this.challenges[this.currentChallenge];
        const feedback = document.getElementById('cssFeedback');
        feedback.innerHTML = `<div class="hint"><i class="fas fa-lightbulb"></i> ${challenge.hint}</div>`;
        feedback.className = 'css-feedback hint';
        setTimeout(() => {
            feedback.innerHTML = '';
        }, 4000);
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
                <h2><i class="fas fa-trophy"></i> All Challenges Complete!</h2>
                <div class="final-score">
                    <div>Total Score: ${this.score}</div>
                    <div>${this.getCSSRating(this.score)}</div>
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
                    <button class="btn btn-primary play-again-btn" onclick="gameHub.games.cssbattle.start()">
                        <span>Play Again</span>
                        <i class="fas fa-redo"></i>
                    </button>
                </div>
            </div>
        `;
    }
    
    getCSSRating(score) {
        if (score >= 350) return '🏆 CSS Master - Code Golf Champion!';
        if (score >= 250) return '⚡ CSS Pro - Efficient Coder!';
        if (score >= 150) return '👍 CSS Apprentice!';
        return '💪 Keep Learning CSS!';
    }
    
    cleanup() {
        const styleEl = document.getElementById('css-battle-preview-style');
        if (styleEl) styleEl.remove();
    }
}

// ===================================
// GAME 9: REGEX GOLF
// ===================================

class RegexGolf {
    constructor(hub) {
        this.hub = hub;
        this.score = 0;
        this.currentHole = 0;
        this.holeStartTime = null;
        this.highScoreHTML = null; // Store for start screen
        this.scoreManager = new HighScoreManager('regexGolf');
        
        this.holes = [
            {
                title: 'Hole 1: Simple Digits',
                description: 'Match all lines containing digits',
                matches: ['abc123', 'test5', '999', 'number1'],
                nonMatches: ['hello', 'world', 'abc', 'test'],
                hint: 'Use \\d to match digits',
                par: 3
            },
            {
                title: 'Hole 2: Email Pattern',
                description: 'Match valid email-like strings',
                matches: ['test@email.com', 'user@domain.org', 'hello@site.net'],
                nonMatches: ['notanemail', '@test.com', 'test@', 'test.com'],
                hint: 'Look for @ symbol with text before and after',
                par: 15
            },
            {
                title: 'Hole 3: Phone Numbers',
                description: 'Match phone numbers (XXX-XXX-XXXX format)',
                matches: ['123-456-7890', '999-888-7777', '555-123-4567'],
                nonMatches: ['1234567890', '123-45-6789', 'abc-def-ghij'],
                hint: 'Use \\d{3} for three digits',
                par: 18
            },
            {
                title: 'Hole 4: Vowels Only',
                description: 'Match lines that contain only vowels (a,e,i,o,u)',
                matches: ['aaa', 'eee', 'aeiou', 'ooo'],
                nonMatches: ['abc', 'hello', 'test', 'xyz'],
                hint: 'Use character class [aeiou] and anchors',
                par: 12
            },
            {
                title: 'Hole 5: Hex Colors',
                description: 'Match hex color codes (#RGB or #RRGGBB)',
                matches: ['#fff', '#000', '#a1b2c3', '#FF00FF'],
                nonMatches: ['fff', '#gg', '#12345', 'color'],
                hint: 'Start with # followed by hex digits',
                par: 20
            }
        ];
    }
    
    async start() {
        // Make scoreManager globally accessible for leaderboard button
        window.currentScoreManager = this.scoreManager;
        
        // Get high scores (async because it fetches from Firebase)
        this.highScoreHTML = await this.scoreManager.getStartScreenHTML();
        
        this.score = 0;
        this.currentHole = 0;
        this.holeStartTime = Date.now();
        this.showHole();
    }
    
    showHole() {
        const hole = this.holes[this.currentHole];
        this.holeStartTime = Date.now();
        
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
                            <p class="game-description">Match strings with shortest regex pattern</p>
                            
                            ${this.highScoreHTML}
                            
                            <button class="btn-game-start" id="startRegex">
                                <i class="fas fa-play"></i>
                                <span>Start Challenge</span>
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            document.getElementById('startRegex').addEventListener('click', () => {
                this.highScoreHTML = null; // Clear it so we don't show start screen again
                this.showHole();
            });
            document.getElementById('btnSetName').addEventListener('click', () => {
                const name = this.scoreManager.promptForName();
                document.getElementById('playerNameDisplay').textContent = name || 'Set Name';
            });
            return;
        }
        
        this.hub.container.innerHTML = `
            <div class="regex-game glass-effect">
                <div class="game-header">
                    <button class="back-btn" onclick="gameHub.showMenu()">
                        <i class="fas fa-arrow-left"></i> Back
                    </button>
                    <h2><i class="fas fa-code"></i> ${hole.title}</h2>
                    <div class="regex-score">Score: <span id="regexScore">${this.score}</span></div>
                </div>
                
                <div class="regex-challenge">
                    <p>${hole.description}</p>
                    <div class="regex-par">Par: ${hole.par} characters</div>
                    <button class="hint-btn" onclick="gameHub.games.regex.showHint()">
                        <i class="fas fa-lightbulb"></i> Hint
                    </button>
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
            feedback.innerHTML = `<div class="error">Invalid regex: ${error.message}</div>`;
            feedback.className = 'regex-feedback error';
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
            feedback.innerHTML = `<div class="error">Invalid regex: ${error.message}</div>`;
            feedback.className = 'regex-feedback error';
        }
    }
    
    showHint() {
        const hole = this.holes[this.currentHole];
        const feedback = document.getElementById('regexFeedback');
        feedback.innerHTML = `<div class="hint"><i class="fas fa-lightbulb"></i> ${hole.hint}</div>`;
        feedback.className = 'regex-feedback hint';
        setTimeout(() => {
            feedback.innerHTML = '';
        }, 5000);
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
                <h2><i class="fas fa-trophy"></i> Course Complete!</h2>
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
        this.highScoreHTML = null; // Store for start screen
        this.scoreManager = new HighScoreManager('pathFinder');
    }
    
    async start() {
        // Make scoreManager globally accessible for leaderboard button
        window.currentScoreManager = this.scoreManager;
        
        // Get high scores (async because it fetches from Firebase)
        this.highScoreHTML = await this.scoreManager.getStartScreenHTML();
        
        this.grid = [];
        this.startCell = { x: 5, y: 10 };
        this.endCell = { x: 15, y: 10 };
        this.walls = new Set();
        this.isRunning = false;
        this.score = 0;
        this.pathsFound = 0;
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
                </div>
            </div>
        `;
    }
    
    initializeGrid() {
        const gridEl = document.getElementById('pathGrid');
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
        
        document.addEventListener('mouseup', () => {
            this.isDrawing = false;
        });
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
    
    // Show FAB after loader finishes
    setTimeout(() => {
        fab.classList.add('visible');
    }, 2500);
    
    // console.log('✅ Fallback FAB button created');
}
