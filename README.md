# DotMint 🎨

**DotMint** is a Vue.js-based creative platform where users can design **30x30 pixelated artwork**, mint it as an **NFT on Solana**, or launch their art as a token on **pump.fun**. You can draw manually on the canvas with powerful tools, or even generate pixel art automatically using **AI**!

[🔗 GitHub Repo](https://github.com/Victor-Evogor/dotmint.git)

---

## ✨ Features

- **Pixel Editor**: Intuitive 30x30 grid canvas with drawing, erasing, filling, color picking, and undo/redo tools.
- **AI Art Generator**: Create pixelated art from text prompts using Stable Diffusion.
- **NFT Minting (coming soon)**: Mint your pixel artwork as NFTs directly to the Solana blockchain.
- **Token Launching (coming soon)**: Launch your creation as a token via pump.fun easily.
- **Wallet Connection**: Securely connect using Phantom, Solflare, and other Solana wallets.
- **Credit System**: Buy credits to access AI-generated art features.
- **Dark Mode**: Toggle between light and dark themes for a personalized experience.

---

## 🛠️ Technologies

- **Frontend**: Vue 3 + TypeScript + Vite
- **Blockchain**: Solana Web3.js + Metaplex JS
- **AI Integration**: Stable Diffusion API
- **Backend**: Firebase (for user management and credit tracking)
- **Testing**: Vitest (unit tests) and Cypress (end-to-end tests)

---

## 🚀 Roadmap

| Feature                   | Status         |
| :------------------------ | :------------- |
| Drawing tools & canvas    | ✅ Completed   |
| AI-generated pixel art    | ✅ Completed   |
| NFT minting on Solana     | 🚧 In progress |
| Token launch via pump.fun | 🚧 In progress |

---

## 🖥️ Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/Victor-Evogor/dotmint.git
cd dotmint
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the development server

```bash
npm run dev
```

Open your browser and visit [http://localhost:5173](http://localhost:5173).

---

## 📦 Build for production

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

---

## 🧪 Testing

- **Unit tests** (Vitest)

```bash
npm run test:unit
```

- **End-to-End tests** (Cypress)

```bash
npm run test:e2e:dev
```

Or test against production:

```bash
npm run build
npm run test:e2e
```

---

## 🔗 Useful Links

- [Solana Web3.js](https://solana-labs.github.io/solana-web3.js/)
- [Stable Diffusion API](https://stability.ai/)
- [pump.fun](https://pump.fun/)
- [Firebase Documentation](https://firebase.google.com/docs)

---

## 📄 License

MIT License — free for personal and commercial use. Attribution is appreciated! 🚀