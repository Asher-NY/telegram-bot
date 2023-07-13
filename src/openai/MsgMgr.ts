export default class MsgMgr {
    /**所有人的最近 3 条消息记录 */
    static allObj: any = {};

    static addMsg(userId: string, userMsg: Message, aiMsg: Message) {
        let ary: Array<Message> = this.allObj[userId];
        if (!ary) {
            ary = [];
            this.allObj[userId] = ary;
        }

        ary.push(userMsg);
        ary.push(aiMsg);

        if (ary.length > 6) {//AI 和 玩家各 3 条消息
            ary.splice(0, 2);
        }
    }

    static getMsg(userId: any) {
        let ary: Array<Message> = this.allObj[userId];
        if (!ary) {
            ary = [];
            this.allObj[userId] = ary;
        }

        return ary;
    }
}

export type Message = {
    role: "system" | "user" | "assistant",
    content: string,
}