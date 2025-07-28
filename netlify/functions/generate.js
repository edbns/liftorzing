const fetch = require('node-fetch');

// Simple local response generator for when AI models are unavailable
function generateLocalResponse(data) {
  const tone = data.type === 'positive' || data.type === 'lift' ? 'Uplift' : 'Roast';
  const displayName = data.name || 'Someone';
  const userMood = data.mood?.toLowerCase() || 'feeling something';

  const upliftResponses = [
    `🔥 ${displayName}, you're absolutely dominating the game with your incredible flair! Your unstoppable energy lights up every room, and your passion is infectious—keep blazing that trail with confidence! ✨ #RadiantStar`,
    `🚀 ${displayName}, you're a cosmic powerhouse with limitless potential! Challenges bow to your strength, and your resilience inspires everyone—keep soaring to new heights with that unstoppable spirit! 💪 #SkyHigh`,
    `🌟 ${displayName}, you're a radiant supernova bursting with brilliance! Turning every ordinary day into a masterpiece with your magical touch and infectious positivity—keep being the light we all need! 💫 #ShineOn`,
    `⚡ ${displayName}, you're a rare gem in a sea of dull stones, shining brighter every day! Your brilliance outshines them all, and your impact leaves a lasting mark—keep glowing with pride! 🔥 #DiamondVibes`,
    `💎 ${displayName}, you're the hero of your own epic saga with a story for the ages! Every step forward builds your legendary legacy, and your courage is truly inspiring—keep writing your triumph! ✨ #EpicJourney`,
    `🌈 ${displayName}, you're a vibrant force of nature spreading joy everywhere! Your creativity knows no bounds, lifting spirits with every move—keep painting the world with your colors! 🎨 #RainbowSoul`,
    `🌞 ${displayName}, you're a beacon of warmth and positivity in every crowd! Your infectious smile brightens the darkest days—keep spreading that sunshine! ☀️ #GoldenHeart`,
    `🌿 ${displayName}, you're a thriving oasis in a desert of doubt! Your growth and grace inspire us all—keep flourishing with that natural charm! 🌺 #NatureKing`,
    `🎯 ${displayName}, you're hitting every target with precision and style! Your focus and determination are unmatched—keep aiming for the stars! ⭐ #BullseyeBoss`,
    `🎶 ${displayName}, you're the melody that lifts every soul! Your rhythm and harmony bring joy to all—keep singing your song loud and proud! 🎵 #SoulTunes`,
    `🏆 ${displayName}, you're a champion in every sense! Your victories, big and small, inspire us—keep claiming your well-deserved glory! 🥇 #VictoryVibe`,
    `🌠 ${displayName}, you're a shooting star lighting up the night sky! Your dreams and drive are out of this world—keep reaching for the cosmos! ✨ #StellarSpirit`,
    `💡 ${displayName}, you're a genius sparking brilliance everywhere! Your ideas light the way for others—keep illuminating the path ahead! 🌟 #BrightMind`,
    `🌊 ${displayName}, you're a tidal wave of talent and tenacity! Your strength carries you over every obstacle—keep riding that wave to success! 🌴 #OceanPower`,
    `🏰 ${displayName}, you're a fortress of strength and wisdom! Your resilience builds an empire of inspiration—keep ruling with grace! 👑 #RoyalStrength`,
    `🍃 ${displayName}, you're a breath of fresh air in a stale world! Your unique spirit refreshes us all—keep blowing us away with your vibe! 🌬️ #FreshSoul`,
    `🔮 ${displayName}, you're a visionary with a magical touch! Your foresight and creativity shape the future—keep weaving your destiny! ✨ #FutureWizard`,
    `🎉 ${displayName}, you're the life of every celebration! Your joy and energy turn moments into memories—keep the party going strong! 🎈 #PartyLegend`,
    `🌹 ${displayName}, you're a rose blooming in the toughest soil! Your beauty and strength are undeniable—keep growing with elegance! 🌷 #BlossomQueen`,
    `⚙️ ${displayName}, you're the engine driving dreams to reality! Your hard work powers us all—keep the momentum rolling forward! 🚂 #Powerhouse`
  ];

  const roastResponses = [
    `😅 ${displayName}, the AI crashed trying to keep up with your wild, untamed energy—guess you're too much for even tech to handle, you glorious tornado! 🎭 #ChaosKing`,
    `🎪 ${displayName}, the servers staged a full-blown revolt after your dramatic entrance—world-class chaos, my friend, even the circuits can't cope! 🎯 #DramaLord`,
    `⏰ ${displayName}, even the AI needed a triple espresso after your whirlwind vibe hit—give it a moment to recover, you unstoppable legend! 🚀 #NapNeeded`,
    `🎭 ${displayName}, you froze the models with your over-the-top flair and stole the spotlight—try again, you show-stealing maestro of madness! 📖 #SceneStealer`,
    `🎪 ${displayName}, the AI short-circuited from your dazzling antics and larger-than-life personality—pure star power overload, you dazzling diva! 🎯 #TechBuster`,
    `🤡 ${displayName}, the system threw a tantrum trying to process your eccentric brilliance—take a bow, you circus ringmaster of epic proportions! 🎪 #WildCard`,
    `😜 ${displayName}, the AI's gears ground to a halt under your quirky chaos—give it a breather, you unpredictable prankster! 🎉 #TricksterKing`,
    `🎢 ${displayName}, the servers spun out trying to follow your rollercoaster energy—slow down, you wild thrill-seeker! 🎡 #RideMaster`,
    `🎬 ${displayName}, you derailed the AI with your blockbuster drama—cut the scene, you overacting superstar! 🎥 #DramaQueen`,
    `💥 ${displayName}, the system exploded from your explosive charisma—tone it down, you fireworks fanatic! 🎆 #BlastBoss`,
    `🎸 ${displayName}, the AI rocked out too hard trying to match your vibe—take a break, you heavy metal hurricane! 🎤 #RockRebel`,
    `🌋 ${displayName}, you erupted with so much flair the servers melted—cool off, you volcanic virtuoso! 🔥 #LavaLord`,
    `🎤 ${displayName}, the AI choked on your mic-dropping presence—step back, you rap battle riot! 🎧 #MicDropper`,
    `🏜️ ${displayName}, you turned the system into a desert with your scorching wit—hydrate it, you sandstorm sage! 🌵 #DesertDiva`,
    `🌀 ${displayName}, your whirlwind personality spun the AI into a tizzy—settle down, you tornado titan! 🌪️ #StormKing`,
    `🎰 ${displayName}, the servers hit jackpot overload from your wild bets—cash out, you gambling genius! 💰 #RiskTaker`,
    `🎩 ${displayName}, you magicked the AI into a hat with your tricks—reveal the rabbit, you illusionist icon! 🐰 #MagicMaster`,
    `🎮 ${displayName}, you glitched the system with your gaming-level antics—pause the game, you controller chaos! 🎯 #GameOverlord`,
    `🍔 ${displayName}, the AI got indigestion from your spicy attitude—take a bite break, you flavor fiend! 🌶️ #SpiceKing`,
    `🚗 ${displayName}, you sped through the system like a racecar rebel—hit the brakes, you speedway star! 🏎️ #RaceRogue`
  ];

  const responses = tone === 'Uplift' ? upliftResponses : roastResponses;
  return responses[Math.floor(Math.random() * responses.length)];
}

// Fallback responses if something fails
function generateFallbackResponse(data, headers, errorType = 'fallback') {
  const tone = data.type === 'positive' || data.type === 'lift' ? 'Uplift' : 'Roast';
  const title = tone === 'Uplift' ? 'LIFT PROTOCOL ACTIVATED' : 'ZING MODE ENGAGED';
  const displayName = data.name || 'Someone';

  const fallbackMessages = {
    timeout: `${displayName}, the connection is slow. Try again — the world needs your vibe! #Connection #Vibes #TryAgain`,
    rate_limit: `${displayName}, too hot to handle! AI servers are rate-limited. Try again shortly. #TooHot #RateLimit #Iconic`,
    api_error: `${displayName}, the AI glitched — you're just too iconic. Try again in a moment. #Glitch #Iconic #TryAgain`,
    parse_error: `Hmm... couldn't understand the response. You're still legendary though, ${displayName}. #Legendary #Confusing #StillIconic`,
    empty_response: `Oops! No message came through. Must be your vibe breaking the system. #VibeCheck #SystemError #Iconic`,
    fallback: `Even when tech fails, ${displayName}, you're the whole show. Try again! #TechFail #Iconic #TryAgain`
  };

  const message = fallbackMessages[errorType] || fallbackMessages.fallback;

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      message,
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
  } catch (err) {
    return generateFallbackResponse({ type: 'funny' }, headers, 'parse_error');
  }

  const { name, gender, mood, type, intensity } = data;
  const displayName = name || 'Someone';
  const tone = type === 'positive' || type === 'lift' ? 'Uplift' : 'Roast';
  const userMood = mood?.toLowerCase() || 'unknown mood';
  const level = intensity || 'intense'; // Default to intense for maximum impact

  const isHarmful = /suicide|kill myself|cutting|self harm|hurt myself|hurt others|end my life|die|kill someone|take my life/i;
  if (isHarmful.test(userMood)) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: `It sounds like you're going through something heavy — and that's okay.\n\n🌍 https://www.befrienders.org\n🇺🇸 https://988lifeline.org\n🇬🇧 https://samaritans.org\n\nTake a breath. You matter. ❤️`,
        title: "Let's take a moment",
        source: 'safety-check'
      })
    };
  }

  const prompt = `
Create a creative, short, emotionally expressive message for ${displayName}${gender ? ` (${gender})` : ''}.
Context: ${mood || 'unknown'} mood, ${level} intensity level.
${tone === 'Uplift'
    ? 'Style: powerful, vivid, affirming, encouraging — like a motivational quote. Include 3-5 relevant hashtags at the end.'
    : 'Style: witty, ironic, clever, teasing — roast playfully without compliments or flattery. Include 3-5 relevant hashtags at the end.'
}
End with: "🔥 Generated by Lift or Zing™"
Write only the message, no instructions.
`;

  const MODEL_POOL = [
    { model: 'mistralai/mistral-7b-instruct:free', key: process.env.OPENROUTER_KEY_MISTRAL },
    { model: 'sarvamai/sarvam-m:free', key: process.env.OPENROUTER_KEY_SARVAM },
    { model: 'shisa-ai/shisa-v2-llama3.3-70b:free', key: process.env.OPENROUTER_KEY_SHISA },
    { model: 'moonshotai/kimi-vl-a3b-thinking:free', key: process.env.OPENROUTER_KEY_KIMI },
    { model: 'nvidia/llama-3.1-nemotron-ultra-253b-v1:free', key: process.env.OPENROUTER_KEY_NEMO }
  ];

  const rateLimited = new Set();

  for (const { model, key } of MODEL_POOL) {
    if (!key || rateLimited.has(model)) continue;

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
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
          max_tokens: 400,
          temperature: 0.9
        }),
        signal: controller.signal
      });

      clearTimeout(timeout);

      if (!res.ok) {
        if (res.status === 429) rateLimited.add(model);
        continue;
      }

      const json = await res.json();
      const message = json?.choices?.[0]?.message?.content?.trim();

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
      }

    } catch (err) {
      console.warn(`${model} error:`, err.name === 'AbortError' ? 'Timeout' : err.message);
    }
  }

  // Hugging Face fallback
  const hfKey = process.env.HUGGINGFACE_API_KEY;
  const hfModels = ['gpt2', 'distilgpt2'];

  if (hfKey) {
    for (const model of hfModels) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);

        const res = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${hfKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ inputs: prompt.trim(), parameters: { max_new_tokens: 300 } }),
          signal: controller.signal
        });

        clearTimeout(timeout);

        if (!res.ok) continue;

        const json = await res.json();
        const message = json?.[0]?.generated_text?.trim();

        if (message && message.length > 10) {
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
              message,
              title: tone === 'Uplift' ? 'LIFT PROTOCOL ACTIVATED' : 'ZING MODE ENGAGED',
              source: `huggingface-${model}`
            })
          };
        }

      } catch (err) {
        console.warn(`HuggingFace ${model} error:`, err.message);
      }
    }
  }

  // Final local fallback
  const localMessage = generateLocalResponse(data);

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      message: localMessage,
      title: tone === 'Uplift' ? 'LIFT PROTOCOL ACTIVATED' : 'ZING MODE ENGAGED',
      source: 'local-fallback'
    })
  };
};
