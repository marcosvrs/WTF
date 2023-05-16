import React, { ChangeEvent, Component, DragEvent } from 'react';
import Button from '../atoms/Button';
import { ControlInput, ControlSelect } from '../atoms/ControlFactory';
import Box from '../molecules/Box';

export default class MessageButtonsForm extends Component<{ className?: string }, { buttons: { id: number, type: string, value: string, text: string }[], draggedIndex: number | null, dropIndex: number | null }>{
    constructor(props: { className?: string }) {
        super(props);
        this.state = {
            draggedIndex: null,
            dropIndex: null,
            buttons: []
        };
    }

    messageButtonsFormTitle = chrome.i18n.getMessage('messageButtonsFormTitle');
    addButtonLabel = chrome.i18n.getMessage('addButtonLabel');
    importantNoteMessageButtonsForm = chrome.i18n.getMessage('importantNoteMessageButtonsForm');
    listTitleNoteMessageButtonsForm = chrome.i18n.getMessage('listTitleNoteMessageButtonsForm');
    firstListItemNoteMessageButtonsForm = chrome.i18n.getMessage('firstListItemNoteMessageButtonsForm', ['<strong>', '</strong>']);
    secondListItemNoteMessageButtonsForm = chrome.i18n.getMessage('secondListItemNoteMessageButtonsForm', ['<strong>', '</strong>']);
    thirdListItemNoteMessageButtonsForm = chrome.i18n.getMessage('thirdListItemNoteMessageButtonsForm', ['<strong>', '</strong>']);
    typeLabelMessageButtonsForm = chrome.i18n.getMessage('typeLabelMessageButtonsForm');
    valueLabelMessageButtonsForm = chrome.i18n.getMessage('valueLabelMessageButtonsForm');
    textLabelMessageButtonsForm = chrome.i18n.getMessage('textLabelMessageButtonsForm');
    urlTypeMessageButtonsForm = chrome.i18n.getMessage('urlTypeMessageButtonsForm');
    phoneNumberTypeMessageButtonsForm = chrome.i18n.getMessage('phoneNumberTypeMessageButtonsForm');
    idTypeMessageButtonsForm = chrome.i18n.getMessage('idTypeMessageButtonsForm');

    componentDidMount() {
        chrome.storage.local.get({ buttons: [] }, data => this.setState({
            buttons: data.buttons.map((button: { [key: string]: string }) => {
                const [type = ''] = Object.keys(button).filter(
                    (prop) => !['text'].includes(prop)
                );
                return {
                    id: type === 'id' ? button[type] : Math.floor(Math.random() * 1000),
                    type: type,
                    value: button[type] || '',
                    text: button.text
                };
            })
        }));
    }

    compareArrays = (arr1: { id: number, type: string, value: string, text: string }[], arr2: { id: number, type: string, value: string, text: string }[]) => {
        // Check if arrays have different lengths
        if (arr1.length !== arr2.length) {
            return false;
        }
        // Check if each object in arr1 has a corresponding object in arr2
        for (let i = 0; i < arr1.length; i++) {
            let obj1 = arr1[i];
            let obj2 = arr2[i];
            if (!obj2) {
                // If obj2 is undefined, there is no matching object in arr2
                return false;
            }
            // Check if properties of obj1 and obj2 are the same
            if (obj1.id !== obj2.id || obj1.type !== obj2.type || obj1.value !== obj2.value || obj1.text !== obj2.text) {
                return false;
            }
        }
        // If we reach this point, the arrays are equal
        return true;
    }

    componentDidUpdate(prevProps: Readonly<{ className?: string }>, prevState: Readonly<{ buttons: { id: number, type: string, value: string, text: string }[]; }>, snapshot?: any) {
        const { buttons } = this.state;
        if (!this.compareArrays(prevState.buttons, buttons)) {
            chrome.storage.local.set({
                buttons: buttons.map(button => ({
                    [button.type]: button.value,
                    text: button.text
                }))
            });
        }
    }

    handleDrag = (event: DragEvent<HTMLTableRowElement>, index: number) => {
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', `${index}`);
        this.setState({ draggedIndex: index });
    }

    handleDragOver = (event: DragEvent<HTMLTableRowElement>, index: number) => {
        event.preventDefault();
        this.setState({ dropIndex: index });
    }

    handleDrop = (event: DragEvent<HTMLTableRowElement>, index: number) => {
        event.preventDefault();
        const sourceIndex = event.dataTransfer.getData('text');
        const buttons = [...this.state.buttons];
        const [draggedItem] = buttons.splice(+sourceIndex, 1);
        buttons.splice(index, 0, draggedItem);
        this.setState({ buttons, draggedIndex: null, dropIndex: null });
    }

    handleTypeChange = (event: ChangeEvent<HTMLSelectElement>, id: number) => {
        const buttons = [...this.state.buttons];
        this.setState({
            buttons: buttons.map(button => {
                if (button.id !== id) return button;
                const type = event.target.value;
                let value = button.value || '';
                if (type === 'phoneNumber') {
                    value = value.replace(/\D/g, '');
                } else if (type === 'id') {
                    value = `${button.id}`;
                }
                return {
                    id: button.id || 0,
                    type,
                    value,
                    text: button.text || '',
                };
            })
        });
    }

    handleValueChange = (event: ChangeEvent<HTMLInputElement>, id: number) => {
        const buttons = [...this.state.buttons];
        this.setState({
            buttons: buttons.map(button => {
                if (button.id !== id) return button;
                let value = event.target.value;
                if (button.type === 'phoneNumber') {
                    value = value.replace(/\D/g, '')
                } else if (button.type === 'id') {
                    value = `${button.id}`;
                }
                return {
                    id: button.id || 0,
                    type: button.type || '',
                    value: value,
                    text: button.text || '',
                };
            })
        });
    }

    handleTextChange = (event: ChangeEvent<HTMLInputElement>, id: number) => {
        const buttons = [...this.state.buttons];
        this.setState({
            buttons: buttons.map(button => {
                if (button.id !== id) return button;
                return {
                    id: button.id || 0,
                    type: button.type || '',
                    value: button.value || '',
                    text: event.target.value,
                };
            })
        });
    }

    handleDeleteButton = (id: number) => {
        const buttons = [...this.state.buttons];
        this.setState({ buttons: buttons.filter(button => button.id !== id) });
    }

    handleAddButton = () => {
        const buttons = [...this.state.buttons, {
            id: Math.floor(Math.random() * 1000),
            type: 'url',
            value: '',
            text: ''
        }];
        this.setState({ buttons });
    }

    render() {
        const { buttons, draggedIndex, dropIndex } = this.state;

        return <Box
            className={this.props.className}
            title={this.messageButtonsFormTitle}
            headerButtons={buttons.length < 3 && <Button variant="light" onClick={this.handleAddButton}>{this.addButtonLabel}</Button>}
            footer={<>
                <p className="text-red-600 dark:text-red-400 font-bold mb-1">{this.importantNoteMessageButtonsForm}</p>
                <p>{this.listTitleNoteMessageButtonsForm}</p>
                <ul className="list-disc ml-8">
                    <li dangerouslySetInnerHTML={{ __html: this.firstListItemNoteMessageButtonsForm }} />
                    <li dangerouslySetInnerHTML={{ __html: this.secondListItemNoteMessageButtonsForm }} />
                    <li dangerouslySetInnerHTML={{ __html: this.thirdListItemNoteMessageButtonsForm }} />
                </ul>
            </>}>
            {buttons.length > 0 &&
                <table className="mx-4 table-auto">
                    <thead>
                        <tr className="text-left font-bold">
                            <th className="px-4 py-2"></th>
                            <th className="px-4 py-2 text-center">{this.typeLabelMessageButtonsForm}</th>
                            <th className="px-4 py-2 text-center">{this.valueLabelMessageButtonsForm}</th>
                            <th className="px-4 py-2 text-center">{this.textLabelMessageButtonsForm}</th>
                            <th className="px-4 py-2 text-center"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {buttons.map((button, index) => (
                            <tr
                                key={button.id}
                                draggable
                                onDragStart={event => this.handleDrag(event, index)}
                                onDragOver={event => this.handleDragOver(event, index)}
                                onDrop={event => this.handleDrop(event, index)}
                                className={`${index === draggedIndex ? 'bg-blue-100 dark:bg-blue-900' : ''} ${index === dropIndex ? 'border-dashed border-2' : 'border'}`}
                            >
                                <td className="border px-4 py-2 cursor-move text-center">☰</td>
                                <td className="border px-4 py-2">
                                    <ControlSelect value={button.type} onChange={event => this.handleTypeChange(event, button.id)}>
                                        <option value="url">{this.urlTypeMessageButtonsForm}</option>
                                        <option value="phoneNumber">{this.phoneNumberTypeMessageButtonsForm}</option>
                                        <option value="id">{this.idTypeMessageButtonsForm}</option>
                                    </ControlSelect>
                                </td>
                                <td className="border px-4 py-2">
                                    <ControlInput
                                        className={button.type === 'id' ? 'bg-transparent border-0' : ''}
                                        type={button.type === 'phoneNumber' ? 'tel' : button.type === 'url' ? 'url' : 'text'}
                                        value={button.value}
                                        onChange={event => this.handleValueChange(event, button.id)}
                                        disabled={button.type === 'id'}
                                    />
                                </td>
                                <td className="border px-4 py-2">
                                    <ControlInput
                                        type="text"
                                        value={button.text}
                                        onChange={event => this.handleTextChange(event, button.id)}
                                    />
                                </td>
                                <td className="border text-center align-middle">
                                    <Button
                                        className="text-3xl text-red-500 hover:text-red-600 dark:hover:text-red-400 p-0 ring-0"
                                        onClick={() => this.handleDeleteButton(button.id)}
                                    >
                                        ×
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>}
        </Box>;
    }
}