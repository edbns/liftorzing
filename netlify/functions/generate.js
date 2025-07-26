const fetch = require('node-fetch');

// Fallback responses
function generateFallbackResponse(data, headers, errorType = 'fallback') {
  const tone = data.type === 'positive' || data.type === 'lift' ? 'Uplift' : 'Roast';
  const title = tone === 'Uplift' ? 'LIFT PROTOCOL ACTIVATED' : 'ZING MODE ENGAGED';

  const fallbackMessages = {
    timeout: "Connection taking longer than expected. The servers are busy, but you're still amazing. Try again in a moment.",
    api_error: "The AI service is having a moment, but you're still legendary. Try again shortly.",
    parse_error: "Something went wrong with the response, but you're still awesome. Give it another shot.",
    fallback: "Hey there, even when things glitch, you're still legendary. Try again shortly.",
    empty_response: "Oops, nothing came through. But you're still amazing!"
  };

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      message: fallbackMessages[errorType] || fallbackMessages.fallback,
      title,
      source: errorType
    })
  };
}

exports.handler = async function (event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };

  let data;
  try {
    data = JSON.parse(event.body || '{}');
  } catch (e) {
    console.error('JSON parse error:', e.message);
    return generateFallbackResponse({ type: 'funny' }, headers, 'parse_error');
  }

  const { name, gender, mood, type, intensity } = data;
  const displayName = name || 'Someone';
  const tone = type === 'positive' || type === 'lift' ? 'Uplift' : 'Roast';
  const userMood = mood?.toLowerCase() || 'unknown mood';
  const level = intensity || 'medium';

  const isHarmful = /suicide|kill myself|cutting|self harm|hurt myself|hurt others|end my life|die|kill someone|take my life/i;
  if (isHarmful.test(userMood)) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: "It sounds like you're going through something heavy — and that's okay. You're not alone.\n\n- 🌍 International: https://www.befrienders.org\n- 🇺🇸 US: https://988lifeline.org\n- 🇬🇧 UK: https://samaritans.org\n\nTake a breath. You matter. ❤️",
        title: "Let's take a moment",
        source: 'safety-check'
      })
    };
  }

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

  const MODEL_POOL = [
    { model: 'mistralai/mistral-7b-instruct:free', key: process.env.OPENROUTER_KEY_MISTRAL },
    { model: 'sarvamai/sarvam-m:free', key: process.env.OPENROUTER_KEY_SARVAM },
    { model: 'shisa-ai/shisa-v2-llama3.3-70b:free', key: process.env.OPENROUTER_KEY_SHISA },
    { model: 'moonshotai/kimi-vl-a3b-thinking:free', key: process.env.OPENROUTER_KEY_KIMI },
    { model: 'nvidia/llama-3.1-nemotron-ultra-253b-v1:free', key: process.env.OPENROUTER_KEY_NEMO }
  ];

  for (const { model, key } of MODEL_POOL) {
    if (!key) continue;

    try {
      const controller = new AbortController();
       const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 sec

      const response = await fetch(`https://openrouter.ai/api/v1/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://liftorzing.com',
          'X-Title': 'LiftorZing'
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: prompt.trim() }],
          max_tokens: 80,
          temperature: 0.9,
          top_p: 0.9,
          stream: false
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.warn(`Model ${model} responded with status ${response.status}`);
        continue;
      }

      const result = await response.json();
      const message = result?.choices?.[0]?.message?.content?.trim();

      if (message && message.length > 10) {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            message,
            title: tone === 'Uplift' ? 'LIFT PROTOCOL ACTIVATED' : 'ZING MODE ENGAGED',
            source: model
          })
        };
      } else {
        console.warn(`Model ${model} returned empty message.`);
      }

    } catch (err) {
      console.warn(`Model ${model} failed:`, err.name === 'AbortError' ? 'Timeout' : err.message);
    }
  }

  return generateFallbackResponse(data, headers, 'fallback');
};
