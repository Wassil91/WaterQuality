import React, { useState, useEffect, useCallback } from "react";
import "./ConsoTable.css"; // Importing the CSS file

const ConsoTable = () => {
  const [data, setData] = useState([]);
  const [selectedYear, setSelectedYear] = useState("2000");
  const [loading, setLoading] = useState(true); // Loading state
  const [email, setEmail] = useState("");
  const [region, setRegion] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

  // Fetch data for water consumption and water level
  const fetchData = useCallback(async () => {
    setLoading(true); // Set loading to true before fetching
    try {
      // Fetch water consumption data
      const consoResponse = await fetch(
        `http://127.0.0.1:8000/api/consommation?year=${selectedYear}`
      );
      const consoData = await consoResponse.json();

      // Fetch water level data
      const niveauResponse = await fetch(
        `http://127.0.0.1:8000/api/niveau?year=${selectedYear}`
      );
      const niveauData = await niveauResponse.json();

      // Merge the water level and consumption data
      const mergedData = consoData.map((conso) => {
        const niveau = niveauData.find(
          (niv) => niv.Region.toLowerCase() === conso.Région.toLowerCase()
        );
        return {
          ...conso,
          NiveauEau: niveau?.NiveauEau || "N/A",
          NomFleuve: niveau?.NomFleuve || "N/A",
          RisqueSecheresse: niveau?.["RisqueSecheresse (sur 10)"] || "N/A",
          RisqueInondation: niveau?.["RisqueInondation (sur 10)"] || "N/A",
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
      const response = await fetch("http://127.0.0.1:8000/api/subscribe", {
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
      const response = await fetch("http://127.0.0.1:8000/api/trigger-alert", {
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
      console.error("Erreur:", error); // Ajoute un log d'erreur pour débogage
    }
  };

  return (
    <div className="conso-table-container">
      <div className="select-container">
        <label htmlFor="yearSelect">Sélectionner une année:</label>
        <select
          id="yearSelect"
          onChange={(e) => {
            setSelectedYear(e.target.value);
            // Optional: force re-render or style update if needed
            document.querySelectorAll(".conso-table td").forEach((cell) => {
              cell.classList.remove(
                "surconsommation-oui",
                "surconsommation-non"
              );
            });
          }}
        >
          {Array.from({ length: 25 }, (_, i) => 2000 + i).map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
          {Array.from({ length: 6 }, (_, i) => 2025 + i * 5).map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      {/* Loading animation */}
      {loading && (
        <div className="loading-animation">
          <div className="ocean">
            <div id="octocat"></div>
          </div>
          <div className="loading-text">Chargement en cours...</div>
        </div>
      )}

      {/* Data table */}
      {!loading && (
        <table className="conso-table">
          <thead>
            <tr>
              <th>Région</th>
              <th>Nom du Fleuve</th>
              <th>Niveau de l'Eau</th>
              <th>Risque de Sécheresse</th>
              <th>Risque d'Inondation</th>
              <th>Population (en millions)</th>
              <th>Consommation Estimée (L/jour/habitant)</th>
              <th>Surconsommation</th>
            </tr>
          </thead>
          <tbody>
            {data.map((region, index) => (
              <tr key={index}>
                <td>{region.Région}</td>
                <td>{region.NomFleuve}</td>
                <td>{region.NiveauEau}</td>
                <td>{region.RisqueSecheresse}</td>
                <td>{region.RisqueInondation}</td>
                <td>{region["Population (millions)"]}</td>
                <td>{region["Consommation Estimée (L/jour/habitant)"]}</td>
                <td
                  className={getSurconsommationClass(
                    region["Surconsommation (Oui/Non)"]
                  )}
                >
                  {region["Surconsommation (Oui/Non)"]}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Subscription form */}
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
          {data.map((region, index) => (
            <option key={index} value={region.Région}>
              {region.Région}
            </option>
          ))}
        </select>
        <button onClick={subscribeToAlerts}>S'inscrire aux alertes</button>
        <button onClick={triggerAlert}>Lancer une alerte</button>
      </div>

      {/* Display alert messages */}
      {alertMessage && <div className="alert-message">{alertMessage}</div>}
    </div>
  );
};

export default ConsoTable;
