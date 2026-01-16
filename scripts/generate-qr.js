/**
 * QR Code Generator Script for Odin's Eye
 * 
 * This script helps generate QR codes in the correct format for the event.
 * Install qrcode package: npm install qrcode
 * 
 * Usage: node scripts/generate-qr.js
 */

const QRCode = require('qrcode');
const fs = require('fs').promises;
const path = require('path');

// Example QR code data structure
const qrCodes = [
  {
    key: 'location1_round1',
    number: 'LOC001',
    value: 'unique-value-location1-round1',
    question: 'What is the brightest star in the night sky?',
    answer: 'Sirius',
    time: '5',
    points: 50,
    maxScans: 10,
    queimagename: ''
  },
  {
    key: 'location2_round1',
    number: 'LOC002',
    value: 'unique-value-location2-round1',
    question: 'How many planets are in our solar system?',
    answer: '8',
    time: '5',
    points: 50,
    maxScans: 10,
    queimagename: ''
  }
];

async function generateQRCodes() {
  const outputDir = path.join(__dirname, '..', 'qr-codes');
  
  try {
    await fs.mkdir(outputDir, { recursive: true });
  } catch (error) {
    // Directory might already exist
  }

  console.log('Generating QR codes...\n');

  for (const qr of qrCodes) {
    // Create QR code data in the format expected by the scanner
    const qrData = {
      value: qr.value,
      number: qr.number,
      question: qr.question,
      answer: qr.answer,
      time: qr.time,
      points: qr.points,
      maxScans: qr.maxScans,
      queimagename: qr.queimagename
    };

    // Generate QR code image
    const qrImagePath = path.join(outputDir, `${qr.key}.png`);
    await QRCode.toFile(qrImagePath, JSON.stringify(qrData), {
      errorCorrectionLevel: 'H',
      type: 'png',
      width: 300
    });

    console.log(`✓ Generated QR code for ${qr.number} (${qr.key})`);
    console.log(`  File: ${qrImagePath}`);
    console.log(`  Value: ${qr.value}`);
    console.log(`  Question: ${qr.question.substring(0, 50)}...`);
    console.log('');
  }

  // Also generate the JSON structure for backend upload
  const backendFormat = {
    QRCodes: {}
  };

  qrCodes.forEach(qr => {
    backendFormat.QRCodes[qr.key] = {
      number: qr.number,
      value: qr.value,
      question: qr.question,
      answer: qr.answer,
      time: qr.time,
      points: qr.points,
      scans: 0,
      maxScans: qr.maxScans,
      queimagename: qr.queimagename
    };
  });

  const jsonPath = path.join(outputDir, 'qrcodes-backend.json');
  await fs.writeFile(jsonPath, JSON.stringify(backendFormat, null, 2));
  console.log(`✓ Generated backend JSON: ${jsonPath}`);
  console.log('\nYou can copy the JSON content to the admin panel to upload QR codes.');
}

// Run if executed directly
if (require.main === module) {
  generateQRCodes().catch(console.error);
}

module.exports = { generateQRCodes };


