import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';

export default function Home() {
  const [menuActive, setMenuActive] = useState(false);

  const toggleMenu = () => setMenuActive(!menuActive);

  return (
    <>
      <Head>
        <title>NASPRO IT Services</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="stylesheet" href="/style.css" />
      </Head>

      <div className="top-right-menu">
        <div
          className="hamburger"
          onClick={toggleMenu}
          role="button"
          tabIndex={0}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              toggleMenu();
            }
          }}
          aria-label="Menu toggle"
          aria-expanded={menuActive}
        >
          <span></span>
          <span></span>
          <span></span>
        </div>
        <nav className={`menu-items ${menuActive ? 'active' : ''}`} aria-hidden={!menuActive}>
          <a href="#services">Services</a>
          <a href="#why-choose-us">Why Choose Us?</a>
          <a href="#faq">FAQ</a>
        </nav>
      </div>

      <header>
        <h1>NASPRO IT Services</h1>
        <p>Your partner in digital growth</p>
      </header>

      <section id="services" className="services">
        <div className="card">
          <h3>Web &amp; App Development</h3>
          <p>Custom-built, scalable, and high-performance websites and mobile apps for every industry.</p>
          <p className="price">PKR 30,000</p>
          <Link href="/checkout?service=webapp"><a className="buy-btn">Buy Now</a></Link>
        </div>
        <div className="card">
          <h3>Domain &amp; Hosting</h3>
          <p>Fast, secure, and reliable hosting with premium domain registration services.</p>
          <p className="price">Starting from PKR 3,500/year</p>
          <Link href="/checkout?service=domainhosting"><a className="buy-btn">Buy Now</a></Link>
        </div>
        <div className="card">
          <h3>Branding &amp; Logo Design</h3>
          <p>Memorable brand identities and creative designs that leave a lasting impression.</p>
          <p className="price">PKR 5,000</p>
          <Link href="/checkout?service=branding"><a className="buy-btn">Buy Now</a></Link>
        </div>
        <div className="card">
          <h3>E-Commerce &amp; Payment Solutions</h3>
          <p>Fully functional online stores with seamless payment gateway integration.</p>
          <p className="price">PKR 50,000</p>
          <Link href="/checkout?service=ecommerce"><a className="buy-btn">Buy Now</a></Link>
        </div>
        <div className="card">
          <h3>Cloud &amp; IT Infrastructure</h3>
          <p>Secure cloud hosting, data backups, and IT infrastructure management.</p>
          <p className="price">Custom Pricing</p>
          <Link href="/checkout?service=cloudit"><a className="buy-btn">Buy Now</a></Link>
        </div>
        <div className="card">
          <h3>Digital Marketing</h3>
          <p>Grow your online presence with SEO, social media, and targeted ad campaigns.</p>
          <p className="price">Starting at PKR 15,000/month</p>
          <Link href="/checkout?service=digitalmarketing"><a className="buy-btn">Buy Now</a></Link>
        </div>
      </section>

      <section id="why-choose-us" className="details">
        <h2>Why Choose NASPRO?</h2>
        <ul>
          <li>✅ Expert team with years of experience</li>
          <li>✅ Customized solutions tailored to your needs</li>
          <li>✅ Transparent pricing and no hidden fees</li>
          <li>✅ Timely delivery &amp; excellent support</li>
          <li>✅ Cutting-edge technology &amp; latest industry standards</li>
        </ul>
      </section>

      <section id="faq" className="faq">
        <h2>Frequently Asked Questions</h2>
        <div className="faq-item">
          <strong>Q: How long does a typical website project take?</strong>
          <p>A: Usually between 2-6 weeks depending on complexity and client feedback.</p>
        </div>
        <div className="faq-item">
          <strong>Q: Do you offer support after project completion?</strong>
          <p>A: Yes! We offer maintenance packages to keep your site/app up-to-date and secure.</p>
        </div>
        <div className="faq-item">
          <strong>Q: Can I upgrade my plan later?</strong>
          <p>A: Absolutely. We design scalable solutions that grow with your business.</p>
        </div>
        <div className="faq-item">
          <strong>Q: What payment methods do you accept?</strong>
          <p>A: Currently Easypaisa and JazzCash gateways are coming soon. For now, contact us directly for other options.</p>
        </div>
      </section>

      <footer>
        <p>
          📍 Karachi, Pakistan | 📧{' '}
          <a href="mailto:naspropvt@gmail.com">naspropvt@gmail.com</a> | 📞{' '}
          <a href="tel:+923033792494">+92 303 3792494</a>
        </p>
      </footer>
    </>
  );
}
