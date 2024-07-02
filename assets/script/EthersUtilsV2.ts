import { ABI } from './ABI';
import * as i18n from 'db://i18n/LanguageData';

//申请测试币：https://www.bnbchain.org/en/testnet-faucet
const BscContract = "0x67E8cF2b76b8b4200e0d70EeF618a6d4b0572b7B"

const ChainNetwork = "bsc"

const BscTestChainParams = {
    ChainId : "97",
    ChainName:"BSC Test",
    RpcUrl :"https://endpoints.omniatech.io/v1/bsc/testnet/public",
    ExplorerUrl:"https://testnet.bscscan.com/",
    // TokenUsdtAdress: "0x22B80EBaCD8aeEeaD2eD4eb3bAd97303B4E42b57"
}

const BscChainParams = {
    ChainId : "56",
    ChainName:"BSC",
    RpcUrl :"https://bsc-dataseed.binance.org/",
    ExplorerUrl:"https://bscscan.com",
    // TokenUsdtAdress: "0x55d398326f99059ff775485246999027b3197955"
}

export var EthersUtils = {
    provider : null,
    signer : null,
    address: "",
    ethereum : null,
    contract: null,
    ChainParams: BscTestChainParams,

    async getAddress(){
        if (!this.ethereum) {
            console.log("ethereum not init?")
            return null
        }
        this.address = await this.ethereum.request({ method: 'eth_requestAccounts'}).then((responseAccountList: any)=>{
            if (responseAccountList.length > 0) {
                // 获取第一个账户地址
                const account = responseAccountList[0];
                return account;
            } else {
                alert("No account connected!")
                return null;
            }
        });
        return this.address;
    },

    async connectWalletV2(){
        var ethereum = window['ethereum']
        if (!ethereum) {
            this.showPopup(i18n.t("open_in_wallet"))
            return null
        }
        // await ethereum.enable()
        this.ethereum = ethereum;
        this.provider = new ethers.providers.Web3Provider(ethereum);
        this.signer = await this.provider && this.provider.getSigner();
        const { chainId } = await this.provider.getNetwork()
        if(parseInt(chainId) != this.ChainParams.ChainId){
            await this.switchChainId()
            console.log(`swich ChaindId: ${chainId} to: ${this.ChainParams.ChainId}`)
        }
        return this.getAddress();
    },


    async getBalanceOfContract(contractAddress: string){
        if(!this.address){
            return this.showPopup(i18n.t("contract_err"))
        }
        this.contract = new ethers.Contract(contractAddress, ABI.Token, EthersUtils.provider);
        var balance = await this.contract.balanceOf(this.address);
        return balance;
    },

    // async connectWallet(){
    //     var ethereum = window['ethereum']
    //     if (!ethereum) {
    //         console.log("未安装 钱包?")
    //         return null
    //     }
    //     // await ethereum.enable()
    //     this.ethereum = ethereum;
    //     this.provider = new ethers.providers.Web3Provider(ethereum);
    //     this.signer = await this.provider && this.provider.getSigner();
    //     const { chainId } = await this.provider.getNetwork()
    //     if(parseInt(chainId) != this.ChainParams.ChainId){
    //         await this.switchChainId()
    //         return null;
    //     } else {
    //         this.address = await this.signer.getAddress();
    //         console.log("链接成功:address:",this.address)
    //         return this.address
    //     }
    // },
    
    async switchChainId(){
        await this.ethereum &&this.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
                {
                    chainId: ethers.BigNumber.from(this.ChainParams.ChainId).toHexString().replace("0x0", "0x"),
                    chainName: this.ChainParams.ChainName,
                    rpcUrls: [this.ChainParams.RpcUrl],
                    blockExplorerUrls: [this.ChainParams.ExplorerUrl],
                },
            ],
        })
        .then((_res) => {
            console.log('switchChainId success')
            location.reload()
        })
        .catch((e) => {
            console.error('switchChainId error:', e)
        })
    },


    async recharge(address: string, value: string, privateKey: string, callback: CallableFunction){
        //
        if(!this.contract){
            return alert("contract null!")
        }
        const signer = await this.contract.connect(this.provider.getSigner())
        this.contract.on("Transfer", callback)
        const dai = ethers.utils.parseUnits(value, 18)
        let tx = await signer.transfer(address, dai)
        // var receipt = await tx.wait();
        console.warn(tx)
        return tx
    }

}
