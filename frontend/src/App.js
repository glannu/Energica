import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QuoteProvider } from "@/context/QuoteContext";
import Header from "@/components/Header";
import QuoteDrawer from "@/components/QuoteDrawer";
import StorePage from "@/pages/StorePage";
import ProductPage from "@/pages/ProductPage";
import CheckoutPage from "@/pages/CheckoutPage";
import AdminLogin from "@/pages/AdminLogin";
import AdminPage from "@/pages/AdminPage";
import CalculatorPage from "@/pages/CalculatorPage";
import StoreLocatorPage from "@/pages/StoreLocatorPage";
import CityPage from "@/pages/CityPage";
import FloatingContact from "@/components/FloatingContact";
import { Toaster } from "@/components/ui/sonner";

function App() {
  return (
    <QuoteProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-white">
          <Header />
          <QuoteDrawer />
          <FloatingContact />
          <Routes>
            <Route path="/" element={<StorePage />} />
            <Route path="/product/:id" element={<ProductPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/calculator" element={<CalculatorPage />} />
            <Route path="/stores" element={<StoreLocatorPage />} />
            <Route path="/stores/:slug" element={<CityPage />} />
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
