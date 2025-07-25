// generate.js — Enforces sharper, shorter roast tone for ZINGs

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
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  try {
    const data = JSON.parse(event.body || '{}');
    const { name, gender, mood, type, intensity } = data;
    const userMood = (mood || '').toLowerCase();
    const displayName = name || 'Someone';
    const tone = type === 'positive' || type === 'lift' ? 'Uplift' : 'Roast';
    const level = intensity || 'medium';

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

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return fallback('Missing API key', data, headers);
    }

    const roastInstructions = `Write a short, funny roast for someone named ${displayName}${gender ? ` (${gender})` : ''} who is feeling: "${userMood}".\n
- Keep it punchy, playful, and sarcastic.\n- Must be no more than 4 lines.\n- Think: clever comedy roast, Gen Z memes, no cheesy flattery.\n- Avoid over-the-top praise or metaphors like 'sunsets' or 'supernovas'.\n- Include hashtags or emojis only if they elevate the roast.`;

    const upliftInstructions = `Write a short, uplifting message for someone named ${displayName}${gender ? ` (${gender})` : ''} who is feeling: "${userMood}".\n
- Keep it real and warm.\n- No more than 4 lines.\n- Friendly, modern tone.\n- Avoid clichés.`;

    const prompt = tone === 'Roast' ? roastInstructions : upliftInstructions;

    const model = Math.random() > 0.5 ? 'mistralai/mistral-7b-instruct:free' : 'gryphe/mythomax-l2-13b:free';

    const response = await fetch(`https://openrouter.ai/api/v1/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.9,
        max_tokens: 120
      })
    });

    const result = await response.json();
    const message = result.choices?.[0]?.message?.content?.trim();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: message || fallbackMessage(data),
        title: tone === 'Uplift' ? 'LIFT PROTOCOL ACTIVATED' : 'ZING MODE ENGAGED',
        source: result.id ? 'ai' : 'fallback'
      })
    };

  } catch (error) {
    return fallback(error.message, {}, headers);
  }
};

function fallbackMessage(data) {
  return `Hey ${data.name || 'there'}, even when things glitch, you're still amazing. Try again in a moment.`;
}

function fallback(msg, data, headers) {
  console.log('Fallback:', msg);
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      message: fallbackMessage(data),
      title: data?.type === 'positive' ? 'LIFT PROTOCOL ACTIVATED' : 'ZING MODE ENGAGED',
      source: 'fallback'
    })
  };
}
