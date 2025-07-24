# Lift & Zing Project

## Project Overview

This is an interactive web application that presents users with two doors - "Lift" (for uplifting messages) and "Zing" (for humorous roasts). Users select a door, go through a terminal-style animation sequence, fill out a form about their situation, and receive a personalized message based on their input and chosen intensity level.

## Project Structure

**Main Files:**
- `index.html` - Single-file application containing all functionality
- `404.html` - Custom error page with themed design and navigation back to main app

**Key Components:**
- HTML structure for door interface, forms, and message display
- CSS styling with terminal/cyberpunk aesthetic using JetBrains Mono and Orbitron fonts
- JavaScript for animations, form handling, message generation, and interactive features

## Key Features

### Core Functionality
1. **Dual Door Interface**: Clean split-screen with interactive door elements
2. **Terminal Animation**: Typing simulation with different sequences per door
3. **Flexible Input System**: Either/or choice between mood description OR photo upload
4. **Personalized Messages**: AI-like content generation based on keywords, photos, and intensity
5. **Interactive Elements**: Sharing functionality with social media integration

### Form Input System
- **Mandatory Fields**: Name and gender (required for all users)
- **Input Method Choice**: Users select either text description OR photo upload
- **Dynamic Validation**: Form requirements change based on selected input method
- **Photo Integration**: Uploaded photos enhance message personalization
- **Method Switching**: Users can toggle between input methods with data clearing

### Message Generation System
- **Keyword Detection**: Analyzes user input for themes (stress, sadness, work, family, dating, money, fitness, social, health, change, success)
- **Photo Enhancement**: Uploaded images add personalized elements to messages
- **Intensity Levels**: Mild, Medium, Intense - affects message tone and depth
- **Dual Pathways**: 
  - **Lift**: Supportive, motivational messages with photo compliments
  - **Zing**: Humorous roasts and comedic observations with photo-based humor

### Interactive Features
- **Message Sharing**: Copy to clipboard, Twitter sharing, download as text file
- **Image/Video Generation**: Create and download custom MP4 videos or static images
- **Responsive Design**: Optimized layout for both desktop and mobile devices
- **Error Handling**: Custom 404 page with navigation back to main interface

## Technical Architecture

### State Management
- `currentType`: Tracks whether user selected 'positive' (Lift) or 'funny' (Zing)
- `selectedIntensity`: User's chosen intensity level ('mild', 'medium', 'intense')
- `currentInputMethod`: Tracks whether user chose 'text' or 'photo' input

### Form Logic Flow
1. User selects input method (text description OR photo upload)
2. Form validation adapts to selected method
3. Form submission validates required fields based on method
4. Message generation includes appropriate data (text keywords OR photo file)

### Message Logic Flow
1. Form submission triggers `generateMessage()` with validation
2. Extracts user data (name, gender, keywords/photo, intensity)
3. Calls appropriate generator (`generatePositiveMessage()` or `generateFunnyMessage()`)
4. Keyword analysis or photo presence determines message theme
5. Intensity level adjusts tone and content depth
6. Dynamic message construction with personalized elements

### Animation System
- CSS keyframe animations for fade transitions
- JavaScript-controlled typing animation with customizable speed
- Input method toggle animations

### Media Export System
- **Video Priority**: MP4 format prioritized over WebM for better compatibility
- **Canvas Rendering**: Static images and animated video exports
- **Multiple Formats**: Social media optimized dimensions and layouts
- **Codec Fallbacks**: Multiple video codec support for cross-browser compatibility

## Design Notes

- **Minimalist Design**: Clean, sharp-cornered aesthetic with strong black/white contrast
- **Typography**: JetBrains Mono for body text, Orbitron for headings and door text
- **Responsive Layout**: Different door proportions and text sizes for desktop vs. mobile
- **Visual Hierarchy**: Clear distinction between UI sections with consistent spacing
- **Error Pages**: Themed 404 page maintains aesthetic continuity

## Content Strategy

### Lift Messages
- Stress relief and pressure management
- Emotional support for sadness/depression
- Energy restoration for fatigue
- Health and recovery encouragement
- Change and transition guidance
- Success celebration and validation
- Photo-based encouragement and beauty recognition

### Zing Messages
- Work and career frustrations
- Family dynamics and relationships
- Dating and romance mishaps
- Financial struggles
- Fitness and health goals
- Social interaction challenges
- Photo-based humor and playful roasting

Both message types scale from gentle/playful (mild) to intense/powerful (intense) based on user preference, with additional personalization when photos are uploaded.