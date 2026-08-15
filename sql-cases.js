// ===================================
// SQL DETECTIVE — TUTORIALS & CASE FILES
// Used by SQLDetective (typing-game.js). Loaded before it in index.html.
//
// Shape: { id, title, brief, lesson?, question, answer, hint,
//          par, parQueries, tables }
// - tables: name -> { columns: [...], rows: [[...], ...] } (all data synthetic)
// - parQueries: the optimal query chain; par MUST equal parQueries.length
// - answer: checked case-insensitively against the player's final submission
// - Engine subset: SELECT cols|* FROM table [WHERE c (AND|OR c)*]
//   [ORDER BY col [ASC|DESC]] [LIMIT n]; ops = != <> > < >= <= LIKE ('%'/'_')
// - Keep string values free of the words ' and ' / ' or ' (WHERE splitter).
// ===================================

// ---------- TUTORIALS (one random lesson per session, unscored) ----------
window.SQL_TUTORIALS = [
    {
        id: 'sqlt-select', title: 'Lesson: Reading a Table',
        lesson: 'SELECT * FROM table shows every column of every row. The * means "all columns".',
        brief: 'The fruits table holds the market stock. Look at all of it.',
        question: 'What is the price of the mango?', answer: '30',
        hint: "SELECT * FROM fruits",
        par: 1, parQueries: ["SELECT * FROM fruits"],
        tables: { fruits: { columns: ['id', 'name', 'price'], rows: [[1, 'apple', 20], [2, 'mango', 30], [3, 'banana', 10], [4, 'cherry', 90]] } }
    },
    {
        id: 'sqlt-columns', title: 'Lesson: Picking Columns',
        lesson: 'List column names instead of * to see only what you need: SELECT name, price FROM gadgets.',
        brief: 'Marketing wants a clean price list — just names and prices.',
        question: 'Which gadget costs 999?', answer: 'AeroPod',
        hint: "SELECT name, price FROM gadgets",
        par: 1, parQueries: ["SELECT name, price FROM gadgets"],
        tables: { gadgets: { columns: ['id', 'name', 'price', 'stock'], rows: [[1, 'VoltPad', 499, 12], [2, 'AeroPod', 999, 3], [3, 'ZipCam', 249, 40]] } }
    },
    {
        id: 'sqlt-where', title: 'Lesson: Filtering Rows',
        lesson: "WHERE keeps only matching rows: SELECT * FROM crew WHERE role = 'pilot'. Text needs 'quotes'.",
        brief: 'Find the ship crew member whose role is pilot.',
        question: 'Who is the pilot?', answer: 'Jia Wen',
        hint: "SELECT * FROM crew WHERE role = 'pilot'",
        par: 1, parQueries: ["SELECT * FROM crew WHERE role = 'pilot'"],
        tables: { crew: { columns: ['name', 'role', 'deck'], rows: [['Ada Lin', 'engineer', 2], ['Jia Wen', 'pilot', 1], ['Bo Reyes', 'medic', 3], ['Kai Moss', 'cook', 2]] } }
    },
    {
        id: 'sqlt-greater', title: 'Lesson: Comparing Numbers',
        lesson: 'WHERE works with numbers too: > < >= <= compare values without quotes.',
        brief: 'One greenhouse plant grew past 100 cm.',
        question: 'Which plant is taller than 100 cm?', answer: 'Bamboo',
        hint: 'SELECT * FROM plants WHERE height > 100',
        par: 1, parQueries: ['SELECT * FROM plants WHERE height > 100'],
        tables: { plants: { columns: ['name', 'height', 'pot'], rows: [['Fern', 40, 'A1'], ['Bamboo', 180, 'B2'], ['Cactus', 25, 'C3'], ['Basil', 30, 'D4']] } }
    },
    {
        id: 'sqlt-like', title: 'Lesson: Pattern Matching',
        lesson: "LIKE matches patterns: 'S%' = starts with S, '%code%' = contains code. % is a wildcard.",
        brief: "A reader wants the library book whose title starts with the letter S.",
        question: 'Which title starts with S?', answer: 'Silent Code',
        hint: "SELECT * FROM books WHERE title LIKE 'S%'",
        par: 1, parQueries: ["SELECT * FROM books WHERE title LIKE 'S%'"],
        tables: { books: { columns: ['title', 'author', 'year'], rows: [['Deep Sky', 'R. Vale', 2019], ['Silent Code', 'M. Osei', 2021], ['Iron Roots', 'T. Juno', 2018]] } }
    },
    {
        id: 'sqlt-order', title: 'Lesson: Sorting Results',
        lesson: 'ORDER BY col sorts ascending; add DESC for descending. The fastest time is the smallest.',
        brief: 'Sort the race results so the fastest runner is on top.',
        question: 'Who ran the fastest (lowest time_sec)?', answer: 'Priya Nair',
        hint: 'SELECT * FROM runners ORDER BY time_sec',
        par: 1, parQueries: ['SELECT * FROM runners ORDER BY time_sec'],
        tables: { runners: { columns: ['name', 'time_sec'], rows: [['Leo Park', 62], ['Priya Nair', 54], ['Sam Cole', 71], ['Ada Brue', 58]] } }
    },
    {
        id: 'sqlt-limit', title: 'Lesson: Top-N with LIMIT',
        lesson: 'ORDER BY ... DESC LIMIT 1 returns just the biggest row — a classic "find the top" move.',
        brief: 'The arcade wants only the single highest score on the wall.',
        question: 'Who holds the highest score?', answer: 'Rex Doyle',
        hint: 'SELECT * FROM scores ORDER BY points DESC LIMIT 1',
        par: 1, parQueries: ['SELECT * FROM scores ORDER BY points DESC LIMIT 1'],
        tables: { scores: { columns: ['player', 'points'], rows: [['Ivy Chen', 8800], ['Rex Doyle', 12400], ['Mo Adler', 9100], ['Zia Kade', 7600]] } }
    },
    {
        id: 'sqlt-and', title: 'Lesson: Combining Filters (AND)',
        lesson: 'AND requires both conditions: species = dog AND age < 3 finds young dogs only.',
        brief: 'The shelter needs the dog that is younger than 3.',
        question: 'What is the young dog\u2019s name?', answer: 'Biscuit',
        hint: "SELECT * FROM pets WHERE species = 'dog' AND age < 3",
        par: 1, parQueries: ["SELECT * FROM pets WHERE species = 'dog' AND age < 3"],
        tables: { pets: { columns: ['name', 'species', 'age'], rows: [['Biscuit', 'dog', 2], ['Rufus', 'dog', 7], ['Mochi', 'cat', 1], ['Perle', 'cat', 5]] } }
    },
    {
        id: 'sqlt-or', title: 'Lesson: Either/Or Filters',
        lesson: "OR keeps a row if either condition matches: zone = 'vip' OR price > 200.",
        brief: 'Security checks everyone who is VIP or paid more than 200.',
        question: 'Who is the only VIP guest?', answer: 'Lena Ruiz',
        hint: "SELECT * FROM tickets WHERE zone = 'vip' OR price > 200",
        par: 1, parQueries: ["SELECT * FROM tickets WHERE zone = 'vip' OR price > 200"],
        tables: { tickets: { columns: ['guest', 'zone', 'price'], rows: [['Lena Ruiz', 'vip', 150], ['Jon Barr', 'floor', 90], ['Kim Sato', 'balcony', 260], ['Ali Vega', 'floor', 80]] } }
    },
    {
        id: 'sqlt-noteq', title: 'Lesson: Excluding Rows',
        lesson: "!= (or <>) means NOT equal: dept != 'sales' hides the whole sales team.",
        brief: 'Everyone here is in sales except one person. Filter sales out.',
        question: 'Who is NOT in sales?', answer: 'Tom Iyer',
        hint: "SELECT * FROM staff WHERE dept != 'sales'",
        par: 1, parQueries: ["SELECT * FROM staff WHERE dept != 'sales'"],
        tables: { staff: { columns: ['name', 'dept'], rows: [['Ana Reed', 'sales'], ['Tom Iyer', 'audit'], ['Raj Malik', 'sales'], ['Eva Stone', 'sales']] } }
    }
];

// ---------- CASE FILES (one random case per game, efficiency-scored) ----------
window.SQL_CASES = [
    {
        id: 'sqlc-trophy', title: 'Case: The Vanished Trophy',
        brief: 'The golden trophy disappeared from the sports club. Check the incident report, then find who used a key for that room in that time slot.',
        question: 'Who took the trophy?', answer: 'Marcus Bell',
        hint: "Incidents first: SELECT * FROM incidents WHERE item LIKE '%trophy%' — then match location + time_slot in key_log.",
        par: 2,
        parQueries: ["SELECT * FROM incidents WHERE item LIKE '%trophy%'", "SELECT * FROM key_log WHERE location = 'trophy_room' AND time_slot = 'evening'"],
        tables: {
            incidents: { columns: ['id', 'item', 'location', 'time_slot'], rows: [[1, 'yoga mat', 'gym_hall', 'morning'], [2, 'golden trophy', 'trophy_room', 'evening'], [3, 'water cooler', 'lobby', 'noon']] },
            key_log: { columns: ['entry', 'member_name', 'location', 'time_slot'], rows: [[1, 'Ana Cole', 'gym_hall', 'morning'], [2, 'Marcus Bell', 'trophy_room', 'evening'], [3, 'Ana Cole', 'lobby', 'noon'], [4, 'Liam Fox', 'gym_hall', 'evening'], [5, 'Sara Kim', 'trophy_room', 'morning']] },
            members: { columns: ['name', 'tier', 'locker'], rows: [['Ana Cole', 'silver', 12], ['Marcus Bell', 'gold', 7], ['Liam Fox', 'basic', 31], ['Sara Kim', 'gold', 3]] }
        }
    },
    {
        id: 'sqlc-soup', title: 'Case: The Soapy Soup',
        brief: "Table 12's lunch soup tasted like soap. Find that order, note which shift cooked it, then identify the cook on that shift.",
        question: 'Which cook sabotaged the soup?', answer: 'Rita Flores',
        hint: "SELECT * FROM orders WHERE table_no = 12 AND dish = 'soup' — then look up that shift in shifts.",
        par: 2,
        parQueries: ["SELECT * FROM orders WHERE table_no = 12 AND dish = 'soup'", "SELECT * FROM shifts WHERE shift = 'lunch_b'"],
        tables: {
            orders: { columns: ['order_id', 'table_no', 'dish', 'shift'], rows: [[301, 4, 'pasta', 'lunch_a'], [302, 12, 'soup', 'lunch_b'], [303, 12, 'salad', 'lunch_a'], [304, 9, 'soup', 'lunch_a']] },
            shifts: { columns: ['cook', 'shift'], rows: [['Hugo Marsh', 'lunch_a'], ['Rita Flores', 'lunch_b'], ['Pam Ito', 'dinner_a']] },
            complaints: { columns: ['id', 'table_no', 'note'], rows: [[1, 12, 'soup tastes like soap'], [2, 4, 'pasta cold']] }
        }
    },
    {
        id: 'sqlc-laptop', title: 'Case: The Missing Laptop',
        brief: 'Prototype laptop LT-77 vanished. The asset log shows where it was last seen — find who badged into that room around that hour.',
        question: 'Who has the laptop?', answer: 'Dev Patel',
        hint: "SELECT * FROM asset_log WHERE asset = 'LT-77' — then badge_swipes for that room WHERE time LIKE '18%'.",
        par: 2,
        parQueries: ["SELECT * FROM asset_log WHERE asset = 'LT-77'", "SELECT * FROM badge_swipes WHERE room = 'lab_3' AND time LIKE '18%'"],
        tables: {
            asset_log: { columns: ['asset', 'last_room', 'last_seen'], rows: [['LT-42', 'lab_1', '12:00'], ['LT-77', 'lab_3', '18:00'], ['CAM-9', 'studio', '09:30']] },
            badge_swipes: { columns: ['employee', 'room', 'time'], rows: [['Mia Wong', 'lab_3', '11:20'], ['Dev Patel', 'lab_3', '18:05'], ['Joe Ricci', 'lab_1', '18:10'], ['Mia Wong', 'studio', '09:00']] },
            employees: { columns: ['name', 'team'], rows: [['Mia Wong', 'design'], ['Dev Patel', 'qa'], ['Joe Ricci', 'ops']] }
        }
    },
    {
        id: 'sqlc-invoice', title: 'Case: The Phantom Invoice',
        brief: 'Finance flagged one massive invoice from a vendor nobody knows. Find the invoice over 90000, then decode who approved it via the employee code.',
        question: 'Who approved the fake invoice?', answer: 'Sonia Rao',
        hint: 'SELECT * FROM invoices WHERE amount > 90000 — then employees WHERE code matches.',
        par: 2,
        parQueries: ['SELECT * FROM invoices WHERE amount > 90000', "SELECT * FROM employees WHERE code = 'E-19'"],
        tables: {
            invoices: { columns: ['inv_no', 'vendor', 'amount', 'approved_by'], rows: [[9001, 'Paper Plus', 1200, 'E-04'], [9002, 'Phantom Supplies', 94000, 'E-19'], [9003, 'CleanCo', 800, 'E-04'], [9004, 'Desk World', 15000, 'E-11']] },
            employees: { columns: ['code', 'name', 'dept'], rows: [['E-04', 'Bill Tan', 'admin'], ['E-11', 'Ira Novak', 'it'], ['E-19', 'Sonia Rao', 'finance']] },
            vendors: { columns: ['vendor', 'contact'], rows: [['Paper Plus', 'pp@mail.com'], ['CleanCo', 'cc@mail.com'], ['Desk World', 'dw@mail.com']] }
        }
    },
    {
        id: 'sqlc-graffiti', title: 'Case: The Neon Tagger',
        brief: 'A neon green tag appeared overnight. The paint shop logs every sale — find who bought neon green, then match the buyer code to a resident.',
        question: 'Who is the tagger?', answer: 'Zoe Brant',
        hint: "SELECT * FROM paint_sales WHERE color = 'neon green' — then residents WHERE code matches.",
        par: 2,
        parQueries: ["SELECT * FROM paint_sales WHERE color = 'neon green'", "SELECT * FROM residents WHERE code = 'R-204'"],
        tables: {
            paint_sales: { columns: ['sale_id', 'buyer_code', 'color', 'day'], rows: [[1, 'R-101', 'white', 'mon'], [2, 'R-204', 'neon green', 'thu'], [3, 'R-160', 'blue', 'wed'], [4, 'R-101', 'black', 'thu']] },
            residents: { columns: ['code', 'name', 'block'], rows: [['R-101', 'Hal Greer', 'A'], ['R-160', 'Ivy Roth', 'C'], ['R-204', 'Zoe Brant', 'B']] },
            sightings: { columns: ['id', 'note'], rows: [[1, 'hooded figure near block B at 2am'], [2, 'skateboard sounds on main street']] }
        }
    },
    {
        id: 'sqlc-emerald', title: 'Case: The Pawned Emerald',
        brief: 'A stolen emerald necklace surfaced at a pawn shop. Search the sales for the emerald item, then unmask the seller behind the code.',
        question: 'Who pawned the necklace?', answer: 'Victor Kane',
        hint: "SELECT * FROM pawn_sales WHERE item LIKE '%emerald%' — then sellers WHERE code matches.",
        par: 2,
        parQueries: ["SELECT * FROM pawn_sales WHERE item LIKE '%emerald%'", "SELECT * FROM sellers WHERE code = 'S-88'"],
        tables: {
            pawn_sales: { columns: ['ticket', 'item', 'seller_code', 'paid'], rows: [[71, 'silver watch', 'S-12', 90], [72, 'emerald necklace', 'S-88', 2400], [73, 'old guitar', 'S-30', 150]] },
            sellers: { columns: ['code', 'name'], rows: [['S-12', 'Nora Hale', ], ['S-30', 'Gus Ferro'], ['S-88', 'Victor Kane']] },
            reports: { columns: ['id', 'stolen_item', 'owner'], rows: [[1, 'emerald necklace', 'Mrs. Whitmore'], [2, 'racing bike', 'Tim Solt']] }
        }
    },
    {
        id: 'sqlc-pickpocket', title: 'Case: The Line 7 Pickpocket',
        brief: 'A wallet vanished in carriage C2 right after the oak_st stop. Check the manifest for who boarded C2 at oak_st, then put a name to the passenger ID.',
        question: 'Who is the pickpocket?', answer: 'Nina Cross',
        hint: "SELECT * FROM manifest WHERE carriage = 'C2' AND boarded_at = 'oak_st' — then passengers by id.",
        par: 2,
        parQueries: ["SELECT * FROM manifest WHERE carriage = 'C2' AND boarded_at = 'oak_st'", "SELECT * FROM passengers WHERE pid = 'P-311'"],
        tables: {
            manifest: { columns: ['pid', 'carriage', 'boarded_at'], rows: [['P-101', 'C1', 'oak_st'], ['P-311', 'C2', 'oak_st'], ['P-207', 'C2', 'elm_st'], ['P-455', 'C3', 'pine_st']] },
            passengers: { columns: ['pid', 'name'], rows: [['P-101', 'Abe Ford'], ['P-207', 'Lucy Chen'], ['P-311', 'Nina Cross'], ['P-455', 'Omar Diaz']] },
            stops: { columns: ['line', 'stop', 'order_no'], rows: [[7, 'oak_st', 1], [7, 'elm_st', 2], [7, 'pine_st', 3]] }
        }
    },
    {
        id: 'sqlc-examleak', title: 'Case: The Leaked Exam',
        brief: 'The final exam leaked a day early. The print server logs every job — find who printed the exam document and reveal their name from the user code.',
        question: 'Who leaked the exam?', answer: 'Omar Sheikh',
        hint: "SELECT * FROM print_jobs WHERE doc LIKE '%final_exam%' — then users WHERE code matches.",
        par: 2,
        parQueries: ["SELECT * FROM print_jobs WHERE doc LIKE '%final_exam%'", "SELECT * FROM users WHERE code = 'U-52'"],
        tables: {
            print_jobs: { columns: ['job', 'doc', 'user_code', 'at_hour'], rows: [[1, 'homework_3.pdf', 'U-17', 10], [2, 'final_exam_v2.pdf', 'U-52', 22], [3, 'poster.png', 'U-08', 14]] },
            users: { columns: ['code', 'name', 'role'], rows: [['U-08', 'Amy Ruiz', 'student'], ['U-17', 'Ben Kwan', 'student'], ['U-52', 'Omar Sheikh', 'assistant']] },
            courses: { columns: ['course', 'teacher'], rows: [['databases', 'Dr. Feld'], ['networks', 'Dr. Iqbal']] }
        }
    },
    {
        id: 'sqlc-arson', title: 'Case: The Warehouse Fire',
        brief: 'The warehouse burned after hours. Gate logs record every badge — find who entered after hour 22, then match the badge to its owner.',
        question: 'Who started the fire?', answer: 'Felix Marsh',
        hint: 'SELECT * FROM access_log WHERE hour > 22 — then badges WHERE badge matches.',
        par: 2,
        parQueries: ['SELECT * FROM access_log WHERE hour > 22', "SELECT * FROM badges WHERE badge = 'B-9'"],
        tables: {
            access_log: { columns: ['badge', 'gate', 'hour'], rows: [['B-2', 'north', 17], ['B-9', 'south', 23], ['B-5', 'north', 9], ['B-2', 'south', 18]] },
            badges: { columns: ['badge', 'owner'], rows: [['B-2', 'Gina Torres'], ['B-5', 'Raj Mehta'], ['B-9', 'Felix Marsh']] },
            fuel_purchases: { columns: ['id', 'buyer', 'liters'], rows: [[1, 'city depot', 900], [2, 'farm coop', 300]] }
        }
    },
    {
        id: 'sqlc-showcat', title: 'Case: The Kidnapped Show Cat',
        brief: 'Duchess, a prize Persian cat, was snatched before the show. A witness saw her loaded into a van — find the sighting mentioning the persian, then identify the van\u2019s driver.',
        question: 'Who catnapped Duchess?', answer: 'Greta Holm',
        hint: "SELECT * FROM sightings WHERE detail LIKE '%persian%' — then vans WHERE van_id matches.",
        par: 2,
        parQueries: ["SELECT * FROM sightings WHERE detail LIKE '%persian%'", "SELECT * FROM vans WHERE van_id = 'V-3'"],
        tables: {
            sightings: { columns: ['report', 'detail', 'van_id'], rows: [[1, 'dog barking on maple ave', 'V-1'], [2, 'persian cat carried into a grey van', 'V-3'], [3, 'parrot on a fence', 'V-2']] },
            vans: { columns: ['van_id', 'driver', 'color'], rows: [['V-1', 'Paul Sims', 'white'], ['V-2', 'Ida Blane', 'red'], ['V-3', 'Greta Holm', 'grey']] },
            show_entries: { columns: ['cat', 'owner', 'breed'], rows: [['Duchess', 'Lady Fenwick', 'persian'], ['Momo', 'Ken Aoki', 'siamese']] }
        }
    }
];
