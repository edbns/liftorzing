const fetch = require('node-fetch');

exports.handler = async function (event) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    const data = JSON.parse(event.body || '{}');
    const { name = 'Friend', gender, mood = '', type = 'positive', intensity = 'medium' } = data;

    const isHarmful = /suicide|kill myself|cutting|self harm|hurt myself|hurt others|end my life|die|kill someone|take my life/i;
    if (isHarmful.test(mood.toLowerCase())) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          message: `It sounds like you're going through something heavy — and that's okay. You're not alone. If you're in crisis, please consider reaching out:\n\n🌍 International: https://www.befrienders.org\n🇺🇸 US: https://988lifeline.org\n🇬🇧 UK: https://samaritans.org\n\nTake a breath. You matter. ❤️`,
          title: "LET’S TAKE A MOMENT",
          source: 'safety-check'
        }),
      };
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) throw new Error('Missing OpenRouter API key');

    const model = 'mistralai/mistral-7b-instruct:free';
    const tone = type === 'positive' ? 'uplifting' : 'roast';

    const systemMessage =
      type === 'positive'
        ? "You're a motivational coach. Create a personal, emotionally supportive message in under 4 lines. Make it feel sincere and inspiring, not generic."
        : "You're a roast master with a sharp tongue. Write a creative, disrespectfully respectful roast. Keep it funny, 2–4 lines max, clever, and postable on social media. Think mean tweet meets stand-up comedy.";

    const prompt = `${name}${gender ? ` (${gender})` : ''} is feeling: "${mood}". Craft a personalized ${tone} message. Intensity: ${intensity}.`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: prompt },
        ],
        temperature: 0.9,
        max_tokens: 160,
      }),
    });

    const result = await response.json();
    let message = result?.choices?.[0]?.message?.content?.trim();

    if (!message || message.length < 10) {
      message = `Hey ${name}, even when things glitch, you're still iconic. Try again soon.`;
    }

    const finalMessage = message.split('\n').slice(0, 4).join('\n');

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: finalMessage,
        title: type === 'positive' ? 'LIFT PROTOCOL ACTIVATED' : 'ZING MODE ENGAGED',
        source: model,
      }),
    };
  } catch (error) {
    console.error('Error in generate.js:', error.message);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: `Hey there, even when things glitch, you're still legendary. Try again shortly.`,
        title: 'LIFT PROTOCOL ACTIVATED',
        source: 'fallback',
      }),
    };
  }
};
