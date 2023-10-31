import Box from "../molecules/Box";
import Button from "../atoms/Button";
import QueueStatus from "../../types/QueueStatus";
import React, { Component } from "react";

export default class ProgressBox extends Component<{
    duplicatedContacts: number;
    onCancel?: React.MouseEventHandler<HTMLButtonElement>;
    onConfirm?: React.MouseEventHandler<HTMLButtonElement>;
    status?: QueueStatus;
}, {
}> {
    cancelButtonLabel = chrome.i18n.getMessage('cancelButtonLabel');
    duplicatedContactsPopup = chrome.i18n.getMessage('duplicatedContactsPopup');
    messagesLeftPopup = chrome.i18n.getMessage('messagesLeftPopup');
    messagesNotSentPopup = chrome.i18n.getMessage('messagesNotSentPopup');
    messagesSentPopup = chrome.i18n.getMessage('messagesSentPopup');
    messageTimePopup = chrome.i18n.getMessage('messageTimePopup');
    okButtonLabel = chrome.i18n.getMessage('okButtonLabel');
    sendingMessagePopup = chrome.i18n.getMessage('sendingMessagePopup');
    sendingPopup = chrome.i18n.getMessage('sendingPopup');

    formatTime = (milliseconds: number) => {
        const hours = Math.floor(milliseconds / 3_600_000);
        const minutes = Math.floor((milliseconds % 3_600_000) / 60_000);
        const seconds = Math.floor((milliseconds % 60_000) / 1000);
        const decimal = (milliseconds % 1000).toString().slice(0, 2); // Gets the first 2 decimal places

        const hoursString = hours > 0 ? `${hours}h ` : '';
        const minutesString = minutes > 0 ? `${minutes}m ` : '';
        const secondsString = seconds > 0 || (!hoursString && !minutesString) ? `${seconds}.${decimal}s` : `0.${decimal}s`;

        return `${hoursString}${minutesString}${secondsString}`;
    }

    override render() {
        return <Box
            className='w-96 h-96'
            title={this.props.status?.isProcessing ? this.sendingMessagePopup : ''}
            footer={this.props.status?.isProcessing
                ? <Button variant='danger' onClick={this.props.onCancel}>{this.cancelButtonLabel}</Button>
                : <Button variant='primary' onClick={this.props.onConfirm}>{this.okButtonLabel}</Button>}>
            <div className='grid grid-cols-2 gap-4 p-4'>
                <div>{this.messageTimePopup}</div>
                <div>{this.formatTime(this.props.status?.elapsedTime ?? 0)}</div>
                {this.props.status?.sendingMessage && <div className='col-span-2'>{this.sendingPopup}</div>}
                <div>{this.messagesSentPopup}</div>
                <div>{this.props.status?.processedItems}</div>
                <div>{this.props.status?.isProcessing ? this.messagesLeftPopup : this.messagesNotSentPopup}</div>
                <div>{this.props.status?.remainingItems}</div>
                <div>{this.duplicatedContactsPopup}</div>
                <div>{this.props.duplicatedContacts}</div>
                {this.props.status && <div className='w-full h-4 bg-gray-300 dark:bg-gray-600 rounded relative col-span-2 self-end'>
                    <div
                        className={`h-4 rounded progress-bar${this.props.status?.isProcessing ? ' progress-bar-animated' : ''}`}
                        style={{ width: `${(this.props.status?.processedItems ?? 0 / ((this.props.status?.processedItems ?? 0) + (this.props.status?.remainingItems ?? 0))) * 100}%` }}
                    ></div>
                    <div className='absolute inset-0 flex items-center justify-center'>
                        <span className='text-xs font-semibold'>
                            {Math.round((this.props.status?.processedItems ?? 0 / ((this.props.status?.processedItems ?? 0) + (this.props.status?.remainingItems ?? 0))) * 100)}%
                        </span>
                    </div>
                </div>}
            </div>
        </Box>;
    }
}