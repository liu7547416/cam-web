import { _decorator, Animation, AnimationClip, Component, Node, tween, TweenSystem, director, Vec3, random, Label, randomRange, CCInteger } from 'cc';
const { ccclass, property } = _decorator;


class action {
    @property
    x: number = 0;

    @property
    y: number = 0;

    @property
    scaleX: number = 0;

    @property
    scaleY: number = 0;

    constructor(x: number, y: number, scaleX: number, scaleY: number){
        this.x = x;
        this.y = y;
        this.scaleX = scaleX;
        this.scaleY = scaleY;
    }
}



@ccclass('otherRole')
export class otherRole extends Component {
    that = this;

    URI = "https://gamedevapi.bitcoinxo.io"
    
    // 预设的行走路径点数组
    walkEnterPath: action[] = [
        new action(-374, -445, 0.15, 0.15),
        new action(-108, -500, 0.15, 0.15),
        // 随机一个点 在范围内 随机x轴翻转
        // new action(-232, -412, xr, 0.15),
        // new action(128, -530, xr, 0.15)
    ];
    walkJobRoomPath: action[] = [
        new action(176, -410, -0.2, 0.2),
        new action(176, -410, -0.15, 0.15),
        new action(176, -152, 0.15, 0.15),
        //
        new action(278, -152, 0.15, 0.15),
        new action(278, -44, 0.15, 0.15)
    ];
    walkMusicRoomPath: action[] = [
        new action(176, -410, -0.2, 0.2),
        new action(176, -410, -0.15, 0.15),
        new action(176, -152, -0.15, 0.15),
        //
        new action(27, -152, -0.15, 0.15),
        new action(27, -262, -0.15, 0.15)
    ];
    walkWaterRoomPath: action[] = [
        new action(176, -410, -0.2, 0.2),
        new action(176, -410, -0.15, 0.15),
        new action(176, -152, -0.15, 0.15),
        //
        new action(-242, -152, -0.15, 0.15),
        new action(-242, -232, -0.15, 0.15)
    ];
    walkWashRoomPath: action[] = [
        new action(176, -410, -0.2, 0.2),
        new action(176, -410, -0.15, 0.15),
        new action(176, -152, -0.15, 0.15),
        //
        new action(-40, -152, -0.15, 0.15),
        new action(-40, -53, -0.15, 0.15)
    ];
    walkDocumentsRoomPath: action[] = [
        new action(176, -410, -0.2, 0.2),
        new action(176, -410, -0.15, 0.15),
        new action(176, -152, -0.15, 0.15),
        new action(176, 76, -0.15, 0.15),
        //
        new action(143, 206, 0.15, 0.15)
    ];
    walkMeetingRoomPath: action[] = [
        new action(176, -410, -0.2, 0.2),
        new action(176, -410, -0.15, 0.15),
        new action(176, -152, -0.15, 0.15),
        new action(176, 76, -0.15, 0.15),
        //
        new action(-126, 100, -0.15, 0.15),
        new action(-270, 100, -0.15, 0.15),
        new action(-270, 44, -0.15, 0.15),
    ];
    walkSundriesRoomPath: action[] = [
        new action(176, -410, -0.2, 0.2),
        new action(176, -410, -0.15, 0.15),
        new action(176, -152, -0.15, 0.15),
        new action(176, 106, -0.15, 0.15),
        //
        new action(-121, 106, -0.15, 0.15),
        new action(-121, 228, -0.15, 0.15),
        new action(-253, 228, -0.15, 0.15)
    ];
    walkMasterRoomPath: action[] = [
        new action(176, -410, -0.2, 0.2),
        new action(176, -410, -0.15, 0.15),
        new action(176, -152, -0.15, 0.15),
        new action(176, 106, -0.15, 0.15),
        //
        new action(13, 106, -0.15, 0.15),
        new action(13, 351, 0.15, 0.15),
        new action(168, 351, 0.15, 0.15),
        new action(168, 490, 0.15, 0.15),
        new action(249, 490, 0.15, 0.15)
    ];
    walkAccountingWayPath: action[] = [
        new action(176, -410, -0.2, 0.2),
        new action(176, -410, -0.15, 0.15),
        new action(176, -152, -0.15, 0.15),
        new action(176, 106, -0.15, 0.15),
        new action(13, 106, -0.15, 0.15),
        new action(13, 319, -0.15, 0.15),
        //
        new action(-159, 319, -0.15, 0.15),
        new action(-232, 398, -0.15, 0.15),
    ];
    walkHallWayPath: action[] = [
        new action(176, -410, -0.10, 0.10),
        new action(176, -410, -0.15, 0.10),
        new action(176, -152, -0.15, 0.15),
        new action(176, 106, -0.15, 0.15),
        new action(13, 106, -0.15, 0.15),
        //
        new action(13, 559, -0.15, 0.15),
        new action(-195, 559, -0.15, 0.15)
    ];




    toRooms = [
        this.walkJobRoomPath,
        this.walkMusicRoomPath,
        this.walkWashRoomPath,
        this.walkWaterRoomPath,
        this.walkDocumentsRoomPath,
        this.walkMeetingRoomPath,
        this.walkSundriesRoomPath,
        this.walkMasterRoomPath,
        this.walkAccountingWayPath,
        this.walkHallWayPath
    ]

    usePath: action[];
    // 前进到第几个点
    currentPathIndex: number = 0;


    @property(AnimationClip)
    animationClip: AnimationClip = null;
    animation: Animation = null;


    @property(Label)
    nameLabel: Label = null;

    @property({type: CCInteger})
    stepSec = 1;

    //
    roomId: number = -1;
    uid: number = 0
    username: string = ""



    protected onLoad(): void {
        this.animation = this.node.getComponent(Animation)
    }

    
    start() {
        //实列化就行走
        
    }


    getUid(){
        return this.uid
    }

    getRoomId(){
        return this.roomId
    }

    setName(address, uid){
        this.username = address
        this.uid = uid;
        if(address.length<10){
            this.nameLabel.string = ''
        }
        this.nameLabel.string = address.slice(0, 6)+'****'+address.slice(-4);
    }

    clean(){
        this.node.destroy()
    }

    enterHall(){
        this.usePath = this.walkEnterPath;
        this.addRandomPosition()
        this.walk()
    }


    backHall(){
        this.roomId = -1
        this.usePath = this.walkEnterPath;
        this.addRandomPosition()
        let lastPos = this.usePath[this.usePath.length -1]
        this.node.position = new Vec3(lastPos.x, lastPos.y, this.node.position.z)
        this.animation.stop()
        console.error("old player intance back hall:", this.node.position)
    }


    inRoom(roomId){
        director.getSystem(TweenSystem.ID).ActionManager.removeAllActionsFromTarget(this.node)
        // new TweenSystem().ActionManager.removeAllActionsFromTarget(this.node)
        this.roomId = roomId;
        // 范围内 随机坐标
        let randomX = randomRange(-5, 5)
        let randomY = randomRange(-5, 5)
        // 修改最后点
        let roomPathLength = this.toRooms[this.roomId].length
        let lastAct = this.toRooms[this.roomId][roomPathLength - 1]
        // 闪现至房间
        lastAct.x = lastAct.x + randomX
        lastAct.y = lastAct.y + randomY
        this.node.position = new Vec3(lastAct.x, lastAct.y, this.node.position.z)
        this.animation.stop()
        // 
    }

    changeRoom(roomId){
        console.log("变房间：", this.roomId, " >", roomId)
        director.getSystem(TweenSystem.ID).ActionManager.removeAllActionsFromTarget(this.node)
        this.roomId = roomId;
        // 范围内 随机坐标
        let randomX = randomRange(-5, 5)
        let randomY = randomRange(-5, 5)
        // 修改最后点
        let roomPathLength = this.toRooms[this.roomId].length
        let lastAct = this.toRooms[this.roomId][roomPathLength - 1]
        // 闪现至房间
        lastAct.x = lastAct.x + randomX
        lastAct.y = lastAct.y + randomY
        this.node.position = new Vec3(lastAct.x, lastAct.y, this.node.position.z)
        // console.error("前往坐标：",this.node.position, " roomId:",roomId)
        this.animation.stop()
    }


    setRoomId(roomId: number){
        this.roomId = roomId;
        this.usePath = this.toRooms[this.roomId]
        this.addRandomPosition()
        this.walk()
    }


    addRandomPosition(){
        let lastPos = this.usePath[this.usePath.length-1]
        let randomX = randomRange(-5, 5)
        let randomY = randomRange(-5, 5)
        let targetLR = lastPos.x>randomX ? 0.2 : -0.2
        if(this.roomId==-1){
            randomX = randomRange(-100, 100)
            randomY = randomRange(-50, 50)
            targetLR = randomX>0 ? 0.2 : -0.2
        }
        this.usePath[this.usePath.length-1].scaleX = targetLR;
        this.usePath[this.usePath.length-1].x = this.usePath[this.usePath.length-1].x + randomX
        this.usePath[this.usePath.length-1].y = this.usePath[this.usePath.length-1].y + randomY;
        return this.usePath[this.usePath.length-1];
    }


    walk() {
        this.animation.play("walk")
        
        // 
        const act = this.usePath[this.currentPathIndex];
        if(!act){
            this.currentPathIndex = 0
            this.animation.stop()
            return 
        }
        tween(this.node)
            .to(this.stepSec, { position: new Vec3(act.x, act.y, this.node.position.z)})
            .call((userRole: Node)=>{
                this.currentPathIndex++;
                userRole.scale = new Vec3(act.scaleX, act.scaleY, 0);
                // console.log("tween myRole pos:", userRole.position)
                if(this.currentPathIndex >= this.usePath.length){
                    this.animation.stop()
                    this.currentPathIndex = 0
                    console.warn("walk stop!")
                }else{
                    // console.log(">> animation next step!")
                    this.walk()
                }
            })
            .start()
    }

}


