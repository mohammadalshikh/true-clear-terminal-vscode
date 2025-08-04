import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	const disposable = vscode.commands.registerCommand('trueClearTerminal.clear', () => {
		const terminal = vscode.window.activeTerminal;

		if (!terminal) {
			vscode.window.showErrorMessage('No active terminal found.');
			return;
		}

		if (process.platform === 'win32') {
			terminal.sendText('\x03', false);
			terminal.sendText('cls', true);
		} else {
			terminal.sendText('\x03', false);
			terminal.sendText('printf "\\033c"', true);
		}
		terminal.show();
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {}
