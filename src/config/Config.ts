export default class Config {
    /**每日最大免费使用次数 */
    static readonly DAILY_MAX_TIMES = 10;

    /**openai 模型 */
    static readonly OPENAI_MODEL = "gpt-3.5-turbo";
    /**生成回答的最大 Token 数 */
    static readonly MAX_TOKEN = 2048;
    /** 上下文的最大 Token 数*/
    static readonly MAX_CONTEXT_SIZE = 4000;
    /**严谨与创新 0-1 */
    static readonly TOP_P = 0.5;
}