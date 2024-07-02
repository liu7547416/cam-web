import { _decorator, Component, Node, Label, Color } from 'cc';
import * as i18n from 'db://i18n/LanguageData';
const { ccclass, property } = _decorator;

@ccclass('WithdrawItemInfo')
export class WithdrawItemInfo extends Component {
    @property(Label)
    dateLabel: Label = null;

    @property(Label)
    amountLabel: Label = null;

    @property(Label)
    actualAmountLabel: Label = null;

    @property(Label)
    processingLabel: Label = null;

    @property(Label)
    hashLabel: Label = null;

    @property(Label)
    statusLabel: Label = null;

    txHash: string = ""

    // 青灰、绿、玫红、金、亮蓝、橘红
    TYPE_COLORS = ["#708090", "#5f9ea0", "#dda0dd", "#ffd700", "#add8e6", "#ff4500"]


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
        // burn_amoun
        this.dateLabel.string = this.timestampToStr(data.create_time),
        this.amountLabel.string = data.withdraw_amount + ' CORN',
        this.processingLabel.string = this.timestampToStr(data.update_time),
        this.actualAmountLabel.string = data.receive_amount + ' BIXO',
        this.txHash = data.tx_hash,
        this.hashLabel.string =  this.txHash ? data.tx_hash.slice(0, 10) + "***********"+ data.tx_hash.slice(0, 10) : '----';
        // console.warn("show status:", i18n.t(`withdraw_${data.withdraw_status}`))
        
        this.statusLabel.getComponent("LocalizedLabel").key = `withdraw_${data.withdraw_status}`;
        var statusColor = this.TYPE_COLORS[parseInt(data.withdraw_status)];
        console.warn("Color is:", statusColor)
        this.statusLabel.color = new Color(statusColor)
        // console.warn(this.statusLabel.getComponent("LocalizedLabel").key)
        // var statusColor = this.TYPE_COLORS[parseInt(data.tx_type)-1];
        // this.statusLabel.color = new Color(statusColor);
        // console.log("color:", this.statusLabel.color)
        // this.statusLabel.updateRenderData(true)
    }

    touchCopy(){
        navigator.clipboard.writeText(this.txHash)
    }

    start() {

    }

    update(deltaTime: number) {
        
    }
}


