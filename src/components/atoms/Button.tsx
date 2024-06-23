import { type ButtonHTMLAttributes, Component } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "primary"
    | "secondary"
    | "success"
    | "danger"
    | "warning"
    | "info"
    | "light"
    | "dark";
}

export default class Button extends Component<ButtonProps, unknown> {
  override render() {
    const { variant, children, ...buttonProps } = this.props;
    const classNames = [
      "px-4",
      "py-2",
      "rounded-md",
      "transition",
      "ease-in-out",
      "duration-150",
      "focus:shadow-equal",
      "focus:outline-none",
      "border",
      "border-transparent",
      "ring-2",
      "ring-transparent",
      "focus:outline-none",
    ];

    switch (variant) {
      case "primary":
        classNames.push(
          "bg-blue-600",
          "dark:bg-blue-400",
          "text-white",
          "hover:bg-transparent",
          "hover:text-blue-600",
          "dark:hover:text-blue-400",
          "hover:border-blue-600",
          "dark:hover:border-blue-400",
          "focus:ring-blue-600",
          "dark:focus:ring-blue-400",
        );
        break;
      case "secondary":
        classNames.push(
          "bg-transparent",
          "text-blue-600",
          "dark:text-blue-400",
          "hover:text-white",
          "hover:bg-blue-600",
          "dark:hover:bg-blue-400",
          "hover:border-blue-600",
          "dark:hover:border-blue-400",
          "focus:ring-blue-600",
          "dark:focus:ring-blue-400",
        );
        break;
      case "success":
        classNames.push(
          "bg-green-600",
          "dark:bg-green-400",
          "text-white",
          "hover:bg-transparent",
          "hover:text-green-600",
          "dark:hover:text-green-400",
          "hover:border-green-600",
          "dark:hover:border-green-400",
          "focus:ring-green-600",
          "dark:focus:ring-green-400",
        );
        break;
      case "danger":
        classNames.push(
          "bg-red-600",
          "dark:bg-red-400",
          "text-white",
          "hover:bg-transparent",
          "hover:text-red-600",
          "dark:hover:text-red-400",
          "hover:border-red-600",
          "dark:hover:border-red-400",
          "focus:ring-red-600",
          "dark:focus:ring-red-400",
        );
        break;
      case "warning":
        classNames.push(
          "bg-orange-600",
          "dark:bg-orange-400",
          "text-white",
          "hover:bg-transparent",
          "hover:text-orange-600",
          "dark:hover:text-orange-400",
          "hover:border-orange-600",
          "dark:hover:border-orange-400",
          "focus:ring-orange-600",
          "dark:focus:ring-orange-400",
        );
        break;
      case "info":
        classNames.push(
          "bg-teal-600",
          "dark:bg-teal-400",
          "text-white",
          "hover:bg-transparent",
          "hover:text-teal-600",
          "dark:hover:text-teal-400",
          "hover:border-teal-600",
          "dark:hover:border-teal-400",
          "focus:ring-teal-600",
          "dark:focus:ring-teal-400",
        );
        break;
      case "light":
        classNames.push(
          "bg-gray-200",
          "dark:bg-gray-800",
          "text-gray-800",
          "dark:text-gray-200",
          "hover:bg-transparent",
          "hover:border-gray-800",
          "dark:hover:border-gray-200",
          "focus:ring-gray-800",
          "dark:focus:ring-gray-200",
        );
        break;
      case "dark":
        classNames.push(
          "bg-gray-800",
          "dark:bg-gray-200",
          "text-gray-200",
          "dark:text-gray-800",
          "hover:bg-transparent",
          "hover:text-gray-800",
          "dark:hover:text-gray-200",
          "hover:border-gray-800",
          "dark:hover:border-gray-200",
          "focus:ring-gray-800",
          "dark:focus:ring-gray-200",
        );
        break;
    }

    return (
      <button
        {...buttonProps}
        className={[
          ...classNames,
          ...(buttonProps.className ?? "").split(" "),
        ].join(" ")}
      >
        {children}
      </button>
    );
  }
}
