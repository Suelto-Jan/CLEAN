import nodemailer from 'nodemailer';
import pdfkit from 'pdfkit';
import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { OAuth2Client } from 'google-auth-library';
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get the directory name from the module URL
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Google OAuth2 client
const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

const drive = google.drive({ version: 'v3', auth: oauth2Client });

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Use App Passwords for security
  },
  tls: {
    rejectUnauthorized: false, // Disable certificate validation
  },
});

// Helper function to generate the PDF receipt
const generatePDFReceipt = (receiptData) => {
  const doc = new pdfkit();
  const filePath = path.resolve(__dirname, `receipt_${Date.now()}.pdf`);
  const writeStream = fs.createWriteStream(filePath);

  doc.pipe(writeStream);

  // Add custom font and styling
  doc.fontSize(20).fillColor('#4CAF50').text('Receipt', { align: 'center' });
  doc.moveDown(2);

  // Add user and product details with styling
  doc.fontSize(14).fillColor('#000000')
     .text(`Purchased By: ${receiptData.userName}`, { underline: true });
  doc.moveDown();
  doc.text(`Product: ${receiptData.productName}`);
  doc.text(`Quantity: ${receiptData.quantity}`);
  doc.text(`Price: ₱${receiptData.productPrice.toFixed(2)}`);
  doc.text(`Total Price: ₱${receiptData.totalPrice.toFixed(2)}`);
  doc.text(`Payment Method: ${receiptData.paymentMethod}`);
  
  // Add border and some more visual separation
  doc.moveDown();
  doc.rect(50, doc.y, 500, 2).fill('#4CAF50');  // Green separator line

  doc.moveDown();
  doc.text(`Transaction ID: ${receiptData.transactionId}`);
  doc.text(`Transaction Date: ${receiptData.transactionDate}`);

  doc.end();

  return new Promise((resolve, reject) => {
    writeStream.on('finish', () => resolve(filePath));
    writeStream.on('error', reject);
  });
};

// Helper function to send email with both HTML content and receipt attachment
const sendEmailWithAttachment = async (email, filePath, receiptData) => {
  const htmlContent = `
    <html>
      <body style="font-family: Arial, sans-serif; color: #333;">
        <h2 style="text-align: center; color: #4CAF50;">Receipt for Your Purchase</h2>
        <p>Dear ${receiptData.userName},</p>
        <p>Thank you for your purchase! Below are the details of your transaction:</p>
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <tr style="background-color: #f4f4f4;">
            <th style="padding: 8px; border: 1px solid #ddd;">Product</th>
            <th style="padding: 8px; border: 1px solid #ddd;">Quantity</th>
            <th style="padding: 8px; border: 1px solid #ddd;">Price</th>
            <th style="padding: 8px; border: 1px solid #ddd;">Total Price</th>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;">${receiptData.productName}</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${receiptData.quantity}</td>
            <td style="padding: 8px; border: 1px solid #ddd;">₱${receiptData.productPrice.toFixed(2)}</td>
            <td style="padding: 8px; border: 1px solid #ddd;">₱${receiptData.totalPrice.toFixed(2)}</td>
          </tr>
        </table>
        <p style="margin-top: 20px;">Payment Method: ${receiptData.paymentMethod}</p>
        <p style="margin-top: 20px;">Transaction ID: ${receiptData.transactionId}</p>
        <p style="margin-top: 20px;">Transaction Date: ${receiptData.transactionDate}</p>
        <p>We hope to serve you again soon!</p>
        <p>Looking forward to serving you again!<br>thank you for your trust!</p>
      </body>
    </html>
  `;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your Receipt',
    html: htmlContent,
    attachments: [
      {
        path: filePath,
      },
    ],
  };

  return transporter.sendMail(mailOptions);
};

const getGoogleDriveFileUrl = (fileId) => {
  return `https://drive.google.com/file/d/${fileId}/view`;
};

// Helper function to upload the file to Google Drive
const uploadToGoogleDrive = async (filePath) => {
  const fileMetadata = {
    name: path.basename(filePath),
    parents: [process.env.GOOGLE_DRIVE_FOLDER_ID], // Set folder ID if needed
  };

  const media = {
    mimeType: 'application/pdf',
    body: fs.createReadStream(filePath),
  };

  const driveResponse = await drive.files.create({
    resource: fileMetadata,
    media: media,
    fields: 'id',
  });

  return driveResponse.data.id; // Returns the file ID in Google Drive
};

// Receipt Controller
const createReceipt = async (req, res) => {
  const { product, quantity, totalPrice, paymentMethod, user, transactionId, transactionDate } = req.body;

  // Validate data
  if (!product || !quantity || !totalPrice || !paymentMethod || !user || !transactionId || !transactionDate) {
    return res.status(400).send({ message: 'Missing required fields' });
  }

  const receiptData = {
    userName: `${user.firstname} ${user.lastname}`,
    productName: product.name,
    quantity: quantity,
    productPrice: product.price,
    totalPrice: totalPrice,
    paymentMethod: paymentMethod,
    transactionId: transactionId,
    transactionDate: transactionDate,
  };

  try {
    // Generate PDF receipt
    const filePathPDF = await generatePDFReceipt(receiptData);

    // Send email with styled HTML content and PDF attachment
    await sendEmailWithAttachment(user.email, filePathPDF, receiptData);

    // Upload receipt to Google Drive
    const driveFileId = await uploadToGoogleDrive(filePathPDF);

    const fileUrl = getGoogleDriveFileUrl(driveFileId);

    // Clean up the file after upload and email
    fs.unlinkSync(filePathPDF);

    res.status(200).send({
      message: 'Receipt generated, emailed, and uploaded to Google Drive.',
      driveFileId: driveFileId,
      fileUrl: fileUrl,
    });
  } catch (error) {
    console.error('Error creating receipt:', error);
    res.status(500).send({ message: 'Failed to create and send receipt.' });
  }
};

export { createReceipt };
