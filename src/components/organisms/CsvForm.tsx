import React, { ChangeEvent, Component } from 'react';
import { ControlSelect } from '../atoms/ControlFactory';
import Box from '../molecules/Box';

export default class CsvForm extends Component<{ csvHeader: string[]; className?: string; onMatchChange?: (newMatch: Record<string, string | undefined>) => void }, { settings: string[]; columns: string[]; match: Record<string, string | undefined> }>{
    constructor(props: { csvHeader: string[]; className?: string }) {
        super(props);
        this.state = {
            settings: ['contact', 'message', 'attachment', 'button1', 'button2', 'button3'],
            columns: props.csvHeader,
            match: { contact: '', message: '', attachment: '', button1: '', button2: '', button3: '' }
        };
    }

    messageButtonsFormTitle = chrome.i18n.getMessage('messageButtonsFormTitle');
    listTitleNoteMessageButtonsForm = chrome.i18n.getMessage('listTitleNoteMessageButtonsForm');
    typeLabelMessageButtonsForm = chrome.i18n.getMessage('typeLabelMessageButtonsForm');
    valueLabelMessageButtonsForm = chrome.i18n.getMessage('valueLabelMessageButtonsForm');
    urlTypeMessageButtonsForm = chrome.i18n.getMessage('urlTypeMessageButtonsForm');
    phoneNumberTypeMessageButtonsForm = chrome.i18n.getMessage('phoneNumberTypeMessageButtonsForm');
    idTypeMessageButtonsForm = chrome.i18n.getMessage('idTypeMessageButtonsForm');

    handleColumnChange = (event: ChangeEvent<HTMLSelectElement>, index: number) => {
        const { value } = event.target;
        const key = this.state.settings[index];
        this.setState(prevState => {
            const newMatch = {
                ...prevState.match,
                [key]: value  // update the value for this key (action)
            }

            if (this.props.onMatchChange) {
                this.props.onMatchChange(newMatch);
            }

            return { match: newMatch };
        });
    }

    componentDidMount() {
        this.setState(prevState => {
            const newMatch = {
                ...prevState.match,
                contact: prevState.columns.find(value => value === 'contact') ?? '',
                message: prevState.columns.find(value => value === 'message') ?? '',
                attachment: prevState.columns.find(value => value === 'attachment') ?? '',

                button1: prevState.columns.find(value => value === 'button1') ?? '',
                button2: prevState.columns.find(value => value === 'button2') ?? '',
                button3: prevState.columns.find(value => value === 'button3') ?? '',
            }

            if (this.props.onMatchChange) {
                this.props.onMatchChange(newMatch);
            }

            return { match: newMatch };
        });
    }

    render() {
        const { settings } = this.state;

        return <Box
            className={this.props.className}
            title={this.messageButtonsFormTitle}
            footer={<>
                <p>{this.listTitleNoteMessageButtonsForm}</p>
            </>}>
            {settings.length > 0 &&
                <table className="mx-4 table-auto">
                    <thead>
                        <tr className="text-left font-bold">
                            <th className="px-4 py-2 text-center">{this.typeLabelMessageButtonsForm}</th>
                            <th className="px-4 py-2 text-center">{this.valueLabelMessageButtonsForm}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {settings.map((setting, index) => (
                            <tr key={index}>
                                <td className="border px-4 py-2">
                                    {setting}
                                </td>
                                <td className="border px-4 py-2">
                                    <ControlSelect
                                    onChange={event => this.handleColumnChange(event, index)}
                                    value={setting in this.state.match ? this.state.match[setting] ?? '' : ''}>
                                        <option value="">None</option>
                                        {this.state.columns.map((column) => <option value={column}>{column}</option>)}
                                    </ControlSelect>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>}
        </Box>;
    }
}