import { test as base, chromium, type BrowserContext } from '@playwright/test';
import os from 'os';
import path from 'path';
import * as wajs from '@wppconnect/wa-js';

declare global {
    interface Window {
        WPP?: typeof wajs;
    }
    const WPP: typeof wajs | undefined;
}

export const test = base.extend<{
    context: BrowserContext;
    extensionId: string;
}>({
    context: async ({ browserName }, use) => {
        const pathToExtension = path.join(__dirname, '../dist');
        let userDataDir = path.join(os.tmpdir(), `wa-js-test-${browserName}`);
        if (process.env.WORKSPACE) {
            userDataDir = path.join(process.env.WORKSPACE, `wa-js-test-${browserName}`);
        }
        const context = await chromium.launchPersistentContext(userDataDir, {
            args: [
                `--headless=new`, // the new headless arg for chrome v109+. Use '--headless=chrome' as arg for browsers v94-108.
                `--disable-extensions-except=${pathToExtension}`,
                `--load-extension=${pathToExtension}`,
            ],
        });
        await use(context);
        // await context.close();
    },
    extensionId: async ({ context }, use) => {
        let [background] = context.serviceWorkers();
        if (!background)
            background = await context.waitForEvent('serviceworker');

        const extensionId = background.url().split('/')[2];
        await use(extensionId);
    }
});
export const expect = test.expect;