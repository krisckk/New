const { ccclass, property } = cc._decorator;

@ccclass
export default class PlayerController extends cc.Component {
    // Movement properties
    @property
    moveSpeed: number = 200;
    
    @property
    jumpForce: number = 400;
    
    @property
    gravity: number = -800;

    // Animation properties
    @property(cc.Animation)
    anim: cc.Animation = null;

    // Ground check
    @property
    groundCheckDistance: number = 10;
    
    @property(cc.Node)
    groundCheckNode: cc.Node = null;

    // Player state
    private isGrounded: boolean = true;
    private facingRight: boolean = true;
    private verticalVelocity: number = 0;
    private moveDirection: number = 0;

    onLoad() {
        // Initialize animation component
        this.anim = this.getComponent(cc.Animation);

        // Set up input listeners
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
    }

    onDestroy() {
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
    }

    onKeyDown(event: cc.Event.EventKeyboard) {
        switch(event.keyCode) {
            case cc.macro.KEY.a:
            case cc.macro.KEY.left:
                this.moveDirection = -1;
                break;
            case cc.macro.KEY.d:
            case cc.macro.KEY.right:
                this.moveDirection = 1;
                break;
            case cc.macro.KEY.space:
                this.jump();
                break;
        }
    }

    onKeyUp(event: cc.Event.EventKeyboard) {
        switch(event.keyCode) {
            case cc.macro.KEY.a:
            case cc.macro.KEY.left:
            case cc.macro.KEY.d:
            case cc.macro.KEY.right:
                this.moveDirection = 0;
                break;
        }
    }

    jump() {
        if (this.isGrounded) {
            this.verticalVelocity = this.jumpForce;
            this.isGrounded = false;
            this.anim.play('jump');
        }
    }

    update(dt: number) {
        // Handle horizontal movement
        this.handleMovement(dt);
        
        // Handle vertical movement
        this.handleGravity(dt);
        
        // Update character direction
        this.updateDirection();
        
        // Update animations
        this.updateAnimations();
    }

    handleMovement(dt: number) {
        this.node.x += this.moveDirection * this.moveSpeed * dt;
    }

    handleGravity(dt: number) {
        if (!this.isGrounded) {
            this.verticalVelocity += this.gravity * dt;
            this.node.y += this.verticalVelocity * dt;
            
            // Simple ground check (adjust according to your level design)
            if (this.node.y <= 0) {
                this.node.y = 0;
                this.isGrounded = true;
                this.verticalVelocity = 0;
            }
        }
    }

    updateDirection() {
        if (this.moveDirection !== 0) {
            this.facingRight = this.moveDirection > 0;
            this.node.scaleX = Math.abs(this.node.scaleX) * (this.facingRight ? 1 : -1);
        }
    }

    updateAnimations() {
        if (!this.anim) return;

        if (!this.isGrounded) {
            if (!this.anim.getAnimationState('jump').isPlaying) {
                this.anim.play('jump');
            }
        } else {
            if (this.moveDirection !== 0) {
                if (!this.anim.getAnimationState('run').isPlaying) {
                    this.anim.play('run');
                }
            } else {
                if (!this.anim.getAnimationState('idle').isPlaying) {
                    this.anim.play('idle');
                }
            }
        }
    }
}