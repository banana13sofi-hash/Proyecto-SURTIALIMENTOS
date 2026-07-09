import React, { useMemo, useState } from 'react';
import './Splash.css';

export default function Splash({ onEnter }) {
    const [entered, setEntered] = useState(false);
    const [fadeOut, setFadeOut] = useState(false);

    const logoAlt = 'Surtialimentos logo';
    const title = 'Surtialimentos';

    const handleEnter = () => {
        if (entered) return;
        setEntered(true);
        setFadeOut(true);

        // Espera al fadeout y luego permite mostrar la app
        setTimeout(() => {
            onEnter?.();
        }, 320);
    };

    const rootClass = useMemo(() => {
        if (!fadeOut) return 'splash-react-root';
        return 'splash-react-root splash-react-fade';
    }, [fadeOut]);

    return (
        <div className={rootClass}>
            <div className="splash-react-card">
                <div className="splash-react-logo" aria-hidden="true">
                    <img src={process.env.PUBLIC_URL + '/Logo.png'} alt={logoAlt} />
                </div>

                <div className="splash-react-content">
                    <div className="splash-react-topline">Organiza, controla y ahorra</div>
                    <h1>
                        {title}
                        <span className="splash-react-subtitle">• Panel de alimentos</span>
                    </h1>

                    <p>
                        Una experiencia moderna para registrar productos, consultar inventario y llevar el control de tus órdenes.
                    </p>

                    <div className="splash-react-actions">
                        <button className="splash-react-btn splash-react-btn-primary" onClick={handleEnter}>
                            Entrar
                        </button>
                    </div>

                    <div className="splash-react-meta">
                        <span className="splash-react-chip">Demo</span>
                        <span className="splash-react-chip">v1.0</span>
                        <span className="splash-react-chip">SENA</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

