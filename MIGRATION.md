# Migration Guide: JSON Files to MongoDB

This guide helps you migrate from the old JSON file-based system to the new MongoDB-based system.

## Prerequisites

- MongoDB installed and running (local or MongoDB Atlas)
- Node.js and npm installed
- Backup of existing data (if any)

## Migration Steps

### 1. Install Dependencies

```bash
npm install
```

This will install mongoose and other new dependencies.

### 2. Set Up Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and set:
- `MONGODB_URI` - Your MongoDB connection string
- `JWT_SECRET` - Your JWT secret (keep existing if you have one)
- Other variables as needed

### 3. Start MongoDB

**Local MongoDB:**
```bash
# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows
# Start MongoDB service from Services panel
```

**MongoDB Atlas:**
- Use your connection string from Atlas dashboard

### 4. Seed Default Admin

```bash
npm run seed
```

This creates the default admin user. If you had a custom admin, you'll need to create it manually or update the seed script.

### 5. Migrate Existing Data (Optional)

If you have existing data in JSON files, you can use this migration script:

```javascript
// scripts/migrate-data.js
const mongoose = require('mongoose');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

const Team = require('../models/Team');
const QRCode = require('../models/QRCode');
const LocationHint = require('../models/LocationHint');
const Answer = require('../models/Answer');

async function migrateData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Migrate Teams
    try {
      const teamsData = JSON.parse(await fs.readFile('data/teams.json', 'utf8'));
      if (teamsData.teams && teamsData.teams.length > 0) {
        // Note: Passwords will need to be re-entered as they're hashed
        console.log(`Found ${teamsData.teams.length} teams to migrate`);
        // Teams need to re-register or admin needs to create them
      }
    } catch (error) {
      console.log('No teams.json found or error reading it');
    }

    // Migrate QR Codes
    try {
      const qrData = JSON.parse(await fs.readFile('data/qrcodes.json', 'utf8'));
      if (qrData.QRCodes) {
        const qrCodes = Object.entries(qrData.QRCodes).map(([key, qr]) => ({
          key,
          ...qr
        }));
        await QRCode.insertMany(qrCodes, { ordered: false });
        console.log(`Migrated ${qrCodes.length} QR codes`);
      }
    } catch (error) {
      console.log('No qrcodes.json found or error reading it');
    }

    // Migrate Location Hints
    try {
      const hintsData = JSON.parse(await fs.readFile('data/locationHints.json', 'utf8'));
      if (hintsData.hints && hintsData.hints.length > 0) {
        for (const hintRound of hintsData.hints) {
          await LocationHint.findOneAndUpdate(
            { round: hintRound.round },
            { hints: hintRound.hints },
            { upsert: true }
          );
        }
        console.log(`Migrated location hints for ${hintsData.hints.length} rounds`);
      }
    } catch (error) {
      console.log('No locationHints.json found or error reading it');
    }

    // Migrate Answers (optional - scores are recalculated)
    try {
      const answersData = JSON.parse(await fs.readFile('data/answers.json', 'utf8'));
      if (answersData.answers && answersData.answers.length > 0) {
        console.log(`Found ${answersData.answers.length} answers (scores will be recalculated)`);
        // Answers can be migrated but teams will need to be re-created first
      }
    } catch (error) {
      console.log('No answers.json found or error reading it');
    }

    console.log('Migration complete!');
    process.exit(0);
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
}

migrateData();
```

**Important Notes:**
- Team passwords cannot be migrated (they're hashed). Teams will need to re-register or admin can create them.
- Scores will need to be recalculated based on answers.
- Make sure to backup your JSON files before migration.

### 6. Start the Server

```bash
npm start
```

The server will now use MongoDB instead of JSON files.

## What Changed

### File Structure
- ❌ Removed: `data/` directory (JSON files)
- ✅ Added: `models/`, `controllers/`, `routes/`, `middleware/` directories
- ✅ Added: `config/database.js` for MongoDB connection

### API Endpoints
- All endpoints remain the same
- Response format is slightly different (includes `success` field)
- Error handling is improved

### Data Storage
- Teams stored in MongoDB `teams` collection
- QR codes in `qrcodes` collection
- Location hints in `locationhints` collection
- Answers in `answers` collection
- Admins in `admins` collection

### Environment Variables
- New: `MONGODB_URI` - MongoDB connection string
- Existing: `JWT_SECRET`, `PORT`, etc. remain the same

## Rollback (if needed)

If you need to rollback to JSON files:
1. Keep a backup of the old `server.js` (JSON-based version)
2. Restore JSON files from backup
3. Revert to old dependencies (remove mongoose)

However, it's recommended to stay with MongoDB for production use.

## Troubleshooting

### Connection Issues
- Verify MongoDB is running: `mongosh` or check service status
- Check connection string format
- Verify network access (for Atlas)

### Data Not Appearing
- Check MongoDB collections: `mongosh` → `use odins-eye` → `show collections`
- Verify data was inserted correctly
- Check for duplicate key errors

### Authentication Issues
- Run seed script again: `npm run seed`
- Verify admin credentials in database
- Check JWT_SECRET is set correctly

## Next Steps

1. Test all functionality
2. Update mobile app API URL if needed
3. Set up MongoDB backups
4. Configure production environment variables
5. Deploy to production


