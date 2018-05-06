import * as vscode from "vscode";
import * as buffers from "./buffers";
import * as Queue from "promise-queue";

const replayConcurrency = 1;
const replayQueueMaxSize = Number.MAX_SAFE_INTEGER;
const replayQueue = new Queue(replayConcurrency, replayQueueMaxSize);

let isEnabled = false;
let currentBuffer: buffers.Buffer | undefined;

export function enable() {
  currentBuffer = buffers.get(0);
  if (!currentBuffer) {
    vscode.window.showErrorMessage("No active recording");
    return;
  }

  console.log("All", JSON.stringify(buffers.all()));

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
    replayQueue.add(() => new Promise(next => {
      advanceBuffer(next);
    }));
  } else {
    vscode.commands.executeCommand("default:type", { text });
  }
}

function advanceBuffer(next: () => void) {
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
  const updateSelectionAndAdvanceToNextBuffer = () => {
    if (selections.length) {
      editor.selections = selections;
    }

    currentBuffer = buffers.get(buffer.position + 1);

    // Ran out of buffers? Disable type capture.
    if (!currentBuffer) {
      disable();
    }

    next();
  };

  if (changes.length > 0) {
    editor
      .edit(edit => applyContentChanges(changes, edit))
      .then(updateSelectionAndAdvanceToNextBuffer);
  } else {
    updateSelectionAndAdvanceToNextBuffer();
  }
}

function applyContentChanges(
  changes: vscode.TextDocumentContentChangeEvent[],
  edit: vscode.TextEditorEdit 
) {
  changes.forEach(change => applyContentChange(change, edit)
}

function applyContentChange(
  change: vscode.TextDocumentContentChangeEvent,
  edit: vscode.TextEditorEdit
) {
  if (change.text === "") {
    edit.delete(change.range);
  } else if (change.rangeLength === 0) {
    edit.insert(change.range.start, change.text);
  } else {
    edit.replace(change.range, change.text);
  }
}
