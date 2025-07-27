const fetch = require('node-fetch');

// Simple local response generator for when AI models are unavailable
function generateLocalResponse(data) {
  const tone = data.type === 'positive' || data.type === 'lift' ? 'Uplift' : 'Roast';
  const displayName = data.name || 'Someone';
  const userMood = data.mood?.toLowerCase() || 'feeling something';
  
          const upliftResponses = [
          `🔥 ${displayName}, you're absolutely crushing it! Your energy is unstoppable and your vibe is immaculate. Every step you take is legendary and your greatness is undeniable. You're not just living your best life - you're creating it! Keep shining bright and remember: you're the upgrade everyone needs! ✨`,
          `🚀 ${displayName}, you're a force of nature! Your potential is limitless and your spirit is unbreakable. Every challenge you face makes you stronger, every obstacle you overcome makes you wiser. You're not just surviving - you're thriving! Keep going because the world needs your light! 💪`,
          `🌟 ${displayName}, you're absolutely electric! Your energy is contagious and your presence is magnetic. You have this incredible ability to turn ordinary moments into extraordinary memories. Your authenticity is your superpower and your kindness is your legacy. Keep being the amazing person you are! 💫`,
          `⚡ ${displayName}, you're a diamond in a world of cubic zirconia! Your shine is authentic, your worth is priceless, and your impact is immeasurable. You have this rare gift of making everyone around you feel seen and valued. Your journey is inspiring and your future is limitless! 🔥`,
          `💎 ${displayName}, you're the main character in your own epic story! Your resilience is legendary, your courage is inspiring, and your heart is pure gold. Every setback is just a setup for your comeback. You're not just making waves - you're creating tsunamis of positive change! ✨`
        ];
  
          const roastResponses = [
          `😅 ${displayName}, the AI is having a moment (probably intimidated by your excellence). Even when tech fails, you're still the main character! The servers are being dramatic because they can't handle your level of greatness. You're not just the plot - you're the entire series! 🎭`,
          `🎪 ${displayName}, the servers are being extra dramatic today (can't compute your legendary status). The AI is probably overthinking how to process someone as amazing as you. Even when technology has a meltdown, you're still the show everyone's watching! 🎯`,
          `⏰ ${displayName}, the AI is taking its sweet time (probably because it's trying to figure out how to handle your level of excellence). The servers are having a moment, but you're still fast-tracked to success! Even when tech is slow, you're still the main event! 🚀`,
          `🎭 ${displayName}, the AI is completely speechless (probably because you're too amazing for words). The servers are having technical difficulties trying to process your legendary energy. Even when responses fail, you're still the entire plot! 📖`,
          `🎪 ${displayName}, the AI is having a full-on existential crisis (can't handle your level of excellence). The servers are being dramatic because they're intimidated by your greatness. Even when technology breaks down, you're still the main event and the show must go on! 🎯`
        ];
  
  const responses = tone === 'Uplift' ? upliftResponses : roastResponses;
  return responses[Math.floor(Math.random() * responses.length)];
}

// Fallback responses with more engaging content
        function generateFallbackResponse(data, headers, errorType = 'fallback') {
          const tone = data.type === 'positive' || data.type === 'lift' ? 'Uplift' : 'Roast';
          const title = tone === 'Uplift' ? 'LIFT PROTOCOL ACTIVATED' : 'ZING MODE ENGAGED';
          const displayName = data.name || 'Someone';
          const userMood = data.mood?.toLowerCase() || 'feeling something';

          // Generate contextual fallback messages based on tone and mood
          const fallbackMessages = {
            rate_limit: tone === 'Uplift' 
              ? `🔥 ${displayName}, the AI servers are taking a coffee break, but your energy is unstoppable! Even when tech glitches, you're still absolutely crushing it. Try again in a moment - you've got this! 💪`
              : `😅 ${displayName}, the AI is having a moment (probably because it's intimidated by your greatness). Even when the servers are being dramatic, you're still the main character. Try again shortly! 🎭`,
            
            timeout: tone === 'Uplift'
              ? `⚡ ${displayName}, the connection is taking its sweet time, but your vibe is timeless! The servers are busy processing how awesome you are. Try again in a moment - you're worth the wait! ✨`
              : `⏰ ${displayName}, the AI is taking longer than expected (probably overthinking how to handle your legendary status). Even when tech is slow, you're still fast-tracked to greatness! Try again shortly! 🚀`,
            
            api_error: tone === 'Uplift'
              ? `🌟 ${displayName}, the AI service is having a moment, but you're having a movement! Even when things glitch, you're still the upgrade. Try again shortly - you're too powerful to be stopped! 💫`
              : `🎪 ${displayName}, the AI is having a technical difficulty (probably because it can't handle your level of excellence). Even when services are down, you're still up! Try again shortly! 🎯`,
            
            parse_error: tone === 'Uplift'
              ? `💎 ${displayName}, something went wrong with the response, but nothing went wrong with your vibe! Even when tech fails, you succeed. Give it another shot - you're bulletproof! 🛡️`
              : `🎭 ${displayName}, the response got confused (probably because it's trying to process your legendary energy). Even when parsing fails, you're still the main plot! Try again! 📖`,
            
            empty_response: tone === 'Uplift'
              ? `✨ ${displayName}, nothing came through from the AI, but everything amazing is coming through from you! Even when responses are empty, you're full of greatness. Try again - you're the content! 🌟`
              : `🎪 ${displayName}, the AI returned empty (probably because it's speechless at your excellence). Even when responses are void, you're the void-filler! Try again! 🎭`,
            
            fallback: tone === 'Uplift'
              ? `🚀 ${displayName}, even when things glitch, you're still the upgrade! The AI might be having a moment, but you're having a movement. Try again shortly - you're too legendary to be stopped! 💪`
              : `🎯 ${displayName}, the AI is being dramatic (probably because it can't handle your level of excellence). Even when services are down, you're still the main event! Try again shortly! 🎪`
          };

          // Add marketing hashtags to fallback messages
          const hashtags = tone === 'Uplift' 
            ? '\n\n💫 Generated by Lift or Zing™\n#LiftOrZing #PositiveVibes #Motivation #GoodVibes #LiftUp #SpreadJoy'
            : '\n\n🔥 Generated by Lift or Zing™\n#LiftOrZing #RoastMode #Funny #Viral #Trending #ZingLife';
          
          const enhancedMessage = fallbackMessages[errorType] || fallbackMessages.fallback + hashtags;

          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
              message: enhancedMessage,
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
Create a creative, short, emotionally expressive message for ${displayName}${gender ? ` (${gender})` : ''}.

Context: ${mood || 'unknown'} mood, ${level} intensity level.

${tone === 'Uplift' ? 
  'Style: Be vivid, powerful, emotionally uplifting — like a motivational quote or supportive affirmation. Use vibrant, encouraging language.' : 
  'Style: Be witty, ironic, clever, and lightly mocking. Tease playfully — avoid flattery or compliments. Do NOT be mean or offensive. No praise.'
}

Keep it concise, quotable, and suitable for virality.
Sign off with: "🔥 Generated by Lift or Zing™"

Write only the message, no instructions or labels.
`;

  const MODEL_POOL = [
    { model: 'mistralai/mistral-7b-instruct:free', key: process.env.OPENROUTER_KEY_MISTRAL },
    { model: 'sarvamai/sarvam-m:free', key: process.env.OPENROUTER_KEY_SARVAM },
    { model: 'shisa-ai/shisa-v2-llama3.3-70b:free', key: process.env.OPENROUTER_KEY_SHISA },
    { model: 'moonshotai/kimi-vl-a3b-thinking:free', key: process.env.OPENROUTER_KEY_KIMI },
    { model: 'nvidia/llama-3.1-nemotron-ultra-253b-v1:free', key: process.env.OPENROUTER_KEY_NEMO },
    { model: 'meta-llama/llama-3.1-8b-instruct:free', key: process.env.OPENROUTER_KEY_META },
    { model: 'google/gemini-flash-1.5:free', key: process.env.OPENROUTER_KEY_GEMINI },
    { model: 'anthropic/claude-3-haiku:free', key: process.env.OPENROUTER_KEY_ANTHROPIC },
    { model: 'openai/gpt-3.5-turbo:free', key: process.env.OPENROUTER_KEY_OPENAI }
  ];

  // Track rate limited models to avoid immediate retries
  const rateLimitedModels = new Set();
  
  for (const { model, key } of MODEL_POOL) {
    if (!key) continue;
    
    // Skip models that were recently rate limited
    if (rateLimitedModels.has(model)) {
      console.log(`Skipping recently rate limited model: ${model}`);
      continue;
    }

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
          max_tokens: 200,
          temperature: 0.9,
          top_p: 0.9,
          stream: false
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.warn(`Model ${model} responded with status ${response.status}`);
        if (response.status === 429) {
          console.warn(`Rate limit hit for model ${model}`);
          rateLimitedModels.add(model);
        }
        continue;
      }

      const result = await response.json();
      const message = result?.choices?.[0]?.message?.content?.trim();

      if (message && message.length > 10) {
        // Check if message already contains our branding
        const hasBranding = message.toLowerCase().includes('generated by lift or zing') || 
                           message.toLowerCase().includes('lift or zing');
        
        let enhancedMessage = message;
        
        // Only add branding if it's not already there
        if (!hasBranding) {
          const hashtags = tone === 'Uplift' 
            ? '\n\n💫 Generated by Lift or Zing™\n#LiftOrZing #PositiveVibes #Motivation #GoodVibes #LiftUp #SpreadJoy'
            : '\n\n🔥 Generated by Lift or Zing™\n#LiftOrZing #RoastMode #Funny #Viral #Trending #ZingLife';
          
          enhancedMessage = message + hashtags;
        }
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            message: enhancedMessage,
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

    // Try Hugging Face as backup if all OpenRouter models failed
  console.log('All OpenRouter models failed, trying Hugging Face...');
  
  const HUGGINGFACE_MODELS = [
    'microsoft/DialoGPT-medium',
    'gpt2',
    'distilgpt2'
  ];
  
  const huggingfaceKey = process.env.HUGGINGFACE_API_KEY;
  
  if (huggingfaceKey) {
    for (const model of HUGGINGFACE_MODELS) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 sec for HF
        
        const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${huggingfaceKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            inputs: prompt.trim(),
            parameters: {
              max_new_tokens: 150,
              temperature: 0.9,
              do_sample: true,
              return_full_text: false
            }
          }),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          console.warn(`Hugging Face model ${model} responded with status ${response.status}`);
          continue;
        }
        
        const result = await response.json();
        const message = result?.[0]?.generated_text?.trim();
        
        if (message && message.length > 10) {
          console.log(`Hugging Face model ${model} succeeded`);
          
          // Check if message already contains our branding
          const hasBranding = message.toLowerCase().includes('generated by lift or zing') || 
                             message.toLowerCase().includes('lift or zing');
          
          let enhancedMessage = message;
          
          // Only add branding if it's not already there
          if (!hasBranding) {
            const hashtags = tone === 'Uplift' 
              ? '\n\n💫 Generated by Lift or Zing™\n#LiftOrZing #PositiveVibes #Motivation #GoodVibes #LiftUp #SpreadJoy'
              : '\n\n🔥 Generated by Lift or Zing™\n#LiftOrZing #RoastMode #Funny #Viral #Trending #ZingLife';
            
            enhancedMessage = message + hashtags;
          }
          
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
              message: enhancedMessage,
              title: tone === 'Uplift' ? 'LIFT PROTOCOL ACTIVATED' : 'ZING MODE ENGAGED',
              source: `huggingface-${model}`
            })
          };
        } else {
          console.warn(`Hugging Face model ${model} returned empty message.`);
        }
        
      } catch (err) {
        console.warn(`Hugging Face model ${model} failed:`, err.name === 'AbortError' ? 'Timeout' : err.message);
      }
    }
  }
  
  // If all models failed, generate a local response instead of a generic fallback
  const localMessage = generateLocalResponse(data);
  
  // Add marketing hashtags to local fallback messages too
  const hashtags = tone === 'Uplift' 
    ? '\n\n💫 Generated by Lift or Zing™\n#LiftOrZing #PositiveVibes #Motivation #GoodVibes #LiftUp #SpreadJoy'
    : '\n\n🔥 Generated by Lift or Zing™\n#LiftOrZing #RoastMode #Funny #Viral #Trending #ZingLife';
  
  const enhancedLocalMessage = localMessage + hashtags;
  
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      message: enhancedLocalMessage,
      title: tone === 'Uplift' ? 'LIFT PROTOCOL ACTIVATED' : 'ZING MODE ENGAGED',
      source: 'local-fallback'
    })
  };
};
