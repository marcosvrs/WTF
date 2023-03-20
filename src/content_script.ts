function injectScript(scriptName: string) {
  return new Promise(function (resolve) {
    var s = document.createElement('script');
    s.src = chrome.runtime.getURL(scriptName);
    s.onload = function () {
      if (this instanceof HTMLElement && this.parentNode !== null) {
        this.parentNode.removeChild(this);
      }
      resolve(true);
    };
    (document.head || document.documentElement).appendChild(s);
  });
}

function addLog({ level, message, attachment = false, contact }: { level: number, message: string, attachment: boolean, contact: string }) {
  chrome.storage.local.get({ logs: [] }, data => {
    const currentLogs = data.logs;
    currentLogs.push({
      level,
      message,
      attachment,
      contact,
      date: (new Date()).toLocaleString()
    });
    chrome.storage.local.set({ logs: currentLogs });
  });
}

window.addEventListener('message', event => {
  // We only accept messages from ourselves
  if (event.source !== window) {
    return;
  }

  if (event.data.type && (event.data.type === 'LOG')) {
    addLog(event.data);
  }
}, false);

if (document.readyState === 'complete') {
  injectScript('js/wa-js.js');
} else {
  document.addEventListener('DOMContentLoaded', () => {
    injectScript('js/wa-js.js');
  });
}