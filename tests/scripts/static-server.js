const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 4173;
const ROOT_DIR = path.resolve(__dirname, '..', '..');

const CONTENT_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

function safePathname(requestPath) {
    const decodedPath = decodeURIComponent(requestPath);
    const normalized = path.normalize(decodedPath).replace(/^([.][.][/\\])+/, '');
    return normalized === '/' ? '/epub-reader.html' : normalized;
}

const server = http.createServer((req, res) => {
    const requestPath = safePathname(req.url.split('?')[0]);
    const filePath = path.join(ROOT_DIR, requestPath);

    if (!filePath.startsWith(ROOT_DIR)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
    }

    fs.readFile(filePath, (error, data) => {
        if (error) {
            res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end('Not found');
            return;
        }

        const extension = path.extname(filePath).toLowerCase();
        const contentType = CONTENT_TYPES[extension] || 'application/octet-stream';
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
    });
});

server.listen(PORT, '127.0.0.1', () => {
    console.log(`Static server running at http://127.0.0.1:${PORT}`);
});
