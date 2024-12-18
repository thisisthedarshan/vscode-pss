# Install instructions for VS Code extension for PSS

There are 4 ways of installing the VS Code extension:

## 1. Through the VS Code Marketplace

- Open up VS Code and look for ***darshan.dsp-vsc-pss*** in the Extensions Tab (Ctrl+Shift+X).
- Click Install

## 2. Through Command

In VS Code, *Launch VS Code Quick Open* (using **Ctrl+P**) and paste the following command: ```ext install darshan.dsp-vsc-pss```. Click Enter and the extension should be installed

## 3. Through release

- Go to [GitHub Releases](https://github.com/thisisthedarshan/vscode-pss/releases)
- Click on the Assets Dropdown on the latest version
- Click on the **release-pss-vsc.vsix** file and it should be downloaded
- Run the command ```code --install-extension release-pss-vsc.vsix``` to install the downloaded extension

## 4. From Source

- Ensure that you have [NodeJS]() installed.
- Clone the repository on your system.
- Explore the source code (that's why we)
- Run ``npm install``
- Install the [vsce](https://www.npmjs.com/package/vsce) node package using ``npm install @vscode/vsce``
- Run ``vsce package`` to create the **.vsix** file.
- Install the package using ``code --install-extension generated-vsix-file-name.vsix``
