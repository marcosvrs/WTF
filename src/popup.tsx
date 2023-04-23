import React, { ChangeEvent, Component, FormEvent, MouseEvent } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import Button from './components/atoms/Button';
import { ControlTextArea } from './components/atoms/ControlFactory';
import Box from './components/molecules/Box';
import QueueStatus from './types/QueueStatus';
import AsyncChromeMessageManager from './utils/AsyncChromeMessageManager';
import { ChromeMessageTypes } from './types/ChromeMessageTypes';

const PopupMessageManager = new AsyncChromeMessageManager('popup');

class Popup extends Component<{}, { contacts: string, duplicatedContacts: number, status?: QueueStatus, confirmed: boolean }> {
  constructor(props: {}) {
    super(props);
    this.state = {
      contacts: '',
      duplicatedContacts: 0,
      status: undefined,
      confirmed: true,
    };
  }

  queueStatusListener = 0;

  componentDidMount() {
    const body = document.querySelector('body');
    if (!body) return;
    body.classList.add('bg-gray-100');
    body.classList.add('dark:bg-gray-900');

    this.updateStatus();
    this.queueStatusListener = window.setInterval(this.updateStatus, 250);
  }

  updateStatus = () => {
    PopupMessageManager.sendMessage(ChromeMessageTypes.QUEUE_STATUS, undefined).then((status) => {
      this.setState({ status });
    });
  }

  componentWillUnmount() {
    clearInterval(this.queueStatusListener);
  }

  componentDidUpdate(prevProps: Readonly<{}>, prevState: Readonly<{ contacts: string, status?: QueueStatus, confirmed: boolean }>, snapshot?: any) {
    if (!prevState.status?.isProcessing && this.state.status?.isProcessing) {
      this.setState({ confirmed: false });
    }
  }

  handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    this.setState({ contacts: event.target.value.replace(/[^\d\n\t,;]*/g, '') });
  }

  parseContacts = (prefix: number) => {
    const prefixToString = (prefix === 0 ? '' : prefix).toString();
    const contactList = this.state.contacts.split(/[\n\t,;]/).filter(str => str.trim() !== '');
    const pristinedContactsWithPrefix = contactList.map(s => prefixToString.concat(s.trim().replace(/[\D]*/g, '')));

    this.setState({ duplicatedContacts: 0 });

    return pristinedContactsWithPrefix.filter((contact: string, index: number) => {
      const result = pristinedContactsWithPrefix.indexOf(contact) === index;
      if (!result) {
        this.setState(prevState => ({ duplicatedContacts: prevState.duplicatedContacts + 1 }));
        PopupMessageManager.sendMessage(ChromeMessageTypes.ADD_LOG, { level: 2, message: 'Número duplicado.', attachment: false, contact });
      }

      return result;
    });
  }

  handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    chrome.storage.local.get({ message: 'Enviado por WTF', attachment: null, buttons: [], delay: 0, prefix: 55 }, async data => {
      let i = 0;
      for (const contact of this.parseContacts(data.prefix)) {
        PopupMessageManager.sendMessage(ChromeMessageTypes.SEND_MESSAGE, { contact, message: data.message, attachment: data.attachment, buttons: data.buttons, delay: data.delay });
      }
    });
    event.preventDefault();
  }

  handleOptions = (event: MouseEvent<HTMLButtonElement>) => {
    if (chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      window.open(chrome.runtime.getURL('options.html'));
    }
  }

  formatTime = (milliseconds: number) => {
    const hours = Math.floor(milliseconds / 3600000);
    const minutes = Math.floor((milliseconds % 3600000) / 60000);
    const seconds = (milliseconds / 1000).toFixed(2);

    const hoursString = hours > 0 ? `${hours}h ` : '';
    const minutesString = minutes > 0 ? `${minutes}m ` : '';

    return `${hoursString}${minutesString}${seconds}s`;
  };


  render() {
    return <>
      {!this.state.confirmed && <Box
        className="w-96 h-96"
        title={this.state.status?.isProcessing ? 'Enviando mensagens...' : ''}
        footer={this.state.status?.isProcessing ?
          <Button variant="danger" onClick={() => PopupMessageManager.sendMessage(ChromeMessageTypes.STOP_QUEUE, undefined)}>Cancelar</Button>
          : <Button variant="primary" onClick={() => this.setState({ confirmed: true })}>Ok</Button>}>
        <div className="grid grid-cols-2 gap-4 p-4">
          <div>Tempo:</div>
          <div>{this.formatTime(this.state.status?.elapsedTime || 0)}</div>
          {this.state.status?.sendingMessage && <div className="col-span-2">Enviando...</div>}
          {this.state.status?.waiting && <div>Aguardando:</div>}
          {this.state.status?.waiting && <div>{this.formatTime(this.state.status.waiting)}</div>}
          <div>Enviadas:</div>
          <div>{this.state.status?.processedItems}</div>
          <div>{this.state.status?.isProcessing ? 'Restantes' : 'Não entregues'}:</div>
          <div>{this.state.status?.remainingItems}</div>
          <div>Duplicados:</div>
          <div>{this.state.duplicatedContacts}</div>
          {this.state.status && <div className="w-full h-4 bg-gray-300 dark:bg-gray-600 rounded relative col-span-2 self-end">
            <div
              className={`h-4 rounded progress-bar${this.state.status?.isProcessing ? ' progress-bar-animated' : ''}`}
              style={{ width: `${(this.state.status?.processedItems / (this.state.status?.processedItems + this.state.status?.remainingItems)) * 100}%` }}
            ></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-semibold">
                {Math.round((this.state.status?.processedItems / (this.state.status?.processedItems + this.state.status?.remainingItems)) * 100)}%
              </span>
            </div>
          </div>}
        </div>
      </Box>}
      {this.state.confirmed && <form onSubmit={this.handleSubmit}>
        <Box className="w-96 h-96" bodyClassName="p-4" footer="Não se esqueça de adicionar o prefixo DDD da região de cada contato.">
          <ControlTextArea
            className="flex-auto"
            value={this.state.contacts}
            onChange={this.handleChange}
            placeholder="Adicione a lista de números para o envio das mensagens, separados por vírgula ou cada número em uma nova linha."
            required
          />
          <div className="flex justify-between items-center">
            <Button variant="primary" type="submit">Enviar</Button>
            <Button
              variant="secondary"
              type="button"
              onClick={this.handleOptions}
            >
              Opções
            </Button>
          </div>
        </Box>
      </form>}
    </>;
  }
}

createRoot(document.getElementById('root')!)
  .render(<Popup />);