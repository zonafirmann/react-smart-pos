import { useState, useEffect, useCallback } from 'react';

// ENVIRONMENT VARIABLE: Detect API URL dynamically (Local vs Production)
// Dipindahkan ke luar komponen agar tidak dibuat ulang pada setiap proses render
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

function App() {
  // 1. STATE MANAGEMENT
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cart, setCart] = useState([]); // Shopping Cart state
  const [transactionStatus, setTransactionStatus] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // 2. FETCH PRODUCTS LOGIC
  const fetchProducts = useCallback(async () => {
    try {
      // Dynamic fetch using API_URL
      const response = await fetch(`${API_URL}/products`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      // Mencegah error .map() dengan memastikan response yang dibaca adalah array
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch products:", error);
      setProducts([]); // Fallback jika gagal mengambil data
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Run once on component mount
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // 3. CART LOGIC (Add item to cart)
  const addToCart = (product) => {
    setCart((prevCart) => {
      // Check if the product already exists in the cart
      const existingItem = prevCart.find(item => item.id === product.id);
      
      if (existingItem) {
        // Prevent adding more than available stock
        if (existingItem.cartQuantity >= product.stock) return prevCart;
        return prevCart.map(item => 
          item.id === product.id 
            ? { ...item, cartQuantity: item.cartQuantity + 1 } 
            : item
        );
      }
      
      // Add new product to cart with quantity 1
      return [...prevCart, { ...product, cartQuantity: 1 }];
    });
  };

  // Calculate Total Price dynamically based on cart contents
  const cartTotal = cart.reduce((total, item) => total + (item.price * item.cartQuantity), 0);

  // 4. CHECKOUT LOGIC (Process Payment)
  const processPayment = async () => {
    if (cart.length === 0) return;
    setIsProcessing(true);
    setTransactionStatus(null);

    try {
      // Process multiple items concurrently using Promise.all
      const checkoutPromises = cart.map(item => {
        const payload = {
          product_id: item.id,
          quantity: item.cartQuantity,
          customer_name: "Walk-in Customer"
        };

        // Dynamic fetch using API_URL
        return fetch(`${API_URL}/checkout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }).then(res => {
          if (!res.ok) throw new Error(`Failed to process ${item.name}`);
          return res;
        });
      });

      // Wait for all backend transactions to complete
      await Promise.all(checkoutPromises);

      setTransactionStatus("✅ Payment Successful! Database updated.");
      setCart([]); // Clear the shopping cart
      setIsLoading(true); // Trigger loading state before refreshing products
      fetchProducts(); // Refresh inventory from the database

    } catch (error) {
      setTransactionStatus(`❌ Error: ${error.message}`);
    } finally {
      setIsProcessing(false);
      // Clear notification after 4 seconds
      setTimeout(() => setTransactionStatus(null), 4000);
    }
  };

  // 5. UI RENDERING
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      {/* Top Navbar */}
      <header className="bg-indigo-600 text-white p-6 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-wide">💳 Enterprise Smart POS</h1>
          <span className="bg-indigo-800 px-3 py-1 rounded-full text-sm">System Online</span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8 mt-4">
        
        {/* LEFT PANEL: Product Grid (2/3 width) */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">Available Products</h2>
          
          {isLoading ? (
            <div className="animate-pulse flex space-x-4">
              <div className="flex-1 space-y-4 py-1">
                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                <div className="h-4 bg-slate-200 rounded"></div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {products.map((product) => (
                <div 
                  key={product.id} 
                  onClick={() => product.stock > 0 && addToCart(product)}
                  className={`bg-white rounded-xl shadow-sm border p-5 transition cursor-pointer
                    ${product.stock === 0 ? 'border-red-200 opacity-60' : 'border-slate-200 hover:shadow-md hover:border-indigo-300'}`}
                >
                  <h3 className="font-bold text-lg">{product.name}</h3>
                  <p className="text-emerald-600 font-semibold mt-1">Rp {product.price.toLocaleString('id-ID')}</p>
                  <p className={`text-sm mt-3 font-medium ${product.stock <= 3 ? 'text-red-500' : 'text-slate-500'}`}>
                    Stock: {product.stock}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT PANEL: Shopping Cart (1/3 width) */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 h-fit sticky top-6">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">Current Order</h2>
          
          {/* Status Message Notification */}
          {transactionStatus && (
            <div className={`mb-4 p-3 rounded text-sm font-semibold
              ${transactionStatus.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {transactionStatus}
            </div>
          )}

          {/* Cart Items */}
          {cart.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              <p>Cart is empty.</p>
              <p className="text-sm">Tap products to add.</p>
            </div>
          ) : (
            <div className="space-y-4 mb-6 max-h-64 overflow-y-auto pr-2">
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between items-center border-b border-slate-50 pb-2">
                  <div>
                    <p className="font-semibold text-sm">{item.name}</p>
                    <p className="text-xs text-slate-500">Rp {item.price.toLocaleString('id-ID')} x {item.cartQuantity}</p>
                  </div>
                  <span className="font-bold text-sm">
                    Rp {(item.price * item.cartQuantity).toLocaleString('id-ID')}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Cart Total & Action Button */}
          <div className="border-t border-slate-200 pt-4">
            <div className="flex justify-between items-center mb-6">
              <span className="text-lg font-bold text-slate-500">Total</span>
              <span className="text-2xl font-extrabold text-indigo-700">
                Rp {cartTotal.toLocaleString('id-ID')}
              </span>
            </div>
            
            <button 
              onClick={processPayment}
              disabled={cart.length === 0 || isProcessing}
              className={`w-full py-4 rounded-lg font-bold text-white tracking-wide transition shadow-md
                ${cart.length === 0 || isProcessing
                  ? 'bg-slate-300 cursor-not-allowed shadow-none' 
                  : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95'}`}
            >
              {isProcessing ? 'Processing Payment...' : 'Process Payment'}
            </button>
          </div>
        </div>

      </main>
    </div>
  );
}

export default App;