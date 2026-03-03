# Respiratory Department Tools - Design Document

## Overview
This document outlines the architecture and implementation plan for three integrated tools designed for respiratory department operations:
1. **Staff Scheduling App** - Mobile-first availability submission with Excel sync
2. **Auto-Balancer** - Automated shift balancing algorithm
3. **QR Inventory Scanner** - Lawson number integration for purchasing

---

## 1. Tech Stack Selection

### Core Architecture
| Component | Technology | Rationale |
|-----------|------------|-----------|
| **Frontend** | React + TypeScript + PWA | Mobile-first, offline capable, familiar to healthcare IT |
| **Backend** | Node.js + Express | Lightweight, Excel integration libraries available |
| **Database** | SQLite (local) + JSON sync | Zero-config, portable, syncs to Excel |
| **QR Scanning** | html5-qrcode library | Works on all mobile browsers, no app store needed |
| **Excel Integration** | ExcelJS + node-xlsx | Read/write .xlsx files, formula support |
| **Sync** | File-based + optional cloud | USB/OneDrive/Google Drive compatible |

### Why This Stack?
- **Healthcare Environment**: Many hospitals restrict cloud services; file-based sync works within IT policies
- **No App Store Required**: PWA installs directly from browser
- **Excel Native**: Respiratory departments already use Excel; no new software to learn
- **Offline First**: Works without internet, syncs when connected

---

## 2. System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        MOBILE DEVICES                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │  Staff App  │  │  QR Scanner │  │  Shift View/Requests    │  │
│  │  (PWA)      │  │  (PWA)      │  │  (PWA)                  │  │
│  └──────┬──────┘  └──────┬──────┘  └───────────┬─────────────┘  │
└─────────┼────────────────┼─────────────────────┼────────────────┘
          │                │                     │
          ▼                ▼                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SYNC LAYER (File-based)                    │
│         JSON files ↔ Excel files ↔ OneDrive/USB/Google Drive   │
└─────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────┐
│                      CENTRAL WORKSTATION                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │ Master Excel│  │ Auto-Balance│  │  Admin Dashboard        │  │
│  │ Schedule    │  │ Engine      │  │  (Electron/Desktop)     │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Tool 1: Staff Scheduling App

### Features
- **Availability Submission**: Staff select available days/times via calendar UI
- **Time-off Requests**: Submit PTO with approval workflow
- **Shift Preferences**: Rank preferred shifts (day/evening/night/weekend)
- **Real-time View**: See current schedule after sync

### Data Model
```typescript
interface StaffMember {
  id: string;
  name: string;
  role: 'RT' | 'RRT' | 'Lead' | 'Supervisor';
  fte: number; // Full-time equivalent (0.5, 0.75, 1.0)
  credentials: string[];
  hireDate: Date;
}

interface Availability {
  staffId: string;
  weekStarting: Date;
  availability: {
    day: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';
    shifts: ('day' | 'evening' | 'night')[];
    unavailable?: boolean;
  }[];
  submittedAt: Date;
  notes?: string;
}

interface Shift {
  id: string;
  date: Date;
  type: 'day' | 'evening' | 'night';
  startTime: string;
  endTime: string;
  requiredStaff: number;
  assignedStaff: string[]; // staff IDs
  status: 'open' | 'filled' | 'overage';
}
```

### User Flow
```
1. Staff opens PWA on phone
2. Authenticates with PIN/department code
3. Views calendar for upcoming 4 weeks
4. Taps days to mark availability
   - Green = Available
   - Red = Unavailable
   - Yellow = Preferred
5. Submits availability
6. Data syncs to central Excel on next connection
```

---

## 4. Tool 2: Auto-Balancer Algorithm

### Algorithm Design

#### Constraints
- **Hard Constraints** (must satisfy):
  - Minimum staffing levels per shift
  - No double-booking staff
  - Respect unavailable days
  - FTE compliance (don't over/under schedule)

- **Soft Constraints** (optimize for):
  - Staff preferences
  - Fair weekend distribution
  - Even distribution of undesirable shifts
  - Minimize consecutive night shifts

#### Algorithm: Weighted Constraint Satisfaction
```typescript
class ShiftBalancer {
  private staff: StaffMember[];
  private shifts: Shift[];
  private availability: Map<string, Availability>;

  // Scoring weights
  private weights = {
    PREFERENCE_MATCH: 10,
    FAIR_WEEKEND: 8,
    FAIR_NIGHTS: 7,
    CONSECUTIVE_NIGHT_PENALTY: -15,
    OVERTIME_PENALTY: -20,
    UNFILLED_SHIFT_PENALTY: -100
  };

  public balance(): Assignment[] {
    // 1. Generate all valid assignments
    const validAssignments = this.generateValidAssignments();
    
    // 2. Score each assignment
    const scoredAssignments = validAssignments.map(a => ({
      assignment: a,
      score: this.scoreAssignment(a)
    }));
    
    // 3. Use greedy algorithm with backtracking
    return this.greedyOptimize(scoredAssignments);
  }

  private scoreAssignment(assignment: Assignment): number {
    let score = 0;
    
    // Preference match
    if (this.matchesPreference(assignment)) {
      score += this.weights.PREFERENCE_MATCH;
    }
    
    // Weekend fairness check
    const weekendCount = this.getWeekendCount(assignment.staffId);
    if (weekendCount < this.averageWeekends()) {
      score += this.weights.FAIR_WEEKEND;
    }
    
    // Night shift distribution
    const nightCount = this.getNightCount(assignment.staffId);
    if (nightCount > 3 && assignment.shift.type === 'night') {
      score += this.weights.CONSECUTIVE_NIGHT_PENALTY;
    }
    
    return score;
  }

  private greedyOptimize(scored: ScoredAssignment[]): Assignment[] {
    // Sort by score descending
    scored.sort((a, b) => b.score - a.score);
    
    const result: Assignment[] = [];
    const assignedStaff = new Set<string>();
    
    for (const { assignment } of scored) {
      const shiftId = assignment.shiftId;
      const staffId = assignment.staffId;
      
      // Check if staff already assigned to this shift
      if (assignedStaff.has(`${shiftId}-${staffId}`)) continue;
      
      // Check shift capacity
      const currentAssigned = result.filter(a => a.shiftId === shiftId).length;
      const shift = this.shifts.find(s => s.id === shiftId)!;
      
      if (currentAssigned < shift.requiredStaff) {
        result.push(assignment);
        assignedStaff.add(`${shiftId}-${staffId}`);
      }
    }
    
    return result;
  }
}
```

#### Advanced: Genetic Algorithm Option
For larger departments (20+ staff), implement genetic algorithm:
```typescript
class GeneticBalancer {
  populationSize = 100;
  generations = 500;
  mutationRate = 0.1;
  
  evolve(): Assignment[] {
    let population = this.initializePopulation();
    
    for (let gen = 0; gen < this.generations; gen++) {
      const fitness = population.map(p => this.calculateFitness(p));
      const parents = this.selectParents(population, fitness);
      population = this.crossoverAndMutate(parents);
    }
    
    return this.getBest(population);
  }
}
```

---

## 5. Tool 3: QR Inventory Scanner

### QR Code Format
```
Format: RTINV|{LAWSON_NUMBER}|{ITEM_NAME}|{CATEGORY}|{PAR_LEVEL}
Example: RTINV|12345678|Nebulizer Tubing|Respiratory Supplies|50
```

### Scanning Implementation
```typescript
import { Html5Qrcode } from 'html5-qrcode';

class QRScanner {
  private scanner: Html5Qrcode;
  
  async startScanning(elementId: string): Promise<void> {
    this.scanner = new Html5Qrcode(elementId);
    
    await this.scanner.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 250, height: 250 } },
      this.onScanSuccess.bind(this),
      this.onScanFailure.bind(this)
    );
  }
  
  private onScanSuccess(decodedText: string): void {
    const item = this.parseQRCode(decodedText);
    this.addToInventory(item);
  }
  
  private parseQRCode(text: string): InventoryItem {
    const parts = text.split('|');
    return {
      lawsonNumber: parts[1],
      name: parts[2],
      category: parts[3],
      parLevel: parseInt(parts[4]),
      scannedAt: new Date()
    };
  }
}
```

### Inventory Data Model
```typescript
interface InventoryItem {
  lawsonNumber: string;      // Primary key
  name: string;
  category: string;
  parLevel: number;          // Desired stock level
  currentCount: number;      // Actual count
  unitOfMeasure: string;     // 'each', 'box', 'case'
  location: string;          // Storage location
  supplier: string;
  lastOrdered?: Date;
  lastPrice?: number;
}

interface ScanRecord {
  id: string;
  lawsonNumber: string;
  scanType: 'in' | 'out' | 'count';
  quantity: number;
  scannedBy: string;
  scannedAt: Date;
  notes?: string;
}
```

### User Flow
```
1. Open QR Scanner PWA
2. Point camera at item QR code
3. Auto-detect and decode
4. Show item details with options:
   - [+] Add Stock (receiving)
   - [-] Remove Stock (usage)
   - [=] Physical Count
   - [🛒] Add to Order List
5. Data syncs to Excel inventory sheet
```

---

## 6. Excel Integration Strategy

### File Structure
```
Respiratory_Tools/
├── Master_Schedule.xlsx
│   ├── Staff_Roster
│   ├── Availability_Submissions
│   ├── Generated_Schedule
│   └── Shift_Templates
├── Inventory_Master.xlsx
│   ├── Item_Master
│   ├── Scan_Log
│   ├── Order_Queue
│   └── Usage_Analytics
└── Sync/
    ├── pending_submissions.json
    ├── scan_records.json
    └── last_sync.json
```

### ExcelJS Integration
```typescript
import ExcelJS from 'exceljs';

class ExcelSync {
  private workbook: ExcelJS.Workbook;
  
  async loadWorkbook(path: string): Promise<void> {
    this.workbook = new ExcelJS.Workbook();
    await this.workbook.xlsx.readFile(path);
  }
  
  async syncAvailability(submissions: Availability[]): Promise<void> {
    const sheet = this.workbook.getWorksheet('Availability_Submissions');
    
    for (const sub of submissions) {
      sheet.addRow({
        staffId: sub.staffId,
        weekStarting: sub.weekStarting,
        monday: sub.availability.find(a => a.day === 'Mon')?.shifts.join(', '),
        tuesday: sub.availability.find(a => a.day === 'Tue')?.shifts.join(', '),
        // ... etc
        submittedAt: sub.submittedAt,
        notes: sub.notes
      });
    }
    
    await this.workbook.xlsx.writeFile(this.filePath);
  }
  
  async syncInventoryScans(scans: ScanRecord[]): Promise<void> {
    const sheet = this.workbook.getWorksheet('Scan_Log');
    
    for (const scan of scans) {
      sheet.addRow({
        scanId: scan.id,
        lawsonNumber: scan.lawsonNumber,
        scanType: scan.scanType,
        quantity: scan.quantity,
        scannedBy: scan.scannedBy,
        scannedAt: scan.scannedAt,
        notes: scan.notes
      });
    }
    
    // Update current counts in Item_Master
    await this.updateInventoryCounts(scans);
    await this.workbook.xlsx.writeFile(this.filePath);
  }
}
```

### Sync Methodology
```
┌─────────────────────────────────────────────────────────────────┐
│                        SYNC WORKFLOW                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  MOBILE DEVICE                    CENTRAL WORKSTATION          │
│  ┌─────────────┐                  ┌─────────────────────┐      │
│  │ Local JSON  │ ──USB/WiFi/Drive─▶│ Import to Excel     │      │
│  │ (pending)   │                  │ Process submissions │      │
│  └─────────────┘                  │ Run Auto-Balancer   │      │
│         ▲                         │ Update schedules    │      │
│         │                         └──────────┬──────────┘      │
│         │                                    │                  │
│         │                         ┌──────────▼──────────┐      │
│         │                         │ Export updates      │      │
│         │                         │ (JSON/Excel)        │      │
│         │                         └──────────┬──────────┘      │
│         │                                    │                  │
│         └────────────────────────────────────┘                  │
│              Sync back to mobile devices                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 7. Implementation Phases

### Phase 1: Foundation (Week 1-2)
- [ ] Set up project structure
- [ ] Create Excel templates
- [ ] Implement basic PWA shell
- [ ] Build QR scanner prototype

### Phase 2: Scheduling (Week 3-4)
- [ ] Staff availability submission UI
- [ ] Excel sync for availability
- [ ] Basic shift assignment view

### Phase 3: Auto-Balancer (Week 5-6)
- [ ] Implement scoring algorithm
- [ ] Build admin dashboard
- [ ] Generate schedule to Excel

### Phase 4: Inventory (Week 7-8)
- [ ] QR code generation for items
- [ ] Inventory scanning workflow
- [ ] Order list generation

### Phase 5: Integration (Week 9-10)
- [ ] End-to-end testing
- [ ] User documentation
- [ ] Training materials

---

## 8. QR Code Generation for Existing Inventory

### Script to Generate QR Codes for Current Items
```typescript
import QRCode from 'qrcode';
import ExcelJS from 'exceljs';

async function generateQRCodes(excelPath: string, outputDir: string): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(excelPath);
  
  const itemsSheet = workbook.getWorksheet('Item_Master');
  
  itemsSheet.eachRow(async (row, rowNumber) => {
    if (rowNumber === 1) return; // Skip header
    
    const lawsonNumber = row.getCell('A').value as string;
    const name = row.getCell('B').value as string;
    const category = row.getCell('C').value as string;
    const parLevel = row.getCell('D').value as number;
    
    const qrData = `RTINV|${lawsonNumber}|${name}|${category}|${parLevel}`;
    
    await QRCode.toFile(
      `${outputDir}/${lawsonNumber}.png`,
      qrData,
      { width: 300, margin: 2 }
    );
    
    console.log(`Generated QR for: ${name}`);
  });
}
```

---

## 9. Security & Compliance

### Data Protection
- No PHI stored in system
- Staff identified by ID only (no names in mobile app)
- Local encryption for sensitive data
- Audit log for all changes

### HIPAA Considerations
- System does not handle patient data
- Staff scheduling = operational data (not PHI)
- Inventory = supply chain data (not PHI)
- Excel files stored on hospital systems only

---

## 10. Files Created

```
projects/respiratory-tools/
├── README.md (this file)
├── architecture/
│   ├── system-diagram.png
│   └── data-flow.md
├── src/
│   ├── scheduling/
│   │   ├── components/
│   │   ├── models/
│   │   └── services/
│   ├── inventory/
│   │   ├── scanner/
│   │   ├── models/
│   │   └── services/
│   ├── balancer/
│   │   └── algorithm.ts
│   └── sync/
│       └── excel-integration.ts
├── templates/
│   ├── Master_Schedule.xlsx
│   └── Inventory_Master.xlsx
└── docs/
    ├── user-guide.md
    └── admin-guide.md
```

---

## Next Steps

1. **Review** this document with stakeholders
2. **Approve** tech stack and architecture
3. **Begin** Phase 1 implementation
4. **Test** with small pilot group
5. **Iterate** based on feedback
