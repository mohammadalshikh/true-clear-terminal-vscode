import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	const config = vscode.workspace.getConfiguration();

	// Get only global settings
	const globalCommands = config.inspect(
		'terminal.integrated.commandsToSkipShell'
	)?.globalValue as string[] || [];

	// Add command if not in global settings
	if (!globalCommands.includes('trueClearTerminal.clear')) {
		const updatedCommands = [
			...globalCommands,
			'trueClearTerminal.clear'
		];

		config.update(
			'terminal.integrated.commandsToSkipShell',
			updatedCommands,
			vscode.ConfigurationTarget.Global
		);
	}

	const clearDisposable = vscode.commands.registerCommand(
		'trueClearTerminal.clear', () => {

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
		}
	);

	const configChangeListener = vscode.workspace.onDidChangeConfiguration((e: vscode.ConfigurationChangeEvent) => {
		if (e.affectsConfiguration(
			'terminal.integrated.commandsToSkipShell')
		) {
			const config = vscode.workspace.getConfiguration();

			// Get only global settings
			const globalCommands = config.inspect('terminal.integrated.commandsToSkipShell')?.globalValue as string[] || [];

			// Add command if not in global settings
			if (!globalCommands.includes('trueClearTerminal.clear')) {
				const updatedCommands = [
					...globalCommands,
					'trueClearTerminal.clear'
				];

				config.update(
					'terminal.integrated.commandsToSkipShell',
					updatedCommands,
					vscode.ConfigurationTarget.Global
				);
			}
		}
	});

	context.subscriptions.push(
		clearDisposable,
		configChangeListener
	);
}

export function deactivate() {
	const config = vscode.workspace.getConfiguration();

	// Get only global settings
	const globalCommands = config.inspect(
		'terminal.integrated.commandsToSkipShell'
	)?.globalValue as string[] || [];

	if (globalCommands.includes('trueClearTerminal.clear')) {

		const updatedCommands = globalCommands.filter(
			(cmd: string) => cmd !== 'trueClearTerminal.clear'
		);

		config.update(
			'terminal.integrated.commandsToSkipShell',
			updatedCommands,
			vscode.ConfigurationTarget.Global
		);
	}
}