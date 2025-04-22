# MoodWave Setup Instructions

This document provides detailed instructions on how to set up and run the MoodWave application.

## Prerequisites

Ensure you have the following installed:
- Node.js (v14 or higher)
- npm or yarn
- MongoDB (local installation or MongoDB Atlas account)

## Setup Steps

1. **Clone or download the repository**:
   - Extract the files to your preferred location if downloaded as a zip

2. **Install dependencies**:
   - Open a terminal and navigate to the project root directory
   - Run the following commands:
   ```
   npm install                      # Install root dependencies
   cd server && npm install         # Install server dependencies
   cd ../client && npm install      # Install client dependencies
   ```

3. **Set up MongoDB**:
   - Use the provided MongoDB connection string in the server/.env file
   - If you want to use your own MongoDB instance, update the connection string

4. **Environment setup**:
   - The .env file in the server directory already contains the required configuration
   - You can modify it if you need to change any settings

5. **Seed the database with sample data**:
   - Navigate to the project root directory
   - Run: `npm run seed`
   - This will populate your database with sample users and songs

6. **Running the application**:
   - From the project root directory, run: `npm run dev`
   - This will start both the backend server and frontend client concurrently
   - The server will run on http://localhost:5000
   - The client will run on http://localhost:3000

7. **Accessing the application**:
   - Open your browser and navigate to http://localhost:3000
   - You can login with the sample account:
     - Email: test@example.com
     - Password: password123

## Folder Structure

- `client/`: Contains the React frontend
- `server/`: Contains the Express backend
  - `models/`: MongoDB schema models
  - `controllers/`: API route controllers
  - `routes/`: API route definitions
  - `middleware/`: Custom middleware functions
  - `public/songs/`: Sample song files

## Troubleshooting

If you encounter any issues:

1. **Server connection error**:
   - Check if MongoDB is running and accessible
   - Verify the connection string in .env

2. **Missing dependencies**:
   - Run `npm install` in the appropriate directory

3. **Port conflicts**:
   - If port 3000 or 5000 is already in use, modify the port in the .env file

## Notes

- The application is configured to use the MongoDB Atlas cloud database
- Sample songs are provided as empty files for demonstration purposes
- For a production environment, please replace the JWT secret and use proper audio files 