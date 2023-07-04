
import { Telegraf } from "telegraf";
import { message } from 'telegraf/filters';
import 'dotenv/config'
import FireBase from "./firebase/FireBase";
import OpenAI from "./openai/OpenAI";
import MsgCashe from "./uitls/MsgCashe";
import Config from "./config/Config";

console.log('启动完成');

FireBase.init();

const BOT_TOKEN: any = process.env.TG_API;

const bot = new Telegraf(BOT_TOKEN);
/**是否正在请求消息 */
let isQuerying: boolean;

bot.start((ctx) => ctx.reply('欢迎温柔又善良的小哥哥/小姐姐,如有问题，请联系大帅哥 @asher_hp \n Welcome, kind-hearted and gentle sir/madam. If you have any questions, please contact the handsome @asher_hp'));

bot.help((ctx) => {
    ctx.reply(
        `目前支持下面的命令 
        /image -> 创建图片 
        /ask -> 提问AI 
        如有问题，请联系大帅哥 @asher_hp 

        Currently supported commands are:
        /image -> Create an image
        /ask -> Ask the AI
        If you have any questions, please contact the handsome @asher_hp.
        `
    );
});

bot.hears('我爱asher', (ctx) => ctx.reply('我也爱你'));

bot.command("myid", async (ctx) => {
    ctx.reply("您的用户ID为：" + ctx.from.id);
});

bot.command("balance", async (ctx) => {
    let num = await FireBase.queryBalance(ctx.from.id.toString());
    let freeNum = await FireBase.queryBalance(ctx.from.id.toString(), true);
    let msg = `您的使用次数剩余：${num}\n每日免费使用次数剩余：${Config.DAILY_MAX_TIMES - freeNum}`;

    ctx.reply(msg);
});

bot.command("ask", async (ctx) => {

    let flag = await FireBase.queryIsAllowed(ctx.from.id.toString());
    if (!flag) {
        ctx.reply("你的使用次数不足，请联系 @asher_hp 充值", {
            reply_to_message_id: ctx.message.message_id,
        });
        return;
    }

    if (isQuerying) {
        MsgCashe.addMsg(ctx);
    }
    else {
        getMsg(ctx);
    }
});

bot.command("image", async (ctx) => {
    let flag = await FireBase.queryIsAllowed(ctx.from.id.toString());
    if (!flag) {
        ctx.reply("你的使用次数不足，请联系 @asher_hp 充值", {
            reply_to_message_id: ctx.message.message_id,
        });
        return;
    }

    const text = ctx.message.text?.replace("/image", "")?.trim().toLowerCase();

    if (text) {

        const res = await OpenAI.getImage(text);

        if (res) {
            ctx.sendChatAction("upload_photo");
            ctx.telegram.sendPhoto(ctx.message.chat.id, res, {
                reply_to_message_id: ctx.message.message_id,
            });

            //回答完在扣费，目前不严谨，会有负数的情况出现
            FireBase.consumeOnce(ctx.from.id.toString());
        }
        else {
            ctx.reply("图片生成失败，不支持生成敏感图", {
                reply_to_message_id: ctx.message.message_id,
            });
        }
    } else {
        ctx.telegram.sendMessage(
            ctx.message.chat.id,
            "请在 /image 后面输入图片的描述",
            {
                reply_to_message_id: ctx.message.message_id,
            }
        );
    }
});


async function getMsg(ctx: any) {
    isQuerying = true;
    const text = ctx.message.text?.replace("/ask", "")?.trim().toLowerCase();

    if (text) {
        ctx.sendChatAction("typing");
        const msg = await OpenAI.getChatEx(text);

        ctx.reply(msg, {
            reply_to_message_id: ctx.message.message_id,
        });

        //回答完在扣费，目前不严谨，会有负数的情况出现
        FireBase.consumeOnce(ctx.from.id.toString());

    } else {
        ctx.telegram.sendMessage(
            ctx.message.chat.id,
            "请在 /ask 命令后面输入你想说的话",
            {
                reply_to_message_id: ctx.message.message_id,
            }
        );
    }

    isQuerying = false;
    let msg = MsgCashe.getMsg();
    if (msg) {
        getMsg(msg);
    }

}

// bot.command('createPoll', (ctx) => {
//     const options = ['Option 1', 'Option 2', 'Option 3']; // 投票选项数组

//     // 创建投票
//     ctx.replyWithPoll('What is your favorite option?', options, {
//         is_anonymous: false, // 是否匿名，默认为 true
//         allows_multiple_answers: true, // 是否允许多选，默认为 false
//     });
// });

// bot.command('showKeyboard', (ctx) => {
//     // 设置键盘布局
//     const keyboard = [
//         [{ text: 'Option 1' }, { text: 'Option 2' }],
//         [{ text: 'Option 3' }],
//     ];

//     // 发送带有底部键盘的消息
//     ctx.reply('Choose an option:', {
//         reply_markup: {
//             keyboard,
//             resize_keyboard: true, // 是否调整键盘大小，默认为 false
//             one_time_keyboard: true, // 是否一次性显示键盘，默认为 false
//         },
//     });
// });



bot.on(message("text"), ctx => {
    console.log(ctx.message.text);
    ctx.reply("不支持的格式，如有问题输入 /help 查看说明")

    // 发送一个带有 "like" 和 "dislike" 按钮的消息
    // ctx.reply('Do you like this message?', {
    //     reply_markup: {
    //         inline_keyboard: [
    //             [
    //                 { text: 'Like', callback_data: 'like' },
    //                 { text: 'Dislike', callback_data: 'dislike' },
    //             ],
    //         ],
    //     },
    // });

});

bot.launch();

