import { _decorator, Component, Node } from 'cc';
import * as i18n from 'db://i18n/LanguageData';

const { ccclass, property } = _decorator;

@ccclass('share')
export class share extends Component {

    commonPop = null;

    start() {
        this.node.active = false;
    }


    setPopLayer(callfunc: CallableFunction){
        this.commonPop = callfunc
    }

    async clickShare(){
        let herf = location.href;
        let shareLink = herf + "?invite=" + localStorage.getItem("inviteCode")
        navigator.clipboard.writeText(shareLink);
        this.commonPop(i18n.t("share"))
    }

    closeShare(){
        this.node.active = false;
    }

    update(deltaTime: number) {
        
    }
}


