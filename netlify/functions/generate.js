
const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  try {
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Content-Type': 'application/json'
    };

    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers,
        body: ''
      };
    }

    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ error: 'Method Not Allowed' })
      };
    }

    const data = JSON.parse(event.body || '{}');
    const { name, gender, mood, type, intensity } = data;
    const userMood = (mood || '').toLowerCase();
    const displayName = name || 'Someone';
    const tone = type === 'positive' || type === 'lift' ? 'Uplift' : 'Roast';
    const level = intensity || 'medium';

    // Check for harmful input
    const isHarmful = /suicide|kill myself|cutting|self harm|hurt myself|hurt others|end my life|die|kill someone|take my life/i;
    if (isHarmful.test(userMood)) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          message: `It sounds like you're going through something heavy — and that's okay. You're not alone. If you're in crisis, please consider reaching out:\n\n- 🌍 International: https://www.befrienders.org\n- 🇺🇸 US: https://988lifeline.org\n- 🇬🇧 UK: https://samaritans.org\n\nTake a breath. You matter. ❤️`,
          title: 'Let’s take a moment',
          source: 'safety-check'
        })
      };
    }

    const apiToken = process.env.HUGGINGFACE_API_TOKEN;
    if (!apiToken) {
      console.log('API token missing, using fallback message generation');
      return generateFallbackResponse(data, headers);
    }

    const flavors = [
      "Make it clever, short, and entertaining — avoid clichés.",
      "Use a light poetic tone — keep it uplifting and expressive.",
      "Use casual Gen-Z humor, no emojis, just vibe.",
      "Be bold, confident, and hype them up or roast them hard — respectfully.",
      "Make it sound like a fortune teller speaking in riddles, but funny."
    ];
    const flavor = flavors[Math.floor(Math.random() * flavors.length)];

    const prompt = `Your task is to write a short, creative message for a personality generator app.\n\nThe user’s name is: ${displayName}${gender ? ` (${gender})` : ''}\nTone: ${tone}\nMood description: "${mood || 'unknown mood'}"\nIntensity: ${level}\n\n${flavor}`;

    let response;
    try {
      response = await fetch(`https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.1`, {
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            temperature: 0.9,
            max_new_tokens: 100
          }
        })
      });

      if (!response.ok) {
        console.log(`Hugging Face API error: ${response.status}`);
        return generateFallbackResponse(data, headers);
      }
    } catch (fetchError) {
      console.log('Fetch error:', fetchError.message);
      return generateFallbackResponse(data, headers);
    }

    try {
      const result = await response.json();
      const generated = Array.isArray(result) && result[0]?.generated_text
        ? result[0].generated_text
        : result?.generated_text || "Oops, nothing came through.";

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          message: generated,
          title: tone === 'Uplift' ? 'LIFT PROTOCOL ACTIVATED' : 'ZING MODE ENGAGED',
          source: 'ai'
        })
      };
    } catch (parseError) {
      console.log('JSON parse error:', parseError.message);
      return generateFallbackResponse(data, headers);
    }
  } catch (error) {
    console.log('General error:', error.message);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: 'Internal Server Error', details: error.message })
    };
  }
};

// Basic fallback if API is unavailable
function generateFallbackResponse(data, headers) {
  const fallbackMessage = `Hey ${data.name || 'there'}, even when things glitch, you're still amazing. Try again in a moment.`;
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      message: fallbackMessage,
      title: data.type === 'positive' ? 'LIFT PROTOCOL ACTIVATED' : 'ZING MODE ENGAGED',
      source: 'fallback'
    })
  };
}
