import React from 'react';
import './Sidebar.css';
import logo from '../../Assets/Logo.png'; 

function Sidebar() {
    return (
        <aside className="sidebar">
            <img src={logo} alt="Logo de Surtialimentos" className="sidebar-logo" />
            <p className="sidebar-text">Menú lateral</p>
        </aside>
    );
}

export default Sidebar;