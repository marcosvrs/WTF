import AsyncChromeMessageManager from './utils/AsyncChromeMessageManager';
import type Log from './types/Log';
import { ChromeMessageTypes } from './types/ChromeMessageTypes';

const ContentScriptMessageManager = new AsyncChromeMessageManager('contentScript');

function injectScript(scriptName: string) {
  return new Promise(resolve => {
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

async function addLog({ level, message, attachment = false, contact }: Log) {
  return chrome.storage.local.get({ logs: [] }, async data => {
    const currentLogs = data.logs;
    currentLogs.push({
      level,
      message,
      attachment,
      contact,
      date: new Date().toLocaleString()
    });
    return chrome.storage.local.set({ logs: currentLogs });
  });
}

ContentScriptMessageManager.addHandler(ChromeMessageTypes.ADD_LOG, async (log) => {
  try {
    await addLog(log);
    return true;
  } catch (error) {
    return false;
  }
});

if (document.readyState === 'complete') {
  injectScript('js/wa-js.js');
} else {
  document.addEventListener('DOMContentLoaded', () => {
    injectScript('js/wa-js.js');
  });
}