# Entire Checkpoint Session Record

Checking entire checkpoint session record for this repository.

## Verify Session Recording

Run these commands to check that sessions are being recorded:

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

## Quick Check

```bash
entire status && entire session list && entire checkpoint list
```

## Session Recording Active

Session recording via Entire is configured. After restarting OpenCode, sessions and checkpoints will appear automatically. Verify with:

```powershell
entire session list        # Shows active/idle/ended sessions
entire checkpoint list     # Shows checkpoints per commit
entire activity            # Shows throughput and contribution data
entire doctor              # Confirms no stuck sessions
```
