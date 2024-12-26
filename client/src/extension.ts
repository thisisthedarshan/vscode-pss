import * as path from 'path';
import * as vscode from 'vscode';

import {
	LanguageClient,
	LanguageClientOptions,
	ServerOptions,
	TransportKind
} from 'vscode-languageclient/node';

import {
	countLeadingSpaces,
	extractFunctionName,
	getActiveParameter,
	getCommentForKeyword,
	getFunctionSignature,
	initializeCache,
	isWithinCommentBlock,
	updateCacheOnSaveOrOpen
} from './helper_functions';

import { keywords } from './definitions/keywords';
import { formatDocument } from './providers/formattingProvider';

let client: LanguageClient;
let cache = {};

export function activate(context: vscode.ExtensionContext) {
	console.log("Started PSS Language Support Extension :D");

	/* Create a cache for variables from all open files */
	cache = initializeCache();

	/* Register formatter for whole document */
	vscode.languages.registerDocumentFormattingEditProvider(
		{ scheme: 'file', language: 'pss' },
		{
			provideDocumentFormattingEdits(document) {
				const edits: vscode.TextEdit[] = [];

				// Fetch the document text
				const documentText = document.getText();

				// Format the document using custom rules
				const formattedText = formatDocument(documentText);

				console.log("Formatted Document: ", document.fileName);

				// Define a range that covers the entire document
				const fullRange = new vscode.Range(
					document.positionAt(0),
					document.positionAt(documentText.length)
				);

				// Replace the existing text with the formatted text
				edits.push(vscode.TextEdit.replace(fullRange, formattedText));
				return edits;
			}
		}
	);

	/*
	vscode.languages.registerOnTypeFormattingEditProvider('pss',
		{
			provideOnTypeFormattingEdits(document, position, ch, options, token) {
				const line = document.lineAt(position.line).text.trim();

				// Check if inside comment block
				if (isWithinCommentBlock(document, position.line)) {
					const prevLine = document.lineAt(position.line - 1);
					const indent = countLeadingSpaces(prevLine.text); // Count leading spaces
					// Insert the new comment line with the correct indentation
					return [vscode.TextEdit.insert(position, `\n${' '.repeat(indent)}* `)];
				}
				// Check if the line is exactly `/*`
				else if (line === '/*' || line === '/**') {
					const indent = countLeadingSpaces(line); // Get the indentation of the current line
					return [vscode.TextEdit.insert(position, `\n${indent} * `)];
				} else if (line === '* /' || line === '** /') { // update these
					return [vscode.TextEdit.insert(position, '')];
				}

				return [vscode.TextEdit.insert(position, '\n DDD ')];
			}
		},
		'\n'  // Trigger on Enter (newline character)
	);
*/

	/* Register update cache functions */
	context.subscriptions.push(
		vscode.workspace.onDidSaveTextDocument((document) => { cache = updateCacheOnSaveOrOpen(document); console.log("Cache ", cache); }),
		vscode.workspace.onDidOpenTextDocument((document) => { cache = updateCacheOnSaveOrOpen(document); console.log("Cache ", cache); }),
		vscode.window.onDidChangeActiveTextEditor((editor) => {
			if (editor && editor.document.languageId === 'pss') {
				cache = updateCacheOnSaveOrOpen(editor.document);
			}
		})
	);

	/* Built-in function signature helper */
	context.subscriptions.push(
		vscode.languages.registerSignatureHelpProvider('pss',
			{
				provideSignatureHelp(document, position, token, context) {
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

					// Calculate active parameter based on cursor position
					const activeParameter = getActiveParameter(lineText, position.character);
					console.log("Cursor position:", position.character);
					console.log("Active parameter:", activeParameter);

					signatureHelp.activeSignature = 0;
					signatureHelp.activeParameter = activeParameter;

					// Add the signature to signatureHelp
					signatureHelp.signatures.push(signature);

					return signatureHelp;
				}
			},
			'(', ','  // Trigger on `(` and `,` for function call and parameter separators
		)
	);

	/* Add an auto-complete for comments */
	/*context.subscriptions.push(
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
				const prevLine = editor.document.lineAt(position.line);
				const indent = countLeadingSpaces(prevLine.text); // Count leading spaces	
				editor.edit(editBuilder => {
					editBuilder.insert(
						new vscode.Position(position.line + 1, 0),  // Insert at the beginning of the current line
						`${' '.repeat(indent)}* `
					);
				});
			}
		})
	);*/

	/* Add autocompletion for keywords */
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

	/* Add auto-complete for variables from cache */
	context.subscriptions.push(
		vscode.languages.registerCompletionItemProvider('pss', {
			provideCompletionItems(document, position) {
				const completionItems = [];
				// Get variable names for the given document (from the cache)
				const variables = Object.keys(cache).reduce((acc, keyword) => {
					cache[keyword].forEach(({ variableName }) => {
						const completionItem = new vscode.CompletionItem(variableName, vscode.CompletionItemKind.Variable);
						completionItem.detail = cache[keyword][variableName];
						acc.push(completionItem);
					});
					return acc;
				}, []);

				return variables;
			}
		})
	);

	/* Hover to display comments as message */
	context.subscriptions.push(
		vscode.languages.registerHoverProvider('pss', {
			async provideHover(document, position, token) {
				const wordRange = document.getWordRangeAtPosition(position);
				const word = document.getText(wordRange);
				const comment = await getCommentForKeyword(word, cache);
				if (comment) {
					return new vscode.Hover(new vscode.MarkdownString(comment));
				}
			}
		}));

	/*********		Server Part		********/
	// The server is implemented in node
	const serverModule = context.asAbsolutePath(
		path.join('dist', 'server', 'server.js')
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