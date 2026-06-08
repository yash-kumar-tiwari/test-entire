# Entire Checkpoint Session Record

Checking Entire checkpoint and session recording for this repository.

## Record a Session

Follow these steps to create a recorded Cursor session with checkpoints:

1. **Confirm setup** (one time per repo):

   ```powershell
   entire enable
   entire agent add cursor    # skip if already added
   entire status              # should show Enabled · Cursor
   ```

2. **Restart Cursor** so `.cursor/hooks.json` loads.

3. **Start a chat** in this repo (Agent mode). This triggers `session-start` and begins recording.

4. **Make a small change** with the agent (for example, edit this README).

5. **Commit the change** — this repo uses `manual-commit` mode, so checkpoints are created when you commit during an active session:

   ```powershell
   git add .
   git commit -m "test session recording"
   ```

6. **End the chat** or close Cursor to trigger `session-end`.

## Check Recording

After steps above, run this checklist:

| Step | Command | What you should see |
|------|---------|---------------------|
| 1 | `entire status` | `● Enabled` with `Cursor` under Agents |
| 2 | `entire session current` | Active session while chat is open; ended after close |
| 3 | `entire session list` | At least one session (active or ended) |
| 4 | `entire checkpoint list` | Checkpoint(s) linked to your commit |
| 5 | `entire activity` | Recent throughput / contribution data |
| 6 | `entire doctor` | No stuck or orphaned sessions |

**One-liner check:**

```powershell
entire status; entire session current; entire session list; entire checkpoint list
```

**Inspect a specific checkpoint:**

```powershell
entire checkpoint explain <checkpoint-id-or-commit-sha>
entire session info <session-id>
```

**Watch hooks in real time** (while a Cursor chat is running):

```powershell
Get-Content .entire\logs\entire.log -Wait -Tail 20
```

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

### Troubleshooting

| Symptom | Fix |
|---------|-----|
| `No sessions` before any chat | Expected — start a Cursor chat in this repo first |
| Session listed but no checkpoints | Commit during the session (`manual-commit` mode) |
| Hooks not firing | Restart Cursor; confirm `entire agent list` shows Cursor |
| Stuck session | `entire doctor` then `entire session stop` if needed |

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
