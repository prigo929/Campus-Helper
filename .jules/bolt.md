## 2024-05-23 - Initial Setup
**Learning:** The project was missing `@ai-sdk/gateway` which caused typecheck failures. Always check for missing dependencies in `package.json` when imports are present.
**Action:** Added `@ai-sdk/gateway` to dependencies.

## 2024-05-23 - Chat Message Memoization
**Learning:** In streaming chat interfaces, the entire message list re-renders on every token update. Memoizing individual message components prevents re-rendering of previous messages, significantly reducing main thread work during streaming.
**Action:** Extracted `ChatMessage` component and wrapped in `React.memo`.
