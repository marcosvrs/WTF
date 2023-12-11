import type { Message } from './types/Message';
import asyncQueue from './utils/AsyncEventQueue';
import AsyncChromeMessageManager from './utils/AsyncChromeMessageManager';
import storageManager, { AsyncStorageManager } from './utils/AsyncStorageManager';
import { ChromeMessageTypes } from './types/ChromeMessageTypes';
import type { chat, conn, webpack, contact, whatsapp } from '@wppconnect/wa-js';

type WPPType = {
    chat: typeof chat;
    conn: typeof conn;
    contact: typeof contact;
    webpack: typeof webpack;
    whatsapp: typeof whatsapp;
};

let WPP: WPPType | undefined;

const WebpageMessageManager = new AsyncChromeMessageManager('webpage');

async function sendWPPMessage({ contact, message, attachment, buttons = [] }: Message) {
    if (attachment && buttons.length > 0) {
        const response = await fetch(attachment.url.toString());
        const data = await response.blob();
        return await WPP?.chat.sendFileMessage(
            contact,
            new File([data], attachment.name, {
                type: attachment.type,
                lastModified: attachment.lastModified,
            }),
            {
                type: 'image',
                caption: message,
                createChat: true,
                waitForAck: true,
                buttons
            }
        );
    } else if (buttons.length > 0) {
        return await WPP?.chat.sendTextMessage(contact, message, {
            createChat: true,
            waitForAck: true,
            buttons
        });
    } else if (attachment) {
        const response = await fetch(attachment.url.toString());
        const data = await response.blob();
        return await WPP?.chat.sendFileMessage(
            contact,
            new File([data], attachment.name, {
                type: attachment.type,
                lastModified: attachment.lastModified,
            }),
            {
                type: 'auto-detect',
                caption: message,
                createChat: true
            }
        );
    } else {
        return await WPP?.chat.sendTextMessage(contact, message, {
            createChat: true
        });
    }
}

async function sendMessage({ contact, hash }: { contact: string, hash: number }) {
    if (!WPP?.conn.isAuthenticated()) {
        const errorMsg = 'Conecte-se primeiro!';
        alert(errorMsg);
        throw new Error(errorMsg);
    }
    const { message } = await storageManager.retrieveMessage(hash);

    let findContact = await WPP?.contact.queryExists(contact);
    if (!findContact) {
        let truncatedNumber = contact;
        if (truncatedNumber.startsWith('55') && truncatedNumber.length === 12) {
            truncatedNumber = `${truncatedNumber.substring(0, 4)}9${truncatedNumber.substring(4)}`;
        } else if (truncatedNumber.startsWith('55') && truncatedNumber.length === 13) {
            truncatedNumber = `${truncatedNumber.substring(0, 4)}${truncatedNumber.substring(5)}`;
        }
        findContact = await WPP?.contact.queryExists(truncatedNumber);
        if (!findContact) {
            return void WebpageMessageManager.sendMessage(ChromeMessageTypes.ADD_LOG, { level: 1, message: 'Número não encontrado!', attachment: message.attachment != null, contact });
        }
    }

    contact = findContact.wid.user;

    const result = await sendWPPMessage({ contact, ...message });
    return result?.sendMsgResult.then(value => {
        const result = (value as any).messageSendResult ?? value;
        if (result !== WPP?.whatsapp.enums.SendMsgResult.OK) {
            throw new Error('Falha ao enviar a mensagem: ' + value);
        } else {
            WebpageMessageManager.sendMessage(ChromeMessageTypes.ADD_LOG, { level: 3, message: 'Mensagem enviada com sucesso!', attachment: message.attachment != null, contact: contact });
        }
    });
}

async function addToQueue(message: Message) {
    try {
        const messageHash = AsyncStorageManager.calculateMessageHash(message);
        await storageManager.storeMessage(message, messageHash);
        await asyncQueue.add({ eventHandler: sendMessage, detail: { contact: message.contact, hash: messageHash, delay: message.delay } });
        return true;
    } catch (error) {
        if (error instanceof Error) {
            WebpageMessageManager.sendMessage(ChromeMessageTypes.ADD_LOG, { level: 1, message: error.message, attachment: message.attachment != null, contact: message.contact });
        }
        throw error;
    }
}

WebpageMessageManager.addHandler(ChromeMessageTypes.PAUSE_QUEUE, async () => {
    await asyncQueue.pause();
    return true;
});

WebpageMessageManager.addHandler(ChromeMessageTypes.RESUME_QUEUE, async () => {
    await asyncQueue.resume();
    return true;
});

WebpageMessageManager.addHandler(ChromeMessageTypes.STOP_QUEUE, async () => {
    await asyncQueue.stop();
    return true;
});

WebpageMessageManager.addHandler(ChromeMessageTypes.SEND_MESSAGE, async (message) => {
    if (WPP?.webpack.isReady) {
        return await addToQueue(message);
    } else {
        return new Promise((resolve, reject) => {
            WPP?.webpack.onReady(async () => {
                try {
                    resolve(await addToQueue(message));
                } catch (error) {
                    reject(error);
                }
            });
        });
    }
});

WebpageMessageManager.addHandler(ChromeMessageTypes.QUEUE_STATUS, async () => {
    return await asyncQueue.getStatus();
});

storageManager.clearDatabase();

// Define the callback function
function mutationCallback(mutations: MutationRecord[], observer: MutationObserver) {
    mutations.forEach(async (mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
            const targetElement = mutation.target;
            if (targetElement instanceof Element && targetElement.classList.contains('wf-loading')) {
                // call when wf-loading class is present
                console.log('Injecting loader...');
                try {
                    WPP = await import(/* webpackChunkName: "wppconnect" */ '@wppconnect/wa-js');
                    WPP?.webpack.injectLoader();
                } catch (error) {
                    console.error('Failed to load the module:', error);
                    // Handle the error or fallback logic
                }
            }
        }
    });
}

// Create a MutationObserver instance
const observer = new MutationObserver(mutationCallback);

// Options for the observer (watch for attribute changes)
const config = { attributes: true };

// Get the html element
const targetNode = document.documentElement;

// Start observing the html element
observer.observe(targetNode, config);

WPP?.webpack.onInjected(() => {
    console.log('Loader injected!');
});