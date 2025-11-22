import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

// Function to send order to API
const sendOrderToAPI = async (orderData) => {
  try {
    const response = await fetch('http://localhost:3001/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
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
const fetchOrdersFromAPI = async (userId) => {
  try {
    const response = await fetch(`http://localhost:3001/api/orders?usuario_id=${userId}`);
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
  const [userId, setUserId] = useState(1); // Assuming user ID from auth context

  useEffect(() => {
    try {
      const raw = localStorage.getItem("cart") || "[]";
      setCart(JSON.parse(raw));
    } catch (err) {
      console.error(err);
      setCart([]);
    }
    // Fetch existing orders
    const loadOrders = async () => {
      const fetchedOrders = await fetchOrdersFromAPI(userId);
      setOrders(fetchedOrders);
    };
    loadOrders();
  }, [userId]);

  function saveCart(newCart) {
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
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
      const orderData = {
        usuario_id: 1, // Assuming user ID 1 for now, you can get from auth context
        total: cart.reduce((sum, item) => sum + (item.qty * 10), 0), // Calculate total, assuming price 10 for simplicity
        estado: 'pendiente'
      };
      await sendOrderToAPI(orderData);
      alert("Su orden ha sido enviada satisfactoriamente");
      clearCart();
      navigate("/home");
    } catch (error) {
      alert("Error al enviar la orden: " + error.message);
    }
  }

  const totalItems = cart.reduce((s, it) => s + (it.qty || 0), 0);

  return (
    <div style={{ padding: 16 }}>

      <table width="100%">
        <tbody>
          <tr>
            <td colSpan={1} style={{ backgroundColor: '#c8553d', textAlign: 'center' }}>
              <h3 style={{ margin: 8, color: '#fff' }}>ORDEN</h3>
            </td>
          </tr>
        </tbody>
      </table>

      <h3 style={{ textAlign: 'center', marginTop: 20 }}>INFORMACIÓN DE LA ORDEN</h3>

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

      <h3 style={{ textAlign: 'center', marginTop: 20 }}>PRODUCTOS SELECCIONADOS</h3>

      {cart.length === 0 ? (
        <div>
          <p style={{ textAlign: 'center' }}>No hay productos en la orden.</p>
          <div style={{ textAlign: 'center' }}>
            <Link to="/home" style={{ color: '#f28f3b', fontWeight: 600 }}>Volver al inicio</Link>
          </div>
        </div>
      ) : (
        <div>
          <ul>
            {cart.map((it, idx) => (
              <li key={`${it.name}-${idx}`}>{it.name} x {it.qty}</li>
            ))}
          </ul>

          <div style={{ marginTop: 12 }}>
            <button onClick={clearCart} style={{ marginRight: 8, padding: '8px 10px' }}>Vaciar orden</button>
          </div>

          <div className="order-list" style={{ marginTop: 12 }}>
            {cart.map((item, idx) => (
              <div className="order-item" key={`${item.name}-${idx}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 8, borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{item.name}</div>
                  <div style={{ fontSize: 12, color: '#666' }}>{item.category}</div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button onClick={() => updateQty(idx, -1)}>-</button>
                  <div style={{ minWidth: 32, textAlign: 'center' }}>{item.qty}</div>
                  <button onClick={() => updateQty(idx, 1)}>+</button>
                  <button onClick={() => removeItem(idx)} style={{ marginLeft: 8 }}>Eliminar</button>
                </div>
              </div>
            ))}
          </div>

          <div className="bottom-buttons" style={{ textAlign: 'center', marginTop: 20 }}>
            <button className="btn btn-logout" onClick={() => navigate('/home')} style={{ marginRight: 8 }}>Seguir comprando</button>
            <button className="btn btn-primary" id="sendOrderBtn" onClick={sendOrder}>Enviar orden</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrderPage;