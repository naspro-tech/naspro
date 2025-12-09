import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState } from 'react';

export default function Home() {
  const [menuActive, setMenuActive] = useState(false);
  const router = useRouter();

  const handleBuyNowClick = (service) => {
    router.push(`/checkout?service=${service}`);
  };

  const toggleMenu = () => setMenuActive(!menuActive);

  return (
    <>
      <Head>
        {/* Basic SEO */}
        <title>NasPro Pvt | IT Services & Solutions</title>
        <meta
          name="description"
          content="NasPro Pvt (naspropvt) offers IT services, software development, cloud solutions, branding, and digital marketing. Trusted IT company in Pakistan."
        />
        <meta
          name="keywords"
          content="naspropvt, naspro, IT service, IT solutions, IT company, software development, digital marketing, cloud hosting"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="stylesheet" href="/style.css" />

        {/* Open Graph (Facebook, LinkedIn) */}
        <meta property="og:title" content="NasPro Pvt | IT Services & Solutions" />
        <meta
          property="og:description"
          content="Professional IT services by NasPro Pvt. From web development to cloud infrastructure and digital marketing, we help your business grow."
        />
        <meta property="og:url" content="https://naspropvt.vercel.app" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="NasPro Pvt" />
        <meta property="og:locale" content="en_US" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="NasPro Pvt | IT Services & Solutions" />
        <meta
          name="twitter:description"
          content="NasPro Pvt provides IT services, software solutions, branding, and digital marketing."
        />
      </Head>

      <div className="top-right-menu">
        <div
          className="hamburger"
          onClick={toggleMenu}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
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
        <nav
          className={`menu-items ${menuActive ? 'active' : ''}`}
          aria-hidden={!menuActive}
        >
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
          <p>
            Custom-built, scalable, and high-performance websites and mobile apps
            for every industry.
          </p>
          <p className="price">PKR 30,000</p>
          <button
            className="buy-btn"
            onClick={() => handleBuyNowClick('webapp')}
          >
            Buy Now
          </button>
        </div>
        <div className="card">
          <h3>Domain &amp; Hosting</h3>
          <p>
            Fast, secure, and reliable hosting with premium domain registration
            services.
          </p>
          <p className="price">Starting from PKR 3,500/year</p>
          <button
            className="buy-btn"
            onClick={() => handleBuyNowClick('domainhosting')}
          >
            Buy Now
          </button>
        </div>
        <div className="card">
          <h3>Branding &amp; Logo Design</h3>
          <p>
            Memorable brand identities and creative designs that leave a lasting
            impression.
          </p>
          <p className="price">PKR 5,000</p>
          <button
            className="buy-btn"
            onClick={() => handleBuyNowClick('branding')}
          >
            Buy Now
          </button>
        </div>
        <div className="card">
          <h3>E-Commerce Solutions</h3>
          <p>
            Fully functional online stores with modern features to help you sell
            online effectively.
          </p>
          <p className="price">PKR 50,000</p>
          <button
            className="buy-btn"
            onClick={() => handleBuyNowClick('ecommerce')}
          >
            Buy Now
          </button>
        </div>
        <div className="card">
          <h3>Cloud &amp; IT Infrastructure</h3>
          <p>
            Secure cloud hosting, data backups, and IT infrastructure
            management.
          </p>
          <p className="price">Custom Pricing</p>
          <button
            className="buy-btn"
            onClick={() => handleBuyNowClick('cloudit')}
          >
            Buy Now
          </button>
        </div>
        <div className="card">
          <h3>Digital Marketing</h3>
          <p>
            Grow your online presence with SEO, social media, and targeted ad
            campaigns.
          </p>
          <p className="price">Starting at PKR 15,000/month</p>
          <button
            className="buy-btn"
            onClick={() => handleBuyNowClick('digitalmarketing')}
          >
            Buy Now
          </button>
        </div>

        {/* ✅ Added new Testing Service (for Easypaisa payment testing) */}
        <div className="card">
          <h3>Testing Service</h3>
          <p>
            This service is for payment gateway testing. It allows you to verify
            your Easypaisa integration using a real PKR 1 transaction.
          </p>
          <p className="price">PKR 1</p>
          <button
            className="buy-btn"
            onClick={() => handleBuyNowClick('testing')}
          >
            Buy Now
          </button>
        </div>
              {/* 🔵 PKR 500 Services */}
<div className="card">
  <h3>Website Bug Fix (1 Issue)</h3>
  <p>Fixing a small issue such as button malfunction, broken link, or layout error.</p>
  <p className="price">PKR 500</p>
  <button
    className="buy-btn"
    onClick={() => handleBuyNowClick('bugfix500')}
  >
    Buy Now
  </button>
</div>

<div className="card">
  <h3>Plugin Installation</h3>
  <p>Installation and basic configuration of a WordPress plugin.</p>
  <p className="price">PKR 500</p>
  <button
    className="buy-btn"
    onClick={() => handleBuyNowClick('plugin500')}
  >
    Buy Now
  </button>
</div>

{/* 🔵 PKR 1000 Services */}
<div className="card">
  <h3>Website Section Update</h3>
  <p>Adding or updating a single section on your website with improved design.</p>
  <p className="price">PKR 1000</p>
  <button
    className="buy-btn"
    onClick={() => handleBuyNowClick('section1000')}
  >
    Buy Now
  </button>
</div>

<div className="card">
  <h3>Basic Speed Optimization</h3>
  <p>Initial website speed boost with caching and image optimization.</p>
  <p className="price">PKR 1000</p>
  <button
    className="buy-btn"
    onClick={() => handleBuyNowClick('speed1000')}
  >
    Buy Now
  </button>
</div>

{/* 🔵 PKR 1500 Services */}
<div className="card">
  <h3>Landing Page Revamp</h3>
  <p>Light redesign of your landing page for a more modern, clean layout.</p>
  <p className="price">PKR 1500</p>
  <button
    className="buy-btn"
    onClick={() => handleBuyNowClick('revamp1500')}
  >
    Buy Now
  </button>
</div>

<div className="card">
  <h3>API Testing (5 Endpoints)</h3>
  <p>Testing API responses, status codes, and request logs for up to 5 endpoints.</p>
  <p className="price">PKR 1500</p>
  <button
    className="buy-btn"
    onClick={() => handleBuyNowClick('apitest1500')}
  >
    Buy Now
  </button>
</div>

{/* 🔵 PKR 2000 Services */}
<div className="card">
  <h3>Full Website Audit</h3>
  <p>Performance, security, SEO and UI/UX report with improvement suggestions.</p>
  <p className="price">PKR 2000</p>
  <button
    className="buy-btn"
    onClick={() => handleBuyNowClick('audit2000')}
  >
    Buy Now
  </button>
</div>

<div className="card">
  <h3>Basic Ecommerce Store Setup</h3>
  <p>Home page, products, and checkout setup for a small online store.</p>
  <p className="price">PKR 2000</p>
  <button
    className="buy-btn"
    onClick={() => handleBuyNowClick('estore2000')}
  >
    Buy Now
  </button>
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
          <p>
            A: Usually between 2-6 weeks depending on complexity and client
            feedback.
          </p>
        </div>
        <div className="faq-item">
          <strong>Q: Do you offer support after project completion?</strong>
          <p>
            A: Yes! We offer maintenance packages to keep your site/app
            up-to-date and secure.
          </p>
        </div>
        <div className="faq-item">
          <strong>Q: Can I upgrade my plan later?</strong>
          <p>A: Absolutely. We design scalable solutions that grow with your business.</p>
        </div>
        <div className="faq-item">
          <strong>Q: What payment methods do you accept?</strong>
          <p>
            A: Currently we accept direct bank transfer and cash on delivery for
            services. For other methods, please contact us.
          </p>
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
