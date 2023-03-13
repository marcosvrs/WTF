import React, { createRef } from 'react';
import * as ReactDOM from 'react-dom/client';
import 'tailwindcss/tailwind.css';

class Options extends React.Component<{}, { message: string, attachment: Pick<File, 'name' | 'type' | 'lastModified'> & { url: string | ArrayBuffer } | null, logs: { level: number, message: string, attachment: boolean, contact: number, date: string }[] }>{
  constructor(props: {}) {
    super(props);
    this.state = {
      message: '',
      attachment: null,
      logs: [],
    };
  }

  fileRef = createRef<HTMLInputElement>();

  componentDidMount() {
    chrome.storage.local.get(
      { message: 'Enviado por WTF', attachment: null, logs: [] },
      (data) => {
        this.setState({ message: data.message, attachment: data.attachment, logs: data.logs });
        if (data.attachment !== null && this.fileRef.current !== null) {
          fetch(data.attachment.url).then((response) => response.blob()).then((blob) => {
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

  componentDidUpdate(prevProps: {}, prevState: { message: string, attachment: Pick<File, 'name' | 'type' | 'lastModified'> & { url: string | ArrayBuffer } | null, logs: object[] }) {
    const { message, attachment } = this.state;

    if (prevState.message !== message) {
      chrome.storage.local.set({ message });
    }

    if (prevState.attachment?.url !== attachment?.url) {
      if (attachment === null) {
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

  handleTextareaChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    this.setState({ message: event.target.value });
  };

  handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onload = (ev) => {
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

  handleFileClear = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (this.fileRef.current === null) return;
    this.fileRef.current.files = null;
    this.setState({ attachment: null });
  }

  handleClear = (event: React.MouseEvent<HTMLButtonElement>) => {
    chrome.storage.local.set({ logs: [] });
    this.setState({ logs: [] });
  }

  handleUpdate = (event: React.MouseEvent<HTMLButtonElement>) => {
    chrome.storage.local.get({ logs: [] }, data =>
      this.setState({ logs: data.logs })
    );
  }

  render() {
    const { message, attachment, logs } = this.state;
    const logLevelClass: { [key: number]: string } = {
      1: 'bg-red',
      2: 'bg-yellow',
      3: 'bg-green'
    };
    return (
      <div className='bg-gray-100 container mx-auto py-8'>
        <div className='mb-8 px-8'>
          <label
            className='block text-gray-700 font-bold mb-2'
            htmlFor='message'>
            Mensagem a ser enviada
          </label>
          <textarea
            className='block w-full px-4 py-2 rounded-lg bg-white border-2 border-gray-300 focus:border-blue-500 focus:outline-none'
            id='message'
            name='message'
            value={message}
            onChange={this.handleTextareaChange}
            rows={10}
          />
        </div>
        <div className='mb-8 px-8'>
          <div className='border-2 border-gray-300 border-dashed rounded-lg p-8 flex flex-col items-center justify-center'>
            <div className='text-gray-400 font-medium mt-4'>
              <label
                htmlFor='attachment'
                className='text-blue-500 hover:text-blue-600 cursor-pointer'>
                {attachment?.name ?? 'Escolha um anexo a ser enviado (Opcional)'}
              </label>
              <input
                className='hidden'
                id='attachment'
                name='attachment'
                type='file'
                ref={this.fileRef}
                onChange={this.handleFileChange}
              />
            </div>
            <button
              type='button'
              className='mt-4 text-sm text-gray-400 hover:text-gray-500 focus:outline-none focus:underline'
              onClick={this.handleFileClear}>
              Limpar anexo
            </button>
          </div>
        </div>
        <div className='flex items-center justify-between mb-4 px-8'>
          <button
            className='bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline0'
            type='button'
            onClick={this.handleUpdate}
          >
            Atualizar Logs
          </button>
          <button
            className='ml-4 text-gray-400 hover:text-gray-500 focus:outline-none focus:underline'
            type='button'
            onClick={this.handleClear}
          >
            Limpar Logs
          </button>
        </div>
        <table className='table-auto w-full border-collapse'>
          <thead>
            <tr>
              <th className='px-4 py-2 text-gray-600 font-bold'>Número</th>
              <th className='px-4 py-2 text-gray-600 font-bold'>Mensagem</th>
              <th className='px-4 py-2 text-gray-600 font-bold'>Anexo</th>
              <th className='px-4 py-2 text-gray-600 font-bold'>Data/Hora</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, index) => (
              <tr
                key={index}
                className={`${logLevelClass[log.level]}-100 hover:${logLevelClass[log.level]}-300`}
              >
                <td className='border px-4 py-2'>{log.contact}</td>
                <td className='border px-4 py-2'>{log.message}</td>
                <td className='border px-4 py-2'>{log.attachment}</td>
                <td className='border px-4 py-2'>{log.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
}

export default Options;

ReactDOM
  .createRoot(document.getElementById('root')!)
  .render(<Options />);
