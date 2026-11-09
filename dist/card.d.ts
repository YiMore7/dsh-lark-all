/**
 * Streaming task card for Feishu/Lark — implements the interactive-card
 * layout, status mapping, tool labels, argument briefs and throttling
 * constants specified by the channel's card format template.
 *
 * One card is created per task turn, updated in place (same message) while
 * the turn runs, and frozen in its final state when the turn settles. The
 * final answer is delivered as a separate report message and never written
 * into the card.
 */
/** Card lifecycle status (drives header template and status line). */
export type TaskCardStatus = 'created' | 'running' | 'done' | 'error';
/** One todo-list entry rendered on the card. */
export interface TaskCardTodo {
    content: string;
    status: 'pending' | 'in_progress' | 'completed';
}
/** Accumulated streaming state rendered onto one task card. */
export interface TaskCardState {
    status: TaskCardStatus;
    /** Current turn's user message summary (truncated when rendered). */
    title: string;
    /** Human-readable mode label, e.g. `PTC 模式`. */
    modeLabel: string;
    /** Short chat/session id shown next to the mode label. */
    sessionShortId: string;
    /** Turn start timestamp (ms) — drives the elapsed-time line. */
    startAt: number;
    /** Task round number (1-based). */
    turn: number;
    /** Current step within the turn; 0 when no step has started yet. */
    step: number;
    /** Most recent tool name (English id, mapped on render). */
    toolName: string;
    /** Most recent tool arguments (raw JSON string, briefed on render). */
    toolArgs: string;
    /** Accumulated reasoning text; display trims to a tail window. */
    thinking: string;
    thinkingChars: number;
    /** Latest todo-list snapshot (whole-list replace on `todo/write`). */
    todos: TaskCardTodo[];
}
/** Card layout constants (tunable). */
export declare const CARD_MIN_UPDATE_MS = 1000;
export declare const CARD_TITLE_MAX = 24;
export declare const CARD_THINKING_MAX = 240;
export declare const CARD_ANSWER_MAX = 320;
export declare const CARD_ARGS_MAX = 60;
export declare const CARD_ARGS_VALUE_MAX = 40;
export declare const CARD_TODO_MAX = 3;
export declare const CARD_THINKING_CAP = 4000;
/** The Chinese label for one tool name; unknown names render verbatim. */
export declare function toolLabel(name: string): string;
/**
 * Brief tool-call arguments for the card's `工具` line.
 * Prefers the `command` / `query` / `pattern` / `name` / `path` /
 * `file_path` field (truncated to 60 chars); falls back to the first
 * `key=value` pair (value truncated to 40 chars); on parse failure the
 * raw string is truncated to 60 chars.
 */
export declare function briefArgs(raw: string): string;
/** Bound text to a character limit (code-point safe), appending `…` when cut. */
export declare function truncateCardText(text: string, maxChars: number): string;
/** Render an elapsed duration as `X 分 Y 秒` (seconds only below one minute). */
export declare function formatDuration(elapsedMs: number): string;
interface CardTextElement {
    tag: 'div';
    text: {
        tag: 'lark_md';
        content: string;
    };
}
interface CardNoteElement {
    tag: 'note';
    elements: [{
        tag: 'plain_text';
        content: string;
    }];
}
/** The rendered interactive-card JSON for one task turn (template §2). */
export interface TaskCard {
    config: {
        wide_screen_mode: true;
    };
    header: {
        template: string;
        title: {
            tag: 'plain_text';
            content: string;
        };
    };
    elements: Array<CardTextElement | {
        tag: 'hr';
    } | CardNoteElement>;
}
/**
 * Build the card JSON for the current state. Rows render in template order
 * (§4) and rows without data are skipped; the trailing `<hr>` + note are
 * always present.
 */
export declare function buildCard(state: TaskCardState): TaskCard;
/** Create the initial (created) state for one task turn. */
export declare function createTaskCardState(init: {
    title: string;
    modeLabel: string;
    sessionShortId: string;
    turn: number;
}): TaskCardState;
/** Append a reasoning delta, keeping the rolling tail window capped. */
export declare function appendThinking(state: TaskCardState, delta: string): void;
export {};
