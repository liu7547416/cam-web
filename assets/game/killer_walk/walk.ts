import { _decorator, Animation, AnimationClip, Component, director, Node, tween, Vec3, CCInteger, AudioSource } from 'cc';
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



@ccclass('walk')
export class walk extends Component {
    that = this;
    
    // 预设的行走路径点数组
    walkJobRoomPath: action[] = [
        new action(405, -535, -0.1, 0.1),
        new action(176, -535, -0.1, 0.1),
        new action(176, -152, 0.1, 0.1),
        //
        new action(278, -152, 0.1, 0.1),
        // new action(278, -44, 0.1, 0.1)
    ];
    walkMusicRoomPath: action[] = [
        new action(405, -535, -0.1, 0.1),
        new action(176, -535, -0.1, 0.1),
        new action(176, -152, -0.1, 0.1),
        //
        new action(27, -152, -0.1, 0.1),
        new action(27, -262, -0.1, 0.1)
    ];
    walkWaterRoomPath: action[] = [
        new action(405, -535, -0.1, 0.1),
        new action(176, -535, -0.1, 0.1),
        new action(176, -152, -0.1, 0.1),
        //
        new action(-242, -152, -0.1, 0.1),
        new action(-242, -232, -0.1, 0.1)
    ];
     walkWashRoomPath: action[] = [
        new action(405, -535, -0.1, 0.1),
        new action(176, -535, -0.1, 0.1),
        new action(176, -152, -0.1, 0.1),
        //
        new action(-40, -152, -0.1, 0.1),
        new action(-40, -53, -0.1, 0.1)
    ];
    walkDocumentsRoomPath: action[] = [
        new action(405, -535, -0.1, 0.1),
        new action(176, -535, -0.1, 0.1),
        new action(176, -152, -0.1, 0.1),
        new action(176, 76, -0.1, 0.1),
        //
        new action(143, 206, 0.1, 0.1)
    ];
    walkMeetingRoomPath: action[] = [
        new action(405, -535, -0.1, 0.1),
        new action(176, -535, -0.1, 0.1),
        new action(176, -152, -0.1, 0.1),
        new action(176, 76, -0.1, 0.1),
        //
        new action(-126, 100, -0.1, 0.1),
        new action(-270, 100, -0.1, 0.1),
        new action(-270, 44, -0.1, 0.1),
    ];
    walkSundriesRoomPath: action[] = [
        new action(405, -535, -0.1, 0.1),
        new action(176, -535, -0.1, 0.1),
        new action(176, -152, -0.1, 0.1),
        new action(176, 106, -0.1, 0.1),
        //
        new action(-121, 106, -0.1, 0.1),
        new action(-121, 228, -0.1, 0.1),
        new action(-253, 228, -0.1, 0.1)
    ];
    walkMasterRoomPath: action[] = [
        new action(405, -535, -0.1, 0.1),
        new action(176, -535, -0.1, 0.1),
        new action(176, -152, -0.1, 0.1),
        new action(176, 106, -0.1, 0.1),
        //
        new action(13, 106, -0.1, 0.1),
        new action(13, 351, 0.1, 0.1),
        new action(168, 351, 0.1, 0.1),
        new action(168, 490, 0.1, 0.1),
        new action(249, 490, 0.1, 0.1)
    ];
    walkAccountingWayPath: action[] = [
        new action(405, -535, -0.1, 0.1),
        new action(176, -535, -0.1, 0.1),
        new action(176, -152, -0.1, 0.1),
        new action(176, 106, -0.1, 0.1),
        new action(13, 106, -0.1, 0.1),
        new action(13, 319, -0.1, 0.1),
        //
        new action(-159, 319, -0.1, 0.1),
        new action(-232, 398, -0.1, 0.1),
    ];
    walkHallWayPath: action[] = [
        new action(405, -535, -0.1, 0.1),
        new action(176, -535, -0.1, 0.1),
        new action(176, -152, -0.1, 0.1),
        new action(176, 106, -0.1, 0.1),
        new action(13, 106, -0.1, 0.1),
        //
        new action(13, 559, -0.1, 0.1),
        new action(-195, 559, -0.1, 0.1)
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


    @property(AudioSource)
    kill_sound: AudioSource = null;
    kill_sound_play_count = 0

    //
    roomId: number = -1;

    startPosition = null

    killEventCallback: CallableFunction = null;

    protected onLoad(): void {
        this.animation = this.node.getComponent(Animation)
    }

    setRoomId(roomId: number, killEventCallback: CallableFunction){
        this.roomId = Number(roomId);
        this.killEventCallback = killEventCallback;
        this.node.position = new Vec3(500, -500, this.node.position.z);
        this.node.active = true;
        // this.roomId = Number(roomId);
        console.warn("击杀房间：", this.roomId)
        this.usePath = this.toRooms[this.roomId]
        this.walk()
    }


    start() {
        // this.setRoomId(1)
        // this.startPosition = this.node.position
        //
        this.kill_sound.node.on(AudioSource.EventType.ENDED, this.onAudioEnded, this);
    }

    onAudioEnded(){
        this.kill_sound_play_count++
        if(this.kill_sound_play_count>3){
            this.kill_sound_play_count = 0
            this.kill_sound.stop()
            this.node.active = false;
            console.error("杀手回初始坐标：", this.node.position)
            this.killEventCallback()
            return
        }
        this.kill_sound.play()
    }


    walk() {
        if(this.currentPathIndex == 0){
            this.animation.play("walk")
        }
        // 
        const act = this.usePath[this.currentPathIndex];
        if(!act){
            this.animation.play("action")
            this.kill_sound.play()
            return
        }
        tween(this.node)
            .to(this.stepSec, { position: new Vec3(act.x, act.y, this.node.position.z)})
            .call((killer: Node)=>{
                this.currentPathIndex++;
                killer.scale = new Vec3(act.scaleX, act.scaleY, 0);
                // console.log("tween killer pos:", killer.position)
                if(this.currentPathIndex == this.usePath.length){
                    // console.error(">> animation done!")
                    this.animation.play("action")
                    this.kill_sound.play()
                    
                }else{
                    // console.log(">> animation next step!")
                    this.walk()
                }
            })
            .start()
    }


}


