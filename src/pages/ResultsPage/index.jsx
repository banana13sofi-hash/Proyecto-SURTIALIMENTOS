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

  const defaultProductImage = "https://via.placeholder.com/300?text=Producto";

  const normalizeText = (text) =>
    text
      ? text
        .toString()
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .toLowerCase()
      : "";

  const staticImageMap = Object.values(categories).flat().reduce((map, item) => {
    map[normalizeText(item.nombre)] = item.imagen;
    return map;
  }, {});

  const getProductImage = (product) => {
    const nameKey = normalizeText(product.name || product.nombre);
    if (staticImageMap[nameKey]) {
      return product.image || product.imagen || staticImageMap[nameKey];
    }

    const fallbackKey = Object.keys(staticImageMap).find(
      (key) => nameKey.includes(key) || key.includes(nameKey)
    );

    return (
      product.image ||
      product.imagen ||
      staticImageMap[fallbackKey] ||
      defaultProductImage
    );
  };

  const addProductToCart = (product, quantity = 1) => {
    try {
      const raw = localStorage.getItem("cart") || "[]";
      const cart = JSON.parse(raw);
      const productId = product.id || product.barcode || `${product.name || product.nombre}`;
      const existing = cart.find((item) => item.id === productId);
      if (existing) {
        existing.qty = (existing.qty || 0) + quantity;
      } else {
        cart.push({
          id: productId,
          name: product.name || product.nombre,
          category: product.category || product.categoria || "Sin Categoría",
          qty: quantity,
          precio: product.precio || 0,
          addedAt: new Date().toISOString(),
        });
      }
      localStorage.setItem("cart", JSON.stringify(cart));
    } catch (err) {
      console.error("Error adding product to cart:", err);
      alert("No se pudo agregar el producto a la orden");
    }
  };

  const filtered = useMemo(() => {
    const t = term.trim().toLowerCase();
    const res = {};
    Object.keys(categories).forEach((cat) => {
      if (!t) res[cat] = categories[cat];
      else res[cat] = categories[cat].filter((it) =>
        it.nombre.toLowerCase().includes(t)
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
        const staticMatch = Object.values(categories)
          .flat()
          .find((it) => {
            const itemName = normalizeText(it.nombre);
            const searchName = normalizeText(productDetails.nombre);
            return (
              itemName === searchName ||
              itemName.includes(searchName) ||
              searchName.includes(itemName)
            );
          });

        setSelected({
          id: productDetails.id,
          name: productDetails.nombre,
          category: productDetails.categoria,
          image: getProductImage({
            name: productDetails.nombre,
            imagen: productDetails.imagen,
            image: productDetails.image,
          }),
          quantity: productDetails.stock,
          expiry: "N/A", // Assuming no expiry in DB
          barcode: productDetails.barcode || "https://via.placeholder.com/100x40?text=Barcode",
          descripcion: productDetails.descripcion,
          precio: productDetails.precio
        });
        return;
      }
      // Fallback to static data if not found in API
      for (const cat of Object.keys(filtered)) {
        const match = filtered[cat].find((it) => {
          const itemName = normalizeText(it.nombre);
          return (
            itemName === normalizeText(term) ||
            itemName.includes(normalizeText(term)) ||
            normalizeText(term).includes(itemName)
          );
        });
        if (match) {
          setSelected({
            id: match.id || `static-${cat}-${match.nombre}`,
            name: match.nombre,
            category: cat,
            image: getProductImage(match),
            quantity: match.cantidad || 1000,
            expiry: "29 de septiembre de 2025",
            barcode: match.barcode || "https://via.placeholder.com/100x40?text=Barcode",
            precio: match.precio || 0,
          });
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
                          src={getProductImage(it)}
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
                      <button
                        type="button"
                        className="add-item-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          addProductToCart(it, 1);
                          alert(`${it.nombre} agregado a la orden`);
                        }}
                      >
                        Agregar a la orden
                      </button>
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