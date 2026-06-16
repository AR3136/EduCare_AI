# EduCare AI - STEM & Circuit Simulator

EduCare AI's STEM & Circuit Simulator is an interactive, adaptive web application designed to teach children (Kindergarten to Grade 4) the basics of electricity and circuitry. Using an intelligent, gamified approach, the platform scales in complexity according to a child's grade level and performance.

## Features
- **Adaptive Curriculum**: Progresses through age-appropriate concepts (loops, conductors, switches, motors, resistors).
- **Gamified Rewards**: Students earn stars and badges by completing interactive challenges.
- **AI Recommendation Engine**: Automatically suggests the best lesson based on the student's performance, adjusting hints and difficulty.
- **Interactive Simulator**: A click-to-slot visual playground to safely experiment with batteries, bulbs, buzzers, fans, and more.

## Technology Stack
- **Frontend**: React, Vite, TailwindCSS
- **Backend**: Node.js, Express
- **Database**: MongoDB (Mongoose)

## Recommended Branching Strategy
We recommend using the standard Git Flow or a simplified feature branching strategy for future development:
- `main` - Production-ready code.
- `development` - Active integration branch for the next release.
- `feature/stem-lessons` - For adding new lesson plans or subjects.
- `feature/circuit-simulator` - For developing new simulator components.
- `feature/rewards-system` - For extending the gamification logic.

## Installation Instructions
1. **Clone the repository**:
   ```bash
   git clone <repository_url>
   cd "EduCare AI"
   ```

2. **Install Root Dependencies** (concurrently):
   ```bash
   npm install
   ```

3. **Install Sub-module Dependencies**:
   ```bash
   cd frontend
   npm install
   cd ../backend
   npm install
   cd ..
   ```

4. **Environment Setup**:
   - Copy `backend/.env.example` to `backend/.env`
   - Adjust `MONGODB_URI` or `PORT` if needed.
   - Ensure MongoDB is running locally or provide an Atlas connection string.

## Run Instructions

Start both the backend and frontend simultaneously from the root directory:
```bash
npm run dev
```

- The frontend will be available at `http://localhost:3000` (or `3001` if busy).
- The backend API will be available at `http://localhost:5000`.
