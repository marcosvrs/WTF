import React, { Component, MouseEvent } from 'react';

export default class LogTable extends Component<{}, { logs: { level: number, message: string, attachment: boolean, contact: number, date: string }[] }>{
    constructor(props: {}) {
        super(props);
        this.state = {
            logs: []
        };
    }

    componentDidMount() {
        chrome.storage.local.get({ logs: [] }, data => this.setState({ logs: data.logs }));
    }

    handleClear = (event: MouseEvent<HTMLButtonElement>) => {
        chrome.storage.local.set({ logs: [] });
        this.setState({ logs: [] });
    }

    handleUpdate = (event: MouseEvent<HTMLButtonElement>) => {
        chrome.storage.local.get({ logs: [] }, data =>
            this.setState({ logs: data.logs })
        );
    }

    render() {
        const logLevelClass: { [key: number]: string } = {
            1: 'bg-red-100 hover:bg-red-200',
            2: 'bg-yellow-100 hover:bg-yellow-200',
            3: 'bg-green-100 hover:bg-green-200'
        };
        return <div className="max-w-xl mx-auto my-10 bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="px-4 py-2 border-b border-gray-200 flex justify-between items-center">
                <h1 className="text-lg font-semibold text-gray-800">Logs</h1>
                <div className="flex justify-end gap-4">
                    <button
                        className="px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-white hover:text-blue-500 hover:border hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onClick={this.handleUpdate}
                    >
                        Atualizar
                    </button>
                    <button
                        className="px-4 py-2 rounded-md text-blue-500 border border-blue-500 hover:bg-blue-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onClick={this.handleClear}
                    >
                        Limpar
                    </button>
                </div>
            </div>
            <div className="px-4 py-2">
                <table className="w-full table-auto">
                    <thead>
                        <tr className="text-left font-bold">
                            <th className="px-4 py-2 text-center">Número</th>
                            <th className="px-4 py-2 text-center">Mensagem</th>
                            <th className="px-4 py-2 text-center">Anexo</th>
                            <th className="px-4 py-2 text-center">Data/Hora</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.state.logs.map((log, index) => (
                            <tr key={index} className={logLevelClass[log.level]}>
                                <td className="border px-4 py-2">{log.contact}</td>
                                <td className="border px-4 py-2">{log.message}</td>
                                <td className="border px-4 py-2 text-center">{log.attachment ? '✓' : '×'}</td>
                                <td className="border px-4 py-2">{log.date}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>;
    }
}