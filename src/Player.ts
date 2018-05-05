// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import * as buffers from "./buffers";

export default class Player {
  private _disposable: vscode.Disposable | null = null;
  private _currentBuffer: buffers.Buffer;

  public static register(context: vscode.ExtensionContext) {
    return () => {
      const buffer = buffers.get(0);
      if (!buffer) {
        vscode.window.showErrorMessage("No active recording");
        return;
      }

      vscode.window.showInformationMessage(
        `Now playing ${buffers.count()} frames!`
      );

      const player = new Player(buffer);
      context.subscriptions.push(player);
    };
  }

  constructor(initialBuffer: buffers.Buffer) {
    this._currentBuffer = initialBuffer;

    // subscribe to selection change events
    let subscriptions: vscode.Disposable[] = [];
    vscode.window.onDidChangeTextEditorSelection(
      this.onEvent,
      this,
      subscriptions
    );
    // Why?
    this._disposable = vscode.Disposable.from(...subscriptions);
  }

  private onEvent(e: vscode.TextEditorSelectionChangeEvent) {
    if (this._currentBuffer) {
      e.textEditor.edit(edit => {
        const l = e.textEditor.document.lineCount;
        const range = new vscode.Range(
          new vscode.Position(0, 0),
          new vscode.Position(
            l,
            e.textEditor.document.lineAt(l - 1).text.length - 1
          )
        );

        edit.delete(range);
        edit.insert(new vscode.Position(0, 0), this._currentBuffer.text);

        this._currentBuffer = buffers.get(this._currentBuffer.position + 1);
      });
    }
  }

  dispose() {
    if (this._disposable) {
      this._disposable.dispose();
    }
  }
}
