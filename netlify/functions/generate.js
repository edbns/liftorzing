const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle CORS preflight
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

  try {
    const data = JSON.parse(event.body || '{}');
    const { name, gender, mood, type, intensity } = data;
    const displayName = name || 'someone';
    const tone = type === 'positive' || type === 'lift' ? 'Uplift' : 'Roast';
    const level = intensity || 'medium';
    const safeMood = (mood || '').toLowerCase();

    // 1. Harmful input filter
    const isHarmful = /suicide|kill myself|cutting|self harm|hurt myself|hurt others|end my life|die|kill someone|take my life/i;
    if (isHarmful.test(safeMood)) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          message: `It sounds like you're going through something heavy — and that's okay. You're not alone. If you're in crisis, please consider reaching out:\n\n🌍 https://www.befrienders.org\n🇺🇸 https://988lifeline.org\n🇬🇧 https://samaritans.org\n\nTake a breath. You matter. ❤️`,
          title: 'LET’S TAKE A MOMENT',
          source: 'safety-check'
        })
      };
    }

    // 2. Fallback if no API key
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      const fallback = `Hey ${displayName}, even when things glitch, you're still amazing. Try again in a moment.`;
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          message: fallback,
          title: tone === 'Uplift' ? 'LIFT PROTOCOL ACTIVATED' : 'ZING MODE ENGAGED',
          source: 'fallback'
        })
      };
    }

    // 3. Randomly pick model
    const models = [
      'mistralai/mistral-7b-instruct:free',
      'gryphe/mythomax-l2-13b:free'
    ];
    const selectedModel = models[Math.floor(Math.random() * models.length)];

    // 4. Prompt flavors
    const flavors = [
      'Make it clever, short, and entertaining — avoid clichés.',
      'Use a poetic tone, but limit to 4 lines max.',
      'Casual Gen-Z tone, punchy, no emojis.',
      'Bold and playful — short roast or hype line.',
      'Make it sound like a mystical prophecy — but short!'
    ];
    const flavor = flavors[Math.floor(Math.random() * flavors.length)];

    const prompt = `You're a personality generator AI.\n\nUser name: ${displayName}${gender ? ` (${gender})` : ''}\nTone: ${tone}\nMood: "${mood || 'unknown'}"\nIntensity: ${level}\n\n${flavor}\n\nResponse must be maximum **4 lines** and ready to display as a shareable card.`;

    // 5. OpenRouter call
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: [
          { role: 'system', content: 'You are a witty personality generator for short uplifting or roast messages.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 100,
        temperature: 0.85
      })
    });

    const result = await response.json();
    const generated = result?.choices?.[0]?.message?.content?.trim();

    if (!generated) {
      throw new Error('No content returned');
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: generated,
        title: tone === 'Uplift' ? 'LIFT PROTOCOL ACTIVATED' : 'ZING MODE ENGAGED',
        source: 'openrouter'
      })
    };
  } catch (err) {
    console.error('Error in generate.js:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal Server Error',
        details: err.message
      })
    };
  }
};
