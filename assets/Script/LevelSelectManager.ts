// LevelSelectManager.ts
const { ccclass, property } = cc._decorator;
declare const firebase: any;

@ccclass
export default class LevelSelectManager extends cc.Component {
    // ─── Level Buttons ─────────────────────
    @property(cc.Button) Level1Button: cc.Button = null;

    // ─── User Info Display ─────────────────
    @property(cc.Label) usernameLabel: cc.Label = null;
    @property(cc.Label) pointsLabel: cc.Label = null;
    @property(cc.Label) livesLabel: cc.Label = null;
    @property(cc.Label) coinsLabel: cc.Label = null;


    private currentUser: any = null;
    private userData: any = null;

    onLoad() {
        console.log("LevelSelectManager loaded");

        // Setup button listeners
        this.setupButtonListeners();

        // Load and display user data
        this.loadUserData();
    }

    private setupButtonListeners() {
        // Level buttons
        if (this.Level1Button) {
            this.Level1Button.node.on('click', () => this.onLevelButtonClick('Level1'), this);
        }
    }

    private async loadUserData() {
        try {
            await this.waitForFirebaseAuth();
            this.currentUser = firebase.auth().currentUser;

            if (!this.currentUser) {
                throw new Error("No user logged in");
            }

            const userRef = firebase.firestore().collection('users').doc(this.currentUser.uid);
            const userDoc = await userRef.get();

            if (userDoc.exists) {
                this.userData = userDoc.data();
            } else {
                await this.createDefaultUserData();
                const newUserDoc = await userRef.get(); // Re-fetch after creation
                this.userData = newUserDoc.data();
            }

            this.displayUserData();
        } catch (error) {
            console.error("Error loading user data:", error);
            this.showErrorAndRedirect();
        }
    }

    private waitForFirebaseAuth(): Promise<void> {
        return new Promise((resolve) => {
            if (firebase.auth().currentUser) {
                resolve();
                return;
            }

            const unsubscribe = firebase.auth().onAuthStateChanged((user: any) => {
                unsubscribe();
                resolve();
            });
        });
    }

    private async createDefaultUserData() {
        const defaultData = {
            username: "Player",
            points: 0,
            lives: 5,
            coins: 0,
            level: 1,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            lastPlayed: firebase.firestore.FieldValue.serverTimestamp()
        };

        try {
            await firebase.firestore()
                .collection('users')
                .doc(this.currentUser.uid)
                .set(defaultData); // Remove { merge: true } for new documents
            return defaultData;
        } catch (error) {
            console.error("Error creating default user data:", error);
            throw error; // Re-throw to handle in loadUserData
        }
    }

    private displayUserData() {

        // Display user data in labels
        this.usernameLabel.string = this.userData.username || "Player"; // Fallback to "Player"
        this.pointsLabel.string = `${this.userData.points ?? 0}`; // Nullish coalescing
        this.livesLabel.string = `X   ${this.userData.lives ?? 5}`;
        this.coinsLabel.string = `X   ${this.userData.coins ?? 0}`;

        // Enable/disable level buttons based on progress
        this.setupLevelButtons();

        console.log("User data displayed on UI");
    }

    private setupLevelButtons() {
        const userLevel = this.userData.level || 1;

        // Enable buttons based on user's progress
        if (this.Level1Button) {
            this.Level1Button.interactable = true;
        }

        console.log(`Level buttons setup. User can access up to level ${userLevel}`);
    }

    private onLevelButtonClick(levelName: string) {
        console.log(`Loading level: ${levelName}`);
        
        // Store user data globally so game levels can access it
        this.storeUserDataGlobally();
        
        // Load the selected level
        cc.director.loadScene(levelName);
    }

    private storeUserDataGlobally() {
        // Store user data globally for game levels to access
        if (typeof window !== 'undefined') {
            (window as any).currentUserData = {
                uid: this.currentUser.uid,
                username: this.userData.username,
                points: this.userData.points,
                lives: this.userData.lives,
                coins: this.userData.coins,
                level: this.userData.level,
            };
            console.log("User data stored globally for game levels");
        }
    }

    private showErrorAndRedirect() {
        console.error("Failed to load user data, redirecting to login");
        
        // Redirect to login after a short delay
        setTimeout(() => {
            cc.director.loadScene('Login');
        }, 2000);
    }

    onDestroy() {
        // Clean up event listeners
        if (this.Level1Button && this.Level1Button.node) {
            this.Level1Button.node.off('click');
        }
    }
}