export const API = 'https://fraudhunterapi.blackdiamondconsulting.ai';

function sseBody(result) {
  return `data: {"type":"progress","msg":"Working..."}\ndata: {"type":"done","result":${JSON.stringify(result)}}\n`;
}

export async function stubBase(page) {
  await page.route(`${API}/api/status`, r => r.fulfill({ json: { preprocessed: true } }));
  await page.route(`${API}/api/last-scan`, r => r.fulfill({ status: 404, json: { detail: 'No previous scan' } }));
}

export async function stubScan(page, result = SCAN_FIXTURE) {
  await page.route(`${API}/api/scan`, r => r.fulfill({
    status: 200,
    headers: { 'Content-Type': 'text/event-stream' },
    body: sseBody(result),
  }));
}

export async function stubProfile(page, result = PROFILE_FRESH_FIXTURE) {
  await page.route(`${API}/api/profile`, r => r.fulfill({
    status: 200,
    headers: { 'Content-Type': 'text/event-stream' },
    body: sseBody(result),
  }));
}

export async function stubLookup(page, result = LOOKUP_FIXTURE) {
  await page.route(`${API}/api/lookup`, r => r.fulfill({ json: result }));
}

export async function stubDossiers(page, result = DOSSIERS_FIXTURE) {
  await page.route(`${API}/api/dossiers`, r => r.fulfill({ json: result }));
}

export function setupSpy(page) {
  return page.addInitScript(() => {
    window.__plausibleCalls = [];
    window.plausible = (event, options) => {
      window.__plausibleCalls.push({ event, options: options || {} });
    };
  });
}

export const getCalls = page => page.evaluate(() => window.__plausibleCalls);
export const findEvent = (calls, name) => calls.find(c => c.event === name);

export const SCAN_FIXTURE = {
  total: 3,
  providers: [
    { npi: '1234567890', overall_score: 0.82, num_flags: 3, flag_types: ['revenue_outlier', 'billing_spike', 'nos_code_concentration'] },
    { npi: '0987654321', overall_score: 0.55, num_flags: 2, flag_types: ['billing_spike', 'upcoding_trajectory'] },
    { npi: '1111111111', overall_score: 0.35, num_flags: 1, flag_types: ['consistency_anomaly'] },
  ],
  params: { threshold: 0.5, top: 20, state: 'WY' },
};

export const PROFILE_FRESH_FIXTURE = {
  npi: '1598971855',
  provider_name: 'SMITH JOHN MD',
  overall_score: 0.82,
  num_flags: 3,
  pdf_filename: 'dossier_1598971855_20250610.pdf',
  cached: false,
  scan_result: {
    red_flags: [
      { severity: 0.9, flag_type: 'revenue_outlier', description: 'Billed $2.1M/month vs peer median of $180K' },
      { severity: 0.75, flag_type: 'billing_spike', description: '20x billing increase in month 7' },
      { severity: 0.6, flag_type: 'nos_code_concentration', description: '78% of claims use NOS codes' },
    ],
  },
};

export const PROFILE_CACHED_FIXTURE = {
  npi: '1598971855',
  pdf_filename: 'dossier_1598971855_20250610.pdf',
  cached: true,
};

export const LOOKUP_FIXTURE = {
  results: [
    { npi: '1598971855', name: 'SMITH JOHN MD', address: '123 Main St', city: 'Cheyenne', state: 'WY', zip: '82001', taxonomy: 'Internal Medicine' },
    { npi: '1234567890', name: 'JONES MARY DO', address: '456 Oak Ave', city: 'Casper', state: 'WY', zip: '82601', taxonomy: 'Family Medicine' },
  ],
};

export const DOSSIERS_FIXTURE = {
  dossiers: [
    { npi: '1598971855', filename: 'dossier_1598971855_20250610.pdf', size_bytes: 45678 },
    { npi: '1234567890', filename: 'dossier_1234567890_20250609.pdf', size_bytes: 38421 },
  ],
};
