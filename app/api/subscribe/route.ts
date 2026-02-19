import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { getDailyVerse } from '@/lib/verses';

// Lazy-initialize to avoid build errors when RESEND_API_KEY is not set
let _resend: Resend | null = null;
function getResend() {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY || '');
  }
  return _resend;
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Get today's verse for welcome email
    const verse = getDailyVerse();

    // Send welcome email
    const { data, error } = await getResend().emails.send({
      from: 'Bible Verse Randomizer <hello@bibleverserandomizer.com>',
      to: email,
      subject: 'Welcome to Your Daily Verse Journey',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #1e293b;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background: linear-gradient(to bottom, #fefce8, #ffffff);
              }
              .container {
                background: white;
                border-radius: 12px;
                padding: 40px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
              }
              .header {
                text-align: center;
                margin-bottom: 30px;
              }
              h1 {
                color: #0f172a;
                font-size: 24px;
                margin: 0 0 10px;
              }
              .verse-container {
                background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
                border-left: 4px solid #f59e0b;
                border-radius: 8px;
                padding: 24px;
                margin: 24px 0;
              }
              .verse-text {
                font-family: Georgia, 'Times New Roman', serif;
                font-size: 18px;
                line-height: 1.7;
                color: #1e293b;
                margin: 0 0 12px;
                font-style: italic;
              }
              .verse-reference {
                font-weight: 600;
                color: #0f172a;
                text-align: right;
                margin: 0;
              }
              .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
                font-size: 14px;
                color: #64748b;
              }
              .cta {
                text-align: center;
                margin: 24px 0;
              }
              .button {
                display: inline-block;
                padding: 12px 24px;
                background: #0f172a;
                color: white;
                text-decoration: none;
                border-radius: 6px;
                font-weight: 600;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Welcome to Your Daily Verse Journey</h1>
                <p>Thank you for subscribing! You'll receive a beautiful verse each morning to inspire your day.</p>
              </div>
              
              <div class="verse-container">
                <p class="verse-text">${verse.text}</p>
                <p class="verse-reference">— ${verse.reference}</p>
              </div>

              <div class="cta">
                <a href="https://bibleverserandomizer.com" class="button">Discover More Verses</a>
              </div>

              <div class="footer">
                <p><strong>From the makers of Sermon Clips</strong></p>
                <p>Want to turn Bible verses into stunning video clips for your church?</p>
                <p><a href="https://sermon-clips.com" style="color: #f59e0b;">Try Sermon Clips →</a></p>
                <p style="margin-top: 20px; font-size: 12px;">
                  You're receiving this because you subscribed at bibleverserandomizer.com
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to process subscription' },
      { status: 500 }
    );
  }
}
