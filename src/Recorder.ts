// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import * as buffers from "./buffers";
import Storage from "./storage";

export default class Recorder {
  private _disposable: vscode.Disposable;
  private _textEditor: vscode.TextEditor | undefined;
  private _buffers = 0;
  private _currentChanges: vscode.TextDocumentContentChangeEvent[] = [];
  private _storage: Storage;

  public static register(context: vscode.ExtensionContext) {
    return () => {
      // reset global buffer
      buffers.clear();

      vscode.window.showInformationMessage("Now recording!");
      const recorder = new Recorder(Storage.getInstance(context));
      context.subscriptions.push(recorder);
    };
  }

  constructor(storage: Storage) {
    this._storage = storage;

    let subscriptions: vscode.Disposable[] = [];

    vscode.workspace.onDidChangeTextDocument(
      this.onDidChangeTextDocument,
      this,
      subscriptions
    );

    vscode.window.onDidChangeTextEditorSelection(
      this.onDidChangeTextEditorSelection,
      this,
      subscriptions
    );

    const insertNamedStop = vscode.commands.registerCommand(
      "hackertyper.insertNamedStop",
      this.insertNamedStop,
      this
    );

    const insertStop = vscode.commands.registerCommand(
      "hackertyper.insertStop",
      () => {
        this.insertStop(null);
      }
    );

    const save = vscode.commands.registerCommand(
      "hackertyper.saveMacro",
      () => {
        this.saveRecording(save);
      }
    );

    // Why?
    this._textEditor = vscode.window.activeTextEditor;
    this._disposable = vscode.Disposable.from(
      ...subscriptions,
      insertNamedStop,
      insertStop,
      save
    );
  }

  private insertNamedStop() {
    vscode.window
      .showInputBox({
        prompt: "What do you want to call your stop point?",
        placeHolder: "Type a name or ENTER for unnamed stop point"
      })
      .then(name => {
        this.insertStop(name || null);
      });
  }

  private insertStop(name: string | null) {
    buffers.insert({
      stop: {
        name: name || null
      },
      changes: null,
      selections: null,
      position: this._buffers++
    });
  }

  private saveRecording(command: vscode.Disposable) {
    vscode.window
      .showInputBox({
        prompt: "Give this thing a name",
        placeHolder: "cool-macro"
      })
      .then(name => {
        if (name) {
          return this._storage
            .save({
              name,
              description: "",
              buffers: buffers.all()
            })
            .then(macro => {
              vscode.window.showInformationMessage(
                `Saved ${macro.buffers.length} buffers under "${macro.name}".`
              );
              command.dispose();
            });
        }
      });
  }

  private onDidChangeTextDocument(e: vscode.TextDocumentChangeEvent) {
    // @TODO: Gets called while playing -- need to stop recording once over

    // store changes, selection change will commit
    this._currentChanges = e.contentChanges;
  }

  private onDidChangeTextEditorSelection(
    e: vscode.TextEditorSelectionChangeEvent
  ) {
    // @TODO: Gets called while playing -- need to stop recording once over

    // Only allow recording to one active editor at a time
    // Breaks when you leave but that's fine for now.
    if (e.textEditor !== this._textEditor) {
      return;
    }

    const changes = this._currentChanges;
    const selections = e.selections || [];
    this._currentChanges = [];

    buffers.insert({
      changes,
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
