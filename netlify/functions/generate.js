// Netlify function using OpenRouter with free models only
const fetch = require('node-fetch');

exports.handler = async function(event) {
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
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  try {
    const data = JSON.parse(event.body || '{}');
    const { name = 'Someone', gender = '', mood = '', type = 'roast', intensity = 'medium' } = data;

    // Harmful input filter
    const isHarmful = /suicide|kill myself|self harm|hurt myself|cutting|end my life|die|harm others|kill someone|take my life/i;
    if (isHarmful.test(mood.toLowerCase())) {
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

    const models = [
      'mistralai/mistral-7b-instruct:free',
      'deepseek/deepseek-llm-7b-instruct:free',
      'qwen/qwen1.5-7b-chat:free'
    ];
    const model = models[Math.floor(Math.random() * models.length)];

    const prompt = `
Your job is to write a ${type === 'positive' ? 'motivational' : 'funny roast'} message under 4 lines for ${name}${gender ? ` (${gender})` : ''}.
Mood: "${mood}"
Intensity: ${intensity}
Tone: ${type === 'positive' ? 'inspiring' : 'sarcastic'}
Make it punchy, original, and shareable. Avoid long responses.
`.trim();

    const apiKey = process.env.OPENROUTER_API_KEY;
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://liftorzing.com',
        'X-Title': 'LiftorZing Personality Roast/Uplift Generator'
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: 'You are a clever personality generator for a social web app. Keep replies under 4 lines.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.9,
        max_tokens: 100
      })
    });

    const result = await response.json();
    const raw = result?.choices?.[0]?.message?.content?.trim() || 'Oops, nothing came through.';

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: raw,
        title: type === 'positive' ? 'LIFT PROTOCOL ACTIVATED' : 'ZING MODE ENGAGED',
        source: 'openrouter'
      })
    };
  } catch (err) {
    console.error('Error in OpenRouter handler:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Something went wrong. Please try again later.' })
    };
  }
};
