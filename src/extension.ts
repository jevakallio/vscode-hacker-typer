"use strict";

import * as vscode from "vscode";
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
    "hackertyper.recordMacro",
    Recorder.register(context)
  );

  let play = vscode.commands.registerCommand("hackertyper.playMacro", () => {
    replay.start(context);
  });

  let test = vscode.commands.registerCommand("hackertyper.testStuff", () => {});

  // @TODO dispose
  let type = vscode.commands.registerCommand("type", replay.onType);

  let backspace = vscode.commands.registerCommand(
    "hackertyper.backspace",
    replay.onBackspace
  );

  context.subscriptions.push(record, play, type, backspace, test);
}

// this method is called when your extension is deactivated
export function deactivate() {}
