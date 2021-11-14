import * as vscode from 'vscode';
import sort from 'sort-package-json';

const sortPackageJson = async (doc: vscode.TextDocument) => {
  if (!doc.fileName.endsWith('package.json')) {
    return;
  }

  const sorted = sort(doc.getText());

  await vscode.workspace.fs.writeFile(doc.uri, Buffer.from(sorted, 'utf8'));
};

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand('sort-package.sortPackage', async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        return;
      }

      await sortPackageJson(editor.document);
    }),
  );

  context.subscriptions.push(
    vscode.workspace.onDidSaveTextDocument(async doc => {
      const config = vscode.workspace.getConfiguration('sortPackage');
      if (config.get<boolean>('onSave')) {
        await sortPackageJson(doc);
      }
    }),
  );
}

export function deactivate() {}
