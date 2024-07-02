declare module ethers {
    class _utils {
        formatUnits(bignum,depth?:any):any;
        parseUnits(num,depth?:any):any;
        parseEther(num,depth?:any):any;
        getAddress(string):string;
        hexlify(string):string;
        toUtf8Bytes(string): string;
    }
    var providers : any
    var Contract :  any
    var utils:_utils
    var BigNumber : any
    var constants  : any
    var Wallet : any
}