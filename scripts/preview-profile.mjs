import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const directory = fileURLToPath(new URL('../', import.meta.url));

async function renderMarkdown(markdown) {
  return new Promise((resolve, reject) => {
    // GitHub's Markdown endpoint only renders text; it does not publish or edit the repository.
    const child = spawn('gh', ['api', 'markdown', '--method', 'POST', '--input', '-'], { stdio: ['pipe', 'pipe', 'pipe'] });
    let html = '';
    const timeout = setTimeout(() => { child.kill(); reject(new Error('Markdown rendering timed out.')); }, 30_000);
    child.stdout.on('data', chunk => { html += chunk; });
    child.stderr.resume();
    child.on('error', () => { clearTimeout(timeout); reject(new Error('GitHub CLI is required to build the preview.')); });
    child.on('close', code => {
      clearTimeout(timeout);
      if (code !== 0) reject(new Error('GitHub Markdown rendering failed. Check gh authentication/network.'));
      else resolve(html);
    });
    child.stdin.end(JSON.stringify({ text: markdown, mode: 'gfm', context: 'dattk2002/dattk2002' }));
  });
}

async function buildPreview() {
  const markdown = await readFile(join(directory, 'README.md'), 'utf8');
  let html = await renderMarkdown(markdown);
  // GitHub may absolutize relative paths. The preview deliberately loads the working-tree images.
  html = html.replace(/(?:https:\/\/github\.com\/dattk2002\/dattk2002\/(?:raw|blob)\/[^/]+\/|https:\/\/raw\.githubusercontent\.com\/dattk2002\/dattk2002\/[^/]+\/|\.\/)(assets|docs)\//g, '../$1/');
  const output = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Tran Kim Dat — GitHub README preview</title>
<style>
*{box-sizing:border-box}html{color-scheme:dark}body{margin:0;background:#0d1117;color:#e6edf3;font:16px/1.6 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}a{color:#79c0ff;text-decoration:none}a:hover{text-decoration:underline}a:focus-visible,button:focus-visible,summary:focus-visible{outline:3px solid #c7f36b;outline-offset:4px}header{max-width:1012px;margin:24px auto;padding:0 16px;display:flex;justify-content:space-between;gap:16px;align-items:center}header p{margin:0;color:#a7adb0;font-size:14px}button{background:#161b22;color:#e6edf3;border:1px solid #30363d;border-radius:6px;padding:10px 16px;min-height:44px;cursor:pointer}main{width:calc(100% - 384px);max-width:896px;min-width:0;margin:0 auto 40px;padding:24px;border:1px solid #30363d;border-radius:8px}img{max-width:100%;height:auto;vertical-align:middle}p{margin:0 0 16px}h2{font-size:24px;line-height:1.25;margin:32px 0 16px;padding-bottom:8px;border-bottom:1px solid #30363d}h3{font-size:20px;margin:24px 0 16px}li+li{margin-top:4px}code{font-family:monospace;font-size:85%;padding:3px 6px;background:#6e768166;border-radius:4px}details{margin:16px 0}summary{cursor:pointer;min-height:44px;display:list-item;padding:8px 0}table{border-collapse:collapse;margin:16px 0;display:block;max-width:100%;overflow:auto}th,td{padding:6px 13px;border:1px solid #30363d}tr:nth-child(2n){background:#161b22}svg.octicon{display:none}.anchor{display:none}body.light{background:#fff;color:#1f2328}body.light a{color:#0969da}body.light button,body.light tr:nth-child(2n){background:#f6f8fa;color:#1f2328}body.light header p{color:#59636e}body.light main,body.light h2,body.light td,body.light th{border-color:#d1d9e0}@media(max-width:767px){header{margin:16px 0}header p{font-size:12px}main{width:100%;padding:16px;border:0;margin:0}h2{font-size:22px}body{font-size:15px}}
</style></head><body><header><p><strong>Local README preview</strong><br>GitHub profile width · unpublished local preview</p><button id="theme" type="button" aria-pressed="false">Light background</button></header><main>${html}</main>
<script>document.getElementById('theme').addEventListener('click',function(){const light=document.body.classList.toggle('light');this.textContent=light?'Dark background':'Light background';this.setAttribute('aria-pressed',String(light));document.documentElement.style.colorScheme=light?'light':'dark';});</script></body></html>`;
  await mkdir(join(directory, 'preview'), { recursive: true });
  await writeFile(join(directory, 'preview/index.html'), output);
  console.log(`Preview saved: ${join(directory, 'preview/index.html')}`);
}

try {
  await buildPreview();
  if (!process.argv.includes('--build')) {
    const server = createServer(async (request, response) => {
      const pathname = new URL(request.url, 'http://127.0.0.1').pathname;
      const relative = pathname === '/' || pathname === '/index.html' ? 'preview/index.html' : pathname.replace(/^\//, '');
      if (!/^(?:preview\/index\.html|assets\/[a-zA-Z0-9.-]+\.(?:svg|json)|docs\/profile-cards\.md)$/.test(relative)) {
        response.writeHead(404).end('Not found');
        return;
      }
      try {
        const content = await readFile(join(directory, relative));
        const type = relative.endsWith('.svg') ? 'image/svg+xml' : relative.endsWith('.json') ? 'application/json' : relative.endsWith('.md') ? 'text/plain' : 'text/html';
        response.writeHead(200, { 'Content-Type': `${type}; charset=utf-8`, 'Cache-Control': 'no-store' }).end(content);
      } catch { response.writeHead(404).end('Not found'); }
    });
    server.on('error', error => { console.error(error.code === 'EADDRINUSE' ? 'Port 4173 is already in use. Open http://localhost:4173 or stop the previous preview.' : 'Preview server could not start.'); process.exitCode = 1; });
    server.listen(4173, '127.0.0.1', () => console.log('Open http://localhost:4173 — Ctrl+C stops the preview.'));
  }
} catch (error) { console.error(error.message); process.exitCode = 1; }
