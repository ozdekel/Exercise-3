import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('extension.fixPythonNames', () => {
        const editor = vscode.window.activeTextEditor;x``
        if (!editor) {
            vscode.window.showErrorMessage('No active editor found!');
            return;
        }

        const document = editor.document;
        const text = document.getText();

        // Reserved Python keywords that should not be changed
        const reservedKeywords = new Set([
            'False', 'None', 'True', 'and', 'as', 'assert', 'async', 'await', 'break', 'class',
            'continue', 'def', 'del', 'elif', 'else', 'except', 'finally', 'for', 'from', 'global',
            'if', 'import', 'in', 'is', 'lambda', 'nonlocal', 'not', 'or', 'pass', 'raise',
            'return', 'try', 'while', 'with', 'yield'
        ]);

        // Regex to detect all variable names, even with special characters
        const variableRegex = /[a-zA-Z_$][a-zA-Z0-9_$%@!#^&*\-]*/g;

        // Step 1: Collect all variable names and their fixed versions
        const variableMap: Map<string, string> = new Map();
        const matches = text.match(variableRegex);
        if (matches) {
            matches.forEach((name) => {
                if (!reservedKeywords.has(name) && !variableMap.has(name)) {
                    variableMap.set(name, fixVariableName(name));
                }
            });
        }

        // Step 2: Replace all occurrences of variable names consistently
        let fixedText = text;
        variableMap.forEach((fixedName, originalName) => {
            const regex = new RegExp(`\\b${originalName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g'); // Match whole word only
            fixedText = fixedText.replace(regex, fixedName);
        });

        // Apply the changes in the editor
        editor.edit((editBuilder) => {
            const fullRange = new vscode.Range(
                document.positionAt(0),
                document.positionAt(text.length)
            );
            editBuilder.replace(fullRange, fixedText);
        });

        vscode.window.showInformationMessage('Variable names fixed!');
    });

    // Function to fix variable names
    function fixVariableName(name: string): string {
        // Step 1: Remove all numbers within the name
        name = name.replace(/\d+/g, '');

        // Step 2: Replace invalid characters (anything not a letter, number, or `_`) with `_`
        name = name.replace(/[^a-zA-Z0-9_]/g, '_');

        // Step 3: Consolidate multiple underscores
        name = name.replace(/_+/g, '_');

        // Step 4: Trim leading or trailing underscores
        name = name.replace(/^_+|_+$/g, '');

        return name;
    }

    context.subscriptions.push(disposable);
}

export function deactivate() {}
