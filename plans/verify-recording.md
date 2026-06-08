# Verify Session Recording Plan

Use this plan to confirm that Entire is tracking sessions and creating checkpoints.

## Prerequisites

- [ ] Entire CLI 0.7.5+ installed (`entire version`)
- [ ] Entire enabled in repo (`entire status` shows enabled)
- [ ] OpenCode agent integration active (`entire agent list`)

## Check Recording

1. **Run a session** — Start an OpenCode session and make some changes
2. **Check sessions** — `entire session list` should show active session(s)
3. **Check checkpoints** — `entire checkpoint list` shows recorded checkpoints
4. **Check activity** — `entire activity` shows throughput and contribution data
5. **Check logs** — View `entire.log` in `.entire\logs\` for hook activity
6. **Diagnostics** — `entire doctor` confirms no stuck sessions

## Verify Mid-Session

While a session is active:

```powershell
entire session list        # Should show "1 session"
entire checkpoint list     # Shows checkpoints so far
entire status              # Shows active session
```

## Troubleshooting

| Symptom | Check |
|---------|-------|
| No sessions listed | Run an OpenCode session first |
| No checkpoints | Make changes during the session |
| Plugin not firing | Check `.opencode/plugins/entire.ts` exists |
| Hooks not running | Run `entire doctor` |
