import { useState, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

function App() {
  // --- 1. AUTHENTICATION STATE ---
  const [token, setToken] = useState(localStorage.getItem('jwt_token') || '');
  const [authForm, setAuthForm] = useState({ username: '', password: '' });
  const [authError, setAuthError] = useState('');

  // --- 2. POS STATE ---
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [cart, setCart] = useState([]);
  const [transactionStatus, setTransactionStatus] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // --- AI STATE ---
  const [aiInsight, setAiInsight] = useState('');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

  // --- 3. LOGIC: LOGIN & LOGOUT ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authForm)
      });
      
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.message || 'Login failed');

      setToken(data.token);
      localStorage.setItem('jwt_token', data.token);
    } catch (error) {
      setAuthError("❌ Login Gagal: Username atau Password salah");
    }
  };

  const handleLogout = () => {
    setToken('');
    localStorage.removeItem('jwt_token');
    setCart([]);
  };

  // --- 4. LOGIC: FETCH PRODUCTS ---
  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/products`);
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchProducts();
    }
  }, [token]);

  // --- 5. LOGIC: CART & CHECKOUT ---
  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        if (existing.cartQuantity >= product.stock) return prev;
        return prev.map(item => item.id === product.id ? { ...item, cartQuantity: item.cartQuantity + 1 } : item);
      }
      return [...prev, { ...product, cartQuantity: 1 }];
    });
  };

  const cartTotal = cart.reduce((total, item) => total + (item.price * item.cartQuantity), 0);

  const processPayment = async () => {
    if (cart.length === 0) return;
    setIsProcessing(true);
    setTransactionStatus(null);

    try {
      const checkoutPromises = cart.map(item => {
        const payload = {
          product_id: item.id,
          quantity: item.cartQuantity,
          customer_name: "Walk-in Customer"
        };

        return fetch(`${API_URL}/checkout`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
          },
          body: JSON.stringify(payload)
        }).then(async res => {
          if (!res.ok) {
            if (res.status === 401) throw new Error("Sesi habis. Silakan login ulang.");
            throw new Error(`Gagal memproses ${item.name}`);
          }
          return res;
        });
      });

      await Promise.all(checkoutPromises);
      setTransactionStatus("✅ Pembayaran Sukses!");
      setCart([]);
      fetchProducts(); 
    } catch (error) {
      setTransactionStatus(`❌ Error: ${error.message}`);
      if (error.message.includes("Sesi habis")) handleLogout();
    } finally {
      setIsProcessing(false);
      setTimeout(() => setTransactionStatus(null), 4000);
    }
  };

  // --- LOGIC: GEMINI AI BUSINESS INSIGHT ---
  const generateAIInsight = async () => {
    if (products.length === 0) return;
    setIsGeneratingAI(true);
    setAiInsight('');

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) throw new Error("API Key Gemini tidak ditemukan di .env");

      const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      const inventoryData = products.map(p => `${p.name} (Harga: Rp${p.price}, Stok: ${p.stock})`).join(', ');

      const prompt = `
        Anda adalah konsultan bisnis ritel kelas dunia. 
        Analisis data inventaris toko ini: ${inventoryData}.
        Berikan 2 kalimat singkat, padat, dan profesional (dalam bahasa Indonesia) 
        berisi peringatan stok atau saran strategi penjualan. 
        Jangan gunakan format markdown berlebihan, langsung to the point.
      `;

      const result = await model.generateContent(prompt);
      setAiInsight(result.response.text());
    } catch (error) {
      console.error("AI Error:", error);
      setAiInsight("❌ Gagal menghubungi konsultan AI. Periksa koneksi atau API Key.");
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // --- 6. UI: HALAMAN LOGIN ---
  if (!token) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-indigo-600">Secure POS</h1>
            <p className="text-slate-500 mt-2">Enterprise Access Portal</p>
          </div>
          
          {authError && <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-sm font-semibold">{authError}</div>}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">System Username</label>
              <input 
                type="text" 
                className="w-full border border-slate-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                value={authForm.username}
                onChange={e => setAuthForm({...authForm, username: e.target.value})}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Access Key</label>
              <input 
                type="password" 
                className="w-full border border-slate-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                value={authForm.password}
                onChange={e => setAuthForm({...authForm, password: e.target.value})}
                required
              />
            </div>
            <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition">
              Authenticate
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- 7. UI: DASHBOARD KASIR ---
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <header className="bg-indigo-600 text-white p-5 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-wide">💳 Global POS Dashboard</h1>
          <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg text-sm font-bold transition">
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8 mt-4">
        {/* PANEL KIRI: Produk & AI */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">Katalog Global</h2>
          {isLoading ? (
             <div className="text-center py-10">Memuat data dari database...</div>
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

          {/* PANEL AI: Business Insight (Sekarang aman di dalam return!) */}
          <div className="mt-8 bg-linear-to-r from-indigo-900 to-purple-800 rounded-xl p-6 text-white shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg flex items-center gap-2">
                ✨ Gemini Business AI
              </h3>
              <button 
                onClick={generateAIInsight}
                disabled={isGeneratingAI || products.length === 0}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition shadow-md
                  ${isGeneratingAI ? 'bg-purple-600 opacity-70 cursor-wait' : 'bg-white text-indigo-900 hover:bg-indigo-50 active:scale-95'}`}
              >
                {isGeneratingAI ? 'Menganalisis...' : 'Generate Insight'}
              </button>
            </div>
            
            <div className="bg-white/10 p-4 rounded-lg min-h-20 border border-white/20">
              {aiInsight ? (
                <p className="text-indigo-50 leading-relaxed text-sm">{aiInsight}</p>
              ) : (
                <p className="text-indigo-300/60 text-sm italic">
                  Tekan tombol di atas untuk mendapatkan analisis pakar mengenai stok dan strategimu saat ini.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* PANEL KANAN: Keranjang */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 h-fit sticky top-6">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">Keranjang Aktif</h2>
          
          {transactionStatus && (
            <div className={`mb-4 p-3 rounded text-sm font-semibold ${transactionStatus.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {transactionStatus}
            </div>
          )}

          {cart.length === 0 ? (
            <div className="text-center py-10 text-slate-400"><p>Keranjang kosong.</p></div>
          ) : (
            <div className="space-y-4 mb-6 max-h-64 overflow-y-auto pr-2">
              {cart.map((item, index) => (
                <div key={index} className="flex justify-between items-center border-b border-slate-50 pb-2">
                  <div>
                    <p className="font-semibold text-sm">{item.name}</p>
                    <p className="text-xs text-slate-500">Rp {item.price.toLocaleString('id-ID')} x {item.cartQuantity}</p>
                  </div>
                  <span className="font-bold text-sm">Rp {(item.price * item.cartQuantity).toLocaleString('id-ID')}</span>
                </div>
              ))}
            </div>
          )}

          <div className="border-t border-slate-200 pt-4">
            <div className="flex justify-between items-center mb-6">
              <span className="text-lg font-bold text-slate-500">Total</span>
              <span className="text-2xl font-extrabold text-indigo-700">Rp {cartTotal.toLocaleString('id-ID')}</span>
            </div>
            
            <button 
              onClick={processPayment}
              disabled={cart.length === 0 || isProcessing}
              className={`w-full py-4 rounded-lg font-bold text-white transition shadow-md
                ${cart.length === 0 || isProcessing ? 'bg-slate-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95'}`}
            >
              {isProcessing ? 'Memproses...' : 'Process Payment'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;