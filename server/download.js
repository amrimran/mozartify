const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
const { Storage } = require('@google-cloud/storage');

const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'mozartify.appspot.com' // Replace with your Firebase Storage bucket name
});

const bucket = admin.storage().bucket();

const folderName = 'ms_cover_images';

async function downloadFiles() {
  try {
    const [files] = await bucket.getFiles({ prefix: folderName + '/' });

    // Create a directory to save the downloaded files
    const downloadDir = path.join(__dirname, 'downloads');
    if (!fs.existsSync(downloadDir)) {
      fs.mkdirSync(downloadDir);
    }

    for (const file of files) {
      const destFileName = path.join(downloadDir, path.basename(file.name));
      console.log(`Downloading ${file.name} to ${destFileName}`);
      await file.download({ destination: destFileName });
    }

    console.log('All files downloaded successfully.');
  } catch (error) {
    console.error('Error downloading files:', error);
  }
}

downloadFiles();
