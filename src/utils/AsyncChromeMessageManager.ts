import ChromeMessageContentTypes from "types/ChromeMessageContentTypes";

type MessageData<K extends keyof ChromeMessageContentTypes> = {
  type: K;
  payload: ChromeMessageContentTypes[K]["payload"];
};

type MessageDataResponse<K extends keyof ChromeMessageContentTypes> = {
  type: `${K}_RESPONSE`;
  payload: ChromeMessageContentTypes[K]["response"];
};

type MessageHandler<K extends keyof ChromeMessageContentTypes> = (
  payload: ChromeMessageContentTypes[K]["payload"]
) => Promise<ChromeMessageContentTypes[K]["response"]>;

export default class AsyncChromeMessageManager {
  constructor(private source: "popup" | "contentScript" | "webpage") {
    if (this.source === "contentScript") {
      this.forwardMessagesFromWebpageToPopup();
      this.forwardResponsesFromPopupToWebpage();
    }
  }

  private forwardMessagesFromWebpageToPopup() {
    window.addEventListener("message", (event) => {
      if (event.source === window && event.origin === window.location.origin) {
        chrome.runtime.sendMessage(event.data);
      }
    });
  }

  private forwardResponsesFromPopupToWebpage() {
    chrome.runtime.onMessage.addListener((message) => {
      window.postMessage(message, window.location.origin);
    });
  }

  public addHandler<K extends keyof ChromeMessageContentTypes>(type: K, handler: MessageHandler<K>) {
    try {
      if (this.source === "webpage") {
        this.addWebpageMessageHandler(type, handler);
      } else {
        this.addExtensionMessageHandler(type, handler);
      }
    } catch (error) {
      console.error('WTF.AsyncChromeMessageManager.addHandler', error);
    }
  }

  private addWebpageMessageHandler<K extends keyof ChromeMessageContentTypes>(type: K, handler: MessageHandler<K>) {
    window.addEventListener("message", (event) => {
      if (event.source === window && event.origin === window.location.origin && event.data.type === type) {
        handler(event.data.payload).then((response) => {
          window.postMessage({ type: `${type}_RESPONSE`, payload: response }, window.location.origin);
        }).catch((error) => {
          console.error(`WTF.AsyncChromeMessageManager.addWebpageMessageHandler ${type}_RESPONSE`, error);
        });
      }
    });
  }

  private addExtensionMessageHandler<K extends keyof ChromeMessageContentTypes>(type: K, handler: MessageHandler<K>) {
    chrome.runtime.onMessage.addListener((message) => {
      if (message.type === type) {
        handler(message.payload).then((response) => {
          chrome.runtime.sendMessage({ type: `${type}_RESPONSE`, payload: response });
        }).catch((error) => {
          console.error(`WTF.AsyncChromeMessageManager.addExtensionMessageHandler ${type}_RESPONSE`, error);
        });
      }
    });
  }

  public async sendMessage<K extends keyof ChromeMessageContentTypes>(
    type: K,
    payload: ChromeMessageContentTypes[K]["payload"]
  ): Promise<ChromeMessageContentTypes[K]["response"]> {
    const message: MessageData<K> = { type, payload };

    return new Promise((resolve, reject) => {
      try {
        const listener = (response: MessageDataResponse<K>) => {
          if (response.type === `${type}_RESPONSE`) {
            chrome.runtime.onMessage.removeListener(listener);
            resolve(response.payload);
          }
        };

        if (this.source === "webpage") {
          this.sendWebpageMessage(message, listener);
        } else {
          chrome.runtime.onMessage.addListener(listener);
          this.sendExtensionMessage(message);
        }
      } catch (error) {
        console.error('WTF.AsyncChromeMessageManager.sendMessage', error)
        reject(error);
      }
    });
  }

  private sendWebpageMessage<K extends keyof ChromeMessageContentTypes>(
    message: MessageData<K>, listener: (response: MessageDataResponse<K>) => void
  ) {
    window.postMessage(message, window.location.origin);
    const responseListener = (event: MessageEvent) => {
      if (event.source === window && event.origin === window.location.origin) {
        listener(event.data);
        window.removeEventListener("message", responseListener);
      }
    };
    window.addEventListener("message", responseListener);
  }

  private sendExtensionMessage<K extends keyof ChromeMessageContentTypes>(
    message: MessageData<K>
  ) {
    if (this.source === "popup") {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0].id) {
          chrome.tabs.sendMessage(tabs[0].id, message);
        }
      });
    } else if (this.source === "contentScript") {
      chrome.runtime.sendMessage(message);
    }
  }
}