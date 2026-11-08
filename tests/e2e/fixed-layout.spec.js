const { test, expect } = require('@playwright/test');

async function loadBook(page, defaultLayout, firstProperties = '', secondProperties = '') {
    await page.evaluate(async ({ defaultLayout, firstProperties, secondProperties }) => {
        const files = {
            'META-INF/container.xml': '<container><rootfiles><rootfile full-path="book/package.opf"/></rootfiles></container>',
            'book/package.opf': `<package xmlns:dc="http://purl.org/dc/elements/1.1/">
                <metadata><dc:title>Layout test</dc:title><meta property="rendition:layout">${defaultLayout}</meta></metadata>
                <manifest>
                    <item id="one" href="one.xhtml" media-type="application/xhtml+xml"/>
                    <item id="two" href="two.xhtml" media-type="application/xhtml+xml"/>
                    <item id="css" href="styles/page.css" media-type="text/css"/>
                    <item id="image" href="image.png" media-type="image/png"/>
                </manifest>
                <spine><itemref idref="one" properties="${firstProperties}"/><itemref idref="two" properties="${secondProperties}"/></spine>
            </package>`,
            'book/one.xhtml': `<html><head><meta name="viewport" content="width=600, height=800"/>
                <link rel="stylesheet" href="styles/page.css"/></head>
                <body><div id="positioned">First page</div><img src="image.png"/>
                <a href="two.xhtml#target">Next page</a></body></html>`,
            'book/two.xhtml': '<html><head><meta name="viewport" content="width=800,height=600"/></head><body><p id="target">Second page</p></body></html>',
            'book/styles/page.css': '#positioned { position: absolute; left: 123px; top: 45px; color: rgb(255, 0, 0); background-image: url("../image.png"); }',
            'book/image.png': 'image bytes'
        };
        const zip = {
            file(path) {
                if (!(path in files)) return null;
                return { async: async type => type === 'base64' ? btoa(files[path]) : files[path] };
            }
        };
        window.JSZip = { loadAsync: async () => zip };
        await window.epubReader.loadEPUB(new File(['fixture'], 'fixture.epub'));
    }, { defaultLayout, firstProperties, secondProperties });
}

test.beforeEach(async ({ page }) => {
    await page.goto('/epub-reader.html');
});

test('switches fixed pages without changing the default view and scales authored content', async ({ page }) => {
    await loadBook(page, 'pre-paginated');
    const toggle = page.locator('#layoutToggle');
    await expect(toggle).toHaveText('Reflowable Layout');
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
    await expect(page.locator('#readerContent #positioned')).toBeVisible();

    await toggle.click();
    const frame = page.frameLocator('.fixed-page');
    await expect(frame.locator('#positioned')).toHaveCSS('left', '123px');
    await expect(frame.locator('#positioned')).toHaveCSS('color', 'rgb(255, 0, 0)');
    await expect(frame.locator('img')).toHaveAttribute('src', /^data:image\/png;base64,/);
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    const before = await page.locator('.fixed-page').boundingBox();
    await page.setViewportSize({ width: 900, height: 600 });
    await expect.poll(async () => (await page.locator('.fixed-page').boundingBox()).height).toBeLessThan(before.height);

    await frame.locator('a').click();
    await expect(page.locator('#pageInfo')).toHaveText('2 / 2');
    await expect(frame.locator('#target')).toBeVisible();
    await toggle.click();
    await expect(page.locator('#readerContent #target')).toBeVisible();
    await expect(page.locator('#pageInfo')).toHaveText('2 / 2');
});

test('honors spine overrides and resets the toggle when a new book is loaded', async ({ page }) => {
    await loadBook(page, 'reflowable', 'rendition:layout-pre-paginated');
    await expect(page.locator('#layoutToggle')).toBeVisible();
    await page.locator('#layoutToggle').click();
    await expect(page.locator('.fixed-page')).toBeVisible();
    await page.locator('#nextChapter').click();
    await expect(page.locator('.fixed-page')).toHaveCount(0);
    await expect(page.locator('#readerContent #target')).toBeVisible();

    await loadBook(page, 'reflowable');
    await expect(page.locator('#layoutToggle')).toBeHidden();
    await expect(page.locator('#readerContent #positioned')).toBeVisible();
    await loadBook(page, 'pre-paginated', 'rendition:layout-reflowable');
    await expect(page.locator('#layoutToggle')).toHaveText('Reflowable Layout');
    await page.locator('#layoutToggle').click();
    await expect(page.locator('.fixed-page')).toHaveCount(0);
    await page.locator('#nextChapter').click();
    await expect(page.locator('.fixed-page')).toBeVisible();
});

test('uses an SVG page viewBox as its viewport and reports missing XHTML viewports', async ({ page }) => {
    await page.evaluate(async () => {
        const files = {
            'META-INF/container.xml': '<container><rootfile full-path="package.opf"/></container>',
            'package.opf': `<package><metadata><meta property="rendition:layout">pre-paginated</meta></metadata>
                <manifest><item id="svg" href="page.svg" media-type="image/svg+xml"/>
                <item id="bad" href="bad.xhtml" media-type="application/xhtml+xml"/></manifest>
                <spine><itemref idref="svg"/><itemref idref="bad"/></spine></package>`,
            'page.svg': '<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 400 600"><rect id="block" width="50" height="50"/></svg>',
            'bad.xhtml': '<html><body>No viewport</body></html>'
        };
        window.JSZip = { loadAsync: async () => ({
            file: path => files[path] === undefined ? null : { async: async () => files[path] }
        }) };
        await window.epubReader.loadEPUB(new File(['fixture'], 'svg.epub'));
    });
    await page.locator('#layoutToggle').click();
    await expect(page.locator('.fixed-page')).toHaveCSS('width', '400px');
    await expect(page.locator('.fixed-page')).toHaveCSS('height', '600px');
    await expect(page.frameLocator('.fixed-page').locator('#block')).toBeVisible();
    await page.locator('#nextChapter').click();
    await expect(page.locator('#readerContent')).toHaveText('Error loading chapter content.');
});
