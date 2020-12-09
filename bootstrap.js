'use strict';

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function eventClickFire(el) {
    var evt = document.createEvent("MouseEvents");
    evt.initMouseEvent('click', true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
    el.dispatchEvent(evt);
}

function addLog(level, logMessage, logNumber = null) {
    chrome.storage.sync.get({ logs: [] }, (data) => {
        const currentLogs = data.logs;
        currentLogs.push({
            level: level,
            message: logMessage,
            number: logNumber,
            date: (new Date()).toLocaleString()
        });
        chrome.storage.sync.set({ logs: currentLogs });
    });
}

function isLogin() {
    const LANDING_WINDOW_CLASS = 'landing-window';

    const landingWindowElement = document.getElementsByClassName(LANDING_WINDOW_CLASS);
    if (0 < landingWindowElement.length) {
        alert('Faça o Login Primeiro!');
        addLog(1, 'Login requerido');

        return false;
    }

    return true;
}

function parseContacts(contacts) {
    const fn = [',', ';', '\t', '\n'].reduceRight((nextFn, delimiter) => v => String(v).split(delimiter).map(nextFn),
        v => v);
    const parsedContacts = fn(contacts);
    const flatContacts = parsedContacts.flat(Infinity);

    return flatContacts.filter((contact, index) => {
        const result = flatContacts.indexOf(contact) === index;
        if (!result) {
            addLog(2, 'Número duplicado.', contact);
        }

        return result;
    });
}

async function sendMessage(contact, message, check, titleCheck) {
    const SLEEP_DELAY = 500;
    const OVERLAY_BUTTON_CSS_SELECTOR = '.overlay [role="button"]';
    const SEND_BUTTON_CSS_SELECTOR = 'footer [data-testid="send"]';

    if (undefined === contact || null === contact || '' === contact) {
        return;
    }

    const filteredContact = contact.replace(/\D/g, '');
    if (undefined === filteredContact || null === filteredContact || '' === filteredContact) {
        addLog(1, 'O Número é inválido.', contact);

        return;
    }

    const newContactLink = document.createElement('a');
    newContactLink.setAttribute('href', `whatsapp://send?phone=${filteredContact}&text=${encodeURI(message)}`);
    document.body.append(newContactLink);
    newContactLink.click();
    document.body.removeChild(newContactLink);

    let repeat = 0;
    let fail = 1;
    while (repeat <= check) {
        if (titleCheck) {
            const chatTitle = document.querySelector(`#main [title$="${filteredContact.substring(filteredContact.length - 4)}"]`);

            if (chatTitle === null) {
                fail = 1;
                repeat++;
                await sleep(SLEEP_DELAY);

                continue;
            }
        }

        const sendButton = document.querySelector(SEND_BUTTON_CSS_SELECTOR);

        if (sendButton === null) {
            fail = 1;
            repeat++;
            await sleep(SLEEP_DELAY);

            continue;
        }

        eventClickFire(sendButton);

        fail = 0;

        break;
    }

    if (fail > 0) {
        const numberUnavailableModal = document.querySelector(OVERLAY_BUTTON_CSS_SELECTOR);

        if (numberUnavailableModal !== null) {
            eventClickFire(numberUnavailableModal);
            addLog(1, 'Número não encontrado pelo WhatsApp.', contact);
        } else {
            addLog(1, 'Falha ao tentar abrir conversa. Verifique o número ou tente aumentar as tentativas de verificações.', contact);
        }

        return false;
    }

    addLog(3, 'Mensagem enviada', contact);

    return true;
}

chrome.storage.sync.get({ contacts: '', message: 'Enviado por WTF', delay: 1000, check: 5, titleCheck: true }, async function (data) {
    if (!isLogin()) {
        return;
    }
    let contacts = parseContacts(data.contacts);
    let i = 0;
    for (const contact of contacts) {
        if (true === await sendMessage(contact, data.message, data.check, data.titleCheck)) {
            i++;
        }
        await sleep(data.delay);
    }
    alert(`${i} Mensagens Enviadas!`);
});