
import { defaultWagmiConfig } from '@web3modal/wagmi/react/config'
import { cookieStorage, createStorage } from 'wagmi'
import { arbitrumSepolia, mainnet, polygonAmoy, sepolia } from 'wagmi/chains'

// Your WalletConnect Cloud project ID
export const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID

// Create a metadata object
const metadata = {
  name: 'seeddid',
  description: 'seed did',
  url: 'https://web3modal.com', // origin must match your domain & subdomain
  icons: ['https://avatars.githubusercontent.com/u/37784886']
}


// Create wagmiConfig
const chains = [polygonAmoy, sepolia, mainnet]
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