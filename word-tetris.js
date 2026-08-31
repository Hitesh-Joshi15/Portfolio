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
        
        // High Score Manager — leaderboard grouped by difficulty × mode
        this.scoreManager = new HighScoreManager('wordTetris', 'higher', {
            variants: ['Normal · Infinite', 'Normal · Timed', 'Hard · Infinite', 'Hard · Timed']
        });
        
        // Letter frequency for better word formation (weighted towards vowels and common consonants)
        this.letterWeights = {
            'A': 8, 'E': 12, 'I': 8, 'O': 8, 'U': 4,
            'R': 6, 'T': 6, 'N': 6, 'S': 6, 'L': 4,
            'C': 3, 'D': 4, 'P': 3, 'M': 3, 'H': 3,
            'G': 3, 'B': 2, 'F': 2, 'Y': 2, 'W': 2,
            'K': 2, 'V': 2, 'X': 1, 'Z': 1, 'J': 1, 'Q': 1
        };
        
        // Tetromino shapes (smaller pieces) + domino. Single blocks are NOT in
        // the normal rotation — they only appear as gold helper pieces or as
        // stack-pressure relief once the board is over half full (_pickShape).
        this.shapes = [
            [[1, 1], [1, 1]], // O
            [[1, 1, 1]], // I
            [[1, 1, 0], [0, 1, 1]], // S
            [[0, 1, 1], [1, 1, 0]], // Z
            [[1, 1, 1], [0, 1, 0]], // T
            [[1, 1, 1], [1, 0, 0]], // L
            [[1, 1, 1], [0, 0, 1]], // J
            [[1, 1]], // Domino (2 blocks)
        ];
        
        // Common letter patterns that appear together in English words
        this.letterPatterns = [
            'AT', 'AN', 'AR', 'ER', 'ED', 'IN', 'IT', 'OR', 'ON',
            'EN', 'RE', 'TE', 'TH', 'NG', 'ST', 'ND', 'NT', 'LE',
            'ING', 'TER', 'ATE', 'EST', 'EAR', 'ART', 'ARD', 'AND',
            'CAT', 'BAT', 'RAT', 'HAT', 'MAT', 'SAT', 'FAT', 'PAT'
        ];
        
        // Common English words (3-6 letters). Doubles as the OFFLINE dictionary
        // (validateWord checks here first — the dictionary API is blocked on many
        // corporate/school networks), so breadth matters more than curation.
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
            'TOY', 'JOY', 'SOY', 'COW', 'HOW', 'NOW', 'ROW', 'LOW', 'WOW', 'OWL', 'OWN',
            'TWO', 'TOO', 'TOE', 'TOW', 'TIE', 'DIE', 'LIE', 'PIE', 'OIL', 'ICE', 'APE',
            'ANT', 'ARM', 'AIR', 'ASK', 'BAY', 'BIT', 'BUY', 'CRY', 'DRY', 'FLY', 'FRY',
            'TRY', 'SKY', 'SHY', 'SLY', 'SPY', 'EGG', 'END', 'EYE', 'FAR', 'FEW', 'FOX',
            'FUN', 'GAS', 'GEM', 'GYM', 'INK', 'IVY', 'JAM', 'JAR', 'JET', 'JOB', 'JOG',
            'KEY', 'KID', 'KIT', 'LAB', 'LAD', 'LAP', 'LAW', 'LAY', 'LEG', 'LET', 'LID',
            'LIP', 'LOG', 'MAP', 'MIX', 'MOB', 'MOM', 'MOW', 'MUD', 'MUG', 'NAP', 'NET',
            'NEW', 'NOD', 'OAK', 'OAR', 'OAT', 'ODD', 'OFF', 'OLD', 'ORB', 'ORE', 'OWE',
            'PAL', 'PAR', 'PAT', 'PAW', 'PAY', 'PEG', 'PET', 'PIT', 'POD', 'PRO', 'PUB',
            'RAG', 'RAM', 'RAP', 'RAW', 'RAY', 'RIB', 'RIM', 'RIP', 'ROB', 'ROD', 'ROT',
            'RYE', 'SAP', 'SAW', 'SAY', 'SET', 'SHE', 'SIP', 'SIR', 'SIT', 'SIX', 'SKI',
            'SOB', 'SON', 'SOW', 'SPA', 'SUB', 'SUM', 'TAB', 'TAD', 'TAG', 'TAP', 'TAX',
            'TIP', 'TON', 'TUB', 'TUG', 'URN', 'USE', 'VAT', 'VET', 'VOW', 'WAG', 'WAR',
            'WAX', 'WAY', 'WEB', 'WET', 'WHO', 'WHY', 'WIT', 'WOK', 'WON', 'YAK', 'YAM',
            'YES', 'YET', 'ZAP', 'ZIP', 'ZOO', 'DEN', 'DEW', 'DIM', 'DIP', 'DUE', 'DUG',
            'ELF', 'ERA', 'FOE', 'FOG', 'GAP', 'GEL', 'HUG', 'HUM', 'ICY', 'JAW', 'KIN',
            'COB', 'COD', 'COG', 'CON', 'COP', 'CUB', 'CUE', 'DAM', 'HIP', 'HIT', 'HIS',
            'HIM', 'HAS', 'GET', 'FIT', 'FIX', 'GUM', 'GUN', 'GUY', 'HAY',
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
            'BALL', 'BOOK', 'BOOT', 'BOTH', 'BOWL', 'CAKE', 'CALL', 'CALM', 'CAMP', 'CASH',
            'CAVE', 'CHAT', 'CHIP', 'CITY', 'CLAP', 'CLAY', 'CLIP', 'CLUB', 'CLUE', 'COAL',
            'CODE', 'COIN', 'COOK', 'COOL', 'COPY', 'CORE', 'CORN', 'COST', 'CREW', 'CROP',
            'DATE', 'DAWN', 'DEAL', 'DECK', 'DEEP', 'DEER', 'DESK', 'DICE', 'DIRT', 'DISH',
            'DOCK', 'DOLL', 'DOOR', 'DOWN', 'DRAW', 'DROP', 'DRUM', 'DUCK', 'DUST', 'EACH',
            'EARN', 'EAST', 'EASY', 'EDGE', 'EXIT', 'FACT', 'FAIR', 'FALL', 'FARM', 'FAST',
            'FEAR', 'FEEL', 'FEET', 'FELL', 'FELT', 'FILE', 'FILL', 'FILM', 'FIND', 'FIRE',
            'FISH', 'FIST', 'FIVE', 'FLAG', 'FLAT', 'FLIP', 'FLOW', 'FOAM', 'FOLD', 'FOOD',
            'FOOT', 'FORK', 'FORM', 'FORT', 'FOUR', 'FREE', 'FROG', 'FROM', 'FUEL', 'FULL',
            'GIFT', 'GIRL', 'GIVE', 'GLAD', 'GLOW', 'GLUE', 'GOAL', 'GOLD', 'GOLF', 'GOOD',
            'GRAB', 'GRAY', 'GRID', 'GRIN', 'GRIP', 'GROW', 'HAIR', 'HALF', 'HALL', 'HANG',
            'HARD', 'HARM', 'HAWK', 'HEAL', 'HEAR', 'HEAT', 'HEEL', 'HELD', 'HELP', 'HERE',
            'HERO', 'HIDE', 'HIGH', 'HILL', 'HINT', 'HOLD', 'HOLE', 'HOME', 'HOOK', 'HOPE',
            'HORN', 'HOUR', 'HUGE', 'HUNT', 'HURT', 'ICON', 'IDEA', 'INCH', 'IRON', 'ITEM',
            'JOKE', 'JUMP', 'JUST', 'KEEP', 'KEPT', 'KICK', 'KIND', 'KISS', 'KNEE', 'KNEW',
            'KNOW', 'LAKE', 'LAMB', 'LAMP', 'LAST', 'LATE', 'LAWN', 'LAZY', 'LEAF', 'LEAN',
            'LEAP', 'LEFT', 'LEND', 'LENS', 'LESS', 'LIFE', 'LIFT', 'LIKE', 'LIME', 'LION',
            'LIST', 'LIVE', 'LONG', 'LOOK', 'LOOP', 'LOSE', 'LOST', 'LOUD', 'LOVE', 'LUCK',
            'MAIL', 'MAIN', 'MAKE', 'MALL', 'MANY', 'MASK', 'MATH', 'MAZE', 'MEAL', 'MEET',
            'MELT', 'MENU', 'MESS', 'MILD', 'MILE', 'MILK', 'MIND', 'MINT', 'MISS', 'MIST',
            'MOOD', 'MOON', 'MORE', 'MOST', 'MOTH', 'MOVE', 'MUCH', 'MUST', 'NAIL', 'NAME',
            'NAVY', 'NEAR', 'NEAT', 'NECK', 'NEWS', 'NEXT', 'NICE', 'NINE', 'NOON', 'NOSE',
            'NOTE', 'ONCE', 'ONLY', 'OPEN', 'OVAL', 'OVEN', 'OVER', 'PAGE', 'PAID', 'PAIN',
            'PAIR', 'PALE', 'PALM', 'PASS', 'PAST', 'PATH', 'PEAK', 'PEAR', 'PICK', 'PILE',
            'PLAN', 'PLAY', 'PLOT', 'PLUG', 'PLUS', 'POEM', 'POET', 'POLE', 'POOL', 'POOR',
            'PORT', 'POST', 'POUR', 'PULL', 'PUMP', 'PUSH', 'QUIT', 'QUIZ', 'RAIL', 'RAIN',
            'RANK', 'RARE', 'RATE', 'RICE', 'RICH', 'RIDE', 'RIPE', 'RISE', 'RISK', 'ROAR',
            'ROLE', 'ROLL', 'ROOF', 'ROOM', 'ROOT', 'ROPE', 'ROSE', 'RULE', 'RUSH', 'RUST',
            'SAFE', 'SAID', 'SAIL', 'SALE', 'SALT', 'SAME', 'SAVE', 'SEAL', 'SEAT', 'SEEK',
            'SEEM', 'SEEN', 'SELF', 'SELL', 'SEND', 'SENT', 'SHIP', 'SHOE', 'SHOP', 'SHOT',
            'SHOW', 'SHUT', 'SICK', 'SIDE', 'SIGN', 'SILK', 'SIZE', 'SKIN', 'SKIP', 'SLIP',
            'SLOW', 'SNAP', 'SNOW', 'SOAP', 'SOFT', 'SOIL', 'SOLD', 'SOME', 'SONG', 'SOON',
            'SORT', 'SOUL', 'SOUP', 'SPIN', 'SPOT', 'STAY', 'STEM', 'STEP', 'STIR', 'STOP',
            'SUIT', 'SWIM', 'TAIL', 'TAKE', 'TALE', 'TALK', 'TALL', 'TANK', 'TAPE', 'TASK',
            'TAXI', 'TELL', 'TENT', 'TERM', 'TEXT', 'THAN', 'THAT', 'THEM', 'THEN', 'THEY',
            'THIS', 'TIDE', 'TIDY', 'TILE', 'TINY', 'TIRE', 'TONE', 'TOOK', 'TOOL', 'TORN',
            'TOUR', 'TOWN', 'TRAP', 'TREE', 'TRIM', 'TRIP', 'TRUE', 'TUNE', 'TWIN', 'TYPE',
            'UNIT', 'UPON', 'USED', 'USER', 'VERY', 'VIEW', 'VOTE', 'WAIT', 'WAKE', 'WALK',
            'WALL', 'WANT', 'WARM', 'WARN', 'WASH', 'WAVE', 'WEAK', 'WEAR', 'WEEK', 'WELL',
            'WENT', 'WERE', 'WHAT', 'WHEN', 'WIDE', 'WILD', 'WILL', 'WIND', 'WIRE', 'WISE',
            'WISH', 'WITH', 'WOKE', 'WOLF', 'WOOD', 'WOOL', 'WORE', 'WORK', 'WORM', 'WORN',
            'WRAP', 'YARD', 'YARN', 'YEAR', 'ZERO', 'ZONE',
            // 5 letter words
            'HEART', 'START', 'SMART', 'BEARD', 'BREAD', 'BREAK', 'GREAT', 'TREAT', 'STEAM',
            'LIGHT', 'RIGHT', 'NIGHT', 'FIGHT', 'SIGHT', 'TIGHT', 'BRING', 'STING', 'THING',
            'STAND', 'GRAND', 'BRAND', 'CRANE', 'PLANE', 'TRAIN', 'BRAIN', 'GRAIN', 'DRAIN',
            'STONE', 'PHONE', 'ALONE', 'PROUD', 'SOUND', 'ROUND', 'FOUND', 'MOUND', 'BOUND',
            'SCALE', 'SPACE', 'GRACE', 'TRACE', 'PLACE', 'TRADE', 'GRADE', 'SHADE', 'BLADE',
            'HOUSE', 'MOUSE', 'HORSE', 'NURSE', 'CURSE', 'PURSE', 'BURST', 'CRUST', 'TRUST',
            'WATER', 'LATER', 'PAPER', 'EARTH', 'NORTH', 'WORTH', 'BIRTH', 'THIRD', 'WORLD',
            'DRINK', 'THINK', 'THANK', 'BLANK', 'PLANT', 'GRANT', 'FRONT', 'POINT', 'JOINT',
            'ABOUT', 'AFTER', 'AGAIN', 'APPLE', 'BEACH', 'BLACK', 'BLOCK', 'BLOOD', 'BOARD',
            'CHAIR', 'CHESS', 'CLEAN', 'CLEAR', 'CLIMB', 'CLOCK', 'CLOSE', 'CLOUD', 'COUNT',
            'DANCE', 'DREAM', 'DRESS', 'DRIVE', 'EARLY', 'EIGHT', 'ENJOY', 'ENTER', 'EVERY',
            'FIELD', 'FLOOR', 'FRESH', 'FRUIT', 'GLASS', 'GREEN', 'GROUP', 'HAPPY', 'HEAVY',
            'LARGE', 'LAUGH', 'LEARN', 'LEVEL', 'LUCKY', 'MAGIC', 'MONEY', 'MONTH', 'MUSIC',
            'OCEAN', 'PARTY', 'PEACE', 'PIANO', 'PIZZA', 'POWER', 'QUEEN', 'QUICK', 'QUIET',
            'RADIO', 'RIVER', 'ROBOT', 'SEVEN', 'SHARE', 'SHARP', 'SHINE', 'SHIRT', 'SHORT',
            'SMALL', 'SMILE', 'SPEAK', 'SPEED', 'SPEND', 'SPORT', 'STAGE', 'STAIR', 'STORE',
            'STORM', 'STORY', 'STUDY', 'SUGAR', 'SWEET', 'TABLE', 'TEACH', 'TIGER', 'TODAY',
            'TOUCH', 'TOWER', 'VOICE', 'WATCH', 'WHEEL', 'WHITE', 'WOMAN', 'WRITE', 'YOUNG',
            // Coverage expansion (2026-08-31): every common 3-6 letter word we tested missing
            'ADD', 'AID', 'AIM', 'ANY', 'APP', 'ARC', 'ASH', 'BIO', 'BOO', 'BYE', 'CAB', 'CAP', 'CAW', 'DAB', 'DEL',
            'DIN', 'DUO', 'EBB', 'EEL', 'EGO', 'ELK', 'ELM', 'EMU', 'EVE', 'FAB', 'FAD', 'FEE', 'FLU', 'FUR', 'GAG',
            'GAL', 'GIG', 'GIN', 'GNU', 'HEX', 'HID', 'HOG', 'HUB', 'HUE', 'IMP', 'ION', 'IRE', 'JAB', 'JIG', 'JOT',
            'JUG', 'KEG', 'LAG', 'LOB', 'LOO', 'LOP', 'LUG', 'MAX', 'MID', 'MIN', 'MOO', 'NAB', 'NAG', 'NIL', 'NIP',
            'OFT', 'OHM', 'OPT', 'ORC', 'PEP', 'PEW', 'PLY', 'POX', 'PRY', 'PUN', 'PUS', 'RAD', 'REF', 'RIG', 'ROE',
            'RUB', 'RUE', 'RUM', 'RUT', 'SAC', 'SAG', 'SEW', 'SOD', 'SOP', 'SOT', 'STY', 'SUE', 'TAM', 'THY', 'TIC',
            'TOT', 'TUT', 'UMP', 'VIA', 'VIE', 'VIM', 'WAD', 'WAN', 'WEE', 'WOE', 'YAP', 'YAW', 'YEW', 'ZAG', 'ZEN', 'ZIG',
            'ABLE', 'ACID', 'AREA', 'ARMY', 'AUNT', 'AUTO', 'BABY', 'BACK', 'BAKE', 'BANK', 'BARN', 'BATH', 'BELL',
            'BELT', 'BEND', 'BENT', 'BIKE', 'BILL', 'BLOW', 'BLUE', 'BODY', 'BOMB', 'BONE', 'BORN', 'BOSS', 'BULK',
            'BULL', 'BUMP', 'BURY', 'BUSY', 'CAGE', 'CALF', 'CAME', 'CHEF', 'CHIN', 'CHOP', 'CITE', 'CLAN', 'CLAW',
            'COIL', 'COMB', 'COME', 'CORD', 'COZY', 'CRAB', 'CROW', 'CURL', 'DAMP', 'DARE', 'DART', 'DASH', 'DATA',
            'DEBT', 'DENT', 'DENY', 'DIAL', 'DIET', 'DINE', 'DIVE', 'DOES', 'DOME', 'DONE', 'DOSE', 'DOVE', 'DOZE',
            'DRAG', 'DRIP', 'DULL', 'DUMB', 'DUMP', 'DUSK', 'EDIT', 'ELSE', 'EVEN', 'EVER', 'EVIL', 'FAKE', 'FAME',
            'FATE', 'FERN', 'FIRM', 'FLEA', 'FLED', 'FLEW', 'FLEX', 'FOND', 'FONT', 'FOUL', 'GAIN', 'GANG', 'GAZE',
            'GEAR', 'GENE', 'GLEE', 'GONE', 'GOWN', 'GULF', 'GUST', 'HALT', 'HARE', 'HATE', 'HAUL', 'HAVE', 'HAZE',
            'HEAP', 'HERB', 'HERD', 'HERS', 'HIKE', 'HIRE', 'HISS', 'HIVE', 'HOLY', 'HOOD', 'HOOF', 'HOOT', 'HOST',
            'HOWL', 'HUNG', 'HUSH', 'HYMN', 'IDLE', 'IDOL', 'INTO', 'ITCH', 'JAIL', 'JAZZ', 'JOLT', 'JURY', 'KELP',
            'KEEN', 'KNIT', 'KNOB', 'KNOT', 'LAVA', 'LAZE', 'LEAK', 'LIAR', 'LOAF', 'LOAN', 'LOBE', 'LONE', 'LOOM',
            'LORD', 'LUMP', 'LUNG', 'LURE', 'LUSH', 'LYNX', 'MAID', 'MASS', 'MAST', 'MATE', 'MEEK', 'MEMO', 'MESH',
            'MICE', 'MODE', 'MOLD', 'MOLE', 'MONK', 'MOSS', 'MULE', 'MYTH', 'NOUN', 'OATH', 'OBEY', 'ODDS', 'OKAY',
            'OMIT', 'ONTO', 'OPAL', 'ORAL', 'OURS', 'PACK', 'PAWN', 'PEEK', 'PEEL', 'PERK', 'PEST', 'PLEA', 'PLUM',
            'POKE', 'POLL', 'PONY', 'PORK', 'POSE', 'PRAY', 'PREY', 'PROP', 'PUFF', 'QUAY', 'RAGE', 'RAID', 'RAKE',
            'RAMP', 'RANG', 'RASH', 'REAP', 'RELY', 'RENT', 'RIND', 'ROBE', 'RUIN', 'RUNG', 'SAGA', 'SAGE', 'SAKE',
            'SANG', 'SASH', 'SCAN', 'SCAR', 'SEAM', 'SHED', 'SHIN', 'SILO', 'SKID', 'SLAB', 'SLAM', 'SLED', 'SLID',
            'SLIM', 'SLOT', 'SLUG', 'SMOG', 'SNUG', 'SOAK', 'SOAR', 'SOLE', 'SOLO', 'SORE', 'SPAN', 'SPUR', 'STAB',
            'STEW', 'SUCH', 'SWAB', 'SWAN', 'SWAP', 'SWAY', 'TACT', 'TAME', 'TEAL', 'THAW', 'THUS', 'TICK', 'TILT',
            'TOMB', 'TORE', 'TOSS', 'TRAY', 'TREK', 'TROT', 'TUCK', 'TUSK', 'TWIG', 'UGLY', 'UNDO', 'URGE', 'VAIN',
            'VASE', 'VAST', 'VEIL', 'VEIN', 'VENT', 'VERB', 'VEST', 'VINE', 'VOID', 'VOLT', 'WAGE', 'WARD', 'WARY',
            'WASP', 'WEED', 'WEEP', 'WELD', 'WEPT', 'WHIM', 'WHIP', 'WICK', 'WIFE', 'WIPE', 'WOVE', 'YAWN', 'YOGA',
            'YOLK', 'YOUR', 'ZEAL', 'ZINC', 'ZOOM',
            'ANGEL', 'ANGRY', 'BADGE', 'BERRY', 'BLAZE', 'BLOOM', 'BONUS', 'BRAVE', 'BRICK', 'BRIDE', 'BROOM',
            'CABIN', 'CANDY', 'CARGO', 'CHAIN', 'CHALK', 'CHARM', 'CHEEK', 'CHEER', 'CHILD', 'CHILL', 'CLOTH',
            'COACH', 'COAST', 'CORAL', 'COUCH', 'CRAFT', 'CRASH', 'CREAM', 'CROWD', 'CROWN', 'DAISY', 'DELTA',
            'DIARY', 'DOUGH', 'DRIFT', 'EAGLE', 'ELBOW', 'EMPTY', 'FAIRY', 'FEAST', 'FENCE', 'FEVER', 'FLAME',
            'FLASH', 'FLOCK', 'FLOUR', 'FOCUS', 'FORGE', 'FRAME', 'FROST', 'GHOST', 'GIANT', 'GLOBE', 'GLORY',
            'GRAPE', 'GRASS', 'GREET', 'GUARD', 'GUEST', 'GUIDE', 'HONEY', 'HOTEL', 'HUMOR', 'IVORY', 'JELLY',
            'JEWEL', 'JUICE', 'KNIFE', 'LEMON', 'LUNCH', 'MAPLE', 'MARCH', 'MEDAL', 'MERCY', 'METAL', 'MIGHT',
            'MINER', 'MODEL', 'MOTOR', 'MOUNT', 'NOBLE', 'NOISE', 'OLIVE', 'ONION', 'ORBIT', 'OTTER', 'PANDA',
            'PEACH', 'PEARL', 'PENNY', 'PILOT', 'PLAZA', 'POUCH', 'PRIZE', 'PUPIL', 'QUEST', 'RAZOR', 'RIDGE',
            'ROAST', 'RUGBY', 'SALAD', 'SCARF', 'SCOUT', 'SHARK', 'SHEEP', 'SHELF', 'SHELL', 'SHOUT', 'SKATE',
            'SKULL', 'SLICE', 'SNAKE', 'SOLAR', 'SPARK', 'SPICE', 'SPOON', 'SQUAD', 'STEEL', 'STOOL', 'SWORD',
            'TENTH', 'THEME', 'TIDAL', 'TOAST', 'TORCH', 'TOWEL', 'TRACK', 'TRIBE', 'TRICK', 'TRUCK', 'TRUNK',
            'TULIP', 'UNCLE', 'UNION', 'VAPOR', 'VENOM', 'VIVID', 'WAGON', 'WHALE', 'WHEAT', 'WITCH', 'WOUND',
            'YACHT', 'YEAST', 'ZEBRA',
            'ACHE', 'AGED', 'AGO', 'ALSO', 'AMID', 'ARCH', 'ATOM', 'AXIS', 'BEAM', 'EDGY', 'EXAM',
            'ANKLE', 'APART', 'APPLY', 'APRON', 'ARENA', 'ARGUE', 'ARISE', 'AROMA', 'ARROW', 'ATLAS', 'AWAKE',
            'AWARD', 'AWFUL', 'BAGEL', 'BAKED', 'BALDY', 'BANJO', 'BARGE', 'BASIL', 'BATCH', 'BATON', 'BEAST',
            'BEGAN', 'BEGUN', 'BEIGE', 'BELLY', 'BENCH', 'BISON', 'BLAND', 'BLAST', 'BLEED', 'BLEND', 'BLESS',
            'BLIMP', 'BLINK', 'BLISS', 'BLOAT', 'BLOWN', 'BLUFF', 'BLUNT', 'BLURT', 'BOAST', 'BOOTH', 'BOOST',
            'BOUGH', 'BRAID', 'BRAKE', 'BRASS', 'BREED', 'BRIBE', 'BRIEF', 'BRINE', 'BRINK', 'BRISK', 'BROAD',
            'BROIL', 'BROKE', 'BROOK', 'BROTH', 'BROWN', 'BRUSH', 'BUDGE', 'BUILD', 'BULGE', 'BUNCH', 'BUNNY',
            'BURNT', 'BUSHY', 'CACHE', 'CADET', 'CAMEL', 'CANAL', 'CANOE', 'CAROL', 'CARVE', 'CATCH', 'CATER',
            'CEASE', 'CEDAR', 'CHAMP', 'CHANT', 'CHAOS', 'CHART', 'CHASE', 'CHEAP', 'CHEAT', 'CHECK', 'CHEST',
            'CHIEF', 'CHIME', 'CHIRP', 'CHOIR', 'CHOKE', 'CHORD', 'CHORE', 'CHOSE', 'CHUNK', 'CHURN', 'CIDER',
            'CIGAR', 'CIVIC', 'CIVIL', 'CLAIM', 'CLAMP', 'CLASH', 'CLASP', 'CLASS', 'CLERK', 'CLICK', 'CLIFF',
            'CLING', 'CLOAK', 'CLONE', 'CLOWN', 'CLUMP', 'COBRA', 'COCOA', 'COLON', 'COLOR', 'COMET', 'COUGH',
            'COURT', 'COVER', 'CRAMP', 'CRATE', 'CRAVE', 'CRAWL', 'CRAZE', 'CREAK', 'CREEK', 'CREPT', 'CREST',
            'CRIED', 'CRISP', 'CROAK', 'CROSS', 'CRUDE', 'CRUEL', 'CRUMB', 'CRUSH', 'CURVE', 'CYCLE', 'DAILY',
            'DAIRY', 'DECAL', 'DECAY', 'DENIM', 'DEPOT', 'DEPTH', 'DERBY', 'DETER', 'DEVIL', 'DIGIT', 'DINER',
            'DITCH', 'DIVER', 'DIZZY', 'DODGE', 'DONOR', 'DOUBT', 'DOZEN', 'DRAFT', 'DRAKE', 'DRAMA', 'DRANK',
            'DRAPE', 'DRAWL', 'DRAWN', 'DREAD', 'DRIED', 'DRILL', 'DRONE', 'DROOL', 'DROVE', 'DROWN', 'DRUNK',
            'DRYER', 'DUSTY', 'DWELL', 'DYING', 'EAGER', 'EASEL', 'EBONY', 'ELDER', 'ELECT', 'ELITE', 'ELOPE',
            'ENEMY', 'ENTRY', 'EQUAL', 'ERASE', 'ERROR', 'ESSAY', 'EVENT', 'EXACT', 'EXCEL', 'EXERT', 'EXILE',
            'EXIST', 'EXTRA', 'FABLE', 'FAINT', 'FAITH', 'FALSE', 'FANCY', 'FATAL', 'FAULT', 'FAVOR', 'FERRY',
            'FIBER', 'FIEND', 'FIERY', 'FIFTH', 'FIFTY', 'FILTH', 'FINAL', 'FIRST', 'FLAKE', 'FLANK', 'FLARE',
            'FLASK', 'FLEET', 'FLESH', 'FLING', 'FLINT', 'FLOAT', 'FLOOD', 'FLOWN', 'FLUID', 'FLUNG', 'FLUSH',
            'FLUTE', 'FOAMY', 'FOCAL', 'FOGGY', 'FOLLY', 'FORCE', 'FORTH', 'FORTY', 'FORUM', 'FRAIL', 'FRAUD',
            'FREED', 'FRIED', 'FRILL', 'FROWN', 'FROZE', 'FUDGE', 'FULLY', 'FUNGI', 'FUNKY', 'FUROR', 'FUZZY',
            'GAUGE', 'GAVEL', 'GECKO', 'GENRE', 'GIDDY', 'GIVEN', 'GIVER', 'GLAND', 'GLARE', 'GLAZE', 'GLEAM',
            'GLIDE', 'GLOOM', 'GLOSS', 'GLOVE', 'GNOME', 'GOING', 'GOOSE', 'GORGE', 'GRAPH', 'GRASP', 'GRAVE',
            'GRAVY', 'GRAZE', 'GREED', 'GRIEF', 'GRILL', 'GRIME', 'GRIND', 'GRIPE', 'GROAN', 'GROIN', 'GROOM',
            'GROPE', 'GROSS', 'GROVE', 'GROWL', 'GROWN', 'GRUNT', 'GUESS', 'GUILD', 'GUILT', 'GULLY', 'GUSTO',
            'HABIT', 'HANDY', 'HARSH', 'HASTE', 'HATCH', 'HAUNT', 'HAVEN', 'HAVOC', 'HAZEL', 'HEDGE', 'HEFTY',
            'HELLO', 'HENCE', 'HERON', 'HILLY', 'HINGE', 'HIPPO', 'HITCH', 'HOBBY', 'HOIST', 'HOLLY', 'HONOR',
            'HOUND', 'HOVER', 'HUMAN', 'HUMID', 'HUNCH', 'HURRY', 'HUSKY', 'HYENA', 'IDEAL', 'IDIOM', 'IGLOO',
            'IMAGE', 'IMPLY', 'INDEX', 'INEPT', 'INERT', 'INFER', 'INGOT', 'INNER', 'INPUT', 'IRONY', 'ISSUE',
            'ITCHY', 'JOLLY', 'JUDGE', 'JUICY', 'JUMBO', 'KAYAK', 'KIOSK', 'KNACK', 'KNEAD', 'KNEEL', 'KNELT',
            'KNOCK', 'KNOWN', 'KOALA', 'LABEL', 'LABOR', 'LANCE', 'LASSO', 'LATCH', 'LAYER', 'LEASE', 'LEASH',
            'LEAVE', 'LEDGE', 'LEGAL', 'LEVER', 'LIKEN', 'LILAC', 'LIMIT', 'LINEN', 'LIVER', 'LLAMA', 'LOBBY',
            'LOCAL', 'LODGE', 'LOFTY', 'LOGIC', 'LOOSE', 'LORRY', 'LOWER', 'LOYAL', 'LUNAR', 'LUNGE', 'LYRIC',
            'MACHO', 'MADAM', 'MAJOR', 'MANGO', 'MANOR', 'MARSH', 'MATCH', 'MAYOR', 'MEANT', 'MEDIA', 'MELON',
            'MERGE', 'MERIT', 'MERRY', 'METER', 'MIDGE', 'MIMIC', 'MINCE', 'MINOR', 'MINTY', 'MINUS', 'MIRTH',
            'MISER', 'MIXED', 'MOIST', 'MOOSE', 'MORAL', 'MOTEL', 'MOTIF', 'MOTTO', 'MOURN', 'MOUTH', 'MOVED',
            'MOVIE', 'MOWER', 'MUDDY', 'MULCH', 'MUMMY', 'MURAL', 'MUSHY', 'MUSTY', 'BEACON', 'BORROW',
            'NAIVE', 'NANNY', 'NASAL', 'NASTY', 'NAVAL', 'NERVE', 'NEVER', 'NEWLY', 'NICHE', 'NIECE', 'NINTH',
            'NOMAD', 'NOTCH', 'NOVEL', 'NYLON', 'OASIS', 'OCCUR', 'ODDLY', 'OFFER', 'OFTEN', 'OLDER', 'OPERA',
            'ORGAN', 'OTHER', 'OUGHT', 'OUNCE', 'OUTER', 'OWNER', 'OXIDE', 'OZONE', 'PADDY', 'PAGAN', 'PAINT',
            'PANEL', 'PANIC', 'PANSY', 'PARKA', 'PASTA', 'PASTE', 'PATCH', 'PATIO', 'PAUSE', 'PEDAL', 'PENAL',
            'PERCH', 'PERIL', 'PESKY', 'PETAL', 'PHASE', 'PHOTO', 'PICKY', 'PIECE', 'PIETY', 'PINCH', 'PINEY',
            'PIVOT', 'PIXEL', 'PLAIN', 'PLANK', 'PLATE', 'PLEAD', 'PLUCK', 'PLUMB', 'PLUME', 'PLUMP', 'PLUSH',
            'POLAR', 'POLKA', 'POLYP', 'POPPY', 'PORCH', 'POSSE', 'POUND', 'PRANK', 'PRAWN', 'PRESS', 'PRICE',
            'PRIDE', 'PRIME', 'PRINT', 'PRIOR', 'PRISM', 'PRIVY', 'PROBE', 'PRONE', 'PRONG', 'PROOF', 'PROSE',
            'PROVE', 'PROWL', 'PROXY', 'PRUNE', 'PSALM', 'PULSE', 'PUNCH', 'PUPPY', 'PUREE', 'QUACK', 'QUAIL',
            'QUAKE', 'QUALM', 'QUART', 'QUERY', 'QUEUE', 'QUILL', 'QUILT', 'QUIRK', 'QUOTA', 'QUOTE', 'RABBI',
            'RADAR', 'RAINY', 'RAISE', 'RALLY', 'RANCH', 'RANGE', 'RAPID', 'RATIO', 'RAVEN', 'REACH', 'REACT',
            'READY', 'REALM', 'REBEL', 'RECAP', 'REFER', 'REIGN', 'RELAX', 'RELAY', 'REMIT', 'RENAL', 'REPAY',
            'REPLY', 'RERUN', 'RESET', 'RESIN', 'RETRO', 'RHINO', 'RHYME', 'RIDER', 'RIFLE', 'RIGID', 'RINSE',
            'RIPEN', 'RISEN', 'RISER', 'RIVAL', 'ROBIN', 'ROCKY', 'ROGUE', 'ROOMY', 'ROOST', 'ROTOR', 'ROUGE',
            'ROUGH', 'ROUSE', 'ROUTE', 'ROVER', 'ROYAL', 'RUDDY', 'RUGGED', 'RULER', 'RUMOR', 'RUPEE', 'RURAL',
            'RUSTY', 'SADLY', 'SAINT', 'SALLY', 'SALON', 'SALSA', 'SALTY', 'SANDY', 'SATIN', 'SAUCE', 'SAUNA',
            'SAVOR', 'SCALD', 'SCALP', 'SCAMP', 'SCANT', 'SCARE', 'SCENE', 'SCENT', 'SCOFF', 'SCOLD', 'SCONE',
            'SCOOP', 'SCOPE', 'SCORE', 'SCORN', 'SCRAP', 'SCREW', 'SCRUB', 'SEDAN', 'SEIZE', 'SENSE', 'SERUM',
            'SERVE', 'SETUP', 'SEVER', 'SHACK', 'SHADY', 'SHAFT', 'SHAKE', 'SHAKY', 'SHALE', 'SHAME', 'SHANK',
            'SHAPE', 'SHARD', 'SHAVE', 'SHAWL', 'SHEAR', 'SHEEN', 'SHEET', 'SHEIK', 'SHELVE', 'SHIFT', 'SHINY',
            'SHIRE', 'SHOAL', 'SHOCK', 'SHONE', 'SHOOK', 'SHOOT', 'SHORE', 'SHORN', 'SHOVE', 'SHOWN', 'SHOWY',
            'SHRED', 'SHREW', 'SHRUB', 'SHRUG', 'SHUCK', 'SHUSH', 'SIEGE', 'SILKY', 'SILLY', 'SINCE', 'SINEW',
            'SINGE', 'SIREN', 'SISSY', 'SIXTH', 'SIXTY', 'SKIFF', 'SKILL', 'SKIMP', 'SKIRT', 'SKUNK', 'SLACK',
            'SLAIN', 'SLANG', 'SLANT', 'SLASH', 'SLATE', 'SLEEK', 'SLEEP', 'SLEET', 'SLEPT', 'SLICK', 'SLIDE',
            'SLIME', 'SLIMY', 'SLING', 'SLINK', 'SLOPE', 'SLOSH', 'SLOTH', 'SLUMP', 'SLUNG', 'SLUNK', 'SLUSH',
            'SMACK', 'SMASH', 'SMEAR', 'SMELL', 'SMELT', 'SMIRK', 'SMITE', 'SMITH', 'SMOCK', 'SMOKE', 'SMOKY',
            'SNACK', 'SNAIL', 'SNARE', 'SNARL', 'SNEAK', 'SNEER', 'SNIDE', 'SNIFF', 'SNIPE', 'SNOOP', 'SNORE',
            'SNORT', 'SNOUT', 'SNOWY', 'SNUCK', 'SOBER', 'SOGGY', 'SOLID', 'SOLVE', 'SONIC', 'SOOTH', 'SORRY',
            'SOUTH', 'SPADE', 'SPARE', 'SPASM', 'SPAWN', 'SPEAR', 'SPECK', 'SPELL', 'SPENT', 'SPERM', 'SPIKE',
            'SPILL', 'SPINE', 'SPIRE', 'SPITE', 'SPLAT', 'SPLIT', 'SPOIL', 'SPOKE', 'SPOOF', 'SPOOK', 'SPOOL',
            'SPORE', 'SPOUT', 'SPRAY', 'SPREE', 'SPRIG', 'SPUNK', 'SPURN', 'SPURT', 'SQUAT', 'SQUIB', 'STAFF',
            'STAID', 'STAIN', 'STAKE', 'STALE', 'STALK', 'STALL', 'STAMP', 'STANK', 'STARE', 'STARK', 'STASH',
            'STATE', 'STAVE', 'STEAD', 'STEAK', 'STEAL', 'STEED', 'STEEP', 'STEER', 'STEIN', 'STERN', 'STICK',
            'STIFF', 'STILL', 'STILT', 'STINK', 'STINT', 'STOCK', 'STOIC', 'STOKE', 'STOLE', 'STOMP', 'STONY',
            'STOOD', 'STOOP', 'STORK', 'STOUT', 'STOVE', 'STRAP', 'STRAW', 'STRAY', 'STRIP', 'STRUT', 'STUCK',
            'STUFF', 'STUMP', 'STUNG', 'STUNK', 'STUNT', 'STYLE', 'SUAVE', 'SUEDE', 'SUITE', 'SULKY', 'SUNNY',
            'SUPER', 'SURGE', 'SURLY', 'SWAMI', 'SWAMP', 'SWARM', 'SWASH', 'SWATH', 'SWEAR', 'SWEAT', 'SWEEP',
            'SWELL', 'SWEPT', 'SWIFT', 'SWINE', 'SWING', 'SWIPE', 'SWIRL', 'SWISH', 'SWOON', 'SWOOP', 'SWORE',
            'SWORN', 'SWUNG', 'SYRUP', 'TABBY', 'TABOO', 'TACIT', 'TACKY', 'TAFFY', 'TAINT', 'TAKEN', 'TAKER',
            'TALLY', 'TALON', 'TANGO', 'TANGY', 'TAPER', 'TAPIR', 'TARDY', 'TAROT', 'TASTE', 'TASTY', 'TATTY',
            'TAUNT', 'TAWNY', 'TEARY', 'TEASE', 'TEDDY', 'TEETH', 'TEMPO', 'TENOR', 'TENSE', 'TEPEE', 'TEPID',
            'TERRA', 'TERSE', 'THEFT', 'THEIR', 'THERE', 'THESE', 'THICK', 'THIEF', 'THIGH', 'THONG', 'THORN',
            'THOSE', 'THREE', 'THREW', 'THROB', 'THROW', 'THUMB', 'THUMP', 'TIARA', 'TILDE', 'TIMER', 'TIMID',
            'TIPSY', 'TITLE', 'TOKEN', 'TONAL', 'TONIC', 'TOOTH', 'TOPAZ', 'TOPIC', 'TORSO', 'TOTAL', 'TOTEM',
            'TOUGH', 'TOXIC', 'TOXIN', 'TRAIL', 'TRAIT', 'TRAMP', 'TRASH', 'TRAWL', 'TREAD', 'TREND', 'TRIAD',
            'TRIAL', 'TRICE', 'TRIED', 'TRIPE', 'TRITE', 'TROLL', 'TROOP', 'TROPE', 'TROUT', 'TROVE', 'TRUCE',
            'TRULY', 'TRUTH', 'TRYST', 'TUBBY', 'TULLE', 'TUMOR', 'TUNIC', 'TURBO', 'TUTOR', 'TWANG', 'TWEAK',
            'TWEED', 'TWEET', 'TWICE', 'TWINE', 'TWIRL', 'TWIST', 'UDDER', 'ULCER', 'ULTRA', 'UMBRA', 'UNCUT',
            'UNDER', 'UNDID', 'UNDUE', 'UNFED', 'UNFIT', 'UNIFY', 'UNITE', 'UNITY', 'UNLIT', 'UNMET', 'UNSET',
            'UNTIE', 'UNTIL', 'UNWED', 'UNZIP', 'UPPER', 'UPSET', 'URBAN', 'USAGE', 'USHER', 'USUAL', 'UTTER',
            'VAGUE', 'VALET', 'VALID', 'VALOR', 'VALUE', 'VALVE', 'VAULT', 'VAUNT', 'VEGAN', 'VENUE', 'VERGE',
            'VERSE', 'VERSO', 'VERVE', 'VICAR', 'VIDEO', 'VIGIL', 'VIGOR', 'VILLA', 'VINYL', 'VIOLA', 'VIPER',
            'VIRAL', 'VIRUS', 'VISIT', 'VISOR', 'VISTA', 'VITAL', 'VIXEN', 'VOCAL', 'VODKA', 'VOGUE', 'VOMIT',
            'VOTER', 'VOUCH', 'VOWEL', 'VYING', 'WACKY', 'WAFER', 'WAGER', 'WAIST', 'WAIVE', 'WALTZ', 'WARTY',
            'WASTE', 'WAVER', 'WAXEN', 'WEARY', 'WEAVE', 'WEDGE', 'WEEDY', 'WEIGH', 'WEIRD', 'WELSH', 'WENCH',
            'WHACK', 'WHARF', 'WHELP', 'WHERE', 'WHICH', 'WHIFF', 'WHILE', 'WHINE', 'WHINY', 'WHIRL', 'WHISK',
            'WHOLE', 'WHOOP', 'WHOSE', 'WIDEN', 'WIDER', 'WIDOW', 'WIDTH', 'WIELD', 'WIGHT', 'WILLOW', 'WINCE',
            'WINCH', 'WINDY', 'WISER', 'WISPY', 'WITTY', 'WOKEN', 'WOMEN', 'WOODY', 'WOOER', 'WOOLY', 'WOOZY',
            'WORDY', 'WORRY', 'WORSE', 'WORST', 'WOULD', 'WOVEN', 'WRACK', 'WRATH', 'WREAK', 'WRECK', 'WREST',
            'WRING', 'WRIST', 'WRONG', 'WROTE', 'WRUNG', 'YEARN', 'YIELD', 'YOUTH', 'ZESTY'
        ];
        
        // Dictionary cache — API-validated words persist per device, so a word
        // only ever needs the network ONCE, then works offline forever.
        this.validWords = new Set();
        this.checkedWords = new Map();
        try {
            JSON.parse(localStorage.getItem('wt_valid_words') || '[]')
                .forEach(w => this.checkedWords.set(w, true));
        } catch { /* corrupted cache — start fresh */ }
        this.availableWords = []; // Words currently on board
        
        // Track letter cycling for single blocks
        this.isSingleBlock = false;
        this.currentLetterIndex = 0;
        this.highlightedBlocks = []; // Track highlighted blocks for visual feedback
        this.lastSpawnAssist = false; // helper pieces never spawn twice in a row
        
        // Bind event handlers once
        this.boundKeyPress = this.handleKeyPress.bind(this);
        this.boundLetterInput = this.handleLetterInput.bind(this);
    }
    
    async start() {
        // Make scoreManager globally accessible for leaderboard button
        window.currentScoreManager = this.scoreManager;
        
        // Get high scores (async because it fetches from Firebase)
        const highScoreHTML = await this.scoreManager.getStartScreenHTML();
        if (this.hub.currentGame !== this) return; // player left during the fetch
        
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
                                <button class="mode-btn ${this.difficulty === 'normal' ? 'active' : ''}" data-difficulty="normal">
                                    <i class="fas fa-smile"></i>
                                    <span>Normal</span>
                                    <small>Constant speed</small>
                                </button>
                                <button class="mode-btn ${this.difficulty === 'hard' ? 'active' : ''}" data-difficulty="hard">
                                    <i class="fas fa-fire"></i>
                                    <span>Hard</span>
                                    <small>Increasing speed</small>
                                </button>
                            </div>
                        </div>
                        
                        <div class="game-mode-selector">
                            <h5>Select Mode:</h5>
                            <div class="mode-buttons">
                                <button class="mode-btn ${this.gameMode === 'infinite' ? 'active' : ''}" data-mode="infinite">
                                    <i class="fas fa-infinity"></i>
                                    <span>Infinite</span>
                                    <small>Play until stack reaches top</small>
                                </button>
                                <button class="mode-btn ${this.gameMode === 'timed' ? 'active' : ''}" data-mode="timed">
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
                            <div class="rule-item">
                                <i class="fas fa-check-circle"></i>
                                <span>Gold helper blocks always fit somewhere — find where, rotate if needed</span>
                            </div>
                            <div class="rule-item">
                                <i class="fas fa-check-circle"></i>
                                <span>On single blocks, ↑ cycles the letter</span>
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
        this.lastSpawnAssist = false;
        
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
        const hasVowel = letters.some(row => row.some(l => l && vowels.includes(l)));
        
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
    
    // Contiguous letter runs (2+) on the board, horizontal and vertical.
    _scanRuns() {
        const runs = [];
        for (let y = 0; y < this.gridHeight; y++) {
            let x = 0;
            while (x < this.gridWidth) {
                if (this.grid[y][x]) {
                    let x2 = x, s = '';
                    while (x2 < this.gridWidth && this.grid[y][x2]) { s += this.grid[y][x2].letter; x2++; }
                    if (s.length >= 2) runs.push({ s, dir: 'h', x, y, end: x2 - 1 });
                    x = x2;
                } else x++;
            }
        }
        for (let x = 0; x < this.gridWidth; x++) {
            let y = 0;
            while (y < this.gridHeight) {
                if (this.grid[y][x]) {
                    let y2 = y, s = '';
                    while (y2 < this.gridHeight && this.grid[y2][x]) { s += this.grid[y2][x].letter; y2++; }
                    if (s.length >= 2) runs.push({ s, dir: 'v', x, y, end: y2 - 1 });
                    y = y2;
                } else y++;
            }
        }
        return runs;
    }

    // Row a dropped block settles at in column x (gridHeight-1 = floor).
    _landingRow(x) {
        for (let y = 0; y < this.gridHeight; y++) {
            if (this.grid[y][x]) return y - 1;
        }
        return this.gridHeight - 1;
    }

    // 1-3 letter strings that finish a wordBank word at an open end of a board
    // run AND can physically get there: the piece (flat, or rotated for vertical
    // targets) must actually LAND on the target cells when dropped.
    _findAssistCandidates() {
        const out = new Set();
        const landing = [];
        for (let x = 0; x < this.gridWidth; x++) landing[x] = this._landingRow(x);
        
        // flat piece resting exactly on row y across columns x0..x0+m-1
        const hPlaceable = (x0, m, y) => {
            if (x0 < 0 || x0 + m > this.gridWidth) return false;
            let minLand = Infinity;
            for (let x = x0; x < x0 + m; x++) minLand = Math.min(minLand, landing[x]);
            return minLand === y;
        };
        // rotated piece stacking up column x with its bottom block on yBottom
        const vPlaceable = (x, m, yBottom) => yBottom - m + 1 >= 0 && landing[x] === yBottom;
        
        for (const run of this._scanRuns()) {
            for (const word of this.wordBank) {
                if (word.length <= 2) continue;
                for (let k = 2; k <= Math.min(run.s.length, word.length - 1); k++) {
                    // tail: word starts with the run's last k letters, missing letters extend past the run's end
                    const tail = word.startsWith(run.s.slice(-k)) ? word.slice(k) : null;
                    if (tail && tail.length >= 1 && tail.length <= 3) {
                        // below a vertical run is buried — only horizontal tails are droppable
                        if (run.dir === 'h' && hPlaceable(run.end + 1, tail.length, run.y)) out.add(tail);
                    }
                    // head: word ends with the run's first k letters, missing letters sit before the run
                    const head = word.endsWith(run.s.slice(0, k)) ? word.slice(0, word.length - k) : null;
                    if (head && head.length >= 1 && head.length <= 3) {
                        const ok = run.dir === 'h'
                            ? hPlaceable(run.x - head.length, head.length, run.y)
                            : vPlaceable(run.x, head.length, run.y - 1);
                        if (ok) out.add(head);
                    }
                }
            }
        }
        return [...out];
    }

    // Occasionally spawn a gold 1-3 block piece carrying letters that finish
    // a word already forming on the board.
    _maybeAssistPiece() {
        if (this.lastSpawnAssist) return null;
        if (Math.random() >= 0.35) return null;
        let placed = 0;
        for (let y = 0; y < this.gridHeight; y++) {
            for (let x = 0; x < this.gridWidth; x++) {
                if (this.grid[y][x]) placed++;
            }
        }
        if (placed < 2) return null;
        const candidates = this._findAssistCandidates();
        if (!candidates.length) return null;
        const letters = candidates[Math.floor(Math.random() * candidates.length)];
        const shapesByLen = { 1: [[1]], 2: [[1, 1]], 3: [[1, 1, 1]] };
        return { shape: shapesByLen[letters.length], letters: [letters.split('')] };
    }

    // 0 (empty board) .. 1 (stack at the top)
    _stackRatio() {
        for (let y = 0; y < this.gridHeight; y++) {
            for (let x = 0; x < this.gridWidth; x++) {
                if (this.grid[y][x]) return (this.gridHeight - y) / this.gridHeight;
            }
        }
        return 0;
    }

    // Favor small pieces once the stack passes half the board.
    _pickShape() {
        if (this._stackRatio() > 0.5 && Math.random() < 0.45) {
            const small = [[[1, 1, 1]], [[1, 1]], [[1]]];
            return small[Math.floor(Math.random() * small.length)];
        }
        return this.shapes[Math.floor(Math.random() * this.shapes.length)];
    }

    spawnPiece() {
        const assist = this._maybeAssistPiece();
        this.lastSpawnAssist = !!assist;
        
        let shape, letters;
        if (assist) {
            ({ shape, letters } = assist);
        } else {
            shape = this._pickShape();
            letters = [];
        }
        
        // Check if single block
        this.isSingleBlock = (shape.length === 1 && shape[0].length === 1);
        if (this.isSingleBlock) this.currentLetterIndex = 0;
        
        if (!assist) {
            if (this.isSingleBlock) {
                // Single block starts with a random letter
                letters[0] = [this.getRandomLetter()];
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
        }
        
        this.currentPiece = {
            shape: shape,
            letters: letters,
            x: Math.floor(this.gridWidth / 2) - Math.floor(shape[0].length / 2),
            y: 0,
            assist: !!assist,
            color: assist ? 'hsl(46, 100%, 60%)' : `hsl(${Math.random() * 360}, 70%, 60%)`
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
        
        // Local word bank first — Enter must work even with no network.
        if (this.wordBank.includes(word.toUpperCase())) return true;
        
        if (this.checkedWords.has(word)) {
            return this.checkedWords.get(word);
        }
        
        try {
            const ctrl = new AbortController();
            const timeout = setTimeout(() => ctrl.abort(), 4000); // flaky network must not hang Enter
            const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`, { signal: ctrl.signal });
            clearTimeout(timeout);
            const isValid = response.ok;
            this.checkedWords.set(word, isValid);
            if (isValid) {
                try {
                    const saved = JSON.parse(localStorage.getItem('wt_valid_words') || '[]');
                    if (!saved.includes(word)) {
                        saved.push(word);
                        localStorage.setItem('wt_valid_words', JSON.stringify(saved.slice(-500)));
                    }
                } catch { /* storage full/blocked — cache stays session-only */ }
            }
            return isValid;
        } catch (error) {
            // Network failed/blocked — the word bank above is the offline
            // dictionary; don't cache this as invalid (network may recover).
            return false;
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
        if (!wordElement) return;
        wordElement.classList.add('error-shake');
        wordElement.textContent = message; // the shake alone was invisible feedback
        setTimeout(() => {
            wordElement.classList.remove('error-shake');
            this.updateWordDisplay();
        }, 900);
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
        
        // Submit to global leaderboard, tagged with the played category
        const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
        const variantLabel = `${cap(this.difficulty)} · ${cap(this.gameMode)}`;
        this.scoreManager.submitGlobalScore(this.score, variantLabel)
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
                <div class="highscore-info">
                    <i class="fas fa-sliders-h"></i> ${variantLabel}
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
