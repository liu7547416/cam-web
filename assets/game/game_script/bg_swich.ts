import { _decorator, Component, director, Node, resources, Sprite, SpriteFrame, Texture2D } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('bg_swich')
export class bg_swich extends Component {

    default_bg: string = "./assets/map/map_en.png";
    chinese_bg: string = "./assets/map/map_ch.png";


    @property(Sprite)
    bg:Sprite = null


    start() {
        this.map_type("")
    }

    update(deltaTime: number) {
        
    }


    map_type(t: string){
        // 载入对应地图
        let newBG = new SpriteFrame()
        let bg_file =  t ? this.default_bg : this.chinese_bg;
        resources.load(bg_file, (res, img: Texture2D)=>{
            newBG.texture = img;
        })
        this.bg.spriteFrame = newBG
    }
}
 

