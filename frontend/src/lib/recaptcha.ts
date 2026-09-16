/**
 * Google reCAPTCHA Verification Helper
 * Validates reCAPTCHA token against Google's siteverify API.
 */

export interface RecaptchaVerifyResult {
  success: boolean
  score?: number
  action?: string
  challengeTs?: string
  hostname?: string
  error?: string
}

export async function verifyRecaptcha(
  token: string | undefined | null,
  clientIp?: string,
): Promise<RecaptchaVerifyResult> {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY

  // If secret key is not configured (e.g. local development, tests, or before admin sets up keys),
  // allow with a warning so the application does not block developers/tests.
  if (!secretKey) {
    if (process.env.NODE_ENV !== 'production') {
      // console.warn('[reCAPTCHA] RECAPTCHA_SECRET_KEY is not set. Bypassing check in non-production.')
    }
    return { success: true }
  }

  // If secret is set but user submitted no token
  if (!token || typeof token !== 'string' || token.trim() === '') {
    return {
      success: false,
      error: 'กรุณายืนยันตัวตนว่าไม่ใช่โปรแกรมอัตโนมัติ (reCAPTCHA is required)',
    }
  }

  try {
    const params = new URLSearchParams()
    params.append('secret', secretKey)
    params.append('response', token.trim())
    if (clientIp && clientIp !== 'unknown') {
      params.append('remoteip', clientIp)
    }

    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
      // 5 second timeout to prevent hanging on external network delay
      signal: AbortSignal.timeout(5000),
    })

    if (!response.ok) {
      console.error('[reCAPTCHA] Google verification endpoint error status:', response.status)
      return {
        success: false,
        error: 'ไม่สามารถติดต่อระบบตรวจสอบ reCAPTCHA ได้ กรุณาลองใหม่อีกครั้ง',
      }
    }

    const data = await response.json()

    if (!data.success) {
      const errorCodes = Array.isArray(data['error-codes']) ? data['error-codes'].join(', ') : 'invalid'
      console.warn('[reCAPTCHA] Verification failed:', errorCodes)
      return {
        success: false,
        error: 'การยืนยันตัวตนล้มเหลว กรุณาลองติ๊กยืนยันอีกครั้ง',
      }
    }

    return {
      success: true,
      score: typeof data.score === 'number' ? data.score : undefined,
      action: typeof data.action === 'string' ? data.action : undefined,
      challengeTs: typeof data.challenge_ts === 'string' ? data.challenge_ts : undefined,
      hostname: typeof data.hostname === 'string' ? data.hostname : undefined,
    }
  } catch (error) {
    console.error('[reCAPTCHA] Network or verification error:', error)
    return {
      success: false,
      error: 'ระบบตรวจสอบ reCAPTCHA เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง',
    }
  }
}
