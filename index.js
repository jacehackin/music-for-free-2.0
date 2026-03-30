const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const MUSIC_DIR = path.join(__dirname, 'music');

if (!fs.existsSync(MUSIC_DIR)) {
    fs.mkdirSync(MUSIC_DIR);
}

const server = http.createServer((req, res) => {
    if (req.url === '/' || req.url === '/index.html') {
        fs.readFile(path.join(__dirname, 'index.html'), (err, data) => {
            if (err) {
                res.writeHead(500);
                return res.end("Error loading the interface.");
            }
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data);
        });
        return;
    }

    if (req.url === '/api/songs') {
        fs.readdir(MUSIC_DIR, (err, files) => {
            const songs = files ? files.filter(f => f.endsWith('.mp3')) : [];
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(songs));
        });
        return;
    }

    if (req.url.startsWith('/music/')) {
        const songName = decodeURIComponent(req.url.replace('/music/', ''));
        const filePath = path.join(MUSIC_DIR, songName);

        try {
            const stat = fs.statSync(filePath);
            res.writeHead(200, {
                'Content-Type': 'audio/mpeg',
                'Content-Length': stat.size
            });
            const readStream = fs.createReadStream(filePath);
            readStream.pipe(res);
        } catch (err) {
            res.writeHead(404);
            res.end("Song not found.");
        }
        return;
    }

    res.writeHead(404);
    res.end();
});

server.listen(PORT, () => {
    console.log(`Mini-Spotify listening on port ${PORT}`);
});
