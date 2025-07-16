const http = require('http');
const WebSocket = require('ws');
const { spawn } = require('child_process');
const { WebSocketMessageReader, WebSocketMessageWriter } = require('vscode-ws-jsonrpc');
const { createConnection } = require('vscode-ws-jsonrpc');

const server = http.createServer();
const wss = new WebSocket.Server({ server });

wss.on('connection', (socket) => {
  const reader = new WebSocketMessageReader(socket);
  const writer = new WebSocketMessageWriter(socket);
  const connection = createConnection(reader, writer, () => socket.close());

  const pylsp = spawn('pylsp'); // make sure this works from your shell

  connection.forward(pylsp.stdout, pylsp.stdin, socket);
});

server.listen(5007, () => {
  console.log('LSP WebSocket server listening on ws://localhost:5007');
});
