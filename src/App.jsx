import { useState, useEffect } from 'react';

function App() {
  // 1. STATE MANAGEMENT
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cart, setCart] = useState([]); // New State for Shopping Cart
  const [transactionStatus, setTransactionStatus] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // 2. FETCH PRODUCTS LOGIC
  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:8080/products');
      const data = await response.json();
      setProducts(data);
      setIsLoading(false);
    } catch (error) {
      console.error("Failed to fetch products:", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // 3. CART LOGIC (Add to Cart)
  const addToCart = (product) => {
    setCart((prevCart) => {
      // Check if product is already in the cart
      const existingItem = prevCart.find(item => item.id === product.id);
      
      if (existingItem) {
        // If existing, increase quantity (but don't exceed available stock)
        if (existingItem.cartQuantity >= product.stock) return prevCart;
        return prevCart.map(item => 
          item.id === product.id 
            ? { ...item, cartQuantity: item.cartQuantity + 1 } 
            : item
        );
      }
      
      // If new, add to cart with quantity 1
      return [...prevCart, { ...product, cartQuantity: 1 }];
    });
  };

  // Calculate Total Price dynamically
  const cartTotal = cart.reduce((total, item) => total + (item.price * item.cartQuantity), 0);

  // 4. CHECKOUT LOGIC (Process Payment for all items)
  const processPayment = async () => {
    if (cart.length === 0) return;
    setIsProcessing(true);
    setTransactionStatus(null);

    try {
      // We use Promise.all to send multiple checkout requests concurrently
      // since our Go API currently processes one product_id per request.
      const checkoutPromises = cart.map(item => {
        const payload = {
          product_id: item.id,
          quantity: item.cartQuantity,
          customer_name: "Walk-in Customer"
        };

        return fetch('http://localhost:8080/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }).then(res => {
          if (!res.ok) throw new Error(`Failed to process ${item.name}`);
          return res;
        });
      });

      // Wait for all API requests to finish successfully
      await Promise.all(checkoutPromises);

      setTransactionStatus("✅ Payment Successful! Database updated.");
      setCart([]); // Clear cart
      fetchProducts(); // Refresh stock from database

    } catch (error) {
      setTransactionStatus(`❌ Error: ${error.message}`);
    } finally {
      setIsProcessing(false);
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
        
        {/* LEFT PANEL: Product Grid (Takes up 2/3 of space) */}
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

        {/* RIGHT PANEL: Shopping Cart (Takes up 1/3 of space) */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 h-fit sticky top-6">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">Current Order</h2>
          
          {/* Status Message */}
          {transactionStatus && (
            <div className={`mb-4 p-3 rounded text-sm font-semibold
              ${transactionStatus.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {transactionStatus}
            </div>
          )}

          {cart.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              <p>Cart is empty.</p>
              <p className="text-sm">Tap products to add.</p>
            </div>
          ) : (
            <div className="space-y-4 mb-6 max-h-64 overflow-y-auto pr-2">
              {cart.map((item, index) => (
                <div key={index} className="flex justify-between items-center border-b border-slate-50 pb-2">
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

          {/* Cart Total & Action */}
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