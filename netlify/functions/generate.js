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
    const tone = type === 'positive' ? 'uplift' : 'roast';

    const systemMessage =
      type === 'positive'
        ? "You're a motivational life coach. Write a personal, emotionally supportive message in under 4 lines. Make it real, not generic."
        : "You're a savage roast bot. Write brutally honest, clever, and funny insults. Go hard but never cruel. The tone is comedic, disrespectfully respectful, and built for viral social media posts. Don’t sugarcoat it.";

    const prompt = `${name}${gender ? ` (${gender})` : ''} said: "${mood}". Craft a personalized ${tone} message. Intensity: ${intensity}.`;

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

    // fallback if message is empty
    if (!message || message.length < 10) {
      message = `Hey ${name}, even when things glitch, you're still iconic. Try again shortly.`;
    }

    // ✅ Trim to max 4 lines for export
    const finalMessage = message.split('\n').slice(0, 4).join('\n').trim();

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
