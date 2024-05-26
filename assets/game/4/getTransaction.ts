import { _decorator, Component, Node, Prefab, instantiate } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('getTransaction')
export class getTransaction extends Component {
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
        fetch(this.URI + "/user/transaction", 
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
            for(let item in list){
                let ins = instantiate(this.rechargeItemPrefab)
                console.warn("item:", item)
                this.node.addChild(ins)
                console.log(ins.getComponent("TransactionInfo"))
                ins.getComponent("TransactionInfo").setData(list[item])
            }
        }).catch(e=>{
            //
            console.error("get tranaction info error: ", e)
        });
    }



    update(deltaTime: number) {
        
    }
}


