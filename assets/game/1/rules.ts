import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('rules')
export class rules extends Component {


    close(){
        this.node.active = false;
    }

    start() {

    }


    update(deltaTime: number) {
        
    }
}


