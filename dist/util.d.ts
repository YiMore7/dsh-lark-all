import type { NormalizedMessage } from '@larksuiteoapi/node-sdk';
/** Deterministic, non-identifying DSH session id for one Lark conversation. */
export declare function sessionIdFor(accountId: string, message: Pick<NormalizedMessage, 'chatType' | 'chatId' | 'threadId'>, threadSessions?: boolean, generation?: number): string;
/**
 * Deterministic DSH session id for one task. A task is anchored at the
 * message that started it (the thread root): the anchor is the task message's
 * own id, and every follow-up message inside the task's thread resolves the
 * same anchor from `rootId` (falling back to the stable `threadId`).
 */
export declare function taskSessionIdFor(accountId: string, chatId: string, anchorId: string): string;
/**
 * The stable anchor that identifies the task a message belongs to: the thread
 * root message id when the message lives in a thread, otherwise the message
 * itself (a fresh task starts at its own message).
 */
export declare function taskAnchorFor(message: Pick<NormalizedMessage, 'messageId' | 'rootId' | 'threadId'>): string;
/** Built-in task prefixes: keyword → agent-preset id ('' = web default). */
export declare const BUILTIN_TASK_PRESETS: Readonly<Record<string, string>>;
/**
 * Parse a task-mode prefix from an inbound message.
 * Accepts `ptc任务：`/`ptc任务:` (also `标准`/`极简`/`创造` as the mode word)
 * and the bare `任务：`/`任务:`, each with an ASCII or full-width colon and
 * optional spacing. Returns the configured preset id ('' = web default) and
 * the remaining task content, or undefined when the message carries no task
 * prefix.
 */
export declare function parseTaskPrefix(text: string, presets?: Record<string, string>, defaultPreset?: string): {
    preset: string;
    content: string;
    keyword: string;
} | undefined;
/** Human-readable mode label for a parsed task prefix (for cards/notices). */
export declare function taskModeLabel(keyword: string): string;
/**
 * Split one long report into pages of at most `limit` characters. Breaks at
 * line boundaries, prefers heading boundaries when a page is near full, and
 * never cuts inside a fenced code block (an open fence is closed at the page
 * break and reopened at the start of the next page). A single line longer
 * than `limit` is hard-split so every page fits the limit.
 *
 * The boundary logic mirrors the bundled SDK's markdown splitter so the
 * pages produced here match what the SDK would send on its own — with one
 * difference: the SDK keeps over-long lines whole (and then chunks them via
 * a non-thread path), while this helper guarantees every page fits.
 */
export declare function splitReportPages(text: string, limit: number): string[];
/** Bound Unicode text to a character limit without splitting a code point. */
export declare function truncateText(text: string, maxChars: number, suffix?: string): string;
/** Resolve after `ms` milliseconds. */
export declare function sleep(ms: number): Promise<void>;
/** Promise timeout with a stable, caller-facing label. */
export declare function withTimeout<T>(task: Promise<T>, timeoutMs: number, label: string): Promise<T>;
