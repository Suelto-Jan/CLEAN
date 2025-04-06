// utils/sendVerificationEmail.js
import nodemailer from 'nodemailer';

const sendVerificationEmail = (email, token) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: '2201102887@student.buksu.edu.ph',  // Replace with your email
            pass: 'oxuc bckp orwk cpqd',  // Replace with your app-specific password or password
        },
    });

    const mailOptions = {
        from: '2201102887@student.buksu.edu.ph',  // Replace with your email
        to: email,
        subject: 'Please verify your email',
        text: `Click the link to verify your email: http://localhost:8000/verify-email?token=${token}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
};

export default sendVerificationEmail;
