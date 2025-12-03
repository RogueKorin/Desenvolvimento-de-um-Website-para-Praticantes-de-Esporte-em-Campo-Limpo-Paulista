// src/components/CardCarousel/CardCarousel.jsx

import React from 'react';
import './CardCarousel.css'; 

import comunidades from '../../../assets/img_comunidades.png'
import eventos from '../../../assets/img_eventos.png'
import locais from '../../../assets/img_locais.png'
import agenda from '../../../assets/img_agenda.png'

// Card clicável
const Card = ({ title, imageUrl, link }) => {
    return (
        <a href={link} className="carousel-card clickable-card">
            <div className="card-image-wrapper">
                <img src={imageUrl} alt={title} className="card-image" />
            </div>
            <p className="card-title">{title}</p>
        </a>
    );
};

// Dados dos cards
const CARD_DATA = [
    { id: 1, title: 'Conheça diferentes comunidades!', image: comunidades, link: '/comunidades' },
    { id: 2, title: 'Acesse mais eventos!', image: eventos, link: '/eventos' },
    { id: 3, title: 'Locais para o seu esporte em Campo Limpo Paulista!', image: locais, link: '/locais' },
    { id: 4, title: 'Acesse sua agenda!', image: agenda, link: '/agenda' },
];

export default function CardCarousel() {
    return (
        <div className="card-grid">
            {CARD_DATA.map(card => (
                <Card 
                    key={card.id}
                    title={card.title}
                    imageUrl={card.image}
                    link={card.link}
                />
            ))}
        </div>
    );
}
