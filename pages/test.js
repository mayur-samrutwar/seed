// pages/index.js
import { useState, useEffect } from 'react';
import { Client } from '@xmtp/xmtp-js';
import { ethers } from 'ethers';

export default function Home() {
  const [wallet, setWallet] = useState(null);
  const [xmtp, setXmtp] = useState(null);
  const [recipientAddress, setRecipientAddress] = useState('');
  const [message, setMessage] = useState('');

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        setWallet(signer);
      } catch (error) {
        console.error('Failed to connect wallet:', error);
      }
    } else {
      console.error('MetaMask is not installed');
    }
  };

  const initXmtp = async () => {
    if (wallet) {
      try {
        const xmtp = await Client.create(wallet);
        setXmtp(xmtp);
      } catch (error) {
        console.error('Failed to initialize XMTP client:', error);
      }
    }
  };

  const sendMessage = async () => {
    if (xmtp && recipientAddress && message) {
      try {
        const conversation = await xmtp.conversations.newConversation(recipientAddress);
        await conversation.send(message);
        alert('Message sent successfully!');
        setMessage('');
      } catch (error) {
        console.error('Failed to send message:', error);
      }
    }
  };

  useEffect(() => {
    if (wallet && !xmtp) {
      initXmtp();
    }
  }, [wallet, xmtp]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">XMTP Messaging App</h1>
      {!wallet ? (
        <button onClick={connectWallet} className="bg-blue-500 text-white px-4 py-2 rounded">
          Connect Wallet
        </button>
      ) : (
        <div>
          <p className="mb-4">Wallet connected</p>
          {xmtp ? (
            <div>
              <input
                type="text"
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
                placeholder="Recipient's Ethereum address"
                className="border p-2 mb-2 w-full"
              />
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message here"
                className="border p-2 mb-2 w-full h-24"
              />
              <button onClick={sendMessage} className="bg-green-500 text-white px-4 py-2 rounded">
                Send Message
              </button>
            </div>
          ) : (
            <p>Initializing XMTP client...</p>
          )}
        </div>
      )}
    </div>
  );
}