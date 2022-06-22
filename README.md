Marquee
=======
[![Test](https://github.com/stateful/vscode-marquee/actions/workflows/test.yml/badge.svg)](https://github.com/stateful/vscode-marquee/actions/workflows/test.yml)
[![vscode version](https://vsmarketplacebadge.apphb.com/version/stateful.marquee.svg)](https://marketplace.visualstudio.com/items?itemName=stateful.marquee&ssr=false#overview)
[![number of installs](https://vsmarketplacebadge.apphb.com/installs/stateful.marquee.svg)](https://marketplace.visualstudio.com/items?itemName=stateful.marquee&ssr=false#overview)
[![average user rating](https://vsmarketplacebadge.apphb.com/rating/stateful.marquee.svg)](https://marketplace.visualstudio.com/items?itemName=stateful.marquee&ssr=false#review-details)
![license](https://img.shields.io/github/license/stateful/marquee.svg)

### Stay organized with minimal context switching, all inside your Visual Studio Code.

Marquee is a [VS Code](https://code.visualstudio.com/) extension designed to naturally integrate with your development flow, so that you will no longer lose track of your thoughts while you're coding. It is a fully extensible homescreen platform for your favorite IDE that elegantly handles a multitude of VS Code windows.

<p align="center" style="padding: 20px 0">
  <a href="https://marketplace.visualstudio.com/items?itemName=stateful.marquee&ssr=false#overview">
    <img src="https://img.shields.io/badge/Install-VSCode%20Marketplace-blue" />
  </a>
</p>

![Screenshot](https://marquee.stateful.com/assets/screenshot-optimized.gif)

## Install from inside VS Code

1. Press `F1` or `⌘ + Shift + P` and type `install`.
2. Pick `Extensions: Install Extension`.
3. Type `marquee` and hit `enter`.
4. Restart Visual Studio Code.
5. Enter your name, create todos and be happy.

## Available Features:

- **Todos**: Keep track of workspace-specific todos. Create, archive and complete todos from the todo widget or the tree view while you are deep in code. Use the three-stripe filter button to toggle between global (all) or workspace-specific todos.
- **Weather**: Keep an eye on the local weather to know when it's time to head outside for a break, or to organize your day as the forecast changes. If the auto-suggested location doesn't match your prefered location, use the settings (gear icon) to specify a custom location.
- **Snippets**: The inter-workspace smart clipboard for your thoughts, code snippets, logs, or terminal traces. Anything you want to recall later. Whether you're writing code, debugging it, or jot down notes, **Snippets** support syntax highlighting and easy creation / insert from the editor's context menu. Simple click in the tree view will insert a snippets note in the editor at the cursor's location.
- **Hacker news**: See if there's anything worth reading in real-time without leaving your editor when you need a break. Passively keep an eye on them in the tree view on the left side so that you can browse without losing your place in code.
- **Github Trending**: Filter the most popular projects on Github by clicking the "gear" icon, and picking a programming language and or timespan, so you never fall behind on the coolest web framework.
- **Deep VS Code Integration**: Quickly switch to todos & latest Hacker news by clicking the Marquee icon in the far left navigation bar. Optionally expand the rich UX via the expand button next to **Marquee** in the top bar as part of the navigation pane.
- **Themability**: Customize your background and have Marquee pick up on your current VS Code theme. For more customization you can adjust colors or opacity of the overlaying widgets by clicking the "gear" icon in the welcome widget. It's usually pretty hands off. VS Code themes and our deep integration do the heavy lifting.
- **Extensibility**: You can write your own [custom widgets](https://marquee.stateful.com/docs/customWidgets) or leverage widgets contributed by extenstensions you've already installed.
- **Configurable Layouts**: For each resolution a new widget configuration is available, so resize and drag widgets around to fit your needs. Everything is configurable except the welcome widget.
- **Give us Feedback** and let us know what you want to use Marquee for. Optionally specify your email or be anonymous, totally up to you. Like or mark tricks as read. The "gear" icon has an option to recover tricks previously "marked as read" any time.

## Extension Settings

This extension contributes the following settings:

* `marquee.configuration.proxy` (type: `string`, default: `""`): URL to proxy (e.g. `https://username:password@domain.tld:port`). __Note:__ This only has an effect on widgets that gather data from the extension host (e.g. Welcome Widget).
* `marquee.configuration.fontSize` (type: `number`, default: `5`): Font Size of Widgets (`0` very small / `10` very large).
* `marquee.configuration.colorScheme` (type: `object`, default: `{}`): The color scheme applied to the Marquee Webview (default is based on the current VSCode color scheme).
* `marquee.gui.name` (type: `string`, default: `name here...`): Your name so Marquee can greet you!
* `marquee.gui.background` (type: `string`, default: `1`): Homescreen background image (currently only numbers between 1-10 are available, we will add support for Unsplash images soon).
* `marquee.configuration.modes` (type: `object`): Configuration of your widget location and display.
* `marquee.configuration.launchOnStartup` (type: `boolean`, default: `true`): Open Marquee when VS Code starts up.
* `marquee.configuration.workspaceLaunch` (type: `boolean`, default: `false`): Only auto-launch Marquee in Workspaces.
* `marquee.widgets.projects.workspaceFilter` (type: `string`, default: `""`): Filter for project list.
* `marquee.widgets.projects.workspaceSortOrder` (type: `string`): Sort order of projects.
* `marquee.widgets.projects.openProjectInNewWindow` (type: `boolean`, default: `false`): If true, Marquee will open a project in a new window.
* `marquee.widgets.github.language` (type: `string`, default: `""`): Query GitHub trends for a specific programming language.
* `marquee.widgets.github.spoken` (type: `string`, default: `""`): Query GitHub trends for a specific spoken language.
* `marquee.widgets.github.since` (type: `string`, default: `Weekly`): Query GitHub trends by specific time period.
* `marquee.widgets.github.trendFilter` (type: `string`, default: `""`): Query GitHub trends by specific key word
* `marquee.widgets.weather.city` (type: `string`, default: `null`): City for which the widget displays the weather forecast.
* `marquee.widgets.weather.scale` (type: `string`, default: `Fahrenheit`): Scale to display the weather forecast in.
* `marquee.widgets.todo.todoFilter` (type: `string`, default: `""`): Filter ToDos or their associated tags.
* `marquee.widgets.todo.hide` (type: `boolean`, default: `false`): Hide completed ToDos.
* `marquee.widgets.todo.showArchived` (type: `boolean`, default: `false`): Show archived ToDos.
* `marquee.widgets.todo.autoDetect` (type: `boolean`, default: `true`): Auto-detect ToDos in your code to allow adding them to Marquee.

## More

- If you have questions, you can get more information [on our website](http://marquee.stateful.com).
- For support or questions, you can email us at info@stateful.com.
- Our privacy policy is available at [https://www.stateful.com/privacy](https://www.stateful.com/privacy).
