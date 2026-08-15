// ===================================
// CODE QUIZ — QUESTION BANK
// Used by CodeQuiz (typing-game.js). Loaded before it in index.html.
//
// Convention: options[0] is ALWAYS the correct answer in this file.
// CodeQuiz shuffles option order every round, so the position players
// see is random — never edit `correct` indexes here, there are none.
// Fields: q = prompt (plain text, escaped at render), options, cat.
// ===================================

window.QUIZ_QUESTIONS = [
    // ---------- HTML ----------
    { cat: 'HTML', q: 'What does HTML stand for?', options: ['Hyper Text Markup Language', 'High Tech Modern Language', 'Home Tool Markup Language', 'Hyperlinks and Text Markup Language'] },
    { cat: 'HTML', q: 'Which tag creates a hyperlink?', options: ['<a>', '<link>', '<href>', '<url>'] },
    { cat: 'HTML', q: 'Which attribute provides alternate text for an image?', options: ['alt', 'title', 'src', 'caption'] },
    { cat: 'HTML', q: 'Which tag defines the largest heading?', options: ['<h1>', '<h6>', '<heading>', '<head>'] },
    { cat: 'HTML', q: 'Which semantic tag holds standalone, self-contained content?', options: ['<article>', '<div>', '<span>', '<block>'] },
    { cat: 'HTML', q: 'Which input type shows a date picker?', options: ['<input type="date">', '<input type="calendar">', '<input type="day">', '<input type="picker">'] },
    { cat: 'HTML', q: 'What is the correct HTML5 doctype?', options: ['<!DOCTYPE html>', '<!DOCTYPE HTML5>', '<doctype html5>', '<!HTML5>'] },
    { cat: 'HTML', q: 'Which tag embeds JavaScript in a page?', options: ['<script>', '<js>', '<javascript>', '<code>'] },
    { cat: 'HTML', q: 'Which element defines a table row?', options: ['<tr>', '<td>', '<th>', '<row>'] },
    { cat: 'HTML', q: 'What does <meta name="viewport"> control?', options: ['Page scaling on mobile devices', 'The browser tab title', 'External font loading', 'The page language'] },
    { cat: 'HTML', q: 'Which attribute makes a form field mandatory?', options: ['required', 'mandatory', 'validate', 'must-fill'] },
    { cat: 'HTML', q: 'Which tag preserves spaces and line breaks exactly as written?', options: ['<pre>', '<p>', '<span>', '<raw>'] },

    // ---------- CSS ----------
    { cat: 'CSS', q: 'What does CSS stand for?', options: ['Cascading Style Sheets', 'Creative Style Sheets', 'Computer Style Sheets', 'Colorful Style Sheets'] },
    { cat: 'CSS', q: 'Which property controls text size?', options: ['font-size', 'text-size', 'text-style', 'font-style'] },
    { cat: 'CSS', q: 'Which property changes the background color?', options: ['background-color', 'bgcolor', 'color', 'back-color'] },
    { cat: 'CSS', q: 'How do you select the element with id "menu"?', options: ['#menu', '.menu', 'menu()', '*menu'] },
    { cat: 'CSS', q: 'Which declaration lets flex items wrap onto new lines?', options: ['flex-wrap: wrap', 'flex-flow: none', 'wrap: true', 'flex: wrap-items'] },
    { cat: 'CSS', q: 'Which position value pins an element to the viewport?', options: ['fixed', 'absolute', 'relative', 'static'] },
    { cat: 'CSS', q: 'Which has the highest specificity?', options: ['Inline style (style="")', 'ID selector', 'Class selector', 'Element selector'] },
    { cat: 'CSS', q: 'The rem unit is relative to what?', options: ['The root element font size', 'The parent element font size', 'The viewport width', 'The device pixel density'] },
    { cat: 'CSS', q: 'Which property creates space INSIDE the border?', options: ['padding', 'margin', 'gap', 'spacing'] },
    { cat: 'CSS', q: 'What does grid-template-columns: repeat(3, 1fr) create?', options: ['3 equal-width columns', '3 rows', 'Content repeated 3 times', 'Three 1px columns'] },
    { cat: 'CSS', q: 'Which media feature targets screens 600px wide or less?', options: ['(max-width: 600px)', '(min-width: 600px)', '(screen-size: 600px)', '(width-below: 600px)'] },
    { cat: 'CSS', q: 'Which property animates smoothly between two property values?', options: ['transition', 'transform', 'translate', 'animate-smooth'] },

    // ---------- JavaScript ----------
    { cat: 'JavaScript', q: 'Which keyword declares a block-scoped variable that cannot be reassigned?', options: ['const', 'var', 'let', 'static'] },
    { cat: 'JavaScript', q: 'What does === compare?', options: ['Value and type', 'Value only', 'Reference only', 'Nothing — it assigns'] },
    { cat: 'JavaScript', q: 'Which method adds an element to the END of an array?', options: ['push()', 'pop()', 'shift()', 'unshift()'] },
    { cat: 'JavaScript', q: 'What does typeof null return?', options: ['"object"', '"null"', '"undefined"', '"boolean"'] },
    { cat: 'JavaScript', q: 'Which function parses a JSON string into an object?', options: ['JSON.parse()', 'JSON.stringify()', 'JSON.decode()', 'Object.fromJSON()'] },
    { cat: 'JavaScript', q: 'What is a Promise?', options: ['An object representing a future async result', 'A synchronous loop', 'A CSS animation hook', 'A type of variable declaration'] },
    { cat: 'JavaScript', q: 'Which array method returns a NEW array of transformed elements?', options: ['map()', 'forEach()', 'sort()', 'splice()'] },
    { cat: 'JavaScript', q: 'What does the spread operator (...) do?', options: ['Expands an iterable into individual elements', 'Declares a class', 'Comments out code', 'Concatenates strings only'] },
    { cat: 'JavaScript', q: 'Which symbol starts a single-line comment?', options: ['//', '/*', '#', '<!--'] },
    { cat: 'JavaScript', q: 'Which statement exits a loop entirely?', options: ['break', 'continue', 'exit', 'halt'] },
    { cat: 'JavaScript', q: 'What does document.querySelector(".card") return?', options: ['The first element with class "card"', 'All elements with class "card"', 'The element with id "card"', 'The last element with class "card"'] },
    { cat: 'JavaScript', q: 'async/await is syntax sugar for working with what?', options: ['Promises', 'CSS animations', 'DOM parsing', 'Variable hoisting'] },
    { cat: 'JavaScript', q: 'Which converts the string "42" to a number?', options: ['parseInt("42")', '"42".join()', 'String(42)', '"42".push()'] },
    { cat: 'JavaScript', q: 'What is a closure?', options: ['A function that remembers variables from its outer scope', 'A way to close browser tabs', 'A CSS layout mode', 'An HTML tag pair'] },

    // ---------- Python ----------
    { cat: 'Python', q: 'What is the correct way to define a function?', options: ['def greet():', 'function greet():', 'func greet():', 'define greet():'] },
    { cat: 'Python', q: 'Which built-in type is IMMUTABLE?', options: ['tuple', 'list', 'dict', 'set'] },
    { cat: 'Python', q: 'What does len([1, 2, 3]) return?', options: ['3', '2', '6', 'An error'] },
    { cat: 'Python', q: 'How do you start a comment?', options: ['#', '//', '/*', '<!--'] },
    { cat: 'Python', q: 'What sequence does range(3) produce?', options: ['0, 1, 2', '1, 2, 3', '0, 1, 2, 3', '3, 2, 1'] },
    { cat: 'Python', q: 'Which keywords handle exceptions?', options: ['try / except', 'try / catch', 'catch / finally', 'do / rescue'] },
    { cat: 'Python', q: 'What does [x * 2 for x in range(3)] evaluate to?', options: ['[0, 2, 4]', '[2, 4, 6]', '[0, 1, 2]', '[1, 2, 3]'] },
    { cat: 'Python', q: 'What is "self" in a class method?', options: ['A reference to the instance', 'A global variable', 'A reserved loop counter', 'The parent class'] },
    { cat: 'Python', q: 'Which opens a file and closes it automatically?', options: ["with open('f.txt') as f:", "open('f.txt').close()", "file.open('f.txt')", "try open('f.txt')"] },
    { cat: 'Python', q: 'What is f"Hello {name}" called?', options: ['An f-string (formatted string literal)', 'A template tag', 'A printf string', 'A docstring'] },
    { cat: 'Python', q: 'How do you install a third-party package?', options: ['pip install package', 'python get package', 'npm install package', 'apt python package'] },
    { cat: 'Python', q: 'What does the // operator do?', options: ['Floor division', 'Starts a comment', 'Regular division', 'Exponentiation'] },

    // ---------- C ----------
    { cat: 'C', q: 'Which function prints text to standard output?', options: ['printf()', 'print()', 'echo()', 'console.log()'] },
    { cat: 'C', q: 'Which header is required for printf?', options: ['<stdio.h>', '<stdlib.h>', '<string.h>', '<iostream>'] },
    { cat: 'C', q: 'What is a pointer?', options: ['A variable that stores a memory address', 'A loop construct', 'A string type', 'A compiler directive'] },
    { cat: 'C', q: 'Which operator gives the address of a variable?', options: ['&', '*', '->', '@'] },
    { cat: 'C', q: 'What does malloc() do?', options: ['Allocates memory on the heap', 'Frees memory', 'Copies strings', 'Defines macros'] },
    { cat: 'C', q: 'Which is a standard main signature?', options: ['int main(void)', 'void main[]', 'main(): int', 'function main()'] },
    { cat: 'C', q: 'What terminates a C string?', options: ["'\\0' (null character)", "'\\n'", 'EOF', "';'"] },
    { cat: 'C', q: 'Which keyword prevents a variable from being modified?', options: ['const', 'static', 'volatile', 'immutable'] },
    { cat: 'C', q: 'On most modern systems, sizeof(int) is how many bytes?', options: ['4', '1', '2', '16'] },
    { cat: 'C', q: 'What does the -> operator do?', options: ['Accesses a struct member through a pointer', 'Declares a function', 'Compares two values', 'Casts a type'] },

    // ---------- C++ ----------
    { cat: 'C++', q: 'Which feature lets a derived class override a base method at runtime?', options: ['Virtual functions', 'Templates', 'Macros', 'typedef'] },
    { cat: 'C++', q: 'What does the new operator do?', options: ['Allocates an object on the heap', 'Creates a stack variable', 'Imports a library', 'Starts a thread'] },
    { cat: 'C++', q: 'Which standard container is a dynamic array?', options: ['std::vector', 'std::map', 'std::set', 'std::stack'] },
    { cat: 'C++', q: 'What is RAII about?', options: ['Tying resource lifetime to object lifetime', 'Random access iteration', 'Runtime array indexing', 'Recursive algorithm inlining'] },
    { cat: 'C++', q: 'Which operator performs scope resolution?', options: ['::', '->', '.', '#'] },
    { cat: 'C++', q: 'std::cout belongs to which namespace?', options: ['std', 'core', 'sys', 'io'] },
    { cat: 'C++', q: 'What are templates used for?', options: ['Writing generic, type-parameterized code', 'Styling console output', 'Generating HTML', 'Automatic memory cleanup'] },
    { cat: 'C++', q: 'Which constructor runs when an object is copied?', options: ['Copy constructor', 'Default constructor', 'Destructor', 'Static constructor'] },
    { cat: 'C++', q: 'What is nullptr?', options: ['A type-safe null pointer literal', 'A zero-length string', 'An uninitialized reference', 'A deleted function'] },
    { cat: 'C++', q: 'Which keyword prevents a class from being inherited?', options: ['final', 'sealed', 'static', 'private'] },

    // ---------- Java ----------
    { cat: 'Java', q: 'What is the standard entry-point method signature?', options: ['public static void main(String[] args)', 'static main()', 'public void start()', 'int main(void)'] },
    { cat: 'Java', q: 'Which keyword creates a new object?', options: ['new', 'make', 'create', 'alloc'] },
    { cat: 'Java', q: 'What is the JVM?', options: ['The runtime that executes Java bytecode', 'A Java text editor', 'The Java compiler', 'A package manager'] },
    { cat: 'Java', q: 'Which collection stores only unique elements?', options: ['HashSet', 'ArrayList', 'LinkedList', 'Stack'] },
    { cat: 'Java', q: 'Which keyword makes a class inherit another?', options: ['extends', 'implements', 'inherits', 'super'] },
    { cat: 'Java', q: 'What does final do on a variable?', options: ['Prevents reassignment after initialization', 'Deletes it after use', 'Makes it global', 'Marks it deprecated'] },
    { cat: 'Java', q: 'Methods in an interface (before Java 8) are implicitly what?', options: ['public abstract', 'private', 'static final', 'protected'] },
    { cat: 'Java', q: 'Which construct handles exceptions?', options: ['try / catch', 'try / except', 'on / error', 'rescue'] },
    { cat: 'Java', q: 'For objects, what is the difference between == and .equals()?', options: ['== compares references, .equals() compares content', 'They behave identically', '.equals() compares references only', '== compares hash codes'] },
    { cat: 'Java', q: 'Which of these is a primitive type?', options: ['int', 'Integer', 'String', 'ArrayList'] },

    // ---------- AI & ML ----------
    { cat: 'AI & ML', q: 'Which library is the foundation for numerical arrays in Python?', options: ['NumPy', 'pandas', 'Flask', 'BeautifulSoup'] },
    { cat: 'AI & ML', q: 'In pandas, which structure is a 2-D labeled table?', options: ['DataFrame', 'Series', 'ndarray', 'Tensor'] },
    { cat: 'AI & ML', q: 'Which deep learning library was developed by Google?', options: ['TensorFlow', 'PyTorch', 'pandas', 'OpenCV'] },
    { cat: 'AI & ML', q: 'Which research-favorite library (from Meta) uses dynamic computation graphs?', options: ['PyTorch', 'TensorFlow 1.x', 'NumPy', 'Matplotlib'] },
    { cat: 'AI & ML', q: 'train_test_split comes from which library?', options: ['scikit-learn', 'NumPy', 'seaborn', 'SciPy'] },
    { cat: 'AI & ML', q: 'What is overfitting?', options: ['The model memorizes training data but fails on new data', 'The model trains too slowly', 'The model is too small to learn', 'The dataset has too many rows'] },
    { cat: 'AI & ML', q: 'Which activation function outputs values between 0 and 1?', options: ['Sigmoid', 'ReLU', 'Tanh', 'Linear'] },
    { cat: 'AI & ML', q: 'What does a loss function measure?', options: ['Error between predictions and actual values', 'GPU memory usage', 'Dataset size', 'Training speed'] },
    { cat: 'AI & ML', q: 'Supervised learning requires what kind of data?', options: ['Labeled data', 'Unlabeled data only', 'No data at all', 'Only reinforcement signals'] },
    { cat: 'AI & ML', q: 'Which technique fights overfitting by randomly disabling neurons during training?', options: ['Dropout', 'Pooling', 'Padding', 'Batching'] },
    { cat: 'AI & ML', q: 'What is an epoch?', options: ['One full pass over the training dataset', 'One weight update', 'One GPU cycle', 'One layer of the network'] },
    { cat: 'AI & ML', q: 'Convolutional neural networks (CNNs) excel at what data?', options: ['Images', 'Tabular joins', 'Sorted arrays', 'Database indexes'] },
    { cat: 'AI & ML', q: 'LLMs like GPT are primarily trained to do what?', options: ['Predict the next token in text', 'Play chess', 'Sort numbers', 'Compress images'] },
    { cat: 'AI & ML', q: 'Which pandas function reads a CSV file?', options: ['pd.read_csv()', 'pd.load_file()', 'pd.open_csv()', 'pd.csv()'] },

    // ---------- CS & Tools ----------
    { cat: 'CS & Tools', q: 'Which git command records staged changes to history?', options: ['git commit', 'git push', 'git stage', 'git save'] },
    { cat: 'CS & Tools', q: 'What does git push do?', options: ['Uploads local commits to a remote', 'Downloads new commits', 'Deletes a branch', 'Renames the repository'] },
    { cat: 'CS & Tools', q: 'Which SQL statement retrieves data?', options: ['SELECT', 'GET', 'FETCH', 'PULL'] },
    { cat: 'CS & Tools', q: 'Which HTTP method typically creates a resource?', options: ['POST', 'GET', 'HEAD', 'OPTIONS'] },
    { cat: 'CS & Tools', q: 'What does HTTP status 404 mean?', options: ['Resource not found', 'Server error', 'Unauthorized', 'Redirect'] },
    { cat: 'CS & Tools', q: 'Which data structure is First-In-First-Out?', options: ['Queue', 'Stack', 'Tree', 'Graph'] },
    { cat: 'CS & Tools', q: 'Binary search only works on what kind of collection?', options: ['A sorted collection', 'A hash table', 'A randomly ordered list', 'A linked list only'] },
    { cat: 'CS & Tools', q: 'What is the time complexity of binary search?', options: ['O(log n)', 'O(n)', 'O(n²)', 'O(1)'] },
    { cat: 'CS & Tools', q: 'What does API stand for?', options: ['Application Programming Interface', 'Advanced Program Integration', 'Applied Protocol Internet', 'Automatic Programming Input'] },
    { cat: 'CS & Tools', q: 'Which format uses key-value pairs and dominates web APIs?', options: ['JSON', 'CSV', 'JPEG', 'ZIP'] }
];
