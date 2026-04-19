const io = require("socket.io-client");
const forge = require("node-forge");

const SERVER_URL = "http://127.0.0.1:3000"; // Enter your network's IP here
const TIMEOUT = 15000;

console.log("\n🔍 Encryption Checker - Connecting to", SERVER_URL);
console.log("Waiting for a chat message to be sent...\n");

const socket = io(SERVER_URL);
let aesKey = null;

socket.on("connect", () => {
  console.log("✅ Connected to server. Performing key exchange...\n");
});

// Do the full AES handshake so server recognises this socket
socket.on("server-public-key", (serverPublicKeyPem) => {
  aesKey = forge.random.getBytesSync(32);
  const serverPublicKey = forge.pki.publicKeyFromPem(serverPublicKeyPem);
  const encryptedAesKey = forge.util.encode64(
    serverPublicKey.encrypt(aesKey, "RSA-OAEP"),
  );
  socket.emit("client-aes-key", encryptedAesKey);
});

socket.on("encryption-ready", () => {
  console.log(
    "🔐 Key exchange complete. Send a message in the chat app now.\n",
  );
});

socket.on("chat", (data) => {
  log("Message received: " + JSON.stringify(data));
  clearTimeout(activeTimer);

  const hasIV = data.iv !== undefined;
  const base64Regex = /^[A-Za-z0-9+/=]{20,}$/;
  const isBase64 = base64Regex.test(data.message);
  const isPlaintext = !isBase64 && typeof data.message === "string";

  // 🚨 Plaintext → NOT encrypted
  if (isPlaintext && !hasIV) {
    log("RESULT: Plaintext detected — NOT encrypted.", "err");
    log("Message content: " + data.message, "err");

    setResult(
      "unsafe",
      "Messages are not encrypted",
      "Anyone on this network can read messages in plaintext. Sender: " +
        data.sender +
        " | Message: " +
        data.message,
    );
  }

  // ✅ Looks encrypted → NO DECRYPTION
  else if (isBase64 && hasIV) {
    log("Encrypted format detected (Base64 + IV).", "ok");

    setResult(
      "safe",
      "Messages are encrypted",
      "RSA handshake completed and ciphertext + IV detected. Messages appear encrypted.",
    );
  }

  // ⚠️ Unknown
  else {
    log("Unknown format — manual inspection recommended.", "warn");

    setResult(
      "waiting",
      "Unclear result",
      "Message format was unexpected. Check the log below.",
    );
  }

  cleanup();
});

socket.on("connect_error", (err) => {
  console.log("❌ Could not connect to server:", err.message);
  process.exit(1);
});

setTimeout(() => {
  console.log("⏱️  Timeout — no message received in 15 seconds.");
  socket.disconnect();
  process.exit(0);
}, TIMEOUT);
