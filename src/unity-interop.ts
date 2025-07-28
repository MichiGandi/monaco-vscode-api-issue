import * as monaco from 'monaco-editor';

// Extend global Window interface
declare global {
    interface Window {
        editor: monaco.editor.IStandaloneCodeEditor;
        uwb: {
            ExecuteJsMethod: (methodName: string, value: string) => void;
        };

        // Expose interop functions to the global scope to be used by the unity web browser
        setCode?: (code: string) => void;
        getCode?: () => void;
        FocusIDE?: () => void;
        UnfocusIDE?: () => void;
    }
}

window.setCode = function setCode(newCode: string) {
    window.editor.setValue(newCode);
}

window.getCode = function getCode() {
    window.uwb.ExecuteJsMethod('receiveCode', window.editor.getValue());
}

window.FocusIDE = function FocusIDE() {
    window.editor.focus()
}

window.UnfocusIDE = function UnfocusIDE() {
    const active = document.activeElement;
    if (active instanceof HTMLElement && typeof active.blur === 'function') {
        active.blur();
    }
}
