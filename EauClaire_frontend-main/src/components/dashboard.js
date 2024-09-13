import React, { useState, useEffect } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';
import './dashboard.css'; // Import the CSS file

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const [selectedRegions, setSelectedRegions] = useState([]);
  const [selectedYear, setSelectedYear] = useState('2024');
  const [waterQualityData, setWaterQualityData] = useState({});
  const [biodiversityData, setBiodiversityData] = useState({});
  const [waterRiskData, setWaterRiskData] = useState({});
  const [allRegions, setAllRegions] = useState([]);

  useEffect(() => {
    fetch(`https://eauclaire.online:3030/api/niveau?year=2000`)
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
      fetch(`https://eauclaire.online:3030/api/qualite-reg?region=${region}`)
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
          label: `Water Quality Index - ${selectedRegions[index]}`,
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
      fetch(`https://eauclaire.online:3030/api/biodiversite?region=${region}&year=${selectedYear}`)
        .then(response => response.json())
    )).then(datas => {
      const rivers = [];
      const speciesCount = [];
      const extinctionRisk = [];
      datas.forEach(data => {
        data.forEach(item => {
          rivers.push(item.NomFleuve);
          speciesCount.push(item.NombreEspece);
          extinctionRisk.push(item['RisqueExtinction (sur 10)']);
        });
      });
      setBiodiversityData({
        labels: [...new Set(rivers)],
        datasets: [
          {
            label: `Species Count (${selectedYear})`,
            data: speciesCount,
            backgroundColor: 'rgba(153, 102, 255, 0.2)',
            borderColor: 'rgba(153, 102, 255, 1)',
            borderWidth: 1
          },
          {
            label: 'Extinction Risk',
            data: extinctionRisk,
            backgroundColor: 'rgba(255, 159, 64, 0.2)',
            borderColor: 'rgba(255, 159, 64, 1)',
            borderWidth: 1
          }
        ]
      });
    }).catch(error => console.error('Error fetching biodiversity data:', error));

    // Fetch water risk data
    Promise.all(selectedRegions.map(region =>
      fetch(`https://eauclaire.online:3030/api/niveau?region=${region}&year=${selectedYear}`)
        .then(response => response.json())
    )).then(datas => {
      const regions = [];
      const droughtRisks = [];
      const floodRisks = [];
      datas.forEach(data => {
        data.forEach(item => {
          regions.push(item.Region);
          droughtRisks.push(item['RisqueSecheresse (sur 10)']);
          floodRisks.push(item['RisqueInondation (sur 10)']);
        });
      });
      setWaterRiskData({
        labels: [...new Set(regions)],
        datasets: [
          {
            label: 'Drought Risk',
            data: droughtRisks,
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1
          },
          {
            label: 'Flood Risk',
            data: floodRisks,
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
          }
        ]
      });
    }).catch(error => console.error('Error fetching water risk data:', error));

  }, [selectedRegions, selectedYear]);

  const handleRegionChange = (region) => {
    setSelectedRegions(prev =>
      prev.includes(region) ? prev.filter(r => r !== region) : [...prev, region]
    );
  };

  return (
    <div style={{ margin: '50px' }}>
    <div style={{ marginBottom: '20px' }}>
  <label htmlFor="regionSelect">Regions:</label>
  <div className="dropdown-container">
    <button className="dropdown-button">
      Select Regions
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

  <label htmlFor="yearSelect">Year:</label>
  <select id="yearSelect" value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
    {[...Array(11).keys()].map(i => (
      <option key={i} value={2000 + i * 5}>
        {2000 + i * 5}
      </option>
    ))}
    <option value={2024}>2024</option>
  </select>
</div>
      <hr />

      {/* Biodiversity Chart */}
      <div className="chart-container">
        <h3>Biodiversity in Rivers ({selectedYear})</h3>
        {biodiversityData.labels ? (
          <Bar 
            data={biodiversityData} 
            options={{ 
              responsive: true, 
              plugins: { 
                legend: { position: 'bottom' }, 
                title: { display: true, text: `Species Count and Extinction Risk (${selectedYear})` } 
              } 
            }} 
          />
        ) : (
          <p>Loading biodiversity data...</p>
        )}
      </div>

      <hr />

      {/* Water Risk Chart */}
      <div className="chart-container">
        <h3>Water Risks (Drought & Flood)</h3>
        {waterRiskData.labels ? (
          <Bar 
            data={waterRiskData} 
            options={{ 
              responsive: true, 
              plugins: { 
                legend: { position: 'bottom' }, 
                title: { display: true, text: `Water Risks (${selectedYear})` } 
              } 
            }} 
          />
        ) : (
          <p>Loading water risk data...</p>
        )}
      </div>
      {/* Water Quality Chart */}
      <div className="chart-container">
        <h3>Water Quality Over Time (2000-2050)</h3>
        {waterQualityData.labels ? (
          <Line 
            data={waterQualityData} 
            options={{ 
              responsive: true, 
              plugins: { 
                legend: { position: 'bottom' }, 
                title: { display: true, text: 'Water Quality Index (2000-2050)' } 
              } 
            }} 
          />
        ) : (
          <p>Loading water quality data...</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
