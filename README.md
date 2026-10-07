# CARWISE — Premium MERN AI Car Platform
<img width="1920" height="1080" alt="Image" src="https://github.com/user-attachments/assets/a44f1a39-397a-4307-bc81-da9687465170" />

# 🚗 CARWISE

### Find the Right Car, Not Just a Car.

CARWISE is a modern full-stack automotive platform that helps users discover, compare, and choose cars with AI-powered recommendations, smart comparison tools, EV insights, finance utilities, and personalized suggestions.

## 🌐 Live Demo

**Website:** https://carwise-ai-car-recommandation.vercel.app/

**Backend:** https://carwise-ai-car-recommandation.onrender.com

**GitHub:** https://github.com/deep670/CARWISE_AI-car-recommandation

## ✨ Features

- 🚘 Car discovery and detailed specifications
- 🤖 AI-powered car recommendations
- 💬 AI Car Advisor
- ⚖️ Smart car comparison
- 💰 EMI calculator and finance tools
- ⚡ EV cars and EV analysis
- 💎 Premium and luxury car collection
- ❤️ Wishlist and personalized dashboard
- 🔐 JWT-based user authentication
- 🔎 Search and advanced filtering
- 📰 Car reviews and automotive news
- 🚀 Upcoming cars
- 📱 Responsive premium automotive UI

## 🤖 AI Features

CARWISE can help users find cars based on natural-language queries such as:

- Best SUV under ₹15 lakh
- Best family car
- Best automatic car
- Best EV for city driving
- Which car should I buy?
- Which variant should I choose?
- Compare two or more cars

The recommendation flow is designed around:

```text
User Query
   ↓
Requirements
   ↓
Car Filtering
   ↓
Recommendation Scoring
   ↓
AI Explanation
```

## 🛠️ Tech Stack

### Frontend

- React.js
- Vite
- React Router
- Axios
- Tailwind CSS
- Framer Motion
- Lucide React

### Backend

- Node.js
- Express.js
- REST API
- JWT Authentication
- bcrypt

### Database

- MongoDB
- Mongoose
- MongoDB Atlas

### AI

- OpenAI API

### Deployment

- Vercel — Frontend
- Render — Backend
- MongoDB Atlas — Database

## 📂 Project Structure

```text
CARWISE/
│
├── frontend/
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── ...
│
├── backend/
│   ├── src/
│   ├── package.json
│   └── ...
│
├── .gitignore
└── README.md
```

## 🚀 Run Locally

### Clone Repository

```bash
git clone https://github.com/deep670/CARWISE_AI-car-recommandation.git
cd CARWISE_AI-car-recommandation
```

### Backend

```bash
cd backend
npm install
npm run dev
```

Backend:

```text
http://localhost:5000
```

### Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend:

```text
http://localhost:5173
```

## 🔐 Environment Variables

### Backend `.env`

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173
OPENAI_API_KEY=your_openai_api_key
```

### Frontend `.env`

```env
VITE_API_URL=http://localhost:5000/api
```

> Never upload `.env` files, passwords, API keys, or private credentials to GitHub.

## 🌟 Main Modules

```text
Home
Cars
Brands
Compare
AI Advisor
AI Recommendations
EV Cars
Upcoming Cars
Reviews
News
EMI / Finance Tools
Wishlist
Dashboard
Premium Garage
```

## 🎨 UI & Design

CARWISE uses a premium automotive design with:

- Dark black / deep navy theme
- Electric blue and cyan accents
- Glassmorphism
- Premium typography
- Large automotive imagery
- Modern rounded cards
- Smooth animations
- Responsive layouts
- Desktop, tablet and mobile support

## 🔒 Security

- JWT authentication
- Password hashing with bcrypt
- Protected routes
- Environment variables
- Backend-only AI API key handling
- CORS configuration
- MongoDB/Mongoose data layer

## ☁️ Deployment

### Frontend

Deployed on **Vercel**

```text
https://carwise-ai-car-recommandation.vercel.app/
```

### Backend

Deployed on **Render**

```text
https://carwise-ai-car-recommandation.onrender.com
```

### Database

Hosted on **MongoDB Atlas**

## 📌 Project Objective

CARWISE combines:

```text
Car Discovery
      +
AI Recommendations
      +
Smart Comparison
      +
EV Intelligence
      +
Finance Tools
      +
Personalization
```

The project is developed as a **college project and portfolio project** to demonstrate full-stack development, API integration, database management, authentication, AI integration, and modern responsive UI development.

## 👨‍💻 Author

**Deepak Kumar**

GitHub:  
https://github.com/deep670

## ⭐ Support


If you like CARWISE, consider giving the repository a ⭐ on GitHub.

---

### 🚗 CARWISE
**Find the Right Car, Not Just a Car.**
