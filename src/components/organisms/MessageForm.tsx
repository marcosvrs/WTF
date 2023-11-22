import React, { ChangeEvent, Component, createRef, MouseEvent } from 'react';
import type { Attachment } from '../../types/Attachment';
import Button from '../atoms/Button';
import { ControlTextArea } from '../atoms/ControlFactory';
import Box from '../molecules/Box';
import SelectCountryCode from '../molecules/SelectCountryCode';

export default class MessageForm extends Component<{ className?: string }, { message: string, attachment: Attachment, delay: number }>{
    constructor(props: { className?: string }) {
        super(props);
        this.defaultMessage = chrome.i18n.getMessage('defaultMessage');
        this.state = {
            message: this.defaultMessage,
            attachment: null,
            delay: 0
        };
    }

    fileRef = createRef<HTMLInputElement>();
    defaultMessage: string;
    titleMessageForm = chrome.i18n.getMessage('titleMessageForm');
    attachmentLabelMessageForm = chrome.i18n.getMessage('attachmentLabelMessageForm');
    cleanButtonLabel = chrome.i18n.getMessage('cleanButtonLabel');
    footerLabelMessageForm = chrome.i18n.getMessage('footerLabelMessageForm');
    footerSuggestionMessageForm = chrome.i18n.getMessage('footerSuggestionMessageForm');
    delayLabelMessageForm = chrome.i18n.getMessage('delayLabelMessageForm');
    countryCodePrefixMessageForm = chrome.i18n.getMessage('countryCodePrefixMessageForm');

    componentDidMount() {
        chrome.storage.local.get(
            { message: this.defaultMessage, attachment: null, delay: 0 },
            data => {
                this.setState({ message: data.message, attachment: data.attachment, delay: data.delay });
                if (data.attachment != null && this.fileRef.current !== null) {
                    fetch(data.attachment.url).then(response => response.blob()).then(blob => {
                        const myFile = new File([blob], data.attachment.name, {
                            type: data.attachment.type,
                            lastModified: data.attachment.lastModified,
                        });
                        const dataTransfer = new DataTransfer();
                        dataTransfer.items.add(myFile);
                        if (this.fileRef.current !== null) {
                            this.fileRef.current.files = dataTransfer.files;
                        }
                    });
                }
            });
    }

    componentDidUpdate(prevProps: Readonly<{ className?: string }>, prevState: Readonly<{ message: string, attachment: Attachment, delay: number }>, snapshot?: any) {
        const { message, attachment, delay } = this.state;

        if (prevState.message !== message) {
            chrome.storage.local.set({ message });
        }

        if (prevState.delay !== delay) {
            chrome.storage.local.set({ delay });
        }

        if (prevState.attachment?.url !== attachment?.url) {
            if (attachment == null) {
                chrome.storage.local.set({ attachment });
            } else {
                chrome.storage.local.set({
                    attachment: {
                        name: attachment.name,
                        type: attachment.type,
                        url: attachment.url,
                        lastModified: attachment.lastModified
                    }
                });
            }
        }
    }

    handleMessageChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
        this.setState({ message: event.target.value });
    }

    handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const file = event.target.files[0];
            const reader = new FileReader();
            reader.onload = ev => {
                if (ev.target === null || ev.target.result === null) return;
                this.setState({
                    attachment: {
                        name: file.name,
                        type: file.type,
                        url: ev.target.result,
                        lastModified: file.lastModified
                    }
                });
            };
            reader.readAsDataURL(file);
        } else {
            this.setState({ attachment: null });
        }
    }

    handleFileClear = (event: MouseEvent<HTMLButtonElement>) => {
        if (this.fileRef.current == null) return;
        this.fileRef.current.files = new DataTransfer().files;
        this.setState({ attachment: null });
    }

    render() {
        const { message, attachment } = this.state;

        return <Box
            className={this.props.className}
            title={this.titleMessageForm}
            footer={<>
                <p className="mb-1">{this.footerLabelMessageForm}</p>
                <p>{this.footerSuggestionMessageForm}</p>
            </>}>
            <div className="mt-4 mx-4 flex flex-row gap-4">
                <div className="flex flex-col basis-1/2">
                    <ControlTextArea
                        value={message}
                        onChange={this.handleMessageChange}
                    />
                </div>
                <div className={['px-4',
                    'py-6',
                    'flex',
                    'flex-col',
                    'flex-auto',
                    'basis-1/2',
                    'border-2',
                    'border-dashed',
                    'border-slate-400',
                    'dark:border-slate-600',
                    'rounded-lg'].join(' ')}>
                    <label htmlFor="attachment" className="mb-2 text-center cursor-pointer">
                        {attachment?.name ? attachment.name : <>
                            <p className="mb-2 text-2xl">🖼</p>
                            <p className="text-sm text-slate-800 dark:text-slate-200">
                                {this.attachmentLabelMessageForm}
                            </p>
                        </>}
                    </label>
                    <input
                        id="attachment"
                        name="attachment"
                        className="hidden"
                        type="file"
                        ref={this.fileRef}
                        onChange={this.handleFileChange}
                    />
                    {attachment != null &&
                        <Button
                            variant="danger"
                            onClick={this.handleFileClear}
                        >{this.cleanButtonLabel}</Button>}
                </div>
            </div>
            <div className="mx-4 flex items-center">
                <label htmlFor="delay">{this.delayLabelMessageForm} (<span className="font-mono">{this.state.delay.toFixed(1)}s</span>):</label>
                <input
                    type="range"
                    id="delay"
                    name="delay"
                    min="0"
                    max="20"
                    step="0.1"
                    value={this.state.delay}
                    onChange={(e) => this.setState({ delay: +e.target.value })}
                    className={['w-full',
                        'h-1.5',
                        'bg-slate-100',
                        'dark:bg-slate-900',
                        'border',
                        'border-slate-400',
                        'dark:border-slate-600',
                        'accent-slate-600',
                        'dark:accent-slate-400',
                        'appearance-none',
                        'outline-none',
                        'rounded-full',
                        'cursor-pointer',
                        'transition-shadow',
                        'ease-in-out',
                        'duration-150',
                        'hover:bg-blue-100',
                        'dark:hover:bg-blue-900',
                        'focus:shadow-equal',
                        'focus:shadow-blue-800',
                        'dark:focus:shadow-blue-200',
                        'focus:outline-none'].join(' ')}
                />
            </div>
            <div className="mb-4 mx-4 flex flex-col">
            <label className="mb-2">{this.countryCodePrefixMessageForm}</label>
            <SelectCountryCode />
            </div>
        </Box>;
    }
}