import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './index.css';

function LoadingPage() {
    const navigate = useNavigate();

    useEffect(() => {

        const showTimer = setTimeout(() => {
            const content = document.querySelector('.loading-content');
            if (content) {
                content.style.opacity = '1';
                content.style.transform = 'translateY(0)';
            }
        }, 100);

        const navigationTimer = setTimeout(() => {
            const container = document.querySelector('.loading-container');
            if (container) {
                container.classList.add('loading-exit');
            }

            setTimeout(() => {
                navigate('/home');
            }, 500);
        }, 4500);

        return () => {
            clearTimeout(showTimer);
            clearTimeout(navigationTimer);
        };
    }, [navigate]);

    return (
        <div className="loading-container">
            <div className="loading-content">
                <h1>Cargando...</h1>
                <p>Por favor espere mientras verificamos su información</p>
                <div className="loading-spinner"></div>
                <p className="loading-message">Será redirigido en unos segundos a la página principal</p>
            </div>
        </div>
    );
}

export default LoadingPage;