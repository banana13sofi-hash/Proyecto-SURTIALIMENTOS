const categories = {
  Frutas: [
    { nombre: "Manzana", precio: 3.50, cantidad: 250, barcode: "7501234567001", imagen: "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?auto=format&fit=crop&w=300&q=80" },
    { nombre: "Banana", precio: 2.20, cantidad: 180, barcode: "7501234567018", imagen: "https://images.unsplash.com/photo-1574226516831-e1dff420e43e?auto=format&fit=crop&w=300&q=80" },
    { nombre: "Naranja", precio: 4.00, cantidad: 200, barcode: "7501234567025", imagen: "https://images.unsplash.com/photo-1575908524634-0d8e60b5e938?auto=format&fit=crop&w=300&q=80" },
    { nombre: "Uva", precio: 5.99, cantidad: 120, barcode: "7501234567032", imagen: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=300&q=80" },
    { nombre: "Mango", precio: 4.50, cantidad: 90, barcode: "7501234567049", imagen: "https://images.unsplash.com/photo-1617196037275-975bffb6ed9e?auto=format&fit=crop&w=300&q=80" },
    { nombre: "Pera", precio: 3.99, cantidad: 150, barcode: "7501234567056", imagen: "https://images.unsplash.com/photo-1491421801882-7ed173d7aae0?auto=format&fit=crop&w=300&q=80" },
    { nombre: "Fresa", precio: 6.50, cantidad: 100, barcode: "7501234567063", imagen: "https://images.unsplash.com/photo-1535914254981-b5012eebbd15?auto=format&fit=crop&w=300&q=80" },
  ],
  Verduras: [
    { nombre: "Lechuga", precio: 2.50, cantidad: 200, barcode: "7501234567070", imagen: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300" },
    { nombre: "Tomate", precio: 3.00, cantidad: 180, barcode: "7501234567087", imagen: "https://images.unsplash.com/photo-1592841494218-832cb10d5111?w=300" },
    { nombre: "Zanahoria", precio: 2.80, cantidad: 220, barcode: "7501234567094", imagen: "https://images.unsplash.com/photo-1584871539789-b02c1b145900?w=300" },
    { nombre: "Cebolla", precio: 1.99, cantidad: 300, barcode: "7501234567101", imagen: "https://images.unsplash.com/photo-1563308503-cd338a50d3e9?w=300" },
    { nombre: "Ajo", precio: 2.99, cantidad: 150, barcode: "7501234567118", imagen: "https://images.unsplash.com/photo-1464454709131-ffd692b7ee3d?w=300" },
    { nombre: "Pimiento", precio: 3.50, cantidad: 170, barcode: "7501234567125", imagen: "https://images.unsplash.com/photo-1599599810694-a5d5d9353e49?w=300" },
  ],
  Enlatados: [
    { nombre: "Atun", precio: 3.99, cantidad: 300, barcode: "7501234567132", imagen: "https://images.unsplash.com/photo-1599599810694-a5d5d9353e49?w=300" },
    { nombre: "Maiz", precio: 2.49, cantidad: 250, barcode: "7501234567149", imagen: "https://images.unsplash.com/photo-1599599810820-c4b8a9c5b5d6?w=300" },
    { nombre: "Sopa", precio: 2.99, cantidad: 200, barcode: "7501234567156", imagen: "https://images.unsplash.com/photo-1599599810788-eb2d6ac6c12a?w=300" },
    { nombre: "Frijoles", precio: 1.99, cantidad: 280, barcode: "7501234567163", imagen: "https://images.unsplash.com/photo-1599599810635-f3b3d77c5c4f?w=300" },
    { nombre: "Champinones enlatados", precio: 3.50, cantidad: 120, barcode: "7501234567170", imagen: "https://images.unsplash.com/photo-1599599810657-b8f3c3d9f3e4?w=300" },
  ],
  Carnes: [
    { nombre: "Pollo", precio: 8.99, cantidad: 150, barcode: "7501234567187", imagen: "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=300" },
    { nombre: "Res", precio: 12.99, cantidad: 100, barcode: "7501234567194", imagen: "https://images.unsplash.com/photo-1555939594-58d7cb561404?w=300" },
    { nombre: "Cerdo", precio: 10.50, cantidad: 120, barcode: "7501234567201", imagen: "https://images.unsplash.com/photo-1582618644309-abfcb10cc78b?w=300" },
    { nombre: "Carne molida", precio: 9.99, cantidad: 180, barcode: "7501234567218", imagen: "https://images.unsplash.com/photo-1613747528235-0a1b33e68eb9?w=300" },
    { nombre: "Pechuga", precio: 11.50, cantidad: 130, barcode: "7501234567225", imagen: "https://images.unsplash.com/photo-1606787620884-c87fcd2801b8?w=300" },
  ],
  "Productos de Limpieza": [
    { nombre: "Detergente", precio: 4.50, cantidad: 200, barcode: "7501234567232", imagen: "https://images.unsplash.com/photo-1599599810974-69f0e2d9b74d?w=300" },
    { nombre: "Lavavajillas", precio: 3.99, cantidad: 180, barcode: "7501234567249", imagen: "https://images.unsplash.com/photo-1599599810743-17e3fbf7da8f?w=300" },
    { nombre: "Cloro", precio: 2.99, cantidad: 250, barcode: "7501234567256", imagen: "https://images.unsplash.com/photo-1599599810766-17e3fbf7da9f?w=300" },
    { nombre: "Limpiador multiusos", precio: 3.50, cantidad: 220, barcode: "7501234567263", imagen: "https://images.unsplash.com/photo-1599599810789-17e3fbf7da9f?w=300" },
    { nombre: "Esponja", precio: 1.99, cantidad: 300, barcode: "7501234567270", imagen: "https://images.unsplash.com/photo-1599599810800-17e3fbf7da9f?w=300" },
  ],
};

export default categories;