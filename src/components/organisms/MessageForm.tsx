import { type ChangeEvent, Component, createRef } from "react";
import Button from "../atoms/Button";
import { ControlTextArea } from "../atoms/ControlFactory";
import Box from "../molecules/Box";
import SelectCountryCode from "../molecules/SelectCountryCode";
import type { Attachment } from "types/Attachment";
import type { Message } from "types/Message";

export default class MessageForm extends Component<
  { className?: string },
  { message: string; attachment?: Attachment | null; delay: number }
> {
  constructor(props: { className?: string }) {
    super(props);
    this.defaultMessage = chrome.i18n.getMessage("defaultMessage");
    this.state = {
      message: this.defaultMessage,
      attachment: undefined,
      delay: 0,
    };
  }

  fileRef = createRef<HTMLInputElement>();
  defaultMessage: string;
  titleMessageForm = chrome.i18n.getMessage("titleMessageForm");
  attachmentLabelMessageForm = chrome.i18n.getMessage(
    "attachmentLabelMessageForm",
  );
  cleanButtonLabel = chrome.i18n.getMessage("cleanButtonLabel");
  footerLabelMessageForm = chrome.i18n.getMessage("footerLabelMessageForm");
  footerSuggestionMessageForm = chrome.i18n.getMessage(
    "footerSuggestionMessageForm",
  );
  delayLabelMessageForm = chrome.i18n.getMessage("delayLabelMessageForm");
  countryCodePrefixMessageForm = chrome.i18n.getMessage(
    "countryCodePrefixMessageForm",
  );

  override componentDidMount() {
    chrome.storage.local.get(
      ({
        message = this.defaultMessage,
        attachment,
        delay = 0,
      }: Omit<Message, "contact">) => {
        this.setState({
          message,
          attachment,
          delay,
        });
        if (attachment?.url && this.fileRef.current) {
          void fetch(attachment.url)
            .then((response) => response.blob())
            .then((blob) => {
              const myFile = new File([blob], attachment.name, {
                  type: attachment.type,
                  lastModified: attachment.lastModified,
                }),
                dataTransfer = new DataTransfer();
              dataTransfer.items.add(myFile);
              if (this.fileRef.current)
                this.fileRef.current.files = dataTransfer.files;
            });
        } else {
          console.log("No attachment to set");
        }
      },
    );
  }

  override componentDidUpdate(
    _prevProps: Readonly<{ className?: string }>,
    prevState: Readonly<{
      message: string;
      attachment?: Attachment;
      delay: number;
    }>,
  ) {
    const { message, attachment, delay } = this.state;

    if (prevState.message !== message)
      void chrome.storage.local.set({ message });

    if (prevState.delay !== delay) void chrome.storage.local.set({ delay });

    if (prevState.attachment?.url !== attachment?.url)
      void chrome.storage.local.set({ attachment });
  }

  handleMessageChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    this.setState({ message: event.target.value });
  };

  handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const file = event.target.files.item(0);
      if (!file) {
        console.error("No file selected");
        return;
      }

      const reader = new FileReader();
      reader.onload = (ev) => {
        if (!ev.target?.result) {
          console.error("No file content");
          return;
        }
        const decoder = new TextDecoder("utf-8"); // Assuming UTF-8 encoding

        this.setState({
          attachment: {
            name: file.name,
            type: file.type,
            url:
              typeof ev.target.result === "string"
                ? ev.target.result
                : decoder.decode(ev.target.result),
            lastModified: file.lastModified,
          },
        });
      };
      reader.readAsDataURL(file);
    } else {
      this.setState({ attachment: undefined });
    }
  };

  handleFileClear = () => {
    if (!this.fileRef.current) return;
    this.fileRef.current.files = new DataTransfer().files;
    this.setState({ attachment: undefined });
  };

  override render() {
    const { message, attachment } = this.state;

    return (
      <Box
        className={this.props.className}
        title={this.titleMessageForm}
        footer={
          <>
            <p className="mb-1">{this.footerLabelMessageForm}</p>
            <p>{this.footerSuggestionMessageForm}</p>
          </>
        }
      >
        <div className="mt-4 mx-4 flex flex-row gap-4">
          <div className="flex flex-col basis-1/2">
            <ControlTextArea
              value={message}
              onChange={this.handleMessageChange}
            />
          </div>
          <div
            className={[
              "px-4",
              "py-6",
              "flex",
              "flex-col",
              "flex-auto",
              "basis-1/2",
              "border-2",
              "border-dashed",
              "border-slate-400",
              "dark:border-slate-600",
              "rounded-lg",
            ].join(" ")}
          >
            <label
              htmlFor="attachment"
              className="mb-2 text-center cursor-pointer"
            >
              {attachment?.name ? (
                attachment.name
              ) : (
                <>
                  <p className="mb-2 text-2xl">🖼</p>
                  <p className="text-sm text-slate-800 dark:text-slate-200">
                    {this.attachmentLabelMessageForm}
                  </p>
                </>
              )}
            </label>
            <input
              id="attachment"
              name="attachment"
              className="hidden"
              type="file"
              ref={this.fileRef}
              onChange={this.handleFileChange}
            />
            {Boolean(attachment) && (
              <Button variant="danger" onClick={this.handleFileClear}>
                {this.cleanButtonLabel}
              </Button>
            )}
          </div>
        </div>
        <div className="mx-4 flex items-center">
          <label htmlFor="delay">
            {this.delayLabelMessageForm} (
            <span className="font-mono">{this.state.delay.toFixed(1)}s</span>):
          </label>
          <input
            type="range"
            id="delay"
            name="delay"
            min="0"
            max="10"
            step="0.1"
            value={this.state.delay}
            onChange={(e) => {
              this.setState({ delay: Number(e.target.value) });
            }}
            className={[
              "w-full",
              "h-1.5",
              "bg-slate-100",
              "dark:bg-slate-900",
              "border",
              "border-slate-400",
              "dark:border-slate-600",
              "accent-slate-600",
              "dark:accent-slate-400",
              "appearance-none",
              "outline-none",
              "rounded-full",
              "cursor-pointer",
              "transition-shadow",
              "ease-in-out",
              "duration-150",
              "hover:bg-blue-100",
              "dark:hover:bg-blue-900",
              "focus:shadow-equal",
              "focus:shadow-blue-800",
              "dark:focus:shadow-blue-200",
              "focus:outline-none",
            ].join(" ")}
          />
        </div>
        <div className="mb-4 mx-4 flex flex-col">
          <label className="mb-2">{this.countryCodePrefixMessageForm}</label>
          <SelectCountryCode />
        </div>
      </Box>
    );
  }
}
