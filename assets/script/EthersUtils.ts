import { ABI } from './ABI';
import * as i18n from 'db://i18n/LanguageData';


//申请测试币：https://www.bnbchain.org/en/testnet-faucet
// const BscContract = "0x67E8cF2b76b8b4200e0d70EeF618a6d4b0572b7B"


const BscChainParams = {
    ChainId : "56",
    ChainName:"BSC",
    // RpcUrls : ["https://bsc-dataseed.binance.org"],
    ExplorerUrl:"https://bscscan.com",
    checkUri: "https://api.etherscan.io/api",
    checkApi: "?module=logs",
    checkToken: "KPRYDFU4H76EPQ359P68S7KIB9S6NRGCR1"
    // TokenUsdAdress: "0x55d398326f99059ff775485246999027b3197955"
}

export var EthersUtils = {
    provider : null,
    signer : null,
    address: "",
    ethereum : null,
    contract: null,
    ChainParams: BscChainParams,
    showPopup: null,
    eventCallable: null,
    Wallet: null,
    
    setShowPop(func: CallableFunction){
        this.showPopup = func;
    },

    //
    async getAddress(){
        this.ethereum = window['ethereum'] ? window['ethereum'] : window['ethers']
        if (!this.ethereum) {
            // console.log("ethereum not init?")
            return null
        }

        this.provider = new ethers.providers.Web3Provider(this.ethereum);
        const { chainId } = await this.provider.getNetwork()
        if(parseInt(chainId) != this.ChainParams.ChainId){
            await this.switchChainId()
            // console.log(`swich ChaindId: ${chainId} to: ${this.ChainParams.ChainId}`)
        }
        this.signer = await this.provider && this.provider.getSigner();
        this.address = await this.ethereum.request({ method: 'eth_requestAccounts'}).then((responseAccountList: any)=>{
            if (responseAccountList.length > 0) {
                // 获取第一个账户地址
                const account = responseAccountList[0];
                return account;
            } else {
                // alert("No account connected!")
                // this.showPopup(i18n.t("no_wallet_account"))
                return null;
            }
        });
        return this.address;
    },


    registerAccountChange(onAccountChange: CallableFunction){
        var ethereum = window['ethereum'] ? window['ethereum'] : window['ethers']
        if (!ethereum) {
            // console.log("未安装 插件?")
            // this.showPopup(i18n.t("open_in_wallet"))
            return null
        }
        ethereum.on('accountsChanged', onAccountChange)
    },
    

    async connectWalletV2(){
        var ethereum = window['ethereum'] ? window['ethereum'] : window['ethers']
        if (!ethereum) {
            // console.log("未安装 插件?")
            // this.showPopup(i18n.t("open_in_wallet"))
            return null
        }
        // this.getAddress();
        // try {
        //     await ethereum.enable()
        // } catch (error) {}
        
        this.ethereum = ethereum;
        this.provider = new ethers.providers.Web3Provider(ethereum);
        this.signer = await this.provider && this.provider.getSigner();
        const { chainId } = await this.provider.getNetwork()
        if(parseInt(chainId) != this.ChainParams.ChainId){
            await this.switchChainId()
            // console.log(`swich ChaindId: ${chainId} to: ${this.ChainParams.ChainId}`)
        }
        return this.address;
    },


    async getBalanceOfContract(contractAddress: string){
        if(!this.address){
            // return this.showPopup(i18n.t("contract_err"))
            return
        }
        let abi = [
            "function decimals() view returns (uint8)",
            "function symbol() view returns (string)",
            "function balanceOf(address a) view returns (uint)",
            "function transfer(address to, uint amount)"
        ]
        this.contract = new ethers.Contract(contractAddress, abi, this.provider);
        var balance = await this.contract.balanceOf(this.address);
        return balance;
    },

    async connectWallet(){
        var ethereum = window['ethereum']
        if (!ethereum) {
            return null
        }
        // await ethereum.enable()
        this.ethereum = ethereum;
        this.provider = new ethers.providers.Web3Provider(ethereum);
        this.signer = await this.provider && this.provider.getSigner();
        const { chainId } = await this.provider.getNetwork()
        if(parseInt(chainId) != this.ChainParams.ChainId){
            await this.switchChainId()
            return null;
        } else {
            this.address = await this.signer.getAddress();
            return this.address
        }
    },
    
    async switchChainId(){
        await this.ethereum &&this.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
                {
                    chainId: ethers.BigNumber.from(this.ChainParams.ChainId).toHexString().replace("0x0", "0x"),
                    chainName: this.ChainParams.ChainName,
                    rpcUrls: this.ChainParams.RpcUrls,
                    blockExplorerUrls: [this.ChainParams.ExplorerUrl],
                },
            ],
        })
        .then((_res) => {
            // console.log('switchChainId success')
            // location.reload()
        })
        .catch((e) => {
            // console.error('switchChainId error:', e)
        })
    },


    gotEvent(from, to, amount, event){
        console.error("Got event!")
        console.error("from:", from)
        console.error("to:", to)
        console.error("amount:", amount)
        console.error("event:", event)
    },




    async recharge(toAddress: string, reachargeValue: string, callback: CallableFunction){
        //
        if(!this.contract){
            // return this.showPopup(i18n.t(`e-99`))
        }
        //
        try {
            const signer = this.contract.connect(this.provider.getSigner())
            // const filter = this.contract.filters.Transfer(this.address, address)
            // this.contract.on(filter, callback);
            const dai = ethers.utils.parseEther(reachargeValue)
            // console.warn("dai:", dai, " rechargeValue:", reachargeValue)
            // console.warn("from:", this.address, " to:", toAddress)
            return await signer.transfer(toAddress, dai);
        } catch (error) {
            // this.showPopup(i18n.t(`e-100`))
            // console.log("call transfer fail: ", error)
            // callback(this.address, address, reachargeValue,  {})
            return error
        }
    },


    async getSignMessage(msg: string){
        let signedMessage;
        try {
            if(this.signer){
                signedMessage = await this.signer.signMessage(msg)
            }
            // console.log('Signature:', signedMessage);
        } catch (error) {
            signedMessage = error;
        }
        return signedMessage
    },


    async getWalletTransactionLogs(){
        let filter = this.contract.filters.Transfer
        let logs = [];
        try {
            logs = await this.provider.getLogs(filter)
        } catch (error) {
            console.error("getWalletTransactionLogs error:", error)
        }
        console.warn("getWalletTransactionLogs: ", logs)
        return logs
    },


    async getWalletTransactions(){
        let filter = this.contract.filters.Transfer
        let history = await this.contract.queryFilter(filter, -200)
        return history;
    },



}
