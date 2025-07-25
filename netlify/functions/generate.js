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
    const { name = 'Someone', gender, mood = '', type, intensity = 'medium' } = data;
    const userMood = mood.toLowerCase();
    const tone = (type === 'lift' || type === 'positive') ? 'Uplift' : 'Roast';

    const isHarmful = /suicide|kill myself|cutting|self harm|hurt myself|hurt others|end my life|die|kill someone|take my life/i;
    if (isHarmful.test(userMood)) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          message: `It sounds like you're going through something heavy — and that's okay. You're not alone. If you're in crisis, please consider reaching out:\n\n- 🌍 International: https://www.befrienders.org\n- 🇺🇸 US: https://988lifeline.org\n- 🇬🇧 UK: https://samaritans.org\n\nTake a breath. You matter. ❤️`,
          title: 'LET’S TAKE A MOMENT',
          source: 'safety-check'
        })
      };
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) return fallback(name, tone, headers);

    const models = ['mistralai/mistral-7b-instruct:free', 'gryphe/mythomax-l2:free'];
    const model = models[Math.floor(Math.random() * models.length)];

    const prompt = `Write a short ${tone.toLowerCase()} message (max 4 lines) for ${name}${gender ? ` (${gender})` : ''}, based on: "${mood}". Make it ${intensity} in tone. Avoid long intros and get to the punchline quickly.`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: 'You are a personality generator for a surprise door website. Replies must be 4 lines max and very engaging.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 120,
        temperature: 0.9
      })
    });

    const json = await response.json();
    const raw = json?.choices?.[0]?.message?.content?.trim();
    const final = raw ? raw.replace(/^"|"$/g, '').trim() : null;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: final || fallback(name, tone).body.message,
        title: tone === 'Uplift' ? 'LIFT PROTOCOL ACTIVATED' : 'ZING MODE ENGAGED',
        source: final ? 'openrouter' : 'fallback'
      })
    };
  } catch (err) {
    console.error('Error:', err.message);
    return fallback('there', 'Uplift', headers);
  }
};

function fallback(name, tone, headers = {
  'Access-Control-Allow-Origin': '*',
  'Content-Type': 'application/json'
}) {
  const safe = tone === 'Uplift'
    ? `Hey ${name}, even when things glitch, you're still amazing. Try again in a moment.`
    : `${name}, we tried to roast you but the fire fizzled out. Try again for some real spice.`;
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      message: safe,
      title: tone === 'Uplift' ? 'LIFT PROTOCOL ACTIVATED' : 'ZING MODE ENGAGED',
      source: 'fallback'
    })
  };
}
