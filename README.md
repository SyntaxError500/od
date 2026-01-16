# Odin's Eye - Astronomy Treasure Hunt Mobile App

A production-ready mobile application for the Odin's Eye astronomy event, featuring a treasure hunt system with QR code scanning, location hints, and team scoring. Built with MongoDB, Express, and React Native.

## Features

- **Team Registration & Approval**: Team leaders can register, but must be approved by admin before login
- **QR Code Scanning**: Teams scan QR codes at locations to unlock questions
- **Location Hints**: Admin can upload location hints for each round
- **Question System**: Teams answer questions after scanning QR codes to earn points
- **Scoring System**: Real-time scoring with leaderboard
- **Admin Panel**: Web-based admin panel for managing teams, questions, and QR codes
- **MongoDB Database**: Production-ready database with proper models and relationships
- **Security**: JWT authentication, password hashing, rate limiting, and helmet security

## Project Structure

```
od/
├── server.js                 # Main server file
├── package.json              # Backend dependencies
├── .env.example              # Environment variables template
├── config/
│   └── database.js           # MongoDB connection configuration
├── models/                   # MongoDB models
│   ├── Team.js
│   ├── Admin.js
│   ├── QRCode.js
│   ├── LocationHint.js
│   └── Answer.js
├── controllers/              # Business logic
│   ├── authController.js
│   ├── adminController.js
│   └── teamController.js
├── routes/                   # API routes
│   ├── auth.js
│   ├── admin.js
│   └── team.js
├── middleware/               # Middleware functions
│   ├── auth.js
│   └── errorHandler.js
├── scripts/
│   ├── seed.js              # Database seeding script
│   └── generate-qr.js       # QR code generator
├── public/
│   └── admin.html           # Admin panel
└── mobile-app/              # React Native mobile app
    ├── App.js
    ├── screens/
    └── config.js
```

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn
- For mobile app: Expo CLI or Expo Go app

## Setup Instructions

### 1. Backend Setup

1. **Install dependencies:**
```bash
npm install
```

2. **Configure environment variables:**
```bash
cp .env.example .env
```

Edit `.env` file with your configuration:
```env
PORT=3000
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-change-this
MONGODB_URI=mongodb://localhost:27017/odins-eye
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:19006
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

3. **Start MongoDB:**
   - **Local MongoDB**: Make sure MongoDB is running on your system
   - **MongoDB Atlas**: Use the connection string from Atlas dashboard

4. **Seed the database (create default admin):**
```bash
npm run seed
```

5. **Start the server:**
```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

The server will run on `http://localhost:3000`

### 2. Mobile App Setup

1. Navigate to the mobile app directory:
```bash
cd mobile-app
```

2. Install dependencies:
```bash
npm install
```

3. **Configure API URL:**
   - Edit `mobile-app/config.js`
   - For **physical device testing**, replace `localhost` with your computer's IP address
   - Example: `http://192.168.1.100:3000/api`
   - For production: Use your deployed backend URL

4. Start Expo:
```bash
npm start
```

5. Scan the QR code with:
   - **iOS**: Use Camera app
   - **Android**: Use Expo Go app

### 3. Admin Panel

Access the admin panel at: `http://localhost:3000/admin.html`

**Default Admin Credentials** (after seeding):
- Username: `admin` (or from .env)
- Password: `admin123` (or from .env)

**⚠️ IMPORTANT:** Change the admin password after first login in production!

## API Endpoints

### Authentication
- `POST /api/register` - Team registration
- `POST /api/login` - Team login
- `POST /api/admin/login` - Admin login

### Team Routes (requires authentication)
- `GET /api/location-hints/:round` - Get location hints for a round
- `GET /api/rounds` - Get all rounds
- `POST /api/scan-qr` - Scan a QR code
- `POST /api/submit-answer` - Submit answer to a question
- `GET /api/team/score` - Get team score
- `GET /api/leaderboard` - Get public leaderboard

### Admin Routes (requires admin authentication)
- `GET /api/admin/pending-teams` - Get pending teams
- `POST /api/admin/approve-team/:teamId` - Approve a team
- `GET /api/admin/teams` - Get all teams
- `POST /api/admin/location-hints` - Upload location hints
- `POST /api/admin/qrcodes` - Upload QR codes
- `GET /api/admin/leaderboard` - Get detailed leaderboard

## QR Code Structure

### For QR Code Generation (what to encode in the QR code)

When generating QR codes to print/display at locations, encode JSON in this format:
```json
{
  "value": "unique-qr-value",
  "number": "LOC001",
  "question": "What is the answer?",
  "answer": "correct answer",
  "time": "5",
  "points": 50,
  "maxScans": 10,
  "queimagename": "image.jpg"
}
```

**Note:** The mobile app scanner will extract the `value` field and send it to the backend. The backend uses this value to look up the full question data.

### For Backend Upload (admin panel)

When uploading QR codes via the admin panel, use this structure:
```json
{
  "QRCodes": {
    "qr_key_1": {
      "number": "LOC001",
      "value": "unique-value-1",
      "question": "Question text",
      "answer": "answer",
      "time": "5",
      "points": 50,
      "scans": 0,
      "maxScans": 10,
      "queimagename": "",
      "round": 1
    }
  }
}
```

**Important:** The `value` field in the uploaded QR code data must match the `value` field in the actual QR code JSON for the scanner to work correctly.

See `example-qrcode.json` for a complete example.

## Database Models

### Team
- Team registration information
- Approval status
- Score tracking

### Admin
- Admin user accounts
- Role-based access

### QRCode
- QR code data and questions
- Scan limits and tracking
- Round association

### LocationHint
- Location hints per round
- Multiple hints per round

### Answer
- Team answers to questions
- Scoring and validation
- Prevents duplicate answers

## Production Deployment

### Backend Deployment

1. **Set environment variables** on your hosting platform:
   - `MONGODB_URI` - Your MongoDB connection string
   - `JWT_SECRET` - Strong random secret
   - `NODE_ENV=production`
   - `ALLOWED_ORIGINS` - Your frontend URLs

2. **Recommended hosting:**
   - Heroku
   - AWS Elastic Beanstalk
   - DigitalOcean App Platform
   - Railway
   - Render

3. **MongoDB hosting:**
   - MongoDB Atlas (recommended)
   - Self-hosted MongoDB

### Mobile App Deployment

1. **Update API URL** in `mobile-app/config.js` to production URL

2. **Build for production:**
```bash
cd mobile-app
expo build:android  # For Android
expo build:ios      # For iOS
```

3. **Or use EAS Build:**
```bash
npm install -g eas-cli
eas build --platform android
eas build --platform ios
```

## Security Features

- **Password Hashing**: Bcrypt with salt rounds
- **JWT Authentication**: Secure token-based auth
- **Rate Limiting**: Prevents abuse
- **Helmet**: Security headers
- **Input Validation**: Express-validator
- **CORS**: Configurable origins
- **Error Handling**: Centralized error handling

## Troubleshooting

### MongoDB Connection Issues
- Check MongoDB is running (local) or connection string is correct (Atlas)
- Verify network access for MongoDB Atlas
- Check firewall settings

### Mobile app can't connect to backend
- Ensure backend is running
- Check API_BASE_URL in `mobile-app/config.js`
- For physical device: Use computer's IP, not localhost
- Ensure both devices on same network
- Check firewall settings

### Authentication errors
- Verify JWT_SECRET is set correctly
- Check token expiration
- Ensure user is approved (for teams)

## Development

### Running in Development Mode
```bash
npm run dev
```

### Database Seeding
```bash
npm run seed
```

### Environment Variables
See `.env.example` for all required environment variables.

## License

ISC
