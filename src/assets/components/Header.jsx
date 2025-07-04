import { Link } from 'react-router-dom';
import './Header.css';
import Logo from './img/CaralLogo.png'
import Delivery from './img/delivery-icon.png'

const Header = () => {
  return (
    <>
    <header className="header gradient-bg">
      <div className="container">
        <nav className="nav">
          <div className="logo">
            <img 
              src={Logo}
              alt="LogoCaral" 
              className="logo-img"
            />
            <span className="logo-text">Caral Sanguchería</span>
          </div>
          
          <div className="nav-right">
            <ul className="nav-menu">
              <li><a href="#home">Inicio</a></li>
              <li><a href="#menu">Nuestra Carta</a></li>
              <li><a href="#gallery">Promociones</a></li>
              <li><a href="#contact">Contáctanos</a></li>
            </ul>
            
            <div className="delivery-info">
              <img 
                src={Delivery}
                alt="Delivery" 
                className="delivery-icon"
              />
              <div className="delivery-text">
                <span>Delivery</span>
                <strong>978 490 558</strong>
              </div>
            <Link class="btn btn-primary" to="/Login" role="button">Reservaciones</Link>
            </div>
            <div class="container-icon">
				<div class="container-cart-icon">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="1.5"
						stroke="currentColor"
						class="icon-cart"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
						/>
					</svg>
					<div class="count-products">
						<span id="contador-productos">0</span>
					</div>
				</div>

				<div class="container-cart-products hidden-cart">
					<div class="row-product hidden">
						<div class="cart-product">
							<div class="info-cart-product">
								<span class="cantidad-producto-carrito">1</span>
								<p class="titulo-producto-carrito">Zapatos Nike</p>
								<span class="precio-producto-carrito">$80</span>
							</div>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke-width="1.5"
								stroke="currentColor"
								class="icon-close"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M6 18L18 6M6 6l12 12"
								/>
							</svg>
						</div>
					</div>

					<div class="cart-total hidden">
						<h3>Total:</h3>
						<span class="total-pagar">$200</span>
					</div>
					<p class="cart-empty">El carrito está vacío</p>
				</div>
			</div>
          </div>
        </nav>
      </div>
    </header>
    </>
  );
};

export default Header;