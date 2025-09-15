import Head from 'next/head';
import Link from 'next/link';

export default function Home() {
  return (
    <>
      <Head>
        <title>NASPRO IT Services</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="stylesheet" href="/style.css" />
      </Head>

      {/* Hamburger menu */}
      <div className="top-right-menu">
        <HamburgerMenu />
      </div>

      <header>
        <h1>NASPRO IT Services</h1>
        <p>Your partner in digital growth</p>
      </header>

      <section id="services" className="services">
        <ServiceCard
          title="Web & App Development"
          description="Custom-built, scalable, and high-performance websites and mobile apps for every industry."
          price="PKR 30,000"
          serviceKey="webapp"
        />
        <ServiceCard
          title="Domain & Hosting"
          description="Fast, secure, and reliable hosting with premium domain registration services."
          price="Starting from PKR 3,500/year"
          serviceKey="domainhosting"
        />
        <ServiceCard
          title="Branding & Logo Design"
          description="Memorable brand identities and creative designs that leave a lasting impression."
          price="PKR 5,000"
          serviceKey="branding"
        />
        <ServiceCard
          title="E-Commerce & Payment Solutions"
          description="Fully functional online stores with seamless payment gateway integration."
          price="PKR 50,000"
          serviceKey="ecommerce"
        />
        <ServiceCard
          title="Cloud & IT Infrastructure"
          description="Secure cloud hosting, data backups, and IT infrastructure management."
          price="Custom Pricing"
          serviceKey="cloudit"
        />
        <ServiceCard
          title="Digital Marketing"
          description="Grow your online presence with SEO, social media, and targeted ad campaigns."
          price="Starting at PKR 15,000/month"
          serviceKey="digitalmarketing"
        />
      </section>

      <section className="details" id="why-choose-us">
        <h2>Why Choose NASPRO?</h2>
        <ul>
          <li>✅ Expert team with years of experience</li>
          <li>✅ Customized solutions tailored to your needs</li>
          <li>✅ Transparent pricing and no hidden fees</li>
          <li>✅ Timely delivery & excellent support</li>
          <li>✅ Cutting-edge technology & latest industry standards</li>
        </ul>
      </section>

      <section className="faq" id="faq">
        <h2>Frequently Asked Questions</h2>

        <FaqItem
          question="How long does a typical website project take?"
          answer="Usually between 2-6 weeks depending on complexity and client feedback."
        />
        <FaqItem
          question="Do you offer support after project completion?"
          answer="Yes! We offer maintenance packages to keep your site/app up-to-date and secure."
        />
        <FaqItem
          question="Can I upgrade my plan later?"
          answer="Absolutely. We design scalable solutions that grow with your business."
        />
        <FaqItem
          question="What payment methods do you accept?"
          answer="Currently Easypaisa and JazzCash gateways are coming soon. For now, contact us directly for other options."
        />
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

// Hamburger menu component
function HamburgerMenu() {
  const toggleMenu = () => {
    const menu = document.getElementById('menuItems');
    if (menu) {
      menu.classList.toggle('active');
      const ariaHidden = menu.getAttribute('aria-hidden') === 'true';
      menu.setAttribute('aria-hidden', !ariaHidden);
    }
  };

  return (
    <>
      <div
        className="hamburger"
        id="hamburger"
        aria-label="Menu toggle"
        role="button"
        tabIndex={0}
        onClick={toggleMenu}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleMenu();
          }
        }}
      >
        <span></span>
        <span></span>
        <span></span>
      </div>
      <nav
        className="menu-items"
        id="menuItems"
        role="menu"
        aria-hidden="true"
      >
        <a href="#services" role="menuitem">
          Services
        </a>
        <a href="#why-choose-us" role="menuitem">
          Why Choose Us?
        </a>
        <a href="#faq" role="menuitem">
          FAQ
        </a>
      </nav>
    </>
  );
}

// Service card component
function ServiceCard({ title, description, price, serviceKey }) {
  return (
    <div className="card">
      <h3>{title}</h3>
      <p>{description}</p>
      <p className="price">{price}</p>
      <Link href={`/checkout?service=${serviceKey}`}>
        <a className="buy-btn">Buy Now</a>
      </Link>
    </div>
  );
}

// FAQ item component
function FaqItem({ question, answer }) {
  return (
    <div className="faq-item">
      <strong>Q: {question}</strong>
      <p>A: {answer}</p>
    </div>
  );
}
