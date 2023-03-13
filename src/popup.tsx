import React from 'react';
import * as ReactDOM from 'react-dom/client';
import 'tailwindcss/tailwind.css';

class Popup extends React.Component<{}, { contacts: string }> {
  constructor(props: {}) {
    super(props);
    this.state = {
      contacts: ''
    };
  }

  handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    this.setState({ contacts: event.target.value.replace(/[^\d\n\t,;]*/g, '') });
  }

  parseContacts = () => {
    const contacts = this.state.contacts.split(/[\n\t,;]/).map((s) => s.trim().replace(/[\D]*/g, ''));

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

  handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    this.parseContacts().forEach((contact) => {
      chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        const tabId = tabs[0].id;
        if (tabId) {
          chrome.storage.local.get({ message: 'Enviado por WTF', attachment: null }, data => {
            chrome.scripting.executeScript({
              target: { tabId: tabId },
              func: function (contact: string, message: string, attachment: null) {
                window.dispatchEvent(new CustomEvent('sendMessage', {
                  detail: {
                    contact,
                    message,
                    attachment
                  }
                }));
              },
              args: [contact, data.message, data.attachment]
            });
          });
        }
      });
    });
    event.preventDefault();
  }

  handleOptions = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      window.open(chrome.runtime.getURL('options.html'));
    }
  }

  render() {
    return <form onSubmit={this.handleSubmit}>
      <div className='bg-gray-100 w-96 h-96'>
        <div className='container mx-auto p-8 h-full'>
          <div className='flex flex-col justify-between h-full'>
            <textarea
              className='block w-full h-full px-4 py-2 mb-4 rounded-lg bg-white border-2 border-gray-300 focus:border-blue-500 focus:outline-none'
              value={this.state.contacts}
              onChange={this.handleChange}
              placeholder='Adicione a lista de números para o envio das mensagens, separados por vírgula ou cada número em uma nova linha.'
              required
            />
            <div className='flex justify-between items-center'>
              <button
                className='bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline'
                type='submit'
              >
                Enviar
              </button>
              <button
                className='bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline'
                type='button'
                onClick={this.handleOptions}
              >
                Opções
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>;
  }
}

ReactDOM
  .createRoot(document.getElementById('root')!)
  .render(<Popup />);