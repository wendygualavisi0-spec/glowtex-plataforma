/**
 * GLOWTEX E-Commerce & Digital Twin Platform
 * Servidor local ligero compatible con Visual Studio / VS Code
 * No requiere 'npm install' previo porque utiliza módulos nativos de Node.js (http, fs, path).
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8'
};

const server = http.createServer((req, res) => {
  let reqPath = decodeURI(req.url.split('?')[0]);
  if (reqPath === '/' || reqPath === '') {
    reqPath = '/index.html';
  }

  const filePath = path.normalize(path.join(PUBLIC_DIR, reqPath));

  // Seguridad: evitar directory traversal
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('403 Prohibido');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`<h2>404 - Archivo no encontrado</h2><p><a href="/">Volver a GLOWTEX</a></p>`);
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache'
    });

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`   GLOWTEX | Plataforma E-Commerce & Gemelo Digital   `);
  console.log(`   Proyecto de Negocios y Gemelos Digitales (UPEC)    `);
  console.log(`======================================================`);
  console.log(` Servidor local activo en: http://localhost:${PORT}`);
  console.log(` Puedes abrir este enlace en tu navegador o en VS Code`);
  console.log(` Presiona Ctrl + C para detener el servidor.\n`);
});
