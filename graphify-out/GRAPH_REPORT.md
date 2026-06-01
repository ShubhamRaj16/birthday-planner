# Graph Report - .  (2026-06-01)

## Corpus Check
- 170 files · ~55,289 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1048 nodes · 1498 edges · 68 communities (60 shown, 8 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 11 edges (avg confidence: 0.7)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Children Page & Forms|Children Page & Forms]]
- [[_COMMUNITY_Backend Dependencies|Backend Dependencies]]
- [[_COMMUNITY_Skill Lock & Hashing|Skill Lock & Hashing]]
- [[_COMMUNITY_Reminders & API Errors|Reminders & API Errors]]
- [[_COMMUNITY_Routing & NotFound|Routing & NotFound]]
- [[_COMMUNITY_Babel Build Config|Babel Build Config]]
- [[_COMMUNITY_Husky Git Hooks|Husky Git Hooks]]
- [[_COMMUNITY_Task Checklist UI|Task Checklist UI]]
- [[_COMMUNITY_WhatsApp Invite Flow|WhatsApp Invite Flow]]
- [[_COMMUNITY_Graphify CLI|Graphify CLI]]
- [[_COMMUNITY_Photo Gallery UI|Photo Gallery UI]]
- [[_COMMUNITY_React Error Boundary|React Error Boundary]]
- [[_COMMUNITY_Calendar UI|Calendar UI]]
- [[_COMMUNITY_Token Benchmark|Token Benchmark]]
- [[_COMMUNITY_Events Page|Events Page]]
- [[_COMMUNITY_Budget Tracker|Budget Tracker]]
- [[_COMMUNITY_Event Detail Page|Event Detail Page]]
- [[_COMMUNITY_Gift Tracker UI|Gift Tracker UI]]
- [[_COMMUNITY_Guest List UI|Guest List UI]]
- [[_COMMUNITY_AI Service & Routes|AI Service & Routes]]
- [[_COMMUNITY_Dashboard|Dashboard]]
- [[_COMMUNITY_Frontend tsconfig|Frontend tsconfig]]
- [[_COMMUNITY_Component Render Tests|Component Render Tests]]
- [[_COMMUNITY_Backend tsconfig|Backend tsconfig]]
- [[_COMMUNITY_Shared Types & Task Defaults|Shared Types & Task Defaults]]
- [[_COMMUNITY_NPM Scripts|NPM Scripts]]
- [[_COMMUNITY_Cron & Reminder Service|Cron & Reminder Service]]
- [[_COMMUNITY_Express App & Routers|Express App & Routers]]
- [[_COMMUNITY_AI Suggestions UI|AI Suggestions UI]]
- [[_COMMUNITY_Backend Route Tests|Backend Route Tests]]
- [[_COMMUNITY_guestsSlice.ts|guestsSlice.ts]]
- [[_COMMUNITY_children.ts|children.ts]]
- [[_COMMUNITY_dependencies|dependencies]]
- [[_COMMUNITY_types.ts|types.ts]]
- [[_COMMUNITY_expensesSlice.ts|expensesSlice.ts]]
- [[_COMMUNITY_eventsSlice.ts|eventsSlice.ts]]
- [[_COMMUNITY_giftsSlice.ts|giftsSlice.ts]]
- [[_COMMUNITY_photos.ts|photos.ts]]
- [[_COMMUNITY_whatsappService.ts|whatsappService.ts]]
- [[_COMMUNITY_setup.ts|setup.ts]]
- [[_COMMUNITY_giftService.ts|giftService.ts]]
- [[_COMMUNITY_eventService.ts|eventService.ts]]
- [[_COMMUNITY_index.tsx|index.tsx]]
- [[_COMMUNITY_expenseService.ts|expenseService.ts]]
- [[_COMMUNITY_BudgetTracker.test.tsx|BudgetTracker.test.tsx]]
- [[_COMMUNITY_events.ts|events.ts]]
- [[_COMMUNITY_errorHandler.ts|errorHandler.ts]]
- [[_COMMUNITY_package.json|package.json]]
- [[_COMMUNITY_waLink.ts|waLink.ts]]
- [[_COMMUNITY_tasks.ts|tasks.ts]]
- [[_COMMUNITY_Header.tsx|Header.tsx]]
- [[_COMMUNITY_GuestList()|GuestList()]]
- [[_COMMUNITY_settings.json|settings.json]]
- [[_COMMUNITY_settings.local.json|settings.local.json]]
- [[_COMMUNITY_globalSetup.mjs|globalSetup.mjs]]
- [[_COMMUNITY___init__.py|__init__.py]]
- [[_COMMUNITY_scrum-53-dedupe.sh|scrum-53-dedupe.sh]]
- [[_COMMUNITY_scrum-54-port-coerce.sh|scrum-54-port-coerce.sh]]
- [[_COMMUNITY_scrum-55-reminder-read.sh|scrum-55-reminder-read.sh]]

## God Nodes (most connected - your core abstractions)
1. `useAppDispatch()` - 26 edges
2. `scripts` - 24 edges
3. `useAppSelector` - 24 edges
4. `compilerOptions` - 16 edges
5. `createTestChild()` - 15 edges
6. `scripts` - 15 edges
7. `compilerOptions` - 15 edges
8. `validate()` - 14 edges
9. `scripts` - 14 edges
10. `getApiError()` - 13 edges

## Surprising Connections (you probably didn't know these)
- `downloadCsv()` --semantically_similar_to--> `setupErrorHandling()`  [INFERRED] [semantically similar]
  frontend/src/lib/csv.ts → frontend/src/client/errorHandler.ts
- `InviteFlow()` --semantically_similar_to--> `normalisePhone helper`  [INFERRED] [semantically similar]
  frontend/src/components/InviteFlow.tsx → frontend/src/lib/waLink.ts
- `makeChild()` --calls--> `createTestChild()`  [EXTRACTED]
  backend/tests/services/eventService.test.ts → backend/src/test/helpers.ts
- `hydrateApp()` --shares_data_with--> `Window global augmentation (__INITIAL_STATE__)`  [INFERRED]
  frontend/src/client/index.tsx → frontend/src/global.d.ts
- `Header()` --semantically_similar_to--> `BudgetTracker()`  [INFERRED] [semantically similar]
  frontend/src/components/Header.tsx → frontend/src/components/BudgetTracker.tsx

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **EventDetail tab panel sub-resource components** — pages_eventdetail_eventdetail, components_guestlist_guestlist, components_budgettracker_budgettracker, components_gifttracker_gifttracker, components_taskchecklist_taskchecklist, components_inviteflow_inviteflow, components_photogallery_photogallery, components_aisuggestions_aisuggestions [EXTRACTED 0.95]
- **Client-side CSV export flow** — lib_csv_tocsv, lib_csv_downloadcsv, lib_csv_fileslug, components_budgettracker_budgettracker, components_guestlist_guestlist [EXTRACTED 0.95]
- **mediaUrl uploads-path consumers** — lib_apiclient_mediaurl, components_photogallery_photogallery, components_budgettracker_budgettracker, pages_children_children, pages_dashboard_dashboard, components_inviteflow_inviteflow [EXTRACTED 0.85]

## Communities (68 total, 8 thin omitted)

### Community 0 - "Children Page & Forms"
Cohesion: 0.04
Nodes (46): Avatar, Button, Card, CardActions, CardTop, ChildForm(), ChildFormData, ChildFormProps (+38 more)

### Community 1 - "Backend Dependencies"
Cohesion: 0.04
Nodes (45): dependencies, @anthropic-ai/sdk, archiver, cors, dayjs, dotenv, express, multer (+37 more)

### Community 2 - "Skill Lock & Hashing"
Cohesion: 0.05
Nodes (37): computedHash, skillPath, source, sourceType, computedHash, skillPath, source, sourceType (+29 more)

### Community 3 - "Reminders & API Errors"
Cohesion: 0.06
Nodes (34): Button, DangerButton, EMPTY_FORM, EmptyState, ErrorMsg, FieldGroup, FiredBadge, FormActions (+26 more)

### Community 4 - "Routing & NotFound"
Cohesion: 0.08
Nodes (26): Container, Description, HomeLink, Title, createClientRoutes(), createRoutes(), RouteConfig, RouteParams (+18 more)

### Community 5 - "Babel Build Config"
Cohesion: 0.06
Nodes (34): devDependencies, @babel/cli, @babel/core, babel-loader, babel-plugin-styled-components, @babel/preset-env, @babel/preset-react, @babel/preset-typescript (+26 more)

### Community 6 - "Husky Git Hooks"
Cohesion: 0.06
Nodes (32): description, devDependencies, concurrently, husky, name, private, scripts, backup (+24 more)

### Community 7 - "Task Checklist UI"
Cohesion: 0.06
Nodes (30): ActionsRow, CategoryChip, DeleteBtn, EmptyMsg, ErrorMsg, FormInput, FormRow, FormSection (+22 more)

### Community 8 - "WhatsApp Invite Flow"
Cohesion: 0.06
Nodes (31): CardNote, CardPreviewImg, CheckboxLabel, EmptyMsg, ErrorMsg, FileInput, FilterRow, FlowWrapper (+23 more)

### Community 9 - "Graphify CLI"
Cohesion: 0.14
Nodes (26): bool, Path, str, bool, Path, str, main(), print_usage() (+18 more)

### Community 10 - "Photo Gallery UI"
Cohesion: 0.08
Nodes (27): ActionRow, CaptionInput, CoverBadge, EmptyMsg, ErrMsg, Grid, HiddenInput, PhotoCaption (+19 more)

### Community 11 - "React Error Boundary"
Cohesion: 0.08
Nodes (17): ErrorBoundary, ErrorBoundaryProps, ErrorBoundaryState, Fallback, Footer(), FooterWrapper, Item, Stack (+9 more)

### Community 12 - "Calendar UI"
Cohesion: 0.08
Nodes (27): InviteFlowProps, Calendar(), CalendarDay, CalendarGrid, CalendarHeader, CalendarItems, CalendarWrapper, CHILD_COLORS (+19 more)

### Community 13 - "Token Benchmark"
Cohesion: 0.15
Nodes (23): Path, Path, str, benchmark_pair(), count_tokens(), main(), print_table(), count_bullets() (+15 more)

### Community 14 - "Events Page"
Cohesion: 0.07
Nodes (26): Button, DangerButton, EMPTY_FORM, EmptyState, ErrorMsg, EventCard, EventFilter, EventInfo (+18 more)

### Community 15 - "Budget Tracker"
Cohesion: 0.08
Nodes (25): BudgetTrackerProps, CATEGORIES, CategoryChip, ChartSection, ChartTitle, CheckLabel, DeleteBtn, EmptyMsg (+17 more)

### Community 16 - "Event Detail Page"
Cohesion: 0.08
Nodes (25): BackLink, Button, ErrorMsg, GPInput, GPLink, GPRow, GPSaveBtn, HeaderActions (+17 more)

### Community 17 - "Gift Tracker UI"
Cohesion: 0.08
Nodes (24): ActionBtn, CardActions, DeleteBtn, EmptyMsg, ErrorMsg, FILTER_TABS, FilterTabs, FormInput (+16 more)

### Community 18 - "Guest List UI"
Cohesion: 0.09
Nodes (22): CsvTextarea, DeleteBtn, EmptyMsg, ErrorMsg, FormInput, FormRow, FormSection, FormSelect (+14 more)

### Community 19 - "AI Service & Routes"
Cohesion: 0.13
Nodes (18): router, StatusError, mockClient, mockCreate, AnthropicClient, buildContext(), getClient(), getSuggestions() (+10 more)

### Community 20 - "Dashboard"
Cohesion: 0.11
Nodes (19): ActionLink, Avatar, Card, CardInfo, ChildBirthdayCard(), ChildName, DaysUntil, EmptyState (+11 more)

### Community 21 - "Frontend tsconfig"
Cohesion: 0.11
Nodes (18): compilerOptions, allowSyntheticDefaultImports, declaration, declarationMap, esModuleInterop, forceConsistentCasingInFileNames, lib, module (+10 more)

### Community 22 - "Component Render Tests"
Cohesion: 0.26
Nodes (19): AISuggestions(), saveGiftSuggestion(), BudgetTracker(), GiftTracker(), Header(), InviteFlow(), PhotoGallery(), TaskChecklist() (+11 more)

### Community 23 - "Backend tsconfig"
Cohesion: 0.12
Nodes (18): //, compilerOptions, allowJs, allowSyntheticDefaultImports, esModuleInterop, forceConsistentCasingInFileNames, jsx, lib (+10 more)

### Community 24 - "Shared Types & Task Defaults"
Cohesion: 0.12
Nodes (13): ApiError, ApiResponse, EventStatus, ExpenseSummary, TASK_DEFAULTS, router, CreateEventInput, CreateExpenseInput (+5 more)

### Community 25 - "NPM Scripts"
Cohesion: 0.13
Nodes (15): scripts, build, build:client, build:server, clean, dev, format, format:check (+7 more)

### Community 26 - "Cron & Reminder Service"
Cohesion: 0.21
Nodes (8): startCronJobs(), completePassedEvents(), createReminder(), fireDueReminders(), getUnreadCount(), markRead(), CreateReminderInput, UpdateReminderInput

### Community 27 - "Express App & Routers"
Cohesion: 0.14
Nodes (7): app, AppError, router, router, router, router, ALLOWED_ORIGINS

### Community 28 - "AI Suggestions UI"
Cohesion: 0.14
Nodes (13): AISuggestionsProps, EmptyMsg, ErrMsg, GenerateBtn, MessageBox, SaveBtn, SuggestionItem, SuggestionList (+5 more)

### Community 29 - "Backend Route Tests"
Cohesion: 0.33
Nodes (6): FUTURE, createTestChild(), createTestEvent(), createTestExpense(), createTestGuest(), createTestReminder()

### Community 30 - "guestsSlice.ts"
Cohesion: 0.14
Nodes (13): bulkImportGuests, BulkImportGuestsArgs, createGuest, CreateGuestArgs, deleteGuest, DeleteGuestArgs, EventIdArg, fetchGuests (+5 more)

### Community 31 - "children.ts"
Cohesion: 0.15
Nodes (5): avatarStorage, router, upload, CreateChildInput, UpdateChildInput

### Community 32 - "dependencies"
Cohesion: 0.15
Nodes (13): dependencies, axios, cors, dayjs, dotenv, express, react, react-dom (+5 more)

### Community 33 - "types.ts"
Cohesion: 0.15
Nodes (12): ApiError, ApiResponse, EventStatus, ExpenseSummary, EventsState, Gift, GiftStatus, GuestsState (+4 more)

### Community 34 - "expensesSlice.ts"
Cohesion: 0.17
Nodes (11): createExpense, CreateExpenseArgs, deleteExpense, DeleteExpenseArgs, ExpenseInput, expensesSlice, fetchExpenses, initialState (+3 more)

### Community 35 - "eventsSlice.ts"
Cohesion: 0.17
Nodes (11): activateEvent, createEvent, deleteEvent, EventInput, eventsSlice, fetchEvent, fetchEvents, fetchUpcoming (+3 more)

### Community 36 - "giftsSlice.ts"
Cohesion: 0.17
Nodes (11): createGift, CreateGiftArgs, deleteGift, DeleteGiftArgs, fetchGifts, GiftInput, giftsSlice, initialState (+3 more)

### Community 37 - "photos.ts"
Cohesion: 0.18
Nodes (4): router, storage, upload, UpdatePhotoInput

### Community 38 - "whatsappService.ts"
Cohesion: 0.27
Nodes (9): buildMessage(), EventWithChild, getDefaultTemplate(), getWaLink(), previewMessage(), mockChild, mockEvent, MessageContext (+1 more)

### Community 39 - "setup.ts"
Cohesion: 0.29
Nodes (6): prisma, bulkImportGuests(), createGuest(), deleteGuest(), listGuests(), updateGuest()

### Community 40 - "giftService.ts"
Cohesion: 0.29
Nodes (9): createGift(), deleteGift(), GiftStatus, isValidGiftStatus(), listGifts(), updateGift(), VALID_STATUSES, CreateGiftInput (+1 more)

### Community 41 - "eventService.ts"
Cohesion: 0.31
Nodes (8): activateEvent(), createEvent(), deleteEvent(), getEvent(), getUpcomingEvents(), listEvents(), makeChild(), updateEvent()

### Community 42 - "index.tsx"
Cohesion: 0.27
Nodes (7): rootEl, store, AppDispatch, AppStore, PreloadedState, Window, RootState

### Community 43 - "expenseService.ts"
Cohesion: 0.31
Nodes (7): CATEGORIES, createExpense(), deleteExpense(), getSummary(), listExpenses(), ALL_CATEGORIES, updateExpense()

### Community 44 - "BudgetTracker.test.tsx"
Cohesion: 0.27
Nodes (5): mockGuests, createStore(), Expense, Guest, renderWithStore()

### Community 45 - "events.ts"
Cohesion: 0.22
Nodes (7): inviteCardStorage, inviteUpload, router, receiptStorage, router, upload, MulterRequest

### Community 46 - "errorHandler.ts"
Cohesion: 0.25
Nodes (6): setupErrorHandling(), hydrateApp(), ToastHost(), getApiBaseUrl(), App Root Component, Window global augmentation (__INITIAL_STATE__)

### Community 47 - "package.json"
Cohesion: 0.25
Nodes (7): author, description, keywords, license, main, name, version

### Community 48 - "waLink.ts"
Cohesion: 0.40
Nodes (3): normalisePhone(), buildWaLink(), normalisePhone helper

### Community 50 - "Header.tsx"
Cohesion: 0.33
Nodes (5): Badge, Brand, Nav, NavLink, fetchUnreadCount

### Community 51 - "GuestList()"
Cohesion: 0.47
Nodes (4): GuestList(), downloadCsv(), fileSlug(), toCsv()

## Knowledge Gaps
- **639 isolated node(s):** `str`, `PreToolUse`, `allow`, `husky.sh script`, `name` (+634 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `InviteFlow()` connect `Component Render Tests` to `WhatsApp Invite Flow`, `waLink.ts`?**
  _High betweenness centrality (0.205) - this node is a cross-community bridge._
- **Why does `normalisePhone helper` connect `waLink.ts` to `Component Render Tests`?**
  _High betweenness centrality (0.204) - this node is a cross-community bridge._
- **Why does `buildWaLink()` connect `waLink.ts` to `whatsappService.ts`?**
  _High betweenness centrality (0.204) - this node is a cross-community bridge._
- **What connects `Caveman compress scripts.  This package provides tools to compress natural langu`, `Heuristic denylist for files that must never be shipped to a third-party API.`, `Strip outer ```markdown ... ``` fence when it wraps the entire output.` to the rest of the system?**
  _648 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Children Page & Forms` be split into smaller, more focused modules?**
  _Cohesion score 0.04421768707482993 - nodes in this community are weakly interconnected._
- **Should `Backend Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.043478260869565216 - nodes in this community are weakly interconnected._
- **Should `Skill Lock & Hashing` be split into smaller, more focused modules?**
  _Cohesion score 0.05263157894736842 - nodes in this community are weakly interconnected._