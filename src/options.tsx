import React, { Component } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import LogTable from './components/LogTable';
import MessageButtonsForm from './components/MessageButtonsForm';
import MessageForm from './components/MessageForm';

class Options extends Component<{}, {}>{

  componentDidMount(): void {
    const body = document.querySelector('body');
    if (!body) return;
    body.classList.add('bg-gray-100');
    body.style.minWidth = '48rem';
  }

  render() {
    return <>
      <MessageForm />
      <MessageButtonsForm />
      <LogTable />
    </>;
  }
}

createRoot(document.getElementById('root')!)
  .render(<Options />);
