// @ts-ignore
const Brevo = require('@getbrevo/brevo');

const apiInstance = new Brevo.TransactionalEmailsApi();

if (process.env.BREVO_API_KEY) {
    apiInstance.setApiKey(Brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);
} else {
    console.warn("BREVO_API_KEY is not set.");
}

if (!process.env.BREVO_API_KEY) {
    console.warn("BREVO_API_KEY is not set.");
}

interface SendEmailParams {
    to: { email: string; name: string }[];
    subject: string;
    htmlContent: string;
    sender?: { email: string; name: string };
}

export const sendEmail = async ({ to, subject, htmlContent, sender = { email: process.env.EMAIL_USER || "amarjeet9305@gmail.com", name: "Aura.Ai" } }: SendEmailParams) => {
    const sendSmtpEmail = new Brevo.SendSmtpEmail();

    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = htmlContent;
    sendSmtpEmail.sender = sender;
    sendSmtpEmail.to = to;

    try {
        const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log('Email sent successfully:', data);
        return data;
    } catch (error) {
        console.error('Error sending email via Brevo:', error);
        throw error;
    }
};
