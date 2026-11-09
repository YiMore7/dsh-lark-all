import type { Context } from '@deepseek-ai/cordis';
import type { LarkChannelFactory } from './channel-port.js';
import type { Config } from './config.js';
/** Live Feishu/Lark WebSocket bridge backed by the official Node SDK. */
export declare class LarkHarnessBridge {
    private readonly ctx;
    private readonly config;
    private readonly channelFactory;
    private readonly log;
    private readonly inFlight;
    private readonly unsubscribers;
    private channel;
    private conversations;
    /** Dedicated API client for message reactions, media downloads, docx and Drive. */
    private reactionsClient;
    private stopping;
    constructor(ctx: Context, config: Config, channelFactory?: LarkChannelFactory);
    /** Resolve the secret, connect the official WebSocket client, and accept events. */
    start(): Promise<void>;
    /** Stop event intake, settle owned turns, and close the WebSocket. */
    stop(): Promise<void>;
    private trackMessage;
    private handleMessage;
    private handleMessageCore;
    /**
     * Append one JSON line per inbound message with its thread context and the
     * routing decision to `<cwd>/.lark-routing.log`. Best-effort: used to
     * diagnose follow-up delivery in the task topic, never fails the message.
     */
    private traceRouting;
    /**
     * Handle the exact 「重启进程」 main-chat command: notify the user, record a
     * restart marker (consumed by dsh-harness-ops on the next boot), then
     * relaunch through the process-external safe-restart watchdog
     * (dsh-safe-restart.ps1: config backup -> stop -> launch -> health check ->
     * rollback last-known-good on boot failure -> relaunch -> Feishu notice).
     * Falls back to a bare detached helper when the script is not installed.
     * Finally exit this process.
     */
    private handleRestart;
    /**
     * React to the inbound message with the configured progress emoji so the
     * sender immediately sees that the bot started working. Best-effort: any
     * failure is logged and never fails the message itself.
     * @returns the created reaction id (used later to clear the progress emoji).
     */
    private markInProgress;
    /**
     * Clear the progress reaction once the turn settles and optionally react
     * with a done emoji. Best-effort: failures are logged and swallowed.
     */
    private markDone;
    private allowed;
    private sendReply;
    /**
     * Send one outbound media item. Local paths and URLs are handed to the
     * SDK uploader (which enforces its own SSRF guard and POSIX blocklist);
     * audio/video fall back to a generic file message when the uploader
     * rejects the container format.
     */
    private sendMediaItem;
    /** Execute one `/bot-send-*` media command. */
    private handleSendMediaCommand;
    /**
     * Send one outbound file; files over the IM cap go to Drive when enabled.
     * @returns `{ kind: 'im' }` when sent as an IM message, `{ kind: 'drive', url, fileName }` when uploaded to Drive.
     */
    private sendFileOrDrive;
    /** Create a Feishu docx from a local markdown file and return its meta. */
    private createDocxFromFile;
    private resolveSecret;
    private requireChannel;
    private requireConversations;
    private requireApiClient;
    /**
     * Media handler factory for inbound content processing. Bound per message
     * so parallel in-flight messages never share (or clobber) a message id.
     * Safe to construct before `start()` resolves the secret: the client is
     * created there and accessed lazily.
     */
    private mediaHandlers;
    /**
     * Download a file/audio/video resource of one message via the
     * message-resource endpoint (the only one that serves audio/video).
     */
    private downloadMessageResource;
}
