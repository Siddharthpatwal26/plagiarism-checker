# Plagiarism Checker - Premium UI

A full-stack plagiarism and AI content detection system with a modern glassmorphic interface.

## 🚀 Features
- **Plagiarism Detection**: Scans text against web sources and reference documents.
- **AI Detection**: Identifies potential AI-generated content using NLP heuristics.
- **Multi-Format Support**: Supports Text, PDF, and DOCX files.
- **Premium Dashboard**: Visual results with Chart.js and smooth animations.

## 🛠️ Tech Stack
- **Frontend**: React, Framer Motion, Chart.js, Tailwind CSS
- **Backend**: Node.js, Express, MongoDB, Multer
- **ML Service**: Python, Flask, NLTK, Scikit-learn, Tavily API

## 📋 Prerequisites
- [Node.js](https://nodejs.org/) (v16+)
- [Python](https://www.python.org/) (v3.8+)
- [MongoDB](https://www.mongodb.com/try/download/community) (Running locally or Atlas)

## ⚙️ Setup Instructions

### 1. Clone the repository
```bash
git clone https://github.com/Siddharthpatwal26/plagiarism-checker.git
cd plagiarism-checker
```

### 2. Install Dependencies
Install dependencies for all components:
```bash
# Root dependencies
npm install

# Backend dependencies
cd backend && npm install && cd ..

# Frontend dependencies
cd frontend && npm install && cd ..
```

### 3. Environment Configuration
Create a `.env` file in the `backend` directory based on the example:
```bash
cp backend/.env.example backend/.env
```
Edit `backend/.env` and provide your MongoDB URI and other settings.

### 4. Running the Application
From the root directory, run:
```bash
npm run dev
```
This will start the Frontend (Port 3000), Backend (Port 5000), and ML Service (Port 5001) concurrently.

## 🤝 Contributing
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
