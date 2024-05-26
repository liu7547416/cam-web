import { _decorator, Component, Node, Label, Color } from 'cc';
import * as i18n from 'db://i18n/LanguageData';

const { ccclass, property } = _decorator;

@ccclass('TransactionInfo')
export class TransactionInfo extends Component {
    @property(Label)
    dateLabel: Label = null;

    @property(Label)
    amountLabel: Label = null;

    @property(Label)
    balanceLabel: Label = null;

    @property(Label)
    statusLabel: Label = null;

    itemInfo: any = null

    // 绿、金、亮蓝、玫红、青灰、橘红
    TYPE_COLORS = ["#5f9ea0", "#ffd700", "#add8e6", "#dda0dd", "#708090", "#ff4500"]

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
        this.itemInfo = data;
        this.dateLabel.string = this.timestampToStr(data.create_time);
        this.amountLabel.string = data.amount + ' BIXO';
        let showStatus = i18n.t(`tx_type_${data.tx_type}`)
        console.warn("trans status text:", showStatus)
        var statusColor = this.TYPE_COLORS[parseInt(data.tx_type)-1];
        this.statusLabel.string =   showStatus ? showStatus : '--';
        this.statusLabel.color = new Color(statusColor);
        this.balanceLabel.string = data.balance + ' CORN';
        // this.hashLabel.string =  data.tx_hash.slice(0, 10) + "***********"+ data.tx_hash.slice(0, 10)
    }

    // touchCopy(){
    //     navigator.clipboard.writeText(this.itemInfo.tx)
    //     alert("已复制hash!")
    // }

    update(deltaTime: number) {
        
    }
}


