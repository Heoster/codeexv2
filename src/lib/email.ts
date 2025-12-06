'use client';

import emailjs from 'emailjs-com';

// EmailJS configuration
const SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || '';
const CONTACT_TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || '';
const WELCOME_TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_WELCOME_TEMPLATE_ID || '';
const USER_ID = process.env.NEXT_PUBLIC_EMAILJS_USER_ID || '';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://codeex-ai.netlify.app';

export interface ContactEmailParams {
  user_name: string;
  user_email: string;
  message: string;
}

export interface WelcomeEmailParams {
  to_email: string;
  to_name: string;
  app_url: string;
}

/**
 * Check if EmailJS is properly configured
 */
export function isEmailConfigured(): boolean {
  return !!(SERVICE_ID && USER_ID && SERVICE_ID !== 'your_emailjs_service_id_here');
}

/**
 * Check if welcome email template is configured
 */
export function isWelcomeEmailConfigured(): boolean {
  return !!(isEmailConfigured() && WELCOME_TEMPLATE_ID && WELCOME_TEMPLATE_ID !== 'your_emailjs_welcome_template_id_here');
}

/**
 * Send a contact form email
 */
export async function sendContactEmail(params: ContactEmailParams): Promise<{ success: boolean; error?: string }> {
  if (!isEmailConfigured() || !CONTACT_TEMPLATE_ID) {
    return { 
      success: false, 
      error: 'Email service is not configured. Please set up EmailJS in your environment variables.' 
    };
  }

  try {
    await emailjs.send(SERVICE_ID, CONTACT_TEMPLATE_ID, {
      ...params,
      app_url: APP_URL,
    }, USER_ID);
    
    return { success: true };
  } catch (error) {
    console.error('Failed to send contact email:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return { success: false, error: errorMessage };
  }
}

/**
 * Send a welcome email to new users
 */
export async function sendWelcomeEmail(email: string, displayName: string): Promise<{ success: boolean; error?: string }> {
  if (!isWelcomeEmailConfigured()) {
    console.log('Welcome email not configured, skipping...');
    console.log(`Would send welcome email to: ${email} (${displayName})`);
    return { success: true }; // Don't fail if not configured
  }

  try {
    await emailjs.send(SERVICE_ID, WELCOME_TEMPLATE_ID, {
      to_email: email,
      to_name: displayName,
      app_url: APP_URL,
      app_name: 'CODEEX AI',
      support_email: 'the.heoster@mail.com',
    }, USER_ID);
    
    console.log(`Welcome email sent to: ${email}`);
    return { success: true };
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return { success: false, error: errorMessage };
  }
}
