import { _decorator, Button, Component, Node, Sprite, Label, Layout, director, instantiate, Prefab, Scheduler, AudioClip, AudioSource } from 'cc';
import * as i18n from 'db://i18n/LanguageData';
import { EthersUtils } from './EthersUtils';

const { ccclass, property } = _decorator;

@ccclass('InGame')
export class InGame extends Component {

    chipsNums: number[] = [100, 50, 10, 1, 0.1];
    chipsIndex: number = 4

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

    @property(Label)
    userCount: Label = null

    @property(Node)
    scoresNode: Node = null;

    @property(Sprite)
    mapLayer: Sprite = null;

    

    @property(Node)
    mask_ch: Node

    @property(Node)
    mask_en: Node

    @property(Sprite)
    game_res_layer: Sprite = null

    @property(Sprite)
    popLayer: Sprite = null

    @property(AudioSource)
    audio_dialog: AudioSource

    current_mask_layer: Node = null

    token: string = ""

    @property(Node)
    countdownSecNodeCH: Sprite = null

    @property(Node)
    countdownSecNodeEN: Sprite = null

    currentTimeSec = null

    lastCountdownSec = 0

    diamonds: number = 0.1
    currentDiamonds: number = 0

    userGameBalance: number = 0

    existUsers = []

    uid = 0
    userSelectedRoom = -1


    shadhowSprite: Node = null


    language = navigator.language.toLowerCase();

    URI = "https://gamedevapi.bitcoinxo.io"

    round = 0
    wait_next_round = false


    //
    roomUsersIds = []
    hallUsersIds = []
    roomUsersInstance = []
    hallUsersInstance = []


    enterGame = false;



    start(){
        console.warn("userCount:", this.userCount)
        this.enterGame = true;
        this.uid = parseInt(localStorage.getItem("user"))
        console.warn("用户ID", this.uid)
        //循环获取 游戏玩家数据
        this.schedule(this.getGameInfo, 2)
        // schedule(this.getGameInfo, 1);
        console.warn("schedule is run!")
        this.currentDiamonds = 0
        this.getBalance()
        this.languageInit()
        if(!this.uid){
            this.showPopup(i18n.t("notlogin"))
        }
    }


    restart(){
        console.warn("新游戏回合-开始!")
        for(let i in this.roomUsersInstance){
            let obj = this.roomUsersInstance[i];
            obj.destroy()
        }
        this.hallUsersInstance = []
        this.roomUsersInstance = []
        this.hallUsersIds = []
        this.roomUsersIds = []
        this.diamonds = 0.1
        this.currentDiamonds = 0
        //
        this.start()
    }


    showPopup(t: string){
        let lab = this.popLayer.node.getChildByName("box").getChildByName("text").getComponent(Label)
        this.popLayer.node.active = true
        lab.string = t;
        console.log("this.commonPopLayer:", this.popLayer)
        console.log("lab.string:", lab.string)
    }
    


    languageInit(){
        if(this.language.indexOf("zh")>=0){
            i18n.init("zh")
            this.countdownSecNodeCH.active = true;
            this.countdownSecNodeEN.active = false;
            this.currentTimeSec = this.countdownSecNodeCH.getComponent("show_time_sec")
            console.log("this.currentTimeSec: ", this.currentTimeSec)
            this.mask_ch.active = true;
            this.mask_en.active = false;
            this.current_mask_layer = this.mask_ch;
        }else{
            i18n.init("en")
            this.countdownSecNodeCH.active = false;
            this.countdownSecNodeEN.active = true;
            this.currentTimeSec = this.countdownSecNodeEN.getComponent("show_time_sec")
            console.log("this.currentTimeSec: ", this.currentTimeSec)
            this.mask_ch.active = false;
            this.mask_en.active = true;
            this.current_mask_layer = this.mask_en;
        }
        this.game_res_layer.getComponent("game_res").hide()
        // i18n.updateSceneRenderers();
        // console.log("this.current_mask_layer:", this.current_mask_layer)
    }


    updateCurrentUserDiamonds(v: number){
        this.currentDiamonds = this.truncateToTwoDecimalPlaces(v)
    }


    updateRoomScores(roomList){
        // 清空
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
                console.error("异常的房间：",roomInfo)
                continue
            }
            let labNode = this.scoresNode.children[roomInfo.room_id-1].getChildByName("num")
            let showLabel = labNode.getComponent(Label)
            showLabel.string = "" + roomInfo.amount;
            console.log("更新房间：", roomInfo.room_id-1, " 积分：", roomInfo.amount)
        }
    }

    // // 1不包含2的元素
    // difference(arr1, arr2) {
    //     return arr1.filter(item => !arr2.includes(item));
    // }

    // // 获取交集
    // getIntersection(arr1, arr2) {
    //     return arr1.filter(item => arr2.includes(item));
    // }

    // allRoomUids(room_list){
    //     let allUserUids = room_list.flatMap(room => room.user_list.map(user => user.uid));
    //     return allUserUids
    // }


    // getNewRoomUids(room_list){
    //     if(this.roomUsersIds.length==0) return []
    //     let uids = room_list.map(item => item.uid);
    //     let newRoomUids = this.getIntersection(this.hallUsersIds, uids)
    //     return newRoomUids
    // }

    // instanceOldRoomUsers(uid, address, roomId){
    //     if(uid!=this.uid){
    //         console.log(`其他玩家实列化- 房间：${roomId}  用户：${uid}`)
    //         const otherUserObj = instantiate(this.otherUserPrefab);
    //         this.mapLayer.node.addChild(otherUserObj)
    //         otherUserObj.getComponent("otherRole").setName(address, uid)
    //         otherUserObj.getComponent("otherRole").inRoom(roomId)
    //         this.roomUsersInstance.push(otherUserObj)
    //         return
    //     }else{
    //         let userScript = this.userSprite.getComponent("myRole")
    //         if(userScript.getRoomId()==roomId){
    //             console.warn("user self:", userScript.getRoomId())
    //             return;
    //         }
    //         this.userSelectedRoom = roomId
    //         console.log("玩家自己 已进房间：", roomId)
    //         userScript.inRoom(roomId)
    //     }
    // }

    // resetOldRoomUsers(uid, roomId){
    //     for(let i in this.roomUsersInstance){
    //         let objScript = this.roomUsersInstance[i].getComponent("otherRole") ? 
    //                             this.roomUsersInstance[i].getComponent("otherRole") : this.roomUsersInstance[i].getComponent("myRole")
    //         if(objScript.getUid()==uid){
    //             // 房间变化切换 **闪现
    //             if(objScript.getRoomId()!=roomId){
    //                 objScript.inRoom(roomId)
    //             }
    //         }
    //     }
    // }


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
    instanceAllRoomUsers(room_list){
        // 实列化房间内对象
        for(let i in room_list){
            let roomId = room_list[i].room_id - 1
            for(let j in room_list[i].user_list){
                let userInfo = room_list[i].user_list[j]
                // 
                if(userInfo.uid==this.uid){
                    console.warn(`玩家${userInfo.uid} 已在房间：${roomId}`)
                    this.updateCurrentUserDiamonds(userInfo.cost_amount)
                    this.userSprite.getComponent("myRole").inRoom(roomId)
                    this.roomUsersInstance.push(this.userSprite)
                }else{
                    console.warn("其他玩家已在房间：", userInfo.uid)
                    const otherUserObje = instantiate(this.otherUserPrefab);
                    this.mapLayer.node.addChild(otherUserObje)
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
            if(this.hallUsersIds.includes(userInfo.uid)){
                continue
            }
            // 自己进入大厅
            if(userInfo.uid ==this.uid){
                this.userSprite.getComponent("myRole").wallEnter()
                continue;
            }
            console.warn("其他玩家进大厅：", userInfo.uid)
            const otherUserObje = instantiate(this.otherUserPrefab);
            this.mapLayer.node.addChild(otherUserObje)
            otherUserObje.getComponent("otherRole").setName(userInfo.address, userInfo.uid)
            otherUserObje.getComponent("otherRole").enterHall()
            this.hallUsersInstance.push(otherUserObje)
            this.hallUsersIds.push(userInfo.uid)
        }
    }

    roomUids(room_list){
        const allUids = room_list.flatMap(room => 
            room.user_list.map(user => user.uid)
          );
        return allUids;
    }



    // 处理大厅退出游戏
    hallUserQuitGame(newHallUids, hallUids){
        //需要走路进入房间的玩家
        
        let quitUids = hallUids.filter(uid=> !newHallUids.includes(uid))
        // 需要删除的大厅玩家
        let deleteInstance = this.hallUsersInstance.filter(user=>{
            quitUids.includes(user.getComponent("otherRole").getUid())
        })
        // 保留的大厅玩家
        this.hallUsersInstance = this.hallUsersInstance.filter(user=>{
            !quitUids.includes(user.getComponent("otherRole").getUid())
        })
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
                if(userInfo.uid==this.uid){
                    this.updateCurrentUserDiamonds(userInfo.cost_amount)
                }
                //变更房间
                let obj = this.getRoomChangeInstanceUser(roomId, userInfo.uid)
                if(!obj){
                    continue
                }
                let insComponent = obj.getComponent("myRole") ? obj.getComponent("myRole") : obj.getComponent("otherRole")
                console.error(`玩家${userInfo.uid}变更房间：${roomId}`)
                insComponent.inRoom(roomId)
            }
        }
    }


    // 处理玩家进大厅
    newUserEnterHall(newHallUids, hallUids, hall_list){
        let enterUids =  hallUids.filter(uid=>!newHallUids.includes(uid))
        for(let i in hall_list){
            if(enterUids.includes(hall_list[i].uid)){
                let userInfo = hall_list[i]
                console.warn("其他玩家进房间：", userInfo.uid)
                const otherUserObje = instantiate(this.otherUserPrefab);
                this.mapLayer.node.addChild(otherUserObje)
                otherUserObje.getComponent("otherRole").setName(userInfo.address, userInfo.uid)
                this.hallUsersInstance.push(otherUserObje)
                this.hallUsersIds.push(userInfo.uid)
            }
        }
    }
    

    // 处理大厅进房间
    hallUserEnterRoom(room_list, toRoomUids){
        for(let i in room_list){
            for(let j in room_list[i].user_list){
                let userInfo = room_list[i].user_list[j];
                if(toRoomUids.includes(userInfo.uid)){
                    let roomId = room_list[i].room_id;
                    if(userInfo.uid  == this.uid){
                        console.warn("其他玩家进房间：", userInfo.uid)
                        this.userSprite.getComponent("myRole").setName(userInfo.address, userInfo.uid)
                        this.userSprite.getComponent("myRole").setRoomId(roomId)
                        this.roomUsersInstance.push(this.userSprite)
                        this.roomUsersIds.push(userInfo.uid)
                    }else{
                        console.warn("其他玩家进房间：", userInfo.uid)
                        const otherUserObje = instantiate(this.otherUserPrefab);
                        this.mapLayer.node.addChild(otherUserObje)
                        otherUserObje.getComponent("otherRole").setName(userInfo.address, userInfo.uid)
                        otherUserObje.getComponent("otherRole").setRoomId(roomId)
                        this.roomUsersInstance.push(otherUserObje)
                        this.roomUsersIds.push(userInfo.uid)
                    }
                }
            }
        }
    }

    

    

    // 全部房间的用户id
    // resetallRoomUsers(room_list){
    //     // 之前在hall的需要行走
    //     let newRoomUids = this.getNewRoomUids(room_list)
    //     let oldRoomUids = this.roomUsersIds;
    //     // 实列化房间内对象
    //     for(let i in room_list){
    //         let roomId = room_list[i].room_id - 1
    //         for(let j in room_list[i].user_list){
    //             let userInfo = room_list[i].user_list[j]
    //             // 更新玩家当前投入积分
    //             if(userInfo.uid==this.uid){
    //                 this.updateCurrentUserDiamonds(userInfo.amount)
    //             }
    //             if(oldRoomUids.length>0){
    //                 console.log("新进入玩家：", userInfo.uid)
    //                 const otherUserObje = instantiate(this.otherUserPrefab);
    //                 this.mapLayer.node.addChild(otherUserObje)
    //                 otherUserObje.getComponent("otherRole").setName(userInfo.address, userInfo.uid)
    //                 otherUserObje.getComponent("otherRole").inRoom(roomId)
    //                 this.roomUsersInstance.push(otherUserObje)
    //             }
    //             // 
    //             if(newRoomUids.includes(userInfo.uid)){
    //                 console.log("新进入玩家：", userInfo.uid)
    //                 const otherUserObje = instantiate(this.otherUserPrefab);
    //                 this.mapLayer.node.addChild(otherUserObje)
    //                 otherUserObje.getComponent("otherRole").setName(userInfo.address, userInfo.uid)
    //                 otherUserObje.getComponent("otherRole").setRoomId(roomId)
    //                 this.roomUsersInstance.push(otherUserObje)
    //             }else{
    //                 // 用户刚进入时，旧房间玩家创建
    //                 if(this.roomUsersInstance.length==0){
    //                     //not in hall.
    //                     this.instanceOldRoomUsers(userInfo.uid, userInfo.address, roomId)
    //                 }else{
    //                     // 已进入，刷新各房间玩家
    //                     this.resetOldRoomUsers(userInfo.uid, roomId)
    //                 }
    //             }
    //         }
    //     }
    // }

    // newHallUids(hall_list){
    //     return hall_list.map(item => item.uid);
    // }

    

    // getNewHallUids(hall_list){
    //     let uids = this.newHallUids(hall_list)
    //     let enterUsersIds = []
    //     if(this.hallUsersIds.length==0){
    //         enterUsersIds = uids
    //     }else{
    //         enterUsersIds = this.difference(this.hallUsersIds, uids)
    //     }
    //     return enterUsersIds
    // }

    // // 需晚于房间玩家设置调用
    // resetHallUsers(hall_list){
    //     //实列化房间对象
    //     if(hall_list.length==0){
    //         for(let i in hall_list){
    //             let userInfo = hall_list[i]
    //             if(!userInfo.address) continue
    //             //
    //             console.log("其他玩家进入", userInfo.uid)
    //             const otherUserObje = instantiate(this.otherUserPrefab);
    //             this.mapLayer.node.addChild(otherUserObje)
    //             otherUserObje.getComponent("otherRole").setName(userInfo.address, userInfo.uid)
    //             otherUserObje.getComponent("otherRole").inHall()
    //             this.hallUsersInstance.push(otherUserObje)
    //             this.hallUsersIds.push(userInfo.uid)
    //         }
    //         return
    //     }
    //     let enterUsersIds = this.getNewHallUids(hall_list)
    //     for(let i in hall_list){
    //         let userInfo = hall_list[i]
    //         if(!userInfo.address) continue
    //         //
    //         if(enterUsersIds.includes(userInfo.uid)){
    //             console.log("进入玩家：", userInfo.uid)
    //             const otherUserObje = instantiate(this.otherUserPrefab);
    //             this.mapLayer.node.addChild(otherUserObje)
    //             otherUserObje.getComponent("otherRole").setName(userInfo.address, userInfo.uid)
    //             this.hallUsersInstance.push(otherUserObje)
    //             this.hallUsersIds.push(userInfo.uid)
    //             // otherUserObje.setRotationFromEuler()
    //         }
    //     }
    // }




   addScore(add){
        if(this.userSelectedRoom<0){
            console.error("this.select room:", this.userSelectedRoom)
            return this.showPopup(i18n.t("not_select"))
        }
        if(!this.currentDiamonds && !add){
            return
        }
        
        if(add){
            this.currentDiamonds += this.diamonds;
            this.currentDiamonds = this.truncateToTwoDecimalPlaces(this.currentDiamonds)
            let currentSelectValue = this.chipsNums[this.chipsIndex];
            console.warn("select value:", this.chipsNums[this.chipsIndex])
            console.warn("userGameBalance:", this.userGameBalance)
            this.userGameBalance = this.truncateToTwoDecimalPlaces(this.userGameBalance)
            if(this.userGameBalance < currentSelectValue){
                return this.showPopup(i18n.t("more_balance") +':'+ currentSelectValue)
            }
        }
       const formData = new FormData()
       let toRoom = Number(this.userSelectedRoom) + 1;
        // formData.append("round", '' +0)
        formData.append("uid", '' + this.uid)
        formData.append("room", '' + toRoom)
        formData.append("round", '' + this.round)
        formData.append("amount", '' + this.currentDiamonds)
       fetch(this.URI + "/round/participate", {
            method: "POST", 
            mode: "cors", 
            cache: "no-cache", 
            body:  formData
       }).then((response: Response) => {
           return response.text()
       }).then((value) => {
           let data = JSON.parse(value)
           console.info(data);
           if(data.err_code!=0){
               return this.showPopup(data.message)
           }
       }).catch(e=>{
           console.error(e)
       });
   }


    showResLayer(isWin, roomCorn, roomId){
        let callScript = this.game_res_layer.getComponent("game_res")
        callScript.showStatus(isWin, roomCorn, roomId)
        console.error(">>>>>>>>> set round end! <<<<<<<<<<")
        // this.scheduleOnce(this.restart, 10)
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


   async getGameInfo(dt){
       let fromData = new FormData()
       fromData.append("uid", '' +this.uid)
       await fetch(this.URI + "/round/info", 
           {method: "POST", 
           mode: "cors", 
           cache: "no-cache", 
           body: fromData
       }).then((response: Response) => {
           return response.text()
       }).then((value) => {
            let res = JSON.parse(value)
            if(res.err_code!=0){
                // 异常
                this.showPopup(i18n.t("game_server_err"))
                return
            }
            //
            let data = res.data;
            this.currentTimeSec && this.currentTimeSec.setTimeSec(data.count_down_time);
            if(parseInt(data.is_finished)==1 && !this.wait_next_round){
                // 暂停查询
                this.unschedule(this.getGameInfo)
                
                // 杀手进入房间
                let failRoom = data.fail_room
                this.killerSprite = instantiate(this.killerPrefab)
                // console.warn("killerSprite", this.killerSprite)
                this.mapLayer.node.addChild(this.killerSprite)
                this.killerSprite.getComponent("walk").setRoomId(failRoom)
                let isWin = data.fail_room != this.userSelectedRoom;
                let failRoomScore = this.getFailRoomScore(data.room_list, failRoom);
                this.showResLayer(isWin, failRoomScore, failRoom)
                this.scheduleOnce(this.restart, 14);
                this.wait_next_round = true;
                return
            }
            if(this.wait_next_round){
                this.getResult()
            }
            this.lastCountdownSec = data.count_down_time
            this.round = data.round;
            console.warn("当前 round:", this.round)
            this.userCount.string = data.total_user_count;
            //
            this.updateRoomScores(data.room_list)

            //刚进游戏时实列化全部
            if(this.enterGame){
                this.instanceAllRoomUsers(data.room_list)
                this.instanceHallUsers(data.hall_list)
                this.enterGame = false;
                return
            }
            // 最新房间玩家id列表
            let roomUids = this.roomUids(data.room_list)
            // 旧大厅玩家*进入房间的id列表--操作行走
            let toRoomUids = this.hallUsersIds.filter(uid=> roomUids.includes(uid))
            // console.error("toRoomUids:", toRoomUids)
            this.hallUserEnterRoom(data.room_list, toRoomUids)
            // 旧大厅玩家*未进房间id列表 -- 可从中找到退出的玩家
            let notToRoomUids = this.hallUsersIds.filter(uid=> !roomUids.includes(uid))
            // 最新大厅玩家列表
            const newHallUids = data.hall_list.map(e=>e.uid);
            // 删除退出大厅的玩家
            this.hallUserQuitGame(newHallUids, notToRoomUids)
            // 大厅新进入玩家
            this.newUserEnterHall(data.hall_list, newHallUids, notToRoomUids)
            // 覆盖旧大厅玩家
            this.hallUsersIds = newHallUids;
            // 改房间的玩家
            this.changeRoomUsers(data.room_list)
            // 用户不在大厅和房间 异常提示
            if(!this.hallUsersIds.includes(this.uid) && !this.roomUsersIds.includes(this.uid)){
                this.userSprite.getComponent("myRole").wallEnter()
                this.showPopup(i18n.t("account_status_err"))
            }
       }).catch(e=>{
           console.error(e)
       });
   }


    async getResult(){
        let fromData = new FormData()
        fromData.append("round", '' + this.round)
        await fetch(this.URI + "/round/result", 
            {method: "POST", 
            mode: "cors", 
            cache: "no-cache", 
            body: fromData
        }).then((response: Response) => {
            return response.text()
        }).then((value) => {
            let res = JSON.parse(value)
            if(res.err_code!=0){
                // 异常
                this.showPopup(i18n.t("game_server_err"))
                return
            }
            //
            let data = res.data;
            console.warn("game res:", data)
        }).catch(err=>{
            console.error("game res:", err)
        });
    }
   
   showSelectPop(){
       this.descSprite.node.active = this.descSprite.node.active ? false : true ;
       this.btnGroup.active = this.btnGroup.active ? false : true ;
   }

   onSelectedDiamonds(event, idx: number){
       this.descSprite.node.active = true;
       this.btnGroup.active = false;
       this.chipsIndex = idx;
    //    console.log("btn:", idx, " EV:", event)
        this.diamonds = this.chipsNums[idx]
       this.countLab.string = '' + this.diamonds
   }

   closeGame(){
       console.warn("back scene ui!")
       director.loadScene("UI")
   }

   showDesc(){
       console.log("showDesc")
   }


   touchRoom(ev, index){
       this.shadhowSprite = ev.target.children[0]
       let allShadow: Node[] = ev.target.parent.children
       for(let i in allShadow){
           allShadow[i].children[0].active = false;
           allShadow[i].children[1].active = true;
       }
       this.shadhowSprite.active = true;
       ev.target.children[1].active = false;
       this.userSelectedRoom = index;
       this.addScore(0)
    }




    async getBalance(){
        const formData = new FormData()
        let addr = localStorage.getItem("walletAddress")
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
            let res = JSON.parse(value)
            if(res.err_code!=0){
                return this.showPopup(i18n.t("game_server_err"))
            }
            let data = res.data;
            if(data.account_status==1){
                //账户异常
                return this.showPopup(i18n.t("account_status_err"))
            }
            this.userGameBalance = this.truncateToTwoDecimalPlaces(data.available_balance);
            //余额不足
            if(this.userGameBalance < 0.1){
                this.showPopup(i18n.t("need_balance")+this.userGameBalance)
            }
        }).catch(e=>{
            //登陆失败UI弹窗
            this.showPopup(i18n.t("unkonw_balance"))
        });
    }


    truncateToTwoDecimalPlaces(num) {
        return Math.trunc(num * 100) / 100;
    }
}


