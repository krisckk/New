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


    onLoad() {
        // bind the two buttons
        this.realSignUpButton.node.on('click', this.onSignUp, this);
        this.realLoginButton.node.on('click', this.onLogin, this);
    }

    // ─── Sign-Up handler ────────────────────
    private async onSignUp() {
        const email = this.signUpEmail.string.trim();
        const username = this.signUpUsername.string.trim();
        const password = this.signUpPassword.string;

        firebase.auth().createUserWithEmailAndPassword(email, password)
            .then((userCredential: any) => {
                const uid = userCredential.user.uid;
                return firebase.firestore().collection('users').doc(uid).set({
                    username: username,
                    email: email,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            })
            .then(() => {
                console.log("註冊成功！");
                //this.setMessage("註冊成功！", true); // ✅ 顯示成功訊息（綠色）
                cc.director.loadScene('LevelScene');
            })
            .catch((error: any) => {
                console.error("註冊失敗:", error.code, error.message);
            });
    }

    // ─── Login handler ──────────────────────
    private async onLogin() {
        const email = this.loginEmail.string.trim();
        const password = this.loginPassword.string;

        firebase.auth().signInWithEmailAndPassword(email, password)
            .then((userCredential: any) => {
                console.log("登入成功:", userCredential.user.email);
                //this.setMessage("登入成功！", true);
                cc.director.loadScene('LevelScene');
            })
            .catch((error: any) => {
                console.error("登入失敗:", error.code, error.message);
            });
    }
}
