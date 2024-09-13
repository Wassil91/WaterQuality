import React, { useState, useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './infoMap.css'; // Import your CSS file
import { RegionModal, DepartmentModal } from './modal'; // Import the modals

const defaultIcon = new L.Icon({
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  shadowSize: [41, 41],
  shadowAnchor: [12, 41],
});

const InfoMap = () => {
  const [coords, setCoords] = useState([]);
  const [locationType, setLocationType] = useState('regions');
  const [selectedYear, setSelectedYear] = useState('2024');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [modalTitle, setModalTitle] = useState('');
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);

  useEffect(() => {
    const initialMap = L.map('map').setView([46, 2], 6);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors',
    }).addTo(initialMap);

    setMap(initialMap);

    return () => {
      if (initialMap) {
        initialMap.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (map) {
      fetchDataAndSetMarkers(locationType, selectedYear);
    }
  }, [locationType, selectedYear, map]);

  const fetchDataAndSetMarkers = (type, year) => {
    if (!map) return;

    markers.forEach(marker => map.removeLayer(marker));

    fetch(`http://127.0.0.1:8000/api/coords?type=${type}`)
      .then(response => response.json())
      .then(data => {
        setCoords(data);

        const newMarkers = data.map((item) => {
          const lat = type === 'regions' ? parseFloat(item.Region_Lat) : parseFloat(item.Department_Lat);
          const lng = type === 'regions' ? parseFloat(item.Region_Lng) : parseFloat(item.Department_Lng);
          const name = type === 'regions' ? item.Regions : item.Departements;

          if (!isNaN(lat) && !isNaN(lng)) {
            const marker = L.marker([lat, lng], { icon: defaultIcon })
              .bindPopup(`<b>${type === 'regions' ? 'Région' : 'Département'}:</b> ${name}`)
              .on('click', () => {
                fetchModalData(name);
                setModalTitle(name);
                setModalOpen(true);
              });

            marker.addTo(map);
            return marker;
          }
          return null;
        }).filter(marker => marker !== null);

        setMarkers(newMarkers);
      })
      .catch(error => console.error('Error fetching coordinates:', error));
  };

  const fetchModalData = async (name) => {
    try {
      const year = selectedYear || '2024';

      const biodivData = locationType === 'regions' ? 
        await fetch(`http://127.0.0.1:8000/api/biodiversite?year=${year}&region=${name}`)
          .then(response => response.json()) : [];
      const consommationData = locationType === 'departements' || locationType === 'regions' ?
        await fetch(`http://127.0.0.1:8000/api/consommation?year=${year}&region=${name}`)
          .then(response => response.json()) : [];
      const qualiteData = locationType === 'departements' ?
        await fetch(`http://127.0.0.1:8000/api/qualite-dep?year=${year}&department=${name}`)
          .then(response => response.json()) : [];
      const niveauData = locationType === 'regions' ?
        await fetch(`http://127.0.0.1:8000/api/niveau?year=${year}&region=${name}`)
          .then(response => response.json()) : [];

      setModalData({
        biodiversite: biodivData,
        consommation: consommationData,
        qualite: qualiteData,
        niveau: niveauData,
      });
    } catch (error) {
      console.error('Error fetching detailed data:', error);
    }
  };

  const handleLocationChange = (event) => {
    setLocationType(event.target.value);
    setModalOpen(false);
  };

  const handleYearChange = (event) => {
    setSelectedYear(event.target.value);
  };

  const years = [2024];
  for (let year = 2000; year <= 2050; year += 5) {
    if (year !== 2024) {
      years.push(year);
    }
  }

  const closeModal = () => {
    setModalOpen(false);
    setModalData(null);
  };

  return (
    <div className="mapContainer">
      <h2>Carte des Régions et Départements</h2>
      <div className="filterContainer">
        <label>
          <p>Sélectionner les zones :</p>
          <select onChange={handleLocationChange} value={locationType}>
            <option value="regions">Région</option>
            <option value="departements">Département</option>
          </select>
        </label>
        <label>
          <p>Sélectionner l'année :</p>
          <select onChange={handleYearChange} value={selectedYear}>
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </label>
      </div>
      <div id="map" className="map"></div>
      {locationType === 'regions' && (
        <RegionModal isOpen={modalOpen} onClose={closeModal} title={modalTitle} data={modalData} />
      )}
      {locationType === 'departements' && (
        <DepartmentModal isOpen={modalOpen} onClose={closeModal} title={modalTitle} data={modalData} />
      )}
    </div>
  );
};

export default InfoMap;

