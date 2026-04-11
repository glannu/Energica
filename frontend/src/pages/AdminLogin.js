import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Lock } from "lucide-react";
import { toast } from "sonner";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post(`${API}/auth/login`, { email: email.trim(), password });
      localStorage.setItem("admin_token", data.token);
      localStorage.setItem("admin_user", JSON.stringify(data.user));
      toast.success("Login successful");
      navigate("/admin");
    } catch (err) {
      const detail = err.response?.data?.detail;
      toast.error(typeof detail === "string" ? detail : "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-neutral-100 mb-4">
            <Lock className="h-6 w-6 text-neutral-600" />
          </div>
          <h1 className="font-heading text-2xl font-bold text-neutral-900">Admin Login</h1>
          <p className="text-sm text-neutral-500 mt-1">Energica Solutions Store Management</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email" className="text-sm font-medium text-neutral-700">Email</Label>
            <Input id="email" data-testid="admin-email-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@energicasolutions.com" required className="mt-1" />
          </div>
          <div>
            <Label htmlFor="password" className="text-sm font-medium text-neutral-700">Password</Label>
            <Input id="password" data-testid="admin-password-input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required className="mt-1" />
          </div>
          <Button data-testid="admin-login-btn" type="submit" className="w-full bg-brand-primary hover:bg-brand-primary-hover text-white" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Sign In
          </Button>
        </form>
      </div>
    </div>
  );
}
