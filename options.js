'use strict';

const SHOW_TOAST_CLASS = 'show';
const SAVE_OPTIONS_TEXT = 'Opções Salvas';
const LOG_CLEARED_TEXT = 'Log Limpo';
const LOG_ERROR = 1;
const LOG_WARNING = 2;
const LOG_SUCCESS = 3;

const messageTextInput = document.getElementById('message');
const attachmentInput = document.getElementById('attachment');
const clearAttachment = document.getElementById('clearAttachment');
const delayInput = document.getElementById('delay');
const checkInput = document.getElementById('check');
const titleCheckInput = document.getElementById('titleCheck');
const logsList = document.getElementById('logs');
const logLevelInput = document.getElementById('logLevel');
const clearLogsButton = document.getElementById('clearLogs');
const updateLogsButton = document.getElementById('updateLogs');
const toastContainer = document.getElementById('toast');
const closeToastButton = document.getElementById('closeToast');

let timerId;

function updateLogs(filter = 3) {
  chrome.storage.local.get(
    { message: 'Enviado por WTF', attachment: null, delay: 1000, check: 5, titleCheck: true, logs: [] },
    (data) => {
      messageTextInput.value = data.message;

      if (data.attachment !== null) {
        fetch(data.attachment.url).then((response) => response.blob()).then((blob) => {
          const myFile = new File([blob], data.attachment.name, {
            type: data.attachment.type,
            lastModified: data.attachment.lastModified,
          });
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(myFile);
          attachmentInput.files = dataTransfer.files;
        });
      }

      delayInput.value = data.delay;
      checkInput.value = data.check;
      titleCheckInput.checked = data.titleCheck;
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
        logsList.innerHTML += `<tr class="${alertClass}"><td>${log.number}</td><td>${log.message}</td><td>${!!log.attachment}</td><td>${log.date}</td></tr>`;
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

function clearFile() {
  chrome.storage.local.set(
    { attachment: null }, () => {
      attachmentInput.value = null;
      showToast(SAVE_OPTIONS_TEXT);
    }
  );
}

messageTextInput.addEventListener('change', (event) =>
  chrome.storage.local.set(
    { message: event.target.value }, () =>
    showToast(SAVE_OPTIONS_TEXT)
  )
);
attachmentInput.addEventListener('change', (event) => {
  const files = event.target.files;
  if (files.length <= 0) {
    clearFile();
  }
  const file = files[0];
  const reader = new FileReader();
  reader.onload = (ev) =>
    chrome.storage.local.set(
      { attachment: { name: file.name, type: file.type, url: ev.target.result, lastModified: file.lastModified } }, () =>
      showToast(SAVE_OPTIONS_TEXT)
    );
  reader.readAsDataURL(file);
});
clearAttachment.addEventListener('click', clearFile);
delayInput.addEventListener('change', (event) =>
  chrome.storage.local.set(
    { delay: event.target.value }, () =>
    showToast(SAVE_OPTIONS_TEXT)
  )
);
checkInput.addEventListener('change', (event) =>
  chrome.storage.local.set(
    { check: event.target.value }, () =>
    showToast(SAVE_OPTIONS_TEXT)
  )
);
titleCheckInput.addEventListener('change', (event) =>
  chrome.storage.local.set(
    { titleCheck: event.target.checked }, () =>
    showToast(SAVE_OPTIONS_TEXT)
  )
);
logLevelInput.addEventListener('change', (event) => {
  updateLogs(event.target.value);
});
clearLogsButton.addEventListener('click', () =>
  chrome.storage.local.set({ logs: [] }, () => {
    logsList.innerHTML = '';
    showToast(LOG_CLEARED_TEXT);
  })
);
closeToastButton.addEventListener('click', closeToast);
updateLogsButton.addEventListener('click', () => {
  updateLogs(logLevelInput.value);
});

updateLogs(3);