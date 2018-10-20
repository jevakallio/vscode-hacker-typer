# VSCode Hacker Typer

_Great for live coding presentations, impressing your friends, or just trying to look busy at work._

![Promotional video](docs/hackertyper-video.gif)

Hacker Typer allows you to record yourself programming, and to replay the same keystrokes by wildly mashing any key. Supports typing, editing, selections (including multicursor) and autocompletions. Basically, it looks like you have programming superpowers.

😳 **See it live in action: [Writing Code Like a Real Hacker - Reactivate X, London](https://www.youtube.com/watch?v=ulnC-SDBDKE)**

⬇️ **Download the extension from [Visual Studio Code Marketplace](https://marketplace.visualstudio.com/items?itemName=jevakallio.vscode-hacker-typer)**

**🗯 "This is Unix, I know this! Asdfkdhsur dueuekdnfh sueekgkvins dicodksbry"** — [@mwarger](https://twitter.com/mwarger)

## Features

- Record and replay **macros**.
- Insert stop points, so you don't accidentally overrun your talking point while live coding.

## How to use Hacker Typer

### Record a macro

1. Open a file or a new VSCode window.
2. Execute `HackerTyper: Record Macro` command from the command palette.
3. The current content and selections of the active editor will be snapshotted.
4. Start typing code. Every keystore is recorded into an in-memory buffer, including deletions, selection changes, etc.
5. When you're ready, execute `HackerTyper: Save Macro` command from the command palette.
6. Give your macro a name.
7. You're done!

### Replay a macro

1. Open a file or a new VSCode window.
2. Execute `HackerTyper: Play Macro` command from the command palette.
3. Pick your previously saved macro.
4. The active workspace will be reset to the initial starting point from the beginning of the recording. If there is no active text editor, a new anonymous unsaved file will be opened.
5. Start hammering your keyboard like a mad-person.
6. WHOA HOW ARE YOU TYPING SO FAST
7. `Cmd+Shift+Backspace` will move the buffer backwards. Any other key moves it forward.
8. Feel free to move around the file, highlight code etc. When you continue typing, the next character will be inserted where you did while recording.

### Stop points

While in recording mode, execute `HackerTyper: Insert Soft Stop Point` command from the command palette.

When you hit a stop point while in replay mode, you need to press `ENTER` to break out of the stop point. All other keystrokes are ignored until you break out.

## Current limitations

- Only supports single file macros [#11](https://github.com/jevakallio/vscode-hacker-typer/issues/11)
- If you make a mistake while recording, you have to start over. User experience could be wildly improved here
- When starting from existing active editor, the document language is not restored from the macro (see [vscode#1800](https://github.com/Microsoft/vscode/issues/1800))

## License

MIT
