import * as vscode from 'vscode'
import { sortPackageJson } from 'sort-package-json'

const sortDocument = async (document: vscode.TextDocument) => {
  if (!document.fileName.endsWith('package.json')) {
    return
  }

  let json: any

  try {
    json = JSON.parse(document.getText())
  } catch (err) {
    return vscode.window.showErrorMessage('Error parsing JSON')
  }

  const sortedJson = sortPackageJson(json)

  const hasUpdatedDependencies = isDifferent('dependencies', json, sortedJson)
  const hasUpdatedDevDependencies = isDifferent(
    'devDependencies',
    json,
    sortedJson,
  )

  if (!hasUpdatedDependencies && !hasUpdatedDevDependencies) {
    return
  }

  if (hasUpdatedDependencies) {
    json.dependencies = sortedJson.dependencies
  }

  if (hasUpdatedDevDependencies) {
    json.devDependencies = sortedJson.devDependencies
  }

  return vscode.workspace.fs.writeFile(
    document.uri,
    Buffer.from(JSON.stringify(json, null, 2) + '\n', 'utf8'),
  )
}

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand(
      'vscode-sort-package-json-dependencies.sortPackageDependencies',
      async () => {
        const editor = vscode.window.activeTextEditor
        if (!editor) {
          return
        }

        const { document } = editor
        if (!document.fileName.endsWith('package.json')) {
          return vscode.window.showErrorMessage('Not a package.json file')
        }

        await sortDocument(document)
      },
    ),
  )

  context.subscriptions.push(
    vscode.workspace.onDidSaveTextDocument(async (doc) => {
      const config = vscode.workspace.getConfiguration(
        'sortPackageDependencies',
      )
      if (config.get<boolean>('onSave')) {
        await sortDocument(doc)
      }
    }),
  )
}

const isDifferent = (key: string, obj1: any, obj2: any) => {
  if (key in obj1 && key in obj2) {
    return JSON.stringify(obj1[key]) !== JSON.stringify(obj2[key])
  }

  return false
}

export function deactivate() {}
