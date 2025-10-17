import React, { useState, useEffect } from 'react';
import { AlertCircle, FileText, Users, Phone, ArrowRight, LogIn, UserPlus, ChevronDown, Menu, X, DollarSign, Home } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom'; // Import for navigation
import './Landscape.css';

const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const navigate = useNavigate(); // Hook for programmatic navigation

  // Animation text for hero section
  const [animatedText, setAnimatedText] = useState('');
  const phrases = [
    "Report local issues that matter.",
    "Track how funds are spent.",
    "See real community impact.",
    "Create positive change together."
  ];
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  // Typing animation effect
  useEffect(() => {
    const typingInterval = 100;
    const deletingInterval = 50;
    const pauseTime = 2000;

    const timeout = setTimeout(() => {
      const currentPhrase = phrases[currentPhraseIndex];
      
      if (!isDeleting) {
        setAnimatedText(currentPhrase.substring(0, animatedText.length + 1));
        
        if (animatedText.length + 1 === currentPhrase.length) {
          setTimeout(() => setIsDeleting(true), pauseTime);
        }
      } else {
        setAnimatedText(currentPhrase.substring(0, animatedText.length - 1));
        
        if (animatedText.length === 0) {
          setIsDeleting(false);
          setCurrentPhraseIndex((currentPhraseIndex + 1) % phrases.length);
        }
      }
    }, isDeleting ? deletingInterval : typingInterval);

    return () => clearTimeout(timeout);
  }, [animatedText, currentPhraseIndex, isDeleting, phrases]);

  // Handle navigation clicks
  const scrollToSection = (sectionId) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  // Navigation handlers for login/signup/admin pages
  const navigateToLogin = () => {
    navigate('/user-login');
  };

  const navigateToSignup = () => {
    navigate('/user-signup');
  };

  const navigateToAdminLogin = () => {
    navigate('/admin-login');
  };

  // Scroll event listener to update active section
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'report', 'transparency', 'about', 'contact'];
      
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 100 && rect.bottom >= 100) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Animation for elements when they come into view
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
        }
      });
    }, { threshold: 0.1 });

    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    animatedElements.forEach(el => observer.observe(el));

    return () => {
      animatedElements.forEach(el => observer.unobserve(el));
    };
  }, []);

  return (
    <div className="landing-container">
      {/* Navigation Bar */}
      <header className="navbar">
        <div className="logo-container">
          <div className="logo">
            <div className="cf-logo">CF</div>
            <h1>CivicFix</h1>
          </div>
        </div>

        <div className="mobile-menu-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </div>

        <nav className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
          <ul>
            <li className={activeSection === 'home' ? 'active' : ''}>
              <button onClick={() => scrollToSection('home')}>
                <Home size={16} />
                Home
              </button>
            </li>
            <li className={activeSection === 'report' ? 'active' : ''}>
              <button onClick={() => scrollToSection('report')}>
                <AlertCircle size={16} />
                Report Issue
              </button>
            </li>
            <li className={activeSection === 'transparency' ? 'active' : ''}>
              <button onClick={() => scrollToSection('transparency')}>
                <DollarSign size={16} />
                Transparency
              </button>
            </li>
            <li className={activeSection === 'about' ? 'active' : ''}>
              <button onClick={() => scrollToSection('about')}>
                <Users size={16} />
                About
              </button>
            </li>
            <li className={activeSection === 'contact' ? 'active' : ''}>
              <button onClick={() => scrollToSection('contact')}>
                <Phone size={16} />
                Contact
              </button>
            </li>
           
          </ul>
        </nav>
      </header>

      {/* Hero Section */}
      <section id="home" className="hero-section">
        <div className="animated-bg-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>
        <div className="hero-content">
          <h1 className="hero-title">Empowering Communities Through Transparency</h1>
          <div className="animated-text-container">
            <span className="animated-text">{animatedText}</span>
            <span className="cursor"></span>
          </div>
          <p className="hero-subtitle">
            CivicFix connects citizens with local governments to report issues and track how public funds are used to solve them.
          </p>
          <div className="cta-buttons">
            <button className="primary-btn pulse-animation" onClick={navigateToSignup}>
              Sign Up <UserPlus size={16} />
            </button>
            <button className="secondary-btn" onClick={navigateToLogin}>
              Log In <LogIn size={16} />
            </button>
          </div>
        </div>
        <div className="hero-image">
          <div className="floating-card card-1">
            <AlertCircle size={20} />
            <span>Issue Reported</span>
          </div>
          <div className="floating-card card-2">
            <DollarSign size={20} />
            <span>Funds Allocated</span>
          </div>
          <div className="floating-card card-3">
            <Users size={20} />
            <span>Community Impact</span>
          </div>
        </div>
      </section>

      {/* Report Issue Section */}
      <section id="report" className="report-section">
        <div className="section-content">
          <h2 className="section-title animate-on-scroll">Report Issues That Matter</h2>
          <div className="feature-cards">
            <div className="feature-card animate-on-scroll">
              <div className="icon-circle">
                <AlertCircle size={24} />
              </div>
              <h3>Identify Problems</h3>
              <p>Spot an infrastructure issue or community concern? Report it with just a few taps.</p>
            </div>
            <div className="feature-card animate-on-scroll" style={{ animationDelay: '0.2s' }}>
              <div className="icon-circle">
                <FileText size={24} />
              </div>
              <h3>Detailed Tracking</h3>
              <p>Follow the progress of your reports from submission to resolution.</p>
            </div>
            <div className="feature-card animate-on-scroll" style={{ animationDelay: '0.4s' }}>
              <div className="icon-circle">
                <Users size={24} />
              </div>
              <h3>Community Support</h3>
              <p>Add your voice to existing reports to prioritize community needs.</p>
            </div>
          </div>
          <button className="primary-btn animate-on-scroll" onClick={navigateToSignup}>Report an Issue <ArrowRight size={16} /></button>
        </div>
      </section>

      {/* Transparency Section */}
      <section id="transparency" className="transparency-section">
        <div className="section-content">
          <h2 className="section-title animate-on-scroll">Financial Transparency</h2>
          <p className="section-description animate-on-scroll">
            See exactly how public funds are allocated and spent on community issues.
          </p>
          
          <div className="transparency-stats">
            <div className="stat-card animate-on-scroll">
              <h3 className="count-up">$1.2M</h3>
              <p>Total Funds Tracked</p>
              <div className="progress-bar">
                <div className="progress" style={{ width: '75%' }}></div>
              </div>
            </div>
            <div className="stat-card animate-on-scroll" style={{ animationDelay: '0.2s' }}>
              <h3 className="count-up">842</h3>
              <p>Issues Resolved</p>
              <div className="progress-bar">
                <div className="progress" style={{ width: '65%' }}></div>
              </div>
            </div>
            <div className="stat-card animate-on-scroll" style={{ animationDelay: '0.4s' }}>
              <h3 className="count-up">94%</h3>
              <p>Satisfaction Rate</p>
              <div className="progress-bar">
                <div className="progress" style={{ width: '94%' }}></div>
              </div>
            </div>
          </div>

          <div className="transparency-cta">
            <button className="secondary-btn animate-on-scroll" onClick={navigateToSignup}>View Financial Reports <ChevronDown size={16} /></button>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="about-section">
        <div className="section-content">
          <h2 className="section-title animate-on-scroll">About CivicFix</h2>
          <div className="about-grid">
            <div className="about-text">
              <p className="animate-on-scroll">
                CivicFix was founded with a simple mission: to bridge the gap between 
                citizens and local governments through technology and transparency.
              </p>
              <p className="animate-on-scroll" style={{ animationDelay: '0.2s' }}>
                We believe that when communities have the tools to report issues and track 
                how public funds are spent, everyone benefits from more efficient, 
                accountable governance.
              </p>
              <button className="secondary-btn animate-on-scroll" style={{ animationDelay: '0.3s' }} onClick={navigateToSignup}>Learn More About Us <ArrowRight size={16} /></button>
            </div>
            <div className="about-timeline">
              <div className="timeline-item animate-on-scroll">
                <div className="timeline-dot"></div>
                <div className="timeline-content">
                  <h4>2023</h4>
                  <p>CivicFix launched in 3 pilot cities</p>
                </div>
              </div>
              <div className="timeline-item animate-on-scroll" style={{ animationDelay: '0.2s' }}>
                <div className="timeline-dot"></div>
                <div className="timeline-content">
                  <h4>2024</h4>
                  <p>Expanded to 15 municipalities nationwide</p>
                </div>
              </div>
              <div className="timeline-item animate-on-scroll" style={{ animationDelay: '0.4s' }}>
                <div className="timeline-dot"></div>
                <div className="timeline-content">
                  <h4>2025</h4>
                  <p>Now serving over 50 communities and growing</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="contact-section">
        <div className="section-content">
          <h2 className="section-title animate-on-scroll">Get In Touch</h2>
          <div className="contact-container">
            <div className="contact-info">
              <div className="contact-card animate-on-scroll">
                <h3>Have Questions?</h3>
                <p>We're here to help with any questions about CivicFix and how it can benefit your community.</p>
                <ul>
                  <li><span>Email:</span> pradeep@gmail.com</li>
                  <li><span>Phone:</span> 9876543210</li>
                  <li><span>Address:</span> 123 Transparency Way, Civic Center, CA 94000</li>
                </ul>
                <div className="admin-login-container">
                  <button className="admin-btn" onClick={navigateToAdminLogin}>
                    Admin Login <LogIn size={16} />
                  </button>
                </div>
              </div>
            </div>
            <div className="contact-form">
              <form className="animate-on-scroll" style={{ animationDelay: '0.2s' }}>
                <div className="form-group">
                  <label htmlFor="name">Full Name</label>
                  <input type="text" id="name" placeholder="Your Name" />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input type="email" id="email" placeholder="your@email.com" />
                </div>
                <div className="form-group">
                  <label htmlFor="subject">Subject</label>
                  <input type="text" id="subject" placeholder="How can we help you?" />
                </div>
                <div className="form-group">
                  <label htmlFor="message">Message</label>
                  <textarea id="message" rows="5" placeholder="Tell us more..."></textarea>
                </div>
                <button type="submit" className="primary-btn">Send Message <ArrowRight size={16} /></button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-logo">
            <div className="cf-logo cf-logo-sm">CF</div>
            <h3>CivicFix</h3>
          </div>
          <div className="footer-links">
            <div className="footer-column">
              <h4>Navigation</h4>
              <ul>
                <li><button onClick={() => scrollToSection('home')}>Home</button></li>
                <li><button onClick={() => scrollToSection('report')}>Report Issue</button></li>
                <li><button onClick={() => scrollToSection('transparency')}>Transparency</button></li>
                <li><button onClick={() => scrollToSection('about')}>About</button></li>
                <li><button onClick={() => scrollToSection('contact')}>Contact</button></li>
              </ul>
            </div>
            <div className="footer-column">
              <h4>Resources</h4>
              <ul>
                <li><a href="#!">FAQ</a></li>
                <li><a href="#!">Community Guidelines</a></li>
                <li><a href="#!">Privacy Policy</a></li>
                <li><a href="#!">Terms of Service</a></li>
              </ul>
            </div>
            <div className="footer-column">
              <h4>Account</h4>
              <ul>
                <li onClick={navigateToLogin}>Login</li>
                <li onClick={navigateToSignup}>Sign Up</li>
                <li onClick={navigateToAdminLogin}>Admin Portal</li>
              </ul>
            </div>
            <div className="footer-column">
              <h4>Connect</h4>
              <div className="social-icons">
                <a href="#!" className="social-icon">FB</a>
                <a href="#!" className="social-icon">TW</a>
                <a href="#!" className="social-icon">IG</a>
                <a href="#!" className="social-icon">LI</a>
              </div>
              <p className="newsletter-text">Subscribe to our newsletter</p>
              <div className="newsletter-form">
                <input type="email" placeholder="Your email" />
                <button><ArrowRight size={16} /></button>
              </div>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} CivicFix. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
