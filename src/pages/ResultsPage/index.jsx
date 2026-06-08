import React, { useMemo, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import categories from "../../data/categories";
import "./ResultsPage.css";

// Function to fetch product details from API
const fetchProductDetails = async (productName) => {
  try {
    const response = await fetch(`http://localhost:3001/api/products?name=${encodeURIComponent(productName)}`);
    if (response.ok) {
      const products = await response.json();
      return products.length > 0 ? products[0] : null;
    }
  } catch (error) {
    console.error('Error fetching product details:', error);
  }
  return null;
};

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function ResultsPage() {
  const query = useQuery();
  const term = query.get("term") || "";
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);
  const [qty, setQty] = useState(1);

  const filtered = useMemo(() => {
    const t = term.trim().toLowerCase();
    const res = {};
    Object.keys(categories).forEach((cat) => {
      if (!t) res[cat] = categories[cat];
      else res[cat] = categories[cat].filter((it) =>
        it.toLowerCase().includes(t)
      );
    });
    return res;
  }, [term]);

  const total = Object.values(filtered).reduce((acc, arr) => acc + arr.length, 0);

  useEffect(() => {
    const fetchAndSetProduct = async () => {
      const t = term.trim().toLowerCase();
      if (!t) {
        setSelected(null);
        return;
      }
      // First try to fetch from API
      const productDetails = await fetchProductDetails(term);
      if (productDetails) {
        setSelected({
          id: productDetails.id,
          name: productDetails.nombre,
          category: productDetails.categoria,
          image: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcDg2emltcXc0OGk3MnoyN2FveWhzZmR1YnBkeXR5OGZ3eTl6eTludSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/lX3GTgWi2W2GY/giphy.gif",
          quantity: productDetails.stock,
          expiry: "N/A", // Assuming no expiry in DB
          barcode: "https://via.placeholder.com/100x40?text=Barcode",
          descripcion: productDetails.descripcion,
          precio: productDetails.precio
        });
        return;
      }
      // Fallback to static data if not found in API
      for (const cat of Object.keys(filtered)) {
        const match = filtered[cat].find((it) => it.toLowerCase() === t);
        if (match) {
          setSelected({ name: match, category: cat, image: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcDg2emltcXc0OGk3MnoyN2FveWhzZmR1YnBkeXR5OGZ3eTl6eTludSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/lX3GTgWi2W2GY/giphy.gif", quantity: 1000, expiry: "29 de septiembre de 2025", barcode: "https://via.placeholder.com/100x40?text=Barcode" });
          return;
        }
      }
      // if no exact match, clear selection but keep list
      setSelected(null);
    };
    fetchAndSetProduct();
  }, [term, filtered]);

  return (
    <div className="results-page">
      <div className="results-header">
        <h2>Resultados para "{term}"</h2>
        <button className="btn-back" onClick={() => navigate("/home")}>
          Volver
        </button>
      </div>

      <div className="results-panel">
        <div className="results-header-info">
          <strong>{total}</strong> resultado(s) encontrados
        </div>

        {selected ? (
          <div className="product-detail">
            <div className="product-category-header">
              {selected.category.toUpperCase()}
            </div>

            <div className="product-detail-layout">
              <div className="product-name-box">
                {selected.name}
              </div>

              <img
                src={selected.image}
                alt={selected.name}
                className="product-image"
              />

              <div style={{ width: "100%", maxWidth: "500px" }}>
                <h3 className="product-section-title">GENERALIDADES</h3>
                <p className="product-info"><strong>Cantidad:</strong> {selected.quantity ?? 0}</p>

                <p className="product-info"><strong>Fecha de vencimiento más cercana:</strong> {selected.expiry || "N/A"}</p>

                <p className="product-info"><strong>Código de barras</strong></p>
                <div className="barcode-image">
                  <img
                    src={selected.barcode || "https://via.placeholder.com/100x40?text=Barcode"}
                    alt="Código de barras"
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                  <div className="counter">
                    <button
                      type="button"
                      className="counter-btn"
                      onClick={() => setQty((q) => Math.max(1, q - 1))}
                    >
                      −
                    </button>
                    <input
                      className="counter-input"
                      type="number"
                      min={1}
                      value={qty}
                      onChange={(e) => setQty(Math.max(1, Number(e.target.value || 1)))}
                    />
                    <button
                      type="button"
                      className="counter-btn"
                      onClick={() => setQty((q) => q + 1)}
                    >
                      +
                    </button>
                  </div>

                  <button
                    className="btn btn-primary add-to-order-btn"
                    onClick={() => {
                      try {
                        const raw = localStorage.getItem("cart") || "[]";
                        const cart = JSON.parse(raw);
                        const existing = cart.find((c) => c.id === selected.id);
                        if (existing) {
                          existing.qty = (existing.qty || 0) + qty;
                        } else {
                          cart.push({
                            id: selected.id,
                            name: selected.name,
                            category: selected.category,
                            qty,
                            precio: selected.precio,
                            addedAt: new Date().toISOString()
                          });
                        }
                        localStorage.setItem("cart", JSON.stringify(cart));
                        navigate("/order");
                      } catch (err) {
                        console.error(err);
                        alert("No se pudo agregar a la orden");
                      }
                    }}
                  >
                    Agregar a la orden
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          Object.keys(filtered).map((cat) => (
            <div className="category" key={cat}>
              <div className="category-header">
                <span className="cat-name">{cat}</span>
                <span className="cat-count">{filtered[cat].length}</span>
              </div>
              <div className="sub-list">
                {filtered[cat].length ? (
                  filtered[cat].map((it) => (
                    <div
                      className="sub-item-card"
                      key={it.nombre}
                      onClick={() => setSelected({
                        id: it.id || `subcat-${cat}-${it.nombre}`,
                        name: it.nombre,
                        category: cat,
                        image: it.imagen || "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcDg2emltcXc0OGk3MnoyN2FveWhzZmR1YnBkeXR5OGZ3eTl6eTludSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/lX3GTgWi2W2GY/giphy.gif",
                        quantity: it.cantidad || 1000,
                        expiry: "29 de septiembre de 2025",
                        barcode: it.barcode || "7501234567001",
                        precio: it.precio || 0,
                      })}
                    >
                      <div className="product-card-container">
                        <img
                          src={it.imagen || "https://via.placeholder.com/80?text=Producto"}
                          alt={it.nombre}
                          className="product-card-image"
                          onError={(e) => {
                            e.target.src = "https://via.placeholder.com/80?text=Producto";
                          }}
                        />
                        <div className="product-card-info">
                          <div className="product-card-name">{it.nombre}</div>
                          <div className="product-card-meta">
                            <span className="product-card-price">${it.precio ? it.precio.toFixed(2) : '0.00'}</span>
                            <span className="product-card-qty">Stock: {it.cantidad}</span>
                          </div>
                          {it.barcode && (
                            <div className="product-card-barcode">
                              <img
                                src={`https://barcode.tec-it.com/barcode.ashx?data=${it.barcode}&code=Code128&dpi=96&height=30&showtext=0`}
                                alt="Barcode"
                                style={{ maxWidth: '100%', height: 'auto' }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-results">No hay coincidencias</div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ResultsPage;