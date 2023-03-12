'use strict';

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function eventClickFire(el) {
    var evt = document.createEvent("MouseEvents");
    evt.initMouseEvent('click', true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
    el.dispatchEvent(evt);
}

function addLog(level, logMessage, attachment = false, logNumber = null) {
    chrome.storage.local.get({ logs: [] }, (data) => {
        const currentLogs = data.logs;
        currentLogs.push({
            level: level,
            message: logMessage,
            attachment: attachment,
            number: logNumber,
            date: (new Date()).toLocaleString()
        });
        chrome.storage.local.set({ logs: currentLogs });
    });
}

function isLogin() {
    const LANDING_WINDOW_CLASS = 'landing-window';

    const landingWindowElement = document.getElementsByClassName(LANDING_WINDOW_CLASS);
    if (0 < landingWindowElement.length) {
        alert('Faça o Login Primeiro!');
        throw new Error('Login requerido')
    }
}

function parseContacts(contacts) {
    const fn = [',', ';', '\t', '\n'].reduceRight((nextFn, delimiter) => v => String(v).split(delimiter).map(nextFn),
        v => v);
    const parsedContacts = fn(contacts);
    const flatContacts = parsedContacts.flat(Infinity);

    return flatContacts.filter((contact, index) => {
        const result = flatContacts.indexOf(contact) === index;
        if (!result) {
            addLog(2, 'Número duplicado.', false, contact);
        }

        return result;
    });
}

async function sendAttachment(attachment) {
    const SLEEP_DELAY = 1500;
    const ATTACHMENT_MENU_BUTTON_CSS_SELECTOR = '[data-testid="clip"]';
    const ATTACHMENT_INPUT_CSS_SELECTOR = '[data-testid="mi-attach-media"] input[type=file]';


    const menuButton = document.querySelector(ATTACHMENT_MENU_BUTTON_CSS_SELECTOR);

    if (menuButton === null) {
        addLog(1, 'Attachment Button Not Found.');
        return false;
    }

    menuButton.click();


    await sleep(SLEEP_DELAY);
    
    const attachmentInput = document.querySelector('[data-testid="mi-attach-media"] input[type=file]');
    
    if (attachmentInput === null) {
        addLog(1, 'Attachment Input Not Found.');
        return false;
    }
    
    const response = await fetch(attachment.url);
    const data = await response.blob();
    
    const myFile = new File([data], attachment.name, {
        type: attachment.type,
        lastModified: attachment.lastModified,
    });
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(myFile);
    attachmentInput.files = dataTransfer.files;
    attachmentInput.dispatchEvent(new Event('change', { 'bubbles': true }));
    
    await sleep(SLEEP_DELAY);
    
    addLog(3, 'Attachment added');
    return true;
}

async function sendMessage(contact, message, attachment, check, titleCheck) {
    const SLEEP_DELAY = 500;
    const OVERLAY_BUTTON_CSS_SELECTOR = '.overlay [role="button"]';
    const SEND_BUTTON_CSS_SELECTOR = '[data-testid="send"]';

    if (undefined === contact || null === contact || '' === contact) {
        return;
    }

    const filteredContact = contact.replace(/\D/g, '');
    if (undefined === filteredContact || null === filteredContact || '' === filteredContact) {
        throw new Error('O Número é inválido.');
    }

    const newContactLink = document.createElement('a');
    newContactLink.setAttribute('href', `whatsapp://send?phone=${filteredContact}&text=${encodeURI(message)}`);
    document.body.append(newContactLink);
    newContactLink.click();
    document.body.removeChild(newContactLink);

    let repeat = 0;
    let fail = 1;
    while (repeat <= check) {
        await sleep(SLEEP_DELAY);
        if (repeat > 0) {
            addLog(2, `Trying for the ${repeat} time`, attachment !== null, contact);
        }

        if (titleCheck) {
            const chatTitle = document.querySelector(`#main [title$="${filteredContact.substring(filteredContact.length - 4)}"]`);

            if (chatTitle === null) {
                fail = 1;
                repeat++;

                continue;
            }
        }

        if (attachment !== null) {
            if (false === await sendAttachment(attachment)) {
                fail = 1;
                repeat++;

                continue;
            }
        }

        const sendButton = document.querySelector(SEND_BUTTON_CSS_SELECTOR);

        if (sendButton === null) {
            fail = 1;
            repeat++;

            continue;
        }

        sendButton.click();

        fail = 0;

        break;
    }

    if (fail > 0) {
        const numberUnavailableModal = document.querySelector(OVERLAY_BUTTON_CSS_SELECTOR);

        if (numberUnavailableModal !== null) {
            eventClickFire(numberUnavailableModal);
            throw new Error('Número não encontrado pelo WhatsApp.');
        } else {
            throw new Error('Falha ao tentar abrir conversa. Verifique o número ou tente aumentar as tentativas de verificações.');
        }
    }

    addLog(3, 'Mensagem enviada', attachment !== null, contact);
}

chrome.storage.local.get({ contacts: '', message: 'Enviado por WTF', attachment: null, delay: 1000, check: 5, titleCheck: true }, async function (data) {
    try {
        isLogin();
    } catch (error) {
        addLog(1, error.message);
    }
    let contacts = parseContacts(data.contacts);
    let i = 0;
    for (const contact of contacts) {
        try {
            await sendMessage(contact, data.message, data.attachment, data.check, data.titleCheck);
            i++;
        } catch (error) {
            addLog(1, error.message, data.attachment !== null, contact);
        }
        await sleep(data.delay);
    }
    alert(`${i} Mensagens Enviadas!`);
});