
export const pettyCashRecords = JSON.stringify(
  [
    { "date": "2024-07-01", "description": "Office Supplies", "amount": -55.20 },
    { "date": "2024-07-03", "description": "Team Lunch", "amount": -120.50 },
    { "date": "2024-07-05", "description": "Cash Replenishment", "amount": 500.00 },
    { "date": "2024-07-10", "description": "Courier Services", "amount": -25.00 },
    { "date": "2024-07-15", "description": "Minor IT Repair", "amount": -75.00 }
  ], null, 2
);

export const scanningProgressRecords = JSON.stringify(
  [
    { "book_id": "BK001", "title": "History of Sindh", "status": "Uploading", "scanner": "Ali", "qc_by": "Fatima" },
    { "book_id": "BK002", "title": "Sindh Through Centuries", "status": "PDF-QC", "scanner": "Ahmed", "qc_by": "Fatima" },
    { "book_id": "BK003", "title": "Panhwar Contributions", "status": "Scanning", "scanner": "Bilal", "qc_by": null },
    { "book_id": "BK004", "title": "Indus Valley", "status": "Completed", "scanner": "Ali", "qc_by": "Zainab" },
    { "book_id": "BK005", "title": "Modern Agriculture", "status": "Scanning-QC", "scanner": "Ahmed", "qc_by": null }
  ], null, 2
);

// Corresponds to the default users in auth-provider.tsx
export const attendanceRecords = [
  // Admin User records for today
  { employeeId: 'EMP000', name: 'Admin User', date: '2024-07-29', timeIn: '09:00 AM', timeOut: '05:00 PM', status: 'Present' },

  // Employee User records for today
  { employeeId: 'EMP101', name: 'Employee User', date: '2024-07-29', timeIn: '09:15 AM', timeOut: '05:15 PM', status: 'Present' },

  // Other employee records for today
  { employeeId: 'EMP001', name: 'Ali Khan', date: '2024-07-29', timeIn: '09:05 AM', timeOut: '05:05 PM', status: 'Present' },
  { employeeId: 'EMP002', name: 'Ahmed Raza', date: '2024-07-29', timeIn: '09:02 AM', timeOut: '05:02 PM', status: 'Present' },
  { employeeId: 'EMP003', name: 'Fatima Ali', date: '2024-07-29', timeIn: '--:--', timeOut: '--:--', status: 'Absent' },
  { employeeId: 'EMP004', name: 'Zainab Omar', date: '2024-07-29', timeIn: '09:30 AM', timeOut: '05:30 PM', status: 'Present' },
  { employeeId: 'EMP005', name: 'Bilal Ahmed', date: '2024-07-29', timeIn: '--:--', timeOut: '--:--', status: 'Leave' },
  { employeeId: 'EMP006', name: 'Sana Javed', date: '2024-07-29', timeIn: '08:55 AM', timeOut: '04:55 PM', status: 'Present' },
  { employeeId: 'EMP007', name: 'Umar Farooq', date: '2024-07-29', timeIn: '09:10 AM', timeOut: '05:10 PM', status: 'Present' },

  // Previous days' records for chart data
  { employeeId: 'EMP000', name: 'Admin User', date: '2024-07-28', timeIn: '09:01 AM', timeOut: '05:01 PM', status: 'Present' },
  { employeeId: 'EMP000', name: 'Admin User', date: '2024-07-27', timeIn: '09:03 AM', timeOut: '05:03 PM', status: 'Present' },
  { employeeId: 'EMP000', name: 'Admin User', date: '2024-07-26', timeIn: '08:58 AM', timeOut: '04:58 PM', status: 'Present' },
  { employeeId: 'EMP000', name: 'Admin User', date: '2024-07-25', timeIn: '--:--', timeOut: '--:--', status: 'Absent' },
  { employeeId: 'EMP000', name: 'Admin User', date: '2024-07-24', timeIn: '09:05 AM', timeOut: '05:05 PM', status: 'Present' },
  
  { employeeId: 'EMP101', name: 'Employee User', date: '2024-07-28', timeIn: '09:12 AM', timeOut: '05:12 PM', status: 'Present' },
  { employeeId: 'EMP101', name: 'Employee User', date: '2024-07-27', timeIn: '--:--', timeOut: '--:--', status: 'Leave' },
  { employeeId: 'EMP101', name: 'Employee User', date: '2024-07-26', timeIn: '09:18 AM', timeOut: '05:18 PM', status: 'Present' },
  { employeeId: 'EMP101', name: 'Employee User', date: '2024-07-25', timeIn: '09:11 AM', timeOut: '05:11 PM', status: 'Present' },
  { employeeId: 'EMP101', name: 'Employee User', date: '2024-07-24', timeIn: '09:09 AM', timeOut: '05:09 PM', status: 'Present' },
  
  { employeeId: 'EMP001', name: 'Ali Khan', date: '2024-07-28', timeIn: '09:06 AM', timeOut: '05:06 PM', status: 'Present' },
  { employeeId: 'EMP002', name: 'Ahmed Raza', date: '2024-07-28', timeIn: '09:03 AM', timeOut: '05:03 PM', status: 'Present' },
  { employeeId: 'EMP003', name: 'Fatima Ali', date: '2024-07-28', timeIn: '--:--', timeOut: '--:--', status: 'Absent' },
  
  { employeeId: 'EMP001', name: 'Ali Khan', date: '2024-07-27', timeIn: '09:00 AM', timeOut: '05:00 PM', status: 'Present' },
  { employeeId: 'EMP002', name: 'Ahmed Raza', date: '2024-07-27', timeIn: '09:01 AM', timeOut: '05:01 PM', status: 'Present' },
  { employeeId: 'EMP003', name: 'Fatima Ali', date: '2024-07-27', timeIn: '08:59 AM', timeOut: '04:59 PM', status: 'Present' },

  // Data for 2023
  { employeeId: 'EMP001', name: 'Ali Khan', date: '2023-07-29', timeIn: '09:00 AM', timeOut: '05:00 PM', status: 'Present' },
  { employeeId: 'EMP002', name: 'Ahmed Raza', date: '2023-07-29', timeIn: '09:05 AM', timeOut: '05:05 PM', status: 'Present' },
  { employeeId: 'EMP001', name: 'Ali Khan', date: '2023-07-28', timeIn: '09:02 AM', timeOut: '05:02 PM', status: 'Present' },

  // Data for 2025
  { employeeId: 'EMP003', name: 'Fatima Ali', date: '2025-01-15', timeIn: '09:00 AM', timeOut: '05:00 PM', status: 'Present' },
  { employeeId: 'EMP004', name: 'Zainab Omar', date: '2025-01-15', timeIn: '--:--', timeOut: '--:--', status: 'Leave' },
  { employeeId: 'EMP003', name: 'Fatima Ali', date: '2025-01-16', timeIn: '09:05 AM', timeOut: '05:05 PM', status: 'Present' },
];
