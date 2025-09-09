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
