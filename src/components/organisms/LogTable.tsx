import React, { Component, MouseEvent } from 'react';
import type Log from '../../types/Log';
import Button from '../atoms/Button';
import Box from '../molecules/Box';

export default class LogTable extends Component<{ className?: string }, { logs: Log[] }>{
    constructor(props: { className?: string }) {
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
            1: 'bg-red-100 dark:bg-red-900 hover:bg-red-200 dark:hover:bg-red-800',
            2: 'bg-yellow-100 dark:bg-yellow-900 hover:bg-yellow-200 dark:hover:bg-yellow-800',
            3: 'bg-green-100 dark:bg-green-900 hover:bg-green-200 dark:hover:bg-green-800'
        };

        return <Box
            className={this.props.className}
            title="Logs"
            headerButtons={<div className="flex justify-end gap-4">
                <Button
                    variant="primary"
                    onClick={this.handleUpdate}
                >
                    Atualizar
                </Button>
                <Button
                    variant="secondary"
                    onClick={this.handleClear}
                >
                    Limpar
                </Button>
            </div>}>
            <table className="max-w-full mx-4 table-auto">
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
        </Box>;
    }
}