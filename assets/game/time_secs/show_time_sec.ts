import { _decorator, Component, Label, Node, Sprite, SpriteFrame } from 'cc';
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


    @property(Label)
    text: Label = null;

    totalSec: number = 0

    killerComming = ""

    waitingZH = "秒后杀手入场"
    waitingEN = "Secend killer enter!"

    start() {
        // this.startCountdonw()
        if (i18n._language === 'en') {
            i18n.init('en');
            this.killerComming = "杀手出现"
        } else {
            i18n.init('zh');
            this.killerComming = "killer coming"
        }
    }




    startCountdonw(sec: number=30) {
        this.totalSec = sec;
        this.schedule(this.countdonw, 1)
    }


    reset(){
        this.text.string = i18n._language === 'en' ? this.waitingEN : this.waitingZH;
        this.Number1.spriteFrame =this.numbers[ 3 ]
        this.Number2.spriteFrame =this.numbers[ 0 ]
    }


    setTimeSec(value){
        if(value<=0){
            value = 0
            this.text.string = this.killerComming
            this.Number1.spriteFrame =this.numbers[ 0 ]
            this.Number2.spriteFrame =this.numbers[ 0 ]
            return
        }
        //切换图片
        let nums = this.getOneNumber(value)
        this.Number1.spriteFrame =this.numbers[ nums[1] ]
        this.Number2.spriteFrame =this.numbers[ nums[0] ]
    }


    countdonw(){
        this.totalSec = this.totalSec - 1
        if(this.totalSec<=0){
            this.text.string = this.killerComming
            this.Number1.spriteFrame =this.numbers[ 0 ]
            this.Number2.spriteFrame =this.numbers[ 0 ]
            this.unschedule(this.countdonw)
        }
        //切换图片
        let nums = this.getOneNumber(this.totalSec)
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


    update(deltaTime: number) {
        
    }
}


