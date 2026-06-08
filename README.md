# Entire Checkpoint Session Record

Checking Entire checkpoint and session recording for this repository.

## Cursor Session Recording

Cursor is configured via `.cursor/hooks.json` to track sessions and create checkpoints through Entire. Hooks fire on session start/end, prompt submit, compaction, and agent stop events.

After using Cursor in this repo, verify that sessions and checkpoints are updating:

```powershell
# Confirm Entire is enabled
entire status

# List sessions — should show Cursor sessions after you chat or edit
entire session list

# List checkpoints — should grow as commits are recorded during a session
entire checkpoint list

# View recent activity and throughput
entire activity

# Run diagnostics if sessions look stuck
entire doctor

# Inspect hook activity in the log
type .entire\logs\entire.log
```

### Quick check (Cursor)

```powershell
entire status && entire session list && entire checkpoint list
```

Expected behavior:

- **Session updates** — `entire session list` shows a new or active session after you start a Cursor chat in this repo.
- **Checkpoint updates** — `entire checkpoint list` shows new checkpoints when Entire records commits during that session.

If sessions or checkpoints do not appear, restart Cursor so hooks reload, then run `entire doctor`.

## Verify Session Recording (OpenCode)

Run these commands to check that OpenCode sessions are being recorded:

```bash
# Check entire status
entire status

# List active sessions
entire session list

# View recorded checkpoints
entire checkpoint list

# Check activity overview
entire activity

# Run diagnostic checks
entire doctor

# View local log file
type .entire\logs\entire.log
```

## Session Recording Active

Session recording via Entire is configured for both **Cursor** (`.cursor/hooks.json`) and **OpenCode** (`.opencode/plugins/entire.ts`). After restarting your editor, sessions and checkpoints will appear automatically. Verify with:

```powershell
entire session list        # Shows active/idle/ended sessions
entire checkpoint list     # Shows checkpoints per commit
entire activity            # Shows throughput and contribution data
entire doctor              # Confirms no stuck sessions
```
