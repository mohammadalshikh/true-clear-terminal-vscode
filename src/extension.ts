import * as vscode from 'vscode';

function checkConfig() {
	// Skip shell config
	const config = vscode.workspace.getConfiguration();
	const configInspection = config
		.inspect('terminal.integrated.commandsToSkipShell');

	// Global and workspace versions
	const globalCommands = configInspection?.globalValue as string[] || [];
	const workspaceCommands = configInspection?.workspaceValue as string[] || [];


	if (!globalCommands
		.includes('trueClearTerminal.clear')
	) {
		const updatedGlobalCommands = [
			...globalCommands,
			'trueClearTerminal.clear'
		];

		config
			.update(
				'terminal.integrated.commandsToSkipShell',
				updatedGlobalCommands,
				vscode.ConfigurationTarget.Global
			);
	}

	// Add to workspace settings IF skip shell was added there
	if (configInspection?.workspaceValue !== undefined

		&& Array.isArray(workspaceCommands)
	) {
		if (!workspaceCommands.includes('trueClearTerminal.clear')) {

			const updatedWorkspaceCommands = [
				...workspaceCommands,
				'trueClearTerminal.clear'
			];

			config
				.update(
					'terminal.integrated.commandsToSkipShell',
					updatedWorkspaceCommands,
					vscode.ConfigurationTarget.Workspace
				);
		}
	}
}

export function activate(context: vscode.ExtensionContext) {

	checkConfig();

	const checkConfigListener = vscode.workspace.onDidChangeConfiguration(
		(e: vscode.ConfigurationChangeEvent) => {
			if (e.affectsConfiguration('terminal.integrated.commandsToSkipShell')) {
				checkConfig();
			}
		}
	);

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


	context.subscriptions.push(
		checkConfigListener,
		clearDisposable
	);
}

export function deactivate() { }