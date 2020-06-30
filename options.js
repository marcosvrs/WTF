'use strict';

const SHOW_TOAST_CLASS = 'show';
const SAVE_OPTIONS_TEXT = 'Opções Salvas';
const LOG_CLEARED_TEXT = 'Log Limpo';

const messageTextInput = document.getElementById('message');
const delayInput = document.getElementById('delay');
const logsList = document.getElementById('logs');
const clearLogsButton = document.getElementById('clearLogs');
const updateLogsButton = document.getElementById('updateLogs');
const toastContainer = document.getElementById('toast');
const closeToastButton = document.getElementById('closeToast');

let timerId;

function updateLogs() {
  chrome.storage.sync.get(
    { message: 'Enviado por WTF', delay: 1000, logs: [] },
    (data) => {
      messageTextInput.value = data.message;
      delayInput.value = data.delay;
      logsList.innerHTML = '';
      data.logs.reverse().forEach((log) => {
        let alertClass = 'list-group-item-primary';
        switch (true) {
          case log.startsWith('[ERRO]'):
            alertClass = 'list-group-item-danger';
            break;
          case log.startsWith('[AVISO]'):
            alertClass = 'list-group-item-warning';
            break;
          case log.startsWith('[SUCESSO]'):
            alertClass = 'list-group-item-success';
            break;
          default:
            alertClass = 'list-group-item-primary';
            break;
        }
        logsList.innerHTML += `<li class="list-group-item ${alertClass}">${log}</li>`;
      });
    });
}

function showToast(message) {
  closeToast();
  toastContainer.querySelector('#toastMessage').innerText = message;
  toastContainer.classList.add('show');
  timerId = setTimeout(closeToast, 3000);
}

function closeToast() {
  timerId = undefined;
  toastContainer.classList.remove('show');
}

messageTextInput.addEventListener('change', () =>
  chrome.storage.sync.set(
    { message: messageTextInput.value }, () =>
    showToast(SAVE_OPTIONS_TEXT)
  )
);
delayInput.addEventListener('change', () =>
  chrome.storage.sync.set(
    { delay: delayInput.value }, () =>
    showToast(SAVE_OPTIONS_TEXT)
  )
);
clearLogsButton.addEventListener('click', () =>
  chrome.storage.sync.set({ logs: [] }, () => {
    logsList.innerHTML = '';
    showToast(LOG_CLEARED_TEXT);
  })
);
closeToastButton.addEventListener('click', closeToast);
updateLogsButton.addEventListener('click', updateLogs);

updateLogs();