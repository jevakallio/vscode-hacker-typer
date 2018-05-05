// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import * as buffers from "./buffers";

export default class Recorder {
  private _disposable: vscode.Disposable;
  private _textEditor: vscode.TextEditor | undefined;
  private _buffers = 0;

  public static register(context: vscode.ExtensionContext) {
    return () => {
      // reset global buffer
      buffers.clear();
      vscode.window.showInformationMessage("Now recording!");
      const recorder = new Recorder();
      context.subscriptions.push(recorder);
    };
  }

  constructor() {
    // subscribe to selection change events
    let subscriptions: vscode.Disposable[] = [];
    vscode.window.onDidChangeTextEditorSelection(
      this.onEvent,
      this,
      subscriptions
    );

    // Why?
    this._textEditor = vscode.window.activeTextEditor;
    this._disposable = vscode.Disposable.from(...subscriptions);
  }

  private onEvent(e: vscode.TextEditorSelectionChangeEvent) {
    // Only allow recording to one active editor at a time
    // Breaks when you leave but that's fine for now.
    if (e.textEditor !== this._textEditor) {
      return;
    }

    const text = e.textEditor.document.getText();
    const selections = e.selections;
    buffers.insert({
      text,
      selections,
      position: this._buffers++
    });

    if (buffers.count() % 10 === 0) {
      vscode.window.showInformationMessage(buffers.count().toString());
    }
  }

  dispose() {
    if (this._disposable) {
      this._disposable.dispose();
    }
  }
}
