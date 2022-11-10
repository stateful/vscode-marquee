# Contributing

You like Marquee and want to help making it better? Awesome! We are working to make this process as easy and transparent as possible. We might be not quite there yet but this guide will help you to ramp you up as a contributor and give you everything you need to make your first contribution. If there is any information missing that prevents you from sending in a pull request, please let us know. We treat these kind of issues like actual bugs.

## Code of Conduct

Everyone who participates in this project, either as a user or a contributor, is obliged to follow the projects [Code of Conduct](https://github.com/stateful/.github/blob/main/CODE_OF_CONDUCT.md). Every violation against it will be reviewed and investigated and will result in a response that is deemed necessary and appropriate to the circumstances. The project team is obligated to maintain confidentiality with regard to the reporter of an incident. Further details of specific enforcement policies may be posted separately.

## Find A Way To Contribute

The project offers a variety of ways to contribute. If you struggle to find something suited for you, join the Marquee support channel on [Gitter](https://gitter.im/vscode-marquee/community) or [Discord](https://discord.com/channels/878764303052865537/900787619728871484) and reach out to the maintainer there. Don't be shy, they are there to help!

You can participate by:

- contributing code
- improving documentation
- help out folks in our support channels
- create educational content (blog posts, tutorials, videos, etc.)
- spread the good word about the project (e.g. via Twitter)
- create bugs if you discover them while using Marquee
- make feature requests if you are missing something in the project

The maintainers of the project try to organize all [issues](https://github.com/stateful/vscode-marquee/issues) in the way that should allow anyone to have enough context to start working on it. If this is not the case please mention it in the issue thread so that either the issue creator or a maintainer can provide more information.

## Contributing Code

In order to propose changes to the code, please check out the repository:

```sh
git clone git@github.com:stateful/vscode-marquee.git
cd vscode-marquee
```

and install neccessary dependencies:

```sh
yarn install
```

Next, build the project:

```sh
yarn build:dev
```

and open up VS Code:

```sh
code .
```

Now, you can start to run the built version when pressing `F5`. Make sure to run `yarn watch` (or `SHIFT + CMD + B`) in one of your terminals so that the project is being rebuild everytime you change a file. To restart the extension you can press `CMD + R` or `Control + R` (like reloading a website in a browser).

In order to ensure that types are updated and bundle recompiled after making changes, ensure to run the watch task:

```sh
yarn watch
```

### Adding a new Core Widget

Marquee maintains its codebase as a monorepo containing various of modules within the `packages` directory:

- `/packages/dialog`: utility package for creating dialogs within the webview
- `/packages/extension`: code that runs on the extension host
- `/packages/gui`: core webview application
- `/packages/utils`: common utility modules
- `/packages/widget`: common widget components
- `/packages/wdiget-xxx`: core Marquee widget code

When creating a new widget, e.g. a foobar widget, add a new directory within that folder, e.g. `/packages/widget-foobar`, and follow the folder structure as other widget modules. The `package.json` should point to an entry file that exports basic widget information, e.g.:

widget-foobar sample folder structure
```
packages
...other packages
└───widget-foobar
    │   build
    │   extension
    │   │   package.json
    │   src
    │   │   constants.ts
    │   │   extension.ts
    │   │   index.tsx
    │   │   types.ts
    │   │   Widget.tsx
    │   package.json
    │   tsconfig.json
```

Create a `tsconfig.json` file in the widget-foobar root
```json
{
  "extends": "../../tsconfig",
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "node",
    "baseUrl": ".",
    "outDir": "./build",
    "rootDir": "./src",
    "skipLibCheck": true
  },
  "include": [
    "src/**/*",
    "../../@types"
  ]
}
```

Create a `package.json` in the widget-foobar root
```json
{
  "name": "@vscode-marquee/widget-foobar",
  "description": "Marquee Foobar Widget",
  "version": "0.1.0",
  "private": true,
  "main": "./build/index.js",
  "types": "./build/index.d.ts",
  "dependencies": {
    "@vscode-marquee/utils": "^0.1.0",
    "@vscode-marquee/widget": "^0.1.0"
  }
}
```


`packages/widget-foobar/src/index.tsx:`

Setting marquee up with our `Widget.tsx` ui
```ts
import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCloudSun } from '@fortawesome/free-solid-svg-icons/faCloudSun'

import FoobarWidget from './Widget'

export default {
  name: 'foobar',
  icon: <FontAwesomeIcon icon={faCloudSun} />,
  label: 'Foo Bar',
  tags: [],
  description: '...',
  component: FoobarWidget,
}
```

Add the new package to the workspace list in [`/package.json`](https://github.com/stateful/vscode-marquee/blob/dcd2d832853c3b8be9d65b58e736c7d43cacdaf3/package.json#L48-L62) also adding a new [`watch:foobar`](https://github.com/stateful/vscode-marquee/blob/main/package.json#L3383-L3399) script and import it in [`/packages/gui/src/constants.ts`](https://github.com/stateful/vscode-marquee/blob/main/packages/gui/src/constants.ts#L22-L33) so it is loaded by the webview. A basic `widget component` looks as following:

`packages/widget-foobar/src/Widget.tsx:`
```ts
import React, { useContext } from 'react'
import { Grid, Typography } from '@mui/material'

import wrapper, { Dragger, HidePop, HeaderWrapper, NavIconDropdown } from '@vscode-marquee/widget'
import type { MarqueeWidgetProps } from '@vscode-marquee/widget'

const Foobar = ({ ToggleFullScreen, fullscreenMode, minimizeNavIcon }: MarqueeWidgetProps) => {
  // ...
  const NavButtons = () => (
    <Grid item>
      <Grid
        container
        justifyContent="right"
        direction={minimizeNavIcon ? 'column-reverse' : 'row'}
        spacing={1}
        alignItems="center"
        padding={minimizeNavIcon ? 0.5 : 0}
      >
        <CopyToClipboardButton />
        <Grid item>
          <HidePop name="markdown" />
        </Grid>
        <Grid item>
          <ToggleFullScreen />
        </Grid>
        {!fullscreenMode &&
          <Grid item>
            <Dragger />
          </Grid>
        }
      </Grid>
    </Grid>
  )

  return (
    <>
      <HeaderWrapper>
        <Grid item>
          <Typography variant="subtitle1">Foobar</Typography>
        </Grid>
        {minimizeNavIcon ?
          <PopupState variant='popper' popupId='widget-markdown'>
            {(popupState) => {
              return (
                <NavIconDropdown popupState={popupState}>
                  <NavButtons />
                </NavIconDropdown>
              )}}
          </PopupState>
          :
          <Grid item xs={8}>
            <NavButtons />
          </Grid>
        }
      </HeaderWrapper>
      <Grid item xs>
        <Grid
          container
          wrap="nowrap"
          direction="column"
          style={{ height: '100%' }}
        >
          <Grid item xs style={{ overflow: 'hidden' }}>
            Hello World
          </Grid>
        </Grid>
      </Grid>
    </>
  )
}

export default wrapper((props: any) => (
  <Foobar {...props} />
), 'foobar')
```

### Run Code within Extension Host

If you need to run certain code within the extension host, e.g. if you like fetch data for the widget, create an `extension` folder within the widget directory and point to a file that exports an `activate` method, e.g.:

Create a `package/widget-foobar/extension/package.json`
```json
{
  "name": "@vscode-marquee/widget-foobar-extension",
  "description": "extension logic for Foobar Widget",
  "main": "../build/extension.js",
  "module": "../build/extension.js",
  "types": "../build/extension.d.ts"
}
```

The `activate` method is called when Marquee as extension is activated. You can use it to iniate an `ExtensionManager` instance that simplifies state and configuration management for the widget, e.g.:

`package/widget-foobar/src/extension.ts`
```ts
import vscode from 'vscode'

import ExtensionManager from '@vscode-marquee/utils/extension'

import { DEFAULT_CONFIGURATION, DEFAULT_STATE } from './constants'
import type { Configuration, State } from './types'

const STATE_KEY = 'widgets.foobar'

export function activate (
  context: vscode.ExtensionContext,
  channel: vscode.OutputChannel
) {
  const stateManager = new ExtensionManager<State, Configuration>(
    context,
    channel,
    STATE_KEY,
    DEFAULT_CONFIGURATION,
    DEFAULT_STATE
  )

  return {
    marquee: {
      disposable: stateManager,
      defaultState: stateManager.state,
      defaultConfiguration: stateManager.configuration,
      setup: stateManager.setBroadcaster.bind(stateManager)
    }
  }
}
```

Lastly import the method within the [`packages/extension/src/stateManager.ts`](https://github.com/stateful/vscode-marquee/blob/main/packages/extension/src/stateManager.ts#L11-L20) so that the `activate` method will be called accordingly and the [`tangle`](https://www.npmjs.com/package/tangle) instance attached to the webview.


## Reporting New Issues

When [opening a new issue](https://github.com/stateful/vscode-marquee/issues/new/choose), always make sure to fill out the issue template. __This step is very important!__ Not doing so may result in your issue not managed in a timely fashion. Don't take this personally if this happens, and feel free to open a new issue once you've gathered all the information required by the template.

- __One issue, one bug:__ Please report a single bug per issue.
- __Provide reproduction steps:__ List all the steps necessary to reproduce the issue. The person reading your bug report should be able to follow these steps to reproduce your issue with minimal effort.

### Security Bugs

See [SECURITY.md](https://github.com/stateful/.github/blob/main/SECURITY.md).

## Release New Version

Package releases are made using a GitHub workflow. All you need to do is go to the [`Manual NPM Publish`](https://github.com/stateful/vscode-marquee/actions/workflows/release.yml) workflow and trigger a new run. Choose the appropriate version upgrade based on the [Semantic Versioning](https://semver.org/) and the release channel. To help choose the right release type, here are some general guidelines:

- __Breaking Changes__: never do these by yourself! A major release is always a collaborative effort between all TSC members. It requires consensus from all of them.
- __Minor Release__: minor releases are always required if a new, user focused feature was added to one of the packages. For example, if a command was added to WebdriverIO or if a service provides a new form of integration, a minor version bump would be appropriate. However if an internal package like `@wdio/local-runner` exposes a new interface that is solely used internally, we can consider that as a patch release.
- __Patch Release__: every time a bug is fixed, documentation (this includes TypeScript definitions) gets updated or existing functionality is improved, we should do a patch release.
