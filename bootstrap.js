'use strict';

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function simulateMouseEvents(element, eventName) {
    var mouseEvent = document.createEvent('MouseEvents');
    mouseEvent.initEvent(eventName, true, true);
    element.dispatchEvent(mouseEvent);
}
function simulateTextEvents(element, text) {
    var textEvent = new Event('input', {
        bubbles: true
    });
    element.innerHTML = text;
    element.focus();
    element.dispatchEvent(textEvent);
}

async function sendMessage(contact, message, delay) {
    const SLEEP_DELAY = 500;
    console.log('start execution for the contact:', contact);
    const LANDING_WINDOW_CLASS = 'landing-window';
    const NEW_CONTACT_BUTTON_ID = 'startNonContactChat';

    const landingWindowElement = document.getElementsByClassName(LANDING_WINDOW_CLASS);
    if (0 < landingWindowElement.length) {
        alert('Faça o Login Primeiro!');

        return false;
    }

    const newContactButton = document.getElementById(NEW_CONTACT_BUTTON_ID);
    if (null === newContactButton) {
        alert('Faça o Download e configure WA Web Plus for Whatsapp corretamente!')

        return false;
    }
    newContactButton.click();

    await sleep(SLEEP_DELAY);

    const newContactInput = document.querySelector('.alerty-prompt input');
    const newContactOkButton = document.querySelector('.alerty-action .btn-ok');
    if (null === newContactInput) {
        alert('Faça o Download e configure WA Web Plus for Whatsapp corretamente!')

        return false;
    }
    newContactInput.value = contact;
    newContactOkButton.click();

    await sleep(SLEEP_DELAY);

    const inputChat = document.querySelector('[data-tab="1"]');
    simulateTextEvents(inputChat, message);

    await sleep(SLEEP_DELAY);

    const sendButton = document.querySelector('footer [data-icon="send"]');
    sendButton.click();

    await sleep(delay);

    console.log('ends the execution for the contact:', contact);
    return true;
}

chrome.storage.sync.get(['contacts', 'message', 'delay'], async function (data) {
    const contacts = data.contacts.split(',');
    for (const contact of contacts) {
        if (null === contact || '' === contact || undefined === contact) {
            continue;
        }
        const filteredContact = contact.replace(/\D/g, '');
        if (null === filteredContact || '' === filteredContact || undefined === filteredContact) {
            alert('Defina um número válido para ', contact);

            break;
        }
        console.log({ filteredContact });
        await sendMessage(filteredContact, data.message, data.delay);
    }
});

//+55 13 99775-2190,+55 13 99662-0588,+55 13 99775-2190,+55 13 99662-0588,+55 13 99775-2190,+55 13 99662-0588,+55 13 99775-2190,+55 13 99662-0588,+55 13 99775-2190,+55 13 99662-0588,