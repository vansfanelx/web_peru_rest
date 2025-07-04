import './MenuSection.css';

const MenuSection = () => {
  const menuItems = [
    {
      id: 1,
      name: "Hamburger6",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do",
      image: "https://ext.same-assets.com/2028573295/913818482.png"
    },
    {
      id: 2,
      name: "Hamburger1",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do",
      image: "https://ext.same-assets.com/2028573295/1010110010.png"
    },
    {
      id: 3,
      name: "Hamburger2",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do",
      image: "https://ext.same-assets.com/2028573295/2220113229.png"
    }
  ];

  return (
    <section className="menu-section" id="menu">
      <div className="container">
        <div className="menu-header">
          <span className="section-subtitle">Nuestra Pasión por el Sabor Peruano</span>
          <h2 className="section-title">CARAL SANGUCHERÍA</h2>
          <p className="menu-description">
            En Caral Sanguchería, celebramos la rica tradición culinaria de Lima a través de nuestros sanguchones. Inspirados en los sabores auténticos y la calidez de nuestra gente, preparamos cada bocado con ingredientes frescos y el toque secreto de nuestras abuelas. Desde el clásico Jamón del País hasta innovadoras combinaciones, te invitamos a un viaje de sabor que te conectará con lo mejor de Perú. ¡Bienvenidos a la familia Caral!
          </p>
        </div>
        
{/*         <div className="menu-grid">
          {menuItems.map((item) => (
            <div key={item.id} className="menu-item">
              <div className="menu-item-image">
                <img src={item.image} alt={item.name} />
              </div>
              <div className="menu-item-content">
                <h4 className="menu-item-name">{item.name}</h4>
                <p className="menu-item-description">{item.description}</p>
                <button className="btn menu-btn">Order Now</button>
              </div>
            </div>
          ))}
        </div> */}
        
        <div className="menu-feature">
          <div className="menu-feature-content">
            <span className="section-subtitle">Explora Nuestra Deliciosa Carta</span>
            <h2 className="section-title">Sanguchones Especiales</h2>
            <p className="menu-feature-description">
             Combinaciones únicas y atrevidas para los amantes de nuevos sabores.
            </p>
            <div className="menu-indicators">
              <span className="indicator active"></span>
              <span className="indicator"></span>
              <span className="indicator"></span>
            </div>
          </div>
          <div className="menu-feature-image">
            <img 
              src="https://ext.same-assets.com/2028573295/4159153808.png" 
              alt="Chef with burgers" 
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default MenuSection;