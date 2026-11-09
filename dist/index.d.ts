/** Official Feishu/Lark WebSocket channel bundle for DeepSeek Harness. */
import type { Context } from '@deepseek-ai/cordis';
import { LarkHarnessBridge } from './bridge.js';
import { Config, type Config as LarkConfig } from './config.js';
export declare const name = "deepseek-harness-lark";
export declare const inject: string[];
export { Config };
export type { LarkConfig as ConfigType };
export { LarkHarnessBridge };
export { detectImageMediaType, inboundContent } from './inbound.js';
export { sessionIdFor, truncateText, withTimeout } from './util.js';
/** Mount the Feishu/Lark WebSocket channel and tie teardown to Cordis. */
export declare function apply(ctx: Context, config: LarkConfig): Promise<void>;
declare const _default: {
    name: string;
    inject: string[];
    Config: import("@deepseek-ai/schemastery").default<Config>;
    apply: typeof apply;
};
export default _default;
