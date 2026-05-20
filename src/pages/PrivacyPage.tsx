export default function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold font-display mb-6">Privacy Policy</h1>

      <div className="space-y-6 text-sm text-text-secondary leading-relaxed">
        <p>
          Last updated: May 2026
        </p>

        <section>
          <h2 className="text-lg font-bold font-display text-text-primary mb-2">Data Storage</h2>
          <p>
            This app uses your browser's <strong className="text-text-primary">localStorage</strong> to save
            your team configurations, player settings, and preferences. This data never leaves your device. It
            is not sent to any server, and we have no access to it.
          </p>
          <p className="mt-2">
            If you clear your browser data or switch devices, your saved settings will be lost.
            Use the JSON export feature in Settings to back up your data.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold font-display text-text-primary mb-2">No Account System</h2>
          <p>
            There is no user registration, login, or account system. The app does not collect names,
            email addresses, or any personal information.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold font-display text-text-primary mb-2">Analytics</h2>
          <p>
            This app uses <strong className="text-text-primary">Google Analytics 4</strong> to understand how the
            app is used. This includes page views, feature usage (such as which tabs you open, quiz activity, and
            rotation changes), and general engagement metrics. Google Analytics uses cookies to distinguish unique
            users and sessions.
          </p>
          <p className="mt-2">
            The data collected is anonymous and aggregated. No personally identifiable information (such as names
            or email addresses) is collected through analytics. Google may process this data on servers outside your
            country. You can learn more about how Google handles data at{' '}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400 hover:text-amber-300 underline"
            >
              Google Privacy Policy
            </a>.
          </p>
          <p className="mt-2">
            You can opt out of Google Analytics tracking by installing the{' '}
            <a
              href="https://tools.google.com/dlpage/gaoptout"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400 hover:text-amber-300 underline"
            >
              Google Analytics Opt-out Browser Add-on
            </a>.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold font-display text-text-primary mb-2">Cookies and Third-Party Services</h2>
          <p>
            This app uses cookies through Google Analytics to track anonymous usage data (as described above).
            In the future, advertisements may be displayed on this site (e.g., through Google AdSense).
            Third-party ad vendors may use cookies to serve ads based on your browsing activity. These cookies
            are managed by the respective ad networks.
          </p>
          <p className="mt-2">
            Google's use of advertising cookies enables it and its partners to serve ads based on your visit to
            this site and/or other sites on the Internet. You may opt out of personalized advertising by visiting{' '}
            <a
              href="https://www.google.com/settings/ads"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400 hover:text-amber-300 underline"
            >
              Google Ads Settings
            </a>.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold font-display text-text-primary mb-2">Changes to This Policy</h2>
          <p>
            This privacy policy may be updated from time to time. Any changes will be reflected on this page
            with an updated date.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold font-display text-text-primary mb-2">Contact</h2>
          <p>
            If you have questions about this policy, feel free to open an issue on the{' '}
            <a
              href="https://github.com/alihas7621/volleyball-rotations-trainer/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400 hover:text-amber-300 underline"
            >
              GitHub repository
            </a>.
          </p>
        </section>
      </div>
    </div>
  );
}
