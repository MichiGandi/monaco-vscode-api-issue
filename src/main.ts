import '@codingame/monaco-vscode-python-default-extension';
import "@codingame/monaco-vscode-theme-defaults-default-extension";

import './style.css'
import * as monaco from 'monaco-editor';
import { initialize } from '@codingame/monaco-vscode-api'

// we need to import this so monaco-languageclient can use vscode-api
import "vscode/localExtensionHost";
import { initWebSocketAndStartClient } from './lsp-client'

// everything else is the same except the last line
import getLanguagesServiceOverride from "@codingame/monaco-vscode-languages-service-override";
import getThemeServiceOverride from "@codingame/monaco-vscode-theme-service-override";
import getTextMateServiceOverride from "@codingame/monaco-vscode-textmate-service-override";

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

monaco.editor.create(document.getElementById('editor')!, {
	value: "print('Hello world!')",
	language: "python"
});

// start web socket lsp client on port 5007 
// (you can choose any port, just make sure the server uses the same)
initWebSocketAndStartClient("ws://localhost:5007")
