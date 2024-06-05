import type { MessageButtonsTypes } from "@wppconnect/wa-js/dist/chat/functions/prepareMessageButtons";
import type { ChangeEvent, FormEvent } from "react";
import { Component } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import Button from "./components/atoms/Button";
import { ControlTextArea } from "./components/atoms/ControlFactory";
import Box from "./components/molecules/Box";
import { ChromeMessageTypes } from "./types/ChromeMessageTypes";
import type QueueStatus from "./types/QueueStatus";
import AsyncChromeMessageManager from "./utils/AsyncChromeMessageManager";
import type { Attachment } from "types/Attachment";

const PopupMessageManager = new AsyncChromeMessageManager("popup");

class Popup extends Component<
  unknown,
  {
    contacts: string;
    duplicatedContacts: number;
    confirmed: boolean;
    status?: QueueStatus | undefined;
  }
> {
  constructor(props: unknown) {
    super(props);
    this.state = {
      contacts: "",
      duplicatedContacts: 0,
      confirmed: true,
      status: undefined,
    };
  }

  duplicatedNumberPopup = chrome.i18n.getMessage("duplicatedNumberPopup");
  sendingMessagePopup = chrome.i18n.getMessage("sendingMessagePopup");
  messageTimePopup = chrome.i18n.getMessage("messageTimePopup");
  sendingPopup = chrome.i18n.getMessage("sendingPopup");
  waitingPopup = chrome.i18n.getMessage("waitingPopup");
  messagesSentPopup = chrome.i18n.getMessage("messagesSentPopup");
  duplicatedContactsPopup = chrome.i18n.getMessage("duplicatedContactsPopup");
  messagesLeftPopup = chrome.i18n.getMessage("messagesLeftPopup");
  messagesNotSentPopup = chrome.i18n.getMessage("messagesNotSentPopup");
  prefixFooterNotePopup = chrome.i18n.getMessage("prefixFooterNotePopup");
  messagePlaceholderPopup = chrome.i18n.getMessage("messagePlaceholderPopup");
  cancelButtonLabel = chrome.i18n.getMessage("cancelButtonLabel");
  okButtonLabel = chrome.i18n.getMessage("okButtonLabel");
  optionsButtonLabel = chrome.i18n.getMessage("optionsButtonLabel");
  sendButtonLabel = chrome.i18n.getMessage("sendButtonLabel");
  defaultMessage = chrome.i18n.getMessage("defaultMessage");

  queueStatusListener = 0;

  override componentDidMount() {
    const body = document.querySelector("body");
    if (!body) return;
    body.classList.add("bg-gray-100");
    body.classList.add("dark:bg-gray-900");

    this.updateStatus();
    this.queueStatusListener = window.setInterval(this.updateStatus, 100);
  }

  updateStatus = () => {
    void PopupMessageManager.sendMessage(
      ChromeMessageTypes.QUEUE_STATUS,
      undefined,
    ).then((status) => {
      this.setState({ status });
    });
  };

  override componentWillUnmount() {
    clearInterval(this.queueStatusListener);
  }

  override componentDidUpdate(
    _prevProps: Readonly<unknown>,
    prevState: Readonly<{
      contacts: string;
      confirmed: boolean;
      status?: QueueStatus | undefined;
    }>,
  ) {
    if (!prevState.status?.isProcessing && this.state.status?.isProcessing) {
      this.setState({ confirmed: false });
    }
  }

  handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    this.setState({
      contacts: event.target.value.replace(/[^\d\n\t,;]*/g, ""),
    });
  };

  parseContacts = (prefix: number) => {
    const prefixToString = (prefix === 0 ? "" : prefix).toString();
    const contactList = this.state.contacts
      .split(/[\n\t,;]/)
      .filter((str) => str.trim() !== "");
    const pristinedContactsWithPrefix = contactList.map((s) =>
      prefixToString.concat(s.trim().replace(/[\D]*/g, "")),
    );

    this.setState({ duplicatedContacts: 0 });

    return pristinedContactsWithPrefix.filter(
      (contact: string, index: number) => {
        const result = pristinedContactsWithPrefix.indexOf(contact) === index;
        if (!result) {
          this.setState((prevState) => ({
            duplicatedContacts: prevState.duplicatedContacts + 1,
          }));
          void PopupMessageManager.sendMessage(ChromeMessageTypes.ADD_LOG, {
            level: 2,
            message: this.duplicatedNumberPopup,
            attachment: false,
            contact,
          });
        }

        return result;
      },
    );
  };

  handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    const language = chrome.i18n.getUILanguage();
    void chrome.storage.local.get(
      {
        message: this.defaultMessage,
        attachment: undefined,
        buttons: [],
        delay: 0,
        prefix: language === "pt_BR" ? 55 : 0,
      },
      (data) => {
        for (const contact of this.parseContacts(data["prefix"] as number)) {
          void PopupMessageManager.sendMessage(
            ChromeMessageTypes.SEND_MESSAGE,
            {
              contact,
              message: data["message"] as string,
              attachment: data["attachment"] as Attachment,
              buttons: data["buttons"] as MessageButtonsTypes[],
              delay: (data["delay"] as number | undefined) ?? 0,
            },
          );
        }
      },
    );
    event.preventDefault();
  };

  handleOptions = () => {
    if (chrome.runtime.openOptionsPage) {
      void chrome.runtime.openOptionsPage();
    } else {
      window.open(chrome.runtime.getURL("options.html"));
    }
  };

  formatTime = (milliseconds: number) => {
    const hours = Math.floor(milliseconds / 3600000);
    const minutes = Math.floor((milliseconds % 3600000) / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    const decimal = (milliseconds % 1000).toString().substr(0, 2); // Gets the first 2 decimal places

    const hoursString = hours > 0 ? `${hours}h ` : "";
    const minutesString = minutes > 0 ? `${minutes}m ` : "";
    const secondsString =
      seconds > 0 || (!hoursString && !minutesString)
        ? `${seconds}.${decimal}s`
        : `0.${decimal}s`;

    return `${hoursString}${minutesString}${secondsString}`;
  };

  override render() {
    return (
      <>
        {!this.state.confirmed && (
          <Box
            className="w-96 h-96"
            title={
              this.state.status?.isProcessing ? this.sendingMessagePopup : ""
            }
            footer={
              this.state.status?.isProcessing ? (
                <Button
                  variant="danger"
                  onClick={() =>
                    void PopupMessageManager.sendMessage(
                      ChromeMessageTypes.STOP_QUEUE,
                      undefined,
                    )
                  }
                >
                  {this.cancelButtonLabel}
                </Button>
              ) : (
                <Button
                  variant="primary"
                  onClick={() => this.setState({ confirmed: true })}
                >
                  {this.okButtonLabel}
                </Button>
              )
            }
          >
            <div className="grid grid-cols-2 gap-4 p-4">
              <div>{this.messageTimePopup}</div>
              <div>{this.formatTime(this.state.status?.elapsedTime ?? 0)}</div>
              {this.state.status?.sendingMessage && (
                <div className="col-span-2">{this.sendingPopup}</div>
              )}
              {this.state.status?.waiting && <div>{this.waitingPopup}</div>}
              {this.state.status?.waiting && (
                <div>{this.formatTime(this.state.status.waiting)}</div>
              )}
              <div>{this.messagesSentPopup}</div>
              <div>{this.state.status?.processedItems}</div>
              <div>
                {this.state.status?.isProcessing
                  ? this.messagesLeftPopup
                  : this.messagesNotSentPopup}
              </div>
              <div>{this.state.status?.remainingItems}</div>
              <div>{this.duplicatedContactsPopup}</div>
              <div>{this.state.duplicatedContacts}</div>
              {this.state.status && (
                <div className="w-full h-4 bg-gray-300 dark:bg-gray-600 rounded relative col-span-2 self-end">
                  <div
                    className={`h-4 rounded progress-bar${this.state.status?.isProcessing ? " progress-bar-animated" : ""}`}
                    style={{
                      width: `${(this.state.status?.processedItems / (this.state.status?.processedItems + this.state.status?.remainingItems)) * 100}%`,
                    }}
                  ></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-semibold">
                      {Math.round(
                        (this.state.status?.processedItems /
                          (this.state.status?.processedItems +
                            this.state.status?.remainingItems)) *
                          100,
                      )}
                      %
                    </span>
                  </div>
                </div>
              )}
            </div>
          </Box>
        )}
        {this.state.confirmed && (
          <form onSubmit={this.handleSubmit}>
            <Box
              className="w-96 h-96"
              bodyClassName="p-4"
              footer={this.prefixFooterNotePopup}
            >
              <ControlTextArea
                className="flex-auto"
                value={this.state.contacts}
                onChange={this.handleChange}
                placeholder={this.messagePlaceholderPopup}
                required
              />
              <div className="flex justify-between items-center">
                <Button variant="primary" type="submit">
                  {this.sendButtonLabel}
                </Button>
                <Button
                  variant="secondary"
                  type="button"
                  onClick={this.handleOptions}
                >
                  {this.optionsButtonLabel}
                </Button>
              </div>
            </Box>
          </form>
        )}
      </>
    );
  }
}

createRoot(document.getElementById("root")!).render(<Popup />);
