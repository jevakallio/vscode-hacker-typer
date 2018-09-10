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

    const macro = storage.getByName(picked);
    buffers.inject(macro.buffers);

    currentBuffer = buffers.get(0);
    if (!currentBuffer) {
      vscode.window.showErrorMessage("No active recording");
      return;
    }

    const textEditor = vscode.window.activeTextEditor;
    if (buffers.isStartingPoint(currentBuffer) && textEditor) {
      setStartingPoint(currentBuffer, textEditor);
    }

    isEnabled = true;
    vscode.window.showInformationMessage(
      `Now playing ${buffers.count()} buffers from ${macro.name}!`
    );
  });
}

function setStartingPoint(
  startingPoint: buffers.StartingPoint,
  textEditor: vscode.TextEditor
) {
  textEditor
    .edit(edit => {
      // update initial file content
      const l = textEditor.document.lineCount;
      const range = new vscode.Range(
        new vscode.Position(0, 0),
        new vscode.Position(
          l,
          Math.max(
            0,
            textEditor.document.lineAt(Math.max(0, l - 1)).text.length - 1
          )
        )
      );

      edit.delete(range);
      edit.insert(new vscode.Position(0, 0), startingPoint.content);
    })
    .then(() => {
      updateSelections(startingPoint.selections, textEditor);

      // move to next frame
      currentBuffer = buffers.get(startingPoint.position + 1);
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

function updateSelections(
  selections: vscode.Selection[],
  editor: vscode.TextEditor
) {
  editor.selections = selections;

  // move scroll focus if needed
  const { start, end } = editor.selections[0];
  editor.revealRange(
    new vscode.Range(start, end),
    vscode.TextEditorRevealType.InCenterIfOutsideViewport
  );
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
      updateEditorSelections(selections, editor);
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
