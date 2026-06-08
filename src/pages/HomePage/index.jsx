import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./estilos.css";
import categoriesData from "../../data/categories";

function HomePage() {
  const navigate = useNavigate();

  const [term, setTerm] = useState("");
  const [expanded, setExpanded] = useState(null);
  const [visible, setVisible] = useState(false);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("http://localhost:3001/api/products");
        if (response.ok) {
          const products = await response.json();
          setProducts(products);
          // Group products by categoria
          const grouped = {};
          products.forEach(product => {
            const cat = product.categoria || "Sin Categoría";
            if (!grouped[cat]) grouped[cat] = [];
            grouped[cat].push(product);
          });
          setCategories(grouped);
        } else {
          console.error("Failed to fetch products");
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filtered = useMemo(() => {
    const t = term.trim().toLowerCase();
    const res = {};

    // Filtrar productos de la base de datos
    Object.keys(categories).forEach((cat) => {
      if (!t) {
        res[cat] = categories[cat];
      } else {
        res[cat] = categories[cat].filter((product) =>
          product.nombre.toLowerCase().includes(t) ||
          (product.descripcion || "").toLowerCase().includes(t)
        );
      }
    });

    // Agregar categorías y subcategorías del archivo de datos
    Object.keys(categoriesData).forEach((catName) => {
      const subcategories = categoriesData[catName];

      // Filtrar subcategorías que coincidan con la búsqueda
      const filteredSubcats = subcategories.filter((subcat) =>
        subcat.nombre.toLowerCase().includes(t) ||
        catName.toLowerCase().includes(t)
      );

      if (filteredSubcats.length > 0 || !t) {
        if (!res[catName]) {
          res[catName] = [];
        }

        const subCatsToAdd = !t ? subcategories : filteredSubcats;

        subCatsToAdd.forEach((subcat) => {
          if (!res[catName].find((item) =>
            item.nombre === subcat.nombre
          )) {
            res[catName].push({
              ...subcat,
              id: `subcat-${catName}-${subcat.nombre}`,
              isSubcategory: true,
            });
          }
        });
      }
    });

    return res;
  }, [term, categories]);

  function onSelectItem(item) {
    navigate(`/results?term=${encodeURIComponent(item)}`);
  }

  function toggleCategory(cat) {
    setExpanded((prev) => (prev === cat ? null : cat));
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <p>Cargando productos...</p>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "white" }}>
      <table width="100%">
        <tbody>
          <tr>
            <td colSpan="1" style={{ backgroundColor: "#c8553d" }}>
              <h3 style={{ textAlign: "center", margin: 0, color: "#000", textTransform: "none" }}>
                Bienvenido señor usuario
              </h3>
            </td>
          </tr>
        </tbody>
      </table>

      <div className="search-box">
        <form
          method="get"
          id="search-form"
          onSubmit={(e) => {
            e.preventDefault();
            navigate(`/results?term=${encodeURIComponent(term)}`);
            setVisible(false);
          }}
        >
          <fieldset>
            <input
              type="text"
              id="search-input"
              placeholder="Buscar productos"
              value={term}
              onChange={(e) => {
                setTerm(e.target.value);
                setVisible(true);
              }}
              onFocus={() => setVisible(true)}
              autoComplete="off"
            />
            <button
              className="search-button"
              type="submit"
              style={{ backgroundColor: "#f28f3b" }}
              aria-label="Buscar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false" width="18" height="18" fill="currentColor">
                <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zM9.5 14A4.5 4.5 0 1 1 14 9.5 4.505 4.505 0 0 1 9.5 14z" />
              </svg>
              <span>Buscar</span>
            </button>
          </fieldset>
        </form>

        {visible && (
          <div className="results-panel">
            {Object.keys(filtered).map((cat) => {
              const items = filtered[cat];
              return (
                <div className="category" key={cat}>
                  <div
                    className="category-header"
                    onClick={() => toggleCategory(cat)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={() => toggleCategory(cat)}
                  >
                    <span className="cat-name">{cat}</span>
                    <span className="cat-count">{items.length}</span>
                  </div>

                  {(expanded === cat || term) && (
                    <div className="sub-list">
                      {items.length ? (
                        items.map((product) => (
                          <div
                            key={product.id}
                            className="sub-item-card"
                            onClick={() => onSelectItem(product.nombre)}
                          >
                            <div className="product-card-container">
                              {product.imagen && (
                                <img
                                  src={product.imagen}
                                  alt={product.nombre}
                                  className="product-card-image"
                                  onError={(e) => {
                                    e.target.src = "https://via.placeholder.com/80?text=Producto";
                                  }}
                                />
                              )}
                              <div className="product-card-info">
                                <div className="product-card-name">{product.nombre}</div>
                                <div className="product-card-meta">
                                  <span className="product-card-price">${product.precio ? product.precio.toFixed(2) : '0.00'}</span>
                                  <span className="product-card-qty">Stock: {product.cantidad}</span>
                                </div>
                                {product.barcode && (
                                  <div className="product-card-barcode">
                                    <img
                                      src={`https://barcode.tec-it.com/barcode.ashx?data=${product.barcode}&code=Code128&dpi=96&height=30&showtext=0`}
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
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="bottom-actions">
        <button
          className="btn btn-primary"
          onClick={() => navigate("/order")}
          type="button"
        >
          Revisar orden
        </button>

        <button
          className="btn btn-logout"
          onClick={() => navigate("/")}
          type="button"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}

export default HomePage;
