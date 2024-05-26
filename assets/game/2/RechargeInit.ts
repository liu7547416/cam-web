import { _decorator, Component, Label, Node } from 'cc';
const { ccclass, property } = _decorator;



@ccclass('RechargeInit')
export class RechargeInit extends Component {

    @property(Label)
    dateLabel: Label = null;

    @property(Label)
    amountLabel: Label = null;

    @property(Label)
    hashLabel: Label = null;

    txHash: string = ""

    timestampToStr(timestamp) {
        var date = new Date(timestamp*1000);
        var year = date.getFullYear();
        var month = date.getMonth() + 1; // 月份从0开始
        var day = date.getDate();
        var hours = date.getHours();
        var minutes = date.getMinutes();
        var seconds = date.getSeconds();
     
        // 补零操作
        let monthStr = month < 10 ? '0' + month : month;
        let dayStr = day < 10 ? '0' + day : day;
        let hoursStr = hours < 10 ? '0' + hours : hours;
        let minutesStr = minutes < 10 ? '0' + minutes : minutes;
        let secondsStr = seconds < 10 ? '0' + seconds : seconds;
     
        return `${year}-${monthStr}-${dayStr} ${hoursStr}:${minutesStr}:${secondsStr}`;
    }
    
    

    setData(data: any){
        this.dateLabel.string = this.timestampToStr(data.create_time),
        this.amountLabel.string = data.amount + ' CORN',
        this.txHash = data.tx_hash,
        this.hashLabel.string =  data.tx_hash.slice(0, 10) + "***********"+ data.tx_hash.slice(0, 10)
    }

    touchCopy(){
        navigator.clipboard.writeText(this.txHash)
        alert("已复制hash!")
    }


    start() {

    }

    update(deltaTime: number) {
        
    }
}

