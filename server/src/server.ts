import {
  createConnection,
  TextDocuments,
  Diagnostic,
  DiagnosticSeverity,
  ProposedFeatures,
  InitializeParams,
  DidChangeConfigurationNotification,
  CompletionItem,
  CompletionItemKind,
  TextDocumentPositionParams,
  TextDocumentSyncKind,
  InitializeResult,
  DocumentDiagnosticReportKind,
  type DocumentDiagnosticReport
} from 'vscode-languageserver/node';

import {
  TextDocument
} from 'vscode-languageserver-textdocument';

const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const connection = createConnection(ProposedFeatures.all);
const documents = new TextDocuments(TextDocument);

const scannedPackages = new Set(); // Store unique package names
const outputChannel = vscode.window.createOutputChannel('PSS Language Server Logs');

let hasConfigurationCapability = false;
let hasWorkspaceFolderCapability = false;
let hasDiagnosticRelatedInformationCapability = false;

let workspaceRoot: string; // WIll hold path of the workspace

connection.onInitialize((params: InitializeParams) => {
  console.log("Initializing server...");
  const capabilities = params.capabilities;
  hasConfigurationCapability = !!(
    capabilities.workspace && !!capabilities.workspace.configuration
  );
  hasWorkspaceFolderCapability = !!(
    capabilities.workspace && !!capabilities.workspace.workspaceFolders
  );
  hasDiagnosticRelatedInformationCapability = !!(
    capabilities.textDocument &&
    capabilities.textDocument.publishDiagnostics &&
    capabilities.textDocument.publishDiagnostics.relatedInformation
  );

  workspaceRoot = params.workspaceFolders ? path.normalize(params.workspaceFolders.toString()) : "";
  outputChannel.appendLine(workspaceRoot);
  console.log("Workspace:", workspaceRoot);
  outputChannel.show();

  const result: InitializeResult = {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Incremental,
      // Tell the client that this server supports code completion.
      completionProvider: {
        resolveProvider: true
      },
      diagnosticProvider: {
        interFileDependencies: false,
        workspaceDiagnostics: false
      }
    }
  };
  if (hasWorkspaceFolderCapability) {
    result.capabilities.workspace = {
      workspaceFolders: {
        supported: true
      }
    };
  }
  return result;
});


// Function to scan `.pss` files and extract packages
function extractPackageNamesFromFile(filePath: any) {
  const fileStream = fs.createReadStream(filePath, 'utf8');
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  rl.on('line', (line: string) => {
    // Match 'package' keyword followed by the package name
    const match = line.match(/\bpackage\s+([a-zA-Z0-9_]+)\b/);
    if (match && match[1]) {
      scannedPackages.add(match[1]);  // Add the package name to the set
    }
  });

  rl.on('close', () => {
    console.log(`Finished scanning ${filePath}`);
  });
}

// Function to scan all `.pss` files in the workspace
function scanFilesForPackages() {
  if (!workspaceRoot || workspaceRoot === "") {
    console.log("Invalid WorkspaceRot");
    return; // No workspace root is available
  }

  console.log("Scanning files for import statements");

  fs.readdir(workspaceRoot, (err: any, files: string[]) => {
    if (err) {
      console.error('Error reading directory:', err);
      return;
    }

    files.forEach((file: string) => {
      const filePath = path.join(workspaceRoot, file);
      if (file.endsWith('.pss')) {
        // Scan each `.pss` file for package names
        extractPackageNamesFromFile(filePath);
      }
    });
  });
}

scanFilesForPackages();


connection.onInitialized(() => {
  connection.console.log(workspaceRoot);
  if (hasConfigurationCapability) {
    // Register for all configuration changes.
    connection.client.register(DidChangeConfigurationNotification.type, undefined);
  }
  if (hasWorkspaceFolderCapability) {
    connection.workspace.onDidChangeWorkspaceFolders(_event => {
      connection.console.log('Workspace folder change event received.');
      scanFilesForPackages();
    });
  }
});

interface pssSettings {
  maxNumberOfProblems: number;
}

const defaultSettings: pssSettings = { maxNumberOfProblems: 1000 };
let globalSettings: pssSettings = defaultSettings;

// Cache the settings of all open documents
const documentSettings = new Map<string, Thenable<pssSettings>>();

connection.onDidChangeConfiguration(change => {
  if (hasConfigurationCapability) {
    // Reset all cached document settings
    documentSettings.clear();
  } else {
    globalSettings = (
      (change.settings.lspPSS || defaultSettings)
    );
  }
  // Refresh the diagnostics since the `maxNumberOfProblems` could have changed.
  // We could optimize things here and re-fetch the setting first can compare it
  // to the existing setting, but this is out of scope for this example.
  connection.languages.diagnostics.refresh();
});

function getDocumentSettings(resource: string): Thenable<pssSettings> {
  if (!hasConfigurationCapability) {
    return Promise.resolve(globalSettings);
  }
  let result = documentSettings.get(resource);
  if (!result) {
    result = connection.workspace.getConfiguration({
      scopeUri: resource,
      section: 'lspPSS'
    });
    documentSettings.set(resource, result);
  }
  return result;
}

// Only keep settings for open documents
documents.onDidClose(e => {
  documentSettings.delete(e.document.uri);
});


connection.languages.diagnostics.on(async (params) => {
  const document = documents.get(params.textDocument.uri);
  if (document !== undefined) {
    return {
      kind: DocumentDiagnosticReportKind.Full,
      items: await validateTextDocument(document)
    } satisfies DocumentDiagnosticReport;
  } else {
    // We don't know the document. We can either try to read it from disk
    // or we don't report problems for it.
    return {
      kind: DocumentDiagnosticReportKind.Full,
      items: []
    } satisfies DocumentDiagnosticReport;
  }
});

// The content of a text document has changed. This event is emitted
// when the text document first opened or when its content has changed.
documents.onDidChangeContent(change => {
  validateTextDocument(change.document);
  scanFilesForPackages();
});

async function validateTextDocument(textDocument: TextDocument): Promise<Diagnostic[]> {
  // In this simple example we get the settings for every validate run.
  const settings = await getDocumentSettings(textDocument.uri);

  // The validator creates diagnostics for all uppercase words length 2 and more
  const text = textDocument.getText();
  const pattern = /\b[A-Z]{2,}\b/g;
  let m: RegExpExecArray | null;

  let problems = 0;
  const diagnostics: Diagnostic[] = [];
  while ((m = pattern.exec(text)) && problems < settings.maxNumberOfProblems) {
    problems++;
    const diagnostic: Diagnostic = {
      severity: DiagnosticSeverity.Warning,
      range: {
        start: textDocument.positionAt(m.index),
        end: textDocument.positionAt(m.index + m[0].length)
      },
      message: `${m[0]} is all uppercase.`,
      source: 'ex'
    };
    if (hasDiagnosticRelatedInformationCapability) {
      diagnostic.relatedInformation = [
        {
          location: {
            uri: textDocument.uri,
            range: Object.assign({}, diagnostic.range)
          },
          message: 'Spelling matters'
        },
        {
          location: {
            uri: textDocument.uri,
            range: Object.assign({}, diagnostic.range)
          },
          message: 'Particularly for names'
        }
      ];
    }
    diagnostics.push(diagnostic);
  }
  return diagnostics;
}

connection.onDidChangeWatchedFiles(_change => {
  // Monitored files have change in VSCode
  connection.console.log('We received a file change event');
  scanFilesForPackages();
});

// This handler provides the initial list of the completion items.
connection.onCompletion(
  (_textDocumentPosition: TextDocumentPositionParams): CompletionItem[] => {
    const importSuggestions: CompletionItem[] | { label: string; insertText: string; kind: any; }[] = [];

    // Add completion items for each package found
    scannedPackages.forEach(packageName => {
      importSuggestions.push({
        label: `import ${packageName} :: *;`,
        insertText: `import ${packageName} :: *;`,
        kind: CompletionItemKind.Reference
      });
    });

    return importSuggestions;
  }
);

// This handler resolves additional information for the item selected in
// the completion list.
connection.onCompletionResolve(
  (item: CompletionItem): CompletionItem => {
    if (item.data === 1) {
      item.detail = 'TypeScript details';
      item.documentation = 'TypeScript documentation';
    } else if (item.data === 2) {
      item.detail = 'JavaScript details';
      item.documentation = 'JavaScript documentation';
    }
    return item;
  }
);

// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection);

// Listen on the connection
connection.listen();
