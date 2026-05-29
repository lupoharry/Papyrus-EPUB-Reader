const fs = require('fs');
const path = require('path');
const https = require('https');

const EPUB_URL = 'https://github.com/IDPF/epub3-samples/releases/download/20230704/accessible_epub_3.epub';
const fixtureDir = path.join(__dirname, '..', 'fixtures');
const fixturePath = path.join(fixtureDir, 'accessible_epub_3.epub');

function downloadWithRedirects(url, outputPath, redirectCount = 0) {
    if (redirectCount > 5) {
        throw new Error('Too many redirects while downloading test EPUB.');
    }

    return new Promise((resolve, reject) => {
        https
            .get(url, (response) => {
                if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
                    response.resume();
                    resolve(downloadWithRedirects(response.headers.location, outputPath, redirectCount + 1));
                    return;
                }

                if (response.statusCode !== 200) {
                    response.resume();
                    reject(new Error(`Unexpected response code: ${response.statusCode}`));
                    return;
                }

                const fileStream = fs.createWriteStream(outputPath);
                response.pipe(fileStream);

                fileStream.on('finish', () => {
                    fileStream.close(() => resolve());
                });

                fileStream.on('error', (error) => {
                    fileStream.close(() => reject(error));
                });
            })
            .on('error', reject);
    });
}

(async () => {
    fs.mkdirSync(fixtureDir, { recursive: true });

    if (fs.existsSync(fixturePath) && fs.statSync(fixturePath).size > 0) {
        console.log('Test EPUB already exists:', fixturePath);
        return;
    }

    console.log('Downloading test EPUB artifact...');
    await downloadWithRedirects(EPUB_URL, fixturePath);
    console.log('Downloaded test EPUB artifact:', fixturePath);
})();
