import WPP from "@wppconnect/wa-js";
import { ChromeMessageTypes } from "./types/ChromeMessageTypes";
import type { Message } from "./types/Message";
import AsyncChromeMessageManager from "./utils/AsyncChromeMessageManager";
import asyncQueue from "./utils/AsyncEventQueue";
import storageManager, {
  AsyncStorageManager,
} from "./utils/AsyncStorageManager";

declare global {
  interface Window {
    WPP: typeof WPP;
  }
}

const WebpageMessageManager = new AsyncChromeMessageManager("webpage");

async function sendWPPMessage({
  contact,
  message,
  attachment,
  buttons = [],
}: Message) {
  if (attachment && buttons.length > 0) {
    const response = await fetch(attachment.url);
    const data = await response.blob();
    return window.WPP.chat.sendFileMessage(
      contact,
      new File([data], attachment.name, {
        type: attachment.type,
        lastModified: attachment.lastModified,
      }),
      {
        type: "image",
        caption: message,
        createChat: true,
        waitForAck: true,
        buttons,
      },
    );
  } else if (buttons.length > 0) {
    return window.WPP.chat.sendTextMessage(contact, message, {
      createChat: true,
      waitForAck: true,
      buttons,
    });
  } else if (attachment) {
    const response = await fetch(attachment.url);
    const data = await response.blob();
    return window.WPP.chat.sendFileMessage(
      contact,
      new File([data], attachment.name, {
        type: attachment.type,
        lastModified: attachment.lastModified,
      }),
      {
        type: "auto-detect",
        caption: message,
        createChat: true,
        waitForAck: true,
      },
    );
  } else {
    return window.WPP.chat.sendTextMessage(contact, message, {
      createChat: true,
      waitForAck: true,
    });
  }
}

async function sendMessage({
  contact,
  hash,
}: {
  contact: string;
  hash: number;
}) {
  if (!window.WPP.conn.isAuthenticated()) {
    const errorMsg = "Conecte-se primeiro!";
    alert(errorMsg);
    throw new Error(errorMsg);
  }
  const { message } = await storageManager.retrieveMessage(hash);

  let findContact = await window.WPP.contact.queryExists(contact);
  if (!findContact) {
    let truncatedNumber = contact;
    if (truncatedNumber.startsWith("55") && truncatedNumber.length === 12) {
      truncatedNumber = `${truncatedNumber.substring(0, 4)}9${truncatedNumber.substring(4)}`;
    } else if (
      truncatedNumber.startsWith("55") &&
      truncatedNumber.length === 13
    ) {
      truncatedNumber = `${truncatedNumber.substring(0, 4)}${truncatedNumber.substring(5)}`;
    }
    findContact = await window.WPP.contact.queryExists(truncatedNumber);
    if (!findContact) {
      void WebpageMessageManager.sendMessage(ChromeMessageTypes.ADD_LOG, {
        level: 1,
        message: "Number not found!",
        attachment: !!message.attachment,
        contact,
      });
      throw new Error("Number not found!");
    }
  }

  contact = findContact.wid.user;

  const result = await sendWPPMessage({ contact, ...message });
  return result?.sendMsgResult.then(
    (value: { messageSendResult?: string } | string) => {
      const result: string | undefined =
        typeof value === "string"
          ? value
          : "messageSendResult" in value
            ? value.messageSendResult
            : undefined;
      if (result !== window.WPP.whatsapp.enums.SendMsgResult.OK) {
        void WebpageMessageManager.sendMessage(ChromeMessageTypes.ADD_LOG, {
          level: 1,
          message: `Failed to send the message: ${JSON.stringify(value)}`,
          attachment: !!message.attachment,
          contact: contact,
        });
        throw new Error(`Failed to send the message: ${JSON.stringify(value)}`);
      } else {
        void WebpageMessageManager.sendMessage(ChromeMessageTypes.ADD_LOG, {
          level: 3,
          message: "Message sent sucessfully!",
          attachment: !!message.attachment,
          contact: contact,
        });
      }
    },
  );
}

async function addToQueue(message: Message) {
  try {
    const messageHash = AsyncStorageManager.calculateMessageHash(message);
    await storageManager.storeMessage(message, messageHash);
    await asyncQueue.add({
      eventHandler: sendMessage,
      detail: {
        delay: message.delay,
        contact: message.contact,
        hash: messageHash,
      },
    });
    return true;
  } catch (error) {
    if (error instanceof Error) {
      void WebpageMessageManager.sendMessage(ChromeMessageTypes.ADD_LOG, {
        level: 1,
        message: error.message,
        attachment: !!message.attachment,
        contact: message.contact,
      });
    }
    throw error;
  }
}

WebpageMessageManager.addHandler(ChromeMessageTypes.PAUSE_QUEUE, () => {
  try {
    asyncQueue.pause();
    return true;
  } catch (error) {
    return false;
  }
});

WebpageMessageManager.addHandler(ChromeMessageTypes.RESUME_QUEUE, () => {
  try {
    asyncQueue.resume();
    return true;
  } catch (error) {
    return false;
  }
});

WebpageMessageManager.addHandler(ChromeMessageTypes.STOP_QUEUE, () => {
  try {
    asyncQueue.stop();
    return true;
  } catch (error) {
    return false;
  }
});

WebpageMessageManager.addHandler(
  ChromeMessageTypes.SEND_MESSAGE,
  async (message) => {
    if (window.WPP.isReady) {
      return addToQueue(message);
    } else {
      return new Promise((resolve, reject) => {
        window.WPP.webpack.onReady(() => {
          addToQueue(message).then(resolve).catch(reject);
        });
      });
    }
  },
);

WebpageMessageManager.addHandler(ChromeMessageTypes.QUEUE_STATUS, () =>
  asyncQueue.getStatus(),
);

void storageManager.clearDatabase();

WPP.webpack?.onInjected(() => {
  console.log("WTF: Loader injected!");
});

WPP.webpack?.injectLoader();
