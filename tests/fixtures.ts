import { test as base, chromium } from '@playwright/test';
import { tmpdir } from 'os';
import { join } from 'path';

export const test = base.extend({
    context: async ({ browserName }, use) => {
        const pathToExtension = join(__dirname, '../dist');
        let userDataDir = join(tmpdir(), `wa-js-test-${browserName}`);
        if (process.env.WORKSPACE) {
            userDataDir = join(process.env.WORKSPACE, `wa-js-test-${browserName}`);
        }
        const browserArgs = [
            `--disable-extensions-except=${pathToExtension}`,
            `--load-extension=${pathToExtension}`,
        ];
        if (process.env.CI) {
            browserArgs.push('--disable-gpu', '--headless=new');
        }
        const context = await chromium.launchPersistentContext(userDataDir, {
            args: browserArgs,
        });
        await use(context);
        await context.close();
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