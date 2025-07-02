// main.ts
import './style.css'
import * as monaco from 'monaco-editor';

// importing installed services
import { initialize } from 'vscode/services'
import getLanguagesServiceOverride from "@codingame/monaco-vscode-languages-service-override";
import getThemeServiceOverride from "@codingame/monaco-vscode-theme-service-override";
import getTextMateServiceOverride from "@codingame/monaco-vscode-textmate-service-override";

// adding worker
export type WorkerLoader = () => Worker;
const workerLoaders: Partial<Record<string, WorkerLoader>> = {
	TextEditorWorker: () => new Worker(new URL('monaco-editor/esm/vs/editor/editor.worker.js', import.meta.url), { type: 'module' })
}
window.MonacoEnvironment = {
  getWorker: function (_workerId, label) {
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