import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id || 'anonymous';

    const { artUrl } = await req.json();
    if (!artUrl) {
      return NextResponse.json({ error: 'Image URL is required' }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_AI_API_KEY_1 || process.env.GOOGLE_AI_API_KEY_2;
    if (!apiKey) {
      return NextResponse.json({ error: 'Google AI API key is not configured' }, { status: 500 });
    }

    let mimeType = 'image/jpeg';
    let base64Data = '';

    if (artUrl.startsWith('data:')) {
      const match = artUrl.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        mimeType = match[1];
        base64Data = match[2];
      } else {
        return NextResponse.json({ error: 'Invalid data URL format' }, { status: 400 });
      }
    } else {
      // Fetch public URL and convert to base64
      console.log(`[Decode Art] Fetching public image: ${artUrl}`);
      const imgRes = await fetch(artUrl);
      if (!imgRes.ok) {
        throw new Error(`Failed to fetch image: ${imgRes.statusText}`);
      }
      const buffer = await imgRes.arrayBuffer();
      base64Data = Buffer.from(buffer).toString('base64');
      mimeType = imgRes.headers.get('content-type') || 'image/jpeg';
    }

    const prompt = 
      "This is a surreal abstract painting representing the subconscious feelings and psychological meaning of a dream. " +
      "Analyze the colors, lighting, figures, and overall composition of this artwork. " +
      "Explain what these visual elements symbolize psychologically in 3 short, separate bullet points. " +
      "Format the output exactly as 3 markdown bullet points starting with bold headers (e.g., * **The Colors**: ... * **The Figures**: ...). " +
      "Keep it direct, professional, and do not include any introductory text or conversational filler.";

    console.log('[Decode Art] Sending image to Gemini 3.5 Flash...');
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt },
                {
                  inlineData: {
                    mimeType: mimeType,
                    data: base64Data,
                  },
                },
              ],
            },
          ],
        }),
      }
    );

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error('[Decode Art] Gemini API returned error:', errText);
      throw new Error(`Gemini API failed: ${geminiRes.statusText}`);
    }

    const data = await geminiRes.json();
    const analysis = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Unable to decode symbols.';

    return NextResponse.json({ analysis });
  } catch (err: any) {
    console.error('[Decode Art] Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
