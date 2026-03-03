/**
 * Excel Integration Service
 * 
 * Handles bidirectional sync between mobile app data and Excel workbooks
 */

import ExcelJS from 'exceljs';
import * as path from 'path';
import * as fs from 'fs';

// Data models
export interface StaffMember {
  id: string;
  name: string;
  role: 'RT' | 'RRT' | 'Lead' | 'Supervisor';
  fte: number;
  hireDate: Date;
  email?: string;
}

export interface AvailabilitySubmission {
  id: string;
  staffId: string;
  weekStarting: Date;
  availability: DailyAvailability[];
  submittedAt: Date;
  notes?: string;
}

export interface DailyAvailability {
  day: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';
  date: Date;
  shifts: ('day' | 'evening' | 'night')[];
  unavailable?: boolean;
}

export interface ShiftAssignment {
  id: string;
  staffId: string;
  date: Date;
  shiftType: 'day' | 'evening' | 'night';
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'confirmed' | 'swapped' | 'call-off';
}

export interface InventoryItem {
  lawsonNumber: string;
  name: string;
  category: string;
  parLevel: number;
  currentCount: number;
  unitOfMeasure: string;
  location: string;
  supplier?: string;
  minOrderQty?: number;
}

export interface ScanRecord {
  id: string;
  lawsonNumber: string;
  scanType: 'in' | 'out' | 'count' | 'order';
  quantity: number;
  scannedBy: string;
  scannedAt: Date;
  notes?: string;
}

export interface SyncResult {
  success: boolean;
  recordsProcessed: number;
  errors: string[];
  timestamp: Date;
}

export class ExcelSyncService {
  private schedulePath: string;
  private inventoryPath: string;
  private syncLogPath: string;

  constructor(basePath: string) {
    this.schedulePath = path.join(basePath, 'Master_Schedule.xlsx');
    this.inventoryPath = path.join(basePath, 'Inventory_Master.xlsx');
    this.syncLogPath = path.join(basePath, 'sync', 'last_sync.json');
  }

  /**
   * Initialize Excel workbooks with required sheets
   */
  public async initializeWorkbooks(): Promise<void> {
    await this.initializeScheduleWorkbook();
    await this.initializeInventoryWorkbook();
  }

  /**
   * Create Master_Schedule.xlsx with all required sheets
   */
  private async initializeScheduleWorkbook(): Promise<void> {
    const workbook = new ExcelJS.Workbook();

    // Staff Roster sheet
    const rosterSheet = workbook.addWorksheet('Staff_Roster');
    rosterSheet.columns = [
      { header: 'Staff ID', key: 'id', width: 15 },
      { header: 'Name', key: 'name', width: 25 },
      { header: 'Role', key: 'role', width: 12 },
      { header: 'FTE', key: 'fte', width: 8 },
      { header: 'Hire Date', key: 'hireDate', width: 12 },
      { header: 'Email', key: 'email', width: 30 }
    ];
    rosterSheet.getRow(1).font = { bold: true };

    // Availability Submissions sheet
    const availSheet = workbook.addWorksheet('Availability_Submissions');
    availSheet.columns = [
      { header: 'Submission ID', key: 'id', width: 20 },
      { header: 'Staff ID', key: 'staffId', width: 15 },
      { header: 'Week Starting', key: 'weekStarting', width: 15 },
      { header: 'Monday', key: 'mon', width: 20 },
      { header: 'Tuesday', key: 'tue', width: 20 },
      { header: 'Wednesday', key: 'wed', width: 20 },
      { header: 'Thursday', key: 'thu', width: 20 },
      { header: 'Friday', key: 'fri', width: 20 },
      { header: 'Saturday', key: 'sat', width: 20 },
      { header: 'Sunday', key: 'sun', width: 20 },
      { header: 'Submitted At', key: 'submittedAt', width: 20 },
      { header: 'Notes', key: 'notes', width: 30 }
    ];
    availSheet.getRow(1).font = { bold: true };

    // Generated Schedule sheet
    const scheduleSheet = workbook.addWorksheet('Generated_Schedule');
    scheduleSheet.columns = [
      { header: 'Assignment ID', key: 'id', width: 20 },
      { header: 'Staff ID', key: 'staffId', width: 15 },
      { header: 'Staff Name', key: 'staffName', width: 25 },
      { header: 'Date', key: 'date', width: 12 },
      { header: 'Shift Type', key: 'shiftType', width: 12 },
      { header: 'Start Time', key: 'startTime', width: 12 },
      { header: 'End Time', key: 'endTime', width: 12 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Generated At', key: 'generatedAt', width: 20 }
    ];
    scheduleSheet.getRow(1).font = { bold: true };

    // Shift Templates sheet
    const templateSheet = workbook.addWorksheet('Shift_Templates');
    templateSheet.columns = [
      { header: 'Shift Type', key: 'type', width: 12 },
      { header: 'Start Time', key: 'startTime', width: 12 },
      { header: 'End Time', key: 'endTime', width: 12 },
      { header: 'Duration (hrs)', key: 'duration', width: 15 },
      { header: 'Day Staff Needed', key: 'dayStaff', width: 18 },
      { header: 'Evening Staff Needed', key: 'eveningStaff', width: 20 },
      { header: 'Night Staff Needed', key: 'nightStaff', width: 18 }
    ];
    templateSheet.getRow(1).font = { bold: true };

    // Add default shift templates
    templateSheet.addRow({
      type: 'day',
      startTime: '07:00',
      endTime: '15:30',
      duration: 8.5,
      dayStaff: 5,
      eveningStaff: 0,
      nightStaff: 0
    });
    templateSheet.addRow({
      type: 'evening',
      startTime: '15:00',
      endTime: '23:30',
      duration: 8.5,
      dayStaff: 0,
      eveningStaff: 4,
      nightStaff: 0
    });
    templateSheet.addRow({
      type: 'night',
      startTime: '23:00',
      endTime: '07:30',
      duration: 8.5,
      dayStaff: 0,
      eveningStaff: 0,
      nightStaff: 3
    });

    await workbook.xlsx.writeFile(this.schedulePath);
  }

  /**
   * Create Inventory_Master.xlsx with all required sheets
   */
  private async initializeInventoryWorkbook(): Promise<void> {
    const workbook = new ExcelJS.Workbook();

    // Item Master sheet
    const itemSheet = workbook.addWorksheet('Item_Master');
    itemSheet.columns = [
      { header: 'Lawson Number', key: 'lawsonNumber', width: 15 },
      { header: 'Item Name', key: 'name', width: 35 },
      { header: 'Category', key: 'category', width: 20 },
      { header: 'Par Level', key: 'parLevel', width: 10 },
      { header: 'Current Count', key: 'currentCount', width: 14 },
      { header: 'Unit', key: 'unitOfMeasure', width: 10 },
      { header: 'Location', key: 'location', width: 20 },
      { header: 'Supplier', key: 'supplier', width: 25 },
      { header: 'Min Order Qty', key: 'minOrderQty', width: 14 },
      { header: 'Last Updated', key: 'lastUpdated', width: 15 }
    ];
    itemSheet.getRow(1).font = { bold: true };

    // Scan Log sheet
    const scanSheet = workbook.addWorksheet('Scan_Log');
    scanSheet.columns = [
      { header: 'Scan ID', key: 'id', width: 20 },
      { header: 'Lawson Number', key: 'lawsonNumber', width: 15 },
      { header: 'Scan Type', key: 'scanType', width: 12 },
      { header: 'Quantity', key: 'quantity', width: 10 },
      { header: 'Scanned By', key: 'scannedBy', width: 20 },
      { header: 'Scanned At', key: 'scannedAt', width: 20 },
      { header: 'Notes', key: 'notes', width: 30 }
    ];
    scanSheet.getRow(1).font = { bold: true };

    // Order Queue sheet
    const orderSheet = workbook.addWorksheet('Order_Queue');
    orderSheet.columns = [
      { header: 'Lawson Number', key: 'lawsonNumber', width: 15 },
      { header: 'Item Name', key: 'name', width: 35 },
      { header: 'Current Stock', key: 'currentCount', width: 14 },
      { header: 'Par Level', key: 'parLevel', width: 10 },
      { header: 'Order Qty', key: 'orderQty', width: 10 },
      { header: 'Unit', key: 'unitOfMeasure', width: 10 },
      { header: 'Supplier', key: 'supplier', width: 25 },
      { header: 'Added To Queue', key: 'addedAt', width: 15 },
      { header: 'Status', key: 'status', width: 12 }
    ];
    orderSheet.getRow(1).font = { bold: true };

    // Usage Analytics sheet
    const analyticsSheet = workbook.addWorksheet('Usage_Analytics');
    analyticsSheet.columns = [
      { header: 'Lawson Number', key: 'lawsonNumber', width: 15 },
      { header: 'Item Name', key: 'name', width: 35 },
      { header: 'Month', key: 'month', width: 12 },
      { header: 'Total Used', key: 'totalUsed', width: 12 },
      { header: 'Avg Daily Use', key: 'avgDaily', width: 14 },
      { header: 'Days Until Empty', key: 'daysRemaining', width: 16 }
    ];
    analyticsSheet.getRow(1).font = { bold: true };

    await workbook.xlsx.writeFile(this.inventoryPath);
  }

  /**
   * Sync availability submissions from JSON to Excel
   */
  public async syncAvailabilitySubmissions(
    submissions: AvailabilitySubmission[]
  ): Promise<SyncResult> {
    const result: SyncResult = {
      success: true,
      recordsProcessed: 0,
      errors: [],
      timestamp: new Date()
    };

    try {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(this.schedulePath);
      const sheet = workbook.getWorksheet('Availability_Submissions');

      for (const sub of submissions) {
        try {
          // Format availability for each day
          const dayShifts: Record<string, string> = {};
          const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
          
          for (const day of days) {
            const dayAvail = sub.availability.find(a => a.day === day);
            if (dayAvail?.unavailable) {
              dayShifts[day.toLowerCase()] = 'UNAVAILABLE';
            } else if (dayAvail) {
              dayShifts[day.toLowerCase()] = dayAvail.shifts.join(', ');
            } else {
              dayShifts[day.toLowerCase()] = '';
            }
          }

          sheet.addRow({
            id: sub.id,
            staffId: sub.staffId,
            weekStarting: sub.weekStarting,
            mon: dayShifts.mon,
            tue: dayShifts.tue,
            wed: dayShifts.wed,
            thu: dayShifts.thu,
            fri: dayShifts.fri,
            sat: dayShifts.sat,
            sun: dayShifts.sun,
            submittedAt: sub.submittedAt,
            notes: sub.notes || ''
          });

          result.recordsProcessed++;
        } catch (err) {
          result.errors.push(`Failed to process submission ${sub.id}: ${err}`);
        }
      }

      await workbook.xlsx.writeFile(this.schedulePath);
    } catch (err) {
      result.success = false;
      result.errors.push(`Failed to sync availability: ${err}`);
    }

    return result;
  }

  /**
   * Sync scan records from JSON to Excel
   */
  public async syncScanRecords(scans: ScanRecord[]): Promise<SyncResult> {
    const result: SyncResult = {
      success: true,
      recordsProcessed: 0,
      errors: [],
      timestamp: new Date()
    };

    try {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(this.inventoryPath);
      
      const scanSheet = workbook.getWorksheet('Scan_Log');
      const itemSheet = workbook.getWorksheet('Item_Master');

      for (const scan of scans) {
        try {
          // Add to scan log
          scanSheet.addRow({
            id: scan.id,
            lawsonNumber: scan.lawsonNumber,
            scanType: scan.scanType,
            quantity: scan.quantity,
            scannedBy: scan.scannedBy,
            scannedAt: scan.scannedAt,
            notes: scan.notes || ''
          });

          // Update current count in Item_Master
          if (scan.scanType === 'in' || scan.scanType === 'out' || scan.scanType === 'count') {
            await this.updateItemCount(itemSheet, scan);
          }

          // Add to order queue if needed
          if (scan.scanType === 'order') {
            await this.addToOrderQueue(workbook, scan);
          }

          result.recordsProcessed++;
        } catch (err) {
          result.errors.push(`Failed to process scan ${scan.id}: ${err}`);
        }
      }

      await workbook.xlsx.writeFile(this.inventoryPath);
    } catch (err) {
      result.success = false;
      result.errors.push(`Failed to sync scans: ${err}`);
    }

    return result;
  }

  /**
   * Update item count in Item_Master sheet
   */
  private async updateItemCount(
    sheet: ExcelJS.Worksheet,
    scan: ScanRecord
  ): Promise<void> {
    let rowToUpdate: ExcelJS.Row | null = null;

    sheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;
      const lawsonCell = row.getCell('lawsonNumber');
      if (lawsonCell.value === scan.lawsonNumber) {
        rowToUpdate = row;
      }
    });

    if (rowToUpdate) {
      const currentCountCell = rowToUpdate.getCell('currentCount');
      let currentCount = parseInt(currentCountCell.value as string) || 0;

      if (scan.scanType === 'in') {
        currentCount += scan.quantity;
      } else if (scan.scanType === 'out') {
        currentCount -= scan.quantity;
      } else if (scan.scanType === 'count') {
        currentCount = scan.quantity;
      }

      currentCountCell.value = currentCount;
      rowToUpdate.getCell('lastUpdated').value = new Date();
    }
  }

  /**
   * Add item to order queue
   */
  private async addToOrderQueue(
    workbook: ExcelJS.Workbook,
    scan: ScanRecord
  ): Promise<void> {
    const itemSheet = workbook.getWorksheet('Item_Master');
    const orderSheet = workbook.getWorksheet('Order_Queue');

    // Find item details
    let item: Partial<InventoryItem> = {};
    itemSheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;
      if (row.getCell('lawsonNumber').value === scan.lawsonNumber) {
        item = {
          lawsonNumber: scan.lawsonNumber,
          name: row.getCell('name').value as string,
          currentCount: parseInt(row.getCell('currentCount').value as string) || 0,
          parLevel: parseInt(row.getCell('parLevel').value as string) || 0,
          unitOfMeasure: row.getCell('unitOfMeasure').value as string,
          supplier: row.getCell('supplier').value as string
        };
      }
    });

    if (item.lawsonNumber) {
      const orderQty = Math.max(0, (item.parLevel || 0) - (item.currentCount || 0));
      
      orderSheet.addRow({
        lawsonNumber: item.lawsonNumber,
        name: item.name,
        currentCount: item.currentCount,
        parLevel: item.parLevel,
        orderQty: orderQty,
        unitOfMeasure: item.unitOfMeasure,
        supplier: item.supplier,
        addedAt: new Date(),
        status: 'pending'
      });
    }
  }

  /**
   * Export generated schedule to Excel
   */
  public async exportSchedule(assignments: ShiftAssignment[]): Promise<SyncResult> {
    const result: SyncResult = {
      success: true,
      recordsProcessed: 0,
      errors: [],
      timestamp: new Date()
    };

    try {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(this.schedulePath);
      const sheet = workbook.getWorksheet('Generated_Schedule');

      // Get staff names for reference
      const staffSheet = workbook.getWorksheet('Staff_Roster');
      const staffNames = new Map<string, string>();
      staffSheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return;
        staffNames.set(
          row.getCell('id').value as string,
          row.getCell('name').value as string
        );
      });

      for (const assignment of assignments) {
        sheet.addRow({
          id: assignment.id,
          staffId: assignment.staffId,
          staffName: staffNames.get(assignment.staffId) || 'Unknown',
          date: assignment.date,
          shiftType: assignment.shiftType,
          startTime: assignment.startTime,
          endTime: assignment.endTime,
          status: assignment.status,
          generatedAt: new Date()
        });
        result.recordsProcessed++;
      }

      await workbook.xlsx.writeFile(this.schedulePath);
    } catch (err) {
      result.success = false;
      result.errors.push(`Failed to export schedule: ${err}`);
    }

    return result;
  }

  /**
   * Read staff roster from Excel
   */
  public async readStaffRoster(): Promise<StaffMember[]> {
    const staff: StaffMember[] = [];

    try {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(this.schedulePath);
      const sheet = workbook.getWorksheet('Staff_Roster');

      sheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return;
        
        staff.push({
          id: row.getCell('id').value as string,
          name: row.getCell('name').value as string,
          role: row.getCell('role').value as StaffMember['role'],
          fte: parseFloat(row.getCell('fte').value as string) || 1.0,
          hireDate: new Date(row.getCell('hireDate').value as string),
          email: row.getCell('email').value as string
        });
      });
    } catch (err) {
      console.error('Failed to read staff roster:', err);
    }

    return staff;
  }

  /**
   * Read inventory items from Excel
   */
  public async readInventoryItems(): Promise<InventoryItem[]> {
    const items: InventoryItem[] = [];

    try {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(this.inventoryPath);
      const sheet = workbook.getWorksheet('Item_Master');

      sheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return;
        
        items.push({
          lawsonNumber: row.getCell('lawsonNumber').value as string,
          name: row.getCell('name').value as string,
          category: row.getCell('category').value as string,
          parLevel: parseInt(row.getCell('parLevel').value as string) || 0,
          currentCount: parseInt(row.getCell('currentCount').value as string) || 0,
          unitOfMeasure: row.getCell('unitOfMeasure').value as string,
          location: row.getCell('location').value as string,
          supplier: row.getCell('supplier').value as string,
          minOrderQty: parseInt(row.getCell('minOrderQty').value as string) || 1
        });
      });
    } catch (err) {
      console.error('Failed to read inventory:', err);
    }

    return items;
  }

  /**
   * Get last sync timestamp
   */
  public getLastSync(): Date | null {
    try {
      if (fs.existsSync(this.syncLogPath)) {
        const data = JSON.parse(fs.readFileSync(this.syncLogPath, 'utf8'));
        return new Date(data.timestamp);
      }
    } catch (err) {
      console.error('Failed to read sync log:', err);
    }
    return null;
  }

  /**
   * Update last sync timestamp
   */
  public updateLastSync(): void {
    try {
      const syncDir = path.dirname(this.syncLogPath);
      if (!fs.existsSync(syncDir)) {
        fs.mkdirSync(syncDir, { recursive: true });
      }
      
      fs.writeFileSync(this.syncLogPath, JSON.stringify({
        timestamp: new Date().toISOString()
      }));
    } catch (err) {
      console.error('Failed to update sync log:', err);
    }
  }
}

export default ExcelSyncService;
