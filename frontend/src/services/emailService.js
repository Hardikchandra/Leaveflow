// src/services/emailService.js


export function sendEmail({ to, subject, body }) {
  if (!to || !subject || !body) {
    console.warn("Email not sent: missing fields");
    return;
  }

  // Simulated SMTP delay
  setTimeout(() => {
    console.log("Email Sent");
    console.log("To:", to);
    console.log("Subject:", subject);
    console.log("Body:", body);
  }, 500);
}
