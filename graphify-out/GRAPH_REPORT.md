# Graph Report - Corporate_GPT  (2026-05-10)

## Corpus Check
- 149 files · ~200,994 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 693 nodes · 1446 edges · 62 communities (52 shown, 10 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 5 edges (avg confidence: 0.82)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `cb650a66`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 52|Community 52]]
- [[_COMMUNITY_Community 53|Community 53]]
- [[_COMMUNITY_Community 61|Community 61]]

## God Nodes (most connected - your core abstractions)
1. `Grade` - 22 edges
2. `Company` - 19 edges
3. `db` - 17 edges
4. `cn()` - 17 edges
5. `main()` - 15 edges
6. `handleFirestoreError()` - 13 edges
7. `handler()` - 12 edges
8. `getMexicoDateString()` - 12 edges
9. `useAuth()` - 12 edges
10. `translations` - 12 edges

## Surprising Connections (you probably didn't know these)
- `LandingPage Component` --references--> `Techie Mascot Image`  [INFERRED]
  src/components/LandingPage.tsx → public/techie-mascot.png
- `Vite Build Process` --references--> `LandingPage Component`  [EXTRACTED]
  build_log.txt → src/components/LandingPage.tsx
- `Cloud Build Configuration` --calls--> `Vite Build Process`  [INFERRED]
  cloudbuild.yaml → build_log.txt
- `main()` --calls--> `testOpenRouter()`  [EXTRACTED]
  find_vision.ts → test_api_models.ts
- `main()` --calls--> `test()`  [EXTRACTED]
  find_vision.ts → src/Techie/scratch/test_gemini.ts

## Communities (62 total, 10 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.05
Nodes (58): AdminDashboard(), AdminDashboardProps, AdminPanel(), SettingsModal(), SettingsModalProps, checkCorporateTrial(), addUserSubscription(), AppConfig (+50 more)

### Community 1 - "Community 1"
Cohesion: 0.08
Nodes (37): ChatWindow(), ChatWindowProps, TypingIndicator(), FullQuizMessage(), FullQuizMessageProps, MathMessage(), MathMessageProps, Message() (+29 more)

### Community 2 - "Community 2"
Cohesion: 0.06
Nodes (31): CRITICAL_MODELS, main(), testModel(), main(), main(), MODELS, testModel(), main() (+23 more)

### Community 3 - "Community 3"
Cohesion: 0.08
Nodes (22): ADMIN_UIDS, handler(), verifyAdmin(), AVAILABLE_MODELS, handler(), consumeServerQuota(), ensureFirebase(), extractUserId() (+14 more)

### Community 4 - "Community 4"
Cohesion: 0.1
Nodes (32): DIRECTIONS, getSpeedForLevel(), INITIAL_SNAKE, Question, SnakeGame(), useInterval(), Alien, BarrierPixel (+24 more)

### Community 5 - "Community 5"
Cohesion: 0.11
Nodes (27): DeepResearchMessageProps, GeneratedImage, ASPECT_DIMENSIONS, CanvasObject, ImageCreationModalProps, ReviewAllMessageProps, ReviewMessage(), ReviewMessageProps (+19 more)

### Community 6 - "Community 6"
Cohesion: 0.11
Nodes (21): analyzeImage(), applyContentGuardrails(), applyImageGuardrails(), ClarifyingQuestion, cleanJsonString(), editImage(), generateFlashcards(), generateImage() (+13 more)

### Community 7 - "Community 7"
Cohesion: 0.14
Nodes (26): getMexicoDateString(), EcoModeBanner(), EcoModeBannerProps, consumeMultimediaCredits(), consumeTokens(), DAILY_QUOTA_LIMITS, DailyQuota, ECO_SAFE_MODELS (+18 more)

### Community 8 - "Community 8"
Cohesion: 0.13
Nodes (18): ArcadeModal(), ArcadeModalProps, BackpackModal(), BackpackModalProps, DiagnosticsModal(), DiagnosticsModalProps, FlashcardModal(), FlashcardModalProps (+10 more)

### Community 9 - "Community 9"
Cohesion: 0.16
Nodes (14): ChatMessage(), ChatMessageProps, IMAGE_MODELS, ImageModelSelector(), ImageModelSelectorProps, SalesLanding(), SalesLandingProps, ValueCardProps (+6 more)

### Community 10 - "Community 10"
Cohesion: 0.25
Nodes (15): LandingEditorProps, defaultConfig, getLandingConfig(), LandingConfig, LandingSection, LandingTheme, moveSection(), resetLandingConfig() (+7 more)

### Community 11 - "Community 11"
Cohesion: 0.16
Nodes (10): LandingEditor(), LandingPage(), LandingPageProps, PricingCardProps, PricingSection(), SupportFooter(), TrialEndedModal(), TrialEndedModalProps (+2 more)

### Community 12 - "Community 12"
Cohesion: 0.21
Nodes (12): subscribeToGPTs(), createRAGContext(), MALICIOUS_PATTERNS, parseCSV(), parseExcel(), parsePDF(), ParseResult, parseTextFile() (+4 more)

### Community 13 - "Community 13"
Cohesion: 0.15
Nodes (11): formatCategory(), formatEntry(), formatLogLevel(), LogCategory, LogEntry, logger, LogLevel, formatLog() (+3 more)

### Community 14 - "Community 14"
Cohesion: 0.3
Nodes (11): GradeSelector(), GradeSelectorProps, MathLabModal(), MathLabModalProps, UserProfileSetup(), UserProfileSetupProps, GRADES, TOOL_DEFINITIONS (+3 more)

### Community 15 - "Community 15"
Cohesion: 0.19
Nodes (12): ASPECT_RATIOS, EditorMode, IMAGE_MODELS, IMAGE_SIZES, ImageEditorModal(), ImageEditorModalProps, STYLE_TEMPLATES, StyleTemplate (+4 more)

### Community 16 - "Community 16"
Cohesion: 0.18
Nodes (8): CompanyPanel(), CompanyPanelProps, GPTsGenerator(), MobileWorkspace(), useHaptic(), SuperAdminPanel(), SuperAdminPanelProps, auth

### Community 17 - "Community 17"
Cohesion: 0.21
Nodes (4): ErrorBoundary, PanelErrorBoundary, Props, State

### Community 18 - "Community 18"
Cohesion: 0.22
Nodes (6): PrivacyPolicy(), PrivacyPolicyProps, AdvancedPanel(), AdvancedPanelProps, NeuralOverlayProps, cn()

### Community 19 - "Community 19"
Cohesion: 0.19
Nodes (8): FooterProps, HeaderProps, ALLOWED_EMAILS, AuthContextType, AuthProvider(), useAuth(), useAuth(), logger

### Community 20 - "Community 20"
Cohesion: 0.26
Nodes (8): ChatInput(), ChatInputProps, ImageSourceModal(), ImageSourceModalProps, ModelSelector(), ModelSelectorProps, ModelMetadata, ExplorerSettings

### Community 21 - "Community 21"
Cohesion: 0.2
Nodes (6): CREATIVE_PATTERNS, ELITE_ECO_MODELS, EliteModel, ModelTier, REASONING_PATTERNS, USA_PREMIUM_MODELS

### Community 22 - "Community 22"
Cohesion: 0.2
Nodes (9): Current URLs, Key Decisions, Pending Tasks, Project Memory - Key Facts, Rules, Startup Protocol, Super Admins, Tech Stack (+1 more)

### Community 23 - "Community 23"
Cohesion: 0.2
Nodes (8): Techie: Tu Super Tutor IA - Project Brain, Run and deploy your AI Studio app, Run Locally, Firebase, Google Gemini API, Techie | AI Master Tutor ✨, Main Entry Point, Techie AI Platform

### Community 24 - "Community 24"
Cohesion: 0.22
Nodes (7): CHART_TYPES, DeepResearch, PPTcreatorProps, SlideContent, Stage, Stage2_5, VISUAL_THEMES

### Community 25 - "Community 25"
Cohesion: 0.36
Nodes (7): failsafeChat(), fetchWithTimeout(), parseChatResponse(), RouterPayload, RouterResult, tryFallback(), optimizePromptForImage()

### Community 26 - "Community 26"
Cohesion: 0.29
Nodes (6): Core Stack, Deployment (Vercel), Design Guidelines, Development Workflows, Project Structure / Migration Plan, Techie: Tu Super Tutor IA - Project Brain

### Community 27 - "Community 27"
Cohesion: 0.33
Nodes (3): RateLimitEntry, RateLimitResult, rateLimitStore

### Community 28 - "Community 28"
Cohesion: 0.4
Nodes (4): canAccessTechie(), hasTechieAccess(), PlanType, TECHIE_ENABLED_PLANS

### Community 29 - "Community 29"
Cohesion: 0.4
Nodes (4): Data Invariants, Security Rules Plan (The Eight Pillars), Security Specification: Catalizia CorporateGPT, The Dirty Dozen (Vulnerability Payloads)

### Community 32 - "Community 32"
Cohesion: 0.5
Nodes (3): content, FAQ(), FAQProps

### Community 33 - "Community 33"
Cohesion: 0.5
Nodes (4): Vite Build Process, Cloud Build Configuration, LandingPage Component, Techie Mascot Image

## Knowledge Gaps
- **148 isolated node(s):** `CRITICAL_MODELS`, `__filename`, `__dirname`, `requiredEnv`, `MODELS` (+143 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **10 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getMexicoDateString()` connect `Community 7` to `Community 3`?**
  _High betweenness centrality (0.177) - this node is a cross-community bridge._
- **Why does `validateUserQuota()` connect `Community 3` to `Community 7`?**
  _High betweenness centrality (0.158) - this node is a cross-community bridge._
- **Why does `handler()` connect `Community 3` to `Community 2`?**
  _High betweenness centrality (0.155) - this node is a cross-community bridge._
- **What connects `CRITICAL_MODELS`, `__filename`, `__dirname` to the rest of the system?**
  _148 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.06 - nodes in this community are weakly interconnected._