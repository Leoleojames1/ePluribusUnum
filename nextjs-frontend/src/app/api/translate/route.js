export async function POST(req) {
    try {
      const body = await req.json();
      console.log('Frontend API received request:', body);
      
      const response = await fetch('http://localhost:8000/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Backend API error:', errorText);
        return Response.json(
          { error: `Backend API error: ${errorText}` },
          { status: response.status }
        );
      }
      
      const data = await response.json();
      console.log('Backend API response:', data);
      return Response.json(data);
    } catch (error) {
      console.error('Frontend API error:', error);
      return Response.json(
        { error: `Frontend API error: ${error.message}` },
        { status: 500 }
      );
    }
  }