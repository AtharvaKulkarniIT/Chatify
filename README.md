# Chatify

Chatify is a real-time chat application built using React.js for the frontend and Node.js, Express.js with Socket.IO for the backend server, allowing users to engage in instant messaging.

## Project Structure

The project is structured into two main folders:

- **frontend:** Contains the React application for the user interface.
- **server:** Contains the Node.js server implementing Socket.IO for real-time messaging.

## Features

- **Real-time Messaging:** Instantly send and receive messages.
- **Multi-User Chat :** Multiple users can login and chat.
- **Responsive Design:** Works seamlessly across devices.
- **LAN Hosting:** Connect and chat with others on the same network.
- **End-to-End Encryption:** Messages are encrypted using an RSA + AES-CBC hybrid scheme, making traffic unreadable in transit.

## Technologies Used

- **Frontend:**
  - React.js
  - CSS3

- **Backend:**
  - Node.js
  - Express.js
  - Socket.IO
  - node-forge (AES + RSA encryption)
## Installation

To run this project locally, follow these steps:

1. **Clone the repository:**

   ```bash
   git clone https://github.com/AtharvaKulkarniIT/Chatify.git
   ```

2. **Navigate to the frontend directory:**

   ```bash
   cd Chatify/frontend
   ```

3. **Install frontend dependencies:**

   ```bash
   npm install
   ```

4. **Navigate to the server directory:**

   ```bash
   cd ../server
   ```

5. **Install server dependencies:**

   ```bash
   npm install
   ```

## Running the Application

To start the frontend and backend servers:

### Frontend

1. **Open a new terminal and navigate to the frontend directory:**

   ```bash
   cd Chatify/frontend
   ```

2. **Start the frontend server:**

   ```bash
   npm start
   ```

3. **Open your browser and navigate to:**

   ```
   http://localhost:3001
   ```

   Open at least two tabs to simulate a chat room environment.

### Backend

1. **Open another terminal and navigate to the server directory:**

   ```bash
   cd Chatify/server
   ```

2. **Start the backend server:**

   ```bash
   npm start
   ```

## Usage

- Enter your unique username in each tab and start chatting.
- Messages are displayed in real-time with different styles for your messages and others'.

## Encryption

This branch implements end-to-end encryption using a RSA + AES-CBC hybrid scheme:

- On connection, the server shares its RSA public key with each client
- Each client generates a random AES key, encrypts it with the server's public key, and sends it back
- All chat messages are encrypted with AES before being sent and decrypted on arrival
- The server never processes plaintext messages

## Encryption Checker

A standalone browser-based tool is included at `encryption-checker.html`. Open it in any browser, enter your server IP and port, and send a message in the chat app to audit whether traffic is encrypted or plaintext. No installation required.


## UI
**Login**
![Login](https://drive.google.com/uc?export=download&id=1Xd7gjzFwpSlG8mLaDZwegbdEejXtB1s3)
<br/><br/>
**Chat page**
![Real-time chat](https://drive.google.com/uc?export=download&id=1EtxAVmU6Wn3b0EMuTosbbWfnFLSSZgVG)

## Contributing

Contributions are welcome! Fork the repository and submit a pull request for any features or fixes.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgements

- [AtharvaKulkarniIT](https://github.com/AtharvaKulkarniIT) — original author
- [jayyant](https://github.com/jayyant) & [ismail](https://github.com/iSmiledAgain) — LAN hosting, end-to-end encryption, encryption checker tool
