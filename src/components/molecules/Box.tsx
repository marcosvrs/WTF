import type { HTMLAttributes, ReactNode } from "react";
import { Component } from "react";

interface BoxProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  headerButtons?: ReactNode;
  bodyClassName?: string;
  footer?: ReactNode;
}

export default class Box extends Component<BoxProps, unknown> {
  override render() {
    const {
      className = "",
      bodyClassName = "",
      children,
      title,
      headerButtons,
      footer,
      ...boxProps
    } = this.props;
    return (
      <div
        {...boxProps}
        className={[
          "max-w-xl",
          "mx-auto",
          "flex",
          "flex-col",
          "bg-white",
          "dark:bg-black",
          "dark:text-slate-100",
          "shadow-lg",
          "dark:shadow-none",
          "rounded-lg",
          // 'overflow-hidden',
          ...className.split(" "),
        ].join(" ")}
      >
        {(!!title || headerButtons) && (
          <div
            className={[
              "p-4",
              "border-b",
              "border-slate-200",
              "dark:border-gray-800",
              "flex",
              "justify-between",
              "items-center",
            ].join(" ")}
          >
            {title && (
              <h1
                className={[
                  "text-lg",
                  "font-semibold",
                  "text-slate-800",
                  "dark:text-slate-200",
                ].join(" ")}
              >
                {title}
              </h1>
            )}
            {headerButtons}
          </div>
        )}
        <div
          className={[
            "flex-auto",
            "flex",
            "flex-col",
            "gap-4",
            ...bodyClassName.split(" "),
          ].join(" ")}
        >
          {children}
        </div>
        {footer && (
          <div
            className={[
              "px-4",
              "py-2",
              "border-t",
              "border-slate-200",
              "dark:border-gray-800",
            ].join(" ")}
          >
            {footer}
          </div>
        )}
      </div>
    );
  }
}
