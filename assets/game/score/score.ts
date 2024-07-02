import { _decorator, Component, Node, Label } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('score')
export class score extends Component {

    @property(Label)
    num: Label = null
    
    idx: number = 0
    cb: CallableFunction = null

    start() {

    }

    setNum(n, idx, cb: CallableFunction){
        this.idx = idx;
        this.num.string = '' + n
        this.cb = cb;
    }


    onEvent(ev){
        this.cb(ev, this.idx)
    }

    update(deltaTime: number) {
        
    }
}


