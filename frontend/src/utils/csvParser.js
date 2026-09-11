export function parseCSV(text) {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
  if (lines.length < 2) {
    return { error: 'CSV file is empty or missing a header row.' };
  }

  // Parse header
  const rawHeaders = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, '').toLowerCase());
  const required = ['sender_id', 'receiver_id', 'amount', 'timestamp', 'device_id', 'ip_subnet'];
  const missing = required.filter(col => !rawHeaders.includes(col));

  if (missing.length > 0) {
    return {
      error: `Missing required columns: ${missing.join(', ')}`,
      missingCols: missing,
      foundCols: rawHeaders
    };
  }

  const colIndex = {};
  required.forEach(c => colIndex[c] = rawHeaders.indexOf(c));

  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;
    const parts = line.split(',').map(p => p.trim().replace(/^["']|["']$/g, ''));
    if (parts.length < rawHeaders.length) continue;

    const row = {
      sender_id: parts[colIndex.sender_id] || '',
      receiver_id: parts[colIndex.receiver_id] || '',
      amount: parseFloat(parts[colIndex.amount]) || 0,
      timestamp: parts[colIndex.timestamp] || '',
      device_id: parts[colIndex.device_id] || '',
      ip_subnet: parts[colIndex.ip_subnet] || ''
    };
    if (row.sender_id && row.receiver_id) {
      rows.push(row);
    }
  }

  if (rows.length === 0) {
    return { error: 'No valid data rows found in the CSV.' };
  }

  return { success: true, rows, headers: rawHeaders };
}

export function computeDatasetMetrics(rows) {
  const accounts = new Set();
  const devices = new Set();
  const subnets = new Set();
  let totalVol = 0;

  rows.forEach(r => {
    if (r.sender_id) accounts.add(r.sender_id);
    if (r.receiver_id) accounts.add(r.receiver_id);
    if (r.device_id) devices.add(r.device_id);
    if (r.ip_subnet) subnets.add(r.ip_subnet);
    totalVol += r.amount;
  });

  return {
    txCount: rows.length,
    accCount: accounts.size,
    devCount: devices.size,
    subCount: subnets.size,
    totalVolume: totalVol
  };
}

export function fmtCurrency(val) {
  return '₹' + Math.round(val || 0).toLocaleString('en-IN');
}
