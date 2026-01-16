-# Odin's Eye - Quick Setup Guide

## Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- npm or yarn
- For mobile app: Expo CLI (`npm install -g expo-cli`) or Expo Go app on your phone

## Step 1: MongoDB Setup

### Option A: Local MongoDB

**macOS:**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Linux:**
```bash
# Follow MongoDB installation guide for your distribution
sudo systemctl start mongod
```

**Windows:**
- Download MongoDB from mongodb.com
- Install and start MongoDB service

### Option B: MongoDB Atlas (Cloud - Recommended)

1. Sign up at https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Create database user
4. Whitelist IP (0.0.0.0/0 for development)
5. Get connection string

## Step 2: Backend Setup

1. **Install backend dependencies:**
```bash
npm install
```

2. **Configure environment variables:**
```bash
cp .env.example .env
```

Edit `.env` and set:
- `MONGODB_URI` - Your MongoDB connection string
  - Local: `mongodb://localhost:27017/odins-eye`
  - Atlas: `mongodb+srv://user:pass@cluster.mongodb.net/odins-eye`

3. **Seed the database (create default admin):**
```bash
npm run seed
```

4. **Start the backend server:**
```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

The server will start on `http://localhost:3000`

**Default Admin Login (after seeding):**
- Username: `admin` (or from .env)
- Password: `admin123` (or from .env)

**⚠️ IMPORTANT:** Change these credentials in production!

## Step 2: Mobile App Setup

1. Navigate to mobile app directory:
```bash
cd mobile-app
```

2. Install dependencies:
```bash
npm install
```

3. **Configure API URL** (IMPORTANT):
   - Open `mobile-app/config.js`
   - For **physical device testing**, replace `localhost` with your computer's IP address
   - Find your IP:
     - Windows: `ipconfig` (look for IPv4 Address)
     - Mac/Linux: `ifconfig` or `ip addr`
   - Example: `http://192.168.1.100:3000/api`

4. Start Expo:
```bash
npm start
```

5. Scan the QR code with:
   - **iOS**: Use Camera app
   - **Android**: Use Expo Go app

## Step 3: Admin Panel

1. Open browser and go to: `http://localhost:3000/admin.html`
2. Login with admin credentials
3. Approve teams that have registered
4. Upload location hints for each round
5. Upload QR codes

## Step 4: Generate QR Codes (Optional)

1. Install QR code generator:
```bash
npm install qrcode
```

2. Edit `scripts/generate-qr.js` with your QR code data

3. Generate QR codes:
```bash
node scripts/generate-qr.js
```

4. QR code images will be saved in `qr-codes/` directory
5. Copy the JSON from `qr-codes/qrcodes-backend.json` to admin panel

## Testing the Flow

1. **Register a team** via mobile app
2. **Approve the team** via admin panel
3. **Login** with the team credentials
4. **Upload location hints** via admin panel
5. **Upload QR codes** via admin panel
6. **Scan QR code** with mobile app
7. **Answer question** and earn points
8. **Check leaderboard** to see scores

## Troubleshooting

### Mobile app can't connect to backend
- Ensure backend is running
- Check API_BASE_URL in `mobile-app/config.js`
- For physical device: Use computer's IP, not localhost
- Ensure both devices on same network
- Check firewall settings

### Camera permission denied
- Check device settings
- Reinstall the app
- Grant camera permission manually

### QR code not scanning
- Ensure QR contains valid JSON with "value" field
- Check QR hasn't reached scan limit
- Verify team hasn't already scanned this QR

## Production Deployment

1. Change JWT_SECRET in `.env` file
2. Change admin password
3. Use a proper database (MongoDB, PostgreSQL) instead of JSON files
4. Deploy backend to a server (Heroku, AWS, etc.)
5. Update API_BASE_URL in mobile app config
6. Build mobile app for production:
   ```bash
   cd mobile-app
   expo build:android
   expo build:ios
   ```

## Database Collections

All data is stored in MongoDB:
- `teams` - Team registrations
- `admins` - Admin accounts
- `qrcodes` - QR code data
- `locationhints` - Location hints for rounds
- `answers` - Team answers and scores

Collections are automatically created when data is inserted.

## Migrating from JSON Files

If you have existing data in JSON files, see `MIGRATION.md` for migration instructions.

