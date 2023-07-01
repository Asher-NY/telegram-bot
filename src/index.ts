
import { Telegraf } from "telegraf";
import { message } from 'telegraf/filters';
import 'dotenv/config'
import FireBase from "./firebase/FireBase";

console.log('启动完成');

FireBase.init();

const BOT_TOKEN: any = process.env.TG_API;

const bot = new Telegraf(BOT_TOKEN);

bot.start((ctx) => ctx.reply('Welcome！'));

bot.help((ctx) => {
    ctx.reply(
        "This bot can perform the following command \n /image -> to create image from text \n /ask -> ank anything from me "
    );
});

bot.hears('hi', (ctx) => ctx.reply('Hey there'));



// bot.command('oldschool', (ctx) => ctx.reply('Hello'));
// bot.command('hipster', Telegraf.reply('λ'));


bot.command('createPoll', (ctx) => {
    const options = ['Option 1', 'Option 2', 'Option 3']; // 投票选项数组

    // 创建投票
    ctx.replyWithPoll('What is your favorite option?', options, {
        is_anonymous: false, // 是否匿名，默认为 true
        allows_multiple_answers: true, // 是否允许多选，默认为 false
    });
});

bot.command('showKeyboard', (ctx) => {
    // 设置键盘布局
    const keyboard = [
        [{ text: 'Option 1' }, { text: 'Option 2' }],
        [{ text: 'Option 3' }],
    ];

    // 发送带有底部键盘的消息
    ctx.reply('Choose an option:', {
        reply_markup: {
            keyboard,
            resize_keyboard: true, // 是否调整键盘大小，默认为 false
            one_time_keyboard: true, // 是否一次性显示键盘，默认为 false
        },
    });
});



bot.on(message("text"), ctx => {
    console.log(ctx.message.text);

    // 发送一个带有 "like" 和 "dislike" 按钮的消息
    ctx.reply('Do you like this message?', {
        reply_markup: {
            inline_keyboard: [
                [
                    { text: 'Like', callback_data: 'like' },
                    { text: 'Dislike', callback_data: 'dislike' },
                ],
            ],
        },
    });

});

bot.launch();