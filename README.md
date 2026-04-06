# AI Chatbot with Contextual Memory

This is a full-stack AI chatbot built with Node.js, Express, MongoDB, and React. It features persistent conversation memory and contextual AI responses using OpenAI's GPT models.

## Features
- **Contextual Memory**: Remembers past interactions within a session (last 10 messages).
- **Secure Authentication**: JWT-based login and registration.
- **Premium UI**: Modern, glassmorphism-inspired chat interface.
- **Scalable Backend**: Express.js server with Mongoose ODM.

## Setup Instructions

### Backend
1. Navigate to `backend/`.
2. Run `npm install`.
3. Create a `.env` file with:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   OPENAI_API_KEY=your_openai_api_key
   ```
4. Start the server: `npm run dev` (or `node server.js`).

### Frontend
1. Navigate to `frontend/`.
2. Run `npm install`.
3. Start the development server: `npm run dev`.

## Technologies Used
- **Frontend**: React, Vite, Vanilla CSS.
- **Backend**: Node.js, Express, MongoDB.
- **AI**: OpenAI API.
- **Auth**: JWT, bcryptjs.
