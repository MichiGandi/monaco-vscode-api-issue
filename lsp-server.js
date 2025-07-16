// lsp-server.js
const http = require('http');
const WebSocket = require('ws');
const { spawn } = require('child_process');
const {
  createWebSocketConnection,
  WebSocketMessageReader,
  WebSocketMessageWriter,
} = require('vscode-ws-jsonrpc');

const { createMessageConnection, StreamMessageReader, StreamMessageWriter } = require('vscode-jsonrpc');

// Start Python Language Server (pylsp)
const pylsp = spawn('pylsp'); // make sure pylsp is in PATH

pylsp.stderr.on('data', (data) => {
  console.error('pylsp stderr:', data.toString());
});
pylsp.on('exit', (code) => {
  console.log('pylsp exited with code', code);
});

// Start HTTP server
const server = http.createServer();
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('🔌 WebSocket client connected');

  const reader = new WebSocketMessageReader(ws);
  const writer = new WebSocketMessageWriter(ws);

  const socketConnection = createWebSocketConnection(reader, writer);

  const serverReader = new StreamMessageReader(pylsp.stdout);
  const serverWriter = new StreamMessageWriter(pylsp.stdin);

  const serverConnection = createMessageConnection(serverReader, serverWriter);

  // Forward between client ↔ server
  socketConnection.forward(serverConnection);
  serverConnection.listen();

  console.log('🔁 Connection bridged between client and pylsp');
});

server.listen(5007, () => {
  console.log('🚀 LSP WebSocket proxy listening on ws://localhost:5007');
});
