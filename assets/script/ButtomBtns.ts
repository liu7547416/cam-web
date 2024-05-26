import { _decorator, Component, Label, Node, Sprite, SpriteFrame, Color} from 'cc';
import * as i18n from 'db://i18n/LanguageData';

const { ccclass, property } = _decorator;

@ccclass('ButtomBtns')
export class ButtomBtns extends Component {

    @property(SpriteFrame)
    frames: SpriteFrame[] = [];


    @property(Sprite)
    iconList: Sprite[] = [];
    @property(Label)
    labelList: Label[] = [];
    @property(Sprite)
    focusList: Sprite[] = [];


    @property(Node)
    pages: Node[] = [];

    // @property(Sprite)
    // homeSprite: Sprite = null;
    // @property(Label)
    // homeLabel: Label = null;
    // @property(Sprite)
    // homeFocusSprite: Sprite = null;

    // @property(Sprite)
    // rechargeSprite: Sprite = null;
    // @property(Label)
    // rechargeLabel: Label = null;
    // @property(Sprite)
    // rechargeFocusSprite: Sprite = null;

    // @property(Sprite)
    // withdrawSprite: Sprite = null;
    // @property(Label)
    // withdrawLabel: Label = null;
    // @property(Sprite)
    // withdrawFocusSprite: Sprite = null;

    // @property(Sprite)
    // accountSprite: Sprite = null;
    // @property(Label)
    // accountLabel: Label = null;
    // @property(Sprite)
    // accountFocusSprite: Sprite = null;

    selectColor: Color = new Color("#3B0400")
    normalColor: Color = new Color("#E9E8C8")

    start() {
        // this.selectedHome(1)
    }

    update(deltaTime: number) {
        
    }

    changeLang() {
        if (i18n._language === 'en') {
            i18n.init('en');
        } else {
            i18n.init('zh');
        }
        i18n.updateSceneRenderers();
    }

    selectedHome(event, selectedIndex: number){
        //当前按钮
        console.log("i:", selectedIndex, " lab:", this.labelList[selectedIndex])
        this.labelList[selectedIndex].color = this.selectColor
        this.iconList[selectedIndex].spriteFrame = this.frames[ selectedIndex*2 + 1 ]
        this.focusList[selectedIndex].node.active = true;
        this.pages[selectedIndex].active = true;
        // 其他
        for(let i=0; i<4; i++){
            if(i!=selectedIndex){
                console.log("i:", i, " lab:", this.labelList[i])
                this.labelList[i].color = this.normalColor
                this.iconList[i].spriteFrame = this.frames[ i*2 ]
                this.focusList[i].node.active = false;
                this.pages[i].active = false;
            }
        }
        if(selectedIndex==2){
            console.log("language is:", i18n._language)
        }
        this.changeLang()
    }
}

