import { test, expect } from './fixtures';
import type { Page } from '@playwright/test';
import type { Message } from '../src/types/Message';
import qrcode from 'qrcode-terminal';

const sendMessage = async (page: Page, payload: Message) => {
    await page.evaluate(([payload]) => {
        window.postMessage({
            type: 'SEND_MESSAGE',
            payload
        }, window.location.origin);
    }, [payload]);

    await page.waitForSelector(`span[title="${process.env.TEST_CONTACT}"]`);

    const parent = page.locator('div[data-testid^="list-item-"]').filter({ hasText: process.env.TEST_CONTACT });
    const status = parent.getByTestId('status-check');
    await status.waitFor();
    const lastMessage = parent.getByTestId('last-msg-status');

    await expect(lastMessage).toHaveText(payload.message);

    return parent;
};

test.describe("navigation", () => {
    test.beforeEach(async ({ page }, testInfo) => {
        await page.goto('https://web.whatsapp.com/', { waitUntil: 'networkidle' });
        let timeout = testInfo.timeout;
        const qrCodeContainer = page.getByTestId('qrcode');
        try {
            await qrCodeContainer.waitFor({ timeout: 10000 });
            timeout = 300001; // 5min
            qrCodeContainer.screenshot({ path: 'qrcode.png' });
            qrcode.generate(await qrCodeContainer.getAttribute('data-ref'), { small: true });
        } catch (e) {
            console.log(e);
        }
        testInfo.setTimeout(timeout);
        await page.getByTestId('intro-title').waitFor();
    });

    test('expect message to be sent', async ({ page }) => {
        await sendMessage(page, {
            contact: process.env.TEST_CONTACT?.replace(/\D/g, '') || '',
            message: Math.random().toString(36).substring(7),
            attachment: null,
            buttons: []
        });
    });
});