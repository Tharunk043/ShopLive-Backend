import { useEffect, useState, useCallback } from "react";
import {
  Box,
  Button,
  Typography,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  MenuItem,
  TextField,
  IconButton,
  Container,
  TableContainer,
  Chip
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion"; // eslint-disable-line
import { useNavigate } from "react-router-dom";
import {
  Users,
  Package,
  ShoppingCart,
  Trash2,
  ArrowLeft,
  LogOut,
  Upload,
  X,
  PlusCircle,
  LayoutDashboard
} from "lucide-react";

const API = "https://demo-springboot-zdym.onrender.com/admin";

function formatDate(d) {
  if (!d) return "N/A";
  const date = new Date(d);
  return isNaN(date) ? "N/A" : date.toLocaleString();
}

export default function Admin() {
  const [stats, setStats] = useState({ customers: 0, orders: 0, products: 0 });
  const [customers, setCustomers] = useState([]);
  const [searchUser, setSearchUser] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const pageSize = 10;

  // 🔄 Reset page when searching
  useEffect(() => {
    setCurrentPage(1);
  }, [searchUser]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const [pName, setPName] = useState("");
  const [pDesc, setPDesc] = useState("");
  const [pPrice, setPPrice] = useState("");
  const [pImage, setPImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [token, setToken] = useState(localStorage.getItem("accessToken"));
  const navigate = useNavigate();

  useEffect(() => {
    const sync = () => setToken(localStorage.getItem("accessToken"));
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  const logout = useCallback(() => {
    localStorage.clear();
    navigate("/login", { replace: true });
  }, [navigate]);

  const safeFetch = useCallback(async (url, options = {}) => {
    try {
      const res = await fetch(url, {
        ...options,
        headers: {
          Authorization: `Bearer ${token}`,
          ...(options.headers || {})
        }
      });
      if (res.status === 401 || res.status === 403) {
        logout();
        return null;
      }
      return res;
    } catch {
      alert("Server unreachable");
      return null;
    }
  }, [token, logout]);

  const loadStats = useCallback(async () => {
    const res = await safeFetch(`${API}/stats`);
    if (res) setStats(await res.json());
  }, [safeFetch]);

  const loadCustomers = useCallback(async (page = 1, search = "") => {
    const res = await safeFetch(`${API}/customers?page=${page - 1}&size=${pageSize}&search=${encodeURIComponent(search)}`);
    if (res) {
      const data = await res.json();
      setCustomers(data.content || []);
      setTotalPages(data.totalPages || 1);
      setTotalCustomers(data.totalElements || 0);
    }
  }, [safeFetch]);

  const loadProducts = useCallback(async () => {
    const res = await safeFetch(`${API}/products`);
    if (res) setProducts(await res.json());
  }, [safeFetch]);

  useEffect(() => {
    if (!token) return;
    const init = async () => {
      await loadStats();
      await loadProducts();
    };
    init();
  }, [token, loadStats, loadProducts]);

  useEffect(() => {
    if (!token) return;
    const delay = setTimeout(() => {
      loadCustomers(currentPage, searchUser);
    }, 400);
    return () => clearTimeout(delay);
  }, [token, currentPage, searchUser, loadCustomers]);

  async function viewOrders(customerId) {
    const res = await safeFetch(`${API}/customers/${customerId}/orders`);
    if (!res) return;
    setOrders(await res.json());
    setSelectedCustomer(customerId);
  }

  async function deleteCustomer(id) {
    if (!window.confirm("Delete customer and ALL orders?")) return;
    const res = await safeFetch(`${API}/customers/${id}`, { method: "DELETE" });
    if (!res) return;
    loadCustomers(currentPage, searchUser);
    loadStats();
  }

  async function updateStatus(orderId, status) {
    const res = await safeFetch(`${API}/orders/${orderId}/status?status=${status}`, { method: "PUT" });
    if (!res) return;
    setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status } : o));
  }

  async function deleteOrder(orderId) {
    if (!window.confirm("Delete this order?")) return;
    const res = await safeFetch(`${API}/orders/${orderId}`, { method: "DELETE" });
    if (!res) return;
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
    loadStats();
  }

  async function addProduct() {
    if (!pName || !pPrice || !pImage) {
      alert("Name, price and image required");
      return;
    }
    const form = new FormData();
    form.append("name", pName);
    form.append("description", pDesc);
    form.append("price", pPrice);
    form.append("image", pImage);

    setUploading(true);
    const res = await safeFetch(`${API}/products/upload`, { method: "POST", body: form });
    setUploading(false);
    if (!res) return;

    setPName(""); setPDesc(""); setPPrice(""); setPImage(null);
    loadProducts();
    loadStats();
  }

  async function deleteProduct(id) {
    if (!window.confirm("Delete product?")) return;
    const res = await safeFetch(`${API}/products/${id}`, { method: "DELETE" });
    if (!res) return;
    loadProducts();
    loadStats();
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#020617", color: "white", py: 6, position: "relative" }}>
      {/* 🌌 Background Elements */}
      <Box sx={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", overflow: "hidden", zIndex: 0, pointerEvents: "none" }}>
        <Box sx={{ position: "absolute", top: "-10%", left: "-5%", width: 600, height: 600, bgcolor: "var(--primary)", filter: "blur(200px)", opacity: 0.05 }} />
        <Box sx={{ position: "absolute", bottom: "-5%", right: "-5%", width: 500, height: 500, bgcolor: "var(--secondary)", filter: "blur(180px)", opacity: 0.05 }} />
      </Box>

      <Container maxWidth="xl" sx={{ position: "relative", zIndex: 1 }}>
        {/* HEADER */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 6 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
            <Box sx={{ p: 2, borderRadius: "20px", bgcolor: "var(--primary)15", color: "var(--primary)" }}>
              <LayoutDashboard size={32} />
            </Box>
            <Box>
              <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: "-2px" }}>
                Admin <span style={{ color: "var(--primary)" }}>Control</span>
              </Typography>
              <Typography sx={{ color: "var(--text-secondary)", letterSpacing: 0.5, fontWeight: 500 }}>System Integrity & Inventory Command</Typography>
            </Box>
          </Box>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              startIcon={<ArrowLeft size={18} />}
              onClick={() => navigate("/shopping")}
              sx={{ color: "var(--text-secondary)", fontWeight: 700, "&:hover": { color: "white" } }}
            >
              Exit to Store
            </Button>
            <IconButton onClick={logout} sx={{ color: "var(--accent)", bgcolor: "rgba(244, 63, 94, 0.1)", p: 2, borderRadius: "16px", "&:hover": { bgcolor: "rgba(244, 63, 94, 0.2)" } }}>
              <LogOut size={22} />
            </IconButton>
          </Box>
        </Box>

        {/* PREMIUM STATS GRID */}
        <Grid container spacing={3} mb={8}>
          {[
            { label: "Total Members", value: stats.customers, icon: <Users size={24} />, color: "var(--secondary)", progress: 75 },
            { label: "Active Orders", value: stats.orders, icon: <ShoppingCart size={24} />, color: "var(--primary)", progress: 45 },
            { label: "Inventory Unit", value: stats.products, icon: <Package size={24} />, color: "var(--accent)", progress: 90 }
          ].map((s) => (
            <Grid item xs={12} md={4} key={s.label}>
              <motion.div
                whileHover={{ y: -5 }}
                className="glass-panel"
                style={{ padding: "32px", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 3 }}>
                  <Box sx={{ p: 2, borderRadius: "16px", bgcolor: `${s.color}15`, color: s.color }}>
                    {s.icon}
                  </Box>
                  <Typography variant="h2" sx={{ fontWeight: 900, letterSpacing: "-3px" }}>{s.value}</Typography>
                </Box>
                <Typography variant="caption" sx={{ color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: 800, letterSpacing: 2, display: "block", mb: 2 }}>{s.label}</Typography>
                <Box sx={{ height: 4, width: "100%", bgcolor: "rgba(255,255,255,0.05)", borderRadius: 10 }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${s.progress}%` }} transition={{ duration: 1.5 }} style={{ height: "100%", bgcolor: s.color, borderRadius: 10 }} />
                </Box>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={4}>
          <Grid item xs={12} lg={8}>
            {/* ADD PRODUCT */}
            <Box className="glass-panel" sx={{ p: 5, mb: 4, border: "1px solid rgba(255,255,255,0.08)" }}>
              <Typography variant="h5" sx={{ fontWeight: 900, mb: 4, display: "flex", alignItems: "center", gap: 2 }}>
                <PlusCircle size={24} style={{ color: "var(--primary)" }} /> New Design Entry
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth placeholder="Product Name" value={pName} onChange={(e) => setPName(e.target.value)} sx={inputStyles} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth placeholder="Price (INR)" type="number" value={pPrice} onChange={(e) => setPPrice(e.target.value)} sx={inputStyles} />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth multiline rows={2} placeholder="Brief Description" value={pDesc} onChange={(e) => setPDesc(e.target.value)} sx={inputStyles} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Button
                    fullWidth component="label" variant="outlined" startIcon={<Upload size={18} />}
                    sx={{ py: 2, borderRadius: "16px", borderColor: "rgba(255,255,255,0.1)", color: "white", textTransform: "none", fontWeight: 700 }}
                  >
                    {pImage ? pImage.name : "Upload Creative Asset"}
                    <input hidden type="file" onChange={(e) => setPImage(e.target.files[0])} />
                  </Button>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Button
                    fullWidth variant="contained" onClick={addProduct} disabled={uploading}
                    sx={{ py: 2, borderRadius: "16px", textTransform: "none", fontWeight: 900, fontSize: "1rem" }}
                  >
                    {uploading ? "Deploying..." : "Launch Product"}
                  </Button>
                </Grid>
              </Grid>
            </Box>

            {/* CUSTOMERS TABLE */}
            {/* CUSTOMERS TABLE */}
<Box className="glass-panel" sx={{ overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)" }}>

  {/* Header */}
  <Box sx={{ p: 4, borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
    <Typography variant="h5" sx={{ fontWeight: 900 }}>Member Registry</Typography>
    <Chip
      label={`${totalCustomers} Users`}
      size="small"
      sx={{ bgcolor: "var(--secondary)15", color: "var(--secondary)", fontWeight: 800 }}
    />
  </Box>

  {/* Search Bar */}
  <Box sx={{ p: 3, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
    <TextField
      fullWidth
      placeholder="Search users..."
      value={searchUser}
      onChange={(e) => setSearchUser(e.target.value)}
      sx={inputStyles}
    />
  </Box>

  <TableContainer>
    <Table>
      <TableHead>
        <TableRow sx={{ bgcolor: "rgba(255,255,255,0.01)" }}>
          <TableCell sx={{ color: "var(--text-secondary)", fontWeight: 800, border: 0 }}>
            Account
          </TableCell>
          <TableCell align="right" sx={{ color: "var(--text-secondary)", fontWeight: 800, border: 0 }}>
            Control
          </TableCell>
        </TableRow>
      </TableHead>

      <TableBody>
        {customers.length > 0 ? (
          customers.map((c) => (
            <TableRow key={c.id} sx={{ "&:hover": { bgcolor: "rgba(255,255,255,0.02)" } }}>
              <TableCell sx={{ color: "white", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: "16px",
                      bgcolor: "var(--secondary)15",
                      color: "var(--secondary)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 900
                    }}
                  >
                    {c.name.charAt(0)}
                  </Box>
                  <Box>
                    <Typography sx={{ fontWeight: 800 }}>{c.name}</Typography>
                    <Typography variant="caption" sx={{ color: "var(--text-secondary)" }}>
                      ID: #{c.id.slice(0, 8).toUpperCase()}
                    </Typography>
                  </Box>
                </Box>
              </TableCell>

              <TableCell align="right" sx={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <Button size="small" onClick={() => viewOrders(c.id)} sx={{ mr: 2, fontWeight: 800, color: "var(--primary)" }}>
                  History
                </Button>
                <IconButton
                  size="small"
                  sx={{ color: "rgba(244, 63, 94, 0.4)", "&:hover": { color: "var(--accent)" } }}
                  onClick={() => deleteCustomer(c.id)}
                >
                  <Trash2 size={20} />
                </IconButton>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={2} align="center" sx={{ py: 4, color: "var(--text-secondary)" }}>
              No users found.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  </TableContainer>

  {/* Pagination */}
  {totalPages > 1 && (
    <Box sx={{ p: 3, display: "flex", justifyContent: "center", gap: 1, flexWrap: "wrap" }}>
      <Button
        size="small"
        disabled={currentPage === 1}
        onClick={() => setCurrentPage(prev => prev - 1)}
      >
        Prev
      </Button>

      {Array.from({ length: totalPages }, (_, i) => (
        <Button
          key={i}
          size="small"
          variant={currentPage === i + 1 ? "contained" : "outlined"}
          onClick={() => setCurrentPage(i + 1)}
        >
          {i + 1}
        </Button>
      ))}

      <Button
        size="small"
        disabled={currentPage === totalPages}
        onClick={() => setCurrentPage(prev => prev + 1)}
      >
        Next
      </Button>
    </Box>
  )}
</Box>
          </Grid>

          <Grid item xs={12} lg={4}>
            {/* INVENTORY GRID */}
            <Box className="glass-panel" sx={{ p: 4, height: "100%", border: "1px solid rgba(255,255,255,0.08)" }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
                <Typography variant="h5" sx={{ fontWeight: 900 }}>Inventory</Typography>
                <Chip label={`${products.length} Items`} size="small" sx={{ bgcolor: "var(--accent)15", color: "var(--accent)", fontWeight: 800 }} />
              </Box>
              <Grid container spacing={2}>
                {products.map((p) => (
                  <Grid item xs={12} key={p.id}>
                    <Box sx={{
                      p: 2, borderRadius: "20px", bgcolor: "rgba(255,255,255,0.02)",
                      border: "1px solid rgba(255,255,255,0.05)", display: "flex", gap: 2, alignItems: "center"
                    }}>
                      <Box component="img" src={`data:image/jpeg;base64,${p.image}`} sx={{ width: 70, height: 70, borderRadius: "16px", objectFit: "cover" }} />
                      <Box sx={{ flex: 1 }}>
                        <Typography sx={{ fontWeight: 800, fontSize: "0.9rem" }} noWrap>{p.name}</Typography>
                        <Typography variant="caption" sx={{ color: "var(--primary)", fontWeight: 900 }}>₹{p.price}</Typography>
                      </Box>
                      <IconButton size="small" sx={{ color: "rgba(244, 63, 94, 0.3)", "&:hover": { color: "var(--accent)" } }} onClick={() => deleteProduct(p.id)}>
                        <Trash2 size={18} />
                      </IconButton>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* ORDERS MODAL */}
      <Dialog
        open={!!selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
        fullWidth maxWidth="md"
        PaperProps={{
          sx: {
            borderRadius: "40px",
            bgcolor: "rgba(2, 6, 23, 0.98)",
            backdropFilter: "blur(40px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            color: "white",
            overflow: "hidden"
          }
        }}
      >
        <DialogTitle sx={{ p: 5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: "-1.5px" }}>Customer History</Typography>
            <Typography variant="body2" sx={{ color: "var(--text-secondary)" }}>Tracking active engagements</Typography>
          </Box>
          <IconButton onClick={() => setSelectedCustomer(null)} sx={{ color: "white", bgcolor: "rgba(255,255,255,0.05)", borderRadius: "12px" }}><X size={24} /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 5, pt: 0 }}>
          {orders.map((o) => {
            const actualSteps = ["PLACED", "CONFIRMED", "SHIPPED", "DELIVERED"];
            const currentStep = actualSteps.indexOf(o.status) === -1 ? 0 : actualSteps.indexOf(o.status);

            return (
              <Box key={o.id} sx={{ mb: 4, p: 4, borderRadius: "32px", bgcolor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={7}>
                    <Box sx={{ display: "flex", gap: 3, alignItems: "center", mb: 3 }}>
                      <Box sx={{ width: 56, height: 56, borderRadius: "18px", bgcolor: "var(--primary)15", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Package size={28} />
                      </Box>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 900 }}>{o.name}</Typography>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                          <Typography sx={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.75rem", color: "var(--primary)", mt: 0.5 }}>#{o.id}</Typography>
                          <Typography variant="caption" sx={{ color: "var(--text-secondary)", mt: 0.5 }}>{formatDate(o.createdAt)}</Typography>
                        </Box>
                      </Box>
                    </Box>

                    {/* MINI TRACKING */}
                    <Box sx={{ py: 2, position: "relative" }}>
                      <Box sx={{ position: "absolute", top: 10, left: "5%", right: "5%", height: 2, bgcolor: "rgba(255,255,255,0.05)", zIndex: 0 }}>
                        <Box style={{ width: `${(currentStep / 3) * 100}%`, height: "100%", background: "var(--primary)", boxShadow: "0 0 10px var(--primary)" }} />
                      </Box>
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        {actualSteps.map((step, i) => (
                          <Box key={step} sx={{ zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                            <Box sx={{ width: 18, height: 18, borderRadius: "50%", bgcolor: currentStep >= i ? "var(--primary)" : "#020617", border: "4px solid #020617" }} />
                            <Typography variant="caption" sx={{ fontSize: "0.5rem", fontWeight: 900, color: currentStep >= i ? "white" : "rgba(255,255,255,0.2)" }}>{step}</Typography>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={5} sx={{ display: "flex", flexDirection: "column", gap: 2, alignItems: { md: "flex-end" } }}>
                    <Box sx={{ textAlign: "right" }}>
                      <Typography variant="caption" sx={{ color: "var(--text-secondary)" }}>Total Value</Typography>
                      <Typography variant="h4" sx={{ fontWeight: 900 }}>₹{o.price * o.count}</Typography>
                    </Box>
                    <TextField
                      select value={o.status || "PLACED"} onChange={(e) => updateStatus(o.id, e.target.value)} size="small"
                      sx={selectStyles} SelectProps={{ sx: { fontWeight: 900, fontSize: "0.8rem" } }}
                    >
                      <MenuItem value="PLACED">PLACED</MenuItem>
                      <MenuItem value="CONFIRMED">CONFIRMED</MenuItem>
                      <MenuItem value="SHIPPED">SHIPPED</MenuItem>
                      <MenuItem value="DELIVERED">DELIVERED</MenuItem>
                      <MenuItem value="CANCELLED">CANCELLED</MenuItem>
                    </TextField>
                    <Button
                      size="small" color="error" startIcon={<Trash2 size={16} />} onClick={() => deleteOrder(o.id)}
                      sx={{ textTransform: "none", fontWeight: 700, opacity: 0.6, "&:hover": { opacity: 1 } }}
                    >
                      Delete Transaction Log
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            );
          })}
        </DialogContent>
      </Dialog>
    </Box>
  );
}

const selectStyles = {
  "& .MuiOutlinedInput-root": {
    color: "var(--primary)",
    borderRadius: "14px",
    bgcolor: "rgba(34, 197, 94, 0.05)",
    minWidth: 160,
    "& fieldset": { borderColor: "rgba(34, 197, 94, 0.1)" },
    "&:hover fieldset": { borderColor: "rgba(34, 197, 94, 0.3)" },
    "&.Mui-focused fieldset": { borderColor: "var(--primary)" },
  },
  "& .MuiSelect-icon": { color: "var(--primary)" }
};

const inputStyles = {
  "& .MuiOutlinedInput-root": {
    color: "white",
    bgcolor: "rgba(255,255,255,0.03)",
    borderRadius: "16px",
    "& fieldset": { borderColor: "rgba(255,255,255,0.1)" },
    "&:hover fieldset": { borderColor: "rgba(255,255,255,0.2)" },
    "&.Mui-focused fieldset": { borderColor: "var(--primary)" },
  },
  "& .MuiInputBase-input::placeholder": {
    color: "var(--text-secondary)",
    opacity: 1,
  }
};
