// Netlify function to generate AI-powered messages for LiftorZing
exports.handler = async function(event, context) {
  try {
    // Add CORS headers
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Content-Type': 'application/json'
    };

    // Handle preflight requests
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers,
        body: ''
      };
    }

    // Check method
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ error: 'Method Not Allowed' })
      };
    }

    // Parse the request body
    const data = JSON.parse(event.body);
    
    // Validate form data structure
    if (!data.name || !data.type || !data.intensity) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required parameters: name, type, and intensity' })
      };
    }

    // Get Hugging Face API token from environment variable
    const apiToken = process.env.HUGGINGFACE_API_TOKEN;
    if (!apiToken) {
      console.log('API token missing, using fallback message generation');
      return generateFallbackResponse(data, headers);
    }

    // Generate a personalized message based on the form data
    const prompt = generatePrompt(data);
    const model = data.type === 'positive' ? 'microsoft/DialoGPT-medium' : 'microsoft/DialoGPT-medium';

    // Make request to Hugging Face API
    let response;
    try {
      response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify({ 
          inputs: prompt,
          parameters: {
            max_length: 200,
            temperature: 0.8,
            do_sample: true
          },
          options: {
            wait_for_model: true
          }
        })
      });

      if (!response.ok) {
        console.log(`Hugging Face API error: ${response.status}`);
        return generateFallbackResponse(data, headers);
      }
    } catch (fetchError) {
      console.log('Fetch error:', fetchError.message);
      return generateFallbackResponse(data, headers);
    }

    try {
      const result = await response.json();
      let generatedText = '';
      
      if (Array.isArray(result) && result[0] && result[0].generated_text) {
        generatedText = result[0].generated_text;
      } else if (result.generated_text) {
        generatedText = result.generated_text;
      } else {
        console.log('Unexpected response format:', JSON.stringify(result));
        return generateFallbackResponse(data, headers);
      }
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          message: generatedText,
          title: data.type === 'positive' ? 'LIFT PROTOCOL ACTIVATED' : 'ZING MODE ENGAGED',
          source: 'ai'
        })
      };
    } catch (parseError) {
      console.log('JSON parse error:', parseError.message);
      return generateFallbackResponse(data, headers);
    }
    
  } catch (error) {
    console.log('General error:', error.message);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: 'Internal Server Error', details: error.message })
    };
  }
};

// Helper function to generate prompts based on form data
function generatePrompt(data) {
  const { name, type, intensity, mood, gender } = data;
  
  if (type === 'positive') {
    return `Write an uplifting, motivational message for ${name}${gender ? ` (${gender})` : ''} who is feeling: ${mood || 'needs encouragement'}. Make it ${intensity} in tone and personally encouraging.`;
  } else {
    return `Write a humorous, playful roast for ${name}${gender ? ` (${gender})` : ''} about: ${mood || 'general life situations'}. Make it ${intensity} but still friendly and fun.`;
  }
}

// Generate fallback response with consistent structure
function generateFallbackResponse(data, headers) {
  const fallbackMessage = generateFallbackMessage(data);
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

// Fallback message generator when AI service is unavailable
function generateFallbackMessage(data) {
  const { name, type, intensity, mood } = data;
  
  const liftMessages = {
    mild: [
      `Hey ${name}, you're doing better than you think! Every small step forward counts, and today is another opportunity to shine.`,
      `${name}, remember that challenges are just opportunities in disguise. You've got the strength to handle whatever comes your way.`,
      `Keep going, ${name}! Your journey is unique and valuable, and you're making progress even when it doesn't feel like it.`
    ],
    medium: [
      `${name}, you are absolutely capable of amazing things! Your resilience shines through even in tough moments, and that's your superpower.`,
      `Listen up, ${name} - you've overcome challenges before, and you'll conquer this one too. Your strength is inspiring!`,
      `${name}, the world needs exactly what you bring to it. Your unique perspective and talents make a real difference!`
    ],
    intense: [
      `${name}, you are a FORCE OF NATURE! Every obstacle you face is just the universe preparing you for something incredible!`,
      `ATTENTION ${name.toUpperCase()}: You are unstoppable! Your potential is limitless, and today is the day you start claiming your greatness!`,
      `${name}, you didn't come this far just to come this far - you're destined for extraordinary things! Unleash your power!`
    ]
  };
  
  const zingMessages = {
    mild: [
      `${name}, your life is like a sitcom where you're both the main character and the comic relief - and somehow, it's working!`,
      `Hey ${name}, you're handling life with the grace of someone who definitely didn't read the instruction manual first!`,
      `${name}, your approach to problems is... creative. It's like watching someone solve a puzzle with a hammer!`
    ],
    medium: [
      `${name}, your life decisions have more plot twists than a soap opera! At least you're never boring!`,
      `Well ${name}, you've turned everyday situations into an art form - specifically, abstract art that nobody quite understands!`,
      `${name}, you're like a GPS that confidently says "recalculating" every five minutes but somehow still gets there eventually!`
    ],
    intense: [
      `${name}, your life is so chaotic it could be a Netflix series! The reviews would be mixed, but the drama would be unmatched!`,
      `Listen ${name}, you've managed to turn simple tasks into epic adventures - it's like you have a superpower for making things complicated!`,
      `${name}, your decision-making process is fascinating to observe from a safe distance. It's like watching someone play chess with checkers pieces!`
    ]
  };
  
  const messages = type === 'positive' ? liftMessages : zingMessages;
  const intensityMessages = messages[intensity] || messages.mild;
  
  return intensityMessages[Math.floor(Math.random() * intensityMessages.length)];
}