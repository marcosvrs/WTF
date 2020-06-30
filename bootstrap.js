'use strict';

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function addLog(log) {
    chrome.storage.sync.get({ logs: [] }, (data) => {
        const currentLogs = data.logs;
        currentLogs.push(log + ` [${(new Date()).toLocaleString()}]`);
        chrome.storage.sync.set({ logs: currentLogs });
    });
}

function isLogin() {
    const LANDING_WINDOW_CLASS = 'landing-window';

    const landingWindowElement = document.getElementsByClassName(LANDING_WINDOW_CLASS);
    if (0 < landingWindowElement.length) {
        alert('Faça o Login Primeiro!');
        addLog('[ERRO] Login requerido');

        return false;
    }

    return true;
}

function parseContacts(contacts) {
    const fn = [',', ';', '\t', '\n'].reduceRight((nextFn, delimiter) => v => String(v).split(delimiter).map(nextFn),
        v => v);
    const parsedContacts = fn(contacts);

    return parsedContacts.flat(Infinity);
}

async function sendMessage(contact, message, delay) {
    const SLEEP_DELAY = 500;
    const OVERLAY_CLASS_NAME = 'overlay';
    const OVERLAY_BUTTON_CSS_SELECTOR = '[role="button"]';
    const SEND_BUTTON_CSS_SELECTOR = 'footer [data-icon="send"]';

    if (undefined === contact || null === contact || '' === contact) {
        return;
    }

    const filteredContact = contact.replace(/\D/g, '');
    if (undefined === filteredContact || null === filteredContact || '' === filteredContact) {
        addLog(`[AVISO] O Número de telefone "${contact}" é inválido.`);

        return;
    }

    const newContactLink = document.createElement('a');
    newContactLink.setAttribute('href', `whatsapp://send?phone=${filteredContact}&text=${encodeURI(message)}`);
    document.body.append(newContactLink);
    newContactLink.click();
    document.body.removeChild(newContactLink);

    await sleep(SLEEP_DELAY);

    const numberUnavailableModal = document.getElementsByClassName(OVERLAY_CLASS_NAME);

    if (0 < numberUnavailableModal.length) {
        addLog(`[AVISO] O Número de telefone "${contact}" é inválido.`);
        numberUnavailableModal[0].querySelector(OVERLAY_BUTTON_CSS_SELECTOR).click();

        return;
    }

    const sendButton = document.querySelector(SEND_BUTTON_CSS_SELECTOR);
    sendButton.click();

    addLog(`[SUCESSO] Mensagem enviada para "${contact}".`)

    await sleep(delay);

    return true;
}

chrome.storage.sync.get({ contacts: '', message: 'Enviado por WTF', delay: 1000 }, async function (data) {
    if (!isLogin()) {
        return;
    }
    let contacts = parseContacts(data.contacts);
    let i = 0;
    for (const contact of contacts) {
        if (true === await sendMessage(contact, data.message, data.delay)) {
            i++;
        }
    }
    alert(`${i} Mensagens Enviadas!`);
});