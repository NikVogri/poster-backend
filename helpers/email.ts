const nodemailer = require("nodemailer");

export const sendEmail = async (
  receiver: string,
  subject: string,
  htmlMessage: string
) => {
  const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASSWORD } = process.env;

  try {
    const transporter = nodemailer.createTransport({
      host: EMAIL_HOST,
      port: EMAIL_PORT,
      secure: false, // true for 465, false for other ports
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: '"Pager" <info@pager.com>', // sender address
      to: receiver, // list of receivers
      subject: subject, // Subject line
      html: htmlMessage, // html body
    });

    return true;
  } catch (err) {
    return false;
  }
};
