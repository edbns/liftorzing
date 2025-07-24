
const fetch = require('node-fetch');

exports.handler = async (event) => {
  try {
    const { name, gender, mood, type, intensity } = JSON.parse(event.body || '{}');

    const tone = type === 'lift' ? 'Uplift' : 'Roast';
    const userMood = mood || 'no mood provided';
    const displayName = name || 'Someone';
    const level = intensity || 'medium';

    const prompt = `
Your task is to write a short, punchy, and creative message for a personality generator app.

The user’s name is: ${displayName}
Tone: ${tone}
Mood description: "${userMood}"
Intensity: ${level}

Write one sentence that is ${
      tone === 'Roast'
        ? 'funny, edgy, and playful — but clean. Avoid generic advice.'
        : 'motivational, personal, and sincere. Avoid clichés.'
    }
`;

    const response = await fetch("https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.1", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HUGGINGFACE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs: prompt }),
    });

    const data = await response.json();
    const result = Array.isArray(data) && data[0]?.generated_text
      ? data[0].generated_text.trim()
      : data?.generated_text || "Oops, nothing came through.";

    return {
      statusCode: 200,
      body: JSON.stringify({ result }),
    };
  } catch (err) {
    console.error("Error in generate function:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ result: "Something went wrong. Please try again later." }),
    };
  }
};
