import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2, Search, Pencil, LogOut, Package, FileText, Upload, Image as ImageIcon, Download, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const formatPrice = (p) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(p);

function getAuthHeaders() {
  const token = localStorage.getItem("admin_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function AdminPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) { navigate("/admin/login"); return; }
    axios.get(`${API}/auth/me`, { headers: getAuthHeaders() })
      .then(({ data }) => { setUser(data); setLoading(false); })
      .catch(() => { localStorage.removeItem("admin_token"); navigate("/admin/login"); });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    navigate("/admin/login");
  };

  if (loading) return <div className="flex justify-center py-32"><Loader2 className="h-8 w-8 animate-spin text-brand-primary" /></div>;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl font-bold text-neutral-900" data-testid="admin-title">Admin Dashboard</h1>
          <p className="text-sm text-neutral-500">{user?.email}</p>
        </div>
        <Button variant="outline" onClick={handleLogout} data-testid="admin-logout-btn"><LogOut className="h-4 w-4 mr-2" /> Logout</Button>
      </div>

      <Tabs defaultValue="products">
        <TabsList className="mb-6">
          <TabsTrigger value="products" data-testid="tab-products"><Package className="h-4 w-4 mr-2" /> Products</TabsTrigger>
          <TabsTrigger value="rfqs" data-testid="tab-rfqs"><FileText className="h-4 w-4 mr-2" /> RFQs</TabsTrigger>
        </TabsList>
        <TabsContent value="products"><ProductsTab /></TabsContent>
        <TabsContent value="rfqs"><RFQsTab /></TabsContent>
      </Tabs>
    </div>
  );
}

function ProductsTab() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editProduct, setEditProduct] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const fileInputRef = useRef(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 25, sort: "name_asc" };
      if (search) params.search = search;
      const { data } = await axios.get(`${API}/products`, { params });
      setProducts(data.products);
      setTotalPages(data.total_pages);
    } catch (err) { toast.error("Failed to load products"); }
    finally { setLoading(false); }
  }, [search, page]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleSave = async (id, updates) => {
    try {
      await axios.put(`${API}/products/${id}`, updates, { headers: getAuthHeaders() });
      toast.success("Product updated");
      setEditProduct(null);
      fetchProducts();
    } catch (err) { toast.error("Update failed"); }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await axios.get(`${API}/products/bulk-export`, {
        headers: getAuthHeaders(),
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'products_export.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Products exported successfully");
    } catch (err) {
      toast.error("Export failed");
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImporting(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const { data } = await axios.post(`${API}/products/bulk-import`, formData, {
        headers: { ...getAuthHeaders(), 'Content-Type': 'multipart/form-data' }
      });
      toast.success(`Import completed: ${data.created} created, ${data.updated} updated`);
      if (data.errors.length > 0) {
        toast.warning(`${data.errors.length} errors occurred. Check console for details.`);
        console.error("Import errors:", data.errors);
      }
      fetchProducts();
    } catch (err) {
      toast.error("Import failed");
    } finally {
      setImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <Input data-testid="admin-product-search" placeholder="Search products..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="pl-10" />
        </div>
        <Button variant="outline" onClick={handleExport} disabled={exporting}>
          {exporting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Download className="h-4 w-4 mr-2" />}
          Export
        </Button>
        <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={importing}>
          {importing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <FileSpreadsheet className="h-4 w-4 mr-2" />}
          Import
        </Button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImport}
          accept=".csv,.xlsx,.xls"
          className="hidden"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-brand-primary" /></div>
      ) : (
        <>
          <div className="border rounded-xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-neutral-50">
                  <TableHead className="font-semibold">Code</TableHead>
                  <TableHead className="font-semibold">Product</TableHead>
                  <TableHead className="font-semibold">Category</TableHead>
                  <TableHead className="font-semibold text-right">Price</TableHead>
                  <TableHead className="font-semibold text-right">Stock</TableHead>
                  <TableHead className="font-semibold text-center">Status</TableHead>
                  <TableHead className="font-semibold text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map(p => (
                  <TableRow key={p.id} data-testid={`admin-product-row-${p.item_code}`}>
                    <TableCell className="font-mono text-xs text-neutral-500">{p.item_code}</TableCell>
                    <TableCell className="font-medium text-sm max-w-[200px] truncate">{p.name}</TableCell>
                    <TableCell><Badge variant="secondary" className="text-xs">{p.category}</Badge></TableCell>
                    <TableCell className="text-right font-medium">{formatPrice(p.price)}</TableCell>
                    <TableCell className="text-right">{p.stock}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={p.in_stock ? "default" : "destructive"} className={p.in_stock ? "bg-emerald-100 text-emerald-700" : ""}>
                        {p.in_stock ? "In Stock" : "Out"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button variant="ghost" size="sm" onClick={() => setEditProduct(p)} data-testid={`edit-btn-${p.item_code}`}><Pencil className="h-3 w-3" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex justify-center gap-2 mt-4">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
            <span className="text-sm text-neutral-500 self-center">Page {page} of {totalPages}</span>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
          </div>
        </>
      )}

      {editProduct && <EditProductDialog product={editProduct} onClose={() => setEditProduct(null)} onSave={handleSave} />}
    </div>
  );
}

function EditProductDialog({ product, onClose, onSave }) {
  const [price, setPrice] = useState(product.price);
  const [stock, setStock] = useState(product.stock);
  const [inStock, setInStock] = useState(product.in_stock);
  const [name, setName] = useState(product.name);
  const [imageUrl, setImageUrl] = useState(product.image_url || "");
  const [images, setImages] = useState(product.images || []);
  const [videos, setVideos] = useState(product.videos || []);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);
  const imagesInputRef = useRef(null);
  const videosInputRef = useRef(null);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const { data } = await axios.post(`${API}/upload-image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setImageUrl(data.image_url);
      toast.success("Image uploaded successfully");
    } catch (err) {
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleMultipleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files || files.length === 0) return;

    setUploading(true);
    const uploadedUrls = [];

    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);
      try {
        const { data } = await axios.post(`${API}/upload-image`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        uploadedUrls.push(data.image_url);
      } catch (err) {
        console.error("Failed to upload image:", err);
      }
    }

    setImages([...images, ...uploadedUrls]);
    toast.success(`${uploadedUrls.length} images uploaded successfully`);
    setUploading(false);
    if (imagesInputRef.current) {
      imagesInputRef.current.value = '';
    }
  };

  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const { data } = await axios.post(`${API}/upload-image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setVideos([...videos, data.image_url]);
      toast.success("Video uploaded successfully");
    } catch (err) {
      toast.error("Failed to upload video");
    } finally {
      setUploading(false);
      if (videosInputRef.current) {
        videosInputRef.current.value = '';
      }
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleRemoveVideo = (index) => {
    setVideos(videos.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setSaving(true);
    await onSave(product.id, { 
      price: Number(price), 
      stock: Number(stock), 
      in_stock: inStock, 
      name, 
      image_url: imageUrl,
      images,
      videos
    });
    setSaving(false);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" data-testid="edit-product-dialog">
        <DialogHeader>
          <DialogTitle className="font-heading">Edit Product</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2 max-h-[70vh] overflow-y-auto">
          <div>
            <Label className="text-sm font-medium">Product Image</Label>
            <div className="mt-2 space-y-2">
              {imageUrl && (
                <img src={imageUrl} alt="Product" className="w-32 h-32 object-contain border rounded-lg bg-neutral-50" />
              )}
              <div className="flex gap-2">
                <Input
                  data-testid="image-url-input"
                  placeholder="Enter image URL or upload file"
                  value={imageUrl}
                  onChange={e => setImageUrl(e.target.value)}
                  className="flex-1"
                />
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploading}
                  ref={fileInputRef}
                />
                <Button type="button" variant="outline" size="icon" onClick={handleUploadClick} disabled={uploading}>
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-neutral-500">Upload image from local or paste URL from Drive/Cloud</p>
            </div>
          </div>
          <div>
            <Label className="text-sm font-medium">Additional Images</Label>
            <div className="mt-2 space-y-2">
              {images.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {images.map((img, idx) => (
                    <div key={idx} className="relative group">
                      <img src={img} alt={`Image ${idx + 1}`} className="w-16 h-16 object-cover rounded-lg border" />
                      <button
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleMultipleImageUpload}
                  className="hidden"
                  disabled={uploading}
                  ref={imagesInputRef}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => imagesInputRef.current?.click()}
                  disabled={uploading}
                  className="w-full"
                >
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                  Upload Multiple Images
                </Button>
              </div>
            </div>
          </div>
          <div>
            <Label className="text-sm font-medium">Videos</Label>
            <div className="mt-2 space-y-2">
              {videos.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {videos.map((vid, idx) => (
                    <div key={idx} className="relative group">
                      <video src={vid} className="w-16 h-16 object-cover rounded-lg border" />
                      <button
                        onClick={() => handleRemoveVideo(idx)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <Input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoUpload}
                  className="hidden"
                  disabled={uploading}
                  ref={videosInputRef}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => videosInputRef.current?.click()}
                  disabled={uploading}
                  className="w-full"
                >
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                  Upload Video
                </Button>
              </div>
            </div>
          </div>
          <div>
            <Label className="text-sm font-medium">Name</Label>
            <Input data-testid="edit-name" value={name} onChange={e => setName(e.target.value)} className="mt-1" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Price</Label>
              <Input data-testid="edit-price" type="number" value={price} onChange={e => setPrice(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label className="text-sm font-medium">Stock</Label>
              <Input data-testid="edit-stock" type="number" value={stock} onChange={e => setStock(e.target.value)} className="mt-1" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Switch data-testid="edit-in-stock" checked={inStock} onCheckedChange={setInStock} />
            <Label className="text-sm">In Stock</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button className="bg-brand-primary hover:bg-brand-primary-hover text-white" onClick={handleSubmit} disabled={saving} data-testid="save-product-btn">
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RFQsTab() {
  const [rfqs, setRfqs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/rfq`, { headers: getAuthHeaders() })
      .then(({ data }) => setRfqs(data.rfqs || []))
      .catch(() => toast.error("Failed to load RFQs"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-brand-primary" /></div>;

  if (rfqs.length === 0) return (
    <div className="text-center py-16 text-neutral-500">
      <FileText className="h-12 w-12 text-neutral-300 mx-auto mb-3" />
      <p className="font-medium">No RFQs yet</p>
      <p className="text-sm text-neutral-400 mt-1">RFQs submitted via WhatsApp will appear here</p>
    </div>
  );

  return (
    <div className="border rounded-xl overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-neutral-50">
            <TableHead className="font-semibold">Date</TableHead>
            <TableHead className="font-semibold">Customer</TableHead>
            <TableHead className="font-semibold text-center">Items</TableHead>
            <TableHead className="font-semibold">Transit</TableHead>
            <TableHead className="font-semibold text-right">Total</TableHead>
            <TableHead className="font-semibold text-center">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rfqs.map(rfq => (
            <TableRow key={rfq.id} data-testid={`rfq-row-${rfq.id}`}>
              <TableCell className="text-sm">{new Date(rfq.created_at).toLocaleDateString('en-IN')}</TableCell>
              <TableCell className="text-sm">{rfq.customer_name || rfq.customer_phone || 'Anonymous'}</TableCell>
              <TableCell className="text-center">{rfq.items?.length || 0}</TableCell>
              <TableCell><Badge variant="outline" className="text-xs">{rfq.transit_mode}</Badge></TableCell>
              <TableCell className="text-right font-medium">{formatPrice(rfq.total_amount || 0)}</TableCell>
              <TableCell className="text-center">
                <Badge className={rfq.status === 'pending' ? 'bg-amber-100 text-amber-700' : rfq.status === 'quoted' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}>
                  {rfq.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
