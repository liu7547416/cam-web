
const win = window as any;

export const languages = {
    // Data
    "notlogin": "You are not logged in and cannot participate in the game.",
    "plslogin": "Please login, first!",
    "wellcom": "wellcom!",
    "share": "share link in your clipbord!",
    "game": "The game is progress!",
    "title": "TOM&JERRY",
    "connect": "Connect wallet",
    "wallet_install": "Need install wallet",
    "open_in_wallet": "Please open in wallet",
    "wallet": "wallet",
    "no_wallet_account": "Not have account!",
    "wallet_balance": "Wallet Balance",
    "wallet_balance_title": "Wallet Balance: ",
    "game_balance": "Game Balance",
    "game_balance_title": "Game Balance: ",
    "no_game_balance": "Please recharge",
    "freeze_balance": "Freeze Balance",
    "freeze_balance_title": "Freeze Balance: ",
    "enter": "Enter Game",
    "rule": "Game Rules",
    "home": "Home",
    "recharge": "Recharge",
    "rechargeAmount": "Recharge Amount",
    "rechargeAmountTitle": "Recharge Amount: ",
    "rechargeRecord": "Recharge Record",
    "withdraw": "Withdraw",
    "account": "Account",
    "account_title": "Account: ",
    "corn": "CORN",
    "invite": "Invite friends",
    "fundFlow": "Fund Flow",
    "date": "Date: ",
    "max": "MAX",
    "empty": "No record",
    "withdrawAmount": "Withdraw Amount",
    "withdrawAmountTitle": "Withdraw Amount: ",
    "withdrawRecord": "Withdraw Record",
    "withdrawValueErr": "Please input withdraw amount.",
    "withdrawReqErr": "Withdraw requst error!",
    "withdrawSuccess": "Withdraw success.",
    "fund_flow": "Fund Flow",
    "processing": "Processing date: ",
    "actual": "Actual amount: ",
    "amount": "Amount: ",
    "hash": "Hash: ",
    "input": "Input number...",
    "username": "yourself",
    "investing": "investing CORN",
    "res_text": "Survivors divide up:",
    "not_jion": "You are not participating",
    "killed": "You have been killed",
    "lost": "you lost CORN:",
    "got": "Participate in the carve-up:",
    "die_in": "die in: ",
    "0": "「Study」",
    "1": "「Music Room」",
    "2": "「Laundry room」",
    "3": "「Tea House」",
    "4": "「Bedroom」",
    "5": "「Restaurant」",
    "6": "「Tool room」",
    "7": "「Workshop」",
    "8": "「Kitchen」",
    "9": "「Warehouse」",
    "waiting_sum": "Wating for result",
    "stop_add_score": "Stop add score: CORN",
    "my_corn": "CORN: ",
    "hold_corn": "Current ",
    "contract_err": "Contract error!",
    "account_status_err": "Account abnormality",
    "need_balance": "Balance\nCORN: ",
    "more_balance": "Need balance\nCORN: ", 
    "current_corn": "My CORN: ",
    "not_select": "Please select a room.",
    "unkonw_balance": "No balance found!",
    "game_server_err": "Game service exception",
    "get_token_err": "Get Token error!",
    "rechargeValue_null": "Please input amount!",
    "e-99": "Contract init failed!",
    "e-100": "transaction error!",
    "e4001": "User denied signature.",
    "einvalid_argument": "ENS name error!\ninvalid argument.",
    "trans_cancel": "Transfer cancel or decline!",
    "trans_fail": "Transfer failed! please check record.",
    "trans_success": "Transfer success! please wait server response.",
    "trans_svr_err": "Server recorded error!",
    "trans_done": "Transfer in CORN: ",
    "server_data_err": "Server data error, please don't try again.",
    "tx_type_1": "Deposit",
    "tx_type_2": "Withdraw",
    "tx_type_3": "Play game",
    "tx_type_4": "Receive rewards",
    "tx_type_5": "Invite bonue",
    "withdraw_0": "To be audited",
    "withdraw_1": "succeeds",
    "withdraw_2": "fails",
    "withdraw_3": "done",
    "invite_title": "Your inviter",
    "invite_link_title": "Invitation link",
    "copy": "Copy",
    "to_bind": "Bind your inviter",
    "invite_code": "Invitation code",
    "invite_code_err": "Invitation code error!",
    "total_invitation": "Total invitation",
    "total_rebate": "Total rebate",
    "bind": "bind",
    "bind_failed": "Bind failed!",
    "bind_success": "Bind success"
};

if (!win.languages) {
    win.languages = {};
}

win.languages.en = languages;
