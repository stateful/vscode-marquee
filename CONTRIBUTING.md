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

In order to propose changes to the code, please check out the repository and install neccessary dependencies:

```sh
git clone git@github.com:stateful/marquee.git
cd marquee
yarn install
```

Next, build the project:

```sh
yarn build
```

and open up VSCode:

```sh
code .
```

Now, you can start to run the built version when pressing `F5`. Make sure to run `yarn watch` (or `SHIFT + CMD + B`) in one of your terminals so that the project is being rebuild everytime you change a file. To restart the extension you can press `CMD + R` or `Control + R` (like reloading a website in a browser).

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
