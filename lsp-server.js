// lsp-server.js
const { spawn } = require('child_process');
const { createServer } = require('http');
const { WebSocketServer } = require('ws');
const rpc = require('vscode-ws-jsonrpc');
const lsp = require('vscode-ws-jsonrpc/lib/server');

const server = createServer();
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  console.log('🔌 WebSocket client connected');

  const socket = {
    send: content => ws.send(content),
    onMessage: cb => ws.on('message', cb),
    onError: cb => ws.on('error', cb),
    onClose: cb => ws.on('close', cb),
    dispose: () => ws.close(),
  };

  const reader = new rpc.WebSocketMessageReader(socket);
  const writer = new rpc.WebSocketMessageWriter(socket);

  const connection = rpc.createMessageConnection(reader, writer);

  // Spawn the pylsp process
  const serverProcess = spawn('pylsp');

  const serverReader = new lsp.StreamMessageReader(serverProcess.stdout);
  const serverWriter = new lsp.StreamMessageWriter(serverProcess.stdin);

  const serverConnection = rpc.createMessageConnection(serverReader, serverWriter);

  // Forward messages between client and server
  connection.forward(serverConnection);
  connection.listen();

  serverProcess.stderr.on('data', (data) => {
    console.error(`pylsp stderr: ${data}`);
  });

  serverProcess.on('exit', (code, signal) => {
    console.log(`pylsp exited with code ${code}, signal ${signal}`);
  });
});

server.listen(5007, () => {
  console.log('🚀 LSP WebSocket server running on ws://localhost:5007');
});
