interface SendEmailParams {
    to: { email: string; name: string }[];
    subject: string;
    htmlContent: string;
    sender?: { email: string; name: string };
}

export const sendEmail = async ({ to, subject, htmlContent, sender = { email: process.env.EMAIL_USER || "amarjeet9305@gmail.com", name: "Aura.Ai" } }: SendEmailParams) => {
    if (!process.env.BREVO_API_KEY) {
        console.warn("BREVO_API_KEY is not set.");
    }

    try {
        const response = await fetch("https://api.brevo.com/v3/smtp/email", {
            method: "POST",
            headers: {
                "accept": "application/json",
                "api-key": process.env.BREVO_API_KEY || "",
                "content-type": "application/json"
            },
            body: JSON.stringify({
                sender,
                to,
                subject,
                htmlContent
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Brevo API Error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log('Email sent successfully:', data);
        return data;
    } catch (error) {
        console.error('Error sending email via Brevo REST API:', error);
        throw error;
    }
};
