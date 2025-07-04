import './Gallery.css';

const Gallery = () => {
  const galleryImages = [
    {
      id: 1,
      src: "https://ext.same-assets.com/2028573295/1202084031.png",
      alt: "Burger with fries"
    },
    {
      id: 2,
      src: "https://ext.same-assets.com/2028573295/4193236929.png",
      alt: "Fried chicken"
    },
    {
      id: 3,
      src: "https://ext.same-assets.com/2028573295/87027865.png",
      alt: "Burger meal"
    },
    {
      id: 4,
      src: "https://ext.same-assets.com/2028573295/2493358257.png",
      alt: "Multiple burgers"
    },
    {
      id: 5,
      src: "https://ext.same-assets.com/2028573295/87027865.png",
      alt: "Burger meal"
    },
    {
      id: 6,
      src: "https://ext.same-assets.com/2028573295/2493358257.png",
      alt: "Multiple burgers"
    },
    {
      id: 7,
      src: "https://ext.same-assets.com/2028573295/1202084031.png",
      alt: "Burger with fries"
    },
    {
      id: 8,
      src: "https://ext.same-assets.com/2028573295/4193236929.png",
      alt: "Fried chicken"
    }
  ];

  return (
    <section className="gallery" id="gallery">
      <div className="container">
        <h2 className="section-title gallery-title">Galeria</h2>
        
        <div className="gallery-grid">
          {galleryImages.map((image) => (
            <div key={image.id} className="gallery-item">
              <img src={image.src} alt={image.alt} />
              <div className="gallery-overlay">
                <div className="gallery-icon">+</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Gallery;