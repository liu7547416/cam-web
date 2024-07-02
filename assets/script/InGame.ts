import { _decorator, Component, Node, Sprite, Label, director, instantiate, Prefab, Scheduler, game } from 'cc';
import * as i18n from 'db://i18n/LanguageData';
import { EthersUtils } from './EthersUtils';

const { ccclass, property } = _decorator;

var that = null;

@ccclass('InGame')
export class InGame extends Component {

    scoreList: number[] = [100, 50, 10, 1, 0.1];
    userSelectScoreIndex: number = 4

    @property(Sprite)
    descSprite: Sprite = null

    @property(Node)
    btnGroup: Node = null

    @property(Label)
    countLab: Label = null

    @property(Sprite)
    userSprite: Sprite = null

    @property(Prefab)
    killerPrefab: Prefab = null

    killerSprite: Node

    @property(Prefab)
    otherUserPrefab: Prefab

    @property(Prefab)
    scoreItemPrefab: Prefab

    @property(Node)
    scoreItemRoot: Node

    @property(Label)
    defaultScoreLabel: Label

    @property(Node)
    userCountBG: Node = null

    @property(Label)
    userCount: Label = null

    @property(Label)
    totalScoreLabel: Label = null

    @property(Label)
    balanceScoreLabel: Label = null

    @property(Node)
    scoresNode: Node = null;

    @property(Node)
    scoresBtn: Node = null;

    @property(Sprite)
    mapLayer: Sprite = null;


    @property(Node)
    waitingLayer: Node = null;

    

    @property(Node)
    mask_ch: Node

    @property(Node)
    mask_en: Node

    @property(Sprite)
    game_res_layer: Sprite = null

    @property(Sprite)
    popLayer: Sprite = null

    currentMaskLayer: Node = null


    @property(Node)
    countdownSecNodeCH: Sprite = null

    @property(Node)
    countdownSecNodeEN: Sprite = null

    currentTimeSec = null

    lastCountdownSec = 0
    totalCountdownSec = 0

    selectScoreValue: number = 0.1
    userAddScoreCount: number = 0
    lastUserAddScore: number = 0

    userGameBalance: number = 0

    existUsers = []

    uid = 0
    userSelectedRoom = -1


    shadhowSprite: Node = null


    // language = navigator.language.toLowerCase();

    URI = "https://gamedevapi.bitcoinxo.io"

    round = 0
    wait_next_round = false
    time_sec = 10

    //
    roomUsersIds = []
    hallUsersIds = []
    roomUsersInstance = []
    hallUsersInstance = []


    enterGame = false;
    gameLoop = true;
    gameEnd = false;
    gameClose = false;
    updateIng = false;

    gameResultInfo = {isWin: false, failRoom: 0, failRoomScore: 0}

    Token = ""

    getResultIng = false;


    endRoundId = 0;
    waitingNewGame = false;

    stopAddScore = false;

    firstLoadData = true;
    lowestUserCount = 0;
    stopUpdateId = 0;

    gotLastRoundInfo = false;

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
        game.frameRate = 24
    }


    loadDepositLevel(){
        let depositLevel = localStorage.getItem("depositLevel")
        let dpList = depositLevel.split(",").reverse()
        let res: number[];
        res = dpList.map(str => +str);
        //
        res.forEach((item,idx)=>{
            const itemObj = instantiate(this.scoreItemPrefab);
            this.scoreItemRoot.addChild(itemObj);
            itemObj.getComponent("score").setNum(item, idx, that.onSelectedDiamonds)
        })
        this.defaultScoreLabel.string = '' + res[res.length-1]
        return res;
    }


    async start(){
        that = this;
        this.scoreList = this.loadDepositLevel()
        // console.warn("userCount:", this.userCount)
        this.enterGame = true;
        this.uid = parseInt(localStorage.getItem("user"))
        // console.warn("用户ID", this.uid)
        //循环获取 游戏玩家数据
        
        // console.warn("schedule is run!")
        this.userAddScoreCount = 0
        this.totalCountdownSec = 0
        this.gameLoop = true;
        this.Token = this.getTokenInfo()
        //
        await this.getBalance()
        this.languageInit()
        await this.getGameInfo(0.1)
        if(!this.uid){
            this.showPopup(i18n.t("notlogin"))
        }
    }


    restart(dt){
        this.Token = this.getTokenInfo()
        if(!this.Token){
            this.closeGame()
        }
        this.firstLoadData = true;
        // this.getBalance()
        this.showPopup(null)
        this.gameEnd = false;
        console.warn("新游戏回合-开始!")
        // this.allUserClean()
        // this.cleanSelectRoom()
        //重置右侧显示
        this.userAddScoreCount = 0
        this.totalCountdownSec = 0
        // this.userSelectedRoom = -1
        this.gameLoop = true;
        //
        //循环获取 游戏玩家数据
        
        this.getBalance()
        this.enterGame = true;
        // this.schedule(this.getGameInfo, 2)
        this.getGameInfo(1)
    }


    timestampNow(){
        return new Date().getTime()/1000
    }


    showPopup(t: string){
        if(!t){
            return this.popLayer.node.active = false;
        }
        let lab = this.popLayer.node.getChildByName("box").getChildByName("text").getComponent(Label)
        this.popLayer.node.active = true
        lab.string = t;
        // console.log("this.commonPopLayer:", this.popLayer)
        // console.log("lab.string:", lab.string)
    }


    disableAddBtn(disable: boolean){
        that.scoresBtn.active = disable;
        that.stopAddScore = disable;
    }
    


    languageInit(){
        if(i18n._language === 'zh'){
            i18n.init("zh")
            // console.error("zh: ", "初始化")
            this.countdownSecNodeCH.active = true;
            this.countdownSecNodeEN.active = false;
            this.currentTimeSec = this.countdownSecNodeCH.getComponent("show_time_sec")
            // console.log("this.currentTimeSec: ", this.currentTimeSec)
            this.mask_ch.active = true;
            this.mask_en.active = false;
            this.currentMaskLayer = this.mask_ch;
        }else{
            i18n.init("en")
            // console.error("en: ", "初始化")
            this.countdownSecNodeCH.active = false;
            this.countdownSecNodeEN.active = true;
            this.currentTimeSec = this.countdownSecNodeEN.getComponent("show_time_sec")
            this.mask_ch.active = false;
            this.mask_en.active = true;
            this.currentMaskLayer = this.mask_en;
        }
        this.game_res_layer.getComponent("game_res").hide()
        // i18n.updateSceneRenderers();
        // console.log("this.currentMaskLayer:", this.currentMaskLayer)
        this.showCountdownSecNode(false)
    }


    showStopAddScore() {
        this.showPopup(i18n.t("stop_add_score"))
    }


    showCountdownSecNode(show=true){
        this.currentTimeSec.node.active = show;
        this.userCountBG.active = !show;
    }


    updateCurrentScore(v: number){
        this.userAddScoreCount = this.DecimalTwo(v)
        this.lastUserAddScore = this.DecimalTwo(v)
    }


    updateRoomScores(roomList, totalScore){
        // 清空
        this.totalScoreLabel.string = ": "+ totalScore
        let children = this.scoresNode.children
        for(let n in children){
            let labNode = children[n].getChildByName("num")
            let showLabel = labNode.getComponent(Label)
            showLabel.string = "0"
        }
        //
        for(let i in roomList){
            // console.log("i:", i)
            let roomInfo = roomList[i];
            if(roomInfo.room_id>10 || roomInfo.room_id<1){
                console.error("异常的房间：", roomInfo)
                continue
            }
            let labNode = this.scoresNode.children[roomInfo.room_id-1].getChildByName("num")
            let showLabel = labNode.getComponent(Label)
            showLabel.string = "" + roomInfo.amount;
            // console.log("更新房间：", roomInfo.room_id-1, " 积分：", roomInfo.amount)
        }
    }


    resetRoomScore(){
        let scoresNodeList = this.scoresNode.children
        for(let i in scoresNodeList){
            let labNode = scoresNodeList[i].getChildByName("num")
            let showLabel = labNode.getComponent(Label)
            showLabel.string = "0"
        }
    }


    getInstanceUser(uid){
        if(uid==this.uid){
            return this.userSprite
        }
        for(let i in this.roomUsersInstance){
            let ins = this.roomUsersInstance[i]
            if(ins.getComponent("otherRole").getUid()==uid){
                return ins;
            }
        }
    }

    getRoomChangeInstanceUser(roomId, uid){
        if(uid==this.uid){
            if(this.userSprite.getComponent("myRole").getRoomId()!=roomId)
                return this.userSprite;
            else
                return null;
        }
        for(let i in this.roomUsersInstance){
            let ins = this.roomUsersInstance[i];
            let insComponent = ins.getComponent("otherRole") ? ins.getComponent("otherRole") : ins.getComponent("myRole")
            if(insComponent.getUid()==uid && insComponent.getRoomId()!=roomId){
                return ins;
            }
        }
    }


    // // 全部房间的用户id
    instanceAllRoomUsers(room_list) {
        // 实列化房间内对象
        for(let i in room_list){
            let roomId = room_list[i].room_id - 1
            for(let j in room_list[i].user_list) {
                let userInfo = room_list[i].user_list[j]
                if(userInfo.uid==1){
                    continue
                }
                // 
                if(userInfo.uid==this.uid){
                    // console.warn(`玩家${userInfo.uid} 已在房间：${roomId}`)
                    this.updateCurrentScore(userInfo.cost_amount)
                    this.userAddScoreCount = userInfo.cost_amount;
                    this.userSprite.getComponent("myRole").inRoom(roomId)
                    this.roomUsersInstance.push(this.userSprite)
                }else{
                    // console.warn("其他玩家已在房间：", userInfo.uid)
                    const otherUserObje = instantiate(this.otherUserPrefab);
                    this.mapLayer.node.addChild(otherUserObje);
                    otherUserObje.getComponent("otherRole").setName(userInfo.address, userInfo.uid)
                    otherUserObje.getComponent("otherRole").inRoom(roomId)
                    this.roomUsersInstance.push(otherUserObje)
                }
                this.roomUsersIds.push(userInfo.uid)
            }
        }
    }


    instanceHallUsers(hall_list){
        // 实列化房间内对象
        for(let i in hall_list){
            let userInfo = hall_list[i]
            if(userInfo.uid==1){
                continue
            }
            if(this.hallUsersIds.includes(userInfo.uid)){
                continue
            }
            
            // 自己进入大厅
            if(userInfo.uid ==this.uid){
                this.userSprite.getComponent("myRole").wallEnter()
                this.hallUsersIds.push(userInfo.uid)
                this.hallUsersInstance.push(this.userSprite)
                continue;
            }
            // 
            const otherUserObje = instantiate(this.otherUserPrefab);
            this.mapLayer.node.addChild(otherUserObje)
            otherUserObje.getComponent("otherRole").setName(userInfo.address, userInfo.uid)
            otherUserObje.getComponent("otherRole").enterHall()
            this.hallUsersInstance.push(otherUserObje)
            this.hallUsersIds.push(userInfo.uid)
        }
    }


    instanceOtherHallUsers(hall_list){
        // 实列化房间内对象
        for(let i in hall_list){
            let userInfo = hall_list[i]
            if(userInfo.uid==1){
                continue
            }
            if(this.hallUsersIds.includes(userInfo.uid)){
                continue
            }
            // console.warn("其他玩家进大厅：", userInfo.uid)
            const otherUserObje = instantiate(this.otherUserPrefab);
            this.mapLayer.node.addChild(otherUserObje)
            otherUserObje.getComponent("otherRole").setName(userInfo.address, userInfo.uid)
            otherUserObje.getComponent("otherRole").enterHall()
            this.hallUsersInstance.push(otherUserObje)
            this.hallUsersIds.push(userInfo.uid)
        }
    }


    roomUids(room_list){
        if(room_list.length==0){
            return []
        }
        const allUids = room_list.flatMap(room => 
            room.user_list.map(user => user.uid)
          );
        return allUids;
    }



    // 处理大厅退出游戏
    hallUserQuitGame(newHallUids, hallUids){
        //
        let quitUids = hallUids.filter(uid=> !newHallUids.includes(uid))
        // 需要删除的大厅玩家
        let deleteInstance = this.hallUsersInstance.filter(user=>{
            quitUids.includes(user.getComponent("otherRole").getUid())
        })
        // 保留的大厅玩家
        // this.hallUsersInstance = this.hallUsersInstance.filter(user=>{
        //     !quitUids.includes(user.getComponent("otherRole").getUid())
        // })
        //
        for(let i in deleteInstance){
            deleteInstance[i].destroy();
        }
    }



    // 处理房间切换的玩家
    changeRoomUsers(room_list){
        for(let i in room_list){
            let roomId = room_list[i].room_id - 1
            for(let j in room_list[i].user_list){
                let userInfo = room_list[i].user_list[j]
                // 更新玩家当前投入积分
                if(userInfo.uid==this.uid && !this.gameEnd){
                    this.updateCurrentScore(userInfo.cost_amount)
                }
                //变更房间
                let obj = this.getRoomChangeInstanceUser(roomId, userInfo.uid)
                if(!obj){
                    continue
                }
                let insComponent = obj.getComponent("myRole") ? obj.getComponent("myRole") : obj.getComponent("otherRole")
                insComponent.changeRoom(roomId)
                // console.error(insComponent, `玩家${userInfo.uid}变更房间：${roomId}`)
                
            }
        }
    }


    // 处理玩家进大厅
    newUserEnterHall(newHallUids, hallUids, hall_list){
        let enterUids =  hallUids.filter(uid=>!newHallUids.includes(uid))
        if(enterUids.length>0){
            // console.warn("其他玩家进游戏：", enterUids)
        }
        
        for(let i in hall_list){
            if(enterUids.includes(hall_list[i].uid)){
                let userInfo = hall_list[i]
                // 
                const otherUserObje = instantiate(this.otherUserPrefab);
                this.mapLayer.node.addChild(otherUserObje)
                otherUserObje.getComponent("otherRole").setName(userInfo.address, userInfo.uid)
                this.hallUsersInstance.push(otherUserObje)
                this.hallUsersIds.push(userInfo.uid)
            }
        }
    }


    getHallUserInstance(uid){
        for(let i in this.hallUsersInstance){
            let u = this.hallUsersInstance[i]
            if(!u || !u.getComponent("otherRole")){
                continue
            }
            if(u.getComponent("otherRole").getUid()==uid){
                return {"user":u, "component":u.getComponent("otherRole")}
            }
        }
        return {"user": null, "component":null}
    }
    

    // 处理大厅进房间
    hallUserEnterRoom(room_list, toRoomUids){
        for(let i in room_list){
            for(let j in room_list[i].user_list){
                let userInfo = room_list[i].user_list[j];
                if(toRoomUids.includes(userInfo.uid)){
                    let roomId = room_list[i].room_id-1;
                    if(userInfo.uid  == this.uid){
                        // console.warn("玩家自己进房间：", userInfo.uid, " sp:", this.userSprite)
                        this.userSprite.getComponent("myRole").setRoomId(roomId)
                        this.roomUsersInstance.push(this.userSprite)
                        this.roomUsersIds.push(this.uid)
                    }else{
                        // console.warn("其他玩家进房间：", userInfo.uid)
                        if(this.hallUsersIds.includes(userInfo.uid)){
                            const userObj = this.getHallUserInstance(userInfo.uid)
                            if(!userObj.user || !userObj.component){
                                // console.warn("其他玩家进房间：", userInfo.uid)
                                continue
                            }
                            this.hallUsersIds = this.hallUsersIds.filter((e,i)=>{e!==userInfo.uid})
                            this.hallUsersInstance = this.hallUsersInstance.filter((e,i)=>{
                                                            let c = e.getComponent("otherRole") ? e.getComponent("otherRole") : e.getComponent("myRole");
                                                            if(!c){
                                                                return false;
                                                            }
                                                            return c.getUid()!==userInfo.uid
                                                        })
                            userObj.component.setName(userInfo.address, userInfo.uid)
                            userObj.component.setRoomId(roomId)
                            this.roomUsersInstance.push(userObj.user)
                            this.roomUsersIds.push(userInfo.uid)
                        }else{
                            const otherUserObj = instantiate(this.otherUserPrefab);
                            this.mapLayer.node.addChild(otherUserObj)
                            otherUserObj.getComponent("otherRole").setName(userInfo.address, userInfo.uid)
                            otherUserObj.getComponent("otherRole").setRoomId(roomId)
                            this.roomUsersInstance.push(otherUserObj)
                            this.roomUsersIds.push(userInfo.uid)
                        }
                        this.roomUsersIds.push(userInfo.uid)
                    }
                }
            }
        }
    }


    async addScore(add){
        // PROD
        if(that.stopAddScore && add>0){
            return that.showStopAddScore()
        }
        
        if(this.userSelectedRoom<0){
            // console.error("this.select room:", this.userSelectedRoom)
            return this.showPopup(i18n.t("not_select"))
        }

        if(!this.userAddScoreCount && !add){
            return
        }

        // await this.getBalance()
        if(add){
            // 
            this.userGameBalance = this.DecimalTwo(this.userGameBalance)
            //
            this.selectScoreValue = this.scoreList[this.userSelectScoreIndex];
            
            let toValue = this.DecimalTwo(this.DecimalTwo(this.userAddScoreCount) + this.DecimalTwo(this.selectScoreValue));
            console.log("当前投入:", this.userAddScoreCount, " 新增投入：", this.DecimalTwo(this.selectScoreValue), " 投入后：", toValue)
            if(this.userGameBalance < toValue){
                return this.showPopup(i18n.t("more_balance") +':'+ toValue)
            }
            this.userAddScoreCount = toValue
            // console.error("投入金额：", this.userAddScoreCount)
            // console.warn("余额:", this.userGameBalance)
        }
        let _headers = new Headers()
        // _headers.append("Content-Type", "multipart/form-data")
        _headers.append("Authorization", "Bearer "+ this.Token)
        const formData = new FormData()
        let toRoom = Number(this.userSelectedRoom) + 1;
        // formData.append("round", '' +0)
        formData.append("uid", '' + this.uid)
        formData.append("room", '' + toRoom)
        formData.append("round", '' + this.round)
        formData.append("amount", '' + this.userAddScoreCount)
        await fetch(this.URI + "/round/participate", {
            method: "POST", 
            mode: "cors", 
            cache: "no-cache", 
            body:  formData,
            headers: _headers
       }).then((response: Response) => {
           return response.text()
       }).then((value) => {
           let data = JSON.parse(value)
        //    console.info(data);
            if(data.err_code!=0){
                return this.showPopup(data.message)
            }
            this.getBalance()
            // this.cleanSelectRoom()
       }).catch(e=>{
            console.error(e)
       });
   }


    showResLayer(isWin, roomCorn, roomId){
        let callScript = this.game_res_layer.getComponent("game_res")
        if(!isWin){
            roomCorn = this.lastUserAddScore;
        }
        callScript.showStatus(isWin, roomCorn, roomId)
        // console.error(">>>>>>>>> show result! <<<<<<<<<<")
        this.scheduleOnce(this.restart, 15)
    }


    getFailRoomScore(room_list, fail_room){
        for(let i in room_list){
            let roomInfo = room_list[i];
            if(roomInfo.room_id == fail_room){
                return roomInfo.amount
            }
        }
        return 0;
    }



    startTimeSecRun(){
        if(this.gameEnd){
            //倒计时结束 获取游戏结果
            // this.currentTimeSec.setTimeSec(0)
            return
        }
        this.currentTimeSec && this.currentTimeSec.setTimeSec(this.totalCountdownSec, this.getResult);
    }


    allUserClean(){
        //
        for(let i in this.roomUsersInstance){
            let obj = this.roomUsersInstance[i];
            if(this.roomUsersInstance[i].getComponent("myRole") && this.roomUsersInstance[i].getComponent("myRole").getUid()==this.uid){
                this.roomUsersInstance[i].getComponent("myRole").initPosition()
                continue
            }
            obj.destroy()
        }
        for(let i in this.hallUsersInstance){
            let obj = this.hallUsersInstance[i];
            if(this.hallUsersInstance[i].getComponent("myRole") && this.hallUsersInstance[i].getComponent("myRole").getUid()==this.uid){
                // this.hallUsersInstance[i].getComponent("myRole").initPosition()
                continue
            }
            obj.destroy()
        }
        this.roomUsersInstance.length = 0;
        this.hallUsersInstance.length = 0;
        this.hallUsersInstance = []
        this.roomUsersInstance = []
        this.hallUsersIds = []
        this.roomUsersIds = []
        let roles = this.mapLayer.node.children;
        for(let i in roles){
            if(!roles[i] ){
                continue
            }
            let scriptRole = roles[i].getComponent("otherRole")
            if(!scriptRole){
                continue
            }
            roles[i].destroy()
        }
    }


   async getGameInfo(dt){
        // if(dt!=-1){
        //     this.gameLoop = false;
        // }else{
        //     this.gameLoop = true;
        // }
        if(this.gameClose){
            return
        }
        if(this.gameEnd){
            this.disableAddBtn(true)
            this.userAddScoreCount = 0
            // return 
            // await this.sleepReq(2000)
            // return this.getGameInfo(1)
        }
        if(this.round && this.stopUpdateId==this.round){
            return 
        }
        // >>>>>>>>> new change <<<<<<<<<
        // if(this.gameEnd){
        //     this.updateIng = false;
        //     return console.error("waiting result!")
        // }
        
        if(this.updateIng){
            return console.error("getGameInfo Anti-shake!")
        }
        this.updateIng = true;
        await this.sleepReq(2000)
        let fromData = new FormData()
        fromData.append("uid", '' +this.uid)
        fromData.append("round", '' +this.round)
        let _headers = new Headers()
        _headers.append("Authorization", "Bearer "+ this.Token)
        const requestCallable = this.createFetchWithTimeout(3000)
        requestCallable(that.URI + "/round/info", {
            method: "POST", 
            mode: "cors", 
            cache: "no-cache", 
            body: fromData,
            headers: _headers,
        }).then((response: Response) => {
           return response.text()
       }).then((res) => {
            //
            if(!res){
                this.updateIng = false;
                this.getGameInfo(1)
                return
            }
            let resInfo: any = {}
            try {
                resInfo = JSON.parse(res)
            } catch (error) {}
            //
            if(resInfo.err_code!=0){
                // 异常
                // this.showPopup(i18n.t("game_server_err"))
                this.updateIng = false;
                this.getGameInfo(1)
                return
            }
            
            //
            let data = resInfo.data;
            if(data.start_time>this.timestampNow()){
                this.disableAddBtn(true)
                // this.updateIng = false;
                // return this.getGameInfo(1)
            }else{
                if(!data.is_finished){
                    // this.userAddScoreCount = 0
                    this.disableAddBtn(false)
                }
            }
            // 局次增加 初始化场景
            if(data.round!=this.round){
                if(!this.gameEnd){
                    this.round = data.round
                }else{
                    this.userAddScoreCount = 0
                }
                // this.updateIng = false;
                // this.getGameInfo(1)
                // return
            }else{
                this.updateRoomScores(data.room_list, data.total_amount)
            }
            //
            if(!this.totalCountdownSec){
                this.totalCountdownSec = data.count_down_time
            }
            this.lowestUserCount = data.lowest_user_count;
            this.userCount.string = data.total_user_count + ' / ' + data.lowest_user_count;
            //
            
            //
            // if(this.endRoundId==data.round){
            //     this.updateIng = false;
            //     this.getGameInfo(1)
            //     return
            // }
            
            // this.round = data.round;
            //刚进游戏时实列化全部
            if(this.enterGame){
                this.instanceAllRoomUsers(data.room_list)
                if(data.hall_list){
                    this.instanceHallUsers(data.hall_list)
                    this.hallUsersIds = data.hall_list.map(e=>e.uid);
                }
                this.enterGame = false;
                this.updateIng = false;
                // >>>>>> new change <<<<<<<<<<
                // this.getGameInfo(1)
                // return
            }else{
                //额外添加的 大厅玩家实例化
                if(this.hallUsersIds.length==0)
                    this.instanceOtherHallUsers(data.hall_list)
            }

            // 最新房间玩家id列表
            let roomUids = this.roomUids(data.room_list)
            // 旧大厅玩家*进入房间的id列表--操作行走
            let toRoomUids = []
            if(this.roomUsersIds.length==0){
                toRoomUids = roomUids;
            }else{
                toRoomUids = this.hallUsersIds.filter(uid=> roomUids.includes(uid))
            }
            if(!toRoomUids){
                toRoomUids = []
            }
            // console.warn("房间玩家：", roomUids, "大厅玩家：", this.hallUsersIds)
            // console.error("进房间的玩家:", toRoomUids)
            this.hallUserEnterRoom(data.room_list, toRoomUids)
            // 旧大厅玩家*未进房间id列表 -- 可从中找到退出大厅、进入房间的玩家
            let notToRoomUids = this.hallUsersIds.filter(uid=> !roomUids.includes(uid))
            // 最新大厅玩家列表
            const newHallUids = data.hall_list ? data.hall_list.map(e=>e.uid) : [];
            // 删除退出大厅的玩家
            // this.hallUserQuitGame(newHallUids, notToRoomUids)
            // 大厅新进入玩家
            this.newUserEnterHall(data.hall_list, newHallUids, notToRoomUids)
            // 覆盖旧大厅玩家
            this.hallUsersIds = newHallUids;
            // 改房间的玩家
            this.changeRoomUsers(data.room_list)
            // 用户不在大厅和房间 异常提示
            if(!this.hallUsersIds.includes(this.uid) && !this.roomUsersIds.includes(this.uid)){
                this.userSprite.getComponent("myRole").wallEnter()
                // this.showPopup(i18n.t("account_status_err"))
            }
            // 本局结束
            // console.warn("游戏满足条件：", data.lowest_user_count, " ", data.total_user_count)
            if(parseInt(data.lowest_user_count)<=parseInt(data.total_user_count) && this.endRoundId!=data.round){
                // 暂停查询 等候下一局
                // this.scoresBtn.active = true;
                // console.error("满足条件开始倒计时！")
                // 开始倒计时
                
                this.endRoundId = this.round;
                this.showCountdownSecNode(true)
                this.startTimeSecRun()
                this.updateIng = false;
                // return
            }
            //
            if(!this.gameLoop){
                return
            }
            //
            this.updateIng = false;
            this.getGameInfo(1)
       }).catch(e=>{
            this.updateIng = false;
            this.getGameInfo(1)
            console.error(e)
       });
   }


    async getLastGameInfo(){
        let fromData = new FormData()
        fromData.append("uid", '' +that.uid)
        fromData.append("round", '' +that.round)
        let _headers = new Headers()
        _headers.append("Authorization", "Bearer "+ that.Token)
        const requestCallable = that.createFetchWithTimeout(3000)
        requestCallable(that.URI + "/round/info", {
            method: "POST", 
            mode: "cors", 
            cache: "no-cache", 
            body: fromData,
            headers: _headers,
        }).then((response: Response) => {
            return response.text()
        }).then((res) => {
            //
            if(!res){
                that.getLastGameInfo()
                return
            }
            let resInfo = {}
            try {
                resInfo = JSON.parse(res)
            } catch (error) {
                console.error("getLastGameInfo error:", error)
            }
            
            if(resInfo.err_code!=0){
                // 异常
                // that.showPopup(i18n.t("game_server_err"))
                that.getLastGameInfo()
                return
            }
            
            //
            let data = resInfo.data;
            //
            that.updateRoomScores(data.room_list, data.total_amount)
            if(!that.totalCountdownSec){
                that.totalCountdownSec = data.count_down_time
            }
            that.lowestUserCount = data.lowest_user_count;
            that.userCount.string = data.total_user_count + ' / ' + data.lowest_user_count;
            
            // 最新房间玩家id列表
            let roomUids = that.roomUids(data.room_list)
            // 旧大厅玩家*进入房间的id列表--操作行走
            let toRoomUids = []
            if(that.roomUsersIds.length==0){
                toRoomUids = roomUids;
            }else{
                toRoomUids = that.hallUsersIds.filter(uid=> roomUids.includes(uid))
            }
            if(!toRoomUids){
                toRoomUids = []
            }
            // console.warn("房间玩家：", roomUids, "大厅玩家：", that.hallUsersIds)
            // console.error("进房间的玩家:", toRoomUids)
            that.hallUserEnterRoom(data.room_list, toRoomUids)
            // 旧大厅玩家*未进房间id列表 -- 可从中找到退出大厅、进入房间的玩家
            let notToRoomUids = that.hallUsersIds.filter(uid=> !roomUids.includes(uid))
            // 最新大厅玩家列表
            const newHallUids = data.hall_list ? data.hall_list.map(e=>e.uid) : [];
            // 删除退出大厅的玩家
            // that.hallUserQuitGame(newHallUids, notToRoomUids)
            // 大厅新进入玩家
            that.newUserEnterHall(data.hall_list, newHallUids, notToRoomUids)
            // 覆盖旧大厅玩家
            that.hallUsersIds = newHallUids;
            // 改房间的玩家
            that.changeRoomUsers(data.room_list)
            // 用户不在大厅和房间 异常提示
            if(!that.hallUsersIds.includes(that.uid) && !that.roomUsersIds.includes(that.uid)){
                that.userSprite.getComponent("myRole").wallEnter()
                // that.showPopup(i18n.t("account_status_err"))
            }
        }).catch(e=>{
            console.error(e)
        });
    }


    //获取积分结果 
    async getResult(){
        that.gameEnd = true;
        if(that.getResultIng){
            return
        }
        that.disableAddBtn(true)
        that.waitingLayer.active = true;
        that.getResultIng = true;
        if(!that.gotLastRoundInfo){
            that.gotLastRoundInfo = true;
            that.getLastGameInfo()
        }
        
        // that.disableAddBtn(true)
        //
        await that.sleepReq(1000)
        let fromData = new FormData()
        fromData.append("round", '' + that.round)
        let _headers = new Headers()
        // _headers.append("Content-Type", "multipart/form-data")
        _headers.append("Authorization", "Bearer "+ that.Token)
        await fetch(that.URI + "/round/result", 
            {method: "POST", 
            mode: "cors", 
            cache: "no-cache", 
            body: fromData,
            headers: _headers
        }).then((response: Response) => {
            return response.text()
        }).then((value) => {
            let res = JSON.parse(value);
            if(res.err_code!=0){
                that.getResultIng = false;
                that.waitingLayer.active = true;
                if(res.message!="round not end"){
                    // 异常
                    
                    that.showPopup(i18n.t("game_server_err"))
                    // that.scoresBtn.grayscale = false;
                }
                //继续查询结果
                return that.getResult()
            }
            //
            let data = res.data;
            let failRoom = Number(data.faile_room) - 1
            if(failRoom<0){
                that.getResultIng = false;
                that.waitingLayer.active = false;
                // that.scoresBtn.grayscale = false;
                return that.getResult()
            }
            // 停止游戏回合数据查询
            that.gameLoop = false;
            that.stopUpdateId = that.round;
            // 杀手进入房间
            that.killerSprite = instantiate(that.killerPrefab)
            that.mapLayer.node.addChild(that.killerSprite)
            that.killerSprite.getComponent("walk").setRoomId(failRoom, that.killerWalkEnd)
            let isWin = failRoom != that.userSelectedRoom;
            let failRoomScore = data.faile_room_amount;
            that.gameResultInfo.isWin = isWin;
            that.gameResultInfo.failRoomScore = failRoomScore;
            that.gameResultInfo.failRoom = failRoom;
            that.wait_next_round = true;
            //关闭按钮
            // that.scoresBtn.active = false;
            that.getResultIng = false;
            that.waitingLayer.active = false;
            that.endRoundId = 0;
            // that.round = that.round + 1;
        }).catch(err=>{
            console.error("game res:", err)
            that.getResultIng = false;
            that.waitingLayer.active = false;
            that.getResult()
        });
    }

    killerWalkEnd(){
        // that.gameEnd = false;
        that.disableAddBtn(true)
        that.showResLayer(that.gameResultInfo.isWin, that.gameResultInfo.failRoomScore, that.gameResultInfo.failRoom)
        that.userSprite.getComponent("myRole").backHall()
        // console.warn("clean last game user!")
        that.cleanSelectRoom()
        that.allUserClean()
        that.resetRoomScore()
        that.showCountdownSecNode(false)
        that.userCount.string =  '0 / ' + that.lowestUserCount;
        that.killerSprite.destroy();
        that.killerSprite = null;
        that.totalScoreLabel.string = ": 0"
        that.round = that.round + 1;
        that.gotLastRoundInfo = false;
    }

   
    showSelectPop(){
        this.descSprite.node.active = this.descSprite.node.active ? false : true ;
        this.btnGroup.active = this.btnGroup.active ? false : true ;
    }


    onSelectedDiamonds(event, idx: number){
        that.descSprite.node.active = true;
        that.btnGroup.active = false;
        that.userSelectScoreIndex = idx;
        that.selectScoreValue = that.scoreList[idx]
        that.countLab.string = '' + that.selectScoreValue
    }


    closeGame(){
        // this.unschedule(this.getGameInfo)
        
        // console.warn("back scene ui!")
        localStorage.setItem("back", '1')
        //
        director.loadScene("UI")
        this.gameClose = true;
        this.gameEnd = true;
        this.gameLoop = false;
    }


    showDesc(){
        //显示游戏内说明
        console.log("showDesc")
    }


   cleanSelectRoom(){
        if(!this.shadhowSprite){
            return
        }
        let childrenNode = this.shadhowSprite.getParent().children;
        // console.log("children: ", childrenNode)
        childrenNode[0].active = false;
        childrenNode[1].active = true;
        // this.shadhowSprite.active = false;
   }


   touchRoom(ev, index){
        // console.log("选择房间：", this.shadhowSprite, index)
        
        // if(this.getResultIng){
        //     // console.warn("获取结果中，不能切换房间")
        //     return
        // }
        this.shadhowSprite = ev.target.children[0]
        if(!this.shadhowSprite){
            return
        }
        let allShadow: Node[] = ev.target.parent.children
        for(let i in allShadow){
            allShadow[i].children[0].active = false;
            allShadow[i].children[1].active = true;
        }
        this.shadhowSprite.active = true;
        ev.target.children[1].active = false;
        this.userSelectedRoom = parseInt(index);
        
        this.addScore(0)
    }


    async getBalance(){
        const formData = new FormData()
        formData.append("uid", ''+this.uid)
        let _headers = new Headers()
        this.Token = this.getTokenInfo()
        // console.warn("token: ", this.Token)
        _headers.append("Authorization", "Bearer "+ this.Token)
        this.disableAddBtn(true)
        fetch(this.URI + "/user/info",
            {method: "POST",
            mode: "cors",
            cache: "no-cache",
            body: formData,
            headers: _headers
        }).then((response: Response) => {
            let res = response.text()
            return res
        }).then(value => {
            this.disableAddBtn(false)
            let res = JSON.parse(value)
            if(res.err_code!=0){
                return this.showPopup(i18n.t("game_server_err"))
            }
            let data = res.data;
            if(data.account_status!=0){
                //账户异常
                return this.showPopup(i18n.t("account_status_err"))
            }
            this.userGameBalance = this.DecimalTwo(data.available_balance);
            this.balanceScoreLabel.string = ": " + this.DecimalTwo(this.userGameBalance);
            // console.info("userGameBalance", this.userGameBalance)
            //余额不足
            if(this.userGameBalance < 0.1){
                this.showPopup(i18n.t("need_balance") + this.userGameBalance)
            }
            //
            // if(!this.gameLoop){
            //     this.getGameInfo(-1)
            // }
        }).catch(e=>{
            this.disableAddBtn(false)
            //登陆失败UI弹窗
            this.showPopup(i18n.t("unkonw_balance"))
        });
    }


    DecimalTwo(num) {
        return Math.trunc(num * 100) / 100;
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


    sleepReq(t: number=2000){
        return new Promise((resolve)=> setTimeout(resolve, t))
    }
}


