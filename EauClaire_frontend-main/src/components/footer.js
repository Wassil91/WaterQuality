import React from "react";
import './footer.css';
import facebookLogo from '../pictures/fb.png'; // Replace with actual file path
import twitterLogo from '../pictures/twitter.png'; // Replace with actual file path
import instagramLogo from '../pictures/insta.png'; // Replace with actual file path

const Footer = () => {
    return (
        <div className="footerContainer">
            <div className="footerContent">
                <h1 className="footerTitle">EauClaire</h1>
                <p className="footerText">
                </p>
                <div className="footerLinks">
                    <a className="footerLink" href="https://www.facebook.com" target="_blank" rel="noopener noreferrer">
                        <img src={facebookLogo} alt="Facebook" className="footerLogo" />
                    </a>
                    <a className="footerLink" href="https://www.twitter.com" target="_blank" rel="noopener noreferrer">
                        <img src={twitterLogo} alt="Twitter" className="footerLogo" />
                    </a>
                    <a className="footerLink" href="https://www.instagram.com" target="_blank" rel="noopener noreferrer">
                        <img src={instagramLogo} alt="Instagram" className="footerLogo" />
                    </a>
                </div>
                <p className="footerText">12 Rue Anatole France, 92000 Nanterre, France</p>
                <iframe 
                    className="footerMap"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2624.866130293004!2d2.211512815674939!3d48.89158007929028!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47e66f4b33a7242b%3A0x7bfae82f689f58b6!2s12%20Rue%20Anatole%20France%2C%2092000%20Nanterre%2C%20France!5e0!3m2!1sen!2sus!4v1694662205474!5m2!1sen!2sus" 
                    width="300" 
                    height="200" 
                    style={{ border: 0 }} 
                    allowFullScreen="" 
                    loading="lazy" 
                    referrerPolicy="no-referrer-when-downgrade">
                </iframe>
                <p className="footerSlogan">"Pour une eau plus claire, chaque goutte compte."</p>
                    <a href="mailto:contact@eauclaire.com" className="footerEmail">contact@eauclaire.com</a>
                <p className="footerText">© 2024</p>
            </div>
        </div>
    );
}

export default Footer;
