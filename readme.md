# MoodWave 🎵

MoodWave is a mood-based music streaming web application where users can discover and listen to music based on their current mood. The application offers features like user authentication, mood-based song recommendations, playlist creation, song ratings, and playback history tracking.

## 🔑 Core Features

1. **User Authentication**
   - Signup/Login with hashed passwords (JWT)

2. **Mood Selection**
   - Upon login, user selects mood (Happy, Sad, Energetic, etc.)

3. **Mood-Based Feed**
   - Songs tagged with selected mood displayed in user's feed

4. **Like & Playlist**
   - Like songs and add them to custom playlists

5. **Ratings & Comments**
   - Users can leave 1–5 star ratings and text reviews

6. **Playback History**
   - Maintain a list of played songs with timestamp

## 🛠️ Tech Stack

| Layer | Tech Used |
|-------|-----------|
| Frontend | React.js + TailwindCSS |
| Backend | Node.js + Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT + Bcrypt |

## 📂 MongoDB Schema

- **User Schema**: User profile with password, liked songs, playlists
- **Song Schema**: Song details with mood tags and audio paths
- **Playlist Schema**: User-created playlists with associated songs
- **Playback History Schema**: Records of song playbacks
- **Rating Schema**: Users' ratings and reviews for songs
- **Comments Schema**: Users' comments on songs

## 🚀 Getting Started

### Prerequisites

- Node.js (v14+)
- MongoDB (Local or MongoDB Atlas)
- npm or yarn

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/moodwave.git
   cd moodwave
   ```

2. Install dependencies:
   ```
   npm install  # Install root dependencies
   cd server && npm install  # Install server dependencies
   cd ../client && npm install  # Install client dependencies
   ```

3. Environment Setup:
   - Create a `.env` file in the server directory with the following variables:
   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   PORT=5000
   ```

4. Seed the database with initial data:
   ```
   npm run seed
   ```

5. Start the application:
   ```
   npm run dev
   ```

6. Access the application at `http://localhost:3000`

## 🧑‍💻 Usage

1. **Register/Login**: Create an account or login to access features
2. **Select Mood**: Choose your current mood to get song recommendations
3. **Explore Songs**: Browse through the mood-based song feed
4. **Create Playlists**: Create custom playlists and add songs to them
5. **Rate & Comment**: Leave ratings and comments on songs you've listened to
6. **Track History**: View your playback history in the History page

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- [React.js](https://reactjs.org/)
- [Node.js](https://nodejs.org/)
- [Express.js](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [TailwindCSS](https://tailwindcss.com/)
- [JWT](https://jwt.io/)

