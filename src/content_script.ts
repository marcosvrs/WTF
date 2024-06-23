import { ChromeMessageTypes } from "types/ChromeMessageTypes";
import type Log from "types/Log";
import AsyncChromeMessageManager from "utils/AsyncChromeMessageManager";

const ContentScriptMessageManager = new AsyncChromeMessageManager(
  "contentScript",
);

function addLog({ level, message, attachment = false, contact }: Log) {
  void chrome.storage.local.get(({ logs = [] }: { logs: Log[] }) => {
    logs.push({
      level,
      message,
      attachment,
      contact,
      date: new Date().toLocaleString(),
    });
    void chrome.storage.local.set({ logs });
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
