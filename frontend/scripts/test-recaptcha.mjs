import { verifyRecaptcha } from '../src/lib/recaptcha.ts'

console.log('Testing reCAPTCHA verification helper...')

// 1. Test without secret key (graceful bypass in dev/test)
delete process.env.RECAPTCHA_SECRET_KEY
const bypassResult = await verifyRecaptcha(undefined)
if (!bypassResult.success) {
  throw new Error('Expected bypass to succeed when RECAPTCHA_SECRET_KEY is not set')
}
console.log('✓ PASS: Graceful bypass when RECAPTCHA_SECRET_KEY is empty')

// 2. Test with secret key but missing token
process.env.RECAPTCHA_SECRET_KEY = 'test-secret-key'
const missingTokenResult = await verifyRecaptcha('')
if (missingTokenResult.success || !missingTokenResult.error) {
  throw new Error('Expected failure when secret key is set but token is missing')
}
console.log('✓ PASS: Rejects missing token when RECAPTCHA_SECRET_KEY is active')

// 3. Test with secret key and invalid token (Google API rejection)
const invalidTokenResult = await verifyRecaptcha('invalid-fake-token', '127.0.0.1')
if (invalidTokenResult.success) {
  throw new Error('Expected rejection with invalid fake token')
}
console.log('✓ PASS: Rejects invalid token from Google API')

// Reset env
delete process.env.RECAPTCHA_SECRET_KEY

console.log('\n🎉 All reCAPTCHA verification tests passed!')
