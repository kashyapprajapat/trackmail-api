const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (emails, trackingId) => {
  try {
    const trackinguri = `${process.env.BASE_URL}/track-mail/${trackingId}`;
    
    const response = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: emails,
      subject: 'Tracking Dead Pixel',
      html: `
        <h1>Tracking Id: ${trackingId}</h1>
        <h2>Welcome! How are you?</h2>
        <img src="${trackinguri}" alt="Dead Pixel" style="display:none;" />
      `,
    });

    return response;
  } catch (error) {
    console.error('Email sending failed ❌', error);
    throw error;
  }
};

module.exports = sendEmail;
