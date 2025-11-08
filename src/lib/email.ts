import nodemailer from 'nodemailer'

type SendEmailOptions = {
  to: string
  subject: string
  text?: string
  html?: string
}

function getTransport() {
  const host = process.env.SMTP_HOST
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS

  if (!host || !port || !user || !pass) {
    return null
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass }
  })
}

export async function sendEmail(options: SendEmailOptions) {
  const transporter = getTransport()

  // If SMTP is not configured, log and exit gracefully
  if (!transporter) {
    console.warn('[email] SMTP not configured. Email skipped for:', options.to)
    return { skipped: true }
  }

  const from = process.env.EMAIL_FROM || 'noreply@pastro.com'

  const info = await transporter.sendMail({
    from,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html
  })

  return { messageId: info.messageId }
}



