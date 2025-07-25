const fetch = require('node-fetch');

exports.handler = async function(event, context) {
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

  try {
    const data = JSON.parse(event.body || '{}');
    const { name, gender, mood, type, intensity } = data;
    const displayName = name || 'Someone';
    const tone = type === 'positive' || type === 'lift' ? 'Uplift' : 'Roast';
    const userMood = mood?.toLowerCase() || 'unknown mood';
    const level = intensity || 'medium';

    // ⚠️ Harm check
    const isHarmful = /suicide|kill myself|cutting|self harm|hurt myself|hurt others|end my life|die|kill someone|take my life/i;
    if (isHarmful.test(userMood)) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          message: `It sounds like you're going through something heavy — and that's okay. You're not alone.\n\n- 🌍 International: https://www.befrienders.org\n- 🇺🇸 US: https://988lifeline.org\n- 🇬🇧 UK: https://samaritans.org\n\nTake a breath. You matter. ❤️`,
          title: 'Let’s take a moment',
          source: 'safety-check'
        })
      };
    }

    // ✅ Free OpenRouter models
    const freeModels = [
      'mistralai/mistral-7b-instruct:free',
      'tngtech/deepseek-rl1:free',
      'mistralai/mistral-small-3.2-24b-instruct:free'
    ];
    const selectedModel = freeModels[Math.floor(Math.random() * freeModels.length)];

    const prompt = `
Respond in under 4 lines for social sharing.
Tone: ${tone}
Name: ${displayName}${gender ? ` (${gender})` : ''}
Mood: "${mood || 'unknown'}"
Intensity: ${level}

Write a creative, short, emotionally expressive message.
If Roast: be playful, clever, but not mean.
If Uplift: be powerful, vivid, encouraging.
Keep it concise and quotable.
`;

    const openrouterKey = process.env.OPENROUTER_API_KEY;

    const response = await fetch(`https://openrouter.ai/api/v1/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${openrouterKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: [
          {
            role: 'user',
            content: prompt.trim()
          }
        ],
        max_tokens: 100,
        temperature: 0.9
      })
    });

    const result = await response.json();
    const message =
      result?.choices?.[0]?.message?.content?.trim() || 'Oops, nothing came through.';

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message,
        title: tone === 'Uplift' ? 'LIFT PROTOCOL ACTIVATED' : 'ZING MODE ENGAGED',
        source: 'ai'
      })
    };
  } catch (err) {
    console.error('generate.js error:', err.message);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: `Hey there, even when things glitch, you're still legendary. Try again shortly.`,
        title: 'LIFT PROTOCOL ACTIVATED',
        source: 'fallback'
      })
    };
  }
};
