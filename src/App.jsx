import { useState, useEffect } from 'react';

function App() {
  // 1. STATE MANAGEMENT
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [transactionStatus, setTransactionStatus] = useState(null); // Holds success/error messages

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

  // Run once on load
  useEffect(() => {
    fetchProducts();
  }, []);

  // 3. CHECKOUT (POST) LOGIC
  const handleCheckout = async (productId, productName) => {
    // Construct the payload matching Go API requirements
    const payload = {
      product_id: productId,
      quantity: 1, // Hardcoded to 1 for simple POS tap
      customer_name: "Walk-in Customer"
    };

    try {
      const response = await fetch('http://localhost:8080/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error("Transaction failed. Check stock levels.");
      }

      setTransactionStatus(`✅ Successfully sold 1x ${productName}`);
      
      // Refresh product list to get updated stock from database
      fetchProducts(); 
      
      // Clear status message after 3 seconds
      setTimeout(() => setTransactionStatus(null), 3000);
      
    } catch (error) {
      setTransactionStatus(`❌ Error: ${error.message}`);
      setTimeout(() => setTransactionStatus(null), 3000);
    }
  };

  // 4. UI RENDERING
  return (
    <div className="min-h-screen bg-slate-100 p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-extrabold text-slate-800">🛒 Smart POS System</h1>
          <p className="text-slate-500 mt-2">Tap a product to instantly process a transaction.</p>
        </header>

        {/* Transaction Alert Notification */}
        {transactionStatus && (
          <div className="mb-6 p-4 rounded-lg bg-white shadow border-l-4 border-blue-500 text-slate-700 font-medium animate-bounce">
            {transactionStatus}
          </div>
        )}

        {/* Product Grid */}
        {isLoading ? (
          <p className="text-slate-500">Loading database...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between hover:shadow-md transition">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">{product.name}</h2>
                  <p className="text-2xl text-emerald-600 font-semibold my-2">
                    Rp {product.price.toLocaleString('id-ID')}
                  </p>
                  <p className={`text-sm font-medium ${product.stock <= 3 ? 'text-red-500' : 'text-slate-500'}`}>
                    Stock Remaining: {product.stock}
                  </p>
                </div>
                
                {/* Checkout Button */}
                <button 
                  onClick={() => handleCheckout(product.id, product.name)}
                  disabled={product.stock === 0}
                  className={`mt-6 w-full py-3 rounded-lg font-bold text-white transition
                    ${product.stock === 0 
                      ? 'bg-slate-300 cursor-not-allowed' 
                      : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95'}`}
                >
                  {product.stock === 0 ? 'Out of Stock' : 'Process Checkout'}
                </button>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

export default App;