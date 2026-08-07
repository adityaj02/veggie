import React, { useEffect } from 'react'
import './PrivacyPolicy.css'

export default function PrivacyPolicy() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="privacy-page">
      <header className="privacy-header">
        <h1>Privacy Policy</h1>
        <p>Last updated: October 24, 2023</p>
      </header>

      <div className="privacy-content">
        <section>
          <h2>Introduction</h2>
          <p>
            Welcome to Veggies Kitchen. We respect your privacy and are committed to protecting your personal data. 
            This privacy policy will inform you as to how we look after your personal data when you visit our website 
            and tell you about your privacy rights and how the law protects you.
          </p>
        </section>

        <section>
          <h2>The Data We Collect About You</h2>
          <p>
            We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:
          </p>
          <ul>
            <li><strong>Identity Data</strong> includes first name, last name, username or similar identifier.</li>
            <li><strong>Contact Data</strong> includes delivery address, billing address, email address and telephone numbers.</li>
            <li><strong>Financial Data</strong> includes bank account and payment card details (processed securely via our payment partners).</li>
            <li><strong>Transaction Data</strong> includes details about payments to and from you and other details of products and services you have purchased from us.</li>
            <li><strong>Technical Data</strong> includes internet protocol (IP) address, your login data, browser type and version, time zone setting and location.</li>
          </ul>
        </section>

        <section>
          <h2>How We Use Your Data</h2>
          <p>We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:</p>
          <ul>
            <li>Where we need to perform the contract we are about to enter into or have entered into with you (e.g., fulfilling an order).</li>
            <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
            <li>Where we need to comply with a legal obligation.</li>
          </ul>
        </section>

        <section>
          <h2>Data Security</h2>
          <p>
            We have put in place appropriate security measures to prevent your personal data from being accidentally lost, 
            used or accessed in an unauthorised way, altered or disclosed. In addition, we limit access to your personal data 
            to those employees, agents, contractors and other third parties who have a business need to know. 
            They will only process your personal data on our instructions and they are subject to a duty of confidentiality.
          </p>
        </section>

        <section>
          <h2>Your Legal Rights</h2>
          <p>Under certain circumstances, you have rights under data protection laws in relation to your personal data, including the right to:</p>
          <ul>
            <li>Request access to your personal data.</li>
            <li>Request correction of your personal data.</li>
            <li>Request erasure of your personal data.</li>
            <li>Object to processing of your personal data.</li>
            <li>Request restriction of processing your personal data.</li>
          </ul>
          <p>
            If you wish to exercise any of the rights set out above, please <a href="#contact">contact us</a>.
          </p>
        </section>
      </div>
    </div>
  )
}
