import AsyncChromeMessageManager from './utils/AsyncChromeMessageManager';
import type Log from './types/Log';
import { ChromeMessageTypes } from './types/ChromeMessageTypes';

const ContentScriptMessageManager = new AsyncChromeMessageManager('contentScript');

function addLog({ level, message, attachment = false, contact }: Log) {
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

ContentScriptMessageManager.addHandler(ChromeMessageTypes.ADD_LOG, (log) => {
  try {
    addLog(log);
    return true;
  } catch (error) {
    return false;
  }
});
