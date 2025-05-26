// CameraFollow.ts
const { ccclass, property } = cc._decorator;

@ccclass
export default class CameraFollow extends cc.Component {
    @property(cc.Node) target: cc.Node = null;
    @property smoothSpeed: number = 0.125;
    @property offset: cc.Vec3 = cc.v3(0, 2, 0);

    lateUpdate() {
        if (!this.target) return;
        
        const desiredPosition = this.target.position.add(this.offset);
        const smoothedPosition = cc.Vec3.lerp(
            new cc.Vec3(),
            this.node.position,
            desiredPosition,
            this.smoothSpeed
        );
        
        this.node.position = smoothedPosition;
    }
}