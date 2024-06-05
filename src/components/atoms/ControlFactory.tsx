import type { ComponentClass } from "react";
import type React from "react";
import { Component } from "react";

interface ControlPropsMap {
  input: React.InputHTMLAttributes<HTMLInputElement>;
  textarea: React.TextareaHTMLAttributes<HTMLTextAreaElement>;
  select: React.SelectHTMLAttributes<HTMLSelectElement>;
}

class ControlFactory {
  static create<T extends keyof ControlPropsMap>(
    type: T,
  ): ComponentClass<ControlPropsMap[T]> {
    return class CustomInput extends Component<ControlPropsMap[T]> {
      override render() {
        const { className = "", children } = this.props;
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

        if (type === "input") {
          return (
            <input
              {...(this.props as ControlPropsMap["input"])}
              className={[...classNames, ...className.split(" ")].join(" ")}
            />
          );
        } else if (type === "textarea") {
          return (
            <textarea
              {...(this.props as ControlPropsMap["textarea"])}
              className={[...classNames, ...className.split(" ")].join(" ")}
            />
          );
        } else {
          return (
            <select
              {...(this.props as ControlPropsMap["select"])}
              className={[...classNames, ...className.split(" ")].join(" ")}
            >
              {children}
            </select>
          );
        }
      }
    };
  }
}

export const ControlInput = ControlFactory.create("input");
export const ControlTextArea = ControlFactory.create("textarea");
export const ControlSelect = ControlFactory.create("select");
