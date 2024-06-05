# WTF Chrome Extension

This open-source Chrome Extension allows you to send messages in bulk via WhatsApp™ Web. Make sure WhatsApp™ Web is open in your browser while using this extension.

## Installation

Install the extension directly from the [Chrome Web Store](https://chrome.google.com/webstore/detail/wtf/kcdlihaidnmkenhlnofkjfoachidbnif).
Alternatively, download the `extension.zip` file from the [latest release](https://github.com/marcosvrs/wtf/releases) and [load the extension in Chrome](#load-the-extension-in-chrome).

## Usage

1. Open WhatsApp™ Web in your Chrome browser.
2. Click on the WTF extension icon in the toolbar.
3. Click **Options** to configure the message and attachment you wish to send.
4. Back in the Popup, paste the list of phone numbers you want to send messages.
5. Click **Send** to start the messages delivery.

This extension is intended for legitimate and ethical use only. Please use this extension responsibly. The developers and owners are not responsible for any misuse or abuse of the extension.

## Building from Source

If you prefer to build the extension from source code, follow these steps:

### Prerequisites

- Ensure you have the latest Node.js and npm installed. Follow the installation instructions on the [Node.js official website](https://nodejs.org/).

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

This compiles and bundles the JavaScript files into the `dist` directory, which is then ready for local development and testing.

### Load the Extension in Chrome

1. Navigate to the Extensions page `chrome://extensions`.
   - Alternatively, click on the Extensions menu puzzle button and select **Manage Extensions** at the bottom of the menu.
   - Or, click the Chrome menu, hover over **More Tools**, then select **Extensions**.
2. Enable Developer Mode by toggling the switch next to **Developer mode**.
3. Click the **Load unpacked** button and select the `dist` directory.

The WTF Chrome Extension is now loaded in your Chrome browser.

## Disclaimer

This extension is not affiliated with or endorsed by WhatsApp™ or Meta Platforms, Inc. and affiliates. The use of this extension is at your own risk and the developers are not responsible for any damages, legal consequences, or other liabilities that may arise from the use of this extension.

## Acknowledgments

This project uses the following packages:

- [@playwright/test](https://github.com/microsoft/playwright) (Apache License 2.0)
- [@tsconfig/recommended](https://github.com/tsconfig/bases) (MIT License)
- [@types](https://github.com/DefinitelyTyped/DefinitelyTyped) (MIT License)
- [@wppconnect/wa-js](https://github.com/wppconnect-team/wa-js) (Apache License 2.0)
- [autoprefixer](https://github.com/postcss/autoprefixer) (MIT License)
- [copy-webpack-plugin](https://github.com/webpack-contrib/copy-webpack-plugin) (MIT License)
- [css-loader](https://github.com/webpack-contrib/css-loader) (MIT License)
- [cssnano](https://github.com/cssnano/cssnano) (MIT License)
- [postcss-loader](https://github.com/webpack-contrib/postcss-loader) (MIT License)
- [qrcode-terminal](https://github.com/gtanner/qrcode-terminal) (Apache License 2.0)
- [react-dom](https://github.com/facebook/react) (MIT License)
- [react](https://github.com/facebook/react) (MIT License)
- [rimraf](https://github.com/isaacs/rimraf) (ISC License)
- [speed-measure-webpack-plugin](https://github.com/stephencookdev/speed-measure-webpack-plugin) (MIT License)
- [style-loader](https://github.com/webpack-contrib/style-loader) (MIT License)
- [tailwindcss](https://github.com/tailwindlabs/tailwindcss) (MIT License)
- [ts-loader](https://github.com/TypeStrong/ts-loader) (MIT License)
- [typescript](https://github.com/microsoft/TypeScript) (Apache License 2.0)
- [webpack-cli](https://github.com/webpack/webpack-cli) (MIT License)
- [webpack-merge](https://github.com/survivejs/webpack-merge) (MIT License)
