const fetch = require('node-fetch');

exports.handler = async (event) => {
  const { name, gender, mood, type, intensity } = JSON.parse(event.body || '{}');

  const input = `${name || ''} ${gender || ''} ${mood || ''} ${type || ''} ${intensity || ''}`;
  const API_URL = "https://api-inference.huggingface.co/models/gpt2";
  const API_TOKEN = process.env.HUGGINGFACE_API_TOKEN;

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${API_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ inputs: input })
  });

  const data = await response.json();
  const generated = data?.[0]?.generated_text || "Sorry, nothing came through.";

  return {
    statusCode: 200,
    body: JSON.stringify({ result: generated })
  };
};
