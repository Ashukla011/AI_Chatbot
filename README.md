# AI Chatbot with Contextual Memory

This is a full-stack AI chatbot built with Node.js, Express, MongoDB, and React. It provides persistent conversation memory and contextual AI responses using Google's Gemini API.

## Features
- **Contextual Memory**: Remembers recent history and maintains chat context across messages.
- **Authentication**: JWT-based login and registration with secure password hashing.
- **Image Upload**: Send images along with messages for multimodal AI context.
- **Voice Input**: Speak your message using browser speech recognition.
- **Copy AI Responses**: Copy assistant replies to clipboard with one click.
- **Improved Error Feedback**: Better messages for quota issues, invalid requests, and network problems.
- **Modern UI**: Glassmorphism-inspired chat experience with message preview and upload controls.

## Setup Instructions

### Backend
1. Navigate to `backend/`.
2. Run `npm install`.
3. Create a `.env` file with:
   ```env
   PORT=5001
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   GEMINI_API_KEY=your_gemini_api_key
   EXPIRES_IN=7d
   ```
4. Start the server: `npm start` or `node server.js`.

### Frontend
1. Navigate to `frontend/`.
2. Run `npm install`.
3. Create a `.env` file if needed with:
   ```env
   VITE_API_URL=http://localhost:5001
   ```
4. Start the frontend: `npm run dev`.

## Usage
1. Register or log in with a username and password.
2. Use the chat input to send text messages.
3. Click the camera icon to upload an image.
4. Use the voice button to dictate your message.
5. Click the clipboard icon to copy AI responses.

## Technologies Used
- **Frontend**: React, Vite, Vanilla CSS.
- **Backend**: Node.js, Express, Mongoose, MongoDB.
- **AI**: Google Gemini API via `@google/generative-ai`.
- **Auth**: JWT, bcryptjs.


