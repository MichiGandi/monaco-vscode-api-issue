import type { UserConfig } from 'vite'
import importMetaUrlPlugin from '@codingame/esbuild-import-meta-url-plugin'

export default {
  optimizeDeps: {
    include: [
      'vscode-textmate'
    ],
      esbuildOptions: {
        plugins: [importMetaUrlPlugin]
      }
    }
} satisfies UserConfig
