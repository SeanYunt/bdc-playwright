#!/usr/bin/env node
/**
 * Usage: node make-pdf.js <path-to-report.md>
 *
 * Reads a Markdown report file, converts to styled HTML, renders to PDF via
 * Playwright. Output path is read from the file's `output` frontmatter field.
 *
 * Page breaks: use <!-- PAGE --> in the markdown body to start a new page.
 * Complex visual components (incident cards, tables) can be written as HTML
 * blocks directly in the markdown — marked passes them through unchanged.
 */

const { chromium } = require('playwright');
const matter = require('gray-matter');
const { marked } = require('marked');
const fs = require('fs');
const path = require('path');

const mdPath = process.argv[2];
if (!mdPath) { console.error('Usage: node make-pdf.js <report.md>'); process.exit(1); }

const src = fs.readFileSync(mdPath, 'utf8');
const { data: fm, content: body } = matter(src);

const outputDir = fm.output_dir
  ? path.resolve(path.dirname(mdPath), fm.output_dir)
  : path.resolve(path.dirname(mdPath), '../blackdiamondconsulting.ai/static');

const outputPath = path.join(outputDir, fm.output);

// Split body on <!-- PAGE --> markers; each chunk becomes one inner page
const pageSections = body.split(/<!--\s*PAGE\s*-->/).map(s => s.trim()).filter(Boolean);

const css = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
* { margin:0; padding:0; box-sizing:border-box; }
body { font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; font-size:11pt; color:#1a1a1a; background:#fff; }

.page { width:8.5in; height:11in; position:relative; overflow:hidden; page-break-after:always; }

/* Cover */
.cover { background:#111827; color:#fff; display:flex; flex-direction:column; justify-content:space-between; padding:1in 0.9in 0.8in; }
.cover-label { font-size:9pt; font-weight:600; letter-spacing:0.12em; text-transform:uppercase; color:#D85A30; margin-bottom:0.55in; }
.cover-firm { font-size:10pt; font-weight:500; color:rgba(255,255,255,0.5); margin-bottom:0.15in; }
.cover h1 { font-size:30pt; font-weight:700; line-height:1.18; color:#fff; max-width:5.5in; margin-bottom:0.3in; }
.cover-sub { font-size:12pt; font-weight:400; color:rgba(255,255,255,0.6); max-width:5in; line-height:1.5; }
.cover-accent-bar { width:52px; height:4px; background:#D85A30; margin:0.35in 0; border-radius:2px; }
.cover-meta { border-top:1px solid rgba(255,255,255,0.12); padding-top:0.25in; display:flex; justify-content:space-between; align-items:flex-end; }
.cover-meta-left { font-size:8.5pt; color:rgba(255,255,255,0.4); line-height:1.6; }
.cover-meta-right { font-size:8pt; color:rgba(255,255,255,0.3); text-align:right; line-height:1.6; }

/* Inner pages */
.inner { padding:0.65in 0.9in 0.55in; height:11in; display:flex; flex-direction:column; }
.page-header { display:flex; justify-content:space-between; align-items:center; border-bottom:1.5px solid #eee; padding-bottom:0.15in; margin-bottom:0.35in; }
.page-header-firm { font-size:8pt; font-weight:600; color:#D85A30; text-transform:uppercase; letter-spacing:0.1em; }
.page-header-title { font-size:8pt; color:#888; }
.page-footer { margin-top:auto; padding-top:0.2in; border-top:1px solid #eee; display:flex; justify-content:space-between; font-size:7.5pt; color:#aaa; }

/* Typography */
h1 { font-size:18pt; font-weight:700; color:#111827; margin-bottom:0.15in; line-height:1.25; }
h2 { font-size:15pt; font-weight:700; color:#111827; margin:0.22in 0 0.08in; line-height:1.25; }
h3 { font-size:11pt; font-weight:700; color:#111827; margin:0.22in 0 0.08in; }
h4 { font-size:10pt; font-weight:700; color:#111827; margin-bottom:0.06in; }
p { line-height:1.65; color:#333; margin-bottom:0.12in; }
ul,ol { padding-left:1.1em; margin:0.06in 0 0.12in; }
li { line-height:1.65; color:#333; margin-bottom:0.04in; font-size:9.5pt; }
strong { color:#111827; }
hr { border:none; border-top:1px solid #eee; margin:0.2in 0; }

.section-tag { font-size:8pt; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; color:#D85A30; margin-bottom:0.1in; }
.lead { font-size:12pt; line-height:1.6; color:#333; margin-bottom:0.2in; }

/* Incident cards */
.incident-card { border-left:4px solid #D85A30; background:#fdf8f6; padding:0.2in 0.25in; margin:0.2in 0; border-radius:0 6px 6px 0; }
.incident-card.yellow { border-left-color:#e8a020; background:#fffbf2; }
.incident-card.green { border-left-color:#1D9E75; background:#f2faf7; }
.incident-card p { font-size:9.5pt; line-height:1.6; margin-bottom:0.07in; color:#444; }
.incident-card p:last-child { margin-bottom:0; }
.incident-header { display:flex; align-items:baseline; gap:0.12in; margin-bottom:0.08in; }
.incident-id { font-size:7.5pt; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; color:#D85A30; white-space:nowrap; }
.incident-id.yellow { color:#c07a10; }
.incident-id.green { color:#1D9E75; }
.incident-title { font-size:10.5pt; font-weight:700; color:#111827; }

/* Risk grid */
.risk-grid { display:grid; grid-template-columns:1fr 1fr; gap:0.15in; margin:0.2in 0; }
.risk-cell { border:1px solid #e8e8e8; border-radius:6px; padding:0.15in 0.18in; }
.risk-cell-label { font-size:7.5pt; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:#D85A30; margin-bottom:0.05in; }
.risk-cell h4 { font-size:10pt; font-weight:700; color:#111827; margin-bottom:0.06in; }
.risk-cell p { font-size:9pt; color:#555; line-height:1.5; margin:0; }

/* Regulation table */
.reg-table { width:100%; border-collapse:collapse; font-size:9.5pt; margin:0.18in 0; }
.reg-table th { text-align:left; font-size:8pt; font-weight:700; text-transform:uppercase; letter-spacing:0.07em; color:#888; border-bottom:1.5px solid #ddd; padding:0.07in 0.1in 0.07in 0; }
.reg-table td { vertical-align:top; padding:0.1in 0.1in 0.1in 0; border-bottom:1px solid #f0f0f0; line-height:1.5; color:#333; }
.reg-table td:first-child { font-weight:700; color:#111827; width:1.1in; white-space:nowrap; }
.tag { display:inline-block; font-size:7pt; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; padding:2px 7px; border-radius:3px; margin-right:4px; }
.tag-critical { background:#fde8e0; color:#b03010; }
.tag-high { background:#fdf0e0; color:#a06010; }
.tag-medium { background:#e8f6f0; color:#156b50; }

/* Finding cards (for assessment reports) */
.finding-card { border:1px solid #e8e8e8; border-radius:8px; padding:0.22in 0.25in; margin:0.18in 0; }
.finding-header { display:flex; align-items:baseline; justify-content:space-between; margin-bottom:0.12in; flex-wrap:wrap; gap:0.1in; }
.finding-id { font-size:8pt; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; color:#888; }
.finding-title { font-size:11pt; font-weight:700; color:#111827; margin-bottom:0.06in; }
.finding-card p { font-size:9.5pt; line-height:1.6; margin-bottom:0.07in; color:#444; }
.finding-card p:last-child { margin-bottom:0; }
.severity-badge { font-size:7.5pt; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; padding:3px 9px; border-radius:12px; }
.severity-critical { background:#fde8e0; color:#b03010; border:1px solid #f5c5b0; }
.severity-high { background:#fdf0e0; color:#a06010; border:1px solid #f0d090; }
.severity-medium { background:#fff8e0; color:#806010; border:1px solid #e8d080; }
.finding-card table { width:100%; border-collapse:collapse; font-size:9pt; margin-bottom:0.1in; }
.finding-card table td { padding:0.05in 0; border-bottom:1px solid #f0f0f0; line-height:1.4; vertical-align:top; }
.finding-card table td:first-child { font-weight:600; color:#555; width:1.1in; }

/* Remediation table */
.remed-table { width:100%; border-collapse:collapse; font-size:9pt; margin:0.15in 0; }
.remed-table th { text-align:left; font-size:8pt; font-weight:700; text-transform:uppercase; letter-spacing:0.07em; color:#888; border-bottom:1.5px solid #ddd; padding:0.07in 0.08in 0.07in 0; }
.remed-table td { vertical-align:top; padding:0.09in 0.08in 0.09in 0; border-bottom:1px solid #f0f0f0; line-height:1.5; }
.remed-table td:first-child { font-weight:700; color:#111827; white-space:nowrap; padding-right:0.15in; }

/* CTA box */
.cta-box { background:#111827; color:#fff; border-radius:8px; padding:0.3in 0.35in; margin-top:0.25in; }
.cta-box h3 { color:#D85A30; font-size:11pt; margin-bottom:0.1in; margin-top:0; }
.cta-box p { color:rgba(255,255,255,0.75); font-size:9.5pt; margin-bottom:0.06in; line-height:1.55; }
.cta-contact { margin-top:0.12in; font-size:9pt; color:rgba(255,255,255,0.5) !important; }
.cta-contact strong { color:#D85A30 !important; }

/* Cover page for assessment reports */
.cover-classification { display:inline-block; font-size:8pt; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; padding:4px 12px; border:1px solid rgba(255,255,255,0.2); border-radius:3px; color:rgba(255,255,255,0.5); margin-bottom:0.4in; }
.cover-client { font-size:10pt; font-weight:500; color:rgba(255,255,255,0.5); margin-bottom:0.1in; }
.cover-product { font-size:13pt; font-weight:600; color:rgba(255,255,255,0.75); margin-bottom:0.3in; }
.cover-meta-table { width:100%; font-size:8.5pt; line-height:1.8; color:rgba(255,255,255,0.4); }
.cover-meta-table td { padding-right:0.3in; vertical-align:top; }
.cover-meta-table td:first-child { font-weight:600; color:rgba(255,255,255,0.3); white-space:nowrap; }

@media print { .page { page-break-after:always; } }
.page:last-child { page-break-after: auto !important; }
`;

function coverPage(fm) {
  // Assessment report cover (has client/product) vs overview cover
  if (fm.client) {
    return `
<div class="page cover">
  <div>
    <div class="cover-classification">Confidential · Sample Report</div>
    <div class="cover-label">${fm.label || 'AI Security Assessment'}</div>
    <div class="cover-firm">Black Diamond Consulting</div>
    <div class="cover-client">${fm.client}</div>
    <div class="cover-product">${fm.product || ''}</div>
    <h1>${fm.title}</h1>
    <div class="cover-accent-bar"></div>
    <p class="cover-sub">${fm.subtitle || ''}</p>
  </div>
  <div class="cover-meta">
    <div class="cover-meta-left">
      Prepared by Black Diamond Consulting<br>
      blackdiamondconsulting.ai<br>
      ${fm.date || ''}
    </div>
    <div class="cover-meta-right">
      ${fm.reference || ''}<br>
      Sample · Not Confidential
    </div>
  </div>
</div>`;
  }

  return `
<div class="page cover">
  <div>
    <div class="cover-label">${fm.label || 'Report'}</div>
    <div class="cover-firm">Black Diamond Consulting</div>
    <h1>${fm.title}</h1>
    <div class="cover-accent-bar"></div>
    <p class="cover-sub">${fm.subtitle || ''}</p>
  </div>
  <div class="cover-meta">
    <div class="cover-meta-left">
      Prepared by Black Diamond Consulting<br>
      blackdiamondconsulting.ai<br>
      ${fm.date || ''}
    </div>
    <div class="cover-meta-right">
      General Industry Overview<br>
      Not Confidential
    </div>
  </div>
</div>`;
}

function innerPage(htmlContent, pageNum, fm) {
  return `
<div class="page inner">
  <div class="page-header">
    <span class="page-header-firm">Black Diamond Consulting</span>
    <span class="page-header-title">${fm.title}</span>
  </div>
  ${htmlContent}
  <div class="page-footer">
    <span>Black Diamond Consulting — blackdiamondconsulting.ai</span>
    <span>${pageNum}</span>
  </div>
</div>`;
}

function buildHtml(fm, pageSections) {
  const pages = pageSections.map((section, i) => {
    const html = marked.parse(section);
    return innerPage(html, i + 2, fm);
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${fm.title}</title>
<style>${css}</style>
</head>
<body>
${coverPage(fm)}
${pages.join('\n')}
</body>
</html>`;
}

(async () => {
  const html = buildHtml(fm, pageSections);

  const tmpHtml = path.join(require('os').tmpdir(), `bdc-report-${Date.now()}.html`);
  fs.writeFileSync(tmpHtml, html, 'utf8');

  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(`file:///${tmpHtml.replace(/\\/g, '/')}`, { waitUntil: 'networkidle' });

  await page.pdf({
    path: outputPath,
    format: 'Letter',
    printBackground: true,
    margin: { top: '0', right: '0', bottom: '0', left: '0' }
  });

  await browser.close();
  fs.unlinkSync(tmpHtml);
  console.log(`PDF written to ${outputPath}`);
})();
