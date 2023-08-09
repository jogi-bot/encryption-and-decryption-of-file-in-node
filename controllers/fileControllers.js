const { log } = require('console');
const crypto = require('crypto');
const fs = require('fs');

// Helper function for file encryption
function encryptFile(fileBuffer, key) {
  const iv = crypto.randomBytes(16); // Initialization vector for encryption
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  const encryptedFile = Buffer.concat([iv, cipher.update(fileBuffer), cipher.final()]);
  return encryptedFile;
}

// Helper function for file decryption
function decryptFile(encryptedFile, key) {
  const iv = encryptedFile.slice(0, 16); // Extract IV from the encrypted file
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  const decryptedFile = Buffer.concat([decipher.update(encryptedFile.slice(16)), decipher.final()]);
  return decryptedFile;
}

// File upload with encryption
exports.uploadFile = (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const key = crypto.randomBytes(32); // 256-bit key for AES encryption

  // Read the uploaded file
  fs.readFile(file.path, (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'File read error' });
    }

    // Encrypt the file data
    const encryptedFile = encryptFile(data, key);

    // Save the encrypted file with a new filename
    const encryptedFileName = `encrypted_${file.originalname}`;
    fs.writeFile(`uploads/${encryptedFileName}`, encryptedFile, (err) => {
      if (err) {
        return res.status(500).json({ error: 'File write error' });
      }

      // Delete the original uploaded file
      fs.unlinkSync(file.path);

      res.json({ message: 'File uploaded and encrypted successfully' });
    });
  });
};

// File download with decryption
exports.downloadFile = (req, res) => {
  const filename = req.params.filename;

 
  const encryptedFilePath = `./uploads/encrypted_${filename}`;

  // Read the encrypted file
  fs.readFile(encryptedFilePath, (err, encryptedData) => {
    if (err) {
      return res.status(404).json({ error: 'File not found' });
    }

    // You need to retrieve the correct key here, either from a secure source or based on a predefined strategy
    const key = crypto.randomBytes(32); // This is a placeholder; replace with the correct key

    // Decrypt the file data
    try {
      const decryptedFile = decryptFile(encryptedData, key);

      // Serve the decrypted file for download
      res.attachment(filename);
      res.send(decryptedFile);
    } catch (decryptErr) {
      // Handle decryption error
      return res.status(500).json({ error: 'File decryption error', decryptErr });
    }
  });
};
