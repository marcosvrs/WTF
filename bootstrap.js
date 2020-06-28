'use strict';

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function setLog(log) {
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
        setLog('[ERRO] Login requerido');

        return false;
    }

    return true;
}

function parseContacts(contacts) {
    const fn = [',', ';', '\t', '\n'].reduceRight((nextFn, delimiter) => v => String(v).split(delimiter).map(nextFn),
        v => v);

    return fn(contacts);
}

async function sendMessage(contact, message, delay) {
    const SLEEP_DELAY = 500;

    if (null === contact || undefined === contact) {
        return;
    }

    console.log({ contact });

    const filteredContact = contact.replace(/\D/g, '');
    if (null === filteredContact || '' === filteredContact || undefined === filteredContact) {
        setLog(`[AVISO] O Número de telefone "${contact}" é inválido.`);

        return;
    }

    const newContactLink = document.createElement('a');
    newContactLink.setAttribute('href', `whatsapp://send?phone=${filteredContact}&text=${encodeURI(message)}`);
    document.body.append(newContactLink);
    newContactLink.click();
    document.body.removeChild(newContactLink);

    await sleep(SLEEP_DELAY);

    const numberUnavailableModal = document.getElementsByClassName('overlay');

    if (0 < numberUnavailableModal.length) {
        setLog(`[AVISO] O Número de telefone "${contact}" é inválido.`);

        return;
    }

    const sendButton = document.querySelector('footer [data-icon="send"]');
    sendButton.click();

    setLog(`[SUCESSO] Mensagem enviada para "${contact}".`)

    await sleep(delay);
}

chrome.storage.sync.get({ contacts: '', message: 'Enviado por WTF', delay: 1000 }, async function (data) {
    if (!isLogin()) {
        return;
    }
    let contacts = parseContacts(data.contacts).flat(Infinity);
    for (const contact of contacts) {
        await sendMessage(contact, data.message, data.delay);
    }
});