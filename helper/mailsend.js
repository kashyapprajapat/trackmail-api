const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (emails, trackingId) => {
  try {
    const response = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: emails,
      subject: 'Tracking Dead Pixel',
      html: `
        <h1>Tracking Id: ${trackingId}</h1>
      `,
    });

    return response;
  } catch (error) {
    console.error('Email sending failed ❌', error);
    throw error;
  }
};

module.exports = sendEmail;