import Link from 'next/link';

export const metadata = {
  title: 'Terms of Service | ForMe',
  description: 'ForMe Technologies, Inc. Terms of Service',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-stone-950">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300 transition-colors mb-10"
        >
          &larr; Back to ForMe
        </Link>

        <h1 className="text-3xl font-bold text-stone-900 dark:text-stone-100 tracking-tight mb-2">Terms of Service</h1>
        <p className="text-sm text-stone-400 dark:text-stone-500 mb-12">Effective Date: January 1, 2026</p>

        <div className="prose prose-stone prose-sm max-w-none [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-stone-900 dark:[&_h2]:text-stone-100 [&_h2]:mt-10 [&_h2]:mb-4 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-stone-800 dark:[&_h3]:text-stone-200 [&_h3]:mt-6 [&_h3]:mb-3 [&_p]:text-stone-600 dark:[&_p]:text-stone-400 [&_p]:leading-relaxed [&_ul]:text-stone-600 dark:[&_ul]:text-stone-400 [&_li]:text-stone-600 dark:[&_li]:text-stone-400 [&_a]:text-stone-600 dark:[&_a]:text-stone-400 [&_a]:underline hover:[&_a]:text-stone-800 dark:hover:[&_a]:text-stone-200">

          <p>
            If you are a licensed professional, student, apprentice, or business owner using the ForMe
            platform to manage your services, connect with clients, or promote your business, these Terms
            of Service apply to your use of the platform.
          </p>

          <p>
            These Terms of Service (the &ldquo;Terms,&rdquo; &ldquo;Terms of Service,&rdquo; or &ldquo;Agreement&rdquo;) govern the use
            of the mobile and internet-based services offered by ForMe Technologies, Inc. (&ldquo;ForMe,&rdquo;
            &ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;), including services provided through:
          </p>
          <ul>
            <li>the ForMe website</li>
            <li>the ForMe mobile application</li>
            <li>the ForMe technology platform</li>
          </ul>
          <p>
            These services, applications, websites, and technologies are collectively referred to as the
            &ldquo;Services&rdquo; or the &ldquo;ForMe Platform.&rdquo;
          </p>
          <p>
            These Terms also include all referenced policies and agreements, including but not limited to
            the <Link href="/privacy" className="underline hover:text-stone-800">Privacy Policy</Link>.
          </p>

          <h2>Please Read These Terms Carefully</h2>
          <p>
            This is a legal agreement between you and ForMe that governs your access to and use of the Services.
          </p>
          <p>
            By creating an account, accessing the platform, or using any part of the Services, you acknowledge that:
          </p>
          <ul>
            <li>You have read, understood, and agree to these Terms</li>
            <li>You agree to be legally bound by this Agreement</li>
            <li>You have the legal capacity to enter into a binding contract</li>
          </ul>
          <p>The Services are not available to individuals under the age of 18.</p>
          <p>By using the Services, you represent and warrant that:</p>
          <ul>
            <li>You are at least 18 years old</li>
            <li>You have the authority to enter into this Agreement</li>
            <li>You will comply with all applicable laws and regulations</li>
          </ul>
          <p>If you do not agree with these Terms, you may not access or use the Services.</p>

          <h2>Intellectual Property</h2>
          <p>The ForMe Platform is protected by intellectual property laws, including:</p>
          <ul>
            <li>copyright laws</li>
            <li>trademark laws</li>
            <li>trade secret laws</li>
            <li>international intellectual property treaties</li>
          </ul>
          <p>
            Unauthorized copying, reproduction, distribution, or modification of any part of the Services or
            the ForMe Platform may result in civil and criminal penalties.
          </p>
          <p>The Services are licensed to users, not sold.</p>

          <h2>I. Services</h2>
          <p>
            ForMe is a marketplace platform that connects clients with licensed professionals.
            Clients (&ldquo;Clients&rdquo; or &ldquo;Users&rdquo;) may use the platform to discover, book, and pay for
            professional services (&ldquo;Professional Services&rdquo;) provided by independent licensed
            professionals (&ldquo;Professionals&rdquo;).
          </p>
          <p>Professionals on the platform may include individuals working in industries such as:</p>
          <ul>
            <li>fitness training</li>
            <li>barbering</li>
            <li>cosmetology</li>
            <li>esthetics</li>
            <li>tattoo artistry</li>
            <li>beauty services</li>
            <li>wellness services</li>
            <li>other licensed or professional services</li>
          </ul>
          <p>Clients and Professionals are collectively referred to as &ldquo;Users.&rdquo;</p>

          <h3>Platform Role</h3>
          <p>ForMe only provides the technology platform that allows Users to connect.</p>
          <p>ForMe does not provide Professional Services and does not employ Professionals.</p>
          <p>
            Professionals are independent service providers, and Clients contract directly with the
            Professional for any Professional Services.
          </p>
          <p>ForMe does not control:</p>
          <ul>
            <li>the quality of services</li>
            <li>pricing</li>
            <li>scheduling</li>
            <li>licensing verification</li>
            <li>service outcomes</li>
          </ul>
          <p>
            Any decision to request, book, or provide services is made solely at the discretion of the Users involved.
          </p>

          <h3>No Guarantees</h3>
          <p>ForMe aims to verify reliability but does not guarantee:</p>
          <ul>
            <li>the quality of Professional Services</li>
            <li>the reliability of Professionals</li>
            <li>the accuracy of user profiles</li>
            <li>the credentials or licensing status of Professionals</li>
          </ul>
          <p>ForMe does not routinely conduct background checks or verify identity information.</p>
          <p>Users agree that they assume all risk when interacting with other Users.</p>

          <h3>Scheduling</h3>
          <p>
            Although the platform attempts to display real-time availability, scheduling conflicts may occur.
            Creating a booking does not guarantee that a Professional will complete the appointment.
            ForMe cannot guarantee uninterrupted access to the Services.
          </p>

          <h2>II. Payments</h2>
          <p>
            When using the ForMe Platform to book Professional Services, you agree to pay all applicable
            fees and charges (&ldquo;Charges&rdquo;).
          </p>
          <p>Charges may include:</p>
          <ul>
            <li>Professional service fees</li>
            <li>tips for Professionals</li>
            <li>booking or platform fees</li>
            <li>taxes</li>
            <li>other applicable charges</li>
          </ul>
          <p>Professional service pricing is determined solely by the Professional.</p>

          <h3>Authorization Holds</h3>
          <p>
            Prior to your appointment, an authorization hold may be placed on your payment method to
            verify available funds. The final charge will typically occur after the scheduled appointment time.
          </p>

          <h3>Cancellation Policies</h3>
          <p>Each Professional may establish their own cancellation policy.</p>
          <p>
            If an appointment is cancelled outside the allowed cancellation window, you may be charged a
            Cancellation Fee. ForMe may also apply a Disruption Fee for repeated cancellations or misuse of the platform.
            Cancellation or disruption fees may equal the full cost of the reservation.
          </p>

          <h3>Payment Processing</h3>
          <p>
            ForMe uses third-party payment processors to facilitate payments between Clients and Professionals.
            By providing payment information, you authorize:
          </p>
          <ul>
            <li>ForMe</li>
            <li>its payment processors</li>
          </ul>
          <p>to process payments on your behalf.</p>
          <p>
            ForMe is not responsible for errors, delays, or fees caused by third-party payment processors.
          </p>

          <h2>III. User Accounts</h2>
          <p>To access certain Services, you must create a ForMe account (&ldquo;Account&rdquo;).</p>
          <p>You agree to:</p>
          <ul>
            <li>provide accurate and complete information</li>
            <li>keep your account information updated</li>
            <li>maintain the confidentiality of your login credentials</li>
          </ul>
          <p>You are fully responsible for all activities conducted through your Account.</p>

          <h2>IV. Account Termination</h2>
          <p>ForMe reserves the right to suspend or terminate accounts if Users:</p>
          <ul>
            <li>violate these Terms</li>
            <li>engage in fraudulent activity</li>
            <li>misuse the platform</li>
            <li>provide false information</li>
          </ul>
          <p>Termination may occur with or without notice.</p>
          <p>Upon termination, your right to access the platform ends immediately.</p>

          <h2>V. Platform Use Rules</h2>
          <p>Users agree not to:</p>
          <ul>
            <li>impersonate another person</li>
            <li>harass or threaten other users</li>
            <li>violate applicable laws</li>
            <li>upload malicious software</li>
            <li>scrape or mine platform data</li>
            <li>sell or transfer accounts</li>
          </ul>
          <p>Violations may result in account suspension or permanent removal.</p>

          <h2>VI. Disclaimers</h2>
          <p>The Services are provided &ldquo;AS IS&rdquo; and &ldquo;AS AVAILABLE.&rdquo;</p>
          <p>ForMe makes no guarantees regarding:</p>
          <ul>
            <li>service availability</li>
            <li>platform reliability</li>
            <li>professional service quality</li>
          </ul>
          <p>Users interact with other Users at their own risk.</p>

          <h2>VII. Limitation of Liability</h2>
          <p>To the fullest extent permitted by law, ForMe shall not be liable for:</p>
          <ul>
            <li>indirect damages</li>
            <li>lost profits</li>
            <li>personal disputes between Users</li>
            <li>service dissatisfaction</li>
          </ul>

          <h2>VIII. Indemnification</h2>
          <p>You agree to defend and indemnify ForMe against claims arising from:</p>
          <ul>
            <li>your use of the platform</li>
            <li>violations of these Terms</li>
            <li>disputes with other Users</li>
          </ul>

          <h2>IX. Privacy</h2>
          <p>
            Your use of the Services is also governed by the{' '}
            <Link href="/privacy" className="underline hover:text-stone-800">ForMe Privacy Policy</Link>,
            which explains how we collect, use, and protect personal information.
          </p>

          <h2>X. Governing Law</h2>
          <p>These Terms are governed by the laws of the State of California.</p>
          <p>Any disputes must be resolved in the courts located in Los Angeles, CA.</p>
        </div>
      </div>
    </div>
  );
}
