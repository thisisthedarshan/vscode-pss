import * as path from 'path';
import * as vscode from 'vscode';

import {
	LanguageClient,
	LanguageClientOptions,
	ServerOptions,
	TransportKind
} from 'vscode-languageclient/node';

import {
	extractFunctionName,
	getFunctionSignature,
	isWithinCommentBlock
} from './helper_functions';

import { keywords } from './keywords';

let client: LanguageClient;

export function activate(context: vscode.ExtensionContext) {
	console.log("Started PSS Language Support Extension :D");

	/* Register formatter for multi-line comments */

	vscode.languages.registerDocumentFormattingEditProvider(
		{ scheme: 'file', language: 'pss' },
		{
			provideDocumentFormattingEdits(document) {
				const edits = [];
				const maxLineLength = 81;

				for (let i = 0; i < document.lineCount; i++) {
					let line = document.lineAt(i).text;

					// Format comments to be single-line
					if (line.trim().startsWith("//") || line.trim().startsWith("/*")) {
						line = line.replace(/\s+/g, ' ');  // Condense whitespace in comments
						if (line.length > maxLineLength) {
							line = line.slice(0, maxLineLength - 3) + "...";  // Trim and add ellipsis if too long
						}
					} else {
						// Wrap non-comment lines to the max length
						if (line.length > maxLineLength) {
							const words = line.split(' ');
							line = '';
							let currentLine = '';

							words.forEach(word => {
								if ((currentLine + word).length <= maxLineLength) {
									currentLine += (currentLine ? ' ' : '') + word;
								} else {
									line += currentLine + '\n';
									currentLine = word;
								}
							});
							line += currentLine;
						}
					}

					// Apply edits for each line
					edits.push(
						vscode.TextEdit.replace(
							document.lineAt(i).range,
							line
						)
					);
				}

				return edits;
			}
		}
	);

	let comm = vscode.languages.registerOnTypeFormattingEditProvider('pss',
		{
			provideOnTypeFormattingEdits(document, position, ch, options, token) {
				const line = document.lineAt(position.line).text.trim();

				// Check if inside comment block
				if (isWithinCommentBlock(document, position.line)) {
					return [vscode.TextEdit.insert(position, '\n * ')];
				}
				// Check if the line is exactly `/*`
				else if (line === '/*' || line === '/**') {
					return [vscode.TextEdit.insert(position, '\n * ')];
				} else if (line === '*/' || line === '**/') {
					return [vscode.TextEdit.insert(position, '')];
				}

				return [vscode.TextEdit.insert(position, '\n DDD ')];
			}
		},
		'\n'  // Trigger on Enter (newline character)
	);

	context.subscriptions.push(
		vscode.languages.registerSignatureHelpProvider('pss',
			{
				provideSignatureHelp(document, position, token, context) {
					// Extract the function name and match it with the parameters list
					const lineText = document.lineAt(position.line).text;
					const functionName = extractFunctionName(lineText);

					// Check if the function name is in the built-in libraries
					const signatureInfo = getFunctionSignature(functionName);
					if (!signatureInfo) {
						return null; // No signature found
					}

					// Construct Signature Information
					const signatureHelp = new vscode.SignatureHelp();
					const signature = new vscode.SignatureInformation(signatureInfo.signature, signatureInfo.documentation);

					// Add each parameter as a Parameter Information
					signatureInfo.parameters.forEach(param => {
						signature.parameters.push(new vscode.ParameterInformation(param.label, param.documentation));
					});

					// Add the signature to signatureHelp
					signatureHelp.signatures.push(signature);
					signatureHelp.activeSignature = 0;
					signatureHelp.activeParameter = 0;

					return signatureHelp;
				}
			},
			'(', ','  // Trigger on `(` and `,` for function call and parameter separators
		)
	);

	/* Add an auto-complete for comments */
	context.subscriptions.push(
		vscode.workspace.onDidChangeTextDocument(event => {
			const editor = vscode.window.activeTextEditor;
			if (!editor || event.document !== editor.document) { return; }

			// Check for changes that include a newline
			const change = event.contentChanges[0];
			if (!change || !change.text.includes('\n')) { return; }

			const position = change.range.start;
			const lineText = editor.document.lineAt(position.line - 1).text.trim();

			// Check if inside a /** comment block
			if (lineText.startsWith('/**') || isWithinCommentBlock(editor.document, position.line)) {
				// Insert '*' at the current line (position.line) where the cursor is
				editor.edit(editBuilder => {
					editBuilder.insert(
						new vscode.Position(position.line + 1, 0),  // Insert at the beginning of the current line
						' *'
					);
				});
			}
		})
	);

	context.subscriptions.push(
		vscode.languages.registerCompletionItemProvider('pss', {
			provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
				const lineText = document.lineAt(position).text;
				const completionItems: vscode.CompletionItem[] = [];
				// Loop through the keywords and create CompletionItems for each one
				for (let i = 0; i < keywords.list.length; i++) {
					const completionItem = new vscode.CompletionItem(keywords.list[i], vscode.CompletionItemKind.Keyword);
					completionItem.detail = keywords.descriptions[i];
					completionItems.push(completionItem);
				}

				return completionItems;
			}
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('extension.insertDocComment', function () {
			const editor = vscode.window.activeTextEditor;
			if (editor) {
				const position = editor.selection.active;
				editor.edit(editBuilder => {
					editBuilder.insert(position, "/** */");
				}).then(() => {
					// Move cursor between `/**` and `*/`
					const newPosition = position.with(position.line, position.character + 4);
					editor.selection = new vscode.Selection(newPosition, newPosition);
				});
			}
		}));

	// The server is implemented in node
	const serverModule = context.asAbsolutePath(
		path.join('dist', 'server.js')
	);

	// If the extension is launched in debug mode then the debug server options are used
	// Otherwise the run options are used
	const serverOptions: ServerOptions = {
		run: { module: serverModule, transport: TransportKind.ipc },
		debug: {
			module: serverModule,
			transport: TransportKind.ipc,
		}
	};

	// Options to control the language client
	const clientOptions: LanguageClientOptions = {
		// Register the server for plain text documents
		documentSelector: [{ scheme: 'file', language: 'pss' }],
		synchronize: {
			// Notify the server about file changes to '.clientrc files contained in the workspace
			fileEvents: vscode.workspace.createFileSystemWatcher('**/.clientrc')
		}
	};

	// Create the language client and start the client.
	client = new LanguageClient(
		'lspPSS',
		'Portable Stimulus Language Server',
		serverOptions,
		clientOptions
	);

	// Start the client. This will also launch the server
	//client.start();
}

export function deactivate(): Thenable<void> | undefined {
	if (!client) {
		return undefined;
	}
	return client.stop();
}

module.exports = {
	activate,
	deactivate
};