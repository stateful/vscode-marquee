/**
 * Currently edge releases have the following format: `3.0.0-edge.1` which
 * is valid semver but invalid as version to be published on the marketplace
 * (see also https://github.com/microsoft/vscode-vsce/issues/148 for context).
 * This means that edge releases are currently not possible with the workflow
 * we have.
 */
const fs = require('fs');
const path = require('path');

const pkgPath = path.join(__dirname, '..', '..', 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath).toString());

const newVersion = pkg.version.split('.').slice(0, 2)
newVersion.push(Date.now());
pkg.version = `${newVersion.join('.')}`;

console.log(`Update package.json with Edge version:\n\n${JSON.stringify(pkg, null, 2)}`);
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2))
