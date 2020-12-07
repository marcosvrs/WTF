'use strict';

const SHOW_TOAST_CLASS = 'show';
const SAVE_OPTIONS_TEXT = 'Opções Salvas';
const LOG_CLEARED_TEXT = 'Log Limpo';
const LOG_ERROR = 1;
const LOG_WARNING = 2;
const LOG_SUCCESS = 3;

const messageTextInput = document.getElementById('message');
const delayInput = document.getElementById('delay');
const checkInput = document.getElementById('check');
const logsList = document.getElementById('logs');
const logLevelInput = document.getElementById('logLevel');
const clearLogsButton = document.getElementById('clearLogs');
const updateLogsButton = document.getElementById('updateLogs');
const toastContainer = document.getElementById('toast');
const closeToastButton = document.getElementById('closeToast');

let timerId;

function updateLogs(filter = 3) {
  chrome.storage.sync.get(
    { message: 'Enviado por WTF', delay: 1000, check: 3, logs: [] },
    (data) => {
      messageTextInput.value = data.message;
      delayInput.value = data.delay;
      checkInput.value = data.check;
      logsList.innerHTML = '';
      data.logs.reverse().forEach((log) => {
        if (log.level > filter) {
          return;
        }
        let alertClass = 'table-primary';
        switch (log.level) {
          case LOG_ERROR:
            alertClass = 'table-danger';
            break;
          case LOG_WARNING:
            alertClass = 'table-warning';
            break;
          case LOG_SUCCESS:
            alertClass = 'table-success';
            break;
          default:
            alertClass = 'table-primary';
            break;
        }
        logsList.innerHTML += `<tr class="${alertClass}"><td>${log.number}</td><td>${log.message}</td><td>${log.date}</td></tr>`;
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

messageTextInput.addEventListener('change', (event) =>
  chrome.storage.sync.set(
    { message: event.target.value }, () =>
    showToast(SAVE_OPTIONS_TEXT)
  )
);
delayInput.addEventListener('change', (event) =>
  chrome.storage.sync.set(
    { delay: event.target.value }, () =>
    showToast(SAVE_OPTIONS_TEXT)
  )
);
checkInput.addEventListener('change', (event) =>
  chrome.storage.sync.set(
    { check: event.target.value }, () =>
    showToast(SAVE_OPTIONS_TEXT)
  )
);
logLevelInput.addEventListener('change', (event) => {
  updateLogs(event.target.value);
});
clearLogsButton.addEventListener('click', () =>
  chrome.storage.sync.set({ logs: [] }, () => {
    logsList.innerHTML = '';
    showToast(LOG_CLEARED_TEXT);
  })
);
closeToastButton.addEventListener('click', closeToast);
updateLogsButton.addEventListener('click', () => {
  updateLogs(logLevelInput.value);
});

updateLogs(3);