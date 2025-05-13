# DotMint 🎨

**DotMint** is a creative platform that allows users to design **30x30 pixelated artwork** called dotmints. Users can draw manually on a web-based canvas using powerful tools, and mint their creations as NFTs on the Solana blockchain.

[🔗 GitHub Repo](https://github.com/Victor-Evogor/dotmint.git)

---

## 🔧 Environment Setup

1. Copy the example environment file to `.env`:

```bash
cp .example.env .env
```

2. Fill in the following environment variables in the `.env` file:

```
VITE_CIVIC_AUTH_CLIENT_ID=
VITE_SD_API_KEY=
VITE_SOLANA_RPC_URL=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_DATABASE_URL=
VITE_FIREBASE_API_KEY=
VITE_PAYMENT_WALLET_ADDRESS=
```

Make sure to replace the placeholders with your actual credentials and configuration details.

## ✨ Features

- **Pixel Editor**: Intuitive 30x30 grid canvas with drawing, erasing, filling, color picking, and undo/redo tools.
- **NFT Minting**: Mint your pixel artwork as NFTs directly to the Solana blockchain.
- **Wallet Connection**: Securely connect using Civic Auth and Solana wallets.
- **Credit System**: Buy credits to access premium features.
- **Dark Mode**: Toggle between light and dark themes for a personalized experience.

---

## 🛠️ Technologies

- **Frontend**: React + TypeScript
- **Blockchain**: Solana Web3.js
- **Authentication**: Civic Auth
- **Backend**: Firebase (for user management and credit tracking)
- **Testing**: Vitest (unit tests) and Cypress (end-to-end tests)

---

## 🚀 Roadmap

| Feature                   | Status         |
| :------------------------ | :------------- |
| Drawing tools & canvas    | ✅ Completed   |
| NFT minting on Solana     | ✅ Completed   |
| Wallet integration        | ✅ Completed   |

---

## 🖥️ Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/Victor-Evogor/dotmint.git
cd dotmint
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Start the development server

```bash
pnpm run dev
```

Open your browser and visit [http://localhost:5173](http://localhost:5173).

---

## 📦 Build for production

```bash
pnpm run build
```

Preview the production build:

```bash
pnpm run preview
```

---



## 🔗 Useful Links

- [Solana Web3.js](https://solana-labs.github.io/solana-web3.js/)
- [Civic Auth](https://docs.civic.com/auth)
- [Firebase Documentation](https://firebase.google.com/docs)

---

## 📄 License

MIT License — free for personal and commercial use. Attribution is appreciated! 🚀
