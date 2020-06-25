// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

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

(() => {
    const LANDING_WINDOW_CLASS = 'app-wrapper-web';

    const landingWindowElement = document.getElementsByClassName(LANDING_WINDOW_CLASS);
    if (0 === landingWindowElement.length) {
        alert('Faça o Login Primeiro!');

        return;
    }

    const vitorChat = document.querySelector('[title="Vitor Corrêa"]');
    simulateMouseEvents(vitorChat, 'mousedown');
    setTimeout(() => {
        const inputChat = document.querySelector('[data-tab="1"]');
        simulateTextEvents(inputChat, 'O Vitor é um Viadinho!');
        setTimeout(() => {
            const sendButton = document.querySelector('footer [data-icon="send"]');
            sendButton.click();
        }, 100);
    }, 100);
})();