const { test, expect } = require('@playwright/test');

async function loadBook(page, format, fixed = false) {
    await page.evaluate(async ({ format, fixed }) => {
        const nav = format === 'nav' ?
            `<html><body><nav epub:type="toc"><ol>
                <li><a href="../text/chapter.xhtml">Chapter</a><ol>
                    <li><a href="../text/chapter.xhtml#section%201">Section</a></li>
                    <li><a href="../text/chapter.xhtml#subsection">Subsection</a></li>
                    <li><a href="../text/chapter.xhtml#end">End</a></li>
                    <li><a href="../text/chapter.xhtml#body-start">Chapter start</a></li>
                </ol></li>
                <li><a href="../other/chapter.xhtml#target">Other chapter</a></li>
            </ol></nav></body></html>` :
            `<ncx><navMap><navPoint><navLabel><text>Chapter</text></navLabel>
                <content src="../text/chapter.xhtml"/>
                <navPoint><navLabel><text>Section</text></navLabel><content src="../text/chapter.xhtml#section%201"/></navPoint>
                <navPoint><navLabel><text>Subsection</text></navLabel><content src="../text/chapter.xhtml#subsection"/></navPoint>
                <navPoint><navLabel><text>End</text></navLabel><content src="../text/chapter.xhtml#end"/></navPoint>
                <navPoint><navLabel><text>Chapter start</text></navLabel><content src="../text/chapter.xhtml#body-start"/></navPoint>
            </navPoint><navPoint><navLabel><text>Other chapter</text></navLabel>
                <content src="../other/chapter.xhtml#target"/></navPoint></navMap></ncx>`;
        const files = {
            'META-INF/container.xml': '<container><rootfile full-path="book/package.opf"/></container>',
            'book/package.opf': `<package><metadata>${fixed ? '<meta property="rendition:layout">pre-paginated</meta>' : ''}</metadata>
                <manifest>
                    <item id="nav" href="navigation%25docs/${format === 'nav' ? 'toc.xhtml' : 'toc.ncx'}"
                        ${format === 'nav' ? 'properties="nav" media-type="application/xhtml+xml"' : 'media-type="application/x-dtbncx+xml"'}/>
                    <item id="first" href="text/chapter.xhtml" media-type="application/xhtml+xml"/>
                    <item id="second" href="other/chapter.xhtml" media-type="application/xhtml+xml"/>
                </manifest><spine><itemref idref="first"/><itemref idref="second"/></spine></package>`,
            [`book/navigation%docs/${format === 'nav' ? 'toc.xhtml' : 'toc.ncx'}`]: nav,
            'book/text/chapter.xhtml': `<html><head><meta name="viewport" content="width=600,height=800"/></head><body id="body-start">
                <div style="height:1200px">Chapter start</div><div id="section 1">Section</div>
                <div style="height:1200px"></div><a name="subsection">Subsection</a>
                <div style="height:1200px"></div><div id="end">End</div></body></html>`,
            'book/other/chapter.xhtml': '<html><head><meta name="viewport" content="width=600,height=800"/></head><body><div id="target">Other chapter target</div></body></html>'
        };
        window.JSZip = { loadAsync: async () => ({
            file: path => files[path] === undefined ? null : { async: async () => files[path] }
        }) };
        await window.epubReader.loadEPUB(new File(['fixture'], 'toc.epub'));
    }, { format, fixed });
}

for (const format of ['nav', 'ncx']) {
    test(`${format} sidebar resolves nested links and fragments relative to navigation document`, async ({ page }) => {
        await page.goto('/epub-reader.html');
        await loadBook(page, format);
        const items = page.locator('.toc-item');
        await expect(items).toHaveCount(6);

        for (const [label, anchor] of [['Section', 'section 1'], ['Subsection', 'subsection'], ['End', 'end']]) {
            await items.filter({ hasText: new RegExp(`^\\s*${label}\\s*$`) }).click();
            await expect(items.filter({ hasText: new RegExp(`^\\s*${label}\\s*$`) })).toHaveClass(/active/);
            await expect(page.locator('.toc-item.active')).toHaveCount(1);
            await expect.poll(() => page.evaluate(id => {
                const reader = window.epubReader;
                const element = reader.findContentAnchor(id);
                const container = reader.elements.readerContent;
                const top = element.getBoundingClientRect().top - container.getBoundingClientRect().top;
                return top >= -1 && top <= container.clientHeight;
            }, anchor)).toBe(true);
            await expect(page.locator('#pageInfo')).toHaveText('1 / 2');
        }

        await page.waitForTimeout(500);
        await expect(page.locator('#pageInfo')).toHaveText('1 / 2');
        await items.filter({ hasText: 'Chapter start' }).click();
        await expect.poll(() => page.locator('#readerContent').evaluate(element => element.scrollTop)).toBe(0);
        await items.filter({ hasText: /^\s*End\s*$/ }).click();
        await expect(items.filter({ hasText: /^\s*End\s*$/ })).toHaveClass(/active/);
        await page.locator('#readerContent').hover();
        await page.mouse.wheel(0, 400);
        await expect(page.locator('#pageInfo')).toHaveText('2 / 2');
        await items.filter({ hasText: 'Other chapter' }).click();
        await expect(page.locator('#pageInfo')).toHaveText('2 / 2');
        await expect(page.locator('#readerContent #target')).toHaveText('Other chapter target');
        await expect(items.filter({ hasText: 'Other chapter' })).toHaveClass(/active/);
        await items.filter({ hasText: 'Chapter' }).first().click();
        await expect(page.locator('#pageInfo')).toHaveText('1 / 2');
        await expect.poll(() => page.locator('#readerContent').evaluate(element => element.scrollTop)).toBe(0);
    });
}

test('sidebar targets work in fixed layout', async ({ page }) => {
    await page.goto('/epub-reader.html');
    await loadBook(page, 'nav', true);
    await page.locator('#layoutToggle').click();
    await expect(page.locator('.fixed-page')).toBeVisible();
    await page.locator('.toc-item').filter({ hasText: 'Other chapter' }).click();
    await expect(page.locator('#pageInfo')).toHaveText('2 / 2');
    await expect(page.frameLocator('.fixed-page').locator('#target')).toHaveText('Other chapter target');
    await expect(page.locator('.toc-item.active')).toHaveText(/Other chapter/);
});
