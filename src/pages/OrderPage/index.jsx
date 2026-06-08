import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./OrderPage.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001/api";

// Function to send order to API
const sendOrderToAPI = async (orderData, token) => {
  try {
    const response = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(orderData),
    });
    if (response.ok) {
      return await response.json();
    } else {
      throw new Error('Failed to send order');
    }
  } catch (error) {
    console.error('Error sending order:', error);
    throw error;
  }
};

// Function to fetch orders from API
const fetchOrdersFromAPI = async (token) => {
  try {
    const response = await fetch(`${API_URL}/orders`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.ok) {
      return await response.json();
    } else {
      console.error('Failed to fetch orders');
      return [];
    }
  } catch (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
};

function OrderPage() {
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [wasEmptied, setWasEmptied] = useState(false);
  const [userId, setUserId] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('cart') || '[]';
      setCart(JSON.parse(raw));
    } catch (err) {
      console.error(err);
      setCart([]);
    }

    const storedUser = localStorage.getItem('authUser');
    const storedToken = localStorage.getItem('authToken');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUserId(parsedUser.id);
    }
    if (storedToken) {
      setToken(storedToken);
    }

    const loadOrders = async () => {
      if (!storedToken) {
        return;
      }
      const fetchedOrders = await fetchOrdersFromAPI(storedToken);
      setOrders(fetchedOrders);
    };
    loadOrders();
  }, []);

  function saveCart(newCart) {
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  }

  function updateQty(index, delta) {
    const copy = [...cart];
    copy[index].qty = Math.max(1, (copy[index].qty || 1) + delta);
    saveCart(copy);
  }

  function removeItem(index) {
    const copy = [...cart];
    copy.splice(index, 1);
    saveCart(copy);
  }

  function clearCart() {
    saveCart([]);
    setWasEmptied(true);
  }

  const navigate = useNavigate();

  async function sendOrder() {
    try {
      if (!token) {
        alert('Debe iniciar sesión para enviar una orden');
        navigate('/');
        return;
      }

      const items = cart.map(item => ({
        producto_id: item.id,
        cantidad: item.qty,
        precio: item.precio
      }));

      const orderData = {
        items,
        estado: 'pendiente',
      };
      await sendOrderToAPI(orderData, token);
      alert("Su orden ha sido enviada satisfactoriamente");
      clearCart();
      navigate("/home");
    } catch (error) {
      alert("Error al enviar la orden: " + error.message);
    }
  }

  const totalItems = cart.reduce((s, it) => s + (it.qty || 0), 0);
  const totalPrice = cart.reduce((s, it) => s + (it.qty * it.precio), 0);

  return (
    <div className="order-page">
      <div className="order-header">
        <h3>ORDEN</h3>
      </div>

      <div className="order-info-section">
        <h3>INFORMACIÓN DE LA ORDEN</h3>

        {cart.length > 0 ? (
          (() => {
            const dates = cart.map((c) => c.addedAt).filter(Boolean).map((d) => new Date(d));
            const earliest = dates.length ? new Date(Math.min(...dates.map((d) => d.getTime()))) : new Date();
            return <p><strong>Fecha de generación:</strong> {earliest.toLocaleString('es-CO')}</p>;
          })()
        ) : (
          <p><strong>Fecha de generación:</strong> {new Date().toLocaleString('es-CO')}</p>
        )}
        <p><strong>Lugar de entrega:</strong> Supermercados Jimmy</p>
      </div>

      <div className="order-products-section">
        <h3>PRODUCTOS SELECCIONADOS</h3>

        {cart.length === 0 ? (
          <div className="empty-order">
            <p>No hay productos en la orden.</p>
            <button
              className="btn btn-back-home"
              onClick={() => navigate("/home")}
            >
              Volver al inicio
            </button>
          </div>
        ) : (
          <div>
            <div className="order-list">
              {cart.map((item, idx) => (
                <div className="order-item" key={`${item.name}-${idx}`}>
                  <div className="order-item-info">
                    <div className="order-item-name">{item.name}</div>
                    <div className="order-item-category">{item.category}</div>
                  </div>

                  <div className="order-item-controls">
                    <button className="qty-button" onClick={() => updateQty(idx, -1)}>−</button>
                    <div className="qty-display">{item.qty}</div>
                    <button className="qty-button" onClick={() => updateQty(idx, 1)}>+</button>
                    <button className="remove-btn" onClick={() => removeItem(idx)}>Eliminar</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="order-summary">
              <button className="clear-cart-btn" onClick={clearCart}>Vaciar orden</button>
              <div className="total-price">Total: ${totalPrice.toFixed(2)}</div>
            </div>

            <div className="bottom-buttons">
              <button className="btn btn-logout" onClick={() => navigate('/home')}>Seguir comprando</button>
              <button className="btn btn-primary" id="sendOrderBtn" onClick={sendOrder}>Enviar orden</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default OrderPage;