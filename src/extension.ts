'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

/*
import localeEn from "../package.nls.json";
import localeJa from "../package.nls.ja.json";

interface LocaleEntry
{
    [key : string] : string;
}
const localeTableKey = <string>JSON.parse(<string>process.env.VSCODE_NLS_CONFIG).locale;
const localeTable = Object.assign(localeEn, ((<{[key : string] : LocaleEntry}>{
    ja : localeJa
})[localeTableKey] || { }));
const localeString = (key : string) : string => localeTable[key] || key;
*/

export module VerticalLine
{
    //let pass_through;
    
    const applicationKey = "vertical-line";

    const getConfiguration = <type>(key? : string, section : string = applicationKey) : type =>
    {
        const configuration = vscode.workspace.getConfiguration(section);
        return key ?
            configuration[key] :
            configuration;
    };
    const setEnabled = (enabled : boolean) : void => { vscode.workspace.getConfiguration().update("enabled", enabled, true); };

    let color : string = "dummy";
    let enabled : boolean = false;

    let decorator : vscode.TextEditorDecorationType = vscode.window.createTextEditorDecorationType({});

    export function initialize(context : vscode.ExtensionContext): void
    {
        context.subscriptions.push
        (
            //  コマンドの登録
            vscode.commands.registerCommand(`${applicationKey}.show`, show),
            vscode.commands.registerCommand(`${applicationKey}.hide`, hide),

            //  イベントリスナーの登録
            vscode.workspace.onDidChangeConfiguration(() => onDidChangeConfiguration()),
            vscode.window.onDidChangeTextEditorSelection(() => update()),
            vscode.window.onDidChangeActiveTextEditor(() => update())
        );

        onDidChangeConfiguration();
    }

    export const show = () : void => setEnabled(true);
    export const hide = () : void => setEnabled(false);

    const calcWidth = (text : string) : number =>
    {
        return text.length;
    };
    const substrByWidth = (text : string, width : number) : string | null =>
    {
        return text.length < width ? null: text.substr(0, width);
    } ;

    export function update() : void
    {
        const editor = vscode.window.activeTextEditor;
        if (editor)
        {
            var decorations = [];
            if (editor.selection.isEmpty && enabled)
            {
                const width = calcWidth(editor.document.lineAt(editor.selection.start.line).text.substr(0, editor.selection.start.character));
                for (var i = 0; i < editor.document.lineCount; i++)
                {
                    //if (editor.selection.end.character <= editor.document.lineAt(i).text.replace(/(^ +).*$/, "$1").length)
                    var sub = substrByWidth(editor.document.lineAt(i).text, width);
                    if (null !== sub)
                    {
                        decorations.push(new vscode.Range(i, sub.length,i, sub.length));
                    }
                }
            }
            editor.setDecorations(decorator, decorations);
    }
    }

    export const onDidChangeConfiguration = () =>
    {
        vscode.window.visibleTextEditors.forEach(editor => editor.setDecorations(decorator, []));

        color = getConfiguration<string>("color");
        enabled =  getConfiguration<boolean>("enabled");
        decorator.dispose();
        decorator = vscode.window.createTextEditorDecorationType
        (
            {
                borderColor: color,
                borderStyle: 'none none none solid',
                borderWidth: '1px'
            }
        );

        update();
    };
}

export function activate(context: vscode.ExtensionContext) : void
{
    VerticalLine.initialize(context);
}

export function deactivate() : void
{
}
