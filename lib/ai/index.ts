/**
 * AI / LLM utilities
 * OpenCode Zen primary, Groq fallback via createChatCompletion orchestrator.
 */

export {
  createChatCompletion,
  isLlmConfigured,
  isZenConfigured,
  isOpenRouterConfigured,
  isGroqConfigured,
  type ChatMessage,
  type ChatCompletionOptions,
  type ChatCompletionResponse,
  type ChatCompletionFailureKind,
  type ChatCompletionResult,
  type LlmProvider,
} from "./create-chat-completion";

export { createZenChatCompletion, DEFAULT_ZEN_MODEL } from "./opencode-zen";
export {
  createGroqChatCompletion,
  DEFAULT_GROQ_MODEL,
  resolveGroqModel,
} from "./groq";
