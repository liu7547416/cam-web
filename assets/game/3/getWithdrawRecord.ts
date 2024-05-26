import { _decorator, Component, Node, Label, instantiate, Prefab } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('getWithdrawRecord')
export class getWithdrawRecord extends Component {

    URI = "https://gamedevapi.bitcoinxo.io"

    @property(Prefab)
    rechargeItemPrefab: Prefab = null;
    
    start() {
        
    }



    protected onEnable(): void {
        //
        this.node.removeAllChildren()
        // 获取当前轮信息
        const formData = new FormData()
        formData.append("uid", '' + localStorage.getItem("user"))
        formData.append("page", '' + 1)
        formData.append("page_size", '' + 20)
        let _headers = new Headers()
        _headers.append("Content-Type", "multipart/form-data")
        fetch(this.URI + "/user/withdraw", 
            {method: "POST", 
            mode: "cors", 
            cache: "no-cache", 
            body: formData
        }).then((response: Response) => {
            let res = response.text()
            return res
        }).then((value) => {
            let res = JSON.parse(value)
            let data = res.data
            let list = data.list;
            //这里实例化节点
            for(let i in list){
                let ins = instantiate(this.rechargeItemPrefab)
                console.warn("item:", i)
                this.node.addChild(ins)
                console.log(ins.getComponent("WithdrawItemInfo"))
                ins.getComponent("WithdrawItemInfo").setData(list[i])
            }
        }).catch(e=>{
            //登陆失败UI弹窗
            console.error("get round info error: ", e)
        });
    }

    refreash(){
        this.start()
    }


    update(deltaTime: number) {
        
    }
}


