import { useState, useEffect, useCallback } from "react"
import { useAccount, useSignMessage, useConnect, useDisconnect } from 'wagmi'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import HomeContent from '@/components/HomeContent'
import IssueCredentialContent from '@/components/IssueCredentialContent'
import VerifyCredentialContent from '@/components/VerifyCredentialContent'
import ApprovalRequestContent from '@/components/ApprovalRequestContent'
import ProfileContent from '@/components/ProfileContent'

export default function AirbnbStyleDashboard() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [activePage, setActivePage] = useState("Home")
  const [user, setUser] = useState(null)
  const [isReady, setIsReady] = useState(false)
  const [isSigned, setIsSigned] = useState(false)
  const { address, isConnected } = useAccount()
  const { connectAsync, connectors } = useConnect()
  const { disconnectAsync } = useDisconnect()
  const { signMessageAsync } = useSignMessage()

  const handleSignMessage = useCallback(async () => {
    if (!address) {
      console.error("No address available")
      return
    }
    try {
      const signature = await signMessageAsync({ message: "Login to the application" })
      console.log("Signature received:", signature)
      setIsSigned(true)
    } catch (error) {
      console.error("Error during sign message:", error)
      await handleReconnect()
    }
  }, [address, signMessageAsync])

  const handleReconnect = async () => {
    try {
      await disconnectAsync()
      const result = await connectAsync({ connector: connectors[0] })
      if (result?.account) {
        handleSignMessage()
      }
    } catch (error) {
      console.error("Error during reconnect:", error)
    }
  }

  useEffect(() => {
    if (isConnected && address) {
      console.log("Wallet connected. Address:", address)
      setIsReady(true)
    } else {
      setIsReady(false)
    }
  }, [isConnected, address])

  useEffect(() => {
    if (isReady) {
      handleSignMessage()
    }
  }, [isReady, handleSignMessage])

  const renderContent = () => {
    switch (activePage) {
      case "Home":
        return <HomeContent />
      case "Issue Credential":
        return <IssueCredentialContent />
      case "Verify Credential":
        return <VerifyCredentialContent />
      case "Approval Request":
        return <ApprovalRequestContent />
      case "Profile":
        return <ProfileContent />
      default:
        return null
    }
  }

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 font-sans">
      <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        activePage={activePage}
        setActivePage={setActivePage}
        isSigned={isSigned}
      />
      <main className="flex-1 overflow-hidden flex flex-col">
        <Header />
        <div className="flex-1 overflow-y-auto p-8 bg-gray-50">
          {renderContent()}
        </div>
      </main>
    </div>
  )
}