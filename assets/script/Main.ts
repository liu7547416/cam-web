import { _decorator, Component, Label, Node, Layout, director, EditBox, Sprite, Profiler } from 'cc';
import { EthersUtils } from './EthersUtils';
import * as i18n from 'db://i18n/LanguageData';

const { ccclass, property } = _decorator;

var that = null

@ccclass('Main')
export class Main extends Component {
    

    @property(Label)
    myAddress: Label = null;

    @property(Label)
    walletBlanaceLabel: Label[] = [];

    @property(Label)
    gameBlanaceLabel: Label[] = [];

    @property(Node)
    connectNode: Node = null;

    @property(Node)
    connectBigBtn: Node = null;

    @property(Node)
    connectedNode: Node = null;


    @property(Layout)
    buttons: Layout = null;

    //充值输入组件
    @property(EditBox)
    RechargeInputEditBox: EditBox = null;

    //提现输入组件
    @property(EditBox)
    WithdrawInputEditBox: EditBox = null;

    @property(Sprite)
    loadingMask: Sprite = null;

    @property(Sprite)
    sharePage: Sprite = null;


    @property(Sprite)
    rulesCH: Sprite = null;
    @property(Sprite)
    rulesEN: Sprite = null;
    useRules: Sprite = null


    @property(Sprite)
    commonPopLayer: Sprite = null;

    walletAddress = null

    walletBalance = 0.00

    receiveAddress = null

    contractAddress = null

    rechargeValue = 0.00
    withdrawValue = 0.00;

    gameBalance = 0

    uid = 0

    language = navigator.language.toLowerCase();
    languages = navigator.languages;

    URI = "https://gamedevapi.bitcoinxo.io"

    inviteCode: string = ""
    

    start() {
        
        that = this;
        console.log("that:", that)
        this.inviteCode = this.getUrlQueryValue("invite")
        this.languageInit()
        director.preloadScene("Game")
        this.getAddressFromServer()
        // 自动登陆
        // this.userInfoInit()
        // console.log(" pop:", this.commonPopLayer)
        // console.log(" pop common:", this.commonPopLayer.getComponent("common_pop"))
        // this.commonPopLayer.getComponent("common_pop").showText(i18n.t("wellcom"))
        that.showPopup(i18n.t("wellcom"))
        
    }

    showPopup(t: string){
        let lab = that.commonPopLayer.node.getChildByName("box").getChildByName("text").getComponent(Label)
        that.commonPopLayer.node.active = true
        lab.string = t;
        console.log("this.commonPopLayer:", that.commonPopLayer)
        console.log("lab.string:", lab.string)
    }

    getUrlQueryValue(value) {
        var query = window.location.search.substring(1);
        // console.log("query")
        var vars = query.split("&");
        for (var i = 0; i < vars.length; i++) {
            var pair = vars[i].split("=");
            if (pair[0] == value) {
                return pair[1];
            }
        }
        return null;
    }


    languageInit(){
        this.language.indexOf("zh")>=0 ? i18n.init("zh") : i18n.init("en");
        this.language.indexOf("zh")>=0 ? this.useRules=this.rulesCH : this.useRules=this.rulesEN;
        i18n.updateSceneRenderers();
    }


    changeLang() {
        if (i18n._language === 'en') {
            i18n.init('zh');
        } else {
            i18n.init('en');
        }
        i18n.updateSceneRenderers();
    }


    userInfoInit(){
        this.uid = Number(localStorage.getItem("user"))
        this.walletBalance = Number(localStorage.getItem("walletBalance"))
        this.walletAddress = localStorage.getItem("walletAddress")
        this.contractAddress = localStorage.getItem("contractAddress")
        this.receiveAddress = localStorage.getItem("receiveAddress")
        if(!this.uid){
            this.doConnectWallet()
        }
        if(this.walletBalance && this.walletAddress){
            for(let lab in this.walletBlanaceLabel){
                if(parseInt(lab)==3){
                    
                    this.walletBlanaceLabel[lab].string = this.gameBalance + " CRON";
                }else{
                    this.walletBlanaceLabel[lab].string = this.walletBalance + " BIXO";
                }
            }
            this.connectNode.active = false;
            this.connectBigBtn.active = false;
            this.connectedNode.active = true;
            this.buttons.spacingY = 60;
            this.buttons.updateLayout(true)
        }
    }

    onShareShow(){
        this.sharePage.node.active = true;
        this.sharePage.getComponent("share").setPopLayer(this.showPopup)
    }

    onRuleShow(){
        // this.useRules.node.active = true;
    }

    showLoading(show: boolean = true){
        show ? this.loadingMask.node.active=true : this.loadingMask.node.active=false
    }


    async doConnectWallet(){
        // connect
        this.showLoading(true)
        try {
            this.walletAddress =  await EthersUtils.connectWalletV2()
            this.showLoading(false)
        } catch (error) {
            this.showLoading(false)
        }
        if(!this.walletAddress){
            return that.showPopup(i18n.t("wallet_install"))
        }
        //  get Balance!
        this.showLoading(true)
        try {
            let balance = await EthersUtils.getBalanceOfContract(this.contractAddress)
            this.showLoading(false)
            console.warn("get bsc balance: ", balance)
            balance = ethers.utils.formatUnits(balance, 18);
            console.log("balance: ", balance)
            if(balance.indexOf(".")>=0){
                let tmp = balance.split(".")
                if(tmp[1].length>2){
                    balance = tmp[0] + '.' + tmp[1].substring(0,2)
                }
            }
            this.walletBalance = Number(balance)
        } catch (error) {
            this.showLoading(false)
        }
        await this.registerByAddress(this.walletAddress)
        this.myAddress.string = this.walletAddress.slice(0,6) + "****" + this.walletAddress.slice(-4)
        console.log("label string: ",this.myAddress.string)

        // 
        // this.showPopup("钱包已连接")
        for(let lab in this.walletBlanaceLabel){
            this.walletBlanaceLabel[lab].string = this.walletBalance + " BIXO";
        }
        //
        this.connectNode.active = false;
        this.connectBigBtn.active = false;
        this.connectedNode.active = true;
        this.buttons.spacingY = 60;
        this.buttons.updateLayout(true)

        //
        // this.sendHistroyTransactions(this.contractAddress)
    }




    async getAddressFromServer(){
        const formData = new FormData()
        formData.append("", "")
        let _headers = new Headers()//.set("Content-Type", "multipart/form-data")
        _headers.append("Content-Type", "multipart/form-data")
        console.warn("do get address!")
        this.showLoading(true)
        await fetch(this.URI + "/bridge/address", 
            {method: "POST", 
            mode: "cors", 
            cache: "no-cache", 
            body: formData
        }).then((response: Response) => {
            let res = response.text()
            return res
        }).then(value => {
            this.showLoading(false)
            let res = JSON.parse(value)
            let data = res.data;
            if(res.err_code!=0){
                //访问异常
                console.log("message error：" + res.message)
                return
            }
            if(!data.receive){
                //未配置接收地址
                console.log("receive address error：" + res.message)
                return
            }
            this.contractAddress = data.contract
            this.receiveAddress = data.receive;
            // console.info("address: ", this.receiveAddress);
        }).catch(e=>{
            //登陆失败UI弹窗
            console.error("register error: ",e)
        });
    }


    truncateToTwoDecimalPlaces(num) {
        return Math.trunc(num * 100) / 100;
    }
    

    onInput(ev){
        if(ev.startsWith(".")) {
            this.RechargeInputEditBox.string = '';
            this.RechargeInputEditBox.blur()
            this.RechargeInputEditBox.setFocus()
            console.warn("reset:", this.RechargeInputEditBox.string)
            return
        }
        if(ev.indexOf(".")>=0 && ev.split(".").length-1>1 && ev.endsWith(".")){
            this.RechargeInputEditBox.string = ev.slice(0, -1);
            this.RechargeInputEditBox.blur()
            this.RechargeInputEditBox.setFocus()
            console.warn("reset:", this.RechargeInputEditBox.string)
            return
        }
        if(ev.endsWith(".")) return
        if(ev.indexOf(".")>=0 && ev.split(".")[1].length>2){
            this.RechargeInputEditBox.string = ev.slice(0, -1);
            this.RechargeInputEditBox.blur()
            this.RechargeInputEditBox.setFocus()
            console.warn("reset:", this.RechargeInputEditBox.string)
            return
        }
        if(ev && ev>0){
            this.rechargeValue = ev
        }
    }

    onInputDone(ev){
        if(ev && ev>0){
            this.rechargeValue = ev
        }
    }

    setMaxValue(){
        let value = this.walletBalance.toString()
        value = '' + this.truncateToTwoDecimalPlaces( Number(value) )
        this.RechargeInputEditBox.string = value
        this.rechargeValue = Number(value);
    }
    

    onTransfer(from: string, to: string, amount, event){
        console.info(`callback transfer from:${from} to:${to} amount:${amount}  Event:${event}`)
        console.log("transfer event: ", event)
        let txHash = event.transactionHash;
        // if(!txHash){
        //     this.showPopup(i18n.t("trans_fail"))
        // }else{
        //    this.showPopup(i18n.t("trans_success"))
        // }
        // 结果发送至服务器验证
        // 
        that.sendTransToServer(txHash, event.args.value)

        //刷新 UI
        that.registerByAddress(that.walletAddress)
        // const formData = new FormData()
        // formData.append("txhash", txHash)
        // formData.append("amount", "" + ethers.utils.formatUnits(event.args.value, 18))
        // formData.append("uid", "" + that.uid)
        // let _headers = new Headers()
        // _headers.append("Content-Type", "multipart/form-data")
        // fetch(that.URI + "/deposit", 
        //     {method: "POST", 
        //     mode: "cors", 
        //     cache: "no-cache", 
        //     body: formData
        // }).then((response: Response) => {
        //     let res = response.text()
        //     return res
        // }).then(value => {
        //     that.showLoading(false)
        //     let res = JSON.parse(value)
        //     if(res.err_code!=0){
        //         //发送充值请求错误
        //         that.showPopup(res.message)
        //         return
        //     }
        //     let data = res.data;
        //     console.log("res.data:", data)
        //     if(data != "success"){
        //         //账户异常
        //         that.showPopup(i18n.t("trans_svr_err"))
        //         return
        //     }
        //     that.showPopup(i18n.t("trans_done"))
        // }).catch(e=>{
        //     //
        //     that.showPopup(i18n.t("server_data_err"))
        //     that.showLoading(false)
        // });
    }


    async Transfer(){
        if(!this.receiveAddress || !this.contractAddress){
            await this.getAddressFromServer()
        }
        if(!EthersUtils.signer || !EthersUtils.provider){
            await this.doConnectWallet()
        }

        // 发起转账
        if(this.rechargeValue<=0){
            // this.showPopup(i18n.t("rechargeValue_null"))
            return
        }
        this.showLoading()
        console.warn(`transfer to: ${this.receiveAddress}  rechargeValue:${this.rechargeValue}`)
        let res = await EthersUtils.recharge(this.receiveAddress, '' + this.rechargeValue, this.onTransfer)
        console.log("tranfer call end:", res)
        this.showLoading(false)
    }


    // async sendHistroyTransactions(contractAddress){
    //     let history = await EthersUtils.getWalletTransactions(contractAddress)
    //     console.log("sendHistroyTransactions history:", history)
    //     for(let i in history){
    //         let trans = history[i];
    //         if(trans.args.from == this.walletAddress && trans.args.to== this.receiveAddress){
    //             this.sendTransToServer(trans.transactionHash, trans.args.value)
    //         }
    //     }
    // }


    sendTransToServer(txHash: string, amount){
        // 结果发送至服务器验证
        const formData = new FormData()
        formData.append("txhash", txHash)
        formData.append("amount", "" + ethers.utils.formatUnits(amount, 18))
        formData.append("uid", "" + that.uid)
        let _headers = new Headers()
        _headers.append("Content-Type", "multipart/form-data")
        that.showLoading()
        fetch(that.URI + "/deposit", 
            {method: "POST", 
            mode: "cors", 
            cache: "no-cache", 
            body: formData
        }).then((response: Response) => {
            let res = response.text()
            return res
        }).then(value => {
            that.showLoading(false)
            let res = JSON.parse(value)
            if(res.err_code!=0){
                //发送充值请求错误
            //    that.showPopup(res.message)
                return
            }
            let data = res.data;
            console.log("res.data:", data)
            if(data != "success"){
                //账户异常
            //    that.showPopup(i18n.t("trans_svr_err"))
                return
            }
        //    that.showPopup(i18n.t("trans_done"))
        }).catch(e=>{
            //
            // that.showPopup(i18n.t("server_data_err"))
            that.showLoading(false)
        });
    }


    onWithdrawInput(ev){
        if(ev.indexOf(".")>=0 && ev.split(".").length-1>1 && ev.endsWith(".")){
            this.WithdrawInputEditBox.string = ev.slice(0, -1);
            this.WithdrawInputEditBox.blur()
            this.WithdrawInputEditBox.setFocus()
            console.warn("reset:", this.WithdrawInputEditBox.string)
            return
        }
        if(ev.endsWith(".")) return
        if(ev.indexOf(".")>=0 && ev.split(".")[1].length>2){
            this.WithdrawInputEditBox.string = ev.slice(0, -1);
            this.WithdrawInputEditBox.blur()
            this.WithdrawInputEditBox.setFocus()
            console.warn("reset:", this.WithdrawInputEditBox.string)
            return
        }
        if(ev && ev>0){
            this.withdrawValue = ev
        }
    }
    onWithdrawInputDone(ev){
        if(ev && ev>0){
            this.withdrawValue = ev
        }
    }

    setWithdrawMaxValue(){
        let value = this.gameBalance.toString()
        value = '' + this.truncateToTwoDecimalPlaces(value)
        this.WithdrawInputEditBox.string = value
        this.withdrawValue = Number(value);
    }

    async Withdraw(){
        // 发起转账
        if(this.withdrawValue<=0){
            return alert("Withdraw amount is 0.")
        }
        console.warn(`Withdraw to: ${this.receiveAddress}  WithdrawValue:${this.withdrawValue}`)
        
        const formData = new FormData()
        formData.append("amount", "" + this.withdrawValue)
        formData.append("uid", "" + this.uid)
        let _headers = new Headers()
        _headers.append("Content-Type", "multipart/form-data")
        this.showLoading(true)
        fetch(this.URI + "/withdraw",
            {method: "POST",
            mode: "cors",
            cache: "no-cache",
            body: formData
        }).then((response: Response) => {
            let res = response.text()
            return res
        }).then(value => {
            this.showLoading(false)
            let res = JSON.parse(value)
            if(res.err_code!=0){
                //发送充值请求错误
                alert(res.message)
                return
            }
            let data = res.data;
            console.log("res.data:", data)
            if(data != "success"){
                //账户异常
                alert("申请提现异常！")
                return
            }
            console.log("提现成功！")
        }).catch(e=>{
            //登陆失败UI弹窗
            console.error("withdraw error: ",e)
            this.showLoading(false)
        });
    }

    

    async registerByAddress(addr: string){
        const formData = new FormData()
        if(this.inviteCode){
            formData.append("invite_by", this.inviteCode)
        }
        formData.append("address", addr)
        formData.append("chainid", "" + EthersUtils.ChainParams.ChainId)
        let _headers = new Headers()
        _headers.append("Content-Type", "multipart/form-data")
        fetch(this.URI + "/register", 
            {method: "POST", 
            mode: "cors", 
            cache: "no-cache", 
            body: formData
        }).then((response: Response) => {
            let res = response.text()
            return res
        }).then(value => {
            this.showLoading(false)
            let res = JSON.parse(value)
            if(res.err_code!=0){
                //登陆异常
                alert(res.message)
                return
            }
            let data = res.data;
            // console.log("res.data:", data)
            if(data.account_status==1){
                //账户异常
                alert("账户状态异常！")
                return
            }
            this.gameBalance = this.truncateToTwoDecimalPlaces(data.available_balance);
            for(let lab in this.gameBlanaceLabel){
                if(parseInt(lab)==3){
                    this.gameBlanaceLabel[lab].string = this.truncateToTwoDecimalPlaces(data.balance - data.available_balance) + " CORN";
                }else{
                    this.gameBlanaceLabel[lab].string = this.gameBalance + " CORN";
                }
            }
            this.uid = data.uid;
            localStorage.setItem("user", data.uid)
            localStorage.setItem("inviteCode", data.invite_code)
            localStorage.setItem("userBalance", data.balance)
            localStorage.setItem("walletAddress", this.walletAddress)
            localStorage.setItem("walletBalance", '' + this.walletBalance)
            localStorage.setItem("contractAddress", this.contractAddress)
            localStorage.setItem("receiveAddress", this.receiveAddress)
            console.info("user data:", data);

            // 刷新其他UI部分
            this.userInfoInit()
        }).catch(e=>{
            //登陆失败UI弹窗
            console.error("register error: ",e)
            this.showLoading(false)
        });
    }

    async enterGame(ev){
        // 获取当前轮信息
        const formData = new FormData()
        formData.append("uid", '' +this.uid)
        let _headers = new Headers()
        _headers.append("Content-Type", "multipart/form-data")
        this.showLoading(true)
        fetch(this.URI + "/round/info", 
            {method: "POST", 
            mode: "cors", 
            cache: "no-cache", 
            body: formData
        }).then((response: Response) => {
            let res = response.text()
            // console.info("rund info text:", res);
            return res
        }).then((value) => {
            //这里控制玩家自己进入房间
            this.showLoading(false)
            director.loadScene("Game")
        }).catch(e=>{
            //登陆失败UI弹窗
            console.error("get round info error: ", e)
        });
    }

}


