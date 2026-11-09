import z from '@deepseek-ai/schemastery'

/** Access policy for one Lark chat scope. */
export type AccessMode = 'open' | 'allowlist' | 'disabled'

/** How inbound Lark images are presented to the selected Harness model. */
export type ImageInputMode = 'auto' | 'always' | 'never'

/** Official API domain selected for the application. */
export type LarkDomain = 'feishu' | 'lark'

/** Feishu/Lark channel configuration. */
export interface Config {
  appId: string
  appSecretRef: string
  accountId: string
  cwd: string
  domain: LarkDomain
  singlePolicy: AccessMode
  singleAllowFrom: string[]
  groupPolicy: AccessMode
  groupAllowChats: string[]
  groupRequireMention: boolean
  respondToMentionAll: boolean
  imageInputMode: ImageInputMode
  replyInThread: boolean
  responseTimeoutMs: number
  mediaDownloadTimeoutMs: number
  sendTimeoutMs: number
  handshakeTimeoutMs: number
  sendRetries: number
  maxReplyChars: number
  maxReplyImages: number
  maxOutboundImageBytes: number
  /**
   * Inbound file/media handling. Each inbound `file` / `audio` / `video`
   * resource is downloaded to the inbox directory and described to the
   * model (path, size, duration); text-like files additionally get a
   * preview snippet so the model can answer questions about them.
   */
  inboundFiles: boolean
  inboundMedia: boolean
  /** Directory for downloaded inbound resources; empty uses `<cwd>/.lark-inbox`. */
  inboundDir: string
  /** Upper bound for a downloaded inbound resource (Feishu caps IM resources at 100MB). */
  inboundResourceLimitBytes: number
  /** Preview length for text-like inbound files; 0 disables previews. */
  inboundTextPreviewChars: number
  /**
   * Outbound media: allows the model to attach files / original images /
   * voice / video to its replies via `[lark-file: <path|URL>]` style
   * markers, and enables the `/bot-send-*` commands.
   */
  outboundMedia: boolean
  /**
   * Directories (or URLs) allowed as outbound media sources. Local paths
   * are realpath-checked against this allowlist; URLs are fetched by the
   * SDK with its built-in SSRF guard. Empty defaults to [`cwd`].
   */
  outboundAllowedDirs: string[]
  /** Max bytes for one outbound file message (Feishu IM file cap is 30MB). */
  maxOutboundFileBytes: number
  /** Max bytes for one outbound voice message. */
  maxOutboundAudioBytes: number
  /** Max bytes for one outbound video message. */
  maxOutboundVideoBytes: number
  /**
   * When an outbound file exceeds `maxOutboundFileBytes`, upload it to
   * Feishu Drive (multipart) and reply with the share link instead of
   * failing. Requires drive permissions on the Feishu app.
   */
  driveLargeFiles: boolean
  /** Max bytes uploaded to Drive for oversized outbound files. */
  maxDriveFileBytes: number
  /** Parse `[lark-*: ...]` markers out of model replies and send them as media. */
  sendFileMarkers: boolean
  /**
   * Feishu cloud documents: inbound `docx` shares are read via
   * `docx.raw_content` and described to the model; the `/bot-send-doc`
   * command and `[lark-doc: <md path>]` marker create a Feishu docx from
   * a markdown file and reply with its link.
   */
  docxInbound: boolean
  docxOutbound: boolean
  maxInFlightMessages: number
  maxSeenMessageIds: number
  staleMessageWindowMs: number
  /**
   * Enable the SDK's per-chat serial message queue. When disabled (default),
   * inbound messages dispatch immediately, so independent task sessions
   * (「任务：」 prefix, one session per thread) run in parallel inside the
   * same chat — the same model as Web conversations. The main chat session
   * itself still processes its own messages strictly in order.
   */
  chatQueue: boolean
  progressReaction: boolean
  progressEmoji: string
  doneEmoji: string
  /** Enable one-task-one-session routing with mode prefixes, thread replies and streaming cards. */
  taskSessions: boolean
  /**
   * Extra prefix → agent-preset mapping on top of the built-ins
   * (`ptc`→`code`, `standard`→`standard`, `minimal`→`minimal`,
   * `creative`→`cordis`). Both the ASCII and full-width Chinese keywords
   * accept the value `default` to fall back to the web default preset.
   */
  taskPresets: Record<string, string>
  /**
   * Preset used by the bare `任务：` prefix and plain (non-prefixed) legacy
   * chat sessions. Defaults to `code` so the bare `任务：` prefix points at
   * PTC mode out of the box; empty string resolves the web default
   * (`settings.yaml` `agent-presets.default`).
   */
  taskDefaultPreset: string
  /** Reasoning effort pinned on freshly created task sessions; default `max`. */
  taskReasoningEffort: string
  /** Identity shown in the fixed task-report prefix (e.g. `wdsh`). */
  reportIdentity: string
  /** Whether newly created task sessions are pinned to danger-full-access (default false). */
  taskFullAccess: boolean
  /** Custom path for the per-day task counter file; empty uses `<cwd>/.lark-task-counter.json`. */
  taskCounterFile: string
  /** The exact main-chat message (trimmed) that triggers a process restart. */
  restartCommand: string
  /** Marker file written before restart and consumed by dsh-harness-ops on boot. */
  restartMarkerFile: string
  /** Shell line used to relaunch the web process after a restart request. */
  restartLaunch: string
  /** Log file for the relaunched process (stdout+stderr). */
  restartLogFile: string
  /** How long to wait after spawning the restart helper before exiting. */
  restartExitDelayMs: number
  systemPrompt: string
}

/** Runtime-validated plugin configuration. */
export const Config: z<Config> = z.object({
  appId: z.string().required(),
  appSecretRef: z.string().default('LARK_APP_SECRET'),
  accountId: z.string().default(''),
  cwd: z.string().required(),
  domain: z.union(['feishu', 'lark']).default('feishu'),
  singlePolicy: z.union(['open', 'allowlist', 'disabled']).default('open'),
  singleAllowFrom: z.array(z.string()).default([]),
  groupPolicy: z.union(['open', 'allowlist', 'disabled']).default('open'),
  groupAllowChats: z.array(z.string()).default([]),
  groupRequireMention: z.boolean().default(true),
  respondToMentionAll: z.boolean().default(false),
  imageInputMode: z.union(['auto', 'always', 'never']).default('auto'),
  replyInThread: z.boolean().default(false),
  responseTimeoutMs: z.number().step(1).min(1).default(300_000),
  mediaDownloadTimeoutMs: z.number().step(1).min(1).default(30_000),
  sendTimeoutMs: z.number().step(1).min(1).default(30_000),
  handshakeTimeoutMs: z.number().step(1).min(1).default(15_000),
  sendRetries: z.number().step(1).min(0).max(5).default(2),
  maxReplyChars: z.number().step(1).min(100).max(30_000).default(20_000),
  maxReplyImages: z.number().step(1).min(0).max(9).default(4),
  maxOutboundImageBytes: z.number().step(1).min(1_024).max(100 * 1024 * 1024).default(10 * 1024 * 1024),
  inboundFiles: z.boolean().default(true),
  inboundMedia: z.boolean().default(true),
  inboundDir: z.string().default(''),
  inboundResourceLimitBytes: z.number().step(1).min(1_024).max(100 * 1024 * 1024).default(100 * 1024 * 1024),
  inboundTextPreviewChars: z.number().step(1).min(0).max(100_000).default(6_000),
  outboundMedia: z.boolean().default(true),
  outboundAllowedDirs: z.array(z.string()).default([]),
  maxOutboundFileBytes: z.number().step(1).min(1_024).max(100 * 1024 * 1024).default(30 * 1024 * 1024),
  maxOutboundAudioBytes: z.number().step(1).min(1_024).max(100 * 1024 * 1024).default(30 * 1024 * 1024),
  maxOutboundVideoBytes: z.number().step(1).min(1_024).max(100 * 1024 * 1024).default(30 * 1024 * 1024),
  driveLargeFiles: z.boolean().default(false),
  maxDriveFileBytes: z.number().step(1).min(1_024).max(1024 * 1024 * 1024).default(200 * 1024 * 1024),
  sendFileMarkers: z.boolean().default(true),
  docxInbound: z.boolean().default(true),
  docxOutbound: z.boolean().default(true),
  maxInFlightMessages: z.number().step(1).min(1).max(100).default(8),
  maxSeenMessageIds: z.number().step(1).min(100).max(100_000).default(5_000),
  staleMessageWindowMs: z.number().step(1).min(1_000).default(1_800_000),
  chatQueue: z.boolean().default(false),
  progressReaction: z.boolean().default(true),
  progressEmoji: z.string().default('Typing'),
  doneEmoji: z.string().default(''),
  taskSessions: z.boolean().default(true),
  taskPresets: z.dict(z.string()).default({}),
  taskDefaultPreset: z.string().default('code'),
  taskReasoningEffort: z.string().default('max'),
  reportIdentity: z.string().default('wdsh'),
  taskFullAccess: z.boolean().default(false),
  taskCounterFile: z.string().default(''),
  restartCommand: z.string().default('重启进程'),
  restartMarkerFile: z.string().default(''),
  restartLaunch: z.string().default('dsh web'),
  restartLogFile: z.string().default(''),
  restartExitDelayMs: z.number().step(1).min(500).max(60_000).default(4_000),
  systemPrompt: z.string().default(
    '你通过飞书与用户(YiM)对话。遵守以下通道规则:\n'
    + '1. 会话模型:主聊天是一个常驻个人会话(上下文连续);聊天内的每个「话题」是独立的任务会话(上下文隔离、流式卡片反馈)。支持斜杠命令(/new 重置主会话上下文、/tasks 查看运行中任务列表、/help 查看帮助)。不要建议用户去 GUI 操作,用户主要在手机上。\n'
    + '2. 回复风格:清晰、适合聊天阅读;中文为主;长任务放话题里执行并给出进度。\n'
    + '3. 不要泄露凭证或内部系统数据。\n'
    + '4. 若某个请求需要交互审批而本通道无法提供,明确说明需要什么审批,不要无限等待。\n'
    + '5. 附件标记(单独一行):[lark-file: <path or URL>] 附文件;[lark-image: <path or URL>] 原图;[lark-voice: <path or URL>] opus 语音;[lark-video: <path or URL>] mp4 视频;[lark-doc: <path.md>] 生成飞书云文档。本地路径必须绝对且位于允许的媒体目录内(默认为工作目录)。',
  ),
})
