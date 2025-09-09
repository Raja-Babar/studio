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
  // Admin User records
  { employeeId: 'EMP000', name: 'Admin User', date: '2024-07-28', status: 'Present' },
  { employeeId: 'EMP000', name: 'Admin User', date: '2024-07-27', status: 'Present' },
  { employeeId: 'EMP000', name: 'Admin User', date: '2024-07-26', status: 'Present' },
  { employeeId: 'EMP000', name: 'Admin User', date: '2024-07-25', status: 'Absent' },
  { employeeId: 'EMP000', name: 'Admin User', date: '2024-07-24', status: 'Present' },
  
  // Employee User records
  { employeeId: 'EMP101', name: 'Employee User', date: '2024-07-28', status: 'Present' },
  { employeeId: 'EMP101', name: 'Employee User', date: '2024-07-27', status: 'Leave' },
  { employeeId: 'EMP101', name: 'Employee User', date: '2024-07-26', status: 'Present' },
  { employeeId: 'EMP101', name: 'Employee User', date: '2024-07-25', status: 'Present' },
  { employeeId: 'EMP101', name: 'Employee User', date: '2024-07-24', status: 'Present' },
  
  // Other employee records for Admin to see
  { employeeId: 'EMP001', name: 'Ali Khan', date: '2024-07-28', status: 'Present' },
  { employeeId: 'EMP002', name: 'Ahmed Raza', date: '2024-07-28', status: 'Present' },
  { employeeId: 'EMP003', name: 'Fatima Ali', date: '2024-07-28', status: 'Absent' },
  { employeeId: 'EMP004', name: 'Zainab Omar', date: '2024-07-28', status: 'Present' },
  { employeeId: 'EMP005', name: 'Bilal Ahmed', date: '2024-07-28', status: 'Leave' },
  { employeeId: 'EMP006', name: 'Sana Javed', date: '2024-07-28', status: 'Present' },
  { employeeId: 'EMP007', name: 'Umar Farooq', date: '2024-07-28', status: 'Present' },
  { employeeId: 'EMP001', name: 'Ali Khan', date: '2024-07-27', status: 'Present' },
  { employeeId: 'EMP002', name: 'Ahmed Raza', date: '2024-07-27', status: 'Present' },
  { employeeId: 'EMP003', name: 'Fatima Ali', date: '2024-07-27', status: 'Present' },
];
