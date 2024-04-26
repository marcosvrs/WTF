# WTF Chrome Extension
This is an open-source Chrome Extension that allows you to send messages in bulk via WhatsApp™ Web. You need to have WhatsApp™ Web open in your browser while using this extension.

## Installation
You can install the extension from the [Chrome Web Store](https://chrome.google.com/webstore/detail/wtf/kcdlihaidnmkenhlnofkjfoachidbnif).
Alternatively, you can download the `extension.zip` file from the [latest release](https://github.com/marcosvrs/wtf/releases) and load it as an [unpacked extension in Chrome](#loading-an-unpacked-extension).

## Usage
1. Open WhatsApp™ Web in your Chrome browser.
2. Click on the WTF extension icon in the toolbar.
3. Click on the **Options** button to configure the message and attachment you want to send.
4. Paste the phone numbers list you want to send.
4. Click on the **Send** button to start sending the messages.

Note that this extension is intended for legitimate and ethical use cases only. Any misuse or abuse of the extension is not the responsibility of the developers.

## Building from Source

If you prefer to build the extension from the source code, follow these steps:

### Prerequisites

- Ensure you have the latest Node.js and npm installed. You can follow the instructions to install them from [Node.js official website](https://nodejs.org/).

### Clone the Repository

```bash
git clone https://github.com/marcosvrs/wtf.git
cd wtf
```

### Install Dependencies

```bash
npm install
```

### Build the Extension

```bash
npm run build
```

This will compile the TypeScript and bundle the JavaScript files into the `dist` directory, ready for local development and testing.

### Load the Extension in Chrome

1. Go to the Extensions page by entering `chrome://extensions` in a new tab.
    - Alternatively, click on the Extensions menu puzzle button and select **Manage Extensions** at the bottom of the menu.
    - Or, click the Chrome menu, hover over **More Tools**, then select **Extensions**.
2. Enable Developer Mode by clicking the toggle switch next to **Developer mode**.
3. Click the **Load unpacked** button and select the `dist` directory.

Now, the WTF Chrome Extension should be loaded in your Chrome browser, and you can start using it immediately.

## Disclaimer
This extension is not affiliated with or endorsed by WhatsApp™ or Facebook™. The use of this extension is at your own risk. The developers are not responsible for any damages, legal consequences, or other liabilities that may arise from the use of this extension.

## Acknowledgments
This project uses the following packages:
- [@wppconnect/wa-js](https://github.com/wppconnect-team/wa-js) (Apache License 2.0)
- [react](https://github.com/facebook/react) (MIT License)
- [react-dom](https://github.com/facebook/react) (MIT License)
- [@types](https://github.com/DefinitelyTyped/DefinitelyTyped) (MIT License)
- [autoprefixer](https://github.com/postcss/autoprefixer) (MIT License)
- [copy-webpack-plugin](https://github.com/webpack-contrib/copy-webpack-plugin) (MIT License)
- [css-loader](https://github.com/webpack-contrib/css-loader) (MIT License)
- [cssnano](https://github.com/cssnano/cssnano) (MIT License)
- [postcss-loader](https://github.com/webpack-contrib/postcss-loader) (MIT License)
- [rimraf](https://github.com/isaacs/rimraf) (ISC License)
- [speed-measure-webpack-plugin](https://github.com/stephencookdev/speed-measure-webpack-plugin) (MIT License)
- [style-loader](https://github.com/webpack-contrib/style-loader) (MIT License)
- [tailwindcss](https://github.com/tailwindlabs/tailwindcss) (MIT License)
- [ts-loader](https://github.com/TypeStrong/ts-loader) (MIT License)
- [typescript](https://github.com/microsoft/TypeScript) (Apache License 2.0)
- [webpack-cli](https://github.com/webpack/webpack-cli) (MIT License)
- [webpack-merge](https://github.com/survivejs/webpack-merge) (MIT License)
- [@playwright/test](https://github.com/microsoft/playwright) (Apache License 2.0)
- [qrcode-terminal](https://github.com/gtanner/qrcode-terminal) (MIT License)
