import { getCollection } from '@/lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const schemasCollection = await getCollection('schemas');

    const schemas = await schemasCollection.find({}).toArray();
    if (!schemas || schemas.length === 0) {
      return res.status(404).json({ error: 'No schemas found' });
    }

    res.status(200).json(schemas);
  } catch (error) {
    console.error('Error fetching schemas:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
