import { _decorator, Component, Node, Label } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('top_bar')
export class top_bar extends Component {

    @property(Node)
    connectNode: Node = null;

    @property(Node)
    addressNode: Node = null;

    @property(Label)
    connectTextLabel: Label = null;

    @property(Label)
    addressTextLabel: Label = null;

    @property(Label)
    titleTextLabel: Label = null;


    setEn(addr0x: string) {
        this.titleTextLabel.string = "TOM & JERRY"
        this.connectTextLabel.string = "Connect Wallet";
        //
        if(addr0x){
            this.addressTextLabel.string = addr0x
            this.addressNode.active = true
            this.connectNode.active = false;
        }else{
            this.addressTextLabel.string = ""
            this.addressNode.active = false
            this.connectNode.active = true;
        }
    }

    setCh(addr0x: string) {
        this.titleTextLabel.string = "汤姆和杰瑞";
        this.connectTextLabel.string = "连接钱包"
        //
        if(addr0x){
            this.addressTextLabel.string = addr0x
            this.addressNode.active = true
            this.connectNode.active = false;
        }else{
            this.addressTextLabel.string = ""
            this.addressNode.active = false
            this.connectNode.active = true;
        }
    }


    start() {

    }

    update(deltaTime: number) {
        
    }
}


