const path = require('path');
const { test, expect } = require('@playwright/test');

const fixtureEPUBPath = path.join(__dirname, '..', 'fixtures', 'accessible_epub_3.epub');

test.describe('Papyrus EPUB Reader', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/epub-reader.html');
    });

    test('renders default reader shell', async ({ page }) => {
        await expect(page.locator('.logo')).toHaveText('Papyrus');
        await expect(page.locator('#emptyState')).toBeVisible();
        await expect(page.locator('#readerContent')).toBeEmpty();
        await expect(page.locator('#prevChapter')).toBeDisabled();
        await expect(page.locator('#nextChapter')).toBeDisabled();
    });

    test('loads the accessible EPUB artifact and enables chapter navigation', async ({ page }) => {
        await page.setInputFiles('#fileInput', fixtureEPUBPath);

        await expect(page.locator('#loading')).not.toHaveClass(/active/, { timeout: 30_000 });
        await expect(page.locator('#emptyState')).toBeHidden();
        await expect(page.locator('#pageInfo')).toHaveText(/1\s*\/\s*\d+/, { timeout: 30_000 });

        const contentHtml = await page.locator('#readerContent').innerHTML();
        expect(contentHtml.trim().length).toBeGreaterThan(0);

        const pageInfoText = (await page.locator('#pageInfo').textContent()) || '';
        const totalChapters = Number.parseInt(pageInfoText.split('/')[1], 10);

        if (Number.isFinite(totalChapters) && totalChapters > 1) {
            await expect(page.locator('#nextChapter')).toBeEnabled();

            await page.click('#nextChapter');
            await expect(page.locator('#pageInfo')).toHaveText(/2\s*\/\s*\d+/, { timeout: 30_000 });

            await page.click('#prevChapter');
            await expect(page.locator('#pageInfo')).toHaveText(/1\s*\/\s*\d+/, { timeout: 30_000 });
        }

        const tocItems = page.locator('.toc-item');
        await expect(tocItems.first()).toBeVisible({ timeout: 30_000 });
    });
});
