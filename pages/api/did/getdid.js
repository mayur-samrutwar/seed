import { getCollection } from '@/lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { address } = req.query;

  if (!address) {
    return res.status(400).json({ error: 'Missing required field: address' });
  }

  try {
    const usersCollection = await getCollection('users');

    const user = await usersCollection.findOne({ address });
    if (!user) {
      return res.status(404).json({ error: 'Wallet address not found' });
    }

    res.status(200).json({ did: user.publicKey });
  } catch (error) {
    console.error('Error getting DID:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
