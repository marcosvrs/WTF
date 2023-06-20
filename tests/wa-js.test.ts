import { test, expect } from './fixtures';
import type { Page } from '@playwright/test';
import type { Message } from '../src/types/Message';
import { promises as fs } from 'fs';
import path from 'path';
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

const assertButtons = async (page: Page, message: string, buttons: Message['buttons']) => {
    const messageParent = page.locator(`div[data-testid^="conv-msg-true_${process.env.TEST_CONTACT?.replace(/\D/g, '')}@"]`).filter({ hasText: message });
    await Promise.all(buttons.map(async (button) => {
        const buttonContainer = messageParent.getByRole('button').filter({ hasText: button.text });
        await expect(buttonContainer).toBeVisible();
        if (button.url || button.phoneNumber) {
            const span = buttonContainer.getByTestId(button.url ? 'hsm-link' : 'hsm-call');
            await expect(span).toBeVisible();
        }
    }));
};

const assertImage = async (page: Page, message: string, screenshot: string, testId = 'media-url-provider') => {
    const messageParent = page.locator(`div[data-testid^="conv-msg-true_${process.env.TEST_CONTACT?.replace(/\D/g, '')}@"]`).filter({ hasText: message });
    const image = messageParent.getByTestId(testId);
    await expect(image).toHaveScreenshot(screenshot);
};

const convertFileToAttachment = async (filePath: string): Promise<Message['attachment']> => {
    const mimeTypes = {
        '.mp3': 'audio/mpeg',
        '.mp4': 'video/mp4',
        '.pdf': 'application/pdf',
        '.png': 'image/png',
    };

    const fullFilePath = path.resolve(__dirname, filePath);
    const fileBuffer = await fs.readFile(fullFilePath);
    const base64Data = fileBuffer.toString('base64');

    const ext = path.extname(fullFilePath);

    return {
        name: path.basename(fullFilePath),
        type: mimeTypes[ext],
        lastModified: Date.now(),
        url: `data:${mimeTypes[ext]};base64,${base64Data}`
    };
};

test.describe("Send Messages via WPP", () => {
    test.beforeEach(async ({ page }, testInfo) => {
        await page.goto('https://web.whatsapp.com/', { waitUntil: 'networkidle' });
        let timeout = testInfo.timeout;
        const qrCodeContainer = page.getByTestId('qrcode');
        try {
            await qrCodeContainer.waitFor({ timeout: 5000 });
            timeout = 300000; // 5min
            qrCodeContainer.screenshot({ path: 'qrcode.png' });
            qrcode.generate(await qrCodeContainer.getAttribute('data-ref'), { small: true });
        } catch (e) {
            console.log('QR Code Error: ', e.name || e.message || e || 'Unknown error');
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

    test('expect message all button types to be sent', async ({ page }) => {
        const message = Math.random().toString(36).substring(7);
        const buttons = [
            {
                id: 'id',
                text: Math.random().toString(36).substring(7)
            }, {
                phoneNumber: '9999999999999',
                text: Math.random().toString(36).substring(7)
            }, {
                url: 'https://google.com',
                text: Math.random().toString(36).substring(7)
            }
        ];
        const parent = await sendMessage(page, {
            contact: process.env.TEST_CONTACT?.replace(/\D/g, '') || '',
            message,
            attachment: null,
            buttons
        });
        await parent.click();
        await assertButtons(page, message, buttons);
    });

    test('expect message with one ID button to be sent', async ({ page }) => {
        // Can't send more than one ID button per message.
        const message = Math.random().toString(36).substring(7);
        const buttons = [
            {
                id: 'id',
                text: Math.random().toString(36).substring(7)
            }
        ];
        const parent = await sendMessage(page, {
            contact: process.env.TEST_CONTACT?.replace(/\D/g, '') || '',
            message,
            attachment: null,
            buttons
        });
        await parent.click();
        await assertButtons(page, message, buttons);
    });

    test('expect message with Phone Number buttons to be sent', async ({ page }) => {
        const message = Math.random().toString(36).substring(7);
        const buttons = [
            {
                phoneNumber: '9999999999999',
                text: Math.random().toString(36).substring(7)
            }, {
                phoneNumber: '9999999999999',
                text: Math.random().toString(36).substring(7)
            }, {
                phoneNumber: '9999999999999',
                text: Math.random().toString(36).substring(7)
            }
        ];
        const parent = await sendMessage(page, {
            contact: process.env.TEST_CONTACT?.replace(/\D/g, '') || '',
            message,
            attachment: null,
            buttons
        });
        await parent.click();
        await assertButtons(page, message, buttons);
    });

    test('expect message with Link buttons to be sent', async ({ page }) => {
        const message = Math.random().toString(36).substring(7);
        const buttons = [
            {
                url: 'https://google.com',
                text: Math.random().toString(36).substring(7)
            }, {
                url: 'https://google.com',
                text: Math.random().toString(36).substring(7)
            }, {
                url: 'https://google.com',
                text: Math.random().toString(36).substring(7)
            }
        ];
        const parent = await sendMessage(page, {
            contact: process.env.TEST_CONTACT?.replace(/\D/g, '') || '',
            message,
            attachment: null,
            buttons
        });
        await parent.click();
        await assertButtons(page, message, buttons);
    });

    test('expect message with PNG attachment to be sent', async ({ page }) => {
        const message = Math.random().toString(36).substring(7);
        const parent = await sendMessage(page, {
            contact: process.env.TEST_CONTACT?.replace(/\D/g, '') || '',
            message,
            attachment: await convertFileToAttachment('../public/icons/wtf128.png'),
            buttons: []
        });
        await parent.click();
        await assertImage(page, message, 'wtf128.png');
    });

    // Doesn't work at the moment on Desktop
    test.skip('expect message with PDF attachment to be sent', async ({ page }) => {
        const message = Math.random().toString(36).substring(7);
        const parent = await sendMessage(page, {
            contact: process.env.TEST_CONTACT?.replace(/\D/g, '') || '',
            message,
            attachment: await convertFileToAttachment('wa-js.test.ts-snapshots/sample.pdf'),
            buttons: []
        });
        await parent.click();
        await assertImage(page, message, 'sample.pdf');
    });

    // Doesn't work at the moment on Desktop
    test.skip('expect message with MP3 attachment to be sent', async ({ page }) => {
        const message = Math.random().toString(36).substring(7);
        const parent = await sendMessage(page, {
            contact: process.env.TEST_CONTACT?.replace(/\D/g, '') || '',
            message,
            attachment: await convertFileToAttachment('wa-js.test.ts-snapshots/demo.mp3'),
            buttons: []
        });
        await parent.click();
        await assertImage(page, message, 'demo.mp3');
    });

    test('expect message with MP4 attachment to be sent', async ({ page }) => {
        const message = Math.random().toString(36).substring(7);
        const parent = await sendMessage(page, {
            contact: process.env.TEST_CONTACT?.replace(/\D/g, '') || '',
            message,
            attachment: await convertFileToAttachment('wa-js.test.ts-snapshots/sample.mp4'),
            buttons: []
        });
        await parent.click();
        await assertImage(page, message, 'sample.mp4.png', 'video-content');
    });

    test('expect message with PNG attachment and all button types to be sent', async ({ page }) => {
        const message = Math.random().toString(36).substring(7);
        const buttons = [
            {
                id: 'id',
                text: Math.random().toString(36).substring(7)
            }, {
                phoneNumber: '9999999999999',
                text: Math.random().toString(36).substring(7)
            }, {
                url: 'https://google.com',
                text: Math.random().toString(36).substring(7)
            }
        ];
        const parent = await sendMessage(page, {
            contact: process.env.TEST_CONTACT?.replace(/\D/g, '') || '',
            message,
            attachment: await convertFileToAttachment('../public/icons/wtf128.png'),
            buttons
        });
        await parent.click();
        await assertButtons(page, message, buttons);
        await assertImage(page, message, 'wtf128-with-buttons.png');
    });
});