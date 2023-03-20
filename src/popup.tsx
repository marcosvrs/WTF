import React, { ChangeEvent, Component, FormEvent, MouseEvent } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import type { MessageButtonsTypes } from '@wppconnect/wa-js/dist/chat/functions/prepareMessageButtons';
import type { Message } from './types/Message';
import type { Attachment } from './types/Attachment';

class Popup extends Component<{}, { contacts: string }> {
  constructor(props: {}) {
    super(props);
    this.state = {
      contacts: ''
    };
  }

  handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    this.setState({ contacts: event.target.value.replace(/[^\d\n\t,;]*/g, '') });
  }

  parseContacts = () => {
    const contacts = this.state.contacts.split(/[\n\t,;]/).map(s => s.trim().replace(/[\D]*/g, ''));

    return contacts.filter((contact: string, index: number) => {
      const result = contacts.indexOf(contact) === index;
      if (!result) {
        chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
          const tabId = tabs[0].id;
          if (tabId) {
            chrome.scripting.executeScript({
              target: { tabId: tabId },
              func: function (message: object) {
                window.postMessage(message);
              },
              args: [{ type: 'LOG', level: 2, message: 'Número duplicado.', attachment: false, contact }]
            });
          }
        });
      }

      return result;
    });
  }

  handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    this.parseContacts().forEach(contact => {
      chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        const tabId = tabs[0].id;
        if (tabId) {
          chrome.storage.local.get({ message: 'Enviado por WTF', attachment: null, buttons: [] }, data => {
            chrome.scripting.executeScript({
              target: { tabId: tabId },
              func: function (contact: string, message: string, attachment: Attachment, buttons?: MessageButtonsTypes[]) {
                window.dispatchEvent(new CustomEvent<Message>('sendMessage', {
                  detail: {
                    contact,
                    message,
                    attachment,
                    buttons
                  }
                }));
              },
              args: [contact, data.message, data.attachment, data.buttons]
            });
          });
        }
      });
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

  render() {
    return <form onSubmit={this.handleSubmit}>
      <div className="container mx-auto p-6 flex flex-col bg-gray-100 w-96 h-96">
        <textarea
          className="w-full flex-auto mb-4 border border-gray-300 p-1 rounded-lg focus:ring focus:ring-blue-500 focus:outline-none focus:shadow-outline"
          value={this.state.contacts}
          onChange={this.handleChange}
          placeholder="Adicione a lista de números para o envio das mensagens, separados por vírgula ou cada número em uma nova linha."
          required
        />
        <div className="flex justify-between items-center">
          <button
            className="px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-white hover:text-blue-500 hover:border hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            type="submit"
          >
            Enviar
          </button>
          <button
            className="px-4 py-2 rounded-md text-blue-500 border border-blue-500 hover:bg-blue-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            type="button"
            onClick={this.handleOptions}
          >
            Opções
          </button>
        </div>
      </div>
    </form>;
  }
}

createRoot(document.getElementById('root')!)
  .render(<Popup />);