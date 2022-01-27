Marquee
=======
[![Test](https://github.com/stateful/vscode-marquee/actions/workflows/test.yml/badge.svg)](https://github.com/stateful/vscode-marquee/actions/workflows/test.yml)
[![vscode version](https://vsmarketplacebadge.apphb.com/version/activecove.marquee.svg)](https://marketplace.visualstudio.com/items?itemName=activecove.marquee&ssr=false#overview)
[![number of installs](https://vsmarketplacebadge.apphb.com/installs/activecove.marquee.svg)](https://marketplace.visualstudio.com/items?itemName=activecove.marquee&ssr=false#overview)
[![average user rating](https://vsmarketplacebadge.apphb.com/rating/activecove.marquee.svg)](https://marketplace.visualstudio.com/items?itemName=activecove.marquee&ssr=false#review-details)
![license](https://img.shields.io/github/license/stateful/marquee.svg)

### Stay organized with minimal context switching, all inside your Visual Studio Code.

Marquee is a [VS Code](https://code.visualstudio.com/) extension designed to naturally integrate with your development flow, so that you will no longer lose track of your thoughts while you're coding. It is a fully extensible home screen platform for your favorite IDE that elegantly handles a multitude of VS Code windows.

<p align="center" style="padding: 20px 0">
  <a href="https://marketplace.visualstudio.com/items?itemName=activecove.marquee&ssr=false#overview">
    <img src="https://img.shields.io/badge/Install-VSCode%20Marketplace-blue" />
  </a>
</p>

![Screenshot](/website/public/assets/screenshot-optimized.gif)

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

* `marquee.configuration.proxy`: URL to proxy (e.g. `https://username:password@domain.tld:port`) to be used by widgets that rely on network content (e.g. news and weather widget)
* `marquee.configuration.fontSize`: Font Size of widgets (`0` very small / `10` very large)
* `marquee.configuration.startup.launchOnStartup`: If set to true, Marquee will automatically start when VSCode launches
* `marquee.configuration.startup.workspaceLaunch`: If set to true, Marquee auto start will only work if a workspace is opened
* `marquee.configuration.colorScheme`: Allows to set a color scheme for the Marque webview (by default it is the same as the VSCode theme)

## More

- If you have questions, you can get more information [on our website](http://marquee.stateful.com).
- For support or questions, you can email us at info@stateful.com.
- Our privacy policy is available at [https://marquee.stateful.com/privacy](https://marquee.stateful.com/privacy).
