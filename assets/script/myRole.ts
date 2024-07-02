import { _decorator, Animation, AnimationClip, Component, Node, tween, TweenSystem, director, Vec3, random, randomRange, CCInteger } from 'cc';
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



@ccclass('myRole')
export class myRole extends Component {
    that = this;

    URI = "https://gamedevapi.bitcoinxo.io"

    // 预设的行走路径点数组
    walkEnterPath: action[] = [
        new action(-374, -445, 0.2, 0.2),
        new action(-108, -500, 0.2, 0.2)
        // 随机一个点 在范围内 随机x轴翻转
        // new action(-232, -412, xr, 0.2),
        // new action(128, -530, xr, 0.2)
    ];
    walkJobRoomPath: action[] = [
        new action(176, -410, -0.2, 0.2),
        new action(176, -410, -0.2, 0.2),
        new action(176, -152, 0.2, 0.2),
        //
        new action(278, -152, 0.2, 0.2),
        new action(278, -44, 0.2, 0.2)
    ];
    walkMusicRoomPath: action[] = [
        new action(176, -410, -0.2, 0.2),
        new action(176, -410, -0.2, 0.2),
        new action(176, -152, -0.2, 0.2),
        //
        new action(27, -152, -0.2, 0.2),
        new action(27, -262, -0.2, 0.2)
    ];
    walkWaterRoomPath: action[] = [
        new action(176, -410, -0.2, 0.2),
        new action(176, -410, -0.2, 0.2),
        new action(176, -152, -0.2, 0.2),
        //
        new action(-242, -152, -0.2, 0.2),
        new action(-242, -232, -0.2, 0.2)
    ];
    walkWashRoomPath: action[] = [
        new action(176, -410, -0.2, 0.2),
        new action(176, -410, -0.2, 0.2),
        new action(176, -152, -0.2, 0.2),
        //
        new action(-40, -152, -0.2, 0.2),
        new action(-40, -53, -0.2, 0.2)
    ];
    walkDocumentsRoomPath: action[] = [
        new action(176, -410, -0.2, 0.2),
        new action(176, -410, -0.2, 0.2),
        new action(176, -152, -0.2, 0.2),
        new action(176, 76, -0.2, 0.2),
        //
        new action(143, 206, 0.2, 0.2)
    ];
    walkMeetingRoomPath: action[] = [
        new action(176, -410, -0.2, 0.2),
        new action(176, -410, -0.2, 0.2),
        new action(176, -152, -0.2, 0.2),
        new action(176, 76, -0.2, 0.2),
        //
        new action(-126, 100, -0.2, 0.2),
        new action(-270, 100, -0.2, 0.2),
        new action(-270, 44, -0.2, 0.2),
    ];
    walkSundriesRoomPath: action[] = [
        new action(176, -410, -0.2, 0.2),
        new action(176, -410, -0.2, 0.2),
        new action(176, -152, -0.2, 0.2),
        new action(176, 106, -0.2, 0.2),
        //
        new action(-121, 106, -0.2, 0.2),
        new action(-121, 228, -0.2, 0.2),
        new action(-253, 228, -0.2, 0.2)
    ];
    walkMasterRoomPath: action[] = [
        new action(176, -410, -0.2, 0.2),
        new action(176, -410, -0.2, 0.2),
        new action(176, -152, -0.2, 0.2),
        new action(176, 106, -0.2, 0.2),
        //
        new action(13, 106, -0.2, 0.2),
        new action(13, 351, 0.2, 0.2),
        new action(168, 351, 0.2, 0.2),
        new action(168, 490, 0.2, 0.2),
        new action(249, 490, 0.2, 0.2)
    ];
    walkAccountingWayPath: action[] = [
        new action(176, -410, -0.2, 0.2),
        new action(176, -410, -0.2, 0.2),
        new action(176, -152, -0.2, 0.2),
        new action(176, 106, -0.2, 0.2),
        new action(13, 106, -0.2, 0.2),
        new action(13, 319, -0.2, 0.2),
        //
        new action(-159, 319, -0.2, 0.2),
        new action(-232, 398, -0.2, 0.2),
    ];
    walkHallWayPath: action[] = [
        new action(176, -410, -0.2, 0.2),
        new action(176, -410, -0.2, 0.2),
        new action(176, -152, -0.2, 0.2),
        new action(176, 106, -0.2, 0.2),
        new action(13, 106, -0.2, 0.2),
        //
        new action(13, 559, -0.2, 0.2),
        new action(-195, 559, -0.2, 0.2)
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


    @property({type: CCInteger})
    stepSec = 1;

    //
    roomId: number = -1;
    uid: number = 0

    isEnter = false;

    initPos = null;

    getUid(){
        return this.uid
    }

    getRoomId(){
        return this.roomId
    }

    protected onLoad(): void {
        this.animation = this.node.getComponent(Animation)
        this.uid = Number(localStorage.getItem("user"))
        
    }

    clean(){
        this.node.destroy()
    }


    backHall(){
        this.roomId = -1
        this.usePath = this.walkEnterPath;
        this.isEnter = false;
        // this.addRandomPosition()
        let pos = new Vec3(this.usePath[this.usePath.length-1].x, this.usePath[this.usePath.length-1].y, this.node.position.z)
        this.node.position = pos;
        this.animation.stop()
        console.log("back hall!")
    }


    

    inRoom(roomId){
        // if(this.walkIng){
        //     this.animation.stop()
        //     this.inRoom(roomId)
        //     this.walkIng = false;
        //     return
        // }
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
        director.getSystem(TweenSystem.ID).ActionManager.removeAllActionsFromTarget(this.node)
        this.node.position = new Vec3(lastAct.x, lastAct.y, this.node.position.z)
        console.error("前往坐标：",this.node.position, " roomId:",roomId)
        this.animation.stop()
        
    }


    changeRoom(roomId){
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
        director.getSystem(TweenSystem.ID).ActionManager.removeAllActionsFromTarget(this.node)
        this.node.position = new Vec3(lastAct.x, lastAct.y, this.node.position.z)
        console.error("前往坐标：",this.node.position, " roomId:",roomId)
        this.animation.stop()
    }


    initPosition(){
        if(!this.initPos) return
        this.roomId = -1
        this.isEnter = false;
        this.node.setPosition(this.initPos)
    }



    justSetRoomId(roomId){
        this.roomId = roomId
    }

    
    setRoomId(roomId: number){
        this.roomId = roomId;
        this.usePath = this.toRooms[this.roomId]
        this.addRandomPosition();
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



    start() {
        this.animation = this.node.getComponent(Animation)
    }


    wallEnter(){
        if(this.isEnter){
            return
        }
        this.isEnter = true;
        console.error("my walk enter~!")
        
        this.usePath = this.walkEnterPath;
        // this.addRandomPosition();
        let startPos = this.usePath[0]
        this.node.setPosition(new Vec3(startPos.x, startPos.y, this.node.getPosition().z))
        this.node.setScale(new Vec3(startPos.scaleX, startPos.scaleY, 0))
        this.walk()
    }


    enterGame(){
        this.uid = Number(localStorage.getItem("user"))
        this.usePath = this.walkEnterPath;
        // this.addRandomPosition();
        //
        if(this.currentPathIndex == 0){
            this.animation.play("walk")
        }
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
                if(this.currentPathIndex == this.usePath.length){
                    console.error(">> walk done!")
                    this.animation.stop()
                    // this.currentPathIndex = -1
                    // this.animation.play("killer_action")
                }else{
                    // console.log(">> animation next step!")
                    this.enterGame()
                }
            })
            .start()
    }


    walk() {
        if(this.currentPathIndex == 0){
            this.animation.play("walk")
        }
        // 
        const act = this.usePath[this.currentPathIndex];
        // console.log("act: ", act, " idx:", this.currentPathIndex)
        if(!act){
            this.currentPathIndex = 0
            this.animation.stop()
            return
        }
        tween(this.node)
            .to(1, { position: new Vec3(act.x, act.y, this.node.position.z)})
            .call((userRole: Node)=>{
                this.currentPathIndex++;
                userRole.scale = new Vec3(act.scaleX, act.scaleY, 0);
                // console.log("tween myRole pos:", userRole.position)
                if(this.currentPathIndex == this.usePath.length){
                    this.animation.stop()
                    this.currentPathIndex = 0
                }else{
                    // console.log(">> animation next step!")
                    this.walk()
                }
            })
            .start()
    }


}


