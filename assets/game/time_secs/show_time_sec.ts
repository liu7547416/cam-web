import { _decorator, AudioSource, Component, Label, Node, Sprite, SpriteFrame } from 'cc';
import * as i18n from 'db://i18n/LanguageData';

const { ccclass, property } = _decorator;

@ccclass('show_time_sec')
export class show_time_sec extends Component {

    @property(SpriteFrame)
    numbers: SpriteFrame[] = [];

    @property(Sprite)
    Number1: Sprite = null;

    @property(Sprite)
    Number2: Sprite = null;

    @property(AudioSource)
    sound: AudioSource = null;


    @property(Label)
    text: Label = null;

    totalSec: number = 0

    killerComming = ""

    waitingZH = "秒后杀手入场"
    waitingEN = "Secend killer enter!"

    callfunc: CallableFunction = null


    start() {
        // this.startCountdonw()
        if (i18n._language === 'en') {
            i18n.init('en');
            this.killerComming = "killer coming"
        } else {
            i18n.init('zh');
            this.killerComming = "杀手出现"
        }
        this.text.string = this.killerComming
    }




    setCallback(cb: CallableFunction){
        this.callfunc = cb
    }


    startCountdonw() {
        this.sound.play()
        this.sound.loop = true;
        console.error("开始倒计时：", this.totalSec)
        this.schedule(this.countdonw, 1, this.totalSec)
    }


    countdonw(){
        this.totalSec = this.totalSec - 1
        console.log("倒计时:", this.totalSec)
        if(this.totalSec<=0){
            this.unschedule(this.countdonw)
            //
            this.Number1.spriteFrame =this.numbers[ 0 ]
            this.Number2.spriteFrame =this.numbers[ 0 ]
            this.sound.stop()
            // 调用外部函数获取结果
            this.callfunc()
        }
        //切换图片
        let nums = this.getOneNumber(this.totalSec)
        this.Number1.spriteFrame =this.numbers[ nums[1] ]
        this.Number2.spriteFrame =this.numbers[ nums[0] ]
    }


    reset(){
        this.text.string = i18n._language === 'en' ? this.waitingEN : this.waitingZH;
        this.sound.stop()
        this.Number1.spriteFrame =this.numbers[ 0 ]
        this.Number2.spriteFrame =this.numbers[ 0 ]
    }


    setTimeSec(value, cb: CallableFunction){
        console.log("开始倒计时:", value)
        this.callfunc = cb;
        this.totalSec = value;
        if(value<=0){
            this.sound.stop()
            value = 0
            this.text.string = this.killerComming
            this.Number1.spriteFrame =this.numbers[ 0 ]
            this.Number2.spriteFrame =this.numbers[ 0 ]
            return
        }
        this.startCountdonw()
        //切换图片
        let nums = this.getOneNumber(value)
        this.Number1.spriteFrame =this.numbers[ nums[1] ]
        this.Number2.spriteFrame =this.numbers[ nums[0] ]
    }


    

    getOneNumber(number) {
        // 个位数
        var one = number % 10;
        // 十位数
        var ten = Math.floor((number % 100) / 10);
        return [one, ten];
      }


}


