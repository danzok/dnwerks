export interface BitlyLink {
  id: string;
  link: string;
  long_url: string;
  created_at: string;
  modified_at: string;
}

export interface BitlyClickSummary {
  total_clicks: number;
  units: number;
  unit: string;
  unit_reference: string;
}

export async function createShortLink(longUrl: string): Promise<string> {
  const accessToken = process.env.BITLY_ACCESS_TOKEN;

  if (!accessToken) {
    console.warn('Bitly access token not configured. Using fallback URL.');
    return longUrl; // Fallback to original URL if Bitly not configured
  }

  try {
    const response = await fetch('https://api-ssl.bitly.com/v4/shorten', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        long_url: longUrl,
        domain: 'bit.ly' // Use bit.ly domain
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Bitly API error:', error);
      throw new Error(`Bitly API error: ${error.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.link; // e.g., "https://bit.ly/abc123"
  } catch (error) {
    console.error('Error creating short link:', error);
    throw error;
  }
}

export async function getClickStats(shortUrl: string): Promise<number> {
  const accessToken = process.env.BITLY_ACCESS_TOKEN;

  if (!accessToken) {
    console.warn('Bitly access token not configured. Cannot fetch click stats.');
    return 0;
  }

  // Extract Bitlink ID from URL
  let bitlink = shortUrl.replace('https://bit.ly/', '');
  bitlink = bitlink.replace('http://bit.ly/', '');

  try {
    const response = await fetch(
      `https://api-ssl.bitly.com/v4/bitlinks/${bitlink}/clicks/summary`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      console.error('Bitly API error:', await response.json());
      return 0;
    }

    const data: BitlyClickSummary = await response.json();
    return data.total_clicks;
  } catch (error) {
    console.error('Error fetching click stats:', error);
    return 0;
  }
}

export function generateFallbackShortLink(): string {
  // Generate a simple fallback short link
  const randomId = Math.random().toString(36).substring(2, 8);
  return `https://example.com/${randomId}`;
}

// Check if Bitly is configured
export function isBitlyConfigured(): boolean {
  return !!process.env.BITLY_ACCESS_TOKEN;
}