import React from 'react';
import { useTelegram } from '../hooks/useTelegram';
import { getColorScheme } from '../utils/colors';

export const PrivacyPolicy: React.FC = () => {
  const { themeParams, WebApp } = useTelegram();
  const colorScheme = getColorScheme(themeParams);

  const containerStyle: React.CSSProperties = {
    minHeight: '100vh',
    backgroundColor: colorScheme.background,
    color: colorScheme.text,
    padding: '20px',
    maxWidth: '800px',
    margin: '0 auto',
    lineHeight: '1.6',
  };

  const headingStyle: React.CSSProperties = {
    color: colorScheme.primary,
    marginTop: '24px',
    marginBottom: '12px',
    fontSize: '20px',
    fontWeight: '600',
  };

  const paragraphStyle: React.CSSProperties = {
    marginBottom: '16px',
    fontSize: '14px',
    color: colorScheme.text,
  };

  const sectionStyle: React.CSSProperties = {
    marginBottom: '24px',
  };

  const backButtonStyle: React.CSSProperties = {
    padding: '12px 24px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: colorScheme.button,
    color: colorScheme.buttonText,
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    marginBottom: '24px',
  };

  const handleBack = () => {
    if (WebApp?.BackButton) {
      WebApp.BackButton.hide();
    }
    window.history.back();
  };

  React.useEffect(() => {
    if (WebApp?.BackButton) {
      WebApp.BackButton.show();
      WebApp.BackButton.onClick(handleBack);
    }
    return () => {
      if (WebApp?.BackButton) {
        WebApp.BackButton.offClick(handleBack);
      }
    };
  }, [WebApp]);

  return (
    <div style={containerStyle}>
      <button onClick={handleBack} style={backButtonStyle}>
        ← Back
      </button>

      <h1 style={{ ...headingStyle, fontSize: '24px', marginTop: 0 }}>
        Privacy Policy
      </h1>

      <p style={{ ...paragraphStyle, fontSize: '12px', color: colorScheme.muted }}>
        Last updated: {new Date().toLocaleDateString()}
      </p>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>1. Introduction</h2>
        <p style={paragraphStyle}>
          The Telegram Fitness App ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Telegram Mini App.
        </p>
      </section>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>2. Information We Collect</h2>
        <p style={paragraphStyle}>
          We collect information that you provide directly to us, including:
        </p>
        <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
          <li style={{ marginBottom: '8px' }}>
            <strong>Telegram User Data:</strong> Your Telegram user ID, username, first name, and profile photo (if available) when you authenticate through Telegram
          </li>
          <li style={{ marginBottom: '8px' }}>
            <strong>Fitness Profile:</strong> Your fitness level, goals, workout preferences, available equipment, and any injuries or limitations you provide
          </li>
          <li style={{ marginBottom: '8px' }}>
            <strong>Workout Data:</strong> Generated workout plans, completed workouts, and exercise results
          </li>
          <li style={{ marginBottom: '8px' }}>
            <strong>Payment Information:</strong> Transaction data when you make payments through TON blockchain (wallet addresses, transaction hashes)
          </li>
        </ul>
      </section>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>3. How We Use Your Information</h2>
        <p style={paragraphStyle}>
          We use the information we collect to:
        </p>
        <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
          <li style={{ marginBottom: '8px' }}>Provide, maintain, and improve our fitness services</li>
          <li style={{ marginBottom: '8px' }}>Generate personalized workout plans based on your preferences</li>
          <li style={{ marginBottom: '8px' }}>Track your workout progress and history</li>
          <li style={{ marginBottom: '8px' }}>Process payments and transactions</li>
          <li style={{ marginBottom: '8px' }}>Send you updates and notifications about your workouts</li>
          <li style={{ marginBottom: '8px' }}>Analyze usage patterns to improve our app</li>
        </ul>
      </section>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>4. Data Storage and Security</h2>
        <p style={paragraphStyle}>
          Your data is stored securely on our servers. We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
        </p>
        <p style={paragraphStyle}>
          However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your information, we cannot guarantee absolute security.
        </p>
      </section>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>5. Third-Party Services</h2>
        <p style={paragraphStyle}>
          Our app uses the following third-party services:
        </p>
        <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
          <li style={{ marginBottom: '8px' }}>
            <strong>Telegram:</strong> For authentication and app hosting
          </li>
          <li style={{ marginBottom: '8px' }}>
            <strong>OpenAI:</strong> For AI-powered workout plan generation
          </li>
          <li style={{ marginBottom: '8px' }}>
            <strong>TON Blockchain:</strong> For payment processing via TON Connect
          </li>
          <li style={{ marginBottom: '8px' }}>
            <strong>Analytics Services:</strong> For app usage analytics (Telegram Mini Apps Analytics SDK)
          </li>
        </ul>
        <p style={paragraphStyle}>
          These services have their own privacy policies governing the collection and use of your information.
        </p>
      </section>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>6. Data Retention</h2>
        <p style={paragraphStyle}>
          We retain your personal information for as long as necessary to provide our services and fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law.
        </p>
      </section>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>7. Your Rights</h2>
        <p style={paragraphStyle}>
          You have the right to:
        </p>
        <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
          <li style={{ marginBottom: '8px' }}>Access your personal data</li>
          <li style={{ marginBottom: '8px' }}>Request correction of inaccurate data</li>
          <li style={{ marginBottom: '8px' }}>Request deletion of your data</li>
          <li style={{ marginBottom: '8px' }}>Opt-out of certain data collection practices</li>
        </ul>
        <p style={paragraphStyle}>
          To exercise these rights, please contact us through the Telegram bot associated with this app.
        </p>
      </section>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>8. Children's Privacy</h2>
        <p style={paragraphStyle}>
          Our app is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.
        </p>
      </section>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>9. Changes to This Privacy Policy</h2>
        <p style={paragraphStyle}>
          We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
        </p>
      </section>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>10. Contact Us</h2>
        <p style={paragraphStyle}>
          If you have any questions about this Privacy Policy, please contact us through the Telegram bot associated with this app.
        </p>
      </section>
    </div>
  );
};



