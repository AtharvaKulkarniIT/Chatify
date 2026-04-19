const express = require("express");
const http = require("http");
const cors = require("cors");
const socketio = require("socket.io");
const forge = require("node-forge");

const app = express();

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "0.0.0.0";

// Generate RSA keys first, THEN start the server
console.log("Generating RSA keys, please wait...");
const keypair = forge.pki.rsa.generateKeyPair({ bits: 2048 });
const serverPublicKeyPem = forge.pki.publicKeyToPem(keypair.publicKey);
const serverPrivateKey = keypair.privateKey;
console.log("RSA keys ready.");

const clientAesKeys = {};
const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  // Step 1: Send server's public key to the new client
  socket.emit("server-public-key", serverPublicKeyPem);

  // Step 2: Receive AES key from client (encrypted with server's public key)
  socket.on("client-aes-key", (encryptedAesKey) => {
    try {
      const decryptedAesKey = serverPrivateKey.decrypt(
        forge.util.decode64(encryptedAesKey),
        "RSA-OAEP",
      );
      clientAesKeys[socket.id] = decryptedAesKey;
      console.log("AES key received from:", socket.id);
      socket.emit("encryption-ready");
    } catch (err) {
      console.error("Failed to decrypt AES key:", err);
    }
  });

  // Step 3: Receive encrypted chat message, decrypt, re-encrypt for all clients
  socket.on("chat", (data) => {
    console.log("Active AES keys:", Object.keys(clientAesKeys));
    const senderAesKey = clientAesKeys[socket.id];
    if (!senderAesKey) return;

    try {
      // Decrypt incoming message using sender's AES key
      const iv = forge.util.decode64(data.iv);
      const encrypted = forge.util.decode64(data.message);
      const decipher = forge.cipher.createDecipher("AES-CBC", senderAesKey);
      decipher.start({ iv });
      decipher.update(forge.util.createBuffer(encrypted));
      decipher.finish();
      const plaintext = decipher.output.toString();

      // Re-encrypt for each recipient using their AES key and broadcast
      Object.entries(clientAesKeys).forEach(([socketId, aesKey]) => {
        const newIv = forge.random.getBytesSync(16);
        const cipher = forge.cipher.createCipher("AES-CBC", aesKey);
        cipher.start({ iv: newIv });
        cipher.update(forge.util.createBuffer(plaintext, "utf8"));
        cipher.finish();

        io.to(socketId).emit("chat", {
          sender: data.sender,
          message: forge.util.encode64(cipher.output.getBytes()),
          iv: forge.util.encode64(newIv),
        });
      });
    } catch (err) {
      console.error("Failed to process chat message:", err);
    }
  });

  socket.on("disconnect", () => {
    delete clientAesKeys[socket.id];
    console.log("Client disconnected:", socket.id);
  });
});

server.listen(PORT, HOST, () => {
  console.log(`Server listening on http://${HOST}:${PORT}`);
});
