
import { Configuration, OpenAIApi } from "openai"
import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';


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
    static async getChatEx(text: string): Promise<string> {
        try {
            const config: AxiosRequestConfig = {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.OPEN_AI_API}`
                },
                timeout: 15000,
            };

            const data = {
                model: 'gpt-3.5-turbo-0613',
                messages: [
                    { "role": "system", "content": "You are a helpful assistant." },
                    { role: 'user', content: text }
                ],
                top_p: 0.7,
                max_tokens: 4000,
            };

            const response: AxiosResponse = await axios.post(
                'https://api.openai.com/v1/chat/completions',
                data,
                config
            );

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
}