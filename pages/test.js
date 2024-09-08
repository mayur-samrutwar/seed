import { useSwitchChain } from 'wagmi'

export default function App() {
  const { chains, switchChain } = useSwitchChain()

  return (
    <div>
      {chains.map((chain) => (
        <button key={chain.id} onClick={() => switchChain({ chainId: chain.id })}>
          {chain.name}
        </button>
      ))}
    </div>
  )
}