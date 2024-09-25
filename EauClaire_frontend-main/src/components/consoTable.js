import API_BASE_URL from '../apiConfig';
import React, { useState, useEffect, useCallback } from "react";
import "./ConsoTable.css"; // Importing the CSS file
import 'font-awesome/css/font-awesome.min.css';


const ConsoTable = () => {
  const [data, setData] = useState([]);
  const [selectedYear, setSelectedYear] = useState('2000');
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [region, setRegion] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [downloadMessage, setDownloadMessage] = useState('');
  const [filters, setFilters] = useState({});
  const [filterVisible, setFilterVisible] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: '', direction: 'ascending' });


  // Fetch data for water consumption and water level
  const fetchData = useCallback(async () => {
    setLoading(true); // Set loading to true before fetching
    try {
      // Fetch water consumption data
      const consoResponse = await fetch(
        `${API_BASE_URL}/consommation?year=${selectedYear}`
      );
      
      const consoData = await consoResponse.json();

      // Fetch water level data
      const niveauResponse = await fetch(
        `${API_BASE_URL}/niveau?year=${selectedYear}`
      );
      const niveauData = await niveauResponse.json();

      // Merge the water level and consumption data
      const mergedData = niveauData.map(niveau => {
        const conso = consoData.find(c => c.Région.toLowerCase() === niveau.Region.toLowerCase());

        return {
          ...conso,
          NiveauEau: niveau.NiveauEau || "N/A",
          NomFleuve: niveau.NomFleuve || "N/A",
          RisqueSecheresse: niveau['RisqueSecheresse (sur 10)'] || "N/A",
          RisqueInondation: niveau['RisqueInondation (sur 10)'] || "N/A",
          Année: conso.Année || "N/A",
        };
      });

      setData(mergedData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false); // Set loading to false after fetching
    }
  }, [selectedYear]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Function to determine the class based on Surconsommation value
  const getUniqueValues = (key) => {
    return [...new Set(data.map(item => item[key]))];
};

const handleFilterChange = (column, value) => {
    setFilters(prev => ({
        ...prev,
        [column]: value,
    }));
};

const filteredData = data.filter(item => {
    return Object.keys(filters).every(key => {
        return filters[key] ? item[key] === filters[key] : true;
    });
});
  const getSurconsommationClass = (value) => {
    return value === "Oui" ? "surconsommation-oui" : "surconsommation-non";
  };

  // Function to subscribe to alerts (now via Discord)
  const subscribeToAlerts = async () => {
    if (!email || !region) {
      setAlertMessage("Veuillez entrer une adresse email et une région.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/subscribe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, region }),
      });
      const result = await response.json();
      setAlertMessage(result.message);
    } catch (error) {
      setAlertMessage("Erreur lors de la souscription aux alertes.");
    }
  };

  // Function to trigger alert for a specific region
  const triggerAlert = async () => {
    if (!region) {
      setAlertMessage("Veuillez sélectionner une région.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/trigger-alert`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ region }), // Assure-toi que `region` est correctement formaté
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setAlertMessage(result.message);
    } catch (error) {
      setAlertMessage("Erreur lors du déclenchement de l'alerte.");
      console.error('Erreur:', error);
    }
};

const handleDownloadCSV = async () => {
    setDownloadMessage("Téléchargement en cours...");
    try {
        const response = await fetch(`${API_BASE_URL}/download-data?year=${selectedYear}&region=`);
        if (!response.ok) throw new Error("Erreur lors du téléchargement.");
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `consommation_${selectedYear}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        setDownloadMessage("Téléchargement terminé !");
    } catch (error) {
        setDownloadMessage("Erreur lors du téléchargement.");
        console.error("Erreur:", error);
    }
};

const handleDownloadAllCSV = async () => {
    setDownloadMessage("Téléchargement en cours...");
    try {
        const response = await fetch(`${API_BASE_URL}/download-data?region=`);
        if (!response.ok) throw new Error("Erreur lors du téléchargement.");
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", 'consommation_complete.csv');
        document.body.appendChild(link);
        link.click();
        link.remove();
        setDownloadMessage("Téléchargement terminé !");
    } catch (error) {
        setDownloadMessage("Erreur lors du téléchargement.");
        console.error("Erreur:", error);
    }
};

const handleSort = (column) => {
    let direction = 'ascending';
    if (sortConfig.key === column && sortConfig.direction === 'ascending') {
        direction = 'descending';
    }
    setSortConfig({ key: column, direction });
};

const getSortIcon = (column) => {
    if (sortConfig.key === column) {
        return sortConfig.direction === 'ascending' ? 'fa fa-sort-up' : 'fa fa-sort-down';
    }
    return 'fa fa-sort';
};

const sortedData = React.useMemo(() => {
    let sortableData = [...filteredData];
    if (sortConfig.key) {
        sortableData.sort((a, b) => {
            if (a[sortConfig.key] < b[sortConfig.key]) {
                return sortConfig.direction === 'ascending' ? -1 : 1;
            }
            if (a[sortConfig.key] > b[sortConfig.key]) {
                return sortConfig.direction === 'ascending' ? 1 : -1;
            }
            return 0;
        });
    }
    return sortableData;
}, [filteredData, sortConfig]);


return (
  <div className="conso-table-container">
      <div className="select-container">
          <button className="filter-button" onClick={() => setFilterVisible(true)}>
              <i className="fa fa-search"></i> Filtrer
          </button>

          <div className="year-select-container">
              <label htmlFor="yearSelect">Sélectionner une année:</label>
              <select
                  id="yearSelect"
                  onChange={(e) => setSelectedYear(e.target.value)}
              >
                  {Array.from({ length: 25 }, (_, i) => 2000 + i).map(year => (
                      <option key={year} value={year}>{year}</option>
                  ))}
                  {Array.from({ length: 6 }, (_, i) => 2025 + i * 5).map(year => (
                      <option key={year} value={year}>{year}</option>
                  ))}
              </select>
          </div>

          <div className="download-buttons">
              <button onClick={handleDownloadCSV}>
                  <i className="fa fa-download"></i> Télécharger CSV
              </button>
              <button onClick={handleDownloadAllCSV}>
                  <i className="fa fa-download"></i> Télécharger toutes les années
              </button>
          </div>
      </div>


      {filterVisible && (
          <div className="filter-modal">
              <div className="filter-modal-content">
                  <h3>Filtres</h3>
                  {['Région', 'NomFleuve', 'NiveauEau', 'RisqueSecheresse', 'RisqueInondation', 'Population (millions)', 'Consommation Estimée (L/jour/habitant)', 'Surconsommation (Oui/Non)'].map(column => (
                      <div key={column} className="filter-option">
                          <span>{column}</span>
                          <select onChange={(e) => handleFilterChange(column, e.target.value)} value={filters[column] || ''}>
                              <option value="">Tous</option>
                              {getUniqueValues(column).map((value, index) => (
                                  <option key={index} value={value}>{value}</option>
                              ))}
                          </select>
                      </div>
                  ))}
                  <button onClick={() => setFilters({})}>Réinitialiser les filtres</button>
                  <button onClick={() => setFilterVisible(false)}>Fermer</button>
              </div>
          </div>
      )}

      {downloadMessage && <div className="download-message">{downloadMessage}</div>}

      {loading && (
          <div className="loading-animation">
              <div className="ocean">
                  <div id="octocat"></div>
              </div>
              <div className="loading-text">Chargement en cours...</div>
          </div>
      )}

      {!loading && (
          <table className="conso-table">
             <thead>
                    <tr>
                        {[
                        "Région",
                        "NomFleuve",
                        "NiveauEau",
                        selectedYear >= 2000 && selectedYear <= 2024 ? "NiveauSecheresse" : "RisqueSecheresse",
                        selectedYear >= 2000 && selectedYear <= 2024 ? "NiveauInondation" : "RisqueInondation",
                        "Population (millions)",
                        "Consommation Estimée (L/jour/habitant)",
                        "Surconsommation (Oui/Non)",
                        "Année"
                        ].map((column) => (
                        <th key={column} onClick={() => handleSort(column)}>
                            {column}
                            <i className={getSortIcon(column)} style={{ marginLeft: '5px' }}></i>
                        </th>
                        ))}
                    </tr>
                 </thead>


              <tbody>
                  {sortedData.map((region, index) => (
                      <tr key={index}>
                          <td>{region.Région}</td>
                          <td>{region.NomFleuve}</td>
                          <td>{region.NiveauEau}</td>
                          <td>{region.RisqueSecheresse}</td>
                          <td>{region.RisqueInondation}</td>
                          <td>{region["Population (millions)"]}</td>
                          <td>{region["Consommation Estimée (L/jour/habitant)"]}</td>
                          <td className={getSurconsommationClass(region["Surconsommation (Oui/Non)"])}>{region["Surconsommation (Oui/Non)"]}</td>
                          <td>{region.Année}</td>
                      </tr>
                  ))}
              </tbody>
          </table>
      )}

      <div className="alert-section">
          <h3>Alertes de Surconsommation</h3>
          <input 
              type="email" 
              placeholder="Votre adresse email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
          />
          <select value={region} onChange={(e) => setRegion(e.target.value)}>
              <option value="">Sélectionner une région</option>
              {[...new Set(data.map(item => item.Région))].map((uniqueRegion, index) => (
                  <option key={index} value={uniqueRegion}>{uniqueRegion}</option>
              ))}
          </select>

          <div className="alert-buttons">
              <button onClick={subscribeToAlerts}>S'abonner aux alertes</button>
              <button onClick={triggerAlert}>Déclencher une alerte</button>
          </div>
          {alertMessage && <div className="alert-message">{alertMessage}</div>}
      </div>
  </div>
);
};


export default ConsoTable;
