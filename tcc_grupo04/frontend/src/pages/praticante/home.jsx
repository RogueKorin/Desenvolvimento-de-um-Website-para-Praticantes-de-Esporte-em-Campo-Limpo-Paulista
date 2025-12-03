import React from "react";
import UserLayout from "../../componentes/layout/userlayout";
import "./home.css";
import CardCarousel from "../../componentes/shared/home/cardcarousel";
import { useAuth } from "../../contexts/AuthProvider"; // ajuste o caminho se necessário

export default function Home() {
  const { usuario } = useAuth(); // <-- pega o usuário do contexto

  return (
    <UserLayout>
      <h1 className="welcome-title">
        Bem-vindo ao Connect Life, {usuario?.nome || "Carregando..."}!
      </h1>

      <section className="carousel-section">
        <CardCarousel />
      </section>

      <section className="text-areas-section">
        <div className="text-column">
          <h2>Sobre o Projeto</h2>
          <p>
                      Este projeto desenvolveu um website interativo voltado para incentivar a prática esportiva em Campo Limpo Paulista. A plataforma foi criada para combater o sedentarismo e promover hábitos saudáveis, conectando a população aos espaços e eventos esportivos disponíveis no município. Os principais objetivos incluem mapear espaços e eventos esportivos da cidade, criar conteúdos educativos sobre benefícios da atividade física, facilitar o acesso a informações confiáveis sobre esporte, promover conexões seguras entre praticantes e incentivar a inclusão de novos praticantes. Para o desenvolvimento, foram utilizadas tecnologias modernas como React para o framework front-end, CSS para estilização e JavaScript para funcionalidades interativas.    
          </p>
        </div>
      </section>
    </UserLayout>
  );
}
