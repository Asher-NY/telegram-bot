
import { Configuration, OpenAIApi } from "openai"
import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import Config from "../config/Config";
import MsgMgr, { Message } from "./MsgMgr";
import * as wordCount from '../uitls/OpenAIUtil';


export default class OpenAI {
    static configuration = new Configuration({
        apiKey: process.env.OPEN_AI_API,
    });

    static openai = new OpenAIApi(this.configuration);

    static getImage = async (text: string) => {

        return this.openai.createImage({
            prompt: text,
            n: 1,
            size: "512x512",
        }).then((response: any) => {
            return response.data.data[0].url;
        }).catch((err) => {
            console.log("请求openai图片失败：", err.response.statusText);
            return "";
        });
    };

    static getChat = async (text: string) => {
        return this.openai.createCompletion({
            model: "text-davinci-003",//"gpt-3.5-turbo-0613", text-davinci-003
            prompt: text,
            top_p: 0.7,
            max_tokens: 4000,
        }).then((response: any) => {
            console.log("openai返回:", response.data.choices);

            return response.data.choices[0].text;
        }).catch((err) => {
            console.log("请求openai失败：", err.message);
            return err.message || "请求失败";
        });
    };

    //更省token的请求模型
    static async getChatEx(text: string, userId: any): Promise<string> {
        try {
            const config: AxiosRequestConfig = {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.OPEN_AI_API}`
                },
                timeout: 60000,
            };

            let totalLen = 0;
            let msgs = MsgMgr.getMsg(userId);

            let prompts: Message[] = []
            for (let i = msgs.length - 1; i >= 0; i--) {
                const msg = msgs[i]
                const msgTokenSize: number = wordCount.estimateTokens(msg.content) + 200 // 200 作为预估的误差补偿
                if (msgTokenSize + totalLen > Config.MAX_CONTEXT_SIZE) {
                    break;
                }
                prompts = [msg, ...prompts];
                totalLen += msgTokenSize;
            }
            // console.log(totalLen, prompts);


            const data = {
                model: Config.OPENAI_MODEL,
                messages: [

                    { "role": "system", "content": "You are a helpful assistant. You can help me by answering my questions. You can also ask me questions." },
                    ...prompts,
                    { "role": 'user', "content": text }
                ],
                top_p: Config.TOP_P,
                max_tokens: Config.MAX_TOKEN,
                // stream: true,
            };


            const response: AxiosResponse = await axios.post(
                'https://api.openai.com/v1/chat/completions',
                data,
                config
            );

            MsgMgr.addMsg(userId, { role: 'user', content: text }, response.data.choices[0].message);

            // 解析并打印 OpenAI 返回的回复
            console.log("openai返回:", response.data.choices);
            return response.data.choices[0].message.content;
        } catch (error: any) {
            if (error.response) {
                console.error('发生错误:', error.response.status);
                if (error.response.status === 429) {
                    return "官人你太快了，请慢点";
                }
                return error.response.statusText || error.message;
            }
            else {
                return error.message;
            }

        }
    }

    /*static async handleSSE(response: Response, onMessage: (message: string) => void) {
        if (!response.ok) {
            const error = await response.json().catch(() => null)
            throw new Error(error ? JSON.stringify(error) : `${response.status} ${response.statusText}`)
        }
        if (response.status !== 200) {
            throw new Error(`Error from OpenAI: ${response.status} ${response.statusText}`)
        }
        if (!response.body) {
            throw new Error('No response body')
        }
        const parser = createParser((event) => {
            if (event.type === 'event') {
                onMessage(event.data)
            }
        })
        for await (const chunk of this.iterableStreamAsync(response.body)) {
            const str = new TextDecoder().decode(chunk)
            parser.feed(str)
        }
    }

    static async * iterableStreamAsync(stream: ReadableStream): AsyncIterableIterator<Uint8Array> {
        const reader = stream.getReader();
        try {
            while (true) {
                const { value, done } = await reader.read()
                if (done) {
                    return
                } else {
                    yield value
                }
            }
        } finally {
            reader.releaseLock()
        }
    }*/
}