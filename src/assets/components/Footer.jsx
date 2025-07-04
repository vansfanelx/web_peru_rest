import './Footer.css';
import LogoBlanco from './img/CaralLogoBlanco.png'

const Footer = () => {
  return (
    <footer className="footer" id="contact">
      <div className="footer-background">
        <div className="container">
          <div className="footer-content">
            <div className="footer-logo">
              <img 
                src={LogoBlanco} 
                alt="Caral Sangucheria" 
                className="footer-logo-img"
              />
              <span className="footer-logo-text">Caral Sanguchería</span>
            </div>
            
            <div className="footer-description">
              <p>
                En Caral Sanguchería, cada bocado es una experiencia. Disfruta de nuestro <strong>Sabor Imperial</strong> en cada sánguche y plato de comida rápida. ¡Tu próxima delicia te espera!
              </p>
            </div>
          </div>
          
          <div className="footer-bottom">
            <div className="footer-contact">
              <p>Calle Gral. Suárez 366, Miraflores, Lima, Peru</p>
              <p>info@caralsangucheria.com</p>
            </div>
            
            <div className="footer-copyright">
              <p>© Caral Sanguchería 2025. Derechos reservados.</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;