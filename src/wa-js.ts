import * as WPP from '@wppconnect/wa-js';

async function sendMessage({ contact, message, attachment }: { contact: string, message: string, attachment: { url: string, name: string, type: string, lastModified: number } }) {
    try {
        contact = contact.replace(/[\D]*/g, '');
        if (!WPP.conn.isAuthenticated()) {
            const errorMsg = 'Conecte-se primeiro!';
            window.postMessage({ type: 'LOG', level: 1, message: errorMsg, attachment: attachment !== null, contact });
            return alert(errorMsg);
        }
        let result: WPP.chat.SendMessageReturn = {
            id: '',
            ack: 0,
            sendMsgResult: new Promise((resolve) => resolve(WPP.whatsapp.enums.SendMsgResult.ERROR_UNKNOWN)),
        };
        if (attachment) {
            const response = await fetch(attachment.url);
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
        result.sendMsgResult.then((value) => {
            let level = 3;
            let message = 'Mensagem enviada com sucesso!';
            if (value !== WPP.whatsapp.enums.SendMsgResult.OK) {
                level = 1;
                message = 'Falha ao enviar a mensage: ' + value;
            }
            window.postMessage({ type: 'LOG', level, message, attachment: attachment !== null, contact });
        });
    } catch (error) {
        if (error instanceof Error) {
            window.postMessage({ type: 'LOG', level: 1, message: error.message, attachment: attachment !== null, contact });
        }
    }
}

window.addEventListener('sendMessage', async (event: CustomEventInit) => {
    if (event.detail === undefined) return;
    if (WPP.webpack.isReady) {
        await sendMessage(event.detail);
    }
    WPP.webpack.onReady(async () => {
        await sendMessage(event.detail);
    });
});

WPP.webpack.injectLoader();