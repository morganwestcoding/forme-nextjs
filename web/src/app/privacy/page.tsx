import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy | ForMe',
  description: 'ForMe Technologies Privacy Policy',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-stone-950">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300 transition-colors mb-10"
        >
          &larr; Back to ForMe
        </Link>

        <h1 className="text-3xl font-bold text-stone-900 dark:text-stone-100 tracking-tight mb-2">ForMe Privacy Policy</h1>
        <p className="text-sm text-stone-400 dark:text-stone-500 mb-12">Effective Date: January 1, 2026</p>

        <div className="prose prose-stone prose-sm max-w-none [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-stone-900 dark:[&_h2]:text-stone-100 [&_h2]:mt-10 [&_h2]:mb-4 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-stone-800 dark:[&_h3]:text-stone-200 [&_h3]:mt-6 [&_h3]:mb-3 [&_p]:text-stone-600 dark:[&_p]:text-stone-400 [&_p]:leading-relaxed [&_ul]:text-stone-600 dark:[&_ul]:text-stone-400 [&_li]:text-stone-600 dark:[&_li]:text-stone-400 [&_a]:text-stone-600 dark:[&_a]:text-stone-400 [&_a]:underline hover:[&_a]:text-stone-800 dark:hover:[&_a]:text-stone-200">

          <h2>1. Introduction</h2>
          <p>Welcome to ForMe.</p>
          <p>
            ForMe Technologies (&ldquo;ForMe,&rdquo; &ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;) respects your privacy and is
            committed to protecting the personal information you share with us when using our platform.
          </p>
          <p>This Privacy Policy explains how we collect, use, store, and share information when you use:</p>
          <ul>
            <li>the ForMe mobile application</li>
            <li>the ForMe website</li>
            <li>services provided through the ForMe platform</li>
          </ul>
          <p>These services are collectively referred to as the &ldquo;Platform.&rdquo;</p>
          <p>
            By using the Platform, you agree to the collection and use of information in accordance with this
            Privacy Policy.
          </p>

          <h2>2. Information We Collect</h2>
          <p>We may collect several types of information when you use the Platform.</p>

          <h3>Personal Information</h3>
          <p>Information you voluntarily provide when creating an account or using the platform, including:</p>
          <ul>
            <li>Name</li>
            <li>Email address</li>
            <li>Phone number</li>
            <li>Profile information</li>
            <li>Business information (for professionals)</li>
            <li>Licensing details (if applicable)</li>
          </ul>

          <h3>Account Information</h3>
          <p>
            When you create a profile as a consumer, licensed professional, or business, we may collect:
          </p>
          <ul>
            <li>Profile photos</li>
            <li>Service descriptions</li>
            <li>Portfolio content</li>
            <li>Business location</li>
            <li>Scheduling availability</li>
          </ul>

          <h3>Payment Information</h3>
          <p>
            Payments on the platform may be processed through third-party payment processors such as Stripe.
          </p>
          <p>
            ForMe does not store full credit card numbers. Payment information is securely handled by the
            payment processor.
          </p>
          <p>However, we may collect:</p>
          <ul>
            <li>transaction history</li>
            <li>payment confirmations</li>
            <li>payout details for professionals</li>
          </ul>

          <h3>Usage Data</h3>
          <p>We automatically collect certain information when you use the platform, including:</p>
          <ul>
            <li>IP address</li>
            <li>device type</li>
            <li>browser type</li>
            <li>app usage activity</li>
            <li>pages visited</li>
            <li>search activity within the app</li>
          </ul>

          <h3>Location Information</h3>
          <p>With your permission, the platform may collect location data to help:</p>
          <ul>
            <li>find nearby professionals</li>
            <li>show local services</li>
            <li>improve search results</li>
          </ul>
          <p>You may disable location services at any time through your device settings.</p>

          <h2>3. How We Use Your Information</h2>
          <p>We use your information to operate and improve the ForMe platform.</p>
          <p>This includes:</p>

          <h3>Operating the Platform</h3>
          <ul>
            <li>Creating and managing user accounts</li>
            <li>Enabling service bookings</li>
            <li>Connecting consumers with professionals</li>
          </ul>

          <h3>Processing Transactions</h3>
          <ul>
            <li>Facilitating payments</li>
            <li>Managing professional payouts</li>
            <li>Preventing fraud</li>
          </ul>

          <h3>Communication</h3>
          <ul>
            <li>Sending confirmations and notifications</li>
            <li>Providing customer support</li>
            <li>Sending updates about platform features</li>
          </ul>

          <h3>Platform Improvement</h3>
          <ul>
            <li>Analyzing usage trends</li>
            <li>Improving search results</li>
            <li>Enhancing user experience</li>
          </ul>

          <h2>4. How We Share Information</h2>
          <p>We may share information in the following situations.</p>

          <h3>With Other Users</h3>
          <p>
            When you book a service, your information may be shared with the professional providing the service.
          </p>
          <p>This may include:</p>
          <ul>
            <li>name</li>
            <li>contact information</li>
            <li>appointment details</li>
          </ul>
          <p>Professionals may also display public profile information such as:</p>
          <ul>
            <li>name</li>
            <li>portfolio photos</li>
            <li>services offered</li>
          </ul>

          <h3>With Service Providers</h3>
          <p>We may share information with trusted partners that help operate the platform, including:</p>
          <ul>
            <li>payment processors</li>
            <li>cloud storage providers</li>
            <li>analytics providers</li>
            <li>customer support tools</li>
          </ul>
          <p>These partners only access information necessary to perform their services.</p>

          <h3>Legal Requirements</h3>
          <p>We may disclose information if required to:</p>
          <ul>
            <li>comply with legal obligations</li>
            <li>respond to lawful requests</li>
            <li>protect the safety of users</li>
            <li>prevent fraud or abuse</li>
          </ul>

          <h2>5. Data Security</h2>
          <p>
            We implement reasonable administrative, technical, and physical safeguards to protect user information.
          </p>
          <p>However, no internet transmission or storage system is 100% secure.</p>
          <p>Users should also take steps to protect their accounts by:</p>
          <ul>
            <li>using secure passwords</li>
            <li>not sharing login credentials</li>
          </ul>

          <h2>6. User Rights</h2>
          <p>Depending on your location, you may have rights to:</p>
          <ul>
            <li>access your personal data</li>
            <li>update your account information</li>
            <li>request deletion of your account</li>
            <li>request copies of stored data</li>
          </ul>
          <p>Requests can be made by contacting us at the email listed below.</p>

          <h2>7. Data Retention</h2>
          <p>We retain personal information only as long as necessary to:</p>
          <ul>
            <li>provide services</li>
            <li>comply with legal obligations</li>
            <li>resolve disputes</li>
            <li>enforce agreements</li>
          </ul>

          <h2>8. Children&rsquo;s Privacy</h2>
          <p>The ForMe platform is not intended for individuals under the age of 18.</p>
          <p>We do not knowingly collect personal information from minors.</p>

          <h2>9. Third-Party Links</h2>
          <p>The platform may contain links to third-party services.</p>
          <p>ForMe is not responsible for the privacy practices of external websites or services.</p>

          <h2>10. Updates to This Policy</h2>
          <p>We may update this Privacy Policy periodically.</p>
          <p>When updates occur, the Effective Date will be revised at the top of this document.</p>
          <p>Continued use of the platform indicates acceptance of the updated policy.</p>

          <h2>11. Contact Information</h2>
          <p>If you have questions regarding this Privacy Policy, please contact:</p>
          <p>
            ForMe LLC Technologies<br />
            Email: <a href="mailto:formeappllc@gmail.com">formeappllc@gmail.com</a><br />
            Website: <a href="https://www.formeapp.com" target="_blank" rel="noopener noreferrer">www.formeapp.com</a>
          </p>
        </div>
      </div>
    </div>
  );
}
