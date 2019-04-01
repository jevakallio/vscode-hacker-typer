"use strict";

import * as vscode from "vscode";
import Storage from "./storage";
import Recorder from "./Recorder";
import * as replay from "./replay";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log(
    'Congratulations, your extension "vscode-hacker-typer" is now active!'
  );

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with  registerCommand
  // The commandId parameter must match the command field in package.json
  let record = vscode.commands.registerCommand(
    "jevakallio.vscode-hacker-typer.recordMacro",
    Recorder.register(context)
  );

  let play = vscode.commands.registerCommand(
    "jevakallio.vscode-hacker-typer.playMacro",
    () => {
      replay.start(context);
    }
  );

  let remove = vscode.commands.registerCommand(
    "jevakallio.vscode-hacker-typer.removeMacro",
    () => {
      const storage = Storage.getInstance(context);
      const items = storage.list();
      vscode.window.showQuickPick(items.map(item => item.name)).then(picked => {
        if (!picked) {
          return;
        }

        storage.remove(picked);
        vscode.window.showInformationMessage(`Removed "${picked}"`);
      });
    }
  );

  let exprt = vscode.commands.registerCommand(
    "jevakallio.vscode-hacker-typer.exportMacro",
    () => console.log('flag exporting')
  );

  // @TODO dispose
  let type = vscode.commands.registerCommand("type", replay.onType);

  // @TODO use registerTextEditorCommand instead?
  // https://code.visualstudio.com/docs/extensionAPI/vscode-api
  let backspace = vscode.commands.registerCommand(
    "jevakallio.vscode-hacker-typer.backspace",
    replay.onBackspace
  );

  context.subscriptions.push(record, play, type, backspace, remove, exprt);
}

// this method is called when your extension is deactivated
export function deactivate() {}
