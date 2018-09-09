# VSCode Hacker Typer

Great for live coding presentations, impressing your friends, or just trying to look busy at work.

Hacker Typer allows you to record yourself programming, and to replay the same keystrokes by wildly mashing any key. Supports typing, editing, selections (including multicursor) and autocompletions. Basically, it looks like you have programming superpowers.

## Features

- Record and replay **macros**.
- Insert stop points, so you don't accidentally overrun your talking point while live coding.

## How to use it

### Record a macro

1. Open a file or a new VSCode window.
2. Execute `HackerTyper: Record Macro` command from the command palette.
3. Start typing code. Every keystore is recorded into an in-memory buffer, including deletions, selection changes, etc.
4. When you're ready, execute `HackerTyper: Save Macro` command from the command palette.
5. Give your macro a name.
6. You're done!

### Replay a macro

1. Open a file or a new VSCode window.
2. Execute `HackerTyper: Play Macro` command from the command palette.
3. Pick your previously saved macro.
4. Start hammering your keyboard like a mad-person.
5. WHOA HOW ARE YOU TYPING SO FAST
6. Backspace will move the buffer backwards. Any other key moves it forward.
7. Feel free to move around the file, highlight code etc. When you continue typing, the next character will be inserted where you did while recording.

### Stop points

While in recording mode, execute `HackerTyper: Insert Soft Stop Point` command from the command palette. Optionally, you can use the `HackerTyper: Insert Named Stop Point` command to display a small hint in the VSCode status bar when you hit this stop point while replaying.

When you hit a stop point while in replay mode, you need to press `ENTER` to break out of the stop point. All other keystrokes are ignored until you break out.

## Current limitations

- Only supports single file macros [#11](https://github.com/jevakallio/vscode-hacker-typer/issues/11)
