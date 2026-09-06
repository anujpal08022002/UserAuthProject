import nodemailer from "nodemailer";

// console.log("SMTP USER:", process.env.SMTP_USER);
// console.log("SMTP PASS exists:", !!process.env.SMTP_PASS);
// console.log("SMTP PASS length:", process.env.SMTP_PASS?.length);

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// transporter.verify((error, success) => {
//   if (error) {
//     console.log("SMTP connection failed:", error);
//   } else {
//     console.log("SMTP server is ready:", success);
//   }
// });

export default transporter;
