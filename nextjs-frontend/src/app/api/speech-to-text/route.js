export async function POST(req) {
    try {
      const response = await fetch('http://localhost:8000/api/speech-to-text', {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return Response.json(data);
    } catch (error) {
      return Response.json(
        { error: 'Failed to fetch from backend API' },
        { status: 500 }
      );
    }
  }