/**
 * Quick script to add a question link to an existing QR code
 */

const mongoose = require('mongoose');
const QRCode = require('../models/QRCode');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/odins-eye';

async function addQuestionLink() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to database');

    // Update the "hello" QR code with a question link
    const result = await QRCode.findOneAndUpdate(
      { key: 'hello' },
      { 
        questionLink: 'https://docs.google.com/document/d/YOUR_DOCUMENT_ID/edit',
        question: 'Read the question from the link'
      },
      { new: true }
    );

    if (result) {
      console.log('✓ Updated QR code "hello" successfully!');
      console.log(`  Question: ${result.question}`);
      console.log(`  Question Link: ${result.questionLink}`);
    } else {
      console.log('✗ QR code "hello" not found');
    }

    console.log('\nNow scan the QR code again to see the link button!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from database');
  }
}

addQuestionLink();
