/**
 * Migration script to add questionLink field to existing QR codes
 * Run this script once to update existing QR codes in the database
 */

const mongoose = require('mongoose');
const QRCode = require('../models/QRCode');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/odins-eye';

async function updateQRCodes() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to database');

    // Update all QR codes that don't have questionLink field
    const result = await QRCode.updateMany(
      { questionLink: { $exists: false } },
      { $set: { questionLink: '' } }
    );

    console.log(`Updated ${result.modifiedCount} QR codes with questionLink field`);

    // Show all QR codes
    const qrcodes = await QRCode.find({});
    console.log('\nCurrent QR Codes:');
    qrcodes.forEach(qr => {
      console.log(`- ${qr.key}: question="${qr.question}", questionLink="${qr.questionLink || '(empty)'}"`);
    });

    console.log('\nMigration completed successfully!');
    console.log('You can now add question links through the admin panel.');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from database');
  }
}

updateQRCodes();
