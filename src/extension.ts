'use strict';

import * as vscode from 'vscode';
import { exec } from 'child_process';

export function activate(context: vscode.ExtensionContext) {
    vscode.workspace.onWillSaveTextDocument(e => executeFlake8Alert(e.document.fileName))

    let disposable = vscode.commands.registerCommand('extension.flake8Alert', () => {
        if (!vscode.window.activeTextEditor) {
            return;
        }
        executeFlake8Alert(vscode.window.activeTextEditor.document.fileName);
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {
}

function executeFlake8Alert(filepath: string) {
    exec(
        "python -m flake8 --ignore=E501 " + filepath,
        {},
        (error: Error | null, stdout: string, stderr: string) => {
          const errorList = stdout.split("\n").filter(e => e.length > filepath.length).map(e => e.substring(filepath.length + 1));
          if (errorList.length == 0) {
            return;
          }
          vscode.window.showQuickPick(errorList).then(selection => {
            if (!selection) {
                return;
            }
            const data = selection.split(":");
            const line = Number(data[0]) - 1;
            const cols = Number(data[1]) - 1;
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                return;
            }
            const position = editor.selection.active;
            var newPosition = position.with(line, cols);
            var newSelection = new vscode.Selection(newPosition, newPosition);
            editor.selection = newSelection;
            vscode.commands.executeCommand("revealLine", {
              lineNumber: (line == 0) ? line : line - 1,
              at: "top"
            });
          });
        }
      );
}
