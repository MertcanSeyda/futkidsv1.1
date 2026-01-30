import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
    private transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
            tls: {
                rejectUnauthorized: false
            }
        });
    }

    async sendUserWelcome(user: any, password: string) {
        if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
            console.log('⚠️  Email gönderilemedi: SMTP ayarları .env dosyasında eksik.');
            console.log(`📧  Simüle edilen email: Kime: ${user.email}, Şifre: ${password}`);
            return;
        }

        const mailOptions = {
            from: '"FUTKIDS Altyapı Sistemi" <' + process.env.SMTP_USER + '>',
            to: user.email,
            subject: 'FUTKIDS Sistemine Hoş Geldiniz! ⚽',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #2563eb; text-align: center;">Aramıza Hoş Geldin!</h2>
          <p>Merhaba <strong>${user.fullName}</strong>,</p>
          <p>FUTKIDS altyapı yönetim sistemine kaydınız oluşturuldu.</p>
          
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Giriş Bilgileriniz:</strong></p>
            <p style="margin: 5px 0;">E-posta: ${user.email}</p>
            <p style="margin: 5px 0;">Şifre: <strong>${password}</strong></p>
          </div>

          <p>Lütfen giriş yaptıktan sonra şifrenizi değiştirmeyi unutmayın.</p>
          <br>
          <p style="text-align: center;">
            <a href="http://localhost:3000" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Sisteme Giriş Yap</a>
          </p>
        </div>
      `,
        };

        try {
            await this.transporter.sendMail(mailOptions);
            console.log(`✅ Hoşgeldin maili gönderildi: ${user.email}`);
        } catch (error) {
            console.error('❌ Mail gönderme hatası:', error);
        }
    }
}
