import React from 'react';
import './introducao.css';
import logotipo_vertical from '../../assets/logotipo_vertical.png';
import hero_bg from '../../assets/hero_bg.png';
import { Link } from 'react-router-dom';

export default function Introducao() {
  return (
    <div className='main-layout-wrapper'>
      <header className="header">
        <nav>
          <a href="/sobre-nos">Sobre nós</a>
          <a href="/sobre-marca">Sobre a marca</a>
        </nav>
        <div className="header-buttons">
          <Link to="/cadastro" className="btn-cadastrar">
            Cadastrar
            </Link>
          <Link to="/entrar" className="btn-entrar">
            Entrar
            </Link>

          
        </div>
      </header>

      <main>
        <section className="hero">
          <div
            className="hero-left"
            style={{ backgroundImage: `url(${hero_bg})` }}
          >
            <img src={logotipo_vertical} alt="Logotipo Connect Life" />
          </div>

          <div className="hero-right">
            <h2>Esporte</h2>
            <p className="p-principal">
              Movimente-se, conecte-se e descubra novas formas de viver bem. No Connect Life, você encontra eventos, comunidades e locais para praticar esportes com quem compartilha da mesma energia. 
            </p>
            <p className="p-secundario">
              Comece hoje a mudança que você quer ver em si mesmo. Encontre pessoas com o mesmo objetivo, participe de eventos e mantenha uma rotina saudável com o apoio da nossa plataforma.
            </p>
          </div>
        </section>
      </main>

      <footer className="footer">
        © 2025 Grupo 4. All rights reserved.
      </footer>
    </div>
  );
}