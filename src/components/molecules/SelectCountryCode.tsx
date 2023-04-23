import { ControlInput } from '../atoms/ControlFactory';
import React, { ChangeEvent, Component, createRef } from 'react';

const countryCodes = require('../../countryCodes.pt-BR.json');

interface CountryCode {
    value: number;
    label: string;
}

export default class SelectCountryCode extends Component<{ options?: CountryCode[] }, {
    isOpen: boolean,
    searchValue: string,
    selectedValue: CountryCode | null,
    options: CountryCode[],
    filteredOptions: CountryCode[]
}> {
    constructor(props: { options: CountryCode[] }) {
        super(props);
        const defaultOptions = [{ value: 0, label: 'Sem Prefixo' }, ...countryCodes];
        const { options = defaultOptions } = props;
        this.state = {
            isOpen: false,
            searchValue: '',
            selectedValue: options.find(option => option.value === 55),
            options,
            filteredOptions: options,
        };
    }

    wrapperRef = createRef<HTMLDivElement>();

    toggleOpen = () => {
        this.setState(prevState => ({
            ...prevState,
            isOpen: !prevState.isOpen
        }));
    };

    handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
        const searchValue = e.target.value.toLowerCase();
        const filteredOptions = this.state.options.filter((option) =>
            option.label.toLowerCase().includes(searchValue)
        );

        this.setState({ searchValue, filteredOptions });
    };

    handleSelect = (selectedValue: CountryCode) => {
        this.setState({ selectedValue, isOpen: false, searchValue: '', filteredOptions: this.state.options });
    };

    handleClickOutside = (e: MouseEvent) => {
        if (e.target instanceof Node && !this.wrapperRef.current?.contains(e.target)) {
            this.setState({ isOpen: false });
        }
    };

    componentDidMount() {
        document.addEventListener('mousedown', this.handleClickOutside);
        chrome.storage.local.get(
            { prefix: 55 },
            data => {
                this.setState({ selectedValue: this.state.options.find(option => option.value === data.prefix) ?? null });
            });
    }

    componentDidUpdate(prevProps: Readonly<{ options: CountryCode[] }>, prevState: Readonly<{
        isOpen: boolean,
        searchValue: string,
        selectedValue: CountryCode | null,
        options: CountryCode[],
        filteredOptions: CountryCode[]
    }>, snapshot?: any) {
        if (prevState.selectedValue !== this.state.selectedValue) {
            chrome.storage.local.set({ prefix: this.state.selectedValue?.value || 0 });
        }
    }

    componentWillUnmount() {
        document.removeEventListener('mousedown', this.handleClickOutside);
    }

    render() {
        const { isOpen, searchValue, selectedValue, filteredOptions } = this.state;
        const { options } = this.props;

        return (
            <div className="relative select-none" ref={this.wrapperRef}>
                <div
                    className={[
                        'w-full',
                        'flex-auto',
                        'bg-slate-100',
                        'dark:bg-slate-900',
                        'border',
                        'border-slate-400',
                        'dark:border-slate-600',
                        'p-2',
                        'rounded-lg',
                        'transition-shadow',
                        'ease-in-out',
                        'duration-150',
                        'focus:shadow-equal',
                        'focus:shadow-blue-800',
                        'dark:focus:shadow-blue-200',
                        'focus:outline-none',
                        'cursor-pointer',
                        'flex',
                        'justify-between',
                        'items-center'
                    ].join(' ')}
                    onClick={this.toggleOpen}
                >
                    <span>{selectedValue ? selectedValue.label : 'Selecione um Prefixo'}</span>
                    <svg
                        className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''
                            }`}
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M4.86133 6.7539L8.00065 9.89322L11.1399 6.7539"
                            stroke="#374151"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </div>
                {
                    isOpen && (
                        <div className="absolute w-full mt-1 z-10 border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 rounded-md shadow-lg">
                            <ControlInput
                                className="p-2 w-full"
                                type="text"
                                placeholder="Procurar"
                                value={searchValue}
                                onChange={this.handleSearch}
                            />
                            <ul>
                                {filteredOptions.length ? (
                                    filteredOptions.map((option, index) => (
                                        <li
                                            key={index}
                                            className={`p-2 cursor-pointer hover:bg-blue-400 dark:hover:bg-blue-600${selectedValue === option ? ' bg-blue-200 dark:bg-blue-800' : ''}`}
                                            onClick={() => this.handleSelect(option)}
                                        >
                                            {option.label}
                                        </li>
                                    ))
                                ) : (
                                    <li className="p-2 cursor-default text-slate-400 dark:text-slate-600">Nenhum prefixo encontrado</li>
                                )}
                            </ul>
                        </div>
                    )
                }
            </div >
        );
    }
}