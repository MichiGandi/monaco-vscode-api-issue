// lsp-server.js
const http = require('http');
const WebSocket = require('ws');
const { spawn } = require('child_process');

const {
  toSocket,
  WebSocketMessageReader,
  WebSocketMessageWriter,
  createWebSocketConnection
} = require('vscode-ws-jsonrpc');

const {
  createMessageConnection,
  StreamMessageReader,
  StreamMessageWriter
} = require('vscode-jsonrpc');

// Start pylsp
const pylsp = spawn('pylsp');

pylsp.stderr.on('data', (data) => {
  console.error('[pylsp stderr]:', data.toString());
});
pylsp.on('exit', (code) => {
  console.log('pylsp exited with code', code);
});

// Start WebSocket server
const server = http.createServer();
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('🔌 WebSocket client connected');

  // ✅ FIX: Wrap raw ws instance into a socket
  const socket = toSocket(ws);
  const reader = new WebSocketMessageReader(socket);
  const writer = new WebSocketMessageWriter(socket);

  const clientConnection = createWebSocketConnection(reader, writer, () => ws.close());

  const serverReader = new StreamMessageReader(pylsp.stdout);
  const serverWriter = new StreamMessageWriter(pylsp.stdin);
  const serverConnection = createMessageConnection(serverReader, serverWriter);

  clientConnection.forward(serverConnection);
  serverConnection.listen();

  console.log('🔁 LSP proxy connected to pylsp');
});

server.listen(5007, () => {
  console.log('🚀 LSP WebSocket proxy listening on ws://localhost:5007');
});
