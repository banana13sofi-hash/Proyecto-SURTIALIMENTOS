import React, { useMemo, useState, useEffect } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import categories from "../../data/categories";
import "../HomePage/estilos.css";

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
    <div style={{ padding: "1rem" }}>
      <div style={{ marginBottom: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Resultados para "{term}"</h2>
        <Link to="/home" style={{ textDecoration: "none", color: "#f28f3b", fontWeight: 600 }}>Volver</Link>
      </div>

      <div className="results-panel">
        <div style={{ padding: "0.5rem 0.75rem" }}>
          <strong>{total}</strong> resultado(s) encontrados
        </div>

        {selected ? (
          <div className="product-detail" style={{ padding: 12 }}>
            <table width="100%">
              <tbody>
                <tr>
                  <td colSpan={1} style={{ backgroundColor: "#c8553d", textAlign: "center" }}>
                    <h3 style={{ margin: 8 }}>{selected.category.toUpperCase()}</h3>
                  </td>
                </tr>
              </tbody>
            </table>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", marginTop: 20 }}>
              <table width="80%" style={{ marginBottom: 20, alignSelf: 'center' }}>
                <tbody>
                  <tr>
                    <td style={{ backgroundColor: "#f28f3b", textAlign: "center", padding: 12 }}>
                      {selected.name}
                    </td>
                  </tr>
                </tbody>
              </table>

              <img src={selected.image} alt={selected.name} style={{ maxWidth: 300, width: "100%", height: "auto", marginBottom: 20, alignSelf: 'center' }} />

              <h3 style={{ marginTop: 20 }}>GENERALIDADES</h3>
              <p><strong>Cantidad:</strong> {selected.quantity ?? 0}</p>

              <div style={{ alignSelf: "flex-start", textAlign: "left", width: "100%", maxWidth: 400 }}>
                <p><strong>Fecha de vencimiento más cercana:</strong> {selected.expiry || "N/A"}</p>
                <p><strong>Código de barras</strong></p>
                <div className="barcode-image" style={{ marginBottom: 20, display: "flex", justifyContent: "center" }}>
                  <img src={selected.barcode || "https://via.placeholder.com/100x40?text=Barcode"} alt="Código de barras" style={{ maxWidth: 100, width: "100%", height: "auto", display: "block" }} />
                </div>
              </div>

              <div className="bottom-buttons" style={{ marginBottom: 20, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', gap: 8, width: '100%' }}>
                <div className="counter" style={{ alignSelf: 'center', marginTop: 8 }}>
                  <button type="button" className="counter-btn" onClick={() => setQty((q) => Math.max(1, q - 1))}>-</button>
                  <input className="counter-input" type="number" min={1} value={qty} onChange={(e) => setQty(Math.max(1, Number(e.target.value || 1)))} />
                  <button type="button" className="counter-btn" onClick={() => setQty((q) => q + 1)}>+</button>
                </div>

                <button className="btn btn-primary" style={{ backgroundColor: '#FFD5CD', color: '#000', border: '1px solid rgba(0,0,0,0.06)', marginTop: 6 }} onClick={() => {

                  try {
                    const raw = localStorage.getItem("cart") || "[]";
                    const cart = JSON.parse(raw);
                    const existing = cart.find((c) => c.name === selected.name && c.category === selected.category);
                    if (existing) {
                      existing.qty = (existing.qty || 0) + qty;
                    } else {
                      cart.push({ name: selected.name, category: selected.category, qty, addedAt: new Date().toISOString() });
                    }
                    localStorage.setItem("cart", JSON.stringify(cart));
                    navigate("/order");
                  } catch (err) {
                    console.error(err);
                    alert("No se pudo agregar a la orden");
                  }
                }}>Agregar a la orden</button>
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
              <div className="sub-list" style={{ paddingTop: 8 }}>
                {filtered[cat].length ? (
                  filtered[cat].map((it) => (
                    <div
                      className="sub-item"
                      key={it}
                      style={{ margin: "0.25rem" }}
                      onClick={() => setSelected({ name: it, category: cat, image: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcDg2emltcXc0OGk3MnoyN2FveWhzZmR1YnBkeXR5OGZ3eTl6eTludSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/lX3GTgWi2W2GY/giphy.gif", quantity: 1000, expiry: "29 de septiembre de 2025", barcode: "https://via.placeholder.com/100x40?text=Barcode" })}
                    >
                      {it}
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