import React, { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Header from "./Header";
import "../App.css";
import { FaPaperPlane } from "react-icons/fa";
import SocketIOClient from "socket.io-client";
import forge from "node-forge";

const ChatPage = () => {
  const { username } = useParams();
  const [message, setMessage] = useState("");
  const [chats, setChats] = useState([]);
  const [socket, setSocket] = useState(null);
  const [aesKey, setAesKey] = useState(null);
  const [encryptionReady, setEncryptionReady] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    const newSocket = SocketIOClient();
    setSocket(newSocket);

    // Step 1: Receive server's public key
    newSocket.on("server-public-key", (serverPublicKeyPem) => {
      // Step 2: Generate a random AES key
      const newAesKey = forge.random.getBytesSync(32); // 256-bit AES key
      setAesKey(newAesKey);

      // Step 3: Encrypt AES key with server's RSA public key and send it
      const serverPublicKey = forge.pki.publicKeyFromPem(serverPublicKeyPem);
      const encryptedAesKey = forge.util.encode64(
        serverPublicKey.encrypt(newAesKey, "RSA-OAEP")
      );
      newSocket.emit("client-aes-key", encryptedAesKey);
    });

    // Step 4: Server confirms encryption is set up
    newSocket.on("encryption-ready", () => {
      setEncryptionReady(true);
      console.log("Encryption established!");
    });

    // Step 5: Receive and decrypt incoming messages
    newSocket.on("chat", (data) => {
      setAesKey((currentAesKey) => {
        if (!currentAesKey) return currentAesKey;
        try {
          const iv = forge.util.decode64(data.iv);
          const encrypted = forge.util.decode64(data.message);
          const decipher = forge.cipher.createDecipher(
            "AES-CBC",
            currentAesKey
          );
          decipher.start({ iv });
          decipher.update(forge.util.createBuffer(encrypted));
          decipher.finish();
          const plaintext = decipher.output.toString();

          setChats((prevChats) => [
            ...prevChats,
            { sender: data.sender, message: plaintext },
          ]);
        } catch (err) {
          console.error("Failed to decrypt message:", err);
        }
        return currentAesKey;
      });
    });

    return () => {
      newSocket.close();
    };
  }, []);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chats]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && socket && aesKey && encryptionReady) {
      // Encrypt message with AES key before sending
      const iv = forge.random.getBytesSync(16);
      const cipher = forge.cipher.createCipher("AES-CBC", aesKey);
      cipher.start({ iv });
      cipher.update(forge.util.createBuffer(message, "utf8"));
      cipher.finish();

      socket.emit("chat", {
        sender: username,
        message: forge.util.encode64(cipher.output.getBytes()),
        iv: forge.util.encode64(iv),
      });
      setMessage("");
    }
  };

  return (
    <main>
      <Header />
      <Link to="/" className="logout-link">
        LOGOUT
      </Link>
      {!encryptionReady && (
        <p style={{ textAlign: "center", color: "gray" }}>
          Establishing secure connection...
        </p>
      )}
      <div className="chat-container">
        {chats.map((chat, index) => (
          <div
            key={index}
            className={chat.sender === username ? "my-chat" : "notmy-chat"}
          >
            <p>
              <span className="user">
                {chat.sender === username
                  ? `You: ${username}`
                  : `User: ${chat.sender}`}
              </span>
              <span className="msg">{chat.message}</span>
            </p>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>
      <div className="chatbox-container">
        <div className="chatbox">
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder={
                encryptionReady
                  ? "Enter a new message"
                  : "Waiting for secure connection..."
              }
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={!encryptionReady}
            />
            <button type="submit" disabled={!encryptionReady}>
              <FaPaperPlane />
            </button>
          </form>
        </div>
      </div>
    </main>
  );
};

export default ChatPage;