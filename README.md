# LiftorZing Netlify Deployment

This project is configured for deployment on Netlify with serverless functions support.

## Project Structure

- `index.html` - Main application file
- `netlify/functions/` - Directory containing serverless functions
- `netlify.toml` - Netlify configuration file

## Netlify Deployment

### Manual Setup

1. Log in to your Netlify account
2. Create a new site from Git
3. Connect to your GitHub repository: `https://github.com/edbns/liftorzing.git`
4. Configure build settings:
   - Build command: (Leave empty - static site)
   - Publish directory: `.`
   - Functions directory: `netlify/functions`
5. Deploy the site
6. Go to Site settings > Environment variables
7. Add the Hugging Face API key:
   - Key: `HUGGINGFACE_API_TOKEN`
   - Value: (Your Hugging Face API Token)

### Automated Setup (using script)

1. Make sure you have Node.js installed
2. Install Netlify CLI: `npm install -g netlify-cli`
3. Log in to Netlify CLI: `netlify login`
4. Run the setup script: `node netlify-setup.js`
5. Complete the GitHub connection in the Netlify dashboard
6. Set the actual Hugging Face API token in Environment variables (Key: `HUGGINGFACE_API_TOKEN`)

## Serverless Function Usage

The project includes a serverless function for generating personalized messages:

- Endpoint: `/.netlify/functions/generate`
- Method: `POST`
- Body:
  ```json
  {
    "name": "User name",
    "gender": "male/female/prefer_not_to_say",
    "mood": "Description of user's mood",
    "intensity": "mild/medium/intense",
    "type": "positive/funny",
    "hasPhoto": false
  }
  ```

The function automatically calls the Hugging Face API and falls back to local message generation if the service is unavailable.

## Local Development

1. Install dependencies: `npm install netlify-cli -g`
2. Start local development server: `netlify dev`
3. The site will be available at: `http://localhost:8888`