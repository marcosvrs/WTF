import React, { ChangeEvent, Component, createRef, MouseEvent } from 'react';
import type { Attachment } from '../types/Attachment';

export default class MessageForm extends Component<{}, { message: string, attachment: Attachment }>{
    constructor(props: {}) {
        super(props);
        this.state = {
            message: 'Enviado por WTF',
            attachment: null
        };
    }

    fileRef = createRef<HTMLInputElement>();

    componentDidMount(): void {
        chrome.storage.local.get(
            { message: 'Enviado por WTF', attachment: null },
            data => {
                this.setState({ message: data.message, attachment: data.attachment });
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

    componentDidUpdate(prevProps: Readonly<{}>, prevState: Readonly<{ message: string, attachment: Attachment }>, snapshot?: any): void {
        const { message, attachment } = this.state;

        if (prevState.message !== message) {
            chrome.storage.local.set({ message });
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
        return <div className="max-w-xl mx-auto my-10 bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="px-4 py-2 border-b border-gray-200 flex justify-between items-center">
                <h1 className="text-lg font-semibold text-gray-800">Elaboração da mensagem</h1>
            </div>
            <div className="px-4 py-2 flex flex-row gap-4">
                <div className="flex flex-col basis-1/2">
                    <textarea
                        className="w-full flex-auto bg-gray-100 border border-gray-300 p-1 rounded-lg focus:ring focus:ring-blue-500 focus:outline-none focus:shadow-outline"
                        value={message}
                        onChange={this.handleMessageChange}
                    ></textarea>
                </div>
                <div className="flex flex-col flex-auto basis-1/2 border-2 border-dashed border-gray-400 rounded-lg px-4 py-6">
                    <label htmlFor="attachment" className="text-center cursor-pointer">
                        {attachment?.name ? attachment.name : <>
                            <p className="mb-2 text-2xl">🖼</p>
                            <p className="text-sm text-gray-600">
                                Selecione um anexo (Opcional)
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
                        <button
                            className="mt-2 px-3 py-1 rounded-md bg-red-500 text-white text-sm font-medium hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                            onClick={this.handleFileClear}
                        >
                            Limpar
                        </button>}
                </div>
            </div>
            <div className="px-4 py-2 border-t border-gray-200">
            <p className="mb-1">Se desejar enviar apenas o anexo, mantenha o campo de mensagem vazio.</p>
            <p>Sugestão: Envie primeiro uma mensagem para o seu próprio número para visualizar a sua mensagem antes de envia-la em massa.</p>
            </div>
        </div>;
    }
}