import './Hero.css';
import Hamburguesa from './img/a1.png'

const Hero = () => {
  return (
    <section className="hero gradient-bg" id="home">
      <div className="container">
        <div className="hero-content">
          <div className="hero-left">
            <div className="hero-tagline">
              El Auténtico Sabor Imperial en cada bocado
            </div>
            
            <h1 className="hero-title">
              <span className="special-text">caral</span>
              <span className="burger-text">Sanguchería</span>
            </h1>
           
          </div>
          
          <div className="hero-right">
            <div className="burger-image-container">
              <img 
                src={Hamburguesa} 
                alt="Special Burger" 
                className="burger-image"
              />
              
            </div>
          </div>
        </div>
      
      </div>
    </section>
  );
};

export default Hero;