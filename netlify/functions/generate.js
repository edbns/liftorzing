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
        })
      };
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) throw new Error("Missing OpenRouter API key");

    const models = ['mistralai/mistral-7b-instruct:free', 'gryphe/mythomax-l2-13b:free'];
    const model = models[Math.floor(Math.random() * models.length)];

    const flavors = [
      "Make it clever, short, and entertaining — avoid clichés.",
      "Use poetic tone — expressive but keep it under 4 lines.",
      "Use casual Gen-Z humor, no emojis, just pure vibe.",
      "Be bold, confident, hype them up or roast them — respectfully.",
      "Make it feel like a wise but weird oracle’s riddle — funny and short."
    ];
    const flavor = flavors[Math.floor(Math.random() * flavors.length)];

    const tone = type === 'positive' ? 'Uplift' : 'Roast';
    const prompt = `
You are an AI writing for a fun personality generator app called LiftorZing.

Generate a message for:
Name: ${name}${gender ? ` (${gender})` : ''}
Tone: ${tone}
Mood: "${mood}"
Intensity: ${intensity}

Guidelines:
- ${flavor}
- No more than 4 short lines.
- Keep it shareable and clever.
- End clearly.

Now write the message.
`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt }],
        max_tokens: 120,
        temperature: 0.85
      })
    });

    const result = await response.json();
    const message = result?.choices?.[0]?.message?.content?.trim();

    if (!message) throw new Error("No message generated");

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message,
        title: type === 'positive' ? 'LIFT PROTOCOL ACTIVATED' : 'ZING MODE ENGAGED',
        source: model
      })
    };
  } catch (err) {
    console.error("Error:", err.message);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: `Hey there, even when things glitch, you're still legendary. Try again shortly.`,
        title: "LIFT PROTOCOL ACTIVATED",
        source: "fallback"
      })
    };
  }
};
