# GovernX - Decentralized Governance Platform

GovernX is a modern, decentralized governance platform built on the XRPL (XRP Ledger) network. It enables communities to create proposals, conduct transparent voting, and make collective decisions in a secure and trustless environment.

## Features

- 🗳️ **Transparent Voting**: All votes recorded on XRPL for complete transparency
- 🔒 **Secure & Trusted**: Built on XRPL's robust infrastructure
- 👥 **Community Driven**: Empower community participation in governance
- 📊 **Real-time Dashboard**: Track proposals and voting progress
- 🎯 **Easy Proposal Creation**: Simple interface for creating governance proposals
- 🪙 **MPT Token Integration**: Create Multi-Purpose Tokens for project funding
- 💰 **Project Funding**: Crowdfunding with XRPL escrow protection

This is a [Next.js](https://nextjs.org) project with TypeScript and Tailwind CSS.

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun
- XRPL Testnet access

### Environment Setup

Create a `.env.local` file in the root directory:

```bash
# XRPL 설정
XRPL_NETWORK=devnet
XRPL_WSS_URL=wss://s.devnet.rippletest.net:51233

# MPT 토큰 관리자 지갑 (실제 운영에서는 보안이 강화된 지갑 사용)
ADMIN_WALLET_SEED=your_admin_wallet_seed_here

# Next.js 설정
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Installation

1. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

2. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### MPT Token Integration

This project includes integration with XRPL's Multi-Purpose Tokens (MPT) for project funding:

- **Project Creation**: When creating a project, you can optionally create an MPT token
- **Token Metadata**: Project information is stored as token metadata on XRPL
- **Blockchain Integration**: All token operations are performed directly on XRPL devnet

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
