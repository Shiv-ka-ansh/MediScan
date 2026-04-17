# Quick Start Guide

## 🚀 Fastest Way to Get Started

### Prerequisites

- Node.js 18+ and npm installed
- MongoDB running locally (or MongoDB Atlas connection string)
- Google Gemini API Key

### Steps

1. **Clone and navigate to project**

   ```bash
   cd MedScan
   ```

2. **Install dependencies**

   ```bash
   # Install backend dependencies
   cd server
   npm install

   # Install frontend dependencies
   cd ../client
   npm install
   ```

3. **Create environment file**

   ```bash
   # Create server/.env
   cd ../server
   cp .env.example .env
   # Edit .env with your credentials:
   # MONGO_URI=mongodb://localhost:27017/mediscan
   # JWT_SECRET=your_super_secret_jwt_key_change_this
   # GEMINI_API_KEY=your_google_gemini_api_key
   # GEMINI_MODEL=gemini-1.5-flash
   # PORT=5000
   # NODE_ENV=development
   ```

4. **Start MongoDB** (if not already running)

   ```bash
   # Make sure MongoDB is running on your system
   # Or use MongoDB Atlas and update MONGO_URI in .env
   ```

5. **Start backend server**

   ```bash
   cd server
   npm run dev
   # Server will run on http://localhost:5000
   ```

6. **Start frontend** (in a new terminal)

   ```bash
   cd client
   npm run dev
   # Frontend will run on http://localhost:5173
   ```

7. **Access the application**

   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000/api/health

8. **Register a user**
   - Go to http://localhost:5173/register
   - Create an account (Patient or Doctor role)
   - Login and start uploading reports!

## 📝 First Steps After Setup

1. **Register as Patient**

   - Go to Register page
   - Create account with role "Patient"
   - Login

2. **Upload a Medical Report**

   - Click "Upload Report" button
   - Select a PDF, image, or text file
   - Wait for AI analysis (may take 30-60 seconds)

3. **View Report Analysis**

   - See AI summary, abnormalities, and recommendations
   - Download as PDF

4. **Chat with AI**

   - Go to Chat page
   - Ask questions about your reports

5. **Doctor Panel** (if registered as Doctor)
   - Review pending reports
   - Approve or reject analyses
   - Add professional comments

## 🐛 Troubleshooting

### MongoDB Connection Error

```bash
# Check if MongoDB is running
# Windows: Check Services or Task Manager
# Linux/Mac: sudo systemctl status mongod

# Or connect to MongoDB Atlas
# Update MONGO_URI in server/.env with your Atlas connection string
```

### OpenAI API Error

- Verify your API key in `server/.env`
- Check API quota at https://platform.openai.com/

### Port Already in Use

```bash
# Change PORT in server/.env
# Or stop conflicting services
```

### Build Errors

```bash
# Clean and reinstall
cd server
rm -rf node_modules package-lock.json
npm install

cd ../client
rm -rf node_modules package-lock.json
npm install
```

## 📚 Next Steps

- Read full README.md for detailed documentation
- Read full README.md for detailed documentation
- Customize AI prompts in `server/src/utils/aiService.js`
- Add more features as needed
