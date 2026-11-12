import type { Context } from '@deepseek-ai/cordis';
import type { NormalizedMessage } from '@larksuiteoapi/node-sdk';
import type { LarkChannelPort } from './channel-port.js';
import type { Config } from './config.js';
import { type InboundMediaHandlers } from './inbound.js';
/** True when the failure is the session write lease being held elsewhere. */
export declare function isSessionOwnedError(error: unknown): boolean;
/** Completed response from one Lark-triggered Harness turn. */
export interface ConversationReply {
    text: string;
    images: Array<{
        data: Uint8Array;
        mediaType: string;
        name?: string;
    }>;
}
/** Owns deterministic Lark conversation agents and persisted resume lifecycle. */
export declare class ConversationManager {
    private readonly ctx;
    private readonly config;
    private readonly mediaFactory?;
    private readonly log;
    private readonly handles;
    private readonly creations;
    private readonly queues;
    /** task session id → human-readable mode label (set when the task starts). */
    private readonly taskModes;
    /**
     * Message id → task session id for every message that belongs to a task:
     * the task text, each follow-up, each streaming card and each report page.
     * Feishu p2p reply chains and some topic setups deliver follow-ups without
     * `root_id`/`thread_id`, so `parent_id` against this registry is the only
     * reliable way to route them back to their task.
     */
    private readonly taskMessageIds;
    /** task session id → number of turns processed (for the per-turn card label). */
    private readonly taskTurns;
    /** task session id → report prefix entry {date, seq} (assigned at task creation). */
    private readonly taskSeq;
    private persistedIds;
    constructor(ctx: Context, config: Config, mediaFactory?: ((message: NormalizedMessage) => InboundMediaHandlers) | undefined);
    /** Snapshot persisted identities once before accepting traffic. */
    initialize(): Promise<void>;
    /**
     * The task session id a message belongs to. Thread messages resolve the
     * thread-root anchor; `create` anchors at the message itself (a fresh task
     * in the main chat). When a follow-up carries no thread context (Feishu p2p
     * reply chains, some topic setups), it is still routed when it replies to
     * (`parent_id`) a known task-related message (task text, card, report or an
     * earlier follow-up). Returns undefined when the task system is disabled or
     * the message cannot be associated with any task.
     */
    taskIdFor(message: NormalizedMessage, create?: boolean): string | undefined;
    /** The task session id an inbound or outbound message id belongs to, if any. */
    taskMessageIdOf(messageId: string): string | undefined;
    /** Register outbound message ids (report pages / images) under a task session. */
    registerOutboundMessage(result: {
        messageId?: string;
        chunkIds?: string[];
    } | undefined, taskId: string): void;
    /** Remember one task-related message id, evicting the oldest when capped. */
    private rememberTaskMessage;
    /** Process one inbound message after earlier work in the same Lark conversation. */
    process(message: NormalizedMessage, channel: LarkChannelPort): Promise<ConversationReply>;
    /**
     * Process one task message (a fresh task in the main chat or a follow-up
     * inside the task's thread). Streams the thinking process to a Feishu
     * streaming card inside the thread and returns the final report, which the
     * caller sends as a separate thread message.
     * @param preset - agent preset id for a NEW task ('' = web default);
     *   undefined on thread follow-ups (the stored preset is reused).
     * @param taskContent - stripped task text (fresh tasks only).
     * @param modeLabel - display label for the streaming card.
     */
    processTask(message: NormalizedMessage, channel: LarkChannelPort, taskId: string, preset: string | undefined, taskContent: string | undefined, modeLabel: string): Promise<ConversationReply>;
    /** Cancel active work for one Lark conversation or task thread. */
    cancel(message: NormalizedMessage): boolean;
    /**
     * Preempt a busy agent before queueing a new inbound message. A running
     * agent only latches a follow-up as a wake request (agent-loop `send`), so
     * without this the message would sit in the inbox until the current turn
     * ends — which never happens when that turn waits on a Web-only
     * interaction such as `ask_user_question` (no answerer exists on the Lark
     * side, so the agent stays busy forever and later messages are stranded).
     * `cancel` with `keepInbox` aborts the in-flight turn without discarding
     * already queued messages; the subsequent `followup` re-arms the driver,
     * so the new message is consumed by a fresh turn as soon as the aborted
     * turn settles.
     */
    private preemptRunning;
    /**
     * Preempt the busy agent of one conversation/task before a new message is
     * queued for it. Without this, a stuck in-flight turn keeps its `whenIdle`
     * (and therefore the serial queue head) occupied, and every later message
     * waits behind it until the turn settles — potentially forever. Aborting
     * the turn releases the queue; the follow-up then runs a fresh turn.
     */
    private preemptQueued;
    /** Dispose every bridge-owned Agent after queued message work settles. */
    dispose(): Promise<void>;
    private processNow;
    private processTaskNow;
    /**
     * Fold one session event into the streaming card state (card format
     * template §6). Returns `true` when the event demands an immediate push
     * that bypasses the throttle (terminal error).
     */
    private applyStreamEvent;
    private includeImages;
    private getOrCreate;
    /**
     * Compose the preset mount for an agent setup hook and the preset id to
     * record on a fresh session header. `preset` undefined resolves the web
     * default (`settings.yaml` `agent-presets.default`). Returns an empty
     * composition when the roster is absent or the preset is unknown.
     */
    private presetSetup;
    /** The preset a persisted session was last composed with (header or event). */
    private storedPreset;
    private createOrResume;
    /**
     * Pin a freshly created task session to the Full access preset
     * (`danger-full-access` sandbox + `never` approval) so tasks proposed in
     * Feishu conversations never inherit a narrower deployment default.
     * Best-effort: a missing permissionPresets service or a failed preset
     * switch only logs a warning; the task itself still runs.
     */
    private pinFullAccess;
    private collectReply;
    /** The fixed task-report prefix line: ✅[identity] [date-任务-seq], H2 + bold. */
    private reportPrefixLine;
    /** Prepend the fixed prefix line to a task report (keeps the card untouched). */
    private withReportPrefix;
    /** Assign the per-day sequential task number for a task session (resets at 00:00 local time). */
    private assignTaskSeq;
    /** Retrieve current generation number for one chat (default 0). */
    getChatGeneration(chatId: string): number;
    /** Reset chat context by bumping generation, returning new generation number. */
    resetChatGeneration(chatId: string): number;
    /** Deterministic main-chat session id considering generation resets. */
    mainSessionIdFor(message: NormalizedMessage): string;
    /** Formatted summary of active/registered task sessions for /tasks command. */
    getActiveTasksSummary(): string;
    private loadTaskCounter;
    private saveTaskCounter;
}
