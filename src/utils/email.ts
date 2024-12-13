import { firestore } from '../config/firebase';
import { collection, addDoc, updateDoc, doc, getDoc, getDocs, query, where, orderBy } from 'firebase/firestore';
import { securityLogger } from './securityLogger';
import nodemailer from 'nodemailer';

const SENDGRID_API_KEY = import.meta.env.VITE_SENDGRID_API_KEY || '';

// Initialize nodemailer with SMTP transport
const transporter = nodemailer.createTransport({
  host: 'smtp.sendgrid.net',
  port: 587,
  secure: false,
  auth: {
    user: 'apikey',
    pass: SENDGRID_API_KEY
  }
});

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  variables: string[];
  createdAt: string;
  updatedAt: string;
}

export interface EmailLog {
  id: string;
  templateId: string;
  to: string;
  subject: string;
  status: 'sent' | 'failed';
  error?: string;
  sentAt: string;
  openedAt?: string;
  clickedAt?: string;
}

export const sendEmail = async (
  to: string,
  subject: string,
  body: string,
  templateId?: string
): Promise<boolean> => {
  try {
    const mailOptions = {
      from: import.meta.env.VITE_EMAIL_FROM || 'noreply@trackhab.com',
      to,
      subject,
      html: body,
      trackingSettings: {
        clickTracking: { enable: true },
        openTracking: { enable: true }
      }
    };

    await transporter.sendMail(mailOptions);

    // Log successful email
    await addDoc(collection(firestore, 'emailLogs'), {
      to,
      templateId,
      subject,
      status: 'sent',
      sentAt: new Date().toISOString()
    });

    securityLogger.logSystemEvent(
      `Email sent successfully to ${to}`,
      'low',
      { templateId }
    );

    return true;
  } catch (error) {
    console.error('Email send error:', error);

    // Log failed email
    await addDoc(collection(firestore, 'emailLogs'), {
      to,
      templateId,
      subject,
      status: 'failed',
      error: error.message,
      sentAt: new Date().toISOString()
    });

    securityLogger.logSystemEvent(
      `Failed to send email to ${to}`,
      'medium',
      { error: error.message, templateId }
    );

    return false;
  }
};

export const getEmailTemplate = async (templateId: string): Promise<EmailTemplate | null> => {
  try {
    const templateDoc = await getDoc(doc(firestore, 'emailTemplates', templateId));
    if (!templateDoc.exists()) return null;
    return { id: templateDoc.id, ...templateDoc.data() } as EmailTemplate;
  } catch (error) {
    console.error('Failed to get email template:', error);
    return null;
  }
};

export const sendTemplatedEmail = async (
  to: string,
  templateId: string,
  variables: Record<string, string>
): Promise<boolean> => {
  try {
    const template = await getEmailTemplate(templateId);
    if (!template) throw new Error('Template not found');

    let body = template.body;
    Object.entries(variables).forEach(([key, value]) => {
      body = body.replace(new RegExp(`{{${key}}}`, 'g'), value);
    });

    return await sendEmail(to, template.subject, body, templateId);
  } catch (error) {
    console.error('Failed to send templated email:', error);
    return false;
  }
};

export const getEmailStats = async (timeRange: string): Promise<{
  sent: number;
  failed: number;
  openRate: number;
  clickRate: number;
}> => {
  try {
    const logsRef = collection(firestore, 'emailLogs');
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(timeRange));

    const snapshot = await getDocs(query(
      logsRef,
      where('sentAt', '>=', startDate.toISOString()),
      orderBy('sentAt', 'desc')
    ));

    const logs = snapshot.docs.map(doc => doc.data() as EmailLog);
    const total = logs.length;
    const sent = logs.filter(log => log.status === 'sent').length;
    const opened = logs.filter(log => log.openedAt).length;
    const clicked = logs.filter(log => log.clickedAt).length;

    return {
      sent,
      failed: total - sent,
      openRate: total > 0 ? (opened / total) * 100 : 0,
      clickRate: total > 0 ? (clicked / total) * 100 : 0
    };
  } catch (error) {
    console.error('Failed to get email stats:', error);
    return {
      sent: 0,
      failed: 0,
      openRate: 0,
      clickRate: 0
    };
  }
};