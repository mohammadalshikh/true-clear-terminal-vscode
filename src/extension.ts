import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	const config = vscode.workspace.getConfiguration();
	const skipShell = config.get<boolean>('trueClearTerminal.skipShell', true);
	const currentSkipCommands = config.get<string[]>(
		'terminal.integrated.commandsToSkipShell', []
	);

	if (skipShell && !currentSkipCommands.includes(
		'workbench.action.terminal.clear')
	) {
		const updatedSkipCommands = [
			...currentSkipCommands,
			'workbench.action.terminal.clear'
		];

		config.update('terminal.integrated.commandsToSkipShell', updatedSkipCommands, vscode.ConfigurationTarget.Global);
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

	const toggleDisposable = vscode.commands.registerCommand(
		'trueClearTerminal.toggle', async () => {

			const config = vscode.workspace.getConfiguration();
			const skipShell = config.get<boolean>('trueClearTerminal.skipShell', true);

			const options = [
				{
					label: `${skipShell ? '$(check)' : '$(circle-outline)'} Enable Override`,
					description: 'Ctrl+K will use True Clear Terminal',
					value: 'enable'
				},
				{
					label: `${!skipShell ? '$(check)' : '$(circle-outline)'} Disable Override`,
					description: 'Ctrl+K will use default VS Code behavior',
					value: 'disable'
				}
			];

			const selected = await vscode.window.showQuickPick(options, {
				placeHolder: 'Choose True Clear Terminal behavior'
			});

			if (!selected) {
				return;
			}

			if (selected.value === 'enable' && !skipShell) {
				config.update(
					'trueClearTerminal.skipShell',
					true,
					vscode.ConfigurationTarget.Global
				);
				vscode.window.showInformationMessage('Skip shell enabled');

			} else if (selected.value === 'disable' && skipShell) {
				config.update(
					'trueClearTerminal.skipShell',
					false,
					vscode.ConfigurationTarget.Global
				);
				vscode.window.showInformationMessage('Skip shell disabled');

			} else if (selected.value === 'enable' && skipShell) {
				vscode.window.showInformationMessage('Skip shell is already enabled');

			} else if (selected.value === 'disable' && !skipShell) {
				vscode.window.showInformationMessage('Skip shell is already disabled');
			}
		}
	);

	const configChangeListener = vscode.workspace.onDidChangeConfiguration(e => {
		if (e.affectsConfiguration('trueClearTerminal.skipShell') ||
			e.affectsConfiguration('terminal.integrated.commandsToSkipShell')) {
			const config = vscode.workspace.getConfiguration();

			const skipShell = config.get<boolean>('trueClearTerminal.skipShell', true);
			const currentSkipCommands = config.get<string[]>(
				'terminal.integrated.commandsToSkipShell', []
			);
			const hasSkipCommand = currentSkipCommands.includes(
				'workbench.action.terminal.clear'
			);

			if (skipShell && !hasSkipCommand) {
				const updatedSkipCommands = [
					...currentSkipCommands,
					'workbench.action.terminal.clear'
				];
				config.update(
					'terminal.integrated.commandsToSkipShell',
					updatedSkipCommands,
					vscode.ConfigurationTarget.Global
				);

			} else if (!skipShell && hasSkipCommand) {
				const updatedSkipCommands = currentSkipCommands.filter(
					(cmd: string) => cmd !== 'workbench.action.terminal.clear'
				);
				config.update(
					'terminal.integrated.commandsToSkipShell',
					updatedSkipCommands,
					vscode.ConfigurationTarget.Global
				);


			} else if (e.affectsConfiguration(
				'terminal.integrated.commandsToSkipShell')
			) {
				if (skipShell && !hasSkipCommand) {
					config.update(
						'trueClearTerminal.skipShell',
						false,
						vscode.ConfigurationTarget.Global
					);
				}
				else if (!skipShell && hasSkipCommand) {
					config.update(
						'trueClearTerminal.skipShell',
						true,
						vscode.ConfigurationTarget.Global
					);
				}
			}
		}
	});

	context.subscriptions.push(
		clearDisposable,
		toggleDisposable,
		configChangeListener
	);
}

export function deactivate() {
	const config = vscode.workspace.getConfiguration();
	const currentSkipCommands = config.get<string[]>(
		'terminal.integrated.commandsToSkipShell', []
	);

	if (currentSkipCommands.includes('workbench.action.terminal.clear')) {
		const updatedSkipCommands = currentSkipCommands.filter(
			(cmd: string) => cmd !== 'workbench.action.terminal.clear'
		);

		config.update(
			'terminal.integrated.commandsToSkipShell',
			updatedSkipCommands,
			vscode.ConfigurationTarget.Global
		);
	}
}