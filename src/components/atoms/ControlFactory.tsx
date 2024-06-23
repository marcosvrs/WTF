import {
  Component,
  type InputHTMLAttributes,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";

const classNames = [
  "w-full",
  "flex-auto",
  "bg-slate-100",
  "dark:bg-slate-900",
  "border",
  "border-slate-400",
  "dark:border-slate-600",
  "p-1",
  "rounded-lg",
  "transition-shadow",
  "ease-in-out",
  "duration-150",
  "focus:shadow-equal",
  "focus:shadow-blue-800",
  "dark:focus:shadow-blue-200",
  "focus:outline-none",
];

export class ControlInput extends Component<
  InputHTMLAttributes<HTMLInputElement>
> {
  override render() {
    const { className = "" } = this.props;

    return (
      <input
        {...this.props}
        className={[...classNames, ...className.split(" ")].join(" ")}
      />
    );
  }
}

export class ControlTextArea extends Component<
  TextareaHTMLAttributes<HTMLTextAreaElement>
> {
  override render() {
    const { className = "" } = this.props;
    return (
      <textarea
        {...this.props}
        className={[...classNames, ...className.split(" ")].join(" ")}
      />
    );
  }
}

export class ControlSelect extends Component<
  SelectHTMLAttributes<HTMLSelectElement>
> {
  override render() {
    const { className = "", children } = this.props;
    return (
      <select
        {...this.props}
        className={[...classNames, ...className.split(" ")].join(" ")}
      >
        {children}
      </select>
    );
  }
}
