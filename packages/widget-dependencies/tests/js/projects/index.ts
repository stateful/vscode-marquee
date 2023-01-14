import path from 'path'

function jsProjectPath (project: string) {
  return path.join(__dirname, project)
}

export default {
  yarn: jsProjectPath('yarn'),
  yarnWorkspaces: jsProjectPath('yarn-workspaces')
}