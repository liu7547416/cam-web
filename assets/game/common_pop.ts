import { _decorator, Component, Label, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('common_pop')
export class common_pop extends Component {

    textLabel: Label = null;

    close(){
        console.log(this)
        console.log(this.textLabel)
        this.textLabel.string = '';
        this.node.active=false;
    }


    showText(t: string){
        this.node.active=true;
        this.textLabel.string = t;
    }

    start() {
        this.textLabel = this.node.getChildByName("box").getChildByName("text").getComponent(Label)
        // console.log(this.textLabel.string = "test")
    }

    update(deltaTime: number) {
        
    }
}


