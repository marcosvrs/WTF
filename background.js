'use strict';

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ contacts: '' });
  chrome.storage.sync.get(['message', 'delay'], (data) => {
    if (undefined === data.delay) {
      chrome.storage.sync.set({ delay: 1000 });
    }
    if (undefined === data.message) {
      chrome.storage.sync.set({ message: 'Enviado por WTF' });
    }
  });
  chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
    chrome.declarativeContent.onPageChanged.addRules([{
      conditions: [new chrome.declarativeContent.PageStateMatcher({
        pageUrl: { hostEquals: 'web.whatsapp.com' },
      })],
      actions: [new chrome.declarativeContent.ShowPageAction()]
    }]);
  });
});
