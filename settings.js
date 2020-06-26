'use strict';

const messageText = document.getElementById('message');
chrome.storage.sync.get('message', (data) => {
  messageText.value = data.message;
});
messageText.addEventListener('change', () =>
  chrome.storage.sync.set({ message: messageText.value })
);
const delay = document.getElementById('delay');
chrome.storage.sync.get('delay', (data) => {
  delay.value = data.delay;
});
delay.addEventListener('change', () =>
  chrome.storage.sync.set({ delay: delay.value })
);