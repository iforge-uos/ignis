import { Separator } from "@packages/ui/components/separator";
import { createFileRoute } from "@tanstack/react-router";
import Title from "@/components/title";
import { IForgeLogo } from "@/icons/IForge";

function RouteComponent() {
  return (
    <>
      <Title prompt="Privacy Policy" />
      <div className="p-8">
        <div className="flex justify-center">
          <IForgeLogo className="w-72" />
        </div>
        <Separator className="mt-5 mb-5" />
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-futura mb-4">iForge Makerspace Privacy Policy</h1>
          <p className="my-3 leading-7">
            This privacy notice tells you what to expect us to do with your personal information.
          </p>
            <h2 className="text-3xl font-futura mb-2">Table of contents:</h2>

          <ul className="list-disc my-3">
            <li>
              <a href="#contact" className="link-underline text-primary">
                Contact details
              </a>
            </li>
            <li>
              <a href="#collect" className="link-underline text-primary">
                What information we collect, use, and why
              </a>
            </li>
            <li>
              <a href="#lawful" className="link-underline text-primary">
                Lawful bases and data protection rights
              </a>
            </li>
            <li>
              <a href="#infofrom" className="link-underline text-primary">
                Where we get personal information from
              </a>
            </li>
            <li>
              <a href="#retention" className="link-underline text-primary">
                How long we keep information
              </a>
            </li>
            <li>
              <a href="#share" className="link-underline text-primary">
                Who we share information with
              </a>
            </li>
            <li>
              <a href="#complain" className="link-underline text-primary">
                How to complain
              </a>
            </li>
          </ul>
          <h2 id="contact" className="text-3xl font-futura mt-8 mb-4">
            Contact details
          </h2>
          <h3 className="text-xl font-futura my-1">Email</h3>
          <a className="my-3 leading-7 link-underline text-primary" href="mailto:iforge@sheffield.ac.uk">
            iforge@sheffield.ac.uk
          </a>
          <h2 id="collect" className="text-3xl font-futura mt-8 mb-4">
            What information we collect, use, and why
          </h2>
          <p className="my-3 leading-7">
            We collect or use the following information <b>for user education and welfare</b>:
          </p>
          <ul className="list-disc my-3 ml-6">
            <li>Names and contact details for users</li>
            <li>Personal pronouns</li>
            <li>Payment details and financial information including transactions</li>
            <li>Photographs</li>
            <li>Sign in data</li>
            <li>Exclusion/suspension information</li>
          </ul>
          <p className="my-3 leading-7">
            We collect or use the following information{" "}
            <b>for disciplinary investigations or to prevent, detect, investigate or prosecute crimes</b>:
          </p>
          <ul className="list-disc my-3 ml-6">
            <li>Names and contact details for users</li>
            <li>Personal pronouns</li>
            <li>Sign in data</li>
            <li>Records and reports</li>
          </ul>
          <p className="my-3 leading-7">
            We collect or use the following personal information for <b>dealing with queries, complaints or claims</b>:
          </p>
          <ul className="list-disc my-3 ml-6">
            <li>Names and contact details</li>
            <li>Personal pronouns</li>
            <li>Account login or user information</li>
            <li>Purchase history</li>
            <li>Correspondence</li>
            <li>Sign in data</li>
            <li>User sessions and other website usage</li>
          </ul>
          <p className="my-3 leading-7">
            We collect or use the following information <b>for information updates or marketing purposes</b>:
          </p>
          <ul className="list-disc my-3 ml-6">
            <li>Names and contact details</li>
            <li>Marketing preferences</li>
            <li>Records of consent, where appropriate</li>
          </ul>
          <p className="my-3 leading-7">
            We collect or use the following information <b>for recruitment purposes</b>:
          </p>
          <ul className="list-disc my-3 ml-6">
            <li>Contact details (e.g. name, degree, year of study and personal email address)</li>
          </ul>
          <h2 id="lawful" className="text-3xl font-futura mt-8 mb-4">
            Lawful bases and data protection rights
          </h2>
          <p className="my-3 leading-7">
            Under UK data protection law, we must have a “lawful basis” for collecting and using your personal
            information. There is a list of possible{" "}
            <a
              href="https://ico.org.uk/for-organisations/advice-for-small-organisations/getting-started-with-gdpr/data-protection-principles-definitions-and-key-terms/#lawfulbasis"
              target="_blank"
              rel="noopener noreferrer"
              className="link-underline text-primary"
            >
              lawful bases
            </a>{" "}
            in the UK GDPR. You can find out more about lawful bases on the ICO's website.
          </p>
          <p className="my-3 leading-7">
            Which lawful basis we rely on may affect your data protection rights which are set out in brief below. You
            can find out more about your data protection rights and the exemptions which may apply on the ICO's website:
          </p>
          <ul className="list-disc my-3 ml-6">
            <li>
              <b>Your right of access</b> - You have the right to ask us for copies of your personal information. You
              can request other information such as details about where we get personal information from and who we
              share personal information with. There are some exemptions which means you may not receive all the
              information you ask for.{" "}
              <a
                href="https://ico.org.uk/for-organisations/advice-for-small-organisations/privacy-notices-and-cookies/create-your-own-privacy-notice/your-data-protection-rights/#roa"
                target="_blank"
                rel="noopener noreferrer"
                className="link-underline text-primary"
              >
                Read more about the right of access
              </a>
              .
            </li>
            <li>
              <b>Your right to rectification</b> - You have the right to ask us to correct or delete personal
              information you think is inaccurate or incomplete.{" "}
              <a
                href="https://ico.org.uk/for-organisations/advice-for-small-organisations/privacy-notices-and-cookies/create-your-own-privacy-notice/your-data-protection-rights/#rtr"
                target="_blank"
                rel="noopener noreferrer"
                className="link-underline text-primary"
              >
                Read more about the right to rectification
              </a>
              .
            </li>
            <li>
              <b>Your right to erasure</b> - You have the right to ask us to delete your personal information.{" "}
              <a
                href="https://ico.org.uk/for-organisations/advice-for-small-organisations/privacy-notices-and-cookies/create-your-own-privacy-notice/your-data-protection-rights/#rte"
                target="_blank"
                rel="noopener noreferrer"
                className="link-underline text-primary"
              >
                Read more about the right to erasure
              </a>
              .
            </li>
            <li>
              <b>Your right to restriction of processing</b> - You have the right to ask us to limit how we can use your
              personal information.{" "}
              <a
                href="https://ico.org.uk/for-organisations/advice-for-small-organisations/privacy-notices-and-cookies/create-your-own-privacy-notice/your-data-protection-rights/#rtrop"
                target="_blank"
                rel="noopener noreferrer"
                className="link-underline text-primary"
              >
                Read more about the right to restriction of processing
              </a>
              .
            </li>
            <li>
              <b>Your right to object to processing</b> - You have the right to object to the processing of your
              personal data.{" "}
              <a
                href="https://ico.org.uk/for-organisations/advice-for-small-organisations/privacy-notices-and-cookies/create-your-own-privacy-notice/your-data-protection-rights/#rto"
                target="_blank"
                rel="noopener noreferrer"
                className="link-underline text-primary"
              >
                Read more about the right to object to processing
              </a>
              .
            </li>
            <li>
              <b>Your right to data portability</b> - You have the right to ask that we transfer the personal
              information you gave us to another organisation, or to you.{" "}
              <a
                href="https://ico.org.uk/for-organisations/advice-for-small-organisations/privacy-notices-and-cookies/create-your-own-privacy-notice/your-data-protection-rights/#rtdp"
                target="_blank"
                rel="noopener noreferrer"
                className="link-underline text-primary"
              >
                Read more about the right to data portability
              </a>
              .
            </li>
            <li>
              <b>Your right to withdraw consent</b> - When we use consent as our lawful basis you have the right to
              withdraw your consent at any time.{" "}
              <a
                href="https://ico.org.uk/for-organisations/advice-for-small-organisations/privacy-notices-and-cookies/create-your-own-privacy-notice/your-data-protection-rights/#rtwc"
                target="_blank"
                rel="noopener noreferrer"
                className="link-underline text-primary"
              >
                Read more about the right to withdraw consent
              </a>
              .
            </li>
          </ul>
          <p className="my-3 leading-7">
            If you make a request, we must respond to you without undue delay and in any event within one month.
          </p>
          <p className="my-3 leading-7">
            To make a data protection rights request, please contact us using the contact details at the top of this
            privacy notice.
          </p>
          <h3 className="text-xl font-futura my-4">Our lawful bases for the collection and use of your data</h3>
          <p className="my-3 leading-7">
            Our lawful bases for collecting or using personal information <b>for user education and welfare</b> are:
          </p>
          <ul className="list-disc my-3 ml-6">
            <li>
              Consent - we have permission from you after we gave you all the relevant information. All your data
              protection rights may apply, except the right to object. To be clear, you do have the right to withdraw
              your consent at any time.
            </li>
            <li>
              Legitimate interests - we're collecting or using your information because it benefits you, our
              organisation or someone else, without causing an undue risk of harm to anyone. All your data protection
              rights may apply, except the right to portability. Our legitimate interests are:
              <ul className="list-circle my-3 ml-6">
                <li>
                  We need data to prove that the iForge is being used otherwise it may have its resources cut. If the
                  iForge were to be shutdown members of the university would be worse off.
                </li>
              </ul>
            </li>
          </ul>
          <p className="my-3 leading-7">
            For more information on our use of legitimate interests as a lawful basis you can contact us using the
            contact details set out above.
          </p>
          <p className="my-3 leading-7">
            Our lawful bases for collecting or using personal information{" "}
            <b>for disciplinary investigations or to prevent, detect, investigate or prosecute crimes</b> are:
          </p>
          <ul className="list-disc my-3 ml-6">
            <li>
              Consent - we have permission from you after we gave you all the relevant information. All your data
              protection rights may apply, except the right to object. To be clear, you do have the right to withdraw
              your consent at any time.
            </li>
            <li>
              Legal obligation - we must collect or use your information so we can comply with the law. All your data
              protection rights may apply, except the right to erasure, the right to object and the right to data
              portability.
            </li>
          </ul>
          <p className="my-3 leading-7">
            Our lawful bases for collecting or using personal information for{" "}
            <b>dealing with queries, complaints or claims</b> are:
          </p>
          <ul className="list-disc my-3 ml-6">
            <li>
              Consent - we have permission from you after we gave you all the relevant information. All your data
              protection rights may apply, except the right to object. To be clear, you do have the right to withdraw
              your consent at any time.
            </li>
            <li>
              Legitimate interests - we're collecting or using your information because it benefits you, our
              organisation or someone else, without causing an undue risk of harm to anyone. All your data protection
              rights may apply, except the right to portability. Our legitimate interests are:
              <ul className="list-circle my-3 ml-6">
                <li>
                  We need user session information (User IDs, Browser information, Device details, User actions that led
                  to errors, URL parameters, Stack traces (which might contain user inputs)) to debug problems with the
                  website. We use Sentry.io for this it is the industry standard for tracking problems we avoid
                  transferring any personally identifiable information to our Sentry hosted sever located in the EU.
                  Sentry's security &amp; compliance can be found at{" "}
                  <a href="https://sentry.io/security/#data-security-and-privacy" className="link-underline">
                    https://sentry.io/security/#data-security-and-privacy
                  </a>
                  , we have agreed to their Data Processing Addendum.
                </li>
              </ul>
            </li>
          </ul>
          <p className="my-3 leading-7">
            Our lawful bases for collecting or using personal information{" "}
            <b>for information updates or marketing purposes</b> are:
          </p>
          <ul className="list-disc my-3 ml-6">
            <li>
              Consent - we have permission from you after we gave you all the relevant information. All of your data
              protection rights may apply, except the right to object. To be clear, you do have the right to withdraw
              your consent at any time.
            </li>
          </ul>
          <p className="my-3 leading-7">
            Our lawful bases for collecting or using personal information <b>for recruitment purposes</b> are:
          </p>
          <p className="my-3 leading-7">
            Our lawful bases for collecting or using personal information <b>to comply with legal requirements</b> are:
          </p>
          <ul className="list-disc my-3 ml-6">
            <li>
              Consent - we have permission from you after we gave you all the relevant information. All of your data
              protection rights may apply, except the right to object. To be clear, you do have the right to withdraw
              your consent at any time.
            </li>
            <li>
              Legal obligation - we have to collect or use your information so we can comply with the law. All of your
              data protection rights may apply, except the right to erasure, the right to object and the right to data
              portability.
            </li>
          </ul>
          <h2 id="infofrom" className="text-3xl font-futura mt-8 mb-4">
            Where we get personal information from
          </h2>
          <ul className="list-disc my-3 ml-6">
            <li>Directly from you</li>
            <li>From the University's records</li>
          </ul>
          <h2 id="retention" className="text-3xl font-futura mt-8 mb-4">
            How long we keep information
          </h2>
          <p className="my-3 leading-7">
            Data is retained until graduation and then anonymised or after 7 days of request. iForge usage data is
            anonymised whilst retaining the department after graduation/deletion to allow for historic statistics.
          </p>
          <p className="my-3 leading-7">
            For more information on how long we store your personal information or the criteria we use to determine this
            please contact us using the details provided above.
          </p>
          <h2 id="share" className="text-3xl font-futura mt-8 mb-4">
            Who we share information with
          </h2>
          <p>
            Our publicity team can display photos on our website, social media or other marketing and information media.
            We will never display personal information on our social media channels without prior consent. Please let us
            know if you do not wish to participate in photos.
          </p>

          <h3 className="text-xl font-futura my-4">Others we share personal information with</h3>
          <ul className="list-disc my-3 ml-6">
            <li>
              Multidisciplinary Engineering Education department and the Faculty of Engineering inside the University
            </li>
          </ul>
          <h2 id="complain" className="text-3xl font-futura mt-8 mb-4">
            How to complain
          </h2>
          <p className="my-3 leading-7">
            If you have any concerns about our use of your personal data, you can make a complaint to us using the
            contact details at the top of this privacy notice.
          </p>
          <h2 className="text-3xl font-futura mt-8 mb-4">Last updated</h2>
          <p>August 31, 2025</p>
        </div>
      </div>
    </>
  );
}

export const Route = createFileRoute("/privacy-policy")({
  component: RouteComponent,
});
