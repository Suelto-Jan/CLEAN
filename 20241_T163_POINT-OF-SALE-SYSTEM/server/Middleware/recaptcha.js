import axios from 'axios'


export const verifyRecaptcha = async (recaptchaToken) => {
  const secretKey = '6LecA4EqAAAAAGfWCrkqkEqB2isyrLAAw3KN3Rld'; // Your reCAPTCHA secret key
  const url = `https://www.google.com/recaptcha/api/siteverify`;

  try {
    const response = await axios.post(url, null, {
      params: {
        secret: secretKey,
        response: recaptchaToken,
      },
    });

    // Check if reCAPTCHA validation is successful
    return response.data.success;
  } catch (error) {
    console.error("reCAPTCHA verification failed:", error);
    return false;
  }
};

export default verifyRecaptcha;