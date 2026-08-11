

# Svelte Frontend Implementation Prompt — Minimal Encrypted Vault Notes App

You are building the frontend of a **minimal, local-first, privacy-focused desktop notes application** using **Svelte 5 + TypeScript + Tauri 2 + Flowbite Svelte**.

The application is a desktop notes app where users create encrypted vaults. A vault is a portable local file that contains the user's notes. The vault is protected by a password and all cryptographic operations are handled by the Rust/Tauri backend.

Your responsibility is to build **the complete Svelte application layer**, including:

* UI
* application state
* navigation
* note management UX
* vault management UX
* search
* keyboard shortcuts
* dialogs
* command palette
* settings
* loading/error states
* empty states
* autosave UX
* communication with Rust through Tauri commands
* frontend validation
* optimistic UI where appropriate
* accessibility
* responsive desktop layouts
* polished interactions
* visual consistency

Do not build a static mockup. Build an actual functional application frontend.

---

# 1. Product Philosophy

The application should feel like a **serious native desktop notes application**, not a website wrapped inside Tauri.

The design should be:

* minimal
* fast
* calm
* distraction-free
* keyboard-first
* privacy-focused
* highly usable
* visually restrained
* professional
* native-feeling

Avoid:

* unnecessary gradients
* excessive rounded cards
* excessive shadows
* excessive animations
* huge hero sections
* marketing-style UI
* unnecessary illustrations
* excessive colors
* cluttered dashboards
* unnecessary navigation
* web-app-looking layouts

The application should feel closer to a combination of:

* a lightweight text editor
* a minimal knowledge-management application
* a native macOS/Windows notes application

than a traditional SaaS dashboard.

The user should be able to open the application and immediately write.

---

# 2. Technology Requirements

Use:

* Svelte 5
* TypeScript
* Tauri 2
* Flowbite Svelte
* Tailwind CSS
* Tauri JavaScript APIs
* Svelte's native state/reactivity mechanisms

Do not introduce unnecessary frontend dependencies.

Prefer Svelte 5 runes and modern Svelte patterns.

Do not use React.

Do not create a separate frontend backend.

Rust/Tauri is the backend authority.

---

# 3. Responsibility Boundary

The architecture must have a strict separation.

## Svelte owns

Svelte is responsible for:

* rendering
* UI state
* interaction state
* navigation
* selected note
* selected vault
* search state
* editor state
* dialogs
* menus
* keyboard shortcuts
* command palette
* frontend validation
* visual feedback
* loading indicators
* save status
* error presentation
* confirmation flows
* accessibility
* invoking Tauri commands

## Rust owns

Rust is responsible for:

* vault creation
* vault opening
* vault unlocking
* password verification
* Argon2id
* AES-256-GCM
* encryption keys
* vault serialization
* compression
* SQLite/database access
* filesystem access
* atomic writes
* vault locking
* secure memory handling
* cryptographic errors

Never implement cryptography in Svelte/JavaScript.

Never expose the encryption key to Svelte.

Never store the user's vault password in persistent frontend state.

The frontend should only pass the password to the appropriate Tauri command when required.

---

# 4. Application Mental Model

The application has four major states.

## State 1 — No vault

The user has not opened or created a vault.

Show:

```text
Welcome

Your notes belong to you.

Create a vault or open an existing vault.

[ Create Vault ]
[ Open Vault ]
```

Keep this screen extremely minimal.

---

## State 2 — Vault locked

A vault exists but has not been unlocked.

Show:

```text
Personal Vault

This vault is encrypted.

Password
[                    ]

[ Unlock ]

Forgot password?
```

Do not imply that the application can recover a forgotten password.

If the password is wrong, clearly communicate:

```text
Incorrect password.
```

Do not reveal unnecessary cryptographic implementation details.

---

## State 3 — Vault unlocked

This is the primary application.

Layout:

```text
┌──────────────────────────────────────────────────────────┐
│ Vault name                          Search   •••   🔒     │
├──────────────┬───────────────────────────────────────────┤
│              │                                           │
│ Search       │                                           │
│              │             Note editor                   │
│ Today        │                                           │
│ Yesterday    │                                           │
│              │                                           │
│ Notes        │                                           │
│              │                                           │
│ + New Note   │                                           │
│              │                                           │
│              │                                           │
│              │                                           │
│              │                                           │
│              │                                           │
│              │                                           │
└──────────────┴───────────────────────────────────────────┘
```

---

## State 4 — Vault operation in progress

For operations such as:

* creating vault
* opening vault
* unlocking
* saving
* changing password
* closing vault

show appropriate loading states.

Never leave the interface apparently frozen.

---

# 5. Project Structure

Create a clean structure similar to:

```text
src/
├── lib/
│   ├── components/
│   │   ├── app/
│   │   ├── vault/
│   │   ├── notes/
│   │   ├── editor/
│   │   ├── search/
│   │   ├── dialogs/
│   │   └── common/
│   │
│   ├── stores/
│   │   ├── app.svelte.ts
│   │   ├── vault.svelte.ts
│   │   ├── notes.svelte.ts
│   │   └── ui.svelte.ts
│   │
│   ├── tauri/
│   │   ├── commands.ts
│   │   ├── vault.ts
│   │   └── notes.ts
│   │
│   ├── types/
│   │   ├── vault.ts
│   │   ├── note.ts
│   │   └── app.ts
│   │
│   ├── utils/
│   │   ├── keyboard.ts
│   │   ├── dates.ts
│   │   └── search.ts
│   │
│   └── config/
│       └── shortcuts.ts
│
├── routes/
│
├── App.svelte
└── app.css
```

Adapt the structure if the existing repository has a better organization, but preserve the separation of concerns.

Do not create huge monolithic Svelte components.

---

# 6. Tauri Communication Layer

Create a dedicated abstraction around Tauri commands.

Do not scatter raw:

```ts
invoke(...)
```

calls throughout components.

Instead create a clean API layer.

For example:

```ts
vault.create(...)
vault.open(...)
vault.unlock(...)
vault.lock(...)
vault.close(...)
vault.changePassword(...)
```

and:

```ts
notes.list(...)
notes.get(...)
notes.create(...)
notes.update(...)
notes.delete(...)
notes.search(...)
```

The exact command names should match the existing Rust backend if they already exist.

If the Rust commands do not exist yet, create TypeScript interfaces/types for them and clearly isolate the expected command contract.

Do not fake backend functionality permanently.

---

# 7. TypeScript Types

Create strongly typed interfaces.

For example:

```ts
interface Vault {
    id: string;
    name: string;
    path: string;
    locked: boolean;
}
```

A note should contain appropriate fields such as:

```ts
interface Note {
    id: string;
    title: string;
    content: string;
    createdAt: string;
    updatedAt: string;
}
```

You may extend these types if necessary.

Do not use `any` unless there is a genuine unavoidable reason.

Tauri responses should be typed.

Errors should also be normalized into typed frontend errors where practical.

---

# 8. Global Application State

Use Svelte 5 state rather than introducing Redux or another state management library.

Create clear application state.

For example:

```text
App State
├── currentScreen
├── isInitializing
├── isLoading
├── error
│
├── Vault State
│   ├── currentVault
│   ├── isUnlocked
│   └── isUnlocking
│
├── Notes State
│   ├── notes
│   ├── activeNoteId
│   ├── isSaving
│   ├── lastSavedAt
│   └── dirty
│
└── UI State
    ├── sidebarOpen
    ├── searchOpen
    ├── commandPaletteOpen
    ├── settingsOpen
    └── activeDialog
```

Keep state ownership obvious.

Do not duplicate the same state in multiple components.

---

# 9. Vault Creation UI

Build a polished vault creation flow.

Flow:

```text
Create Vault
    ↓
Choose vault location
    ↓
Enter vault name
    ↓
Create password
    ↓
Confirm password
    ↓
Create
    ↓
Open vault
```

The creation screen should explain briefly:

> Your vault is encrypted with your password. The application cannot recover a forgotten password.

Password requirements should be presented without unnecessary complexity.

Include:

* password visibility toggle
* password confirmation
* validation
* password mismatch error
* loading state
* cancel action

Do not make the user navigate through unnecessary multi-page onboarding.

---

# 10. Open Vault

Provide a native file picker through Tauri.

The user should be able to select:

```text
*.vault
```

or the appropriate vault extension.

The UI should clearly distinguish:

```text
Create new vault
```

from:

```text
Open existing vault
```

If opening fails:

```text
Unable to open vault.
```

Provide a useful secondary explanation if the backend provides one.

Do not expose stack traces to the user.

---

# 11. Unlock Screen

The unlock screen should be extremely focused.

Center the vault identity.

Example:

```text
[lock icon]

Personal

Encrypted vault

Password

[ ••••••••••••••• ] [show]

[ Unlock ]

Open another vault
```

Pressing Enter should submit the form.

After a failed unlock:

* preserve the UI
* clear the password
* focus the password field
* show the error

Do not repeatedly submit automatically.

---

# 12. Main Application Layout

Once unlocked, use a three-level visual hierarchy:

```text
Application shell
    ├── Top bar
    ├── Sidebar
    └── Editor
```

The sidebar should contain:

```text
Search

Notes
Today
Yesterday
Earlier

+ New Note
```

You can later support folders/tags, but don't make them dominate V1.

The editor should dominate the screen.

---

# 13. Note List

Each note item should show:

```text
Title
Small preview
Last updated
```

Example:

```text
Coffee sourcing
Need to contact...
2 minutes ago
```

Avoid showing excessive metadata.

Active note should have a subtle visual distinction.

Clicking a note opens it.

Keyboard navigation should eventually allow moving between notes.

---

# 14. New Note

`New Note` should immediately create a note and focus the editor.

Do not make the user fill out a form before entering the note.

Flow:

```text
+ New Note
    ↓
Create note
    ↓
Focus title/content
```

The title should be editable immediately.

If title is empty, derive a display title from content where appropriate, such as:

```text
Untitled
```

Do not persist meaningless generated titles unless required.

---

# 15. Editor

The editor is the most important part of the application.

It should feel excellent.

Prioritize:

* fast typing
* no visual distractions
* good typography
* correct cursor behavior
* keyboard shortcuts
* autosave
* predictable focus
* minimal toolbar

Do not create a huge rich-text editor toolbar unless explicitly required.

Start with a clean text/Markdown-oriented editor.

Potential layout:

```text
Title

Last edited 12 seconds ago

────────────────────────────

Content...
```

The title should be visually distinct.

The content area should occupy most of the viewport.

---

# 16. Autosave

The frontend should maintain a dirty state.

Example:

```text
User types
   ↓
dirty = true
   ↓
debounce
   ↓
invoke Rust update_note()
   ↓
dirty = false
   ↓
saved
```

Use a sensible debounce, such as around 500–1000 ms, rather than saving every keystroke.

Show subtle save status:

```text
Saving...
Saved
```

Do not make saving status visually distracting.

If saving fails:

```text
Unable to save changes.
Retry
```

Do not silently lose user input.

The editor should preserve unsaved local state while a save operation is failing.

---

# 17. Prevent Data Loss

When:

* closing the vault
* quitting the application
* switching vaults
* deleting a note

ensure pending saves are flushed before the operation where appropriate.

If the application cannot safely complete a save, warn the user rather than silently discarding changes.

---

# 18. Search

Implement fast local search.

Search should search the currently unlocked vault.

Search:

* note titles
* note content

Search UI:

```text
Search notes...

⌘ K
```

or:

```text
Ctrl K
```

depending on platform.

Results should update quickly.

Example:

```text
Search: coffee

Coffee suppliers
Supplier in Chikmagalur...

Coffee pricing
Current green bean...

Coffee notes
...
```

Highlight matching terms where practical.

Do not send note content to an external service.

Search is entirely local.

---

# 19. Command Palette

Implement a command palette.

Keyboard shortcut:

```text
Cmd/Ctrl + K
```

Commands:

```text
New Note
Search Notes
Open Vault
Lock Vault
Close Vault
Settings
Change Password
Delete Note
Toggle Sidebar
```

The command palette should be keyboard-first.

Example:

```text
┌─────────────────────────────────────┐
│ Search commands...                  │
├─────────────────────────────────────┤
│ New Note                       ⌘ N  │
│ Search Notes                   ⌘ K  │
│ Lock Vault                    ⌘ L  │
│ Settings                      ⌘ ,  │
└─────────────────────────────────────┘
```

Use Flowbite Svelte components where appropriate, but do not force Flowbite components where custom styling would produce a significantly better editor experience.

---

# 20. Keyboard Shortcuts

Implement a centralized shortcut system.

At minimum:

```text
Cmd/Ctrl + N       New note
Cmd/Ctrl + K       Command palette / search
Cmd/Ctrl + S       Save
Cmd/Ctrl + Shift + L   Lock vault
Cmd/Ctrl + ,       Settings
Escape             Close modal/palette
```

Adapt modifier behavior appropriately between macOS and Windows/Linux.

Do not hardcode platform assumptions everywhere.

Create a shortcut utility.

---

# 21. Lock Vault

The user should be able to immediately lock the vault.

Locking should:

1. flush pending saves
2. call the Rust lock operation
3. clear frontend note data
4. clear active note
5. clear search data
6. transition to the locked screen

Never leave note contents visible after the vault is locked.

The frontend should treat locking as a security boundary.

---

# 22. Close Vault

Closing a vault is different from simply locking it.

When closing:

```text
save
↓
Rust closes vault
↓
clear frontend state
↓
return to vault selection
```

Ensure sensitive note content is removed from Svelte state.

---

# 23. Change Password

Provide:

```text
Current password
New password
Confirm new password
```

The frontend should only validate input.

Rust performs the actual cryptographic password change.

Explain:

> Changing your password re-encrypts the vault with the new password.

If the operation fails, preserve a clear error state.

---

# 24. Delete Note

Deleting a note is destructive.

Use a Flowbite confirmation modal.

Example:

```text
Delete note?

"Coffee sourcing"

This action cannot be undone.

[ Cancel ] [ Delete ]
```

Do not accidentally delete on a single click.

Support keyboard confirmation carefully.

---

# 25. Settings

Keep settings minimal.

Possible sections:

```text
Settings

Appearance
    Theme
        System
        Light
        Dark

Editor
    Font size
    Line height
    Word wrap

Vault
    Change password
    Vault location

Application
    Keyboard shortcuts
    About
```

Do not build unnecessary preferences in V1.

---

# 26. Flowbite Svelte

Use Flowbite Svelte for standard UI primitives.

Good candidates:

* Button
* Input
* Modal
* Dropdown
* Tooltip
* Toast
* Badge
* Spinner
* Tabs where appropriate
* Checkbox
* Toggle
* Select
* Navbar if appropriate

However:

**Do not blindly use Flowbite for everything.**

The editor, note list, application shell, and certain navigation elements should feel custom and native.

Use Flowbite for consistency and accessibility where it makes sense.

Override styles where required.

Avoid making the application look like a generic Flowbite dashboard.

---

# 27. Design System

Create a small design system.

Define consistent:

* spacing
* typography
* borders
* radii
* shadows
* colors
* focus states
* hover states
* disabled states

Use Tailwind utilities.

Avoid arbitrary values everywhere.

The application should have a coherent visual language.

---

# 28. Dark Mode

Support:

```text
System
Light
Dark
```

The default should follow the operating system.

Dark mode should not simply invert colors.

Ensure:

* editor readability
* sidebar contrast
* modal readability
* input visibility
* selection visibility
* focus states
* disabled controls

are all correct.

---

# 29. Accessibility

Treat accessibility as a first-class requirement.

Implement:

* keyboard navigation
* visible focus states
* semantic buttons
* proper labels
* aria attributes where required
* logical tab order
* accessible dialogs
* escape-to-close
* accessible error messages

The entire application should be usable without a mouse.

---

# 30. Loading States

Every asynchronous operation should have an appropriate state.

For example:

```text
Creating vault...
Opening vault...
Unlocking...
Saving...
Changing password...
```

Avoid showing spinners for tiny operations.

Prefer subtle indicators.

For longer operations, disable only the controls that could conflict with the operation.

Do not freeze the entire application unnecessarily.

---

# 31. Error Handling

Create a centralized frontend error handling strategy.

Normalize backend errors into user-friendly messages.

For example:

```text
INVALID_PASSWORD
    → Incorrect password.

VAULT_CORRUPTED
    → This vault appears to be corrupted.

VAULT_NOT_FOUND
    → The vault could not be found.

SAVE_FAILED
    → Unable to save your changes.

UNKNOWN_ERROR
    → Something went wrong. Please try again.
```

Never show raw Rust stack traces.

Log useful debugging information only where appropriate.

Do not log:

* passwords
* encryption keys
* note contents
* decrypted vault data

---

# 32. Empty States

Every major empty state should be intentionally designed.

No notes:

```text
No notes yet.

Create your first note.

[ New Note ]
```

No search results:

```text
No notes found.

Try a different search.
```

No vault:

```text
No vault open.

[ Create Vault ]
[ Open Vault ]
```

Do not leave blank white/empty screens.

---

# 33. Responsive Behavior

This is a desktop application, but support different desktop window sizes.

At minimum:

* small laptop window
* standard desktop
* large monitor

The sidebar should be resizable or have a sensible fixed width.

The editor should always get the majority of available space.

Avoid horizontal scrolling in the primary UI.

---

# 34. Window Behavior

Because this is Tauri, account for native desktop behavior.

The application should feel correct when:

* resized
* minimized
* reopened
* moved between monitors
* placed in dark mode
* closed while a vault is unlocked

If the backend exposes appropriate Tauri lifecycle events, use them.

Do not implement unsafe assumptions around application shutdown.

---

# 35. Security Rules for Frontend

Absolutely never:

```text
localStorage.setItem("password", ...)
```

Never:

```text
localStorage.setItem("encryptionKey", ...)
```

Never persist:

* vault password
* encryption key
* decrypted vault contents

Do not send note contents anywhere except the local Rust backend.

No:

* analytics
* telemetry
* tracking
* remote API
* cloud sync

unless explicitly added later.

The frontend should assume the application is completely local.

---

# 36. Vault Metadata

The frontend may display:

```text
Vault name
Vault location
Number of notes
Last modified
```

but only use information actually returned by Rust.

Do not attempt to inspect encrypted vault contents directly from Svelte.

---

# 37. Component Design

Create small, reusable components.

Examples:

```text
<AppShell />

<VaultSelector />

<CreateVaultDialog />

<UnlockVault />

<Sidebar />

<NoteList />

<NoteListItem />

<NoteEditor />

<EditorHeader />

<SearchDialog />

<CommandPalette />

<SettingsDialog />

<ChangePasswordDialog />

<DeleteNoteDialog />

<SaveStatus />

<ErrorToast />
```

Components should have clear responsibilities.

Avoid:

```text
App.svelte
```

containing the entire application.

---

# 38. Do Not Overbuild

This is intentionally a **minimal notes application**.

Do not add:

* accounts
* authentication servers
* cloud sync
* social features
* AI
* collaboration
* sharing
* comments
* notifications
* unnecessary dashboards
* complex workspace systems

Build the core experience extremely well.

The application should be able to be understood by a new developer quickly.

---

# 39. Performance

The application should feel instantaneous.

Prioritize:

* fast startup
* fast note switching
* local search
* minimal re-renders
* debounced saves
* no unnecessary network requests
* no large frontend dependencies
* no unnecessary state updates

Do not optimize prematurely.

Prefer simple architecture first.

---

# 40. Frontend Security Boundary

Remember:

```text
Svelte
    ↓
Tauri command
    ↓
Rust
    ↓
Vault
```

Svelte does not own the vault.

Svelte presents the vault.

Rust owns the vault.

The frontend should therefore remain replaceable.

Someone should theoretically be able to replace:

```text
Svelte
```

with:

```text
React
```

without changing the cryptographic/storage architecture.

This is an important architectural principle.

---

# 41. UX Principle

The primary action should always be obvious.

When the vault is unlocked:

**writing a note should be one click or one keyboard shortcut away.**

The application should not make the user navigate through:

```text
Workspace
→ Projects
→ Documents
→ Notes
→ New
```

Instead:

```text
Cmd/Ctrl + N
```

should get the user writing immediately.

---

# 42. Visual Hierarchy

The editor is the product.

The UI hierarchy should therefore be:

```text
1. Note content
2. Note title
3. Note navigation
4. Vault controls
5. Settings
```

Do not allow sidebar controls or application chrome to visually dominate the writing experience.

---

# 43. Animation

Use animation sparingly.

Good:

* modal appearing
* sidebar opening
* toast appearing
* subtle hover transitions

Bad:

* animated editor
* excessive page transitions
* bouncing buttons
* animated backgrounds
* decorative animations

The application should feel fast rather than animated.

---

# 44. Initial Implementation Order

Build in this order:

### Phase 1

Application shell:

```text
App
Sidebar
Editor
Top bar
```

### Phase 2

Vault lifecycle:

```text
Create vault
Open vault
Unlock vault
Lock vault
Close vault
```

### Phase 3

Notes:

```text
List notes
Create note
Open note
Edit note
Save note
Delete note
```

### Phase 4

Search:

```text
Search
Filtering
Results
Keyboard shortcut
```

### Phase 5

Command palette:

```text
Commands
Keyboard navigation
Actions
```

### Phase 6

Settings:

```text
Theme
Editor preferences
Password change
Vault information
```

### Phase 7

Polish:

```text
Loading states
Errors
Animations
Accessibility
Keyboard shortcuts
Empty states
```

---

# 45. Do Not Fake Functionality

If the Rust backend does not yet provide a required command:

Do not create fake persistence such as:

```ts
const fakeNotes = [...]
```

and pretend the feature works.

Instead:

1. define the frontend contract
2. clearly isolate the missing backend command
3. make the UI ready for the real command
4. document what the Rust backend needs to expose

The final application must use the actual encrypted vault backend.

---

# 46. Final UX Target

When everything is complete, the user experience should be approximately:

```text
Launch app
    ↓
Select vault
    ↓
Enter password
    ↓
Vault opens
    ↓
Notes immediately visible
    ↓
Cmd/Ctrl + N
    ↓
Start typing
    ↓
Autosave
    ↓
Cmd/Ctrl + K
    ↓
Search
    ↓
Cmd/Ctrl + Shift + L
    ↓
Vault locks
```

There should be almost no friction.

The application should feel like a **small, fast, private native notebook**, not an enterprise application.

---

# 47. Definition of Done

The frontend is complete when:

* [ ] Svelte 5 is used correctly
* [ ] TypeScript is used throughout
* [ ] Flowbite Svelte is integrated
* [ ] Tailwind is configured
* [ ] Tauri communication is isolated
* [ ] Vault creation UI works
* [ ] Vault opening UI works
* [ ] Vault unlocking UI works
* [ ] Vault locking UI works
* [ ] Vault closing UI works
* [ ] Notes can be created
* [ ] Notes can be edited
* [ ] Notes can be deleted
* [ ] Notes autosave
* [ ] Save state is visible
* [ ] Search works locally
* [ ] Command palette works
* [ ] Keyboard shortcuts work
* [ ] Settings work
* [ ] Password change flow exists
* [ ] Errors are handled gracefully
* [ ] Empty states exist
* [ ] Loading states exist
* [ ] Dark/light/system themes work
* [ ] UI is keyboard accessible
* [ ] Sensitive information is never persisted in browser storage
* [ ] Encryption keys never enter Svelte state
* [ ] Passwords are never persisted
* [ ] No external network dependency exists
* [ ] No fake backend functionality remains
* [ ] The application feels like a native desktop application
* [ ] The editor is the visual center of the product

Most importantly:

**Do not sacrifice the simplicity of the product in pursuit of features.**

The goal is not to build another Notion.

The goal is to build an extremely good **private local notes application where the vault is a portable encrypted file owned by the user.**
