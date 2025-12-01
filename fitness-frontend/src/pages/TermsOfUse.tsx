import React from 'react';
import { useTelegram } from '../hooks/useTelegram';
import { getColorScheme } from '../utils/colors';

export const TermsOfUse: React.FC = () => {
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
        Terms of Use
      </h1>

      <p style={{ ...paragraphStyle, fontSize: '12px', color: colorScheme.muted }}>
        Last updated: {new Date().toLocaleDateString()}
      </p>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>1. Acceptance of Terms</h2>
        <p style={paragraphStyle}>
          By accessing and using the Telegram Fitness App, you accept and agree to be bound by the terms and provision of this agreement.
        </p>
      </section>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>2. Use License</h2>
        <p style={paragraphStyle}>
          Permission is granted to temporarily use the Telegram Fitness App for personal, non-commercial fitness purposes only. This is the grant of a license, not a transfer of title, and under this license you may not:
        </p>
        <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
          <li style={{ marginBottom: '8px' }}>Modify or copy the materials</li>
          <li style={{ marginBottom: '8px' }}>Use the materials for any commercial purpose</li>
          <li style={{ marginBottom: '8px' }}>Attempt to reverse engineer any software contained in the app</li>
        </ul>
      </section>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>3. Disclaimer</h2>
        <p style={paragraphStyle}>
          The materials in the Telegram Fitness App are provided on an 'as is' basis. The app makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
        </p>
        <p style={paragraphStyle}>
          <strong>Important:</strong> The workout plans and fitness advice provided by this app are for informational purposes only. Always consult with a healthcare professional before starting any new exercise program. The app is not a substitute for professional medical advice, diagnosis, or treatment.
        </p>
      </section>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>4. Limitations</h2>
        <p style={paragraphStyle}>
          In no event shall the Telegram Fitness App or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials in the app, even if the app or an authorized representative has been notified orally or in writing of the possibility of such damage.
        </p>
      </section>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>5. Accuracy of Materials</h2>
        <p style={paragraphStyle}>
          The materials appearing in the Telegram Fitness App could include technical, typographical, or photographic errors. The app does not warrant that any of the materials on its platform are accurate, complete, or current.
        </p>
      </section>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>6. Modifications</h2>
        <p style={paragraphStyle}>
          The Telegram Fitness App may revise these terms of service at any time without notice. By using this app, you are agreeing to be bound by the then current version of these terms of service.
        </p>
      </section>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>7. Contact Information</h2>
        <p style={paragraphStyle}>
          If you have any questions about these Terms of Use, please contact us through the Telegram bot associated with this app.
        </p>
      </section>
    </div>
  );
};



