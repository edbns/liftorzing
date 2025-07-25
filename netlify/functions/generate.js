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
      return {
        statusCode: 200,
        headers,
        body: ''
      };
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

    const userMood = (mood || '').toLowerCase();
    const displayName = name || 'Someone';
    const tone = type === 'positive' || type === 'lift' ? 'Uplift' : 'Roast';
    const level = intensity || 'medium';

    // 🛡️ Harmful input detection
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

    // 🔐 OpenRouter API key
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      console.log('Missing OpenRouter API key');
      return generateFallbackResponse(data, headers);
    }

    // 🎲 Randomly pick a model
    const models = ['mistralai/mistral-7b-instruct', 'gryphe/mythomax-l2'];
    const selectedModel = models[Math.floor(Math.random() * models.length)];

    // 🪄 Prompt flavors
    const flavors = [
      "Make it clever, short, and entertaining — avoid clichés.",
      "Use a light poetic tone — keep it uplifting and expressive.",
      "Use casual Gen-Z humor, no emojis, just vibe.",
      "Be bold, confident, and hype them up or roast them hard — respectfully.",
      "Make it sound like a fortune teller speaking in riddles, but funny."
    ];
    const flavor = flavors[Math.floor(Math.random() * flavors.length)];

    const prompt = `Your task is to write a short, creative message for a personality generator app.\n\nUser's name: ${displayName}${gender ? ` (${gender})` : ''}\nTone: ${tone}\nMood: "${mood || 'unknown'}"\nIntensity: ${level}\n\n${flavor}`;

    // 🌐 Call OpenRouter
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: [
          { role: "system", content: "You are a playful, thoughtful assistant that creates brief but expressive messages based on mood input. Keep it under 3 sentences." },
          { role: "user", content: prompt }
        ],
        temperature: 0.95,
        max_tokens: 160
      })
    });

    if (!response.ok) {
      console.log(`OpenRouter API error: ${response.status}`);
      return generateFallbackResponse(data, headers);
    }

    const result = await response.json();
    const message = result?.choices?.[0]?.message?.content?.trim() || "Oops, nothing came through.";

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message,
        title: tone === 'Uplift' ? 'LIFT PROTOCOL ACTIVATED' : 'ZING MODE ENGAGED',
        source: 'openrouter'
      })
    };
  } catch (err) {
    console.error("Unhandled error:", err);
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

// 💥 Basic fallback in case OpenRouter fails
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
