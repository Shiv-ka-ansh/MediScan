import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

// Only initialize Resend if API key is present
let resend = null;
if (process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY);
}

// Log configuration (but mask API key)
console.log('--- Email Service Configuration ---');
console.log('RESEND_API_KEY:', process.env.RESEND_API_KEY ? 'Present (masked)' : 'Missing - email features disabled');
console.log('CLIENT_URL:', process.env.CLIENT_URL || 'Not set');
console.log('-----------------------------------');

// Use Resend's default testing domain if not verified
const FROM_EMAIL = 'onboarding@resend.dev'; // Default for testing/unverified domains

/**
 * Check if email service is available
 */
function isEmailServiceAvailable() {
    if (!resend) {
        console.warn('⚠️ Email service not configured. Set RESEND_API_KEY to enable emails.');
        return false;
    }
    return true;
}

/**
 * Send email verification link
 */
export async function sendVerificationEmail(to, token) {
    if (!isEmailServiceAvailable()) {
        console.log(`[MOCK] Would send verification email to: ${to}`);
        return { id: 'mock-email-disabled' };
    }

    const verifyUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

    try {
        console.log(`Attempting to send verification email to: ${to}`);
        const { data, error } = await resend.emails.send({
            from: `MedScan AI <${FROM_EMAIL}>`,
            to: [to],
            subject: 'Verify Your MedScan AI Account',
            html: `
                <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background: #0F172A; color: #E2E8F0; padding: 40px; border-radius: 16px;">
                    <div style="text-align: center; margin-bottom: 32px;">
                        <h1 style="color: #22D3EE; margin: 0;">MedScan AI</h1>
                        <p style="color: #64748B; font-size: 14px;">Neural Health Platform</p>
                    </div>
                    <h2 style="color: white; margin-bottom: 16px;">Verify Your Email</h2>
                    <p style="color: #94A3B8; line-height: 1.6;">
                        Welcome to MedScan AI! Click the button below to verify your email address and activate your neural link.
                    </p>
                    <div style="text-align: center; margin: 32px 0;">
                        <a href="${verifyUrl}" style="display: inline-block; background: linear-gradient(135deg, #06B6D4, #14B8A6); color: white; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: bold;">
                            Verify Email
                        </a>
                    </div>
                    <p style="color: #64748B; font-size: 12px; text-align: center;">
                        If you didn't create an account, you can safely ignore this email.
                    </p>
                </div>
            `,
        });

        if (error) {
            console.error('Resend error:', error);
            throw new Error(error.message);
        }

        return data;
    } catch (error) {
        console.error('Email sending failed:', error);
        throw error;
    }
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(to, token) {
    if (!isEmailServiceAvailable()) {
        console.log(`[MOCK] Would send password reset email to: ${to}`);
        return { id: 'mock-email-disabled' };
    }

    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;

    try {
        console.log(`Attempting to send password reset email to: ${to}`);
        const { data, error } = await resend.emails.send({
            from: `MedScan AI <${FROM_EMAIL}>`,
            to: [to],
            subject: 'Reset Your MedScan AI Password',
            html: `
                <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background: #0F172A; color: #E2E8F0; padding: 40px; border-radius: 16px;">
                    <div style="text-align: center; margin-bottom: 32px;">
                        <h1 style="color: #22D3EE; margin: 0;">MedScan AI</h1>
                        <p style="color: #64748B; font-size: 14px;">Password Recovery</p>
                    </div>
                    <h2 style="color: white; margin-bottom: 16px;">Reset Your Password</h2>
                    <p style="color: #94A3B8; line-height: 1.6;">
                        You requested to reset your password. Click the button below to set a new password.
                    </p>
                    <div style="text-align: center; margin: 32px 0;">
                        <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #06B6D4, #14B8A6); color: white; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: bold;">
                            Reset Password
                        </a>
                    </div>
                    <p style="color: #64748B; font-size: 12px; text-align: center;">
                        This link expires in 1 hour. If you didn't request this, you can ignore this email.
                    </p>
                </div>
            `,
        });

        if (error) {
            console.error('Resend error:', error);
            throw new Error(error.message);
        }

        return data;
    } catch (error) {
        console.error('Password reset email failed:', error);
        throw error;
    }
}

/**
 * Send notification email
 */
export async function sendNotificationEmail(to, subject, message) {
    if (!isEmailServiceAvailable()) {
        console.log(`[MOCK] Would send notification email to: ${to}, subject: ${subject}`);
        return { id: 'mock-email-disabled' };
    }

    try {
        console.log(`Attempting to send notification email to: ${to}, subject: ${subject}`);
        const { data, error } = await resend.emails.send({
            from: `MedScan AI <${FROM_EMAIL}>`,
            to: [to],
            subject: subject,
            html: `
                <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background: #0F172A; color: #E2E8F0; padding: 40px; border-radius: 16px;">
                    <div style="text-align: center; margin-bottom: 32px;">
                        <h1 style="color: #22D3EE; margin: 0;">MedScan AI</h1>
                        <p style="color: #64748B; font-size: 14px;">Notification</p>
                    </div>
                    <p style="color: #94A3B8; line-height: 1.6;">${message}</p>
                </div>
            `,
        });

        if (error) throw new Error(error.message);
        return data;
    } catch (error) {
        console.error('Notification email failed:', error);
        throw error;
    }
}
