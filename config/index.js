import { defaultWagmiConfig } from '@web3modal/wagmi/react/config'
import { cookieStorage, createStorage } from 'wagmi'
import { mainnet, polygonAmoy, sepolia } from 'wagmi/chains'

// Your WalletConnect Cloud project ID
export const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID

// Create a metadata object
const metadata = {
  name: 'seeddid',
  description: 'seed did',
  url: 'https://web3modal.com',
  icons: ['https://avatars.githubusercontent.com/u/37784886']
}

// Define Fhenix Helium chain
const fhenixHelium = {
  id: 8008135,
  name: 'Fhenix Helium',
  network: 'fhenix-helium',
  nativeCurrency: {
    decimals: 18,
    name: 'Fhenix Ether',
    symbol: 'tETH',
  },
  rpcUrls: {
    public: { http: ['https://api.helium.fhenix.zone/'] },
    default: { http: ['https://api.helium.fhenix.zone/'] },
  },
  blockExplorers: {
    default: { name: 'Explorer', url: 'https://explorer.helium.fhenix.zone' },
  },
  testnet: true,
} 

// Create wagmiConfig
const chains = [fhenixHelium, polygonAmoy, sepolia, mainnet]
export const config = defaultWagmiConfig({
    chains,
    projectId,
    metadata,
    ssr: true,
    storage: createStorage({
      storage: cookieStorage
    }),
    auth: {
      email: true,
      socials: ['google', 'x', 'github', 'facebook'],
      showWallets: false, 
      walletFeatures: false
    }
  })