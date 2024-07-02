import { _decorator, Component, Node, Prefab, instantiate } from 'cc';
import * as i18n from 'db://i18n/LanguageData';
const { ccclass, property } = _decorator;

@ccclass('getTransaction')
export class getTransaction extends Component {
    URI = "https://gamedevapi.bitcoinxo.io"

    @property(Prefab)
    rechargeItemPrefab: Prefab = null;


    @property(Node)
    emptyNode: Node = null;

    Token = null;
    language = navigator.language.toLowerCase();

    getTokenInfo(){
        let tokenExpireTS = localStorage.getItem("tokenExpire")
        if(!tokenExpireTS){
            return null
        }
        let ts = parseInt(tokenExpireTS)
        var timestamp = Math.floor(new Date().getTime() / 1000);
        if(timestamp>ts){
            return null
        }
        return localStorage.getItem("token")
    }

    protected onLoad(): void {
        this.Token = this.getTokenInfo()
    }

    languageInit(){
        if (i18n._language === 'en') {
            i18n.init("en")
        }else{
            i18n.init("zh")
        }
        i18n.updateSceneRenderers();
    }
    
    start() {
        
    }

    protected onEnable(): void {
        if(!this.Token){
            return
        }
        // 获取当前轮信息
        const formData = new FormData()
        formData.append("uid", '' + localStorage.getItem("user"))
        formData.append("page", '' + 1)
        formData.append("page_size", '' + 20)
        let _headers = new Headers()
        // _headers.append("Content-Type", "multipart/form-data")
        _headers.append("Authorization", "Bearer "+ this.Token)
        // console.error("Authorization: " + "Bearer "+ this.Token)
        fetch(this.URI + "/user/transaction", {
            method: "POST", 
            mode: "cors", 
            cache: "no-cache", 
            body: formData,
            headers: _headers
        }).then((response: Response) => {
            let res = response.text()
            return res
        }).then((value) => {
            let res = JSON.parse(value)
            let data = res.data
            let list = data.list;
            //
            console.error("list", list)
            if(list.length>0){
                // this.emptyNode.active = false;
                this.node.removeAllChildren()
            }
            //这里实例化节点
            for(let item in list){
                let ins = instantiate(this.rechargeItemPrefab)
                // console.warn("item:", item)
                this.node.addChild(ins)
                // console.log(ins.getComponent("TransactionInfo"))
                ins.getComponent("TransactionInfo").setData(list[item])
            }
            this.languageInit()
        }).catch(e=>{
            //
            console.error("get tranaction info error: ", e)
        });
    }


    update(deltaTime: number) {
        
    }
}


