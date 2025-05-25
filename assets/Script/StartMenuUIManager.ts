const { ccclass, property } = cc._decorator;

@ccclass
export default class StartMenuUIManager extends cc.Component {
    @property(cc.Node) startMenu: cc.Node = null;
    @property(cc.Node) loginPage: cc.Node = null;
    @property(cc.Node) signUpPage: cc.Node = null;
    @property(cc.Node) loginButton: cc.Node = null;
    @property(cc.Node) signUpButton: cc.Node = null;
    @property(cc.Node) realLoginButton: cc.Node = null;
    @property(cc.Node) realSignUpButton: cc.Node = null;
    

    onLoad() {
        // ensure clean starting state
        this.startMenu.active = true;  
        this.startMenu.opacity = 255;
        this.loginPage.active = false;
        this.loginPage.opacity = 255;
        this.signUpPage.active = false;
        this.signUpPage.opacity = 255;
    }

    onShowLogin() {
        // 1. Show & reset LoginPage BEFORE fading anything else
        this.loginPage.active = true;
        this.loginPage.opacity = 0;
        // bring it to top
        this.loginPage.setSiblingIndex(
            this.loginPage.parent.childrenCount - 1
        );

        // 2. Fade out StartMenu
        cc.tween(this.startMenu)
            .to(0.3, { opacity: 0 })
            .call(() => {
                this.startMenu.active = false;
            })
            .start();

        // 3. Fade in LoginPage
        cc.tween(this.loginPage)
            .to(0.3, { opacity: 255 })
            .start();
    }

    onShowSignUp() {
        // mirror of onShowLogin, but for signUpPage
        this.signUpPage.active = true;
        this.signUpPage.opacity = 0;
        this.signUpPage.setSiblingIndex(
            this.signUpPage.parent.childrenCount - 1
        );

        cc.tween(this.startMenu)
            .to(0.3, { opacity: 0 })
            .call(() => {
                this.startMenu.active = false;
            })
            .start();

        // ← fixed: tween signUpPage, not loginPage
        cc.tween(this.signUpPage)
            .to(0.3, { opacity: 255 })
            .start();
    }

    onShowStartMenu() {
        // back to the main menu
        this.loginPage.active = false;
        this.signUpPage.active = false;
        this.startMenu.active = true;
        this.startMenu.opacity = 255;
    }

    onLogin(){

    }

    onSignUp(){
        
    }
}
