import * as WPP from '@wppconnect/wa-js';
import type { Message } from './types/Message';
import asyncQueue from './utils/AsyncEventQueue';
import AsyncChromeMessageManager from './utils/AsyncChromeMessageManager';
import { ChromeMessageTypes } from './types/ChromeMessageTypes';

const WebpageMessageManager = new AsyncChromeMessageManager('webpage');

async function sendMessage({ contact, message = 'Enviado por WTF', attachment = null, buttons = [], delay = 0 }: Message) {
    try {
        if (!WPP.conn.isAuthenticated()) {
            const errorMsg = 'Conecte-se primeiro!';
            WebpageMessageManager.sendMessage(ChromeMessageTypes.ADD_LOG, { level: 1, message: errorMsg, attachment: attachment != null, contact });
            return alert(errorMsg);
        }
        let result: WPP.chat.SendMessageReturn = {
            id: '',
            ack: 0,
            sendMsgResult: new Promise(resolve => resolve(WPP.whatsapp.enums.SendMsgResult.ERROR_UNKNOWN)),
        };
        if (attachment && buttons.length > 0) {
            const response = await fetch(attachment.url.toString());
            const data = await response.blob();
            result = await WPP.chat.sendFileMessage(
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
            result = await WPP.chat.sendTextMessage(contact, message, {
                createChat: true,
                waitForAck: true,
                buttons
            });
        } else if (attachment) {
            const response = await fetch(attachment.url.toString());
            const data = await response.blob();
            result = await WPP.chat.sendFileMessage(
                contact,
                new File([data], attachment.name, {
                    type: attachment.type,
                    lastModified: attachment.lastModified,
                }),
                {
                    type: 'auto-detect',
                    caption: message,
                    createChat: true,
                    waitForAck: true
                }
            );
        } else {
            result = await WPP.chat.sendTextMessage(contact, message, {
                createChat: true,
                waitForAck: true
            });
        }
        result.sendMsgResult.then(value => {
            let level = 3;
            let message = 'Mensagem enviada com sucesso!';
            if (value !== WPP.whatsapp.enums.SendMsgResult.OK) {
                level = 1;
                message = 'Falha ao enviar a mensage: ' + value;
            }
            WebpageMessageManager.sendMessage(ChromeMessageTypes.ADD_LOG, { level, message, attachment: attachment != null, contact });
        });
    } catch (error) {
        if (error instanceof Error) {
            WebpageMessageManager.sendMessage(ChromeMessageTypes.ADD_LOG, { level: 1, message: error.message, attachment: attachment != null, contact });
        }
    }
}

WebpageMessageManager.addHandler(ChromeMessageTypes.SEND_MESSAGE, async (message) => {
    return new Promise((resolve, reject) => {
        if (WPP.webpack.isReady) {
            asyncQueue.add({ eventHandler: sendMessage, detail: message })
                .then(() => {
                    resolve(true);
                })
                .catch((error) => {
                    WebpageMessageManager.sendMessage(ChromeMessageTypes.ADD_LOG, { level: 1, message: error.message, attachment: message.attachment != null, contact: message.contact });
                    reject(false);
                });
        } else {
            WPP.webpack.onReady(async () => {
                asyncQueue.add({ eventHandler: sendMessage, detail: message })
                    .then(() => {
                        resolve(true);
                    })
                    .catch((error) => {
                        WebpageMessageManager.sendMessage(ChromeMessageTypes.ADD_LOG, { level: 1, message: error.message, attachment: message.attachment != null, contact: message.contact });
                        reject(false);
                    });
            });
        }
    });
});

WebpageMessageManager.addHandler(ChromeMessageTypes.QUEUE_STATUS, async () => {
    return new Promise((resolve) => {
        resolve(asyncQueue.getStatus());
    });
});

WPP.webpack.injectLoader();