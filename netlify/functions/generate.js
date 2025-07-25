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
      return { statusCode: 200, headers, body: '' };
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
    const displayName = name || 'Someone';
    const level = intensity || 'medium';
    const tone = type === 'positive' || type === 'lift' ? 'Uplift' : 'Roast';
    const userMood = (mood || '').toLowerCase();

    // 🚨 Check for harmful input
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

    // ✅ OpenRouter API
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      console.log('Missing OpenRouter API key.');
      return generateFallbackResponse(data, headers);
    }

    // 🎲 Randomly select a model
    const models = [
      'mistralai/mistral-7b-instruct:free',
      'gryphe/mythomax-l2-13b:free'
    ];
    const selectedModel = models[Math.floor(Math.random() * models.length)];

    // ✨ Add flavor prompt
    const flavors = [
      "Make it clever, short, and entertaining — avoid clichés.",
      "Use a light poetic tone — keep it uplifting and expressive.",
      "Use casual Gen-Z humor, no emojis, just vibe.",
      "Be bold, confident, and hype them up or roast them hard — respectfully.",
      "Make it sound like a fortune teller speaking in riddles, but funny."
    ];
    const flavor = flavors[Math.floor(Math.random() * flavors.length)];

    const prompt = `Your task is to write a short, creative message for a personality generator app.\n\nThe user’s name is: ${displayName}${gender ? ` (${gender})` : ''}\nTone: ${tone}\nMood description: "${mood || 'unknown mood'}"\nIntensity: ${level}\n\n${flavor}`;

    // 🔥 Make request to OpenRouter
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://liftorzing.com',
        'X-Title': 'LiftorZing'
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: [
          {
            role: 'system',
            content: 'You are a creative, funny, supportive assistant generating personalized roast or uplifting messages for users.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.9,
        max_tokens: 100
      })
    });

    if (!response.ok) {
      console.log(`OpenRouter API error: ${response.status}`);
      return generateFallbackResponse(data, headers);
    }

    const result = await response.json();
    const message =
      result?.choices?.[0]?.message?.content?.trim() ||
      'Oops, nothing came through.';

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message,
        title: tone === 'Uplift' ? 'LIFT PROTOCOL ACTIVATED' : 'ZING MODE ENGAGED',
        source: selectedModel
      })
    };
  } catch (err) {
    console.error('General error:', err.message);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: 'Internal Server Error' })
    };
  }
};

// 🛟 Fallback response
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
