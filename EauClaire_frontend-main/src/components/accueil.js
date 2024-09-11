import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";

import goutte from './../pictures/water.png';
import carteRiviere from './../pictures/carte_riviere.jpg';
import inondation from './../pictures/inondation.jpg';
import data from './../pictures/data.jpg';
import Footer from './footer';

const Accueil = () => {
    useEffect(() => {
        AOS.init({ duration: 1000 });
    }, []);

    return (
        <>
            <div className="accueilContainer">
                <div className="backgroundImageContainer">
                    <div className="overlayContent">
                        <h1 className="accueilTitle" style={{ marginTop: '30px' }}>EauClaire</h1>
                        <div className="pageContainer" style={{ padding: '10px'}}>
                            <p className="accueilPresentation">
                                Une application de visualisation de la qualité et de la consommation de l'eau de nos fleuves et rivières.
                            </p>
                        </div>
                    </div>
                </div>
                <img
                    src={goutte}
                    alt="goutte"
                    style={{ margin: '10px', maxWidth: '100%', height: 'auto' }}
                    data-aos="fade-up"
                />
                <div className="pageContainer" style={{ padding: '10px', width: '75%'}} data-aos="fade-up">
                    <p className="accueilDescription" data-aos="fade-up">
                        
En France, l'eau du robinet provient principalement des rivières, fleuves et nappes phréatiques. À Paris, 50 % de l'eau vient de la Seine. Le Rhône est crucial en Rhône-Alpes et Provence-Alpes-Côte d'Azur. La Garonne fournit 50 % de l'eau à Bordeaux. Les nappes phréatiques complètent l'approvisionnement dans plusieurs régions, dont Normandie et Languedoc-Roussillon.
                    </p>
                    <div className="imageContainer" data-aos="fade-up">
                        <img
                            src={carteRiviere}
                            alt="Carte de France des rivieres"
                            className="accueilImage"
                        />
                        <Link to="/infoMap">
                            <button className="accueilButton">Accéder à la carte interractive</button>
                        </Link>
                    </div>
                    <p className="accueilDescription" data-aos="fade-up">
                        Parcourez les prévisions de nos modèles de Machine Learning sous forme de données tabulaires.
                    </p>
                    <div className="imageContainer" data-aos="fade-up">
                        <img
                            src={data}
                            alt="data"
                            className="accueilImage"
                            data-aos="fade-up"
                        />
                        <Link to="/consoTable">
                            <button className="accueilButton">Accéder au tableau des prévisions et lancer des alertes</button>
                        </Link>
                    </div>
                    <p className="accueilDescription" data-aos="fade-up">
                        Surveillez les indices de sécheresse et de risque d'inondation.
                    </p>
                    <div className="imageContainer" data-aos="fade-up">
                        <img
                            src={inondation}
                            alt="inondation"
                            className="accueilImage"
                            data-aos="fade-up"
                        />
                        <Link to="/dashboard">
                            <button className="accueilButton">Accéder au dashboard</button>
                        </Link>
                    </div>
                    <p></p>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default Accueil;
