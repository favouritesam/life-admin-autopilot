import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email, taskTitle, dueDate, priority } = await request.json()

    if (!email || !taskTitle || !dueDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // In production, integrate with email service like:
    // - SendGrid
    // - Resend
    // - AWS SES
    // - Mailgun
    // - Nodemailer with SMTP

    // For now, we'll log the email that would be sent
    console.log('Email Reminder:', {
      to: email,
      subject: `Task Reminder: ${taskTitle}`,
      body: `
        You have a task coming up:
        
        Task: ${taskTitle}
        Due Date: ${new Date(dueDate).toLocaleDateString()}
        Priority: ${priority}
        
        Don't forget to complete it on time!
      `,
    })

    // Example SendGrid integration (uncomment and configure):
    /*
    const sgMail = require('@sendgrid/mail')
    sgMail.setApiKey(process.env.SENDGRID_API_KEY)
    
    const msg = {
      to: email,
      from: 'noreply@lifeadmin.com',
      subject: `Task Reminder: ${taskTitle}`,
      text: `You have a task coming up: ${taskTitle} due on ${new Date(dueDate).toLocaleDateString()}`,
      html: `<strong>You have a task coming up: ${taskTitle}</strong><br>Due: ${new Date(dueDate).toLocaleDateString()}`,
    }
    
    await sgMail.send(msg)
    */

    return NextResponse.json({ success: true, message: 'Email reminder sent' })
  } catch (error) {
    console.error('Error sending email reminder:', error)
    return NextResponse.json(
      { error: 'Failed to send email reminder' },
      { status: 500 }
    )
  }
}
