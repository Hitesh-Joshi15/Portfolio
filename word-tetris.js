// ===================================
// WORD TETRIS - Tetris meets Word Finding
// ===================================

class WordTetris {
    constructor(hub) {
        this.hub = hub;
        this.canvas = null;
        this.ctx = null;
        this.gridWidth = 10;
        this.gridHeight = 20;
        this.blockSize = 30;
        this.grid = [];
        this.currentPiece = null;
        this.score = 0;
        this.level = 1;
        this.linesCleared = 0;
        this.gameLoop = null;
        this.dropInterval = 1000;
        this.lastDrop = 0;
        this.isPlaying = false;
        this.currentWord = '';
        this.selectedBlocks = [];
        this.lastTypingTime = Date.now();
        this.hintShown = false;
        this.difficulty = 'normal'; // normal or hard
        this.gameMode = 'infinite'; // infinite or timed
        this.timeLeft = 180; // 3 minutes for timed mode
        this.timerInterval = null;
        
        // High Score Manager
        this.scoreManager = new HighScoreManager('wordTetris');
        
        // Letter frequency for better word formation (weighted towards vowels and common consonants)
        this.letterWeights = {
            'A': 8, 'E': 12, 'I': 8, 'O': 8, 'U': 4,
            'R': 6, 'T': 6, 'N': 6, 'S': 6, 'L': 4,
            'C': 3, 'D': 4, 'P': 3, 'M': 3, 'H': 3,
            'G': 3, 'B': 2, 'F': 2, 'Y': 2, 'W': 2,
            'K': 2, 'V': 2, 'X': 1, 'Z': 1, 'J': 1, 'Q': 1
        };
        
        // Tetromino shapes (smaller pieces) + single block
        this.shapes = [
            [[1, 1], [1, 1]], // O
            [[1, 1, 1]], // I
            [[1, 1, 0], [0, 1, 1]], // S
            [[0, 1, 1], [1, 1, 0]], // Z
            [[1, 1, 1], [0, 1, 0]], // T
            [[1, 1, 1], [1, 0, 0]], // L
            [[1, 1, 1], [0, 0, 1]], // J
            [[1]], // Single block
        ];
        
        // Common letter patterns that appear together in English words
        this.letterPatterns = [
            'AT', 'AN', 'AR', 'ER', 'ED', 'IN', 'IT', 'OR', 'ON',
            'EN', 'RE', 'TE', 'TH', 'NG', 'ST', 'ND', 'NT', 'LE',
            'ING', 'TER', 'ATE', 'EST', 'EAR', 'ART', 'ARD', 'AND',
            'CAT', 'BAT', 'RAT', 'HAT', 'MAT', 'SAT', 'FAT', 'PAT'
        ];
        
        // Common English words (3-6 letters) for smart piece generation
        this.wordBank = [
            // 3 letter words
            'THE', 'AND', 'FOR', 'ARE', 'BUT', 'NOT', 'YOU', 'ALL', 'CAN', 'HER', 'WAS', 'ONE', 'OUR', 'OUT', 'DAY',
            'CAT', 'DOG', 'BAT', 'RAT', 'HAT', 'MAT', 'SAT', 'CAR', 'BAR', 'TAR', 'ART', 
            'EAR', 'EAT', 'TEA', 'SEA', 'PEA', 'BEE', 'SEE', 'TEN', 'PEN', 'MEN', 'HEN',
            'BIG', 'DIG', 'FIG', 'PIG', 'WIG', 'BIN', 'TIN', 'WIN', 'PIN', 'SIN', 'FIN',
            'HOT', 'POT', 'COT', 'DOT', 'GOT', 'LOT', 'TOP', 'POP', 'MOP', 'HOP',
            'FAN', 'MAN', 'PAN', 'RAN', 'TAN', 'VAN', 'BAN', 'SUN', 'RUN', 'BUN',
            'CUP', 'PUP', 'CUT', 'GUT', 'HUT', 'NUT', 'PUT', 'BUS', 'RUG', 'BUG',
            'BAD', 'DAD', 'HAD', 'MAD', 'PAD', 'SAD', 'BED', 'FED', 'LED', 'RED', 'WED',
            'AGE', 'ACE', 'ATE', 'AWE', 'AXE', 'BAG', 'BET', 'BOW', 'BOX', 'BOY',
            // 4 letter words
            'CARD', 'CARE', 'CART', 'CAST', 'STAR', 'TART', 'PART', 'PARK', 'DARK', 'MARK',
            'BEAT', 'BEAR', 'BEAN', 'TEAM', 'TEAR', 'READ', 'REAL', 'DEAR', 'MEAT', 'MEAN',
            'BITE', 'KITE', 'SITE', 'PINE', 'MINE', 'LINE', 'FINE', 'WINE', 'TIME', 'DIME',
            'BOAT', 'COAT', 'GOAT', 'MOAT', 'ROAD', 'LOAD', 'TOAD', 'TOLD', 'BOLD', 'COLD',
            'SAND', 'BAND', 'HAND', 'LAND', 'WAND', 'CANE', 'LANE', 'MANE', 'PANE', 'SANE',
            'CUTE', 'MUTE', 'CURE', 'PURE', 'SURE', 'BURN', 'TURN', 'TUBE', 'CUBE', 'RUDE',
            'MADE', 'WADE', 'FADE', 'BEAD', 'DEAD', 'HEAD', 'LEAD', 'NEED', 'SEED', 'FEED',
            'GAME', 'GATE', 'GAVE', 'BASE', 'CASE', 'RACE', 'FACE', 'PACE', 'LACE', 'WARE',
            'BIRD', 'WORD', 'BEST', 'WEST', 'REST', 'TEST', 'NEST', 'ROCK', 'SOCK', 'LOCK',
            'KING', 'RING', 'SING', 'WING', 'PINK', 'SINK', 'LINK', 'WINK', 'POND', 'BOND',
            // 5 letter words
            'HEART', 'START', 'SMART', 'BEARD', 'BREAD', 'BREAK', 'GREAT', 'TREAT', 'STEAM',
            'LIGHT', 'RIGHT', 'NIGHT', 'FIGHT', 'SIGHT', 'TIGHT', 'BRING', 'STING', 'THING',
            'STAND', 'GRAND', 'BRAND', 'CRANE', 'PLANE', 'TRAIN', 'BRAIN', 'GRAIN', 'DRAIN',
            'STONE', 'PHONE', 'ALONE', 'PROUD', 'SOUND', 'ROUND', 'FOUND', 'MOUND', 'BOUND',
            'SCALE', 'SPACE', 'GRACE', 'TRACE', 'PLACE', 'TRADE', 'GRADE', 'SHADE', 'BLADE',
            'HOUSE', 'MOUSE', 'HORSE', 'NURSE', 'CURSE', 'PURSE', 'BURST', 'CRUST', 'TRUST',
            'WATER', 'LATER', 'PAPER', 'EARTH', 'NORTH', 'WORTH', 'BIRTH', 'THIRD', 'WORLD',
            'DRINK', 'THINK', 'THANK', 'BLANK', 'PLANT', 'GRANT', 'FRONT', 'POINT', 'JOINT'
        ];
        
        // Dictionary cache
        this.validWords = new Set();
        this.checkedWords = new Map();
        this.availableWords = []; // Words currently on board
        
        // Track letter cycling for single blocks
        this.isSingleBlock = false;
        this.currentLetterIndex = 0;
        this.highlightedBlocks = []; // Track highlighted blocks for visual feedback
        
        // Bind event handlers once
        this.boundKeyPress = this.handleKeyPress.bind(this);
        this.boundLetterInput = this.handleLetterInput.bind(this);
    }
    
    async start() {
        // Make scoreManager globally accessible for leaderboard button
        window.currentScoreManager = this.scoreManager;
        
        // Get high scores (async because it fetches from Firebase)
        const highScoreHTML = await this.scoreManager.getStartScreenHTML();
        
        this.hub.container.innerHTML = `
            <div class="word-tetris-game glass-effect">
                <div class="game-header">
                    <button class="btn-back" onclick="gameHub.backToMenu()">
                        <i class="fas fa-arrow-left"></i>
                    </button>
                    <h3><i class="fas fa-cubes"></i> Word Tetris</h3>
                    <div class="header-actions">
                        <button class="btn-player-name" id="btnSetNameWT" title="Set your name">
                            <i class="fas fa-user-edit"></i>
                            <span id="playerNameDisplayWT">${this.scoreManager.getPlayerName() || 'Set Name'}</span>
                        </button>
                        <button class="game-close" onclick="gameHub.hide()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
                
                <div class="game-content" id="wordTetrisContent">
                    <div class="game-start-screen">
                        <div class="game-icon-large">
                            <i class="fas fa-cubes"></i>
                        </div>
                        <h4>Word Tetris</h4>
                        <p class="game-description">Stack blocks with letters, then type words to clear them!</p>
                        
                        ${highScoreHTML}
                        
                        <div class="game-mode-selector">
                            <h5>Select Difficulty:</h5>
                            <div class="mode-buttons">
                                <button class="mode-btn active" data-difficulty="normal">
                                    <i class="fas fa-smile"></i>
                                    <span>Normal</span>
                                    <small>Constant speed</small>
                                </button>
                                <button class="mode-btn" data-difficulty="hard">
                                    <i class="fas fa-fire"></i>
                                    <span>Hard</span>
                                    <small>Increasing speed</small>
                                </button>
                            </div>
                        </div>
                        
                        <div class="game-mode-selector">
                            <h5>Select Mode:</h5>
                            <div class="mode-buttons">
                                <button class="mode-btn active" data-mode="infinite">
                                    <i class="fas fa-infinity"></i>
                                    <span>Infinite</span>
                                    <small>Play until stack reaches top</small>
                                </button>
                                <button class="mode-btn" data-mode="timed">
                                    <i class="fas fa-clock"></i>
                                    <span>Timed</span>
                                    <small>3 minute challenge</small>
                                </button>
                            </div>
                        </div>
                        
                        <button class="btn-game-start" id="startWordTetris">
                            <i class="fas fa-play"></i>
                            <span>Start Game</span>
                        </button>
                        
                        <div class="game-rules">
                            <div class="rule-item">
                                <i class="fas fa-check-circle"></i>
                                <span>Use ←→ to move, ↑ to rotate, ↓ to drop faster</span>
                            </div>
                            <div class="rule-item">
                                <i class="fas fa-check-circle"></i>
                                <span>Type words (3+ letters) to destroy blocks</span>
                            </div>
                            <div class="rule-item">
                                <i class="fas fa-check-circle"></i>
                                <span>Words must be horizontal or vertical</span>
                            </div>
                            <div class="rule-item">
                                <i class="fas fa-check-circle"></i>
                                <span>Hint appears after 10s of no typing</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.setupModeSelection();
        document.getElementById('startWordTetris').addEventListener('click', () => this.startGame());
        document.getElementById('btnSetNameWT').addEventListener('click', () => {
            const name = this.scoreManager.promptForName();
            document.getElementById('playerNameDisplayWT').textContent = name;
        });
    }
    
    setupModeSelection() {
        const modeButtons = document.querySelectorAll('.mode-btn');
        modeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const button = e.currentTarget;
                const parent = button.parentElement;
                parent.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
                button.classList.add('active');
                
                if (button.dataset.difficulty) {
                    this.difficulty = button.dataset.difficulty;
                }
                if (button.dataset.mode) {
                    this.gameMode = button.dataset.mode;
                }
            });
        });
    }
    
    startGame() {
        this.score = 0;
        this.level = 1;
        this.linesCleared = 0;
        this.isPlaying = true;
        this.currentWord = '';
        this.selectedBlocks = [];
        this.dropInterval = this.difficulty === 'hard' ? 1000 : 1200;
        this.timeLeft = 180;
        this.hintShown = false;
        
        this.initializeGrid();
        this.renderGameScreen();
        this.spawnPiece();
        this.lastDrop = Date.now();
        this.lastTypingTime = Date.now();
        
        if (this.gameMode === 'timed') {
            this.startTimer();
        }
        
        // Remove old listeners before adding new ones
        document.removeEventListener('keydown', this.boundKeyPress);
        document.removeEventListener('keydown', this.boundLetterInput);
        
        // Add keyboard listeners
        document.addEventListener('keydown', this.boundKeyPress);
        document.addEventListener('keydown', this.boundLetterInput);
        
        this.gameLoop = requestAnimationFrame(() => this.update());
    }
    
    renderGameScreen() {
        const content = document.getElementById('wordTetrisContent');
        content.innerHTML = `
            <div class="tetris-game-area">
                <div class="tetris-sidebar">
                    <div class="tetris-stats">
                        <div class="stat-card">
                            <i class="fas fa-trophy"></i>
                            <div>
                                <div class="stat-value" id="tetrisScore">0</div>
                                <div class="stat-label">Score</div>
                            </div>
                        </div>
                        <div class="stat-card">
                            <i class="fas fa-layer-group"></i>
                            <div>
                                <div class="stat-value" id="tetrisLevel">1</div>
                                <div class="stat-label">Level</div>
                            </div>
                        </div>
                        ${this.gameMode === 'timed' ? `
                        <div class="stat-card">
                            <i class="fas fa-clock"></i>
                            <div>
                                <div class="stat-value" id="tetrisTime">3:00</div>
                                <div class="stat-label">Time</div>
                            </div>
                        </div>
                        ` : ''}
                    </div>
                    
                    <div class="word-input-area">
                        <h5><i class="fas fa-keyboard"></i> Type Words:</h5>
                        <div class="current-word" id="currentWord">
                            <span class="word-text"></span>
                        </div>
                        <div class="hint-area" id="hintArea" style="display: none;">
                            <i class="fas fa-lightbulb"></i>
                            <span id="hintText"></span>
                        </div>
                    </div>
                    
                    <div class="scoring-info">
                        <h5><i class="fas fa-star"></i> Scoring:</h5>
                        <div class="score-list">
                            <div>3 letters = <strong>1</strong> pt</div>
                            <div>4 letters = <strong>3</strong> pts</div>
                            <div>5 letters = <strong>5</strong> pts</div>
                            <div>6 letters = <strong>7</strong> pts</div>
                            <div class="bonus-info">+Bonus for multiple words!</div>
                        </div>
                    </div>
                </div>
                
                <div class="tetris-canvas-container">
                    <canvas id="tetrisCanvas" width="${this.gridWidth * this.blockSize}" height="${this.gridHeight * this.blockSize}"></canvas>
                    <div class="canvas-overlay" id="gameOverlay" style="display: none;"></div>
                </div>
            </div>
        `;
        
        this.canvas = document.getElementById('tetrisCanvas');
        this.ctx = this.canvas.getContext('2d');
    }
    
    initializeGrid() {
        this.grid = [];
        for (let y = 0; y < this.gridHeight; y++) {
            this.grid[y] = [];
            for (let x = 0; x < this.gridWidth; x++) {
                this.grid[y][x] = null;
            }
        }
    }
    
    getRandomLetter() {
        const letters = [];
        for (const [letter, weight] of Object.entries(this.letterWeights)) {
            for (let i = 0; i < weight; i++) {
                letters.push(letter);
            }
        }
        return letters[Math.floor(Math.random() * letters.length)];
    }
    
    // NEW: Smart piece generation using actual words
    getLettersFromWord() {
        const word = this.wordBank[Math.floor(Math.random() * this.wordBank.length)];
        const letters = word.split('');
        
        // Shuffle the letters
        for (let i = letters.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [letters[i], letters[j]] = [letters[j], letters[i]];
        }
        
        return letters;
    }
    
    // Get letters from common patterns
    getLettersFromPattern() {
        const pattern = this.letterPatterns[Math.floor(Math.random() * this.letterPatterns.length)];
        return pattern.split('');
    }
    
    // Ensure at least one vowel in piece
    ensureVowel(letters) {
        const vowels = ['A', 'E', 'I', 'O', 'U'];
        const hasVowel = letters.some(letter => letter && vowels.includes(letter));
        
        if (!hasVowel && letters.length > 0) {
            // Replace a random letter with a vowel
            const randomIndex = Math.floor(Math.random() * letters.flat().filter(l => l !== null).length);
            let count = 0;
            for (let y = 0; y < letters.length; y++) {
                for (let x = 0; x < letters[y].length; x++) {
                    if (letters[y][x] !== null) {
                        if (count === randomIndex) {
                            letters[y][x] = vowels[Math.floor(Math.random() * vowels.length)];
                            return;
                        }
                        count++;
                    }
                }
            }
        }
    }
    
    spawnPiece() {
        const shape = this.shapes[Math.floor(Math.random() * this.shapes.length)];
        const letters = [];
        
        // Check if single block
        this.isSingleBlock = (shape.length === 1 && shape[0].length === 1);
        
        if (this.isSingleBlock) {
            // Single block starts with a random letter
            letters[0] = [this.getRandomLetter()];
            this.currentLetterIndex = 0;
        } else {
            // Multi-block piece generation
            // 40% word-based, 40% pattern-based, 20% random
            const rand = Math.random();
            let sourceLetters = [];
            
            if (rand < 0.4) {
                sourceLetters = this.getLettersFromWord();
            } else if (rand < 0.8) {
                sourceLetters = this.getLettersFromPattern();
            }
            
            let letterIndex = 0;
            for (let y = 0; y < shape.length; y++) {
                letters[y] = [];
                for (let x = 0; x < shape[y].length; x++) {
                    if (shape[y][x]) {
                        if (sourceLetters.length > 0 && letterIndex < sourceLetters.length) {
                            letters[y][x] = sourceLetters[letterIndex++];
                        } else {
                            letters[y][x] = this.getRandomLetter();
                        }
                    } else {
                        letters[y][x] = null;
                    }
                }
            }
            
            // Ensure at least one vowel in multi-block pieces
            this.ensureVowel(letters);
        }
        
        this.currentPiece = {
            shape: shape,
            letters: letters,
            x: Math.floor(this.gridWidth / 2) - Math.floor(shape[0].length / 2),
            y: 0,
            color: `hsl(${Math.random() * 360}, 70%, 60%)`
        };
        
        // Check if game over
        if (this.checkCollision(this.currentPiece)) {
            this.gameOver();
        }
    }
    
    checkCollision(piece, offsetX = 0, offsetY = 0) {
        for (let y = 0; y < piece.shape.length; y++) {
            for (let x = 0; x < piece.shape[y].length; x++) {
                if (piece.shape[y][x]) {
                    const newX = piece.x + x + offsetX;
                    const newY = piece.y + y + offsetY;
                    
                    if (newX < 0 || newX >= this.gridWidth || newY >= this.gridHeight) {
                        return true;
                    }
                    
                    if (newY >= 0 && this.grid[newY] && this.grid[newY][newX]) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
    
    rotatePiece() {
        const oldShape = this.currentPiece.shape;
        const oldLetters = this.currentPiece.letters;
        
        const rotated = [];
        const rotatedLetters = [];
        
        for (let x = 0; x < oldShape[0].length; x++) {
            rotated[x] = [];
            rotatedLetters[x] = [];
            for (let y = oldShape.length - 1; y >= 0; y--) {
                rotated[x][oldShape.length - 1 - y] = oldShape[y][x];
                rotatedLetters[x][oldShape.length - 1 - y] = oldLetters[y][x];
            }
        }
        
        const testPiece = {
            ...this.currentPiece,
            shape: rotated,
            letters: rotatedLetters
        };
        
        if (!this.checkCollision(testPiece)) {
            this.currentPiece.shape = rotated;
            this.currentPiece.letters = rotatedLetters;
            if (window.soundSystem) window.soundSystem.play('click');
        }
    }
    
    moveDown() {
        if (!this.checkCollision(this.currentPiece, 0, 1)) {
            this.currentPiece.y++;
        } else {
            this.lockPiece();
            this.spawnPiece();
        }
    }
    
    lockPiece() {
        for (let y = 0; y < this.currentPiece.shape.length; y++) {
            for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
                if (this.currentPiece.shape[y][x]) {
                    const gridY = this.currentPiece.y + y;
                    const gridX = this.currentPiece.x + x;
                    if (gridY >= 0 && gridY < this.gridHeight && gridX >= 0 && gridX < this.gridWidth) {
                        this.grid[gridY][gridX] = {
                            letter: this.currentPiece.letters[y][x],
                            color: this.currentPiece.color
                        };
                    }
                }
            }
        }
    }
    
    handleKeyPress(e) {
        if (!this.isPlaying) return;
        
        switch(e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                if (!this.checkCollision(this.currentPiece, -1, 0)) {
                    this.currentPiece.x--;
                    if (window.soundSystem) window.soundSystem.play('click');
                }
                break;
            case 'ArrowRight':
                e.preventDefault();
                if (!this.checkCollision(this.currentPiece, 1, 0)) {
                    this.currentPiece.x++;
                    if (window.soundSystem) window.soundSystem.play('click');
                }
                break;
            case 'ArrowUp':
                e.preventDefault();
                if (this.isSingleBlock) {
                    // Cycle through letters for single block
                    this.cycleBlockLetter();
                } else {
                    this.rotatePiece();
                }
                break;
            case 'ArrowDown':
                e.preventDefault();
                this.moveDown();
                break;
            case 'Backspace':
                e.preventDefault();
                if (this.currentWord.length > 0) {
                    this.currentWord = this.currentWord.slice(0, -1);
                    this.selectedBlocks = [];
                    this.updateWordDisplay();
                }
                break;
            case 'Enter':
                e.preventDefault();
                if (this.currentWord.length >= 3) {
                    this.checkWord();
                }
                break;
        }
    }
    
    handleLetterInput(e) {
        if (!this.isPlaying) return;
        
        // Ignore arrow keys, Enter, Backspace, and other special keys
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowDown' ||
            e.key === 'Enter' || e.key === 'Backspace' || e.key.length > 1) {
            return;
        }
        
        const char = e.key.toUpperCase();
        if (/^[A-Z]$/.test(char)) {
            this.currentWord += char;
            this.lastTypingTime = Date.now();
            this.hintShown = false;
            document.getElementById('hintArea').style.display = 'none';
            this.updateWordDisplay();
            
            if (this.currentWord.length >= 3) {
                this.highlightPotentialWords();
            }
        }
    }
    
    updateWordDisplay() {
        const wordElement = document.querySelector('.word-text');
        if (wordElement) {
            wordElement.textContent = this.currentWord || 'Start typing...';
        }
    }
    
    async checkWord() {
        if (this.currentWord.length < 3) return;
        
        const isValid = await this.validateWord(this.currentWord);
        
        if (isValid) {
            const foundWords = this.findWordInGrid(this.currentWord);
            
            if (foundWords.length > 0) {
                this.clearWords(foundWords);
                this.currentWord = '';
                this.selectedBlocks = [];
                this.updateWordDisplay();
                if (window.soundSystem) window.soundSystem.play('wordComplete');
            } else {
                this.highlightedBlocks = []; // Clear highlights if word not found
                if (window.soundSystem) window.soundSystem.play('error');
                this.showError('Word not found on board!');
            }
        } else {
            this.highlightedBlocks = []; // Clear highlights if word not valid
            if (window.soundSystem) window.soundSystem.play('error');
            this.showError('Not a valid word!');
        }
    }
    
    async validateWord(word) {
        word = word.toLowerCase();
        
        if (this.checkedWords.has(word)) {
            return this.checkedWords.get(word);
        }
        
        try {
            const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
            const isValid = response.ok;
            this.checkedWords.set(word, isValid);
            return isValid;
        } catch (error) {
            // Fallback to basic word list
            const commonWords = ['cat', 'dog', 'car', 'art', 'rat', 'bat', 'mat', 'hat', 'sat', 'cart', 'part', 'star', 'card', 'care', 'scar'];
            return commonWords.includes(word);
        }
    }
    
    findWordInGrid(word) {
        const found = [];
        
        // Check horizontal
        for (let y = 0; y < this.gridHeight; y++) {
            for (let x = 0; x <= this.gridWidth - word.length; x++) {
                let match = true;
                const blocks = [];
                
                for (let i = 0; i < word.length; i++) {
                    if (!this.grid[y][x + i] || this.grid[y][x + i].letter !== word[i]) {
                        match = false;
                        break;
                    }
                    blocks.push({x: x + i, y: y});
                }
                
                if (match) {
                    found.push(blocks);
                }
            }
        }
        
        // Check vertical
        for (let x = 0; x < this.gridWidth; x++) {
            for (let y = 0; y <= this.gridHeight - word.length; y++) {
                let match = true;
                const blocks = [];
                
                for (let i = 0; i < word.length; i++) {
                    if (!this.grid[y + i][x] || this.grid[y + i][x].letter !== word[i]) {
                        match = false;
                        break;
                    }
                    blocks.push({x: x, y: y + i});
                }
                
                if (match) {
                    found.push(blocks);
                }
            }
        }
        
        return found;
    }
    
    clearWords(wordsList) {
        const multiplier = wordsList.length;
        const wordLength = this.currentWord.length;
        let baseScore = 0;
        
        // Progressive scoring: 3=1, 4=3, 5=5, 6=7...
        if (wordLength === 3) baseScore = 1;
        else if (wordLength === 4) baseScore = 3;
        else baseScore = (wordLength - 3) * 2 + 1;
        
        const earnedScore = baseScore * multiplier * multiplier;
        this.score += earnedScore;
        
        // Show score popup
        this.showScorePopup(earnedScore, multiplier);
        
        // Clear the blocks
        wordsList.forEach(blocks => {
            blocks.forEach(({x, y}) => {
                this.grid[y][x] = null;
            });
        });
        
        // Apply gravity
        this.applyGravity();
        
        // Clear highlighted blocks after word removal
        this.highlightedBlocks = [];
        
        this.updateStats();
    }
    
    applyGravity() {
        for (let x = 0; x < this.gridWidth; x++) {
            let writeY = this.gridHeight - 1;
            
            for (let y = this.gridHeight - 1; y >= 0; y--) {
                if (this.grid[y][x]) {
                    if (y !== writeY) {
                        this.grid[writeY][x] = this.grid[y][x];
                        this.grid[y][x] = null;
                    }
                    writeY--;
                }
            }
        }
    }
    
    showScorePopup(score, multiplier) {
        const overlay = document.getElementById('gameOverlay');
        overlay.style.display = 'block';
        overlay.innerHTML = `
            <div class="score-popup">
                <div class="score-amount">+${score}</div>
                ${multiplier > 1 ? `<div class="score-multiplier">${multiplier}x BONUS!</div>` : ''}
            </div>
        `;
        
        setTimeout(() => {
            overlay.style.display = 'none';
        }, 1500);
    }
    
    showError(message) {
        const wordElement = document.querySelector('.word-text');
        wordElement.classList.add('error-shake');
        setTimeout(() => wordElement.classList.remove('error-shake'), 500);
    }
    
    cycleBlockLetter() {
        if (this.isSingleBlock && this.currentPiece) {
            const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            const currentLetter = this.currentPiece.letters[0][0];
            const currentIndex = alphabet.indexOf(currentLetter);
            const nextIndex = (currentIndex + 1) % alphabet.length;
            this.currentPiece.letters[0][0] = alphabet[nextIndex];
            if (window.soundSystem) window.soundSystem.play('click');
        }
    }
    
    async highlightPotentialWords() {
        // Clear previous highlights
        this.highlightedBlocks = [];
        
        if (this.currentWord.length < 3) return;
        
        const searchWord = this.currentWord.toUpperCase();
        
        // First check if the word is valid in dictionary or wordBank
        const isInWordBank = this.wordBank.includes(searchWord);
        let isValidWord = isInWordBank;
        
        // If not in word bank, check dictionary (uses cache)
        if (!isInWordBank) {
            isValidWord = await this.validateWord(searchWord);
        }
        
        // Only highlight if it's a valid word
        if (!isValidWord) return;
        
        // Search horizontally
        for (let y = 0; y < this.gridHeight; y++) {
            for (let x = 0; x < this.gridWidth; x++) {
                if (this.grid[y][x]) {
                    // Try to match from this position
                    let matched = true;
                    const blocks = [];
                    
                    for (let i = 0; i < searchWord.length; i++) {
                        if (x + i >= this.gridWidth || !this.grid[y][x + i] || 
                            this.grid[y][x + i].letter !== searchWord[i]) {
                            matched = false;
                            break;
                        }
                        blocks.push({ x: x + i, y: y });
                    }
                    
                    if (matched) {
                        this.highlightedBlocks = this.highlightedBlocks.concat(blocks);
                    }
                }
            }
        }
        
        // Search vertically
        for (let x = 0; x < this.gridWidth; x++) {
            for (let y = 0; y < this.gridHeight; y++) {
                if (this.grid[y][x]) {
                    // Try to match from this position
                    let matched = true;
                    const blocks = [];
                    
                    for (let i = 0; i < searchWord.length; i++) {
                        if (y + i >= this.gridHeight || !this.grid[y + i][x] || 
                            this.grid[y + i][x].letter !== searchWord[i]) {
                            matched = false;
                            break;
                        }
                        blocks.push({ x: x, y: y + i });
                    }
                    
                    if (matched) {
                        this.highlightedBlocks = this.highlightedBlocks.concat(blocks);
                    }
                }
            }
        }
    }
    
    showHint() {
        // Find a valid word on the board
        const words = this.findAllWords();
        if (words.length > 0) {
            const randomWord = words[Math.floor(Math.random() * words.length)];
            const hintArea = document.getElementById('hintArea');
            const hintText = document.getElementById('hintText');
            const firstTwoLetters = randomWord.word.substring(0, 2);
            hintText.textContent = `Try: ${firstTwoLetters}... (${randomWord.word.length} letters)`;
            hintArea.style.display = 'flex';
            this.hintShown = true;
        }
    }
    
    findAllWords() {
        const foundWords = [];
        
        // Helper function to check if a sequence of letters forms a valid word from wordBank
        const checkWordInBank = (letters) => {
            const word = letters.join('').toUpperCase();
            return this.wordBank.includes(word) ? word : null;
        };
        
        // Scan horizontally
        for (let y = 0; y < this.gridHeight; y++) {
            for (let x = 0; x < this.gridWidth; x++) {
                if (this.grid[y][x]) {
                    // Try words of length 3-6 from this position
                    for (let len = 3; len <= 6; len++) {
                        if (x + len <= this.gridWidth) {
                            const letters = [];
                            let valid = true;
                            
                            for (let i = 0; i < len; i++) {
                                if (this.grid[y][x + i]) {
                                    letters.push(this.grid[y][x + i].letter);
                                } else {
                                    valid = false;
                                    break;
                                }
                            }
                            
                            if (valid) {
                                const word = checkWordInBank(letters);
                                if (word) {
                                    foundWords.push({
                                        word: word,
                                        startX: x,
                                        startY: y,
                                        direction: 'horizontal',
                                        length: len
                                    });
                                }
                            }
                        }
                    }
                }
            }
        }
        
        // Scan vertically
        for (let x = 0; x < this.gridWidth; x++) {
            for (let y = 0; y < this.gridHeight; y++) {
                if (this.grid[y][x]) {
                    // Try words of length 3-6 from this position
                    for (let len = 3; len <= 6; len++) {
                        if (y + len <= this.gridHeight) {
                            const letters = [];
                            let valid = true;
                            
                            for (let i = 0; i < len; i++) {
                                if (this.grid[y + i][x]) {
                                    letters.push(this.grid[y + i][x].letter);
                                } else {
                                    valid = false;
                                    break;
                                }
                            }
                            
                            if (valid) {
                                const word = checkWordInBank(letters);
                                if (word) {
                                    foundWords.push({
                                        word: word,
                                        startX: x,
                                        startY: y,
                                        direction: 'vertical',
                                        length: len
                                    });
                                }
                            }
                        }
                    }
                }
            }
        }
        
        return foundWords;
    }
    
    updateStats() {
        document.getElementById('tetrisScore').textContent = this.score;
        
        // Update level based on score
        const newLevel = Math.floor(this.score / 20) + 1;
        if (newLevel > this.level && this.difficulty === 'hard') {
            this.level = newLevel;
            this.dropInterval = Math.max(200, 1000 - (this.level * 50));
        }
        document.getElementById('tetrisLevel').textContent = this.level;
    }
    
    startTimer() {
        this.timerInterval = setInterval(() => {
            this.timeLeft--;
            const minutes = Math.floor(this.timeLeft / 60);
            const seconds = this.timeLeft % 60;
            document.getElementById('tetrisTime').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            
            if (this.timeLeft <= 0) {
                this.gameOver();
            }
        }, 1000);
    }
    
    update() {
        if (!this.isPlaying) return;
        
        const now = Date.now();
        
        // Auto drop
        if (now - this.lastDrop > this.dropInterval) {
            this.moveDown();
            this.lastDrop = now;
        }
        
        // Check for hint (10 seconds)
        if (!this.hintShown && now - this.lastTypingTime > 10000) {
            this.showHint();
        }
        
        this.draw();
        this.gameLoop = requestAnimationFrame(() => this.update());
    }
    
    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#0a0a0f';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw grid
        this.ctx.strokeStyle = 'rgba(0, 240, 255, 0.1)';
        this.ctx.lineWidth = 1;
        for (let x = 0; x <= this.gridWidth; x++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * this.blockSize, 0);
            this.ctx.lineTo(x * this.blockSize, this.canvas.height);
            this.ctx.stroke();
        }
        for (let y = 0; y <= this.gridHeight; y++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y * this.blockSize);
            this.ctx.lineTo(this.canvas.width, y * this.blockSize);
            this.ctx.stroke();
        }
        
        // Draw locked blocks
        for (let y = 0; y < this.gridHeight; y++) {
            for (let x = 0; x < this.gridWidth; x++) {
                if (this.grid[y][x]) {
                    // Check if this block is highlighted
                    const isHighlighted = this.highlightedBlocks.some(
                        block => block.x === x && block.y === y
                    );
                    this.drawBlock(x, y, this.grid[y][x].letter, this.grid[y][x].color, isHighlighted);
                }
            }
        }
        
        // Draw current piece
        if (this.currentPiece) {
            for (let y = 0; y < this.currentPiece.shape.length; y++) {
                for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
                    if (this.currentPiece.shape[y][x]) {
                        this.drawBlock(
                            this.currentPiece.x + x,
                            this.currentPiece.y + y,
                            this.currentPiece.letters[y][x],
                            this.currentPiece.color
                        );
                    }
                }
            }
        }
    }
    
    drawBlock(x, y, letter, color, isHighlighted = false) {
        const pixelX = x * this.blockSize;
        const pixelY = y * this.blockSize;
        
        // Draw block with highlight effect if needed
        if (isHighlighted) {
            // Add glow effect for highlighted blocks
            this.ctx.shadowBlur = 15;
            this.ctx.shadowColor = '#00ff00';
            this.ctx.fillStyle = color;
            this.ctx.fillRect(pixelX + 1, pixelY + 1, this.blockSize - 2, this.blockSize - 2);
            this.ctx.shadowBlur = 0;
            
            // Bright green border for highlighted blocks
            this.ctx.strokeStyle = '#00ff00';
            this.ctx.lineWidth = 3;
            this.ctx.strokeRect(pixelX + 1, pixelY + 1, this.blockSize - 2, this.blockSize - 2);
        } else {
            // Normal block
            this.ctx.fillStyle = color;
            this.ctx.fillRect(pixelX + 1, pixelY + 1, this.blockSize - 2, this.blockSize - 2);
            
            // Draw border
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(pixelX + 1, pixelY + 1, this.blockSize - 2, this.blockSize - 2);
        }
        
        // Draw letter
        this.ctx.fillStyle = isHighlighted ? '#fff' : '#fff';
        this.ctx.font = isHighlighted ? 'bold 18px Arial' : 'bold 16px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(letter, pixelX + this.blockSize / 2, pixelY + this.blockSize / 2);
    }
    
    gameOver() {
        this.isPlaying = false;
        if (this.gameLoop) {
            cancelAnimationFrame(this.gameLoop);
        }
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        
        // Save high score
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
        
        const content = document.getElementById('wordTetrisContent');
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
                ${personalBest > 0 && !isNewRecord ? `
                    <div class="highscore-info">
                        <i class="fas fa-medal"></i> Personal Best: ${personalBest}
                    </div>
                ` : ''}
                <div class="final-stats-grid">
                    <div class="stat-item">
                        <div class="stat-value">${this.level}</div>
                        <div class="stat-label">Level Reached</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${this.linesCleared}</div>
                        <div class="stat-label">Words Cleared</div>
                    </div>
                </div>
                <div class="score-rating">${this.getRating()}</div>
                <button class="btn btn-primary" id="playAgain">
                    <span>Play Again</span>
                    <i class="fas fa-redo"></i>
                </button>
            </div>
        `;
        
        document.getElementById('playAgain').addEventListener('click', () => this.start());
        
        if (window.soundSystem) {
            window.soundSystem.play(isNewRecord ? 'success' : (this.score > 50 ? 'success' : 'notification'));
        }
    }
    
    getRating() {
        if (this.score >= 100) return '🏆 Word Master!';
        if (this.score >= 70) return '⭐ Excellent!';
        if (this.score >= 40) return '👍 Great Job!';
        if (this.score >= 20) return '👌 Good Effort!';
        return '💪 Keep Practicing!';
    }
    
    cleanup() {
        this.isPlaying = false;
        if (this.gameLoop) {
            cancelAnimationFrame(this.gameLoop);
            this.gameLoop = null;
        }
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        // Use the bound functions to properly remove listeners
        document.removeEventListener('keydown', this.boundKeyPress);
        document.removeEventListener('keydown', this.boundLetterInput);
    }
}

// ===================================
// EXPOSE CLASS GLOBALLY FOR TESTING
// ===================================
window.WordTetris = WordTetris;
