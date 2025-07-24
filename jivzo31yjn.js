
const fetch = require('node-fetch');

exports.handler = async (event) => {
  try {
    const { name, gender, mood, type, intensity } = JSON.parse(event.body || '{}');

    const tone = type === 'lift' ? 'Uplift' : 'Roast';
    const userMood = mood || 'no mood provided';
    const displayName = name || 'Someone';
    const level = intensity || 'medium';

    const flavors = ['Make it clever, short, and entertaining — avoid clichés.', 'Use a light poetic tone — keep it uplifting and expressive.', 'Use casual Gen-Z humor, no emojis, just vibe.', 'Be bold, confident, and hype them up or roast them hard — respectfully.', 'Make it sound like a fortune teller speaking in riddles, but funny.'];
    const flavor = flavors[Math.floor(Math.random() * flavors.length)];

    const prompt = `
Your task is to write a short, creative message for a personality generator app.

The user’s name is: ${displayName}
Tone: ${tone}
Mood description: "${userMood}"
Intensity: ${level}

${flavor}
`;

    const response = await fetch("https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.1", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HUGGINGFACE_API_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          temperature: 0.9,
          max_new_tokens: 100
        }
      })
    });

    const data = await response.json();
    const result = Array.isArray(data) && data[0]?.generated_text
      ? data[0].generated_text.trim()
      : data?.generated_text || "Oops, nothing came through.";

    return {
      statusCode: 200,
      body: JSON.stringify({ result })
    };
  } catch (err) {
    console.error("Error in generate function:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ result: "Something went wrong. Please try again later." })
    };
  }
};
