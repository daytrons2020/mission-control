# Respiratory Tools - Admin Guide

## System Administration

### Initial Setup

#### 1. Install Dependencies
```bash
cd respiratory-tools
npm install
```

#### 2. Initialize Excel Workbooks
```bash
npm run init-workbooks
```

This creates:
- `Master_Schedule.xlsx`
- `Inventory_Master.xlsx`

#### 3. Configure Staff Roster

Edit `Master_Schedule.xlsx` → `Staff_Roster` sheet:

| Staff ID | Name | Role | FTE | Hire Date | Email |
|----------|------|------|-----|-----------|-------|
| RT001 | John Smith | RT | 1.0 | 2020-01-15 | jsmith@hospital.org |
| RT002 | Jane Doe | RRT | 0.8 | 2019-06-01 | jdoe@hospital.org |

#### 4. Configure Shift Templates

Edit `Master_Schedule.xlsx` → `Shift_Templates` sheet:

| Shift Type | Start Time | End Time | Duration | Staff Needed |
|------------|------------|----------|----------|--------------|
| day | 07:00 | 15:30 | 8.5 | 5 |
| evening | 15:00 | 23:30 | 8.5 | 4 |
| night | 23:00 | 07:30 | 8.5 | 3 |

#### 5. Configure Inventory Items

Edit `Inventory_Master.xlsx` → `Item_Master` sheet:

| Lawson Number | Name | Category | Par Level | Unit | Location |
|---------------|------|----------|-----------|------|----------|
| 12345678 | Nebulizer Tubing | Respiratory | 50 | each | RT-STOR-01 |

#### 6. Generate QR Codes
```bash
npm run generate-qr
```

Print and attach QR codes to inventory items.

---

## Auto-Balancer Configuration

### Constraint Weights

Edit `src/balancer/config.ts` to adjust priorities:

```typescript
export const balancerConfig = {
  weights: {
    PREFERENCE_MATCH: 15,        // How much to value staff preferences
    FAIR_WEEKEND: 10,            // Weekend distribution fairness
    FAIR_NIGHTS: 8,              // Night shift distribution
    NEEDS_HOURS: 12,             // Prioritize understaffed employees
    CONSECUTIVE_NIGHT_PENALTY: -20,  // Discourage back-to-back nights
    SHORT_REST_PENALTY: -15,     // Minimum rest between shifts
    OVERTIME_PENALTY: -25,       // Avoid overtime
  }
};
```

### Hard Constraints (Always Enforced)
- Minimum staffing levels
- No double-booking
- Respect unavailable dates
- FTE compliance
- Credential requirements

### Soft Constraints (Optimized)
- Staff preferences
- Fair weekend distribution
- Even undesirable shift distribution
- Minimize consecutive nights

---

## Sync Configuration

### File-Based Sync (Default)

1. Create shared network folder: `\\server\Respiratory_Tools\Sync`
2. Configure mobile devices to sync to this folder
3. Admin app monitors folder for new submissions

### Cloud Sync (Optional)

Configure OneDrive/Google Drive:
```typescript
// src/sync/cloud-config.ts
export const cloudConfig = {
  provider: 'onedrive', // or 'gdrive'
  syncFolder: '/Respiratory_Tools/Sync',
  autoSync: true,
  syncInterval: 300 // seconds
};
```

---

## Backup and Recovery

### Automated Backups

Set up daily backups:
```bash
# Add to crontab (Linux/Mac) or Task Scheduler (Windows)
0 2 * * * cp -r Respiratory_Tools Backups/Respiratory_Tools_$(date +\%Y\%m\%d)
```

### Manual Backup

Before major changes:
1. Copy entire `Respiratory_Tools/` folder
2. Name with date: `Respiratory_Tools_2024-02-23/`
3. Store on network drive

### Recovery

1. Close all apps
2. Rename corrupted folder
3. Copy backup to original location
4. Restart apps

---

## Security

### Data Protection
- No PHI stored in system
- Staff identified by ID only in mobile app
- Excel files encrypted at rest (BitLocker/FileVault)
- Network shares use domain authentication

### Access Control

| Role | Permissions |
|------|-------------|
| Staff | View own schedule, submit availability, scan inventory |
| Lead | + View team schedules, approve swaps |
| Manager | + Generate schedules, edit roster, full inventory access |
| Admin | + System configuration, backups, user management |

### Audit Logging

All actions logged to `Audit_Log.xlsx`:
- Schedule changes
- Inventory scans
- Sync operations
- Login/logout events

---

## Troubleshooting

### Excel File Locked
1. Close all Excel instances
2. Check for background processes
3. Restart admin app

### Sync Failures
1. Check network connectivity
2. Verify folder permissions
3. Review sync log: `sync/last_sync.json`
4. Try manual sync

### Auto-Balancer Issues
1. Check all availability submitted
2. Verify shift templates
3. Review constraint weights
4. Check for impossible constraints

### Mobile App Issues
1. Clear browser cache
2. Re-install PWA
3. Check localStorage quota
4. Verify sync folder access

---

## Maintenance

### Weekly Tasks
- Review and approve time-off requests
- Generate next week's schedule
- Review low inventory alerts
- Process order queue

### Monthly Tasks
- Review staffing analytics
- Adjust auto-balancer weights if needed
- Archive old scan records
- Update staff roster

### Quarterly Tasks
- Full system backup
- Review security settings
- Update QR code labels
- Staff training refresh

---

## Customization

### Adding Custom Fields

Edit `src/models.ts` to add fields, then regenerate Excel templates.

### Custom Reports

Create new report templates in `templates/reports/`:
```typescript
// Example custom report
export function generateStaffingReport(
  startDate: Date,
  endDate: Date
): StaffingReport {
  // Custom logic
}
```

### Integration with Other Systems

Export formats supported:
- Excel (.xlsx)
- CSV
- JSON
- XML (for Lawson integration)

---

## Support Contacts

- **Technical Issues**: IT Help Desk ext. 4357
- **Training Requests**: respiratory-tools@hospital.org
- **Feature Requests**: Submit via GitHub Issues
- **Emergency Support**: Call on-call admin
