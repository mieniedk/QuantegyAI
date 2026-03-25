# Disaster Recovery Runbook

This runbook documents backup and restore steps for Allen Ace LMS.

## Backup cadence

- **Daily:** application data backup
- **Weekly:** restore verification in staging
- **Before major deploys:** on-demand backup

## What is backed up

- `server/data` (SQLite database and persisted server data)
- `uploads` (user-uploaded media/files)
- `.env` (for configuration recovery)

## Create a backup

From project root:

```bash
npm run backup:data
```

Output:

- `backups/<timestamp>/server-data`
- `backups/<timestamp>/uploads`
- `backups/<timestamp>/.env.backup`
- `backups/<timestamp>/manifest.json`

## Restore from backup

1. Stop server processes
2. Run restore command:

```bash
npm run restore:data -- backups/<timestamp>
```

3. Restart server:

```bash
npm run server
```

4. Run restore verification:

```bash
npm run restore:verify
```

Optional environment variables:

- `RESTORE_VERIFY_ONLINE=1` to include API checks (default on)
- `RESTORE_VERIFY_BASE_URL=http://localhost:3001`

## Recovery objectives

- **RTO target:** 60 minutes
- **RPO target:** 24 hours (or less with on-demand backups)

## Quarterly drill checklist

- [ ] Restore latest backup in staging
- [ ] Validate login, class load, submissions, gradebook, and file access
- [ ] Run `npm run restore:verify` and record output
- [ ] Verify SLO metrics and audit logs are still available
- [ ] Record drill outcome and remediation actions

