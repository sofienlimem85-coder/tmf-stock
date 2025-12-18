import { Injectable } from '@nestjs/common';
import * as brevo from '@getbrevo/brevo';

@Injectable()
export class EmailService {
  private apiInstance: brevo.TransactionalEmailsApi;

  constructor() {
    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) {
      console.warn('BREVO_API_KEY is not configured - email service will not work');
      return;
    }

    this.apiInstance = new brevo.TransactionalEmailsApi();
    this.apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, apiKey);
  }

  async sendVerificationCode(email: string, code: string): Promise<void> {
    if (!this.apiInstance) {
      throw new Error('Email service not configured. Please set BREVO_API_KEY in .env');
    }

    const sendSmtpEmail = new brevo.SendSmtpEmail();
    
    sendSmtpEmail.subject = 'Code de vérification - TMF Stock';
    sendSmtpEmail.htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #344D59;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background-color: #ffffff;
              border-radius: 0.75rem;
              padding: 2rem;
              border: 1px solid #e5e7eb;
            }
            .header {
              text-align: center;
              margin-bottom: 2rem;
            }
            .logo {
              color: #137C8B;
              font-size: 1.5rem;
              font-weight: 600;
              margin-bottom: 0.5rem;
            }
            .code-box {
              background-color: #f0f9ff;
              border: 2px solid #137C8B;
              border-radius: 0.5rem;
              padding: 1.5rem;
              text-align: center;
              margin: 2rem 0;
            }
            .code {
              font-size: 2rem;
              font-weight: 700;
              color: #137C8B;
              letter-spacing: 0.5rem;
              font-family: 'Courier New', monospace;
            }
            .footer {
              margin-top: 2rem;
              padding-top: 1rem;
              border-top: 1px solid #e5e7eb;
              font-size: 0.875rem;
              color: #6b7280;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">TMF Stock</div>
              <h1>Vérification de votre compte</h1>
            </div>
            <p>Bonjour,</p>
            <p>Merci de vous être inscrit sur TMF Stock. Pour activer votre compte, veuillez utiliser le code de vérification suivant :</p>
            <div class="code-box">
              <div class="code">${code}</div>
            </div>
            <p>Ce code est valide pendant 10 minutes.</p>
            <p>Si vous n'avez pas demandé ce code, veuillez ignorer cet email.</p>
            <div class="footer">
              <p>© ${new Date().getFullYear()} TMF Stock. Tous droits réservés.</p>
            </div>
          </div>
        </body>
      </html>
    `;
    sendSmtpEmail.textContent = `
      Bonjour,
      
      Merci de vous être inscrit sur TMF Stock. Pour activer votre compte, veuillez utiliser le code de vérification suivant :
      
      ${code}
      
      Ce code est valide pendant 10 minutes.
      
      Si vous n'avez pas demandé ce code, veuillez ignorer cet email.
      
      © ${new Date().getFullYear()} TMF Stock. Tous droits réservés.
    `;
    sendSmtpEmail.sender = {
      name: 'TMF Stock',
      email: process.env.EMAIL_FROM_ADDRESS || 'sofien.limem85@gmail.com',
    };
    sendSmtpEmail.to = [{ email }];

    try {
      await this.apiInstance.sendTransacEmail(sendSmtpEmail);
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send verification email');
    }
  }
}

