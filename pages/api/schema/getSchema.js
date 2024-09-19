import { getCollection } from '@/lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { name } = req.query;

  if (!name) {
    return res.status(400).json({ error: 'Missing required field: name' });
  }

  try {
    const schemasCollection = await getCollection('schemas');

    const schema = await schemasCollection.findOne({ name });
    if (!schema) {
      return res.status(404).json({ error: 'Schema not found' });
    }

    res.status(200).json(schema);
  } catch (error) {
    console.error('Error getting schema:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
