import * as vscode from "vscode";
import * as buffers from "./buffers";
import Storage from "./storage";
import * as Queue from "promise-queue";

const stopPointBreakChar = `\n`; // ENTER
const replayConcurrency = 1;
const replayQueueMaxSize = Number.MAX_SAFE_INTEGER;
const replayQueue = new Queue(replayConcurrency, replayQueueMaxSize);

let isEnabled = false;
let currentBuffer: buffers.Buffer | undefined;

export function start(context: vscode.ExtensionContext) {
  const storage = Storage.getInstance(context);
  const items = storage.list();
  vscode.window.showQuickPick(items.map(item => item.name)).then(picked => {
    if (!picked) {
      return;
    }

    vscode.window.showInformationMessage(`${picked}`);
    const macro = storage.getByName(picked);
    buffers.inject(macro.buffers);

    currentBuffer = buffers.get(0);
    if (!currentBuffer) {
      vscode.window.showErrorMessage("No active recording");
      return;
    }

    isEnabled = true;
    vscode.window.showInformationMessage(
      `Now playing ${buffers.count()} buffers from ${macro.name}!`
    );
  });
}

export function disable() {
  isEnabled = false;
  currentBuffer = undefined;
}

export function onType({ text }: { text: string }) {
  if (isEnabled) {
    replayQueue.add(
      () =>
        new Promise((resolve, reject) => {
          try {
            advanceBuffer(resolve, text);
          } catch (e) {
            reject(e);
          }
        })
    );
  } else {
    vscode.commands.executeCommand("default:type", { text });
  }
}

export function onBackspace() {
  // move buffer one step backwards
  if (isEnabled && currentBuffer && currentBuffer.position > 0) {
    currentBuffer = buffers.get(currentBuffer.position - 1);
  }

  // actually execute backspace action
  vscode.commands.executeCommand("deleteLeft");
}

function advanceBuffer(done: () => void, userInput: string) {
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

  if (buffers.isStopPoint(buffer)) {
    if (userInput === stopPointBreakChar) {
      currentBuffer = buffers.get(buffer.position + 1);
    }

    return done();
  }

  const { changes, selections } = <buffers.Frame>buffer;

  const updateSelectionAndAdvanceToNextBuffer = () => {
    if (selections.length) {
      editor.selections = selections;

      // move scroll focus if needed
      const { start, end } = editor.selections[0];
      editor.revealRange(
        new vscode.Range(start, end),
        vscode.TextEditorRevealType.InCenterIfOutsideViewport
      );
    }

    currentBuffer = buffers.get(buffer.position + 1);

    // Ran out of buffers? Disable type capture.
    if (!currentBuffer) {
      disable();
    }

    done();
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
  changes.forEach(change => applyContentChange(change, edit));
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
