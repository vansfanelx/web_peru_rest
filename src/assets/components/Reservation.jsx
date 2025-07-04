import './Reservation.css';

const Reservation = () => {
  return (
    <section className="reservation" id="reservation">
      <div className="container">
        <div className="reservation-content">
          <div className="reservation-left">
            <div className="reservation-decorations">
              <img 
                src="https://ext.same-assets.com/2028573295/1046775264.png" 
                alt="Burger decoration" 
                className="decoration-burger"
              />
              <img 
                src="https://ext.same-assets.com/2028573295/3907362222.png" 
                alt="Bottle decoration" 
                className="decoration-bottle"
              />
            </div>
          </div>
          
          <div className="reservation-center">
            <span className="section-subtitle">Reservation</span>
            <h2 className="section-title">Book Your Table</h2>
            
            <form className="reservation-form">
              <div className="form-row">
                <input type="text" placeholder="Name" className="form-input" />
                <input type="email" placeholder="Email" className="form-input" />
              </div>
              <div className="form-row">
                <input type="date" placeholder="Date" className="form-input" />
                <input type="time" placeholder="Time" className="form-input" />
              </div>
              <div className="form-row full-width">
                <input type="number" placeholder="People" className="form-input" />
              </div>
              <button type="submit" className="btn reservation-btn">Find a Table</button>
            </form>
          </div>
          
          <div className="reservation-right">
            <div className="reservation-decorations">
              <img 
                src="https://ext.same-assets.com/2028573295/958875020.png" 
                alt="Burger plate decoration" 
                className="decoration-plate"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Reservation;