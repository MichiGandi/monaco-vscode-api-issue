// main.ts
import './style.css'
import * as monaco from 'monaco-editor';

import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';

window.MonacoEnvironment = {
  getWorker: function (_moduleId, _label) {
	return new editorWorker();
  }
}
monaco.editor.create(document.getElementById('editor')!, {
	value: "Hello world!",
});
