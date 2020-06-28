'use strict';

const messageTextInput = document.getElementById('message');
const delayInput = document.getElementById('delay');
const logsList = document.getElementById('logs');
const clearLogsButton = document.getElementById('clearLogs');
const updateLogsButton = document.getElementById('updateLogs');

function updateLogs() {
  chrome.storage.sync.get({ message: 'Enviado por WTF', delay: 1000, logs: [] }, (data) => {
    messageTextInput.value = data.message;
    delayInput.value = data.delay;
    logsList.innerHTML = '';
    data.logs.reverse().forEach((log) => {
      let alertClass = 'list-group-item-primary';
      switch (true) {
        case log.startsWith('[ERRO]'):
          log.replace('[ERRO]', '');
          alertClass = 'list-group-item-danger';
          break;
        case log.startsWith('[AVISO]'):
          log.replace('[AVISO]', '');
          alertClass = 'list-group-item-warning';
          break;
        case log.startsWith('[SUCESSO]'):
          log.replace('[SUCESSO]', '');
          alertClass = 'list-group-item-success';
          break;
        default:
          alertClass = 'list-group-item-primary';
          break;
      }
      logsList.innerHTML += `<li class="list-group-item ${alertClass}">${log.trim()}</li>`;
    });
  });
}

messageTextInput.addEventListener('change', () =>
  chrome.storage.sync.set({ message: messageTextInput.value })
);
delayInput.addEventListener('change', () =>
  chrome.storage.sync.set({ delay: delayInput.value })
);
clearLogsButton.addEventListener('click', () => {
  chrome.storage.sync.set({ logs: [] });
  logsList.innerHTML = '';
});
updateLogsButton.addEventListener('click', () => updateLogs());

updateLogs();