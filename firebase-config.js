// ===================================
// FIREBASE CONFIGURATION
// ===================================

/*
 * SETUP INSTRUCTIONS:
 * 
 * 1. Go to https://console.firebase.google.com
 * 2. Click "Add Project" or select existing project
 * 3. Go to Project Settings (gear icon) → "Your apps" section
 * 4. Click the Web icon (</>)
 * 5. Register your app (name: "portfolio-games")
 * 6. Copy the firebaseConfig object below
 * 7. Replace the placeholder values with your actual Firebase config
 * 
 * SECURITY NOTE:
 * - These values are meant to be public (they identify your Firebase project)
 * - Real security comes from Firestore Security Rules (explained below)
 * - Never commit sensitive data like service account keys
 */

const firebaseConfig = {
    apiKey: "AIzaSyBH1pO0b-UYnYueP265JpysI2irCkfXIYc",                    // Public identifier for your Firebase project
    authDomain: "portfolio-games-1532.firebaseapp.com",  // Domain for Firebase Authentication
    projectId: "portfolio-games-1532",                   // Your Firebase project ID
    storageBucket: "portfolio-games-1532.firebasestorage.app",   // Cloud Storage bucket
    messagingSenderId: "291696452903",            // For Firebase Cloud Messaging
    appId: "1:291696452903:web:afcf8fca1cb6e08ce73502"                            // Unique identifier for this app
};

// Initialize Firebase
// This creates a connection between your app and Firebase servers
let db = null;
let auth = null;
window.firebaseAuthReady = false; // Track auth status

try {
    if (typeof firebase !== 'undefined') {
        // Initialize the Firebase app with your configuration
        firebase.initializeApp(firebaseConfig);
        
        // Get a reference to the Firestore database
        // Firestore is Firebase's NoSQL database (stores JSON-like documents)
        db = firebase.firestore();
        
        // Get a reference to Firebase Authentication
        auth = firebase.auth();
        
        // Sign in anonymously on page load
        // This creates a unique user ID without requiring login info
        auth.signInAnonymously()
            .then(() => {
                console.log('✅ Firebase initialized successfully');
                console.log('✅ Anonymous authentication successful');
                window.firebaseAuthReady = true; // Set ready flag
            })
            .catch((error) => {
                console.error('❌ Anonymous auth failed:', error);
                console.log('🔧 Will retry auth when submitting scores');
            });
        
        // OPTIONAL: Enable offline persistence
        // This lets users see cached leaderboards even when offline
        db.enablePersistence()
            .catch((err) => {
                if (err.code === 'failed-precondition') {
                    console.warn('⚠️ Persistence failed: Multiple tabs open');
                } else if (err.code === 'unimplemented') {
                    console.warn('⚠️ Persistence not supported by browser');
                }
            });
    } else {
        console.error('❌ Firebase SDK not loaded');
    }
} catch (error) {
    console.error('❌ Firebase initialization error:', error);
}

// ===================================
// DATABASE STRUCTURE EXPLANATION
// ===================================

/*
 * Our Firestore database is organized like this:
 * 
 * Collection: "leaderboards"
 *   ├─ Document: "typingGame"
 *   │   └─ Collection: "scores"
 *   │       ├─ Document: auto-generated-id
 *   │       │   ├── score: 150
 *   │       │   ├── playerName: "Alice"
 *   │       │   ├── timestamp: 1234567890
 *   │       │   └── date: "2026-03-25"
 *   │       ├─ Document: another-id
 *   │       │   ├── score: 120
 *   │       │   └── ...
 *   ├─ Document: "wordTetris"
 *   │   └─ Collection: "scores"
 *   │       └─ ...
 *   └─ ... (more games)
 * 
 * WHY THIS STRUCTURE?
 * - Separate collection per game = easy to query top scores for each game
 * - Auto-generated IDs = no conflicts, easy to add new scores
 * - Timestamp field = can sort by time, show "just now" or "2 days ago"
 * - Date field (string) = human-readable format for display
 * 
 * ALTERNATIVE APPROACHES:
 * - Single "scores" collection with "gameName" field (harder to query efficiently)
 * - Realtime Database instead of Firestore (older, less flexible)
 * - PostgreSQL/MySQL (requires server, more complex setup)
 */

// ===================================
// FIRESTORE SECURITY RULES
// ===================================

/*
 * After setting up Firebase, go to Firestore Database → Rules tab
 * Replace default rules with this:
 * 
 * rules_version = '2';
 * service cloud.firestore {
 *   match /databases/{database}/documents {
 *     // Leaderboard scores
 *     match /leaderboards/{gameId}/scores/{scoreId} {
 *       // Anyone can read scores (public leaderboard)
 *       allow read: if true;
 *       
 *       // Only allow creating new scores (not updating/deleting existing ones)
 *       allow create: if request.resource.data.score is number
 *                     && request.resource.data.playerName is string
 *                     && request.resource.data.playerName.size() <= 50
 *                     && request.resource.data.score >= 0
 *                     && request.resource.data.score <= 100000;
 *       
 *       // Prevent updates and deletes (scores should be immutable)
 *       allow update, delete: if false;
 *     }
 *   }
 * }
 * 
 * WHAT THESE RULES DO:
 * - ✅ Anyone can READ scores (so leaderboard works for everyone)
 * - ✅ Anyone can CREATE new scores (so players can submit scores)
 * - ❌ Nobody can UPDATE or DELETE scores (prevent cheating)
 * - ✅ Score must be a number between 0-100,000 (catch invalid data)
 * - ✅ Player name must be a string, max 50 characters (prevent spam)
 * 
 * ADVANCED SECURITY (if you want to prevent cheating):
 * - Add Firebase Authentication (require sign-in)
 * - Add server-side validation (Cloud Functions)
 * - Rate limiting (prevent spam submissions)
 * - IP-based restrictions
 * 
 * For now, these basic rules are good enough for a portfolio project!
 */

// Export the database reference so other files can use it
window.firebaseDB = db;
