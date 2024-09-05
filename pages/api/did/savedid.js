import { getCollection } from '@/lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { address, publicKey, privateKey } = req.body;

  if (!address || !publicKey || !privateKey) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const usersCollection = await getCollection('users');

    const existingUser = await usersCollection.findOne({ address });
    if (existingUser) {
      return res.status(409).json({ error: 'Wallet address already exists' });
    }

    const result = await usersCollection.insertOne({
      address,
      publicKey,
      privateKey
    });

    res.status(201).json({ message: 'DID saved successfully', id: result.insertedId });
  } catch (error) {
    console.error('Error saving DID:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
