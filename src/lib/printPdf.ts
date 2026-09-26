/** Open a print-friendly window so the user can Save as PDF (no extra npm deps). */
export function printAsPdf(title: string, bodyHtml: string) {
  if (typeof window === 'undefined') return

  const w = window.open('', '_blank', 'noopener,noreferrer,width=800,height=900')
  if (!w) {
    alert('Please allow pop-ups to export PDF.')
    return
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <title>${escapeHtml(title)}</title>
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
      color: #0f172a;
      margin: 0;
      padding: 32px;
      line-height: 1.45;
      font-size: 14px;
    }
    h1 { font-size: 20px; margin: 0 0 4px; }
    h2 { font-size: 15px; margin: 24px 0 8px; }
    .muted { color: #64748b; font-size: 12px; }
    .brand { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 20px; }
    .brand b { font-size: 16px; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; }
    th, td { border: 1px solid #cbd5e1; padding: 8px 10px; text-align: left; }
    th { background: #f1f5f9; font-size: 12px; text-transform: uppercase; letter-spacing: 0.03em; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 999px; background: #e2e8f0; font-size: 11px; font-weight: 600; }
    .badge.ok { background: #dcfce7; color: #166534; }
    .badge.warn { background: #fef3c7; color: #92400e; }
    .badge.bad { background: #fee2e2; color: #991b1b; }
    .right { text-align: right; }
    .totals { margin-top: 16px; font-weight: 600; }
    .notes { white-space: pre-wrap; border: 1px solid #e2e8f0; padding: 12px; border-radius: 8px; background: #f8fafc; }
    @media print {
      body { padding: 12mm; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="brand">
    <div>
      <b>NCOF Platform</b>
      <div class="muted">Nigerian Committee of Friends</div>
    </div>
    <div class="muted right">${escapeHtml(new Date().toLocaleString())}</div>
  </div>
  ${bodyHtml}
  <p class="muted" style="margin-top:32px">Generated from NCOF Platform. Use your browser Print dialog and choose Save as PDF.</p>
  <script>window.onload=function(){setTimeout(function(){window.print()},250)}</script>
</body>
</html>`

  w.document.open()
  w.document.write(html)
  w.document.close()
}

function escapeHtml(s: string) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function escapeHtmlPublic(s: string) {
  return escapeHtml(s)
}
