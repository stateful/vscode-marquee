# Custom Widgets

Do you want to build your own custom widget? You can do that! Just build your own VSCode extension using the [offical VSCode documentation](https://code.visualstudio.com/api/get-started/your-first-extension) with some Marquee specific settings.

## Widget Architecture

While all core Marquee widgets are implemeted in React.js we need 3rd party widgets to be implemented as [web components](https://developer.mozilla.org/en-US/docs/Web/Web_Components) so we can embedd them into the React application. There are various of possible templates [here](https://webcomponents.dev/new) you can use. We recommend to pick a stack with a low footprint to keep bundle size low and Marquee performant.

To add your widget to Marquee add the following to your extension:

- build your widget based of web components and publish the file as part of your extension
- define a `marqueeWidget` property in your `package.json` file that points to the bundle where your widgets are defined (e.g. `"marqueeWidget": "./dist/widgets.js",`)
- register your widgets in your bundle via `window.marqueeExtension.defineWidget({ ... }), e.g.:

  ```ts
  import { faBrain } from "@fortawesome/free-solid-svg-icons/faBrain";

  class MyAwesomeWidget extends HTMLElement {
    // ...
  }

  window.marqueeExtension.defineWidget({
    name: 'my-awesome-widget',
    icon: faBrain,
    label: 'My Awesome Widget',
    tags: ['productivity'],
    description: 'This is an awesome widget you should have.'
  }, MyAwesomeWidget);
  ```

  You can define as many widgets as you like.
- Publish your VSCode extension to the marketplace, and voilá - once you install the extension, Marquee will automatically pick it up and display its content

## Data Communication

If your extension manages state data or other information you want to display, you can send them to your widget using [`tangle`](https://www.npmjs.com/package/tangle). Tangle is the data communication layer and allows to share state as well as events from your original extension and the Marquee webview. In order to iniate a communication channel return an object within your [activate method](https://code.visualstudio.com/api/get-started/extension-anatomy#extension-entry-file) or your extension entry file, e.g.:

```ts
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import type { Client } from 'tangle';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "helloworld-sample" is now active!');

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand('helloworld.helloWorld', () => {
    // The code you place here will be executed every time your command is executed

    // Display a message box to the user
    vscode.window.showInformationMessage('Hello World!');
  });

  context.subscriptions.push(disposable);

  // export interface for Marquee to setup channel
  return {
    marquee: {
      setup: (tangle: Client<{ counter: number }>) => {
        let i = 0;
        setInterval(() => {
          tangle.emit('counter', ++i);
        }, 1000);
      }
    }
  }
}
```

The setup method receives an already initialised tangle instance that you can use to exchange data. Read more about state and event sharing in the [tangle docs](https://github.com/stateful/tangle#state-management). Next, you can attach to your communication channel within your widget to receive the data, e.g.:

```ts
import Channel from 'tangle/webviews';

// the channel name is always your extension id
const ch = new Channel<{ counter: number }>('activecove.marquee');
const client = ch.attach(window.vscode);

class MyAwesomeWidget extends HTMLElement {
  constructor () {
    client.on('counter', this.incCounter.bind(this))
  }

  incCounter (cnt: number) {
    // ...
  }

  // ...
}
```

Note that the channel name you want to attach to is your extension id. Also important: Marquee attaches the VSCodeWebview instance, that you usually acquire through `window.acquireVsCodeApi()`, to the `window` scope for you to use.
