export default class MsgCashe {
    static _msgAry: Array<any> = [];

    static addMsg(msg: any) {
        MsgCashe._msgAry.push(msg);
    }

    static getMsg() {
        return this._msgAry.shift();

    }
}