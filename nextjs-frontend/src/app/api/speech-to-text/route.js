export default async function handler(req, res) {
    if (req.method === 'POST') {
      try {
        const response = await fetch('http://localhost:8000/api/speech-to-text', {
          method: 'POST',
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        res.status(200).json(data);
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch from backend API' });
      }
    } else {
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  }