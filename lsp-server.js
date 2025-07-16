const http = require('http');
const WebSocket = require('ws');
const { spawn } = require('child_process');
const {
  WebSocketMessageReader,
  WebSocketMessageWriter,
  toSocket,
} = require('vscode-ws-jsonrpc');
const {
  StreamMessageReader,
  StreamMessageWriter,
} = require('vscode-jsonrpc');

const server = http.createServer();
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  const socket = toSocket(ws);

  // Create WebSocket side of the transport
  const socketReader = new WebSocketMessageReader(socket);
  const socketWriter = new WebSocketMessageWriter(socket);

  // Launch the language server process (Python LSP)
  const childProcess = spawn('pylsp');

  // Create stdio side of the transport
  const lsReader = new StreamMessageReader(childProcess.stdout);
  const lsWriter = new StreamMessageWriter(childProcess.stdin);

  // Pipe LSP <-> WebSocket
  socketReader.listen((message) => {
    lsWriter.write(message);
  });

  lsReader.listen((message) => {
    socketWriter.write(message);
  });

  childProcess.stderr.on('data', (data) => {
    console.error('LSP stderr:', data.toString());
  });

  childProcess.on('exit', (code, signal) => {
    console.log(`LSP process exited (code: ${code}, signal: ${signal})`);
    ws.close();
  });
});

server.listen(5007, () => {
  console.log('LSP WebSocket server listening on ws://localhost:5007');
});
