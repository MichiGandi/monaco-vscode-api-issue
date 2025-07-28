import "vscode/localExtensionHost";
import '@codingame/monaco-vscode-python-default-extension';
import "@codingame/monaco-vscode-theme-defaults-default-extension";

import './style.css'
import * as monaco from 'monaco-editor';
import { initialize } from '@codingame/monaco-vscode-api'
import { ExtensionHostKind, registerExtension } from '@codingame/monaco-vscode-api/extensions'

// we need to import this so monaco-languageclient can use vscode-api
import { initWebSocketAndStartClient } from './lsp-client'

// everything else is the same except the last line
import getLanguagesServiceOverride from "@codingame/monaco-vscode-languages-service-override";
import getThemeServiceOverride from "@codingame/monaco-vscode-theme-service-override";
import getTextMateServiceOverride from "@codingame/monaco-vscode-textmate-service-override";

import './unity-interop';

// adding worker
export type WorkerLoader = () => Worker;
const workerLoaders: Partial<Record<string, WorkerLoader>> = {
	TextEditorWorker: () => new Worker(new URL('monaco-editor/esm/vs/editor/editor.worker.js', import.meta.url), { type: 'module' }),
	TextMateWorker: () => new Worker(new URL('@codingame/monaco-vscode-textmate-service-override/worker', import.meta.url), { type: 'module' })
}

window.MonacoEnvironment = {
	getWorker: function (_moduleId, label) {
		console.log('getWorker', _moduleId, label);
		const workerFactory = workerLoaders[label]
		if (workerFactory != null) {
			return workerFactory()
		}
		throw new Error(`Worker ${label} not found`)
	}
}

// adding services
await initialize({
	...getTextMateServiceOverride(),
	...getThemeServiceOverride(),
	...getLanguagesServiceOverride(),
});

window.editor = monaco.editor.create(document.getElementById('editor')!, {
	value: "print('Hello world!')",
	language: "python",
	minimap: {
		enabled: false
	},
	stickyScroll: {
		enabled: false
	},
	lineNumbersMinChars: 2,  // Shrinks the line number gutter
	lineDecorationsWidth: 0, // Removes extra margin space
	folding: true           // Removes fold markers to reduce visual clutter
});

// start web socket lsp client on port 5007 
// (you can choose any port, just make sure the server uses the same)
initWebSocketAndStartClient("ws://localhost:5007")

const registerExtensionResult = registerExtension({
	name: 'custom-theme-extension',
	publisher: 'none',
	version: '1.0.0',
	engines: {
		vscode: '*'
	},
	contributes: {
		themes: [
			{
				id: "Custom Theme",
				label: "Custom Theme",
				uiTheme: "vs-dark",
				path: "./themes/custom-theme.json",
			}
		]
	}
}, ExtensionHostKind.LocalProcess)

registerExtensionResult.registerFileUrl('./themes/custom-theme.json', new URL('/custom-theme.json', import.meta.url).toString())
await registerExtensionResult.whenReady();
monaco.editor.setTheme("Custom Theme");
