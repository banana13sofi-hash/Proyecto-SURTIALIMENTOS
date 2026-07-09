import React, { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./estilos.css";
import categoriesData from "../../data/categories";

function HomePage() {
  const navigate = useNavigate();

  const [term, setTerm] = useState("");
  const [visible, setVisible] = useState(false);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState({});
  const [loading, setLoading] = useState(true);
  const [openGroup, setOpenGroup] = useState(null);
  const searchBoxRef = useRef(null);

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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(event.target)) {
        setVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const findStaticImage = (name) => {
    const match = Object.values(categoriesData)
      .flat()
      .find((item) => item.nombre.toLowerCase() === name.toLowerCase());
    return match?.imagen;
  };

  const getProductImage = (product) => {
    const productName = String(product?.nombre || "").trim().toLowerCase();
    const categoryName = String(product?.categoria || product?.category || "").trim().toLowerCase();

    const keywordImageMap = {
      banana: "https://images.unsplash.com/photo-1574226516831-e1dff420e43e?auto=format&fit=crop&w=300&q=80",
      platano: "https://images.unsplash.com/photo-1574226516831-e1dff420e43e?auto=format&fit=crop&w=300&q=80",
      naranja: "https://images.unsplash.com/photo-1575908524634-0d8e60b5e938?auto=format&fit=crop&w=300&q=80",
      orange: "https://images.unsplash.com/photo-1575908524634-0d8e60b5e938?auto=format&fit=crop&w=300&q=80",
      uva: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=300&q=80",
      grape: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=300&q=80",
      manzana: "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?auto=format&fit=crop&w=300&q=80",
      apple: "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?auto=format&fit=crop&w=300&q=80",
      pera: "https://images.unsplash.com/photo-1491421801882-7ed173d7aae0?auto=format&fit=crop&w=300&q=80",
      fresa: "https://images.unsplash.com/photo-1535914254981-b5012eebbd15?auto=format&fit=crop&w=300&q=80",
      mango: "https://images.unsplash.com/photo-1617196037275-975bffb6ed9e?auto=format&fit=crop&w=300&q=80",
      tomate: "https://images.unsplash.com/photo-1592841494218-832cb10d5111?w=300",
      lechuga: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300",
      pollo: "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=300",
      carne: "https://images.unsplash.com/photo-1555939594-58d7cb561404?w=300",
      detergente: "https://images.unsplash.com/photo-1599599810974-69f0e2d9b74d?w=300",
    };

    for (const [keyword, image] of Object.entries(keywordImageMap)) {
      if (productName.includes(keyword) || categoryName.includes(keyword)) {
        return image;
      }
    }

    if (product.imagen) return product.imagen;
    if (findStaticImage(product.nombre)) return findStaticImage(product.nombre);

    if (categoryName.includes("fruta") || categoryName.includes("a")) {
      return "https://images.unsplash.com/photo-1574226516831-e1dff420e43e?auto=format&fit=crop&w=300&q=80";
    }
    if (categoryName.includes("verdura") || categoryName.includes("b")) {
      return "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300";
    }

    return "https://via.placeholder.com/150?text=Producto";
  };

  const getCategoryLabel = (category) => {
    if (!category) return "General";
    const normalized = String(category).trim();
    const lower = normalized.toLowerCase();

    if (lower.includes("fruta") || lower.includes("banana") || lower.includes("manzana") || lower.includes("naranja") || lower.includes("uva") || lower.includes("pera") || lower.includes("fresa") || lower.includes("mango")) {
      return "Frutas";
    }
    if (lower.includes("verdura") || lower.includes("lechuga") || lower.includes("tomate") || lower.includes("zanahoria") || lower.includes("cebolla") || lower.includes("ajo") || lower.includes("pimiento")) {
      return "Verduras";
    }
    if (lower.includes("enlat") || lower.includes("atun") || lower.includes("maiz") || lower.includes("sopa") || lower.includes("frijol") || lower.includes("champin")) {
      return "Enlatados";
    }
    if (lower.includes("limp") || lower.includes("deterg") || lower.includes("lavava") || lower.includes("cloro") || lower.includes("esponja")) {
      return "Productos de limpieza";
    }
    return "General";
  };

  const addToOrder = (product, event) => {
    if (event) event.stopPropagation();
    try {
      const raw = localStorage.getItem("cart") || "[]";
      const cart = JSON.parse(raw);
      const itemId = product.id || product.barcode || `${product.nombre}`;
      const existing = cart.find((item) => item.id === itemId);
      if (existing) {
        existing.qty = (existing.qty || 0) + 1;
      } else {
        cart.push({
          id: itemId,
          name: product.nombre,
          category: product.categoria || product.category || "Sin Categoría",
          qty: 1,
          precio: product.precio || 0,
          addedAt: new Date().toISOString(),
        });
      }
      localStorage.setItem("cart", JSON.stringify(cart));
      setVisible(false);
      alert(`${product.nombre} agregado a la orden`);
    } catch (error) {
      console.error("Error adding product to cart:", error);
      alert("No se pudo agregar el producto a la orden");
    }
  };

  const getCategoryFilterFromTerm = (searchText) => {
    const normalized = searchText.trim().toLowerCase();
    if (!normalized) return null;

    if (normalized.includes("fruta") || normalized.includes("banana") || normalized.includes("manzana") || normalized.includes("naranja") || normalized.includes("uva") || normalized.includes("pera") || normalized.includes("fresa") || normalized.includes("mango")) {
      return "Frutas";
    }
    if (normalized.includes("verdura") || normalized.includes("lechuga") || normalized.includes("tomate") || normalized.includes("zanahoria") || normalized.includes("cebolla") || normalized.includes("ajo") || normalized.includes("pimiento")) {
      return "Verduras";
    }
    if (normalized.includes("enlat") || normalized.includes("atun") || normalized.includes("maiz") || normalized.includes("sopa") || normalized.includes("frijol") || normalized.includes("champin")) {
      return "Enlatados";
    }
    if (normalized.includes("limp") || normalized.includes("deterg") || normalized.includes("lavava") || normalized.includes("cloro") || normalized.includes("esponja")) {
      return "Productos de limpieza";
    }
    return null;
  };

  const filtered = useMemo(() => {
    const t = term.trim().toLowerCase();
    const categoryFilter = getCategoryFilterFromTerm(t);
    const grouped = {
      Frutas: categoriesData.Frutas || [],
      Verduras: categoriesData.Verduras || [],
      Enlatados: categoriesData.Enlatados || [],
      "Productos de limpieza": categoriesData["Productos de Limpieza"] || [],
    };

    const filteredGroups = {};

    Object.entries(grouped).forEach(([groupName, items]) => {
      const normalizedGroupName = groupName.toLowerCase();
      const groupMatches = !t || normalizedGroupName.includes(t);
      const visibleItems = items.filter((item) => {
        const itemName = String(item.nombre || "").toLowerCase();
        const itemDescription = String(item.descripcion || "").toLowerCase();
        return !t || itemName.includes(t) || itemDescription.includes(t);
      });

      if (groupMatches || visibleItems.length > 0) {
        filteredGroups[groupName] = t ? visibleItems : items;
      }
    });

    if (categoryFilter) {
      return { [categoryFilter]: grouped[categoryFilter] || [] };
    }

    if (!t) {
      return filteredGroups;
    }

    return filteredGroups;
  }, [term]);

  function onSelectItem(item) {
    setVisible(false);
    navigate(`/results?term=${encodeURIComponent(item)}`);
  }

  function toggleGroup(groupName) {
    setOpenGroup((prev) => (prev === groupName ? null : groupName));
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <p>Cargando productos...</p>
      </div>
    );
  }

  return (
    <div className="home-page-shell">
      <div className="home-hero">
        <div className="home-hero-content">
          <p className="home-hero-badge">Gestión de pedidos</p>
          <h3>Bienvenido señor usuario</h3>
          <p>Busca productos por nombre o categoría y organiza tus pedidos con una experiencia más limpia y ordenada.</p>
        </div>
      </div>

      <div className="search-box" ref={searchBoxRef}>
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
              placeholder="Buscar productos o categorías"
              value={term}
              onChange={(e) => {
                const value = e.target.value;
                setTerm(value);
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
            {Object.entries(filtered).filter(([, items]) => items.length > 0).length ? (
              Object.entries(filtered).filter(([, items]) => items.length > 0).map(([groupName, items]) => (
                <div className="category" key={groupName}>
                  <div className="category-header" onClick={() => toggleGroup(groupName)}>
                    <span className="cat-name">{groupName}</span>
                    <span className="cat-count">{items.length}</span>
                  </div>
                  {openGroup === groupName && (
                    <div className="sub-list compact-list">
                      {items.map((product) => (
                        <button
                          key={product.id || product.barcode || `${product.nombre}`}
                          type="button"
                          className="sub-item compact-item"
                          onClick={() => onSelectItem(product.nombre)}
                        >
                          {product.nombre}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="no-results">No hay coincidencias</div>
            )}
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
