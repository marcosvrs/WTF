import React, { Component, ComponentClass } from 'react';

type ControlType = 'input' | 'textarea' | 'select';

type ControlPropsMap = {
    input: React.InputHTMLAttributes<HTMLInputElement>,
    textarea: React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    select: React.SelectHTMLAttributes<HTMLSelectElement>,
};

class ControlFactory {
    static create<T extends ControlType>(type: T): ComponentClass<ControlPropsMap[T]> {
        return class CustomInput extends Component<ControlPropsMap[T], {}> {
            render() {
                const props = this.props;
                const classNames = ['w-full',
                    'flex-auto',
                    'bg-slate-100',
                    'dark:bg-slate-900',
                    'border',
                    'border-slate-400',
                    'dark:border-slate-600',
                    'p-1',
                    'rounded-lg',
                    'transition-shadow',
                    'ease-in-out',
                    'duration-150',
                    'focus:shadow-equal',
                    'focus:shadow-blue-800',
                    'dark:focus:shadow-blue-200',
                    'focus:outline-none'];

                if (type === 'input') {
                    return <input {...(props as React.InputHTMLAttributes<HTMLInputElement>)} className={[...classNames, ...(this.props.className || '').split(' ')].join(' ')} />;
                } else if (type === 'textarea') {
                    return <textarea {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)} className={[...classNames, ...(this.props.className || '').split(' ')].join(' ')} />;
                } else {
                    return <select {...(props as React.SelectHTMLAttributes<HTMLSelectElement>)} className={[...classNames, ...(this.props.className || '').split(' ')].join(' ')}>
                        {props.children}
                    </select>;
                }
            }
        };
    }
}

export const ControlInput = ControlFactory.create('input');
export const ControlTextArea = ControlFactory.create('textarea');
export const ControlSelect = ControlFactory.create('select');
