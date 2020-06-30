'use strict';

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ contacts: '' });
  chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
    chrome.declarativeContent.onPageChanged.addRules([{
      conditions: [new chrome.declarativeContent.PageStateMatcher({
        pageUrl: { hostEquals: 'web.whatsapp.com', schemes: ['https'] }
      })],
      actions: [new chrome.declarativeContent.ShowPageAction()]
    }]);
  });
});
