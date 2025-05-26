// AuthManager.ts
const { ccclass, property } = cc._decorator;
declare const firebase: any;

@ccclass
export default class AuthManager extends cc.Component {
    // ─── Sign-Up fields ─────────────────────
    @property(cc.EditBox) signUpEmail: cc.EditBox = null;
    @property(cc.EditBox) signUpUsername: cc.EditBox = null;
    @property(cc.EditBox) signUpPassword: cc.EditBox = null;
    @property(cc.Button) realSignUpButton: cc.Button = null;

    // ─── Login fields ───────────────────────
    @property(cc.EditBox) loginEmail: cc.EditBox = null;
    @property(cc.EditBox) loginPassword: cc.EditBox = null;
    @property(cc.Button) realLoginButton: cc.Button = null;

    @property({ type: cc.AudioClip }) bgmClip: cc.AudioClip = null;

    private bgmAudioId: number = -1;

    private firebaseInitialized = false;
    private isInitializing = false;

    onLoad() {
        console.log("AuthManager onLoad called");
        if (this.bgmClip) {
        this.bgmAudioId = cc.audioEngine.play(this.bgmClip, true, 1);
        } 
        else {
            console.warn("BGM clip not assigned!");
        }
        this.initializeFirebase(() => {
            console.log("Firebase initialized, setting up button listeners");
            this.setupButtonListeners();
        });
    }

    private setupButtonListeners() {
        if (this.realSignUpButton && this.realSignUpButton.node) {
            console.log("Setting up sign up button listener");
            this.realSignUpButton.node.on('click', this.onSignUp, this);
        } else {
            console.error("Sign up button not found or not assigned!");
        }

        if (this.realLoginButton && this.realLoginButton.node) {
            console.log("Setting up login button listener");
            this.realLoginButton.node.on('click', this.onLogin, this);
        } else {
            console.error("Login button not found or not assigned!");
        }
    }

    private initializeFirebase(callback: () => void) {
        console.log("Initializing Firebase...");
        
        // Check if Firebase is already loaded
        if (typeof firebase !== 'undefined' && this.firebaseInitialized) {
            console.log("Firebase already initialized");
            callback();
            return;
        }

        // Prevent multiple initialization attempts
        if (this.isInitializing) {
            console.log("Firebase initialization already in progress");
            return;
        }

        this.isInitializing = true;

        // Check if we're in a browser environment
        if (typeof document === 'undefined') {
            console.error("Not in browser environment, cannot load Firebase scripts");
            return;
        }

        // Load Firebase SDK dynamically
        const scripts = [
            'https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js',
            'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth-compat.js',
            'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore-compat.js'
        ];

        let loadedCount = 0;
        const totalScripts = scripts.length;

        scripts.forEach((url, index) => {
            const script = document.createElement('script');
            script.src = url;
            script.onload = () => {
                console.log(`Loaded Firebase script ${index + 1}/${totalScripts}: ${url}`);
                loadedCount++;
                if (loadedCount === totalScripts) {
                    console.log("All Firebase scripts loaded, initializing app...");
                    this.initializeFirebaseApp();
                    this.isInitializing = false;
                    callback();
                }
            };
            script.onerror = (error) => {
                console.error(`Failed to load Firebase script: ${url}`, error);
                this.isInitializing = false;
            };
            document.head.appendChild(script);
        });
    }

    private initializeFirebaseApp() {
        const firebaseConfig = {
            apiKey: "AIzaSyCPp2Ik9wkt3tJ87IxzoJPjn1iBFbM8btQ",
            authDomain: "web-mario-7e9f6.firebaseapp.com",
            projectId: "web-mario-7e9f6",
            storageBucket: "web-mario-7e9f6.firebasestorage.app",
            messagingSenderId: "790472267396",
            appId: "1:790472267396:web:918f1ab735958d39de54d1",
            measurementId: "G-VNWFL9B7TQ"
        };
        
        try {
            if (typeof firebase !== 'undefined') {
                // Check if Firebase is already initialized
                if (firebase.apps.length === 0) {
                    firebase.initializeApp(firebaseConfig);
                    console.log("Firebase app initialized successfully");
                } else {
                    console.log("Firebase app already initialized");
                }
                this.firebaseInitialized = true;
            } else {
                console.error("Firebase is not available");
            }
        } catch (error) {
            console.error("Error initializing Firebase:", error);
        }
    }

    // ─── Sign-Up handler ────────────────────
    private async onSignUp() {
        console.log("Sign up button clicked!");
        
        if (!this.firebaseInitialized) {
            console.error("Firebase not initialized yet");
            return;
        }

        // Validate inputs
        if (!this.signUpEmail || !this.signUpUsername || !this.signUpPassword) {
            console.error("Sign up form fields not assigned!");
            return;
        }

        const email = this.signUpEmail.string.trim();
        const username = this.signUpUsername.string.trim();
        const password = this.signUpPassword.string;

        console.log("Sign up attempt:", { email, username, passwordLength: password.length });

        // Basic validation
        if (!email || !username || !password) {
            console.error("Please fill in all fields");
            return;
        }

        if (password.length < 6) {
            console.error("Password must be at least 6 characters");
            return;
        }

        try {
            const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
            console.log("User created successfully:", userCredential.user.uid);
            
            const uid = userCredential.user.uid;
            await firebase.firestore().collection('users').doc(uid).set({
                username: username,
                email: email,
                password: password, // Note: Storing passwords in plaintext is not secure!
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            console.log("User data saved to Firestore");
            if (this.bgmAudioId !== -1) {
                cc.audioEngine.stop(this.bgmAudioId);
            }
            
            // Load next scene
            cc.director.loadScene('Level Select');
            
        } catch (error: any) {
            console.error("Sign Up Unsuccessful:", error.code, error.message);
            // You might want to show this error to the user
        }
    }

    // ─── Login handler ──────────────────────
    private async onLogin() {
        console.log("Login button clicked!");
        
        if (!this.firebaseInitialized) {
            console.error("Firebase not initialized yet");
            return;
        }

        // Validate inputs
        if (!this.loginEmail || !this.loginPassword) {
            console.error("Login form fields not assigned!");
            return;
        }

        const email = this.loginEmail.string.trim();
        const password = this.loginPassword.string;

        console.log("Login attempt:", { email, passwordLength: password.length });

        // Basic validation
        if (!email || !password) {
            console.error("Please fill in all fields");
            return;
        }

        try {
            const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
            console.log("Log In Successful:", userCredential.user.email);
            
            if (this.bgmAudioId !== -1) {
                cc.audioEngine.stop(this.bgmAudioId);
            }
            // Load next scene
            cc.director.loadScene('Level Select');
            
        } catch (error: any) {
            console.error("Log In Failed:", error.code, error.message);
            // You might want to show this error to the user
        }
    }

    onDestroy() {
        // Clean up event listeners
        if (this.realSignUpButton && this.realSignUpButton.node) {
            this.realSignUpButton.node.off('click', this.onSignUp, this);
        }
        if (this.realLoginButton && this.realLoginButton.node) {
            this.realLoginButton.node.off('click', this.onLogin, this);
        }
        // Stop BGM if still playing
        if (this.bgmAudioId !== -1) {
            cc.audioEngine.stop(this.bgmAudioId);
        }
    }
}