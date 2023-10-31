import { ChromeMessageTypes } from './types/ChromeMessageTypes';
import { ControlTextArea } from './components/atoms/ControlFactory';
import { createRoot } from 'react-dom/client';
import AsyncChromeMessageManager from './utils/AsyncChromeMessageManager';
import Box from './components/molecules/Box';
import Button from './components/atoms/Button';
import CsvForm from './components/organisms/CsvForm';
import ParseCSVMessages from './utils/ParseCSVMessages';
import ProgressBox from './components/organisms/ProgressBox';
import React, { type ChangeEvent, Component, type FormEvent, type MouseEvent } from 'react';
import type ChromeStorage from './types/ChromeStorage';
import type QueueStatus from './types/QueueStatus';
import './index.css';

const PopupMessageManager = new AsyncChromeMessageManager('popup');

class Popup extends Component<{},
	{
		contacts: string;
		duplicatedContacts: number;
		status?: QueueStatus;
		confirmed: boolean;
		showCsvForm: boolean;
		parsedCSVMessages?: ParseCSVMessages;
		csvHeaderMatch: Record<string, string | undefined>;
		files: File[];
	}> {
	duplicatedNumberPopup = chrome.i18n.getMessage('duplicatedNumberPopup');
	prefixFooterNotePopup = chrome.i18n.getMessage('prefixFooterNotePopup');
	messagePlaceholderPopup = chrome.i18n.getMessage('messagePlaceholderPopup');
	CSVFileButtonLabel = chrome.i18n.getMessage('CSVFileButtonLabel');
	optionsButtonLabel = chrome.i18n.getMessage('optionsButtonLabel');
	sendButtonLabel = chrome.i18n.getMessage('sendButtonLabel');
	defaultMessage = chrome.i18n.getMessage('defaultMessage');

	queueStatusListener = 0;
	fileInput: HTMLInputElement | undefined = undefined;
	folderInput: HTMLInputElement | undefined = undefined;

	constructor(props: Readonly<{}>) {
		super(props);
		this.state = {
			contacts: '',
			duplicatedContacts: 0,
			status: undefined,
			confirmed: true,
			showCsvForm: false,
			parsedCSVMessages: undefined,
			csvHeaderMatch: { contact: '', message: '', attachment: '', button1: '', button2: '', button3: '' },
			files: []
		};
	}

	override async componentDidMount() {
		const body = document.querySelector('body');
		if (!body) {
			return;
		}

		body.classList.add('bg-gray-100');
		body.classList.add('dark:bg-gray-900');

		await this.updateStatus();
		this.queueStatusListener = window.setInterval(this.updateStatus, 100);
	}

	override componentWillUnmount() {
		clearInterval(this.queueStatusListener);
	}

	override componentDidUpdate(_previousProps: Readonly<{}>, previousState: Readonly<{ contacts: string; status?: QueueStatus; confirmed: boolean }>, _snapshot?: any) {
		if (!previousState.status?.isProcessing && this.state.status?.isProcessing) {
			this.setState({ confirmed: false });
		}
	}

	updateStatus = async () => {
		await PopupMessageManager.sendMessage(ChromeMessageTypes.QUEUE_STATUS, undefined).then(status => {
			this.setState({ status });
		});
	}

	handleChange = ({ currentTarget: { value } }: ChangeEvent<HTMLTextAreaElement>) => {
		this.setState({ contacts: value.replace(/[^\d\n\t,;]*/g, '') });
	}

	addPrefixToContact = (contact: string, prefix: number) => {
		const prefixToString = (prefix === 0 ? '' : prefix).toString();
		return prefixToString.concat(contact.trim().replace(/\D*/g, ''));
	}

	parseContacts = (prefix: number) => {
		const contactList = this.state.contacts.split(/[\n\t,;]/).filter(string_ => string_.trim() !== '');
		const pristinedContactsWithPrefix = contactList.map(contact => this.addPrefixToContact(contact, prefix));

		this.setState({ duplicatedContacts: 0 });

		return pristinedContactsWithPrefix.filter(async (contact: string, index: number) => {
			const result = pristinedContactsWithPrefix.indexOf(contact) === index;
			if (!result) {
				this.setState(previousState => ({ duplicatedContacts: previousState.duplicatedContacts + 1 }));
				await PopupMessageManager.sendMessage(ChromeMessageTypes.ADD_LOG, { level: 2, message: this.duplicatedNumberPopup, attachment: false, contact });
			}

			return result;
		});
	}

	submitCSVMessages = async () => {
		const language = chrome.i18n.getUILanguage();
		chrome.storage.local.get({ delay: 0, prefix: language === 'pt_BR' ? 55 : 0 },
			async ({ delay, prefix }: ChromeStorage) => {
				delay = (delay ?? 0) * 1000;
				const parsedMessages = await this.state.parsedCSVMessages?.parseMessages(this.state.csvHeaderMatch, Number(prefix), delay ?? 0, this.state.files ?? []);
				if (!parsedMessages || parsedMessages.length <= 0) throw new Error('No messages to send');

				const sendMessages = [];
				for (const message of parsedMessages) {
					sendMessages.push(PopupMessageManager.sendMessage(ChromeMessageTypes.SEND_MESSAGE, message));
				}

				return Promise.all(sendMessages);
			});
	}

	submitMessages = async () => {
		const language = chrome.i18n.getUILanguage();
		chrome.storage.local.get({ message: this.defaultMessage, attachment: undefined, buttons: undefined, delay: 0, prefix: language === 'pt_BR' ? 55 : 0 },
			async ({ message = this.defaultMessage, delay, prefix, attachment, buttons = undefined }: ChromeStorage) => {
				const sendMessages = [];
				delay = (delay ?? 0) * 1000;
				for (const contact of this.parseContacts(Number(prefix))) {
					sendMessages.push(PopupMessageManager.sendMessage(ChromeMessageTypes.SEND_MESSAGE, {
						contact,
						message,
						attachment,
						options: {
							buttons,
							delay
						}
					}));
				}

				return Promise.all(sendMessages);
			});
	}

	handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (this.state.showCsvForm) {
			return await this.submitCSVMessages();
		}

		return await this.submitMessages();
	}

	handleOptions = (_event: MouseEvent<HTMLButtonElement>) => {
		if (chrome.runtime.openOptionsPage) {
			chrome.runtime.openOptionsPage();
		} else {
			window.open(chrome.runtime.getURL('options.html'));
		}
	}

	handleCSV = async ({ currentTarget: { files } }: ChangeEvent<HTMLInputElement>) => {
		const file = files?.[0];
		const parseCSV = new ParseCSVMessages();
		await parseCSV.parseCSV(file);
		if (parseCSV.data.length > 0) {
			this.setState({ parsedCSVMessages: parseCSV })
		}
	}

	handleFiles = ({ currentTarget: { files } }: ChangeEvent<HTMLInputElement>) => {
		this.setState({ files: Array.from(files ?? []) });
	}

	override render() {
		return <>
			{!this.state.confirmed ? <ProgressBox
				status={this.state.status}
				duplicatedContacts={this.state.duplicatedContacts}
				onCancel={() => PopupMessageManager.sendMessage(ChromeMessageTypes.STOP_QUEUE, undefined)}
				onConfirm={() => this.setState({ confirmed: true })}
			/> : <form onSubmit={this.handleSubmit}>
				<Box className='w-96 h-96' bodyClassName='p-4' footer={this.prefixFooterNotePopup}>
					{this.state.showCsvForm ? ((this.state.parsedCSVMessages?.data ?? []).length > 0 ?
						<CsvForm csvHeader={this.state.parsedCSVMessages?.header ?? []} onMatchChange={csvHeaderMatch => this.setState({ csvHeaderMatch })} /> :
						<>
							<input
								type='file'
								accept='.csv'
								style={{ display: 'none' }}
								ref={input => {
									this.fileInput = input ?? undefined;
								}}
								onChange={this.handleCSV}
							/>
							<Button variant='light' type='button' onClick={() => this.fileInput?.click()}>
								{this.CSVFileButtonLabel}
							</Button>
						</>) : <ControlTextArea
						className='flex-auto'
						value={this.state.contacts}
						onChange={this.handleChange}
						placeholder={this.messagePlaceholderPopup}
						required
					/>}
					<div className='flex justify-between items-center'>
						<Button variant='primary' type='submit'>{this.sendButtonLabel}</Button>
						{this.state.csvHeaderMatch.attachment &&
							<>
								<input
									type='file'
									style={{ display: 'none' }}
									ref={input => {
										this.folderInput = input ?? undefined;
									}}
									onChange={this.handleFiles}
									multiple
								/>
								<Button
									variant='light'
									type="button"
									onClick={() => this.folderInput?.click()}
								>
									Folder
								</Button>
							</>}
						<Button
							variant='secondary'
							type='button'
							onClick={this.handleOptions}
						>
							{this.optionsButtonLabel}
						</Button>
					</div>
				</Box>
			</form>}
		</>;
	}
}

createRoot(document.querySelector('#root')!)
	.render(<Popup />);