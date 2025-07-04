import './PromoCards.css';

const PromoCards = () => {
  const promoItems = [
    {
      id: 1,
      title: "LA TODO TERRENO",
      image: "https://ext.same-assets.com/2028573295/3870498477.png",
      className: "promo-card-large"
    },
    {
      id: 2,
      title: "LA REBELDE CON PAPAS",
      image: "https://ext.same-assets.com/2028573295/1639593500.png",
      className: "promo-card-medium"
    },
    {
      id: 3,
      title: "LA PERUANA",
      image: "https://ext.same-assets.com/2028573295/964065556.png",
      className: "promo-card-medium"
    }
  ];

  return (
    <section className="promo-cards">
      <div className="container">
        <div className="promo-grid">
          {promoItems.map((item) => (
            <div key={item.id} className={`promo-card ${item.className}`}>
              <div className="promo-card-content">
                <span className="promo-subtitle">Pruebalo hoy</span>
                <h3 className="promo-title">{item.title}</h3>
              </div>
              <div className="promo-card-image">
                <img src={item.image} alt={item.title} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default PromoCards;