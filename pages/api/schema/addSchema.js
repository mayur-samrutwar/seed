import { getCollection } from '@/lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { name, fields } = req.body;

  if (!name || !fields || !Array.isArray(fields)) {
    return res.status(400).json({ error: 'Invalid request body' });
  }

  try {
    const schemasCollection = await getCollection('schemas');

    const existingSchema = await schemasCollection.findOne({ name });
    if (existingSchema) {
      return res.status(409).json({ error: 'Schema with this name already exists' });
    }

    const schema = {
      name,
      fields: fields.map(field => ({
        name: field.name,
        type: field.type,
        isEncrypted: field.isEncrypted
      }))
    };

    await schemasCollection.insertOne(schema);

    res.status(201).json({ message: 'Schema created successfully' });
  } catch (error) {
    console.error('Error creating schema:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
