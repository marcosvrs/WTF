import React, { Component } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import LogTable from './components/organisms/LogTable';
import MessageButtonsForm from './components/organisms/MessageButtonsForm';
import MessageForm from './components/organisms/MessageForm';

class Options extends Component<{}, {}>{

  componentDidMount(): void {
    const body = document.querySelector('body');
    if (!body) return;
    body.classList.add('bg-gray-100');
    body.classList.add('dark:bg-gray-900');
    body.style.minWidth = '48rem';
  }

  render() {
    return <>
      <MessageForm className="my-10" />
      <MessageButtonsForm className="my-10" />
      <LogTable className="my-10" />
    </>;
  }
}

createRoot(document.getElementById('root')!)
  .render(<Options />);
