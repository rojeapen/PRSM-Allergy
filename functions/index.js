const functions = require('firebase-functions')
const { onSchedule } = require("firebase-functions/v2/scheduler");
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');
const { onCall, HttpsError, onRequest } = require("firebase-functions/v2/https");

const { onDocumentCreated } = require('firebase-functions/v2/firestore');


admin.initializeApp()
require('dotenv').config()

const { SENDER_EMAIL, SENDER_PASSWORD } = process.env;

async function sendEmails(emails, subject, html) {
    let authData = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: SENDER_EMAIL,
            pass: SENDER_PASSWORD
        }
    });
    const mailOptions = {
        from: SENDER_EMAIL,
        to: emails,
        subject: subject,
        html: html,

    };

    try {
        //Loop through emails and send them individually, but do it in parallel
        const emailPromises = emails.split(",").map((email) => {
            const trimmedEmail = email.trim();
            const htmlWithUnsubscribe = html.replace("SUB_EMAIL", trimmedEmail);
            const currentMailOptions = { ...mailOptions, to: trimmedEmail, html: htmlWithUnsubscribe };
            return authData.sendMail(currentMailOptions);
        });

        try {
            await Promise.all(emailPromises);
        } catch (error) {
            console.error("Failed to send one or more emails:", error);
        }



    } catch (error) {

    }
}

exports.sendNewsletter = onCall(async (req) => {

    try {
        const payload = req.data
        const question = payload.question
        const html = `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml"
    xmlns:o="urn:schemas-microsoft-com:office:office">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="x-apple-disable-message-reformatting">
    <meta name="format-detection" content="telephone=no,address=no,email=no,date=no,url=no">
    <title>PRSM Allergy Newsletter</title>
    <!--[if mso]>
    <noscript>
        <xml>
            <o:OfficeDocumentSettings>
                <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
        </xml>
    </noscript>
    <style>
        a { color: inherit !important; text-decoration: none !important; }
    </style>
    <![endif]-->
    <style>
        /* Reset styles */
        * {
            box-sizing: border-box;
        }

        body,
        table,
        td,
        p,
        a,
        li {
            -webkit-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
        }

        table,
        td {
            mso-table-lspace: 0pt;
            mso-table-rspace: 0pt;
        }

        img {
            -ms-interpolation-mode: bicubic;
            border: 0;
            height: auto;
            line-height: 100%;
            outline: none;
            text-decoration: none;
        }

        body {
            height: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            background-color: #f6fbfd;
        }

        /* Responsive styles */
        @media only screen and (max-width: 600px) {
            .email-container {
                width: 100% !important;
            }

            .mobile-padding {
                padding-left: 20px !important;
                padding-right: 20px !important;
            }

            .mobile-stack {
                display: block !important;
                width: 100% !important;
            }

            .mobile-center {
                text-align: center !important;
            }

            .mobile-hide {
                display: none !important;
            }

            .mobile-full-width {
                width: 100% !important;
            }

            h1 {
                font-size: 24px !important;
                line-height: 30px !important;
            }

            h2 {
                font-size: 20px !important;
                line-height: 26px !important;
            }

            .button-td {
                padding: 12px 24px !important;
            }
        }

        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
            .dark-mode-bg {
                background-color: #1a2e3b !important;
            }

            .dark-mode-text {
                color: #ffffff !important;
            }
        }
    </style>
</head>

<body
    style="margin: 0; padding: 0; background-color: #f6fbfd; font-family: system-ui, -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif;">

    <!-- Preview text (hidden) -->
    <div style="display: none; max-height: 0; overflow: hidden;">
        Stay updated with the latest from PRSM Allergy Research Foundation &#847; &#847; &#847; &#847;
    </div>

    <!-- Wrapper Table -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"
        style="background-color: #f6fbfd;">
        <tr>
            <td align="center" style="padding: 40px 20px;">

                <!-- Email Container -->
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600"
                    class="email-container" style="max-width: 600px; width: 100%;">

                    <!-- Header with Logo -->
                    <tr>
                        <td align="center" style="padding: 20px 0 30px 0;">
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                                <tr>
                                    <td align="center">
                                        <!-- Replace with your logo -->
                                        <img src="https://i.ibb.co/yntSMXtV/prsmlogo-removebg-preview.png"
                                            alt="PRSM Allergy" width="50" height="50"
                                            style="display: block; border-radius: 8px;">
                                    </td>
                                </tr>
                                <tr>
                                    <td align="center" style="padding-top: 15px;">
                                        <span style="font-size: 22px; font-weight: 700; color: #18314f;">PRSM
                                            Allergy</span>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Hero Section -->
                    <tr>
                        <td bgcolor="#0A6C95"
                            style="background-color: #0A6C95; background: linear-gradient(135deg, #0A6C95 0%, #054d6f 100%); border-radius: 16px 16px 0 0; padding: 50px 40px; text-align: center;"
                            class="mobile-padding">
                            <h1
                                style="margin: 0 0 20px 0; font-size: 28px; font-weight: 700; color: #ffffff; line-height: 1.2;">
                                Monthly Newsletter
                            </h1>
                            <p style="margin: 0; font-size: 16px; color: #e6e6e6; line-height: 1.6;">
                                Your monthly update on allergy research, events, and community initiatives.
                            </p>
                        </td>
                    </tr>

                    <!-- Main Content Card -->
                    <tr>
                        <td style="background-color: #ffffff; padding: 40px 40px 20px 40px;" class="mobile-padding">

                            <!-- Featured Article -->
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                <tr>
                                    <td style="padding-bottom: 30px;">
                                        <p
                                            style="margin: 0 0 10px 0; font-size: 12px; font-weight: 600; color: #008080; text-transform: uppercase; letter-spacing: 1px;">
                                            Featured Update
                                        </p>
                                        <h2
                                            style="margin: 0 0 15px 0; font-size: 22px; font-weight: 700; color: #18314f; line-height: 1.3;">
                                            ${payload.articleTitle}
                                        </h2>
                                        <p
                                            style="margin: 0 0 20px 0; font-size: 15px; color: #425466; line-height: 1.6;">
                                            ${payload.articlePreview}
                                        </p>
                                        <a href="${payload.articleLink}"
                                            style="display: inline-block; padding: 12px 28px; background-color: #008080; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; border-radius: 16px; transition: background 0.2s;">
                                            Read Full Article →
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <!-- Divider -->
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                <tr>
                                    <td style="padding: 10px 0 30px 0;">
                                        <div style="border-top: 1px solid #e8eef3; height: 1px;"></div>
                                    </td>
                                </tr>
                            </table>

                            <!-- Upcoming Events Section -->
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                <tr>
                                    <td style="padding-bottom: 25px;">
                                        <h2
                                            style="margin: 0 0 5px 0; font-size: 20px; font-weight: 700; color: #18314f;">
                                            Upcoming Events
                                        </h2>
                                        <p style="margin: 0; font-size: 14px; color: #425466;">
                                            Don't miss these opportunities to get involved
                                        </p>
                                    </td>
                                </tr>
                            </table>

                            ${payload.events.map((event, i) => `
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"
                                style="margin-bottom: 15px;">
                                <tr>
                                    <td
                                        style="background-color: #f6fbfd; border-radius: 12px; padding: 20px; border-left: 4px solid ${i % 2 === 0 ? '#008080' : '#01d1d1'};">
                                        <table role="presentation" cellspacing="0" cellpadding="0" border="0"
                                            width="100%">
                                            <tr>
                                                <td>
                                                    <p
                                                        style="margin: 0 0 5px 0; font-size: 12px; font-weight: 600; color: #008080;">
                                                        ${event.date}
                                                    </p>
                                                    <h3
                                                        style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #18314f;">
                                                        ${event.title}
                                                    </h3>
                                                    <p
                                                        style="margin: 0; font-size: 14px; color: #425466; line-height: 1.5;">
                                                        ${event.description}
                                                    </p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>`).join('')}

                            <!-- View All Events Button -->
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                <tr>
                                    <td align="center" style="padding: 15px 0 30px 0;">
                                        <a href="#"
                                            style="display: inline-block; padding: 12px 28px; background-color: #ffffff; color: #008080; text-decoration: none; font-size: 14px; font-weight: 600; border-radius: 16px; border: 2px solid #cce7ea;">
                                            View All Events
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <!-- Divider -->
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                <tr>
                                    <td style="padding: 0 0 30px 0;">
                                        <div style="border-top: 1px solid #e8eef3; height: 1px;"></div>
                                    </td>
                                </tr>
                            </table>

                            <!-- Fundraising Section -->
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                <tr>
                                    <td style="padding-bottom: 20px;">
                                        <h2
                                            style="margin: 0 0 5px 0; font-size: 20px; font-weight: 700; color: #18314f;">
                                            Current Fundraiser
                                        </h2>
                                        <p style="margin: 0; font-size: 14px; color: #425466;">
                                            Help us reach our goal
                                        </p>
                                    </td>
                                </tr>
                            </table>

                            <!-- Fundraiser Card -->
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"
                                style="margin-bottom: 30px;">
                                <tr>
                                    <td bgcolor="#0A6C95"
                                        style="background-color: #0A6C95; background: linear-gradient(135deg, #0A6C95 0%, #054d6f 100%); border-radius: 12px; padding: 25px;">
                                        <h3
                                            style="margin: 0 0 10px 0; font-size: 18px; font-weight: 700; color: #ffffff;">
                                            ${payload.fundraiserTitle}
                                        </h3>
                                        <p
                                            style="margin: 0 0 20px 0; font-size: 14px; color: #e6e6e6; line-height: 1.5;">
                                            ${payload.fundraiserDescription}
                                        </p>

                                        <table role="presentation" cellspacing="0" cellpadding="0" border="0"
                                            width="100%">
                                            <tr>

                                                <td align="right">
                                                    <a href="${payload.fundraiserLink}"
                                                        style="display: inline-block; padding: 10px 24px; background-color: #ffffff; color: #008080; text-decoration: none; font-size: 14px; font-weight: 600; border-radius: 16px;">
                                                        Donate Now
                                                    </a>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>

                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td bgcolor="#1a2e3b"
                            style="background-color: #1a2e3b; border-radius: 0 0 16px 16px; padding: 40px 40px;"
                            class="mobile-padding">
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                <tr>
                                    <td align="center" style="padding-bottom: 25px;">
                                        <span style="font-size: 18px; font-weight: 700; color: #ffffff;">PRSM
                                            Allergy</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td align="center" style="padding-bottom: 25px;">
                                        <p style="margin: 0; font-size: 14px; color: #c0c0c0; line-height: 1.6;">
                                            Dedicated to advancing allergy research<br>
                                            and improving lives through science.
                                        </p>
                                    </td>
                                </tr>
                                <!-- Social Links -->
                                <tr>
                                    <td align="center" style="padding-bottom: 25px;">
                                        <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                                            <tr>
                                                <td style="padding: 0 10px;">
                                                    <a href="#"
                                                        style="color: #c0c0c0; text-decoration: none; font-size: 14px;"><span
                                                            style="color: #c0c0c0;">Facebook</span></a>
                                                </td>
                                                <td style="padding: 0 10px;">
                                                    <a href="#"
                                                        style="color: #c0c0c0; text-decoration: none; font-size: 14px;"><span
                                                            style="color: #c0c0c0;">Twitter</span></a>
                                                </td>
                                                <td style="padding: 0 10px;">
                                                    <a href="#"
                                                        style="color: #c0c0c0; text-decoration: none; font-size: 14px;"><span
                                                            style="color: #c0c0c0;">Instagram</span></a>
                                                </td>
                                                <td style="padding: 0 10px;">
                                                    <a href="#"
                                                        style="color: #c0c0c0; text-decoration: none; font-size: 14px;"><span
                                                            style="color: #c0c0c0;">LinkedIn</span></a>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                <!-- Unsubscribe -->
                                <tr>
                                    <td align="center" style="border-top: 1px solid #2d4150; padding-top: 25px;">
                                        <p style="margin: 0 0 10px 0; font-size: 12px; color: #8a9ca8;">
                                            You're receiving this email because you subscribed to our newsletter.
                                        </p>
                                        <p style="margin: 0; font-size: 12px;">
                                            <a href="#" style="color: #8a9ca8; text-decoration: underline;"><span
                                                    style="color: #8a9ca8;">Unsubscribe</span></a>
                                            &nbsp;•&nbsp;
                                            <a href="#" style="color: #8a9ca8; text-decoration: underline;"><span
                                                    style="color: #8a9ca8;">View
                                                    in Browser</span></a>
                                            &nbsp;•&nbsp;
                                            <a href="#" style="color: #8a9ca8; text-decoration: underline;"><span
                                                    style="color: #8a9ca8;">Update
                                                    Preferences</span></a>
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Email Footer Text -->
                    <tr>
                        <td align="center" style="padding: 30px 20px;">
                            <p style="margin: 0; font-size: 12px; color: #425466;">
                                © 2026 PRSM Allergy Foundation. All rights reserved.<br>
                                123 Research Drive, Medical Park, CA 94000
                            </p>
                        </td>
                    </tr>

                </table>
                <!-- End Email Container -->

            </td>
        </tr>
    </table>
    <!-- End Wrapper Table -->

</body>

</html>`
        await sendEmails(payload.emails, payload.title, html)
        return ({ message: "Email sent successfully" })

    } catch (error) {
        const payload = req.data

        throw new HttpsError("Internal", error)
    }






})