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

import { DoxygenGenerationRequest, RequestDoxygenGeneration } from './types';
import { statSync } from 'fs-extra';
import { formatFileHeader, formatDate } from './providers/headerFormatter';

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
				const stats = statSync(document.fileName);
				creationDate = formatDate(stats.birthtime || stats.mtime); // Fallback to mtime if birthtime is unavailable
			} catch (error) {
				creationDate = formatDate(new Date()); // Fallback to current date
			}

			const lastModifiedDate = formatDate(new Date());

			/* Fetch Author info */
			const config = vscode.workspace.getConfiguration('PSS');
			const authorName = config.get<string>('author');

			// Format the content with the updated header
			const updatedContent = formatFileHeader(content, fileName, creationDate, lastModifiedDate, authorName);

			// Replace the content of the file
			const fullRange = new vscode.Range(document.positionAt(0), document.positionAt(content.length));
			editor.edit((editBuilder) => {
				editBuilder.replace(fullRange, updatedContent);
			});
		})
	);

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
				/* Get indentation from the current line */
				const indentation = line.text.match(/^\s*/)[0];

				await editor.edit(editBuilder => {
					const insertPos = new vscode.Position(position.line, 0);
					editBuilder.insert(insertPos, indentation + response.content + '\n');
				});
				/* vscode.window.showInformationMessage(`Added doxygen comment for ${response.keyword}`); */
			}
		})
	);

	/*********		Server Part		********/
	// The server is implemented in node
	const serverModule = context.asAbsolutePath(
		path.join('dist', 'pss-langserver.js')
	);

	/* Debug options */
	const debugOptions = { execArgv: ['--inspect=6969', '--max-old-space-size=4096'] };

	// If the extension is launched in debug mode then the debug server options are used
	// Otherwise the run options are used
	const serverOptions: ServerOptions = {
		run: {
			module: serverModule,
			transport: TransportKind.stdio,
			options: {
				execArgv: ['--max-old-space-size=4096']
			}
		},
		debug: {
			module: serverModule,
			transport: TransportKind.stdio,
			options: debugOptions
		}
	};

	// Options to control the language client
	const clientOptions: LanguageClientOptions = {
		documentSelector: [{ scheme: 'file', language: 'pss' }],
		workspaceFolder: vscode.workspace.workspaceFolders?.[0],
		synchronize: {
			fileEvents: vscode.workspace.createFileSystemWatcher('**/.psswatcher')
		},
		middleware: {
			provideDefinition: (document, position, token, next) => {
				return next(document, position, token);
			},
			provideDocumentFormattingEdits: (document, options, token, next) => {
				return next(document, options, token);
			},
			provideDocumentSemanticTokens: (document, token, next) => {
				return next(document, token);
			},
			provideReferences: (document, position, context, token, next) => {
				return next(document, position, context, token);
			},
			provideDeclaration: (document, position, token, next) => {
				return next(document, position, token);
			}
		},
		initializationOptions: {
			capabilities: {
				textDocument: {
					definition: {
						dynamicRegistration: true
					},
					references: {
						dynamicRegistration: true
					},
					declaration: {
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