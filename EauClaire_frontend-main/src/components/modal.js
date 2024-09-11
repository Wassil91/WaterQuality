import React, { useState } from 'react';
import './modal.css'; // Importez votre fichier CSS pour le modal

// Composant Modal pour les données des régions
const RegionModal = ({ isOpen, onClose, title, data }) => {
  if (!isOpen) return null;

  const renderTable = (dataArray, headers) => {
    if (!Array.isArray(dataArray) || dataArray.length === 0) {
      return <p>Aucune donnée disponible.</p>;
    }

    return (
      <div>
        <table className="dataTable">
          <thead>
            <tr>
              {headers.map((header, index) => (
                <th key={index}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dataArray.map((item, index) => (
              <tr key={index}>
                {headers.map((header, headerIndex) => (
                  <td key={headerIndex}>{item[header]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="modalOverlay">
      <div className="modalContent">
        <h2>{title}</h2>
        {data ? (
          <div>
            {Array.isArray(data.consommation) && (
              <div>
                <h3>Consommation</h3>
                {renderTable(data.consommation, ['Consommation Estimée (L/jour/habitant)', 'Surconsommation (Oui/Non)', 'Population (millions)'])}
              </div>
            )}
            {Array.isArray(data.niveau) && (
              <div>
                <h3>Niveau d'eau</h3>
                {renderTable(data.niveau, ['NiveauEau', 'NomFleuve', 'RisqueSecheresse (sur 10)', 'RisqueInondation (sur 10)'])}
              </div>
            )}
            {Array.isArray(data.biodiversite) && (
              <div>
                <h3>Biodiversité</h3>
                {renderTable(data.biodiversite, ['NomEspece', 'NomFleuve', 'NombreEspece', 'RisqueExtinction (sur 10)'])}
              </div>
            )}
          </div>
        ) : (
          <p>Chargement des données...</p>
        )}
        <button onClick={onClose}>Fermer</button>
      </div>
    </div>
  );
};

// Composant Modal pour les données des départements

const DepartmentModal = ({ isOpen, onClose, title, data }) => {
  const [selectedCodePostal, setSelectedCodePostal] = useState('');

  if (!isOpen) return null;

  const handleCodePostalChange = (event) => {
    setSelectedCodePostal(event.target.value);
  };

  // Filter the data based on the selected postal code
  const selectedQualiteData = Array.isArray(data?.qualite)
    ? data.qualite.find(item => item.CodePostale === parseInt(selectedCodePostal))
    : null;

  const renderTable = (item, headers) => {
    if (!item) {
      return <p>Aucune donnée disponible pour ce code postal.</p>;
    }

    return (
      <div>
        <table className="dataTable">
          <thead>
            <tr>
              {headers.map((header, index) => (
                <th key={index}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {headers.map((header, headerIndex) => (
                <td key={headerIndex}>{item[header]}</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="modalOverlay">
      <div className="modalContent">
        <h2>{title}</h2>
        {data ? (
          <div>
            <div>
              <h3>Qualité de l'eau</h3>
              <div className="selectContainer">
                <select
                  className="selectDropdown"
                  value={selectedCodePostal}
                  onChange={handleCodePostalChange}
                  style={{ marginBottom: '10px', padding: '5px', width: '100%' }}
                >
                  <option value="">Sélectionner un code postal</option>
                  {Array.isArray(data.qualite) && data.qualite.map((item, index) => (
                    <option key={index} value={item.CodePostale}>
                      {item.CodePostale}
                    </option>
                  ))}
                </select>
              </div>
              {selectedCodePostal ? (
                renderTable(selectedQualiteData, ['Villes', 'NumDepartments', 'Regions', 'QualiteEau /10'])
              ) : (
                <p>Sélectionnez un code postal pour voir les détails.</p>
              )}
            </div>
          </div>
        ) : (
          <p>Chargement des données...</p>
        )}
        <button onClick={onClose}>Fermer</button>
      </div>
    </div>
  );
};

export { RegionModal, DepartmentModal };
