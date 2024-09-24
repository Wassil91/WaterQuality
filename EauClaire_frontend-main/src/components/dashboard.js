import API_BASE_URL from '../apiConfig';
import React, { useState, useEffect } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';
import './dashboard.css'; // Import the CSS file
import 'chartjs-plugin-annotation'; // Ensure this import is at the top of your file


ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const [selectedRegions, setSelectedRegions] = useState([]);
  const [selectedYear, setSelectedYear] = useState('2024');
  const [waterQualityData, setWaterQualityData] = useState({});
  const [biodiversityData, setBiodiversityData] = useState({});
  const [waterRiskData, setWaterRiskData] = useState({});
  const [consumptionData, setConsumptionData] = useState({});
  const [biodiversityRegionData, setBiodiversityRegionData] = useState({});
  const [allRegions, setAllRegions] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/niveau?year=2000`)
      .then(response => response.json())
      .then(regionData => {
        const uniqueRegions = [...new Set(regionData.map(item => item.Region))];
        setAllRegions(uniqueRegions);
      })
      .catch(error => console.error('Error fetching region data:', error));
  }, []);

  useEffect(() => {
    if (selectedRegions.length === 0) return;

    // Fetch water quality data
    Promise.all(selectedRegions.map(region =>
      fetch(`${API_BASE_URL}/qualite-reg-test?region=${region}`)
        .then(response => response.json())
    )).then(datas => {
      const years = Array.from({ length: 51 }, (_, i) => 2000 + i);
      const datasets = datas.map((data, index) => {
        const qualityMap = data.reduce((acc, item) => {
          acc[item.DateAnalyse] = item['QualiteEau /10'];
          return acc;
        }, {});
        const qualities = years.map(year => qualityMap[year] || null);
        return {
          label: `Qualité Eau - ${selectedRegions[index]}`,
          data: qualities,
          borderColor: `rgba(${(index * 60) % 255}, ${(index * 120) % 255}, 200, 1)`,
          backgroundColor: `rgba(${(index * 60) % 255}, ${(index * 120) % 255}, 200, 0.2)`,
          fill: true
        };
      });
      setWaterQualityData({
        labels: years,
        datasets
      });
    }).catch(error => console.error('Error fetching water quality data:', error));

    // Fetch biodiversity data
    Promise.all(selectedRegions.map(region =>
      fetch(`${API_BASE_URL}/biodiversite?region=${region}&year=${selectedYear}`)
        .then(response => response.json())
    )).then(datas => {
      const rivers = [];
      const speciesCountMap = {};
      const extinctionRiskMap = {};

      datas.forEach(data => {
        data.forEach(item => {
          const river = item.NomFleuve;
          if (!speciesCountMap[river]) {
            speciesCountMap[river] = { total: 0, count: 0 };
            extinctionRiskMap[river] = [];
          }
          speciesCountMap[river].total += item.NombreEspece;
          speciesCountMap[river].count += 1;
          extinctionRiskMap[river].push(item['RisqueExtinction (sur 10)']);
        });
      });

      const riversUnique = Object.keys(speciesCountMap);
      const avgSpeciesCount = riversUnique.map(river => speciesCountMap[river].total / speciesCountMap[river].count);
      const avgExtinctionRisk = riversUnique.map(river => 
        extinctionRiskMap[river].reduce((a, b) => a + b, 0) / extinctionRiskMap[river].length
      );

      setBiodiversityData({
        labels: riversUnique,
        datasets: [
          {
            label: `Moyenne Espèces (${selectedYear})`,
            data: avgSpeciesCount,
            backgroundColor: 'rgba(153, 102, 255, 0.2)',
            borderColor: 'rgba(153, 102, 255, 1)',
            borderWidth: 1
          },
          {
            label: 'Moyenne Risque Extinction',
            data: avgExtinctionRisk,
            backgroundColor: 'rgba(255, 159, 64, 0.2)',
            borderColor: 'rgba(255, 159, 64, 1)',
            borderWidth: 1
          }
        ]
      });
    }).catch(error => console.error('Error fetching biodiversity data:', error));

    // Fetch water risk data
    Promise.all(selectedRegions.map(region =>
      fetch(`${API_BASE_URL}/niveau?region=${region}&year=${selectedYear}`)
        .then(response => response.json())
    )).then(datas => {
      const regions = [];
      const droughtRisks = [];
      const floodRisks = [];
      const waterLevels = []; // Pour stocker les niveaux d'eau numériques

      datas.forEach(data => {
        data.forEach(item => {
          regions.push(item.Region);
          droughtRisks.push(item['RisqueSecheresse (sur 10)']);
          floodRisks.push(item['RisqueInondation (sur 10)']);
          
          // Mappez les niveaux d'eau en valeurs numériques
          const niveauEauMapping = {
            "bas": 1,
            "moyen": 2,
            "haut": 3
          };
          waterLevels.push(niveauEauMapping[item.NiveauEau]);
        });
      });

      // Calculer la moyenne des espèces pour chaque région
      const biodiversityPromises = selectedRegions.map(region =>
        fetch(`${API_BASE_URL}/biodiversite?region=${region}&year=${selectedYear}`)
          .then(response => response.json())
      );

      Promise.all(biodiversityPromises).then(biodiversityData => {
        const averageSpecies = {};
        
        biodiversityData.forEach(data => {
          data.forEach(item => {
            const region = item.Region;
            if (!averageSpecies[region]) {
              averageSpecies[region] = {
                totalSpecies: 0,
                count: 0,
              };
            }
            averageSpecies[region].totalSpecies += item.NombreEspece;
            averageSpecies[region].count++;
          });
        });

        const biodiversityAverages = Object.keys(averageSpecies).map(region => averageSpecies[region].totalSpecies / averageSpecies[region].count);

        setWaterRiskData({
          labels: [...new Set(regions)],
          datasets: [
            {
              label: 'Risque sécheresse',
              data: droughtRisks,
              backgroundColor: 'rgba(255, 99, 132, 0.2)',
              borderColor: 'rgba(255, 99, 132, 1)',
              borderWidth: 1
            },
            {
              label: 'Risque inondation',
              data: floodRisks,
              backgroundColor: 'rgba(54, 162, 235, 0.2)',
              borderColor: 'rgba(54, 162, 235, 1)',
              borderWidth: 1
            },
            {
              label: 'Niveau de l\'eau',
              data: waterLevels,
              backgroundColor: 'rgba(255, 206, 86, 0.2)',
              borderColor: 'rgba(255, 206, 86, 1)',
              borderWidth: 1
            },
            {
              label: 'Moyenne biodiversité',
              data: biodiversityAverages,
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 1
            }
          ]
        });
      }).catch(error => console.error('Error fetching biodiversity data:', error));
    }).catch(error => console.error('Error fetching water risk data:', error));

    // Fetch consumption data
    Promise.all(selectedRegions.map(region =>
      fetch(`${API_BASE_URL}/consommation?region=${region}`)
        .then(response => response.json())
    )).then(datas => {
      const regions = [];
      const consumptionValues = [];

      datas.forEach(data => {
        data.forEach(item => {
          regions.push(item.Région);
          consumptionValues.push(item['Consommation Estimée (L/jour/habitant)']);
        });
      });

      setConsumptionData({
        labels: [...new Set(regions)],
        datasets: [
          {
            label: 'Consommation d\'eau',
            data: consumptionValues,
            backgroundColor: 'rgba(153, 102, 255, 0.2)',
            borderColor: 'rgba(153, 102, 255, 1)',
            borderWidth: 1
          }
        ]
      });
    }).catch(error => console.error('Error fetching consumption data:', error));

  }, [selectedRegions, selectedYear]);

  const handleRegionChange = (region) => {
    setSelectedRegions(prev =>
      prev.includes(region) ? prev.filter(r => r !== region) : [...prev, region]
    );
  };

  return (
    <div style={{ margin: '50px' }}>
      <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label htmlFor="regionSelect" style={{ fontWeight: 'bold' }}>Régions:</label>
          <div className="dropdown-container">
            <button className="dropdown-button" style={{ padding: '10px 20px', borderRadius: '10px', backgroundColor: '#2196F3', color: 'white', border: 'none', cursor: 'pointer' }}>
              Sélectionner les régions
            </button>
            <div className="dropdown-content">
              {allRegions.map(region => (
                <div key={region}>
                  <input
                    type="checkbox"
                    id={region}
                    checked={selectedRegions.includes(region)}
                    onChange={() => handleRegionChange(region)}
                  />
                  <label htmlFor={region}>{region}</label>
                </div>
              ))}
            </div>
          </div>
        </div>
  
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label htmlFor="yearSelect" style={{ fontWeight: 'bold' }}>Année:</label>
          <select id="yearSelect" value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} 
            style={{ padding: '10px 20px', borderRadius: '10px', backgroundColor: '#2196F3', color: 'white', border: 'none', cursor: 'pointer' }}>
            {[...Array(11).keys()].map(i => (
              <option key={i} value={2000 + i * 5}>
                {2000 + i * 5}
              </option>
            ))}
            <option value={2024}>2024</option>
          </select>
        </div>
      </div>  
  
      <hr />
  
      {/* // Biodiversity Chart by River */}
<div className="chart-container">
  <h3>Biodiversités dans les fleuves ({selectedYear})</h3>
  {biodiversityData.labels ? (
    <Bar 
      data={biodiversityData} 
      options={{ 
        responsive: true, 
        plugins: { 
          legend: { position: 'bottom' }, 
          title: { display: true, text: `Biodiversité en ${selectedRegions.join(', ')} (${selectedYear})` },
        },
        scales: {
          x: {
            title: { display: true, text: 'Fleuves' },
          },
          y: {
            title: { display: true, text: "Nombres d'èspeces / risque extinction" },
          },
        },
        // Annotation configuration
        annotation: {
          annotations: selectedRegions.map((_, index) => ({
            type: 'line',
            yMin: 0,
            yMax: Math.max(...biodiversityData.datasets[0].data) + 1, // Set to a maximum value for visibility
            xMin: index + 0.5, // Adjust to the middle of the region
            xMax: index + 0.5, // Adjust to the middle of the region
            borderColor: 'red',
            borderWidth: 2,
            label: { enabled: false },
          })).filter((_, index) => index > 0), // Skip the first index
        },
      }} 
    />
  ) : (
    <p>Loading biodiversity data...</p>
  )}
</div>


  
      <hr />
  
      {/* Water Risk Chart */}
      <div className="chart-container">
        <h3>Risques liés à l'eau (Sécheresse et Inondation)</h3>
        {waterRiskData.labels ? (
          <Bar 
            data={waterRiskData} 
            options={{ 
              responsive: true, 
              plugins: { 
                legend: { position: 'bottom' }, 
                title: { 
                  display: true, 
                  text: `Risques liés à l'eau  ${selectedRegions.join(', ')} (${selectedYear})` 
                } 
              },
              scales: {
                x: {
                  title: {
                    display: true,
                    text: 'Régions' // Title of the X axis
                  }
                },
                y: {
                  title: {
                    display: true,
                    text: 'Niveau de risque' // Title of the Y axis
                  }
                }
              }
            }} 
          />
        ) : (
          <p>Loading water risk data...</p>
        )}
      </div>
  
      {/* Corrélation entre la qualité de l'eau et le nombre moyen d'espèces */}
<div className="chart-container">
  <h3>Corrélation entre la qualité de l'eau et le nombre moyen d'espèces</h3>
  {biodiversityData.labels && waterQualityData.labels ? (
    <Bar 
      data={{
        labels: biodiversityData.labels,
        datasets: [
          {
            label: 'Moyenne qualité de l\'eau',
            data: waterQualityData.datasets[0].data, 
            backgroundColor: 'rgba(54, 162, 235, 0.6)',
          },
          {
            label: 'Moyenne nombre d\'espèces',
            data: biodiversityData.datasets[0].data,
            backgroundColor: 'rgba(255, 99, 132, 0.6)',
          }
        ]
      }} 
      options={{ 
        responsive: true, 
        plugins: { 
          legend: { position: 'bottom' }, 
          title: { 
            display: true, 
            text: `Corrélation qualité de l'eau et biodiversité en ${selectedRegions.join(', ')} (${selectedYear})` 
          },
          annotation: {
            annotations: selectedRegions.map((region, index) => ({
              type: 'line',
              mode: 'vertical',
              scaleID: 'x',
              value: index + 0.5, // Position de la ligne
              borderColor: 'red',
              borderWidth: 2,
              label: {
                enabled: false,
              }
            })),
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Régions' // Titre de l'axe des X
            }
          },
          y: {
            title: {
              display: true,
              text: 'Valeurs' // Titre de l'axe des Y
            }
          }
        }
      }} 
    />
  ) : (
    <p>Loading correlation data...</p>
  )}
</div>
  
      {/* Water Quality Chart */}
      <div className="chart-container">
        <h3>Qualité de l'eau au fil du temps (2000-2050)</h3>
        {waterQualityData.labels ? (
          <Line 
            data={waterQualityData} 
            options={{ 
              responsive: true, 
              plugins: { 
                legend: { position: 'bottom' }, 
                title: { display: true, text: "Qualité de l'eau (2000-2050)" } 
              },
              scales: {
                x: {
                  title: {
                    display: true,
                    text: 'Années' // Title of the X axis
                  }
                },
                y: {
                  title: {
                    display: true,
                    text: 'Qualité eau' // Title of the Y axis
                  }
                }
              }
            }} 
          />
        ) : (
          <p>Loading water quality data...</p>
        )}
      </div>
  
      {/* Corrélation entre consommation d'eau et niveau d'eau */}
      <div className="chart-container">
        <h3>Corrélation entre la consommation d'eau et le niveau d'eau</h3>
        {waterRiskData.labels && consumptionData.labels ? (
          <Bar 
            data={{
              labels: waterRiskData.labels,
              datasets: [
                {
                  label: 'Consommation d\'eau',
                  data: consumptionData.datasets[0].data,
                  backgroundColor: 'rgba(153, 102, 255, 0.6)',
                },
                {
                  label: 'Niveau d\'eau',
                  data: waterRiskData.datasets.find(dataset => dataset.label === 'Niveau de l\'eau').data,
                  backgroundColor: 'rgba(75, 192, 192, 0.6)',
                }
              ]
            }} 
            options={{ 
              responsive: true, 
              plugins: { 
                legend: { position: 'bottom' }, 
                title: { 
                  display: true, 
                  text: `Corrélation consommation d'eau et niveau d'eau en ${selectedRegions.join(', ')} (${selectedYear})` 
                } 
              },
              scales: {
                x: {
                  title: {
                    display: true,
                    text: 'Régions' // Titre de l'axe des X
                  }
                },
                y: {
                  title: {
                    display: true,
                    text: 'Valeurs' // Titre de l'axe des Y
                  }
                }
              }
            }} 
          />
        ) : (
          <p>Loading consumption and water level data...</p>
        )}
      </div>
    </div>
  );
  };

export default Dashboard;
