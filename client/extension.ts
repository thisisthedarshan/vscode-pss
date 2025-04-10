// Copyright (c) 2024-25 Darshan(@thisisthedarshan)
// Licensed under the MIT License. See LICENSE file for details.
import * as path from 'path';
import * as vscode from 'vscode';

import {
	LanguageClient,
	LanguageClientOptions,
	ServerOptions,
	TransportKind
} from 'vscode-languageclient/node';

import { getCreationDate, formatFileHeader } from './providers/formattingProvider';
import { DoxygenGenerationRequest, RequestDoxygenGeneration } from './types';

let client: LanguageClient;

export function activate(context: vscode.ExtensionContext) {
	console.log("Started PSS Language Support Extension :D");


	/* Command to add header to current file */
	context.subscriptions.push(
		vscode.commands.registerCommand('pss.addFileHeader', async () => {
			const editor = vscode.window.activeTextEditor;

			if (!editor) {
				vscode.window.showErrorMessage('No active editor found.');
				return;
			}

			const document = editor.document;
			const fileName = document.fileName.split('/').pop() || 'unknown';
			const content = document.getText();

			// Fetch file metadata
			let creationDate: string;
			try {
				const creationDateObj = await getCreationDate(document.fileName);
				creationDate = creationDateObj.toISOString().split('T')[0]; // Format as YYYY-MM-DD
			} catch (error) {
				creationDate = new Date().toISOString().split('T')[0]; // Fallback to current date
			}

			const lastModifiedDate = new Date().toISOString().split('T')[0];

			// Format the content with the updated header
			const updatedContent = formatFileHeader(content, fileName, creationDate, lastModifiedDate);

			// Replace the content of the file
			const fullRange = new vscode.Range(document.positionAt(0), document.positionAt(content.length));
			editor.edit((editBuilder) => {
				editBuilder.replace(fullRange, updatedContent);
			});
		})
	);

	/* Command to get doxygen comments from server on user's request */
	context.subscriptions.push(
		vscode.commands.registerCommand('pss.generateDoxygenComment', async () => {
			const editor = vscode.window.activeTextEditor;
			if (!editor) { return; }

			/* Get info on current position, line and fileURI */
			const position = editor.selection.active;
			const line = editor.document.lineAt(position.line);
			const fileURI = editor.document.uri.toString();

			/* Create params */
			const request: DoxygenGenerationRequest = {
				line: line.text,
				lineNumber: position.line + 1,
				fileURI: fileURI
			};

			/* Send a request to server */
			const response = await client.sendRequest(RequestDoxygenGeneration, request);

			/* Once we have our response, add it to the window, only when it has a valid keyword */
			if (response.keyword.length > 0 && response.keyword !== 'unknown') {
				await editor.edit(editBuilder => {
					const insertPos = new vscode.Position(position.line + 1, 0);
					editBuilder.insert(insertPos, response.content + '\n');
				});
				vscode.window.showInformationMessage(`Added doxygen comment for ${response.keyword}`);
			}
		})
	);

	/*********		Server Part		********/
	// The server is implemented in node
	const serverModule = context.asAbsolutePath(
		path.join('dist', 'pss-langserver.js')
	);

	// If the extension is launched in debug mode then the debug server options are used
	// Otherwise the run options are used
	const serverOptions: ServerOptions = {
		run: { module: serverModule, transport: TransportKind.stdio },
		debug: {
			module: serverModule,
			transport: TransportKind.stdio,
		}
	};

	// Options to control the language client
	const clientOptions: LanguageClientOptions = {
		/* Set workspace capabilities */
		/* Register the server for pss code files */
		documentSelector: [{ scheme: 'file', language: 'pss' }],
		workspaceFolder: vscode.workspace.workspaceFolders?.[0],
		synchronize: {
			/* Notify the server about file changes to '.psswatcher files contained in the workspace */
			fileEvents: vscode.workspace.createFileSystemWatcher('**/.psswatcher')
		},
		middleware: {
			provideDefinition: (document, position, token, next) => {
				// Explicitly handle goto definition request
				return next(document, position, token);
			},
			provideDocumentFormattingEdits: (document, options, token, next) => {
				return next(document, options, token);
			},
			// Add semantic tokens handler
			provideDocumentSemanticTokens: (document, token, next) => {
				return next(document, token);
			}
		},
		initializationOptions: {
			capabilities: {
				textDocument: {
					definition: {
						dynamicRegistration: true
					},
					semanticTokens: {
						dynamicRegistration: true,
						tokenTypes: [
							"namespace", "type", "class", "enum", "interface", "struct",
							"typeParameter", "parameter", "variable", "property",
							"enumMember", "event", "function", "method", "macro",
							"keyword", "modifier", "comment", "string", "number",
							"regexp", "operator", "decorator"
						],
						tokenModifiers: [
							"declaration", "definition", "readonly", "static", "deprecated",
							"abstract", "async", "modification", "documentation", "defaultLibrary"
						],
						formats: ['relative']
					}
				}
			}
		}
	};

	/* Create the language client and start the client. */
	client = new LanguageClient(
		'PSS',
		'Portable Stimulus Language Server',
		serverOptions,
		clientOptions
	);

	// Start the client. This will also launch the server
	client.start().catch(error => {
		console.error('Failed to start language client:', error);
	});
}

export function deactivate(): Thenable<void> | undefined {
	if (!client) {
		return undefined;
	}
	return client.stop();
}
