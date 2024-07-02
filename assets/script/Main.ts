import { _decorator, Component, Label, Node, Layout, director, EditBox, Sprite, game, NodeEventType, find, Graphics, Color, UITransform } from 'cc';
import { EthersUtils } from './EthersUtils';
import * as i18n from 'db://i18n/LanguageData';
import { Transform } from 'stream';

const { ccclass, property } = _decorator;

var that = null

@ccclass('Main')
export class Main extends Component {

    @property(Label)
    inviteAddressLabel: Label = null;

    @property(Label)
    inviteCodeLabel: Label = null;

    @property(Label)
    inviteCountLabel: Label = null;

    @property(Label)
    inviteBonusLabel: Label = null;
    
    @property(Label)
    shareLinkLabel: Label = null;

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

    @property(Node)
    centerWalletInfo: Node = null;

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

    @property(Node)
    bindBtnNode: Node = null;


    @property(Node)
    langNode: Node = null;


    @property(Sprite)
    rulesCH: Sprite = null;
    @property(Sprite)
    rulesEN: Sprite = null;
    useRules: Sprite = null


    @property(Sprite)
    commonPopLayer: Sprite = null;

    @property(Sprite)
    bindPopLayer: Sprite = null;

    @property(Node)
    pages: Node[] = [];

    @property(Node)
    rechargeBoxNode: Node = null;

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

    signMessage: any = ""
    Token = ""

    lastQueryTransferLogs = []


    reqIng = false;

    isPreload = false;

    async bindShowEvent(){
        for(let i in this.pages){
            let page = this.pages[i];
            page.on(NodeEventType.ACTIVE_IN_HIERARCHY_CHANGED,this.pageUpdate, this)
        }
        
    }


    pageUpdate(){
        // console.warn("page update!")
        this.updateBalance()
        this.updateWalletBalance()
        this.getDepositLevel()
        // new Screen().requestFullScreen()
    }

    
    setTokenInfo(token){
        if(!token){
            return
        }
        var timestamp = Math.floor(new Date().getTime() / 1000);
        // 加上1小时
        timestamp = timestamp + 3600
        localStorage.setItem("tokenExpire", ''+timestamp)
        localStorage.setItem("token", token)
        this.showEnterGame(true)
        this.updateBalance()
        //预加载
        if(!this.isPreload){
            this.isPreload = true;
            director.preloadScene("Game");
        }
    }


    cleanTokenInfo(){
        let isBack = localStorage.getItem("back")
        if(isBack){
            localStorage.removeItem("back")
            return
        }
        this.Token = null;
        this.walletAddress = null;
        this.walletBalance = 0;
        //
        localStorage.removeItem("walletAddress")
        localStorage.removeItem("tokenExpire")
        localStorage.removeItem("token")
        this.showEnterGame(false)
    }


    getTokenInfo(){
        let tokenExpireTS = localStorage.getItem("tokenExpire")
        if(!tokenExpireTS){
            this.showEnterGame(false)
            return null
        }
        let ts = parseInt(tokenExpireTS)
        var timestamp = Math.floor(new Date().getTime() / 1000);
        if(timestamp>ts){
            this.showEnterGame(false)
            return null
        }
        this.showEnterGame(true)
        return localStorage.getItem("token")
    }

    protected onLoad(): void {
        that = this;
        //设为常驻节点，切换场景将不被销毁
        // director.addPersistRootNode(this.node.getParent())
        game.frameRate = 24
        this.bindShowEvent()
    }


    async start() {
        //
        this.getDepositLevel()
        this.closeBindPopup()
        that = this;
        //
        this.cleanTokenInfo()
        
        await this.getAddressFromServer()
        this.Token = this.getTokenInfo()
        if(!this.Token){
            this.showEnterGame(false)
        }
        // 
        this.walletAddress = localStorage.getItem("walletAddress")
        // console.log("that:", that)
        this.inviteCode = this.getUrlQueryValue("invite")
        // this.languageInit()
        EthersUtils.setShowPop(this.showPopup)
        // 自动登陆
        if(this.walletAddress){
            localStorage.setItem("walletAddress", this.walletAddress)
            this.centerWalletInfo.active = true;
        }
        await this.doConnectWallet()
        await this.updateWalletBalance()
        EthersUtils.registerAccountChange(this.onAccountChange)
    }


    protected onEnable(): void {
        
    }



    getDepositLevel(){
        const formData = new FormData()
        formData.append("", "")
        let _headers = new Headers()
        this.showLoading(true)
        fetch(this.URI + "/deposit/level", 
            {method: "POST", 
            mode: "cors", 
            cache: "no-cache", 
            body: formData,
            headers: _headers
        }).then((response: Response) => {
            let res = response.text()
            return res
        }).then(value => {
            this.showLoading(false)
            let res = JSON.parse(value)
            let data = res.data;
            if(res.err_code!=0){
                //访问异常
                // console.log("getDepositLevel error message: " + res.message)
                return
            }
            if(!data){
                //未配置接收地址
                // console.log("getDepositLevel error: " + res.message)
                return
            }
            // console.info("deposit levle: ", data + '');
            localStorage.setItem("depositLevel", data + '')
            
        }).catch(e=>{
            //登陆失败UI弹窗
            // console.error("getDepositLevel error: ", e)
            that.showPopup(i18n.t("game_server_err"))
            this.showLoading(false)
        });
    }


    

    showPopup(t: string){
        let lab = that.commonPopLayer.node.getChildByName("box").getChildByName("text").getComponent(Label)
        that.commonPopLayer.node.active = true
        lab.string = t;
        // console.log("this.commonPopLayer:", that.commonPopLayer)
        // console.log("lab.string:", lab.string)
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
        if(this.language.indexOf("zh")>=0){
            i18n.init("zh")
            this.useRules=this.rulesCH;
            this.langNode.getChildByName("lang_en").active = false;
            this.langNode.getChildByName("lang_zh").active = true;
        }else{
            i18n.init("en")
            this.useRules=this.rulesEN;
            this.langNode.getChildByName("lang_en").active = true;
            this.langNode.getChildByName("lang_zh").active = false;
        }
        i18n.updateSceneRenderers();
    }


    changeLang() {
        if (i18n._language === 'en') {
            i18n.init('zh');
            this.langNode.getChildByName("lang_en").active = false;
            this.langNode.getChildByName("lang_zh").active = true;
        } else {
            i18n.init('en');
            this.langNode.getChildByName("lang_en").active = true;
            this.langNode.getChildByName("lang_zh").active = false;
        }
        i18n.updateSceneRenderers();
    }


    async userInfoInit(){
        this.uid = Number(localStorage.getItem("user"))
        this.walletBalance = Number(localStorage.getItem("walletBalance"))
        this.walletAddress = localStorage.getItem("walletAddress")
        this.contractAddress = localStorage.getItem("contractAddress")
        this.receiveAddress = localStorage.getItem("receiveAddress")
        this.gameBalance = Number(localStorage.getItem("userBalance"))
        let availableBalance = Number(localStorage.getItem("availableBalance"))
        for(let lab in this.gameBlanaceLabel){
            if(parseInt(lab)>3){
                this.gameBlanaceLabel[lab].string = this.truncateToTwoDecimalPlaces(this.gameBalance - availableBalance) + " CORN";
            }else{
                this.gameBlanaceLabel[lab].string = this.truncateToTwoDecimalPlaces(this.gameBalance) + " CORN";
            }
        }
        if(!this.uid){
            await this.doConnectWallet()
        }
        if(this.walletBalance && this.walletAddress){
            for(let lab in this.walletBlanaceLabel){
                this.walletBlanaceLabel[lab].string = this.truncateToTwoDecimalPlaces(this.walletBalance) + " BIXO";
            }
            this.connectNode.active = false;
            this.connectBigBtn.active = false;
            this.connectedNode.active = true;
            this.centerWalletInfo.active = true;
            this.buttons.node.getChildByName("btn_enter_game").active = true;
            // this.buttons.spacingY = 60;
            // this.buttons.paddingTop = 60;
            this.buttons.updateLayout(true)
        }
    }

    onInviteCodeInput(ev){
        // console.log("onInviteCodeInput:", ev)
        this.inviteCode = ev
    }

    onInviteCodeDone(ev){
        // console.log("onInviteCodeDone:", ev)
        this.inviteCode = ev
    }

    onShareShow(){
        this.sharePage.node.active = true;
        this.sharePage.getComponent("share").setPopLayer(this.showPopup)
    }

    onRuleShow(){
        // this.useRules.node.active = true;
    }

    showLoading(show: boolean = true){
        show ? that.loadingMask.node.active=true : that.loadingMask.node.active=false
    }



    async onAccountChange(accounts){
        //
        that.cleanTokenInfo()
        //
        if(accounts.length>0){
            let currentAccount = accounts[0];
            if(that.walletAddress==currentAccount){
                return
            }
            // console.error("User account change", currentAccount)
            //  get Balance!
            that.showLoading(true)
            try {
                that.walletAddress =  await EthersUtils.connectWalletV2()
                let balance = await EthersUtils.getBalanceOfContract(that.contractAddress)
                that.showLoading(false)
                // console.warn("get bsc balance: ", balance)
                balance = ethers.utils.formatUnits(balance, 18);
                // console.log("balance: ", balance)
                if(balance.indexOf(".")>=0){
                    let tmp = balance.split(".")
                    if(tmp[1].length>2){
                        balance = tmp[0] + '.' + tmp[1].substring(0,2)
                    }
                }
                that.walletBalance = Number(balance)
            } catch (error) {
                // console.error("Change account error:", error)
                that.showLoading(false)
            }
            await that.registerByAddress(that.walletAddress)
        }else{
            // console.error("On account change: no account!")
        }
    }


    async doConnectWallet(){
        // connect
        this.showLoading(true)
        try {
            this.walletAddress =  await EthersUtils.getAddress()
            this.showLoading(false)
            // console.warn("钱包已连接2：", this.walletAddress)
        } catch (error) {
            this.showLoading(false)
        }
        if(!this.walletAddress){
            return that.showPopup(i18n.t("wallet_install"))
        }

        this.myAddress.string = this.walletAddress.slice(0,6) + "****" + this.walletAddress.slice(-4)
        // console.log("label string: ",this.myAddress.string)
        //  get Balance!
        await this.registerByAddress(this.walletAddress)
        await this.updateWalletBalance()
    }


    showEnterGame(isShow: boolean = true){
        if(this.walletAddress){
            this.myAddress.string = this.walletAddress.slice(0,6) + "****" + this.walletAddress.slice(-4)
            // console.log("label string: ",this.myAddress.string)
        }
        
        // 更新UI： 刷新钱包余额
        if(this.walletBalance){
            for(let lab in this.walletBlanaceLabel){
                this.walletBlanaceLabel[lab].string = this.truncateToTwoDecimalPlaces(this.walletBalance) + " BIXO";
            }
        }
        this.connectNode.active = !isShow;
        this.connectBigBtn.active = !isShow;
        //
        this.connectedNode.active = isShow;
        this.buttons.node.getChildByName("btn_enter_game").active = isShow;
        this.buttons.updateLayout(true)
    }




    async getAddressFromServer(){
        const formData = new FormData()
        formData.append("", "")
        let _headers = new Headers()
        // _headers.append("Content-Type", "multipart/form-data")
        _headers.append("Authorization", "Bearer "+ this.Token)
        // console.warn("do get address!")
        this.showLoading(true)
        await fetch(this.URI + "/bridge/address", 
            {method: "POST", 
            mode: "cors", 
            cache: "no-cache", 
            body: formData,
            headers: _headers
        }).then((response: Response) => {
            let res = response.text()
            return res
        }).then(value => {
            this.showLoading(false)
            let res = JSON.parse(value)
            let data = res.data;
            if(res.err_code!=0){
                //
                console.log("message error：" + res.message)
                return
            }
            if(!data.receive){
                //
                console.log("receive address error：" + res.message)
                return
            }
            this.contractAddress = data.contract
            this.receiveAddress = data.receive;
            // console.info("address: ", this.receiveAddress);
            
        }).catch(e=>{
            //登陆失败UI弹窗
            // console.error("register error: ",e)
            that.showPopup(i18n.t("game_server_err"))
            this.showLoading(false)
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
            // console.warn("reset:", this.RechargeInputEditBox.string)
            return
        }
        if(ev.indexOf(".")>=0 && ev.split(".").length-1>1 && ev.endsWith(".")){
            this.RechargeInputEditBox.string = ev.slice(0, -1);
            this.RechargeInputEditBox.blur()
            this.RechargeInputEditBox.setFocus()
            // console.warn("reset:", this.RechargeInputEditBox.string)
            return
        }
        if(ev.endsWith(".")) return
        if(ev.indexOf(".")>=0 && ev.split(".")[1].length>2){
            this.RechargeInputEditBox.string = ev.slice(0, -1);
            this.RechargeInputEditBox.blur()
            this.RechargeInputEditBox.setFocus()
            // console.warn("reset:", this.RechargeInputEditBox.string)
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
        // console.info(`callback transfer from:${from} to:${to} amount:${amount}`)
        // console.log("transfer event: ", event)
        let txHash = event.transactionHash;
        if(!txHash){
            that.showPopup(i18n.t("trans_fail"))
        }else{
            that.showPopup(i18n.t("trans_success"))
        }
        // 结果发送至服务器验证
        // 
        if(event && event.args){
            that.sendTransToServer(txHash, event.args.value)
            //刷新 UI
            that.updateBalance()
            that.updateWalletBalance()
        }
    }


    async Transfer(){
        if(!this.Token){
            that.showPopup(i18n.t("plslogin"))
            return
        }
        if(!this.receiveAddress || !this.contractAddress){
            await this.getAddressFromServer()
        }
        // if(!EthersUtils.signer || !EthersUtils.provider){
        await this.doConnectWallet()
        // }
        // 发起转账
        if(this.rechargeValue<=0){
            that.showPopup(i18n.t("rechargeValue_null"))
            return
        }
        this.showLoading()
        // EthersUtils.getBlockNumber()
        // console.warn(`transfer to: ${this.receiveAddress}  rechargeValue:${this.rechargeValue}`)
        let v = '' + this.rechargeValue;
        let tx = await EthersUtils.recharge(this.receiveAddress, '' + this.rechargeValue, this.onTransfer)
        // console.warn("tx", tx)
        this.showLoading(false)
        if(tx && (tx.receipt || tx.hash)){
            this.showLoading()
            let receipt = await tx.wait();
            this.showLoading(false)
            // console.log("tranfer call end:", receipt)
            if(receipt && receipt.transactionHash){
                this.sendTransToServer(receipt.transactionHash, v)
                that.updateBalance()
                this.updateWalletBalance()
            }
            if(!receipt || !receipt.transactionHash){
                that.showPopup(i18n.t("trans_fail"))
            }
        }else{
            // console.log("tx.transactionHash: ", tx.transactionHash)
            if(tx.transactionHash){
                this.sendTransToServer(tx.transactionHash, v)
                that.updateBalance()
                this.updateWalletBalance()
                return
            }
            that.showPopup(i18n.t("trans_cancel"))
        }

        //清空输入框
        this.RechargeInputEditBox.string = '';
        this.RechargeInputEditBox.blur()
        this.RechargeInputEditBox.setFocus()
        
    }



    sendTransToServer(txHash: string, amount){
        if(!this.Token){
            this.showPopup(i18n.t("plslogin"))
            return
        }
        // 结果发送至服务器验证
        const formData = new FormData()
        formData.append("txhash", txHash)
        formData.append("amount", "" + amount)
        formData.append("uid", "" + that.uid)
        let _headers = new Headers()
        // _headers.append("Content-Type", "multipart/form-data")
        _headers.append("Authorization", "Bearer "+ this.Token)
        that.showLoading()
        fetch(that.URI + "/deposit", 
            {method: "POST", 
            mode: "cors", 
            cache: "no-cache", 
            body: formData,
            headers: _headers
        }).then((response: Response) => {
            let res = response.text()
            return res
        }).then(value => {
            that.showLoading(false)
            let res = JSON.parse(value)
            if(res.err_code!=0){
                //发送充值请求错误
               that.showPopup(res.message)
                return
            }
            let data = res.data;
            // console.log("res.data:", data)
            if(data != "success"){
                //账户异常
               that.showPopup(i18n.t("trans_svr_err"))
                return
            }
            that.showPopup(i18n.t("trans_done")+" "+amount)
            //TODO: 更新UI 请求入账记录
            that.updateRechargeList()
        }).catch(e=>{
            //
            that.showPopup(i18n.t("server_data_err"))
            that.showLoading(false)
        });
    }


    updateRechargeList(){
        // console.warn("update recharge record.")
        that.rechargeBoxNode.getComponent("getRecharge").refreash()
        that.RechargeInputEditBox.string = '0';
        that.RechargeInputEditBox.blur()
        that.RechargeInputEditBox.setFocus()
    }


    onWithdrawInput(ev){
        if(ev.indexOf(".")>=0 && ev.split(".").length-1>1 && ev.endsWith(".")){
            this.WithdrawInputEditBox.string = ev.slice(0, -1);
            this.WithdrawInputEditBox.blur()
            this.WithdrawInputEditBox.setFocus()
            // console.warn("reset:", this.WithdrawInputEditBox.string)
            return
        }
        if(ev.endsWith(".")) return
        if(ev.indexOf(".")>=0 && ev.split(".")[1].length>2){
            this.WithdrawInputEditBox.string = ev.slice(0, -1);
            this.WithdrawInputEditBox.blur()
            this.WithdrawInputEditBox.setFocus()
            // console.warn("reset:", this.WithdrawInputEditBox.string)
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
        if(!this.Token){
            that.showPopup(i18n.t("plslogin"))
            return
        }
        // 发起转账
        if(this.withdrawValue<=0){
            return that.showPopup(i18n.t("withdrawValueErr"))
        }
        // console.warn(`Withdraw to: ${this.receiveAddress}  WithdrawValue:${this.withdrawValue}`)
        
        const formData = new FormData()
        formData.append("amount", "" + this.withdrawValue)
        formData.append("uid", "" + this.uid)
        let _headers = new Headers()
        // _headers.append("Content-Type", "multipart/form-data")
        _headers.append("Authorization", "Bearer "+ this.Token)
        this.showLoading(true)
        fetch(this.URI + "/withdraw",
            {method: "POST",
            mode: "cors",
            cache: "no-cache",
            body: formData,
            headers: _headers,
        }).then((response: Response) => {
            let res = response.text()
            return res
        }).then(value => {
            this.showLoading(false)
            let res = JSON.parse(value)
            if(res.err_code!=0){
                //发送充值请求错误
                that.showPopup(res.message)
                return
            }
            let data = res.data;
            // console.log("res.data:", data)
            if(data != "success"){
                //账户异常
                that.showPopup(i18n.t("withdrawReqErr"))
                return
            }
            that.showPopup(i18n.t("withdrawSuccess"))
        }).catch(e=>{
            //登陆失败UI弹窗
            // console.error("withdraw error: ",e)
            that.showPopup(i18n.t("game_server_err"))
            this.showLoading(false)
        });
    }


    async registerByAddress(addr: string){
        if(!addr){
            addr = this.walletAddress;
        }
        const formData = new FormData()
        if(this.inviteCode){
            formData.append("invite_by", this.inviteCode)
        }
        let doSignMessage = null;
        formData.append("address", addr)
        formData.append("chainid", "" + EthersUtils.ChainParams.ChainId)
        let _headers = new Headers()
        // _headers.append("Content-Type", "multipart/form-data")
        await fetch(this.URI + "/register", {
            method: "POST", 
            mode: "cors", 
            cache: "no-cache", 
            body: formData,
            headers: _headers
        }).then((response: Response) => {
            let res = response.text()
            return res
        }).then(async value => {
            this.showLoading(false)
            let res = JSON.parse(value)
            if(res.err_code!=0){
                //登陆异常
                this.showPopup(res.message)
                // console.log("登陆异常")
                return
            }
            let data = res.data;
            // console.log("res.data:", data)
            if(data.account_status!=0){
                //账户异常
                this.showPopup(res.message)
                // console.log("账户异常")
                return
            }
            this.gameBalance = this.truncateToTwoDecimalPlaces(data.available_balance);
            for(let lab in this.gameBlanaceLabel){
                if(parseInt(lab)>3){
                    this.gameBlanaceLabel[lab].string = this.truncateToTwoDecimalPlaces(data.balance - data.available_balance) + " CORN";
                }else{
                    this.gameBlanaceLabel[lab].string = this.truncateToTwoDecimalPlaces(this.gameBalance) + " CORN";
                }
            }
            this.uid = data.uid;
            localStorage.setItem("user", data.uid)
            localStorage.setItem("inviteAddr", data.invite_by_address)
            localStorage.setItem("inviteCode", data.invite_code)
            localStorage.setItem("userBalance", '' + this.gameBalance)
            localStorage.setItem("availableBalance", '' + data.available_balance)
            localStorage.setItem("walletAddress", this.walletAddress)
            localStorage.setItem("walletBalance", '' + this.walletBalance)
            localStorage.setItem("contractAddress", this.contractAddress)
            localStorage.setItem("receiveAddress", this.receiveAddress)
            // console.warn("share address:", this.shareLinkLabel.string)
            // console.info("user data:", data);
            let shareLink = location.host + "?invite=" + data.invite_code;
            let invite_by_address = '--';
            if(data.invite_by_address){
                invite_by_address = data.invite_by_address.slice(0,6) + "****" + data.invite_by_address.slice(-4)
                this.bindBtnNode.active = false;
            }
            this.inviteAddressLabel.string = invite_by_address;
            this.inviteCountLabel.string = '' + data.invite_count;
            this.inviteBonusLabel.string = '' + this.truncateToTwoDecimalPlaces(data.invite_bonus);
            this.shareLinkLabel.string = shareLink;
            this.inviteCodeLabel.string = data.invite_code;
            doSignMessage = data.login_msg;
            // 刷新其他UI部分
            this.userInfoInit()
            // 
            if(this.Token){
                // console.warn("token exist!")
                return
            }else{
                this.showEnterGame(false)
                this.showLoading(true)
                // console.warn(" ------", doSignMessage)
                this.signMessage = await EthersUtils.getSignMessage(doSignMessage)
                // console.warn("login do sign:", this.signMessage)
                if(this.signMessage.code){
                    this.showPopup(i18n.t("e4001"))
                    return
                }
                await this.getTokenBySign(this.signMessage)
                this.showLoading(false)
            }
            // const logs = await EthersUtils.getWalletTransactionLogs()
            // console.log(logs)
        }).catch(e=>{
            //登陆失败UI弹窗
            this.showPopup(i18n.t("game_server_err"))
            this.showLoading(false)
        });
        
        
    }


    async updateWalletBalance(){
        //  get Balance!
        this.showLoading(true)
        try {
            let balance = await EthersUtils.getBalanceOfContract(this.contractAddress)
            this.showLoading(false)
            // console.warn("get bsc balance: ", balance)
            balance = ethers.utils.formatUnits(balance, 18);
            // console.log("balance: ", balance)
            if(balance.indexOf(".")>=0){
                let tmp = balance.split(".")
                if(tmp[1].length>2){
                    balance = tmp[0] + '.' + tmp[1].substring(0,2)
                }
            }
            this.walletBalance = Number(balance)
            // 
            for(let lab in this.walletBlanaceLabel){
                this.walletBlanaceLabel[lab].string = this.truncateToTwoDecimalPlaces(this.walletBalance) + " BIXO";
            }
        } catch (error) {
            console.error("updateWalletBalance error: ", error)
            this.showLoading(false)
        }
    }

    //仅更新UI
    async updateBalance(){
        if(!this.reqIng){
            this.reqIng = true;
        }else{
            return
        }
        if(!this.Token){
            this.showPopup(i18n.t("plslogin"))
            this.reqIng = false;
            return
        }
        this.walletAddress = localStorage.getItem("walletAddress")
        const formData = new FormData()
        formData.append("uid", ''+ this.uid)
        // formData.append("chainid", "" + EthersUtils.ChainParams.ChainId)
        let _headers = new Headers()
        _headers.append("Authorization", "Bearer "+ this.Token)
        await fetch(this.URI + "/user/info", {
            method: "POST", 
            mode: "cors", 
            cache: "no-cache", 
            body: formData,
            headers: _headers
        }).then((response: Response) => {
            let res = response.text()
            return res
        }).then(value => {
            this.showLoading(false)
            let res = JSON.parse(value)
            if(res.err_code!=0){
                //登陆异常
                this.showPopup(res.message)
                this.reqIng = false;
                return
            }
            let data = res.data;
            // console.log("res.data:", data)
            if(data.account_status!=0){
                this.showPopup(res.message)
                this.reqIng = false;
                return
            }
            // 
            for(let lab in this.walletBlanaceLabel){
                this.walletBlanaceLabel[lab].string = this.truncateToTwoDecimalPlaces(this.walletBalance) + " BIXO";
            }
            this.gameBalance = this.truncateToTwoDecimalPlaces(data.available_balance);
            for(let lab in this.gameBlanaceLabel){
                if(parseInt(lab)>3){
                    // console.log("写入字符：", this.truncateToTwoDecimalPlaces(data.balance - data.available_balance) + " CORN")
                    this.gameBlanaceLabel[lab].string = this.truncateToTwoDecimalPlaces(data.balance - data.available_balance) + " CORN";
                }else{
                    this.gameBlanaceLabel[lab].string = this.truncateToTwoDecimalPlaces(this.gameBalance) + " CORN";
                }
            }
            //this.uid = data.uid;
            localStorage.setItem("user", data.uid)
            // localStorage.setItem("inviteAddr", data.invite_by_address)
            // localStorage.setItem("inviteCode", data.invite_code)
            localStorage.setItem("userBalance", data.balance)
            localStorage.setItem("walletAddress", this.walletAddress)
            localStorage.setItem("walletBalance", '' + this.walletBalance)
            localStorage.setItem("contractAddress", this.contractAddress)
            localStorage.setItem("receiveAddress", this.receiveAddress)
            localStorage.setItem("availableBalance", '' + data.available_balance)
            //
            // let shareLink = location.host + "?invite=" + data.invite_code;
            // let invite_by_address = '--';
            // if(data.invite_by_address){
            //     invite_by_address = data.invite_by_address.slice(0,6) + "****" + data.invite_by_address.slice(-4)
            // }
            // this.inviteAddressLabel.string = invite_by_address;
            // this.inviteCountLabel.string = data.invite_count;
            // this.inviteBonusLabel.string = data.invite_bonus;
            // this.shareLinkLabel.string = shareLink;
            // this.inviteCodeLabel.string = data.invite_code;
            // 刷新其他UI部分
            this.userInfoInit()
            this.reqIng = false;
        }).catch(e=>{
            //登陆失败UI弹窗
            this.showPopup(i18n.t("game_server_err"))
            this.showLoading(false)
            this.reqIng = false;
        });
    }


    copyInviteLink(){
        let herf = location.href;
        let shareLink = herf + "?invite=" + localStorage.getItem("inviteCode")
        navigator.clipboard.writeText(shareLink);
        this.showPopup(i18n.t("share"))
    }

    copyInviteCode(){
        let inviteCode = localStorage.getItem("inviteCode")
        navigator.clipboard.writeText(inviteCode);
        this.showPopup(i18n.t("share"))
    }

    showBindPopup(){
        this.bindPopLayer.node.active = true;
    }

    closeBindPopup(){
        this.bindPopLayer.node.active = false;
    }

    onBindInviteCodeInput(ev){
        // console.log("onBindInviteCodeInput: ", ev)
        this.inviteCode = ev;
    }


    bindInviteCode(){
        if(!this.walletAddress){
            // this.closeBindPopup()
            this.showPopup(i18n.t('plslogin'))
            return
        }
        if(!this.inviteCode){
            this.showPopup("InviteCode error!")
            return 
        }
        this.closeBindPopup()
        const formData = new FormData()
        formData.append("invite_code", this.inviteCode)
        formData.append("invite_by", this.inviteCode)
        // formData.append("address", this.walletAddress)
        // formData.append("chainid", "" + EthersUtils.ChainParams.ChainId)
        let _headers = new Headers()
        _headers.append("Authorization", "Bearer "+ this.Token)
        fetch(this.URI + "/user/inviteby", {
            method: "POST", 
            mode: "cors", 
            cache: "no-cache", 
            body: formData,
            headers: _headers
        }).then((response: Response) => {
            let res = response.text()
            return res
        }).then(async value => {
            this.showLoading(false)
            let res = JSON.parse(value)
            if(res.err_code!=0){
                //登陆异常
                this.showPopup(res.message)
                // console.log("绑定异常")
                return
            }
            let data = res.data;
            // console.log("res.data:", data)
            // if(data.account_status!=0){
            //     //账户异常
            //     this.showPopup(res.message)
            //     console.log("账户状态异常")
            //     return
            // }
            if(!data.invite_by){
                this.showPopup(i18n.t('bind_failed'))
            }else{
                this.showPopup(i18n.t('bind_success'))
            }
            // this.gameBalance = this.truncateToTwoDecimalPlaces(data.available_balance);
            // for(let lab in this.gameBlanaceLabel){
            //     if(parseInt(lab)>3){
            //         this.gameBlanaceLabel[lab].string = this.truncateToTwoDecimalPlaces(data.balance - data.available_balance) + " CORN";
            //     }else{
            //         this.gameBlanaceLabel[lab].string = this.truncateToTwoDecimalPlaces(this.gameBalance) + " CORN";
            //     }
            // }
            // this.uid = data.uid;
            // localStorage.setItem("user", data.uid)
            // localStorage.setItem("inviteAddr", data.invite_by_address)
            // localStorage.setItem("inviteCode", data.invite_code)
            // localStorage.setItem("userBalance", '' + this.gameBalance)
            // localStorage.setItem("walletAddress", this.walletAddress)
            // localStorage.setItem("walletBalance", '' + this.walletBalance)
            // localStorage.setItem("contractAddress", this.contractAddress)
            // localStorage.setItem("receiveAddress", this.receiveAddress)
            // //
            
            // // console.warn("share address:", this.shareLinkLabel.string)
            // // console.info("user data:", data);
            let shareLink = location.host + "?invite=" + data.invite_code;
            // let inviteLink = location.host + "?invite=" + data.invite_by;
            let invite_by_address = '--';
            if(data.invite_by_address){
                invite_by_address = data.invite_by_address.slice(0,6) + "****" + data.invite_by_address.slice(-4)
            }
            this.inviteAddressLabel.string = invite_by_address;
            this.inviteCountLabel.string = '' + data.invite_count;
            this.inviteBonusLabel.string = '' + this.truncateToTwoDecimalPlaces( Number(data.invite_bonus) );
            this.shareLinkLabel.string = shareLink;
            this.inviteCodeLabel.string = data.invite_code;
            // 刷新其他UI部分
            this.userInfoInit()
            // const logs = await EthersUtils.getWalletTransactionLogs()
            // console.log(logs)
            this.registerByAddress(this.walletAddress)
        }).catch(e=>{
            //登陆失败UI弹窗
            this.showPopup(i18n.t("game_server_err"))
            this.showLoading(false)
        });
        
    }


    async getTokenBySign(signStr: string){
        // 获取token
        const formData = new FormData()
        formData.append("uid", '' +this.uid)
        formData.append("action", 'login')
        formData.append("signature", signStr)
        let _headers = new Headers()
        // _headers.append("Content-Type", "multipart/form-data")
        this.showLoading(true)
        await fetch(this.URI + "/play/actions", 
            {method: "POST", 
            mode: "cors", 
            cache: "no-cache", 
            body: formData,
            headers: _headers
        }).then((response: Response) => {
            this.showLoading(false)
            let res = response.text()
            // console.info("rund info text:", res);
            return res
        }).then((text) => {
            let res = JSON.parse(text)
            if(res.err_code!=0){
                this.showPopup(i18n.t("get_token_err"))
                return
            }
            if(!res.data){
                this.showPopup(res.message)
                return
            }
            this.Token = res.data;
            // console.log("actions token get:", this.Token)
            // cache
            this.setTokenInfo(this.Token)
            
            this.centerWalletInfo.active = true;
        }).catch(e=>{
            //登陆失败UI弹窗
            this.showLoading(false)
            this.showPopup(i18n.t("game_server_err"))
            // console.error("get round info error: ", e)
        });
        
    }


    async enterGame(ev){
        if(!this.Token){
            that.showPopup(i18n.t("plslogin"))
            return
        }

        const requestCallable = this.createFetchWithTimeout(3000)
        // 获取当前轮信息
        const formData = new FormData()
        formData.append("uid", '' +this.uid)
        let _headers = new Headers()
        // _headers.append("Content-Type", "multipart/form-data")
        _headers.append("Authorization", "Bearer "+ this.Token)
        this.showLoading(true)
        requestCallable(this.URI + "/round/info", {
            method: "POST", 
            mode: "cors", 
            cache: "no-cache", 
            body: formData,
            headers: _headers,
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
            this.showLoading(false)
            this.showPopup(i18n.t("game_server_err"))
            // console.error("get round info error: ", e)
        });
    }


    createFetchWithTimeout(timeOut = 1000){
        return function(url, options){
            return new Promise((resolve, reject) => {
               const signalController = new AbortController()
               fetch(url, {
                  ...options,
                  signal: signalController.signal
               }).then(resolve, reject)
               setTimeout(() => {
                    reject(new Error('fetch timout'))  //如果fetch的resolve成功了，这里的reject将不会生效，因为promise的状态只会修改第一次
                    //取消请求
                    signalController.abort()
               },timeOut)
            })
        }
    }

}


