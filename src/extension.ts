// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	console.log("Started PSS Language Support Extension :D");
	context.subscriptions.push(
		vscode.languages.registerCompletionItemProvider('pss', {
			provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
				const lineText = document.lineAt(position).text;
				const completionItems: vscode.CompletionItem[] = [];
				// Array of custom keywords for autocompletion
				const keywords = [
					"abstract", "action", "activity", "array", "as", "assert", "atomic", "bind", "bins", "bit",
					"body", "bool", "break", "buffer", "chandle", "class", "compile", "component", "concat", "const",
					"constraint", "continue", "cover", "covergroup", "coverpoint", "cross", "declaration", "default",
					"disable", "dist", "do", "dynamic", "else", "enum", "eventually", "exec", "export", "extend", "false",
					"file", "float32", "float64", "forall", "foreach", "function", "has", "header", "if", "iff", "ignore_bins",
					"illegal_bins", "import", "in", "init", "init_down", "init_up", "inout", "input", "instance", "int",
					"join_branch", "join_first", "join_none", "join_select", "list", "lock", "map", "match", "monitor",
					"null", "output", "override", "package", "parallel", "pool", "post_solve", "pre_body", "pre_solve",
					"private", "protected", "public", "pure", "rand", "randomize", "ref", "repeat", "replicate", "resource",
					"return", "run_end", "run_start", "schedule", "select", "sequence", "set", "share", "solve", "state",
					"static", "stream", "string", "struct", "super", "symbol", "target", "this", "true", "type", "typedef",
					"unique", "void", "while", "with", "yield"
				];

				// Loop through the keywords and create CompletionItems for each one
				for (const keyword of keywords) {
					const completionItem = new vscode.CompletionItem(keyword, vscode.CompletionItemKind.Keyword);
					completionItems.push(completionItem);
				}

				return completionItems;
			}
		})
	);
}

// This method is called when your extension is deactivated
export function deactivate() { }
