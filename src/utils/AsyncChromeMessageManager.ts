import type ChromeMessageContentTypes from "types/ChromeMessageContentTypes";

interface MessageData<K extends keyof ChromeMessageContentTypes> {
  source: "WTF";
  type: K;
  payload: ChromeMessageContentTypes[K]["payload"];
}

interface MessageDataResponse<K extends keyof ChromeMessageContentTypes> {
  source: "WTF";
  type: `${K}_RESPONSE`;
  payload: ChromeMessageContentTypes[K]["response"];
}

type MessageHandler<K extends keyof ChromeMessageContentTypes> = (
  payload: ChromeMessageContentTypes[K]["payload"],
) =>
  | ChromeMessageContentTypes[K]["response"]
  | Promise<ChromeMessageContentTypes[K]["response"]>;

export default class AsyncChromeMessageManager {
  constructor(private source: "popup" | "contentScript" | "webpage") {
    if (this.source === "contentScript") {
      this.forwardMessagesFromWebpageToPopup();
      this.forwardResponsesFromPopupToWebpage();
    }
  }

  private forwardMessagesFromWebpageToPopup<
    K extends keyof ChromeMessageContentTypes,
  >() {
    window.addEventListener(
      "message",
      (event: MessageEvent<MessageData<K>>) => {
        if (
          event.source === window &&
          event.origin === window.location.origin &&
          event.data.source === "WTF"
        ) {
          void chrome.runtime.sendMessage(event.data).catch((error) => {
            console.error(
              "WTF.AsyncChromeMessageManager.forwardMessagesFromWebpageToPopup",
              error,
              event,
            );
            return;
          });
        }
      },
    );
  }

  private forwardResponsesFromPopupToWebpage<
    K extends keyof ChromeMessageContentTypes,
  >() {
    chrome.runtime.onMessage.addListener((message: MessageData<K>) => {
      if (message.source === "WTF")
        window.postMessage(message, window.location.origin);
    });
  }

  public addHandler<K extends keyof ChromeMessageContentTypes>(
    type: K,
    handler: MessageHandler<K>,
  ) {
    try {
      if (this.source !== "webpage") {
        this.addExtensionMessageHandler(type, handler);
      }
      if (this.source !== "popup") {
        this.addWebpageMessageHandler(type, handler);
      }
    } catch (error) {
      console.error("WTF.AsyncChromeMessageManager.addHandler", error);
    }
  }

  private async webpageMessageResponseHandler<
    K extends keyof ChromeMessageContentTypes,
  >(
    handler: MessageHandler<K>,
    type: K,
    payload: ChromeMessageContentTypes[K]["payload"],
  ) {
    try {
      const response = await handler(payload);
      window.postMessage(
        { source: "WTF", type: `${type}_RESPONSE`, payload: response },
        window.location.origin,
      );
    } catch (error) {
      console.error(
        `WTF.AsyncChromeMessageManager.addWebpageMessageHandler ${type}_RESPONSE`,
        error,
      );
    }
  }

  private addWebpageMessageHandler<K extends keyof ChromeMessageContentTypes>(
    type: K,
    handler: MessageHandler<K>,
  ) {
    window.addEventListener(
      "message",
      (event: MessageEvent<MessageData<K>>) => {
        if (
          event.source === window &&
          event.origin === window.location.origin &&
          event.data.type === type &&
          event.data.source === "WTF"
        ) {
          void this.webpageMessageResponseHandler(
            handler,
            type,
            event.data.payload,
          );
        }
      },
    );
  }

  private async extensionMessageResponseHandler<
    K extends keyof ChromeMessageContentTypes,
  >(
    handler: MessageHandler<K>,
    type: K,
    payload: ChromeMessageContentTypes[K]["payload"],
  ) {
    try {
      const response = await handler(payload);
      await chrome.runtime.sendMessage({
        source: "WTF",
        type: `${type}_RESPONSE`,
        payload: response,
      });
    } catch (error) {
      console.error(
        `WTF.AsyncChromeMessageManager.addExtensionMessageHandler ${type}_RESPONSE`,
        error,
      );
    }
  }

  private addExtensionMessageHandler<K extends keyof ChromeMessageContentTypes>(
    type: K,
    handler: MessageHandler<K>,
  ) {
    chrome.runtime.onMessage.addListener((message: MessageData<K>) => {
      if (message.source === "WTF" && message.type === type)
        void this.extensionMessageResponseHandler(
          handler,
          type,
          message.payload,
        );
    });
  }

  public async sendMessage<K extends keyof ChromeMessageContentTypes>(
    type: K,
    payload: ChromeMessageContentTypes[K]["payload"],
  ): Promise<ChromeMessageContentTypes[K]["response"]> {
    const message: MessageData<K> = { source: "WTF", type, payload };

    return new Promise((resolve, reject) => {
      try {
        const listener = (response: MessageDataResponse<K>) => {
          if (
            response.source === "WTF" &&
            response.type === `${type}_RESPONSE`
          ) {
            chrome.runtime.onMessage.removeListener(listener);
            resolve(response.payload);
          }
        };

        if (this.source !== "popup") {
          this.sendWebpageMessage(message, listener);
        }
        if (this.source !== "webpage") {
          this.sendExtensionMessage(message, listener);
        }
      } catch (error) {
        console.error("WTF.AsyncChromeMessageManager.sendMessage", error);
        reject(error);
      }
    });
  }

  private sendWebpageMessage<K extends keyof ChromeMessageContentTypes>(
    message: MessageData<K>,
    listener: (response: MessageDataResponse<K>) => void,
  ) {
    window.postMessage(message, window.location.origin);
    const responseListener = (event: MessageEvent<MessageDataResponse<K>>) => {
      if (
        event.source === window &&
        event.origin === window.location.origin &&
        event.data.source === "WTF" &&
        event.data.type === `${message.type}_RESPONSE`
      ) {
        listener(event.data);
        window.removeEventListener("message", responseListener);
      }
    };
    window.addEventListener("message", responseListener);
  }

  private sendExtensionMessage<K extends keyof ChromeMessageContentTypes>(
    message: MessageData<K>,
    listener: (response: MessageDataResponse<K>) => void,
  ) {
    chrome.runtime.onMessage.addListener(listener);

    if (this.source === "popup") {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
          void chrome.tabs.sendMessage(tabs[0].id, message);
        }
      });
    } else if (this.source === "contentScript") {
      void chrome.runtime.sendMessage(message).catch((error) => {
        console.error(
          "WTF.AsyncChromeMessageManager.sendExtensionMessage",
          error,
        );
      });
    }
  }
}
