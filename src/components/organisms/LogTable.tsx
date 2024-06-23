import { Component } from "react";
import Button from "../atoms/Button";
import Box from "../molecules/Box";
import type Log from "types/Log";

export default class LogTable extends Component<
  { className?: string },
  { logs: Log[] }
> {
  constructor(props: { className?: string }) {
    super(props);
    this.state = {
      logs: [],
    };
  }

  logTableTitle = chrome.i18n.getMessage("logTableTitle");
  numberLogTableTitle = chrome.i18n.getMessage("numberLogTableTitle");
  messageLogTableTitle = chrome.i18n.getMessage("messageLogTableTitle");
  attachmentLogTableTitle = chrome.i18n.getMessage("attachmentLogTableTitle");
  datetimeLogTableTitle = chrome.i18n.getMessage("datetimeLogTableTitle");
  updateButtonLabel = chrome.i18n.getMessage("updateButtonLabel");
  cleanButtonLabel = chrome.i18n.getMessage("cleanButtonLabel");

  override componentDidMount() {
    void chrome.storage.local.get(({ logs = [] }: { logs: Log[] }) => {
      this.setState({ logs });
    });
  }

  handleClear = () => {
    void chrome.storage.local.set({ logs: [] });
    this.setState({ logs: [] });
  };

  handleUpdate = () => {
    void chrome.storage.local.get(({ logs = [] }: { logs: Log[] }) => {
      this.setState({ logs });
    });
  };

  override render() {
    const logLevelClass: Record<number, string> = {
      1: "bg-red-100 dark:bg-red-900 hover:bg-red-200 dark:hover:bg-red-800",
      2: "bg-yellow-100 dark:bg-yellow-900 hover:bg-yellow-200 dark:hover:bg-yellow-800",
      3: "bg-green-100 dark:bg-green-900 hover:bg-green-200 dark:hover:bg-green-800",
    };

    return (
      <Box
        className={this.props.className}
        title={this.logTableTitle}
        headerButtons={
          <div className="flex justify-end gap-4">
            <Button variant="primary" onClick={this.handleUpdate}>
              {this.updateButtonLabel}
            </Button>
            <Button variant="secondary" onClick={this.handleClear}>
              {this.cleanButtonLabel}
            </Button>
          </div>
        }
      >
        <table className="mx-4 table-auto">
          <thead>
            <tr className="text-left font-bold">
              <th className="px-4 py-2 text-center">
                {this.numberLogTableTitle}
              </th>
              <th className="px-4 py-2 text-center">
                {this.messageLogTableTitle}
              </th>
              <th className="px-4 py-2 text-center">
                {this.attachmentLogTableTitle}
              </th>
              <th className="px-4 py-2 text-center">
                {this.datetimeLogTableTitle}
              </th>
            </tr>
          </thead>
          <tbody>
            {this.state.logs.map((log, index) => (
              <tr key={index} className={logLevelClass[log.level]}>
                <td className="border px-4 py-2">{log.contact}</td>
                <td className="border px-4 py-2">{log.message}</td>
                <td className="border px-4 py-2 text-center">
                  {log.attachment ? "✓" : "×"}
                </td>
                <td className="border px-4 py-2">{log.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Box>
    );
  }
}
