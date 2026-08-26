import * as monaco from "monaco-editor";

let line = "";
let lineNumber = 0;
let lines: string[] = [];
let markers: monaco.editor.IMarkerData[] = [];
let i = 0;

const flakyFileHosts = ["cdn.discordapp.com", "media.discordapp.net", "imgur.com"];

function checkFlakyFileHost() {
    for (const host of flakyFileHosts) {
        if (line.includes(host)) {
            markers.push({
                severity: monaco.MarkerSeverity.Error,
                message: `The file host "${host}" is known to be flaky and will delete files after a certain amount of time.
This WILL render images and audio in your dialogue broken in the future.
Consider using a file host like https://filegarden.com/ that is not known to delete files.`,
                startLineNumber: lineNumber,
                startColumn: 1,
                endLineNumber: lineNumber,
                endColumn: line.length + 1,
            });
        }
    }
}

export function validateJustFlakyFileHosts(model: monaco.editor.ITextModel) {
    lines = model.getLinesContent();
    line = "";
    lineNumber = 0;
    i = 0;
    markers = [];
    try {
        for (i = 0; i < lines.length; i++) {
            line = lines[i];
            lineNumber = i + 1;

            if (line.trim() === "") continue;

            checkFlakyFileHost();
        }
    } catch (e) {
        markers = [];
        markers.push({
            severity: monaco.MarkerSeverity.Error,
            message: `The validator faulted out when trying to process your dialogue. 
This is a severe error that you should report to the discord along with the dialogue that caused it.

At line ${lineNumber}
${(e as Error).stack}`,
            startLineNumber: 1,
            startColumn: 1,
            endLineNumber: lines.length,
            endColumn: lines[lines.length - 1].length + 1,
        });
    }

    monaco.editor.setModelMarkers(model, "owner", markers);
}
