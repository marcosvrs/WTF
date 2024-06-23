import { type ChangeEvent, Component, createRef } from "react";
import ENcountryCodes from "../../countryCodes.en.json";
import PTcountryCodes from "../../countryCodes.pt.json";
import { ControlInput } from "../atoms/ControlFactory";
import type { CountryCode } from "types/CountryCode";

export default class SelectCountryCode extends Component<
  { options?: CountryCode[] },
  {
    isOpen: boolean;
    searchValue: string;
    selectedValue: CountryCode | undefined;
    options: CountryCode[];
    filteredOptions: CountryCode[];
  }
> {
  constructor(props: { options: CountryCode[] }) {
    super(props);
    this.defaultLabelSelectCountryCode = chrome.i18n.getMessage(
      "defaultLabelSelectCountryCode",
    );
    const defaultOptions: CountryCode[] = [
        { value: 0, label: this.defaultLabelSelectCountryCode },
      ],
      { options = defaultOptions } = props;
    this.state = {
      isOpen: false,
      searchValue: "",
      selectedValue:
        chrome.i18n.getUILanguage() === "pt_BR"
          ? options.find((option) => option.value === 55)
          : options.find((option) => option.value === 0),
      options,
      filteredOptions: options,
    };
    this.loadCountryCodes(defaultOptions);
  }

  loadCountryCodes(defaultOptions: CountryCode[] = []) {
    const language = chrome.i18n.getUILanguage().substring(0, 2);
    let module = ENcountryCodes;
    if (language === "pt") {
      module = PTcountryCodes;
    }
    this.setState((prevState) => ({
      ...prevState,
      options: [...defaultOptions, ...module],
    }));
  }

  wrapperRef = createRef<HTMLDivElement>();
  defaultLabelSelectCountryCode: string;

  toggleOpen = () => {
    this.setState((prevState) => ({
      ...prevState,
      isOpen: !prevState.isOpen,
    }));
  };

  handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    const searchValue = e.target.value.toLowerCase();
    const filteredOptions = this.state.options.filter((option) =>
      option.label.toLowerCase().includes(searchValue),
    );

    this.setState({ searchValue, filteredOptions });
  };

  handleSelect = (selectedValue: CountryCode) => {
    this.setState({
      selectedValue,
      isOpen: false,
      searchValue: "",
      filteredOptions: this.state.options,
    });
  };

  handleClickOutside = (e: MouseEvent) => {
    if (
      e.target instanceof Node &&
      !this.wrapperRef.current?.contains(e.target)
    ) {
      this.setState({ isOpen: false });
    }
  };

  override componentDidMount() {
    document.addEventListener("mousedown", this.handleClickOutside);
    void chrome.storage.local.get(
      ({
        prefix = chrome.i18n.getUILanguage() === "pt_BR" ? 55 : 0,
      }: {
        prefix: number;
      }) => {
        this.setState({
          selectedValue: this.state.options.find(
            (option) => option.value === prefix,
          ),
        });
      },
    );
  }

  override componentDidUpdate(
    _prevProps: Readonly<{ options: CountryCode[] }>,
    prevState: Readonly<{
      isOpen: boolean;
      searchValue: string;
      selectedValue: CountryCode | undefined;
      options: CountryCode[];
      filteredOptions: CountryCode[];
    }>,
  ) {
    if (prevState.selectedValue !== this.state.selectedValue) {
      void chrome.storage.local.set({
        prefix: this.state.selectedValue?.value ?? 0,
      });
    }
  }

  override componentWillUnmount() {
    document.removeEventListener("mousedown", this.handleClickOutside);
  }

  override render() {
    const { isOpen, searchValue, selectedValue, filteredOptions } = this.state;

    return (
      <div className="relative select-none" ref={this.wrapperRef}>
        <div
          className={[
            "w-full",
            "flex-auto",
            "bg-slate-100",
            "dark:bg-slate-900",
            "border",
            "border-slate-400",
            "dark:border-slate-600",
            "p-2",
            "rounded-lg",
            "transition-shadow",
            "ease-in-out",
            "duration-150",
            "focus:shadow-equal",
            "focus:shadow-blue-800",
            "dark:focus:shadow-blue-200",
            "focus:outline-none",
            "cursor-pointer",
            "flex",
            "justify-between",
            "items-center",
          ].join(" ")}
          onClick={this.toggleOpen}
        >
          <span>
            {selectedValue ? selectedValue.label : "Selecione um Prefixo"}
          </span>
          <svg
            className={`transform transition-transform duration-300 ${
              isOpen ? "rotate-180" : ""
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
        {isOpen && (
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
                    className={`p-2 cursor-pointer hover:bg-blue-400 dark:hover:bg-blue-600${selectedValue === option ? " bg-blue-200 dark:bg-blue-800" : ""}`}
                    onClick={() => {
                      this.handleSelect(option);
                    }}
                  >
                    {option.label}
                  </li>
                ))
              ) : (
                <li className="p-2 cursor-default text-slate-400 dark:text-slate-600">
                  Nenhum prefixo encontrado
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
    );
  }
}
