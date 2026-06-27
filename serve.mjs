import { createServer } from 'http';
import { readFile } from 'fs/promises';
import { watch } from 'fs';
import { extname, join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = 3000;

const mime = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.mjs': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

// Live-reload: keep SSE clients
const clients = new Set();

watch(__dirname, { recursive: true }, (_, filename) => {
  if (!filename || filename.includes('node_modules')) return;
  for (const res of clients) {
    res.write('data: reload\n\n');
  }
});

const LIVERELOAD_SCRIPT = `
<script>
  const es = new EventSource('/__livereload');
  es.onmessage = () => location.reload();
</script>`;

createServer(async (req, res) => {
  // SSE endpoint for live reload
  if (req.url === '/__livereload') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });
    res.write(':\n\n');
    clients.add(res);
    req.on('close', () => clients.delete(res));
    return;
  }

  let url = req.url === '/' ? '/index.html' : req.url;
  const filePath = join(__dirname, url);
  const ext = extname(filePath);

  try {
    let data = await readFile(filePath);
    res.writeHead(200, { 'Content-Type': mime[ext] || 'text/plain' });
    // Inject live-reload script into HTML
    if (ext === '.html') {
      data = Buffer.from(data.toString().replace('</body>', LIVERELOAD_SCRIPT + '</body>'));
    }
    res.end(data);
  } catch {
    res.writeHead(404);
    res.end('Not found');
  }
}).listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
