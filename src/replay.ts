import * as vscode from "vscode";
import * as buffers from "./buffers";

let isEnabled = false;
let currentBuffer: buffers.Buffer | undefined;

export function enable() {
  currentBuffer = buffers.get(0);
  if (!currentBuffer) {
    vscode.window.showErrorMessage("No active recording");
    return;
  }

  console.log("All", buffers.all());

  isEnabled = true;
  vscode.window.showInformationMessage(
    `Now playing ${buffers.count()} frames!`
  );
}

export function disable() {
  isEnabled = false;
  currentBuffer = undefined;
}

export function onType({ text }: { text: string }) {
  if (isEnabled) {
    advanceBuffer();
  } else {
    vscode.commands.executeCommand("default:type", { text });
  }
}

function advanceBuffer() {
  const editor = vscode.window.activeTextEditor;
  const buffer = currentBuffer;

  if (!editor) {
    vscode.window.showErrorMessage("No active editor");
    return;
  }

  if (!buffer) {
    vscode.window.showErrorMessage("No buffer to advance");
    return;
  }

  const { changes, selections } = buffer;
  const advance = () => {
    if (selections.length) {
      editor.selections = selections;
    }

    currentBuffer = buffers.get(buffer.position + 1);

    // Ran out of buffers? Disable type capture.
    if (!currentBuffer) {
      disable();
    }
  };

  if (changes.length) {
    editor.edit(edit => {
      changes.forEach(change => applyContentChanges(change, edit));
      advance();
    });
  } else {
    advance();
  }
}

function applyContentChanges(
  change: vscode.TextDocumentContentChangeEvent,
  edit: vscode.TextEditorEdit
) {
  if (change.text === "") {
    console.log("delete", change);
    edit.delete(change.range);
  } else if (change.rangeLength === 0) {
    console.log("insert", change);
    edit.insert(change.range.start, change.text);
  } else {
    console.log("replace", change);
    edit.replace(change.range, change.text);
  }
}
