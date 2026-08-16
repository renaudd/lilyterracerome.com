// EmailJS Configuration for Real-Time Email Notifications
// -------------------------------------------------------------
// 1. Sign up at https://www.emailjs.com/ (Free - 200 emails/month)
// 2. In "Email Services", connect your email (Gmail, Outlook, or SMTP) -> Copy Service ID
// 3. In "Email Templates", create a template and use these variables:
//      To Email field: {{to_email}}
//      Subject field:  {{subject}}
//      Content box:    {{message}}
//    -> Copy Template ID
// 4. In "Account" -> "API Keys" -> Copy Public Key
// 5. Replace the placeholder values below:

const emailjsConfig = {
    publicKey: "YOUR_PUBLIC_KEY",
    serviceId: "YOUR_SERVICE_ID",
    templateId: "YOUR_TEMPLATE_ID"
};
