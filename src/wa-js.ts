import { ChromeMessageTypes } from './types/ChromeMessageTypes';
import AsyncChromeMessageManager from './utils/AsyncChromeMessageManager';
import asyncQueue from './utils/AsyncEventQueue';
import storageManager, { AsyncStorageManager } from './utils/AsyncStorageManager';
import type { Attachment } from 'types/Attachment';
import type { OptionsTypesWithAttachment, Message } from './types/Message';
import type { Poll } from 'types/Poll';
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

async function sendWPPMessage(message: Message) {
    if ('attachment' in message && message.attachment && message.options && 'buttons' in message.options && message.options.buttons?.length) {
        const response = await fetch(message.attachment.url.toString());
        const data = await response.blob();
        const { type, ...restOptions } = message.options ?? {};
        const mergedOptions = {
            type: type ?? 'image',
            caption: 'message' in message ? message.message : undefined,
            createChat: true,
            ...restOptions
        };
        return await WPP?.chat.sendFileMessage(
            message.contact,
            new File([data], message.attachment.name, {
                type: message.attachment.type,
                lastModified: message.attachment.lastModified,
            }),
            mergedOptions,
        );
    } else if (message.options && 'buttons' in message.options && message.options.buttons?.length) {
        const mergedOptions = {
            createChat: true,
            ...message.options
        };
        return await WPP?.chat.sendTextMessage(message.contact, 'message' in message ? message.message : undefined, mergedOptions);
    } else if ('attachment' in message && message.attachment) {
        const response = await fetch(message.attachment.url.toString());
        const data = await response.blob();
        const mergedOptions: OptionsTypesWithAttachment = {
            type: 'auto-detect',
            caption: 'message' in message ? message.message : undefined,
            createChat: true,
            ...message.options
        };
        return await WPP?.chat.sendFileMessage(
            message.contact,
            new File([data], message.attachment.name, {
                type: message.attachment.type,
                lastModified: message.attachment.lastModified,
            }),
            mergedOptions
        );
    } else if ('message' in message && typeof message.message === 'string') {
        const mergedOptions = {
            createChat: true,
            ...message.options
        };
        return await WPP?.chat.sendTextMessage(message.contact, message.message, mergedOptions);
    } else {
        throw new Error('Invalid Message!');
    }
}

async function sendWPPPoll({ contact, name, choices, options = { createChat: true } }: Poll) {
    if (options.createChat === undefined) {
        options.createChat = true;
    };
    return await WPP?.chat.sendCreatePollMessage(contact, name, choices, options);
}

async function sendMessage({ message, hash }: { message: Omit<Message, 'attachment'> | Poll, hash?: number }) {
    if (!WPP?.conn.isAuthenticated()) {
        const errorMsg = 'Conecte-se primeiro!';
        alert(errorMsg);
        throw new Error(errorMsg);
    }
    let attachment: Attachment | undefined = undefined;
    if (hash) {
        ({ attachment } = await storageManager.retrieveMessage(hash));
    }
    let result: chat.SendMessageReturn | undefined;

    let findContact = await WPP?.contact.queryExists(message.contact);
    if (!findContact) {
        let truncatedNumber = message.contact;
        if (truncatedNumber.startsWith('55') && truncatedNumber.length === 12) {
            truncatedNumber = `${truncatedNumber.substring(0, 4)}9${truncatedNumber.substring(4)}`;
        } else if (truncatedNumber.startsWith('55') && truncatedNumber.length === 13) {
            truncatedNumber = `${truncatedNumber.substring(0, 4)}${truncatedNumber.substring(5)}`;
        }
        findContact = await WPP?.contact.queryExists(truncatedNumber);
        if (!findContact) {
            return void WebpageMessageManager.sendMessage(ChromeMessageTypes.ADD_LOG, { level: 1, message: 'Número não encontrado!', attachment: attachment != null, contact: message.contact });
        }
    }

    message.contact = findContact.wid.user;

    if ('name' in message && 'choices' in message) {
        result = await sendWPPPoll(message);
    } else {
        const newMessage: Message = {
            message: 'message' in message && typeof message.message === 'string' ? message.message : '',
            ...message,
            ...({ attachment } ?? {})
        };
        result = await sendWPPMessage(newMessage);
    }

    return result?.sendMsgResult.then(value => {
        const result = (value as any).messageSendResult ?? value;
        if (result !== WPP?.whatsapp.enums.SendMsgResult.OK) {
            throw new Error('Falha ao enviar a mensagem: ' + value);
        } else {
            WebpageMessageManager.sendMessage(ChromeMessageTypes.ADD_LOG, { level: 3, message: 'Mensagem enviada com sucesso!', attachment: attachment != null, contact: message.contact });
        }
    });
}

async function addToQueue(message: Message | Poll) {
    try {
        let hash: number | undefined = undefined;
        if ('attachment' in message) {
            hash = AsyncStorageManager.calculateMessageHash(message.attachment);
            await storageManager.storeMessage(message.attachment, hash);
            delete (message as any).attachment;
        }
        await asyncQueue.add({ eventHandler: sendMessage, detail: { message, hash } });
        return true;
    } catch (error) {
        if (error instanceof Error) {
            WebpageMessageManager.sendMessage(ChromeMessageTypes.ADD_LOG, { level: 1, message: error.message, attachment: 'attachment' in message, contact: message.contact });
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

WebpageMessageManager.addHandler(ChromeMessageTypes.SEND_POLL, async (message) => {
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