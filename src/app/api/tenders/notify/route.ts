import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { tenderId, changeDescription, invitees, tenderTitle, projectName } = await request.json()

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'RESEND_API_KEY not configured' }, { status: 500 })
  }

  try {
    const { Resend } = await import('resend')
    const resend = new Resend(apiKey)

    const emailPromises = invitees.map((invitee: { email: string; name: string }) =>
      resend.emails.send({
        from: 'Grimmond Construction <noreply@grimmondconstruction.com.au>',
        to: invitee.email,
        subject: `Tender Update — ${tenderTitle}`,
        html: `
          <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px;">
            <h2 style="color: #0f172a; margin-bottom: 8px;">Tender Document Update</h2>
            <p style="color: #64748b;">Hi ${invitee.name},</p>
            <p style="color: #334155;">The following change has been made to the tender <strong>${tenderTitle}</strong> for <strong>${projectName}</strong>:</p>
            <div style="background: #f8fafc; border-left: 4px solid #f59e0b; padding: 16px; margin: 16px 0; border-radius: 4px;">
              <p style="color: #0f172a; margin: 0;">${changeDescription}</p>
            </div>
            <p style="color: #334155;">Please review the updated documents before the tender close date.</p>
            <p style="color: #94a3b8; font-size: 14px; margin-top: 32px;">Grimmond Construction</p>
          </div>
        `,
      })
    )

    await Promise.all(emailPromises)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Email send error:', error)
    return NextResponse.json({ error: 'Failed to send emails' }, { status: 500 })
  }
}
