'use strict';

const submitForm = document.getElementById('submitForm');
const contactList = document.getElementById('contactList');
const settingsButton = document.getElementById('settings');

submitForm.onsubmit = () => {
  chrome.storage.local.set({ contacts: contactList.value }, () =>
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        files: ['bootstrap.js']
      });
    }));
};

settingsButton.addEventListener('click', () => {
  if (chrome.runtime.openOptionsPage) {
    chrome.runtime.openOptionsPage();
  } else {
    window.open(chrome.runtime.getURL('options.html'));
  }
});