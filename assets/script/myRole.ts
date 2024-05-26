import { _decorator, Animation, AnimationClip, Component, Node, tween, Vec3, random, randomRange, CCInteger } from 'cc';
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
    walkWashRoomPath: action[] = [
        new action(176, -410, -0.2, 0.2),
        new action(176, -410, -0.2, 0.2),
        new action(176, -152, -0.2, 0.2),
        //
        new action(-242, -152, -0.2, 0.2),
        new action(-242, -232, -0.2, 0.2)
    ];
    walkWaterRoomPath: action[] = [
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
        let act = this.randomPosition()
        this.node.position = new Vec3(act.x, act.y, this.node.position.z)
        this.animation.stop()
    }


    

    inRoom(roomId){
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
        this.node.position = new Vec3(lastAct.x, lastAct.y, this.node.position.z)
        console.error("前往坐标：",this.node.position, " roomId:",roomId)
        this.animation.stop()
    }

    inHall(){
        let act = this.randomPosition()
        this.node.position = new Vec3(act.x, act.y, this.node.position.z)
    }


    setToRoomPosition(roomId: number){
        let walk_to_room = false;
        if(this.roomId==-1){
            walk_to_room = true;
        }
        if(this.roomId == roomId){ 
            return console.log("roomId no change!")
        }
        //
        this.roomId = roomId;
        // 范围内 随机坐标偏移
        let randomX = randomRange(-5, 5)
        let randomY = randomRange(-5, 5)
        // 修改最后点
        let roomPathLength = this.toRooms[this.roomId].length
        let lastAct = this.toRooms[this.roomId][roomPathLength - 1]
        this.toRooms[this.roomId][roomPathLength - 1].x = lastAct.x + randomX
        this.toRooms[this.roomId][roomPathLength - 1].y = lastAct.y + randomY
        if(walk_to_room){
            this.usePath = this.toRooms[this.roomId]
            this.walk()
        }else{
            // 闪现至房间
            lastAct.x = lastAct.x + randomX
            lastAct.y = lastAct.y + randomY
            this.node.position = new Vec3(lastAct.x, lastAct.y, this.node.position.z)
            this.animation.stop()
        }
    }


    justSetRoomId(roomId){
        this.roomId = roomId
    }

    
    setRoomId(roomId: number){
        this.roomId = roomId;
        this.usePath = this.toRooms[this.roomId]
        this.usePath.push(this.randomPosition());
        this.walk()
    }

    reqEnterRoom(roomId: number){
        // 获取当前轮信息
        const formData = new FormData()
        // formData.append("round", '' +0)
        formData.append("uid", '' +this.uid)
        // formData.append("chainid", "" + EthersUtils.ChainParams.ChainId)
        let _headers = new Headers()
        _headers.append("Content-Type", "multipart/form-data")
        // this.showLoading(true)
        fetch(this.URI + "/round/info", 
            {method: "POST", 
            mode: "cors", 
            cache: "no-cache", 
            body: formData
        }).then((response: Response) => {
            let res = response.text()
            // console.info("rund info text:", res);
            return res
        }).then((value) => {
            // this.showLoading(false)
            let res = JSON.parse(value)
            let data = res.data;
            //
            this.roomId = roomId;
            this.usePath = this.toRooms[this.roomId]
            console.log("this.usePath: ", this.usePath)
            if(this.roomId!=-1){
                let lastAction = this.usePath[this.usePath.length-1];
                this.node.position = new Vec3(lastAction.x, lastAction.y, this.node.position.z)
                console.log("切换房间")
                this.animation.stop()
            }else{
                console.warn("首次进入，步行。")
                this.walk()
            }
        }).catch(e=>{
            //登陆失败UI弹窗
            alert("进入房间失败！")
            console.error("get round info error: ", e)
        });
    }


    randomPosition(){
        let minX=-232, minY=-412, widht=190, height=90;
        let randomX = random() * widht,  randomY = random() * height,
        x = minX + parseInt('' +randomX) , y = minY - parseInt('' +randomY);
        let targetLR = x>this.walkEnterPath[1].x ? 0.2 : -0.2;
        this.walkEnterPath[1].scaleX = targetLR;
        let act = new action(x, y, targetLR, 0.2)
        return act;
    }



    start() {
        this.animation = this.node.getComponent(Animation)
    }

    wallEnter(){
        this.walkEnterPath.push(this.randomPosition());
        this.usePath = this.walkEnterPath;
        this.walk()
    }


    enterGame(){
        this.uid = Number(localStorage.getItem("user"))
        this.walkEnterPath.push(this.randomPosition());
        this.usePath = this.walkEnterPath;
        //
        if(this.currentPathIndex == 0){
            this.animation.play("walk")
        }
        // 
        const act = this.usePath[this.currentPathIndex];
        if(!act){
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
                    // console.error(">> animation done!")
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
        console.log("act: ", act, " idx:", this.currentPathIndex)
        if(!act){
            this.currentPathIndex = 0
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
            .union()
            .start()
    }


}


