const CONTACT_EMAIL = "elsapitoimpresiones3d@gmail.com";

interface OpenGmailOptions {
  to?: string;
  subject?: string;
  body?: string;
}

export const openGmail = ({ to = CONTACT_EMAIL, subject = "Coordinación de envío", body = "" }: OpenGmailOptions = {}) => {
  const encodedSubject = encodeURIComponent(subject);
  const encodedBody = encodeURIComponent(body);
  const gmailUrl = `https://mail.google.com/mail/?view=cm&to=${to}&su=${encodedSubject}&body=${encodedBody}`;
  
  window.open(gmailUrl, "_blank");
};

