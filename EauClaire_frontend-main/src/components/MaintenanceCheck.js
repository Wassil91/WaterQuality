import API_BASE_URL from '../apiConfig';
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

const MaintenanceCheck = () => {
    const [isMaintenance, setIsMaintenance] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const checkMaintenanceStatus = async () => {
            try {
                console.log("Fetching maintenance status...");
                const response = await fetch(`${API_BASE_URL}/maintenance-status`); // Full URL for testing
                
                console.log("Response status:", response.status);

                if (!response.ok) {
                    throw new Error(`HTTP status ${response.status}`);
                }

                const data = await response.json();
                console.log("Maintenance status response data:", data);

                // Set maintenance status based on API response
                if (data.status === 'en maintenance') {
                    setIsMaintenance(true);
                } else {
                    setIsMaintenance(false);
                }
            } catch (error) {
                console.error('Error checking maintenance status:', error.message);
                setError(`Error checking maintenance status: ${error.message}`);
                setIsMaintenance(true);  // Fallback: assume maintenance on error
            } finally {
                setLoading(false);
            }
        };

        checkMaintenanceStatus();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    if (isMaintenance) {
        console.log("Redirecting to maintenance page...");
        return <Navigate to="/maintenance" />;
    }
    
    // If not in maintenance, redirect to accueil
    return <Navigate to="/accueil" />;
};

export default MaintenanceCheck;
