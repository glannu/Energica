import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QuoteProvider } from "@/context/QuoteContext";
import Header from "@/components/Header";
import QuoteDrawer from "@/components/QuoteDrawer";
import StorePage from "@/pages/StorePage";
import ProductPage from "@/pages/ProductPage";
import AdminLogin from "@/pages/AdminLogin";
import AdminPage from "@/pages/AdminPage";
import { Toaster } from "@/components/ui/sonner";

function App() {
  return (
    <QuoteProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-white">
          <Header />
          <QuoteDrawer />
          <Routes>
            <Route path="/" element={<StorePage />} />
            <Route path="/product/:id" element={<ProductPage />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </div>
        <Toaster position="top-right" richColors />
      </BrowserRouter>
    </QuoteProvider>
  );
}

export default App;
