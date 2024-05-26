import { _decorator, Component, Label, Layout, Node, AudioSource } from 'cc';
import * as i18n from 'db://i18n/LanguageData';
const { ccclass, property } = _decorator;

@ccclass('game_res')
export class game_res extends Component {

    @property(Layout)
    winLayout: Layout = null
    @property(Layout)
    lostLayout: Layout = null


    @property(Label)
    winRoomLabel: Label = null
    @property(Label)
    winValueLabel: Label = null

    @property(Label)
    lostRoomLabel: Label = null
    @property(Label)
    loseValueLabel: Label = null

    @property(AudioSource)
    audio: AudioSource = null


    win = false;
    roomValue = 0;
    roomId = 0


    delay = true;


    callback: CallableFunction = null;
    

    updateLang() {
        if (i18n._language === 'en') {
            i18n.init('en');
        } else {
            i18n.init('zh');
        }
        i18n.updateSceneRenderers();
    }

    hide(){
        this.node.active = false;
    }

    showStatus(win: boolean, roomValue: number, roomId: number){
        this.win = win;
        this.roomValue = roomValue;
        this.roomId = roomId - 1;
        if(this.delay){
            this.delay = false;
            this.scheduleOnce(this.delayShow, 5)
            return
        }
    }

    delayShow(){
        this.node.active = true;
        this.audio.play()
        i18n._language=="zh"
        if(this.win){
            this.winLayout.node.active = true;
            this.lostLayout.node.active = false;
            this.winRoomLabel.string = i18n.t(''+ (this.roomId-1));
            this.winValueLabel.string = '' + this.roomValue;
        }else{
            this.winLayout.node.active = false;
            this.lostLayout.node.active = true;
            this.lostRoomLabel.string = i18n.t(''+ (this.roomId-1));
            this.loseValueLabel.string = '' + this.roomValue;
        }
        this.updateLang()
        this.scheduleOnce(this.hide, 3)
    }

    start() {
        
    }

    update(deltaTime: number) {
        
    }
}


