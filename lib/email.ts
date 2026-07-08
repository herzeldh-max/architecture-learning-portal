import nodemailer from 'nodemailer'

const subjects = {
  login: 'קוד אימות כניסה לפורטל',
  change_name: 'קוד אימות לשינוי שם משתמש',
  change_password: 'קוד אימות לשינוי סיסמה',
}

function createTransporter() {
  return nodemailer.createTransport({
    host: 'smtp.mail.yahoo.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  })
}

export async function sendVerificationCode(
  to: string,
  code: string,
  purpose: 'login' | 'change_name' | 'change_password'
) {
  const transporter = createTransporter()
  const subject = subjects[purpose]
  const from = `"פורטל לימוד - אדריכלות" <${process.env.EMAIL_USER}>`

  const html = `
    <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 440px; margin: 0 auto; background: #f8fafc; padding: 24px; border-radius: 12px;">
      <div style="background: #1a3c5e; padding: 16px 24px; border-radius: 8px 8px 0 0; text-align: center;">
        <h2 style="color: white; margin: 0; font-size: 18px;">פורטל לימוד - אדריכלות ועיצוב פנים</h2>
        <p style="color: #a0c4e8; margin: 4px 0 0; font-size: 13px;">המכללה הטכנולוגית בבאר שבע</p>
      </div>
      <div style="background: white; padding: 28px 24px; border-radius: 0 0 8px 8px; border: 1px solid #e2e8f0; border-top: none;">
        <p style="color: #374151; font-size: 15px; margin: 0 0 8px; font-weight: 600;">${subject}</p>
        <p style="color: #6b7280; font-size: 14px; margin: 0 0 20px;">הקוד שלך הוא:</p>
        <div style="background: #f0f4f8; border: 2px dashed #1a3c5e; border-radius: 10px; padding: 20px; text-align: center; margin: 0 0 24px;">
          <span style="font-size: 40px; font-weight: bold; letter-spacing: 12px; color: #1a3c5e; font-family: monospace;">${code}</span>
        </div>
        <p style="color: #6b7280; font-size: 13px; margin: 0 0 8px;">הקוד תקף למשך 10 דקות בלבד.</p>
        <p style="color: #9ca3af; font-size: 12px; margin: 0;">אם לא ביקשת קוד זה, התעלם מהודעה זו.</p>
      </div>
    </div>
  `

  await transporter.sendMail({ from, to, subject, html })
}
