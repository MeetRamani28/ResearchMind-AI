const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.sendWelcomeEmail = async (email, fullName) => {
  const msg = {
    to: email,
    from: process.env.FROM_EMAIL,
    subject: "Welcome to ResearchMind!",
    text: `Hello ${fullName}, welcome to ResearchMind! Your AI research assistant is ready.`,
    html: `<h1>Welcome, ${fullName}!</h1><p>Start your research journey with AI today.</p>`,
  };

  try {
    await sgMail.send(msg);
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error.response.body);
  }
};
