import * as assert from 'assert';
import * as vscode from 'vscode';
import * as sinon from 'sinon';

// Import your extension to test it
import * as myExtension from '../../extension';

suite('True Clear Terminal Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	let sandbox: sinon.SinonSandbox;

	setup(() => {
		sandbox = sinon.createSandbox();
	});

	teardown(() => {
		sandbox.restore();
	});

	test('Extension should be present', () => {
		const extension = vscode.extensions.all.find(ext => ext.id.includes('true-clear-terminal'));
		assert.ok(extension, 'Extension is not present');
	});

	test('Should register trueClearTerminal.clear command', async () => {
		const commands = await vscode.commands.getCommands(true);
		assert.ok(commands.includes('trueClearTerminal.clear'));
	});

	test('Should show error when no active terminal', async () => {
		const activeTerminalStub = sandbox.stub(vscode.window, 'activeTerminal').value(undefined);
		const showErrorMessageSpy = sandbox.spy(vscode.window, 'showErrorMessage');

		await vscode.commands.executeCommand('trueClearTerminal.clear');

		assert.ok(showErrorMessageSpy.calledWith('No active terminal found.'));
	});

	test('Should send correct commands for Windows platform', async () => {

        const mockTerminal = {
			sendText: sandbox.stub(),
			show: sandbox.stub()
		};

		sandbox.stub(vscode.window, 'activeTerminal').value(mockTerminal as any);
		
		const platformStub = sandbox.stub(process, 'platform').value('win32');

		await vscode.commands.executeCommand('trueClearTerminal.clear');

		// Verify correct commands were sent
		assert.ok(mockTerminal.sendText.calledWith('\x03', false));
		assert.ok(mockTerminal.sendText.calledWith('cls', true));
		assert.ok(mockTerminal.show.called);
	});

	test('Should send correct commands for Unix platforms', async () => {

        const mockTerminal = {
			sendText: sandbox.stub(),
			show: sandbox.stub()
		};

		sandbox.stub(vscode.window, 'activeTerminal').value(mockTerminal as any);
		
		const platformStub = sandbox.stub(process, 'platform').value('linux');

		await vscode.commands.executeCommand('trueClearTerminal.clear');

		assert.ok(mockTerminal.sendText.calledWith('\x03', false));
		assert.ok(mockTerminal.sendText.calledWith('printf "\\033c"', true));
		assert.ok(mockTerminal.show.called);
	});

	test('Should handle macOS platform correctly', async () => {

        const mockTerminal = {
			sendText: sandbox.stub(),
			show: sandbox.stub()
		};

		sandbox.stub(vscode.window, 'activeTerminal').value(mockTerminal as any);
		
		const platformStub = sandbox.stub(process, 'platform').value('darwin');

		await vscode.commands.executeCommand('trueClearTerminal.clear');

		assert.ok(mockTerminal.sendText.calledWith('\x03', false));
		assert.ok(mockTerminal.sendText.calledWith('printf "\\033c"', true));
		assert.ok(mockTerminal.show.called);
	});
});
