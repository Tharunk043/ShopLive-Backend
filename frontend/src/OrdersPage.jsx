import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion"; // eslint-disable-line
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Chip,
  Skeleton,
  IconButton,
  Container
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Package, ArrowLeft, LogOut, RefreshCw } from "lucide-react";
import { apiFetch } from "./api";


function formatDate(ts) {
  return new Date(ts).toLocaleString();
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const handleLogout = useCallback(() => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("customerId");
    navigate("/login", { replace: true });
  }, [navigate]);

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiFetch("/customer/my/orders");
      if (!res.ok) throw new Error("Unauthorized");
      const data = await res.json();
      setOrders(data);
    } catch {
      handleLogout();
    } finally {
      setLoading(false);
    }
  }, [handleLogout]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);


  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#020617", color: "white", py: 6, px: { xs: 2, md: 4 } }}>
      <Container maxWidth="lg">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 6 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Button
                onClick={() => navigate("/shopping")}
                startIcon={<ArrowLeft size={18} />}
                sx={{ color: "var(--text-secondary)", "&:hover": { color: "white" } }}
              >
                Back to Store
              </Button>
            </Box>
            <IconButton onClick={handleLogout} sx={{ color: "var(--accent)", bgcolor: "rgba(244, 63, 94, 0.1)", "&:hover": { bgcolor: "rgba(244, 63, 94, 0.2)" } }}>
              <LogOut size={20} />
            </IconButton>
          </Box>

          <Box sx={{ mb: 6 }}>
            <Typography variant="h3" sx={{ fontWeight: 900, mb: 1, color: "white", letterSpacing: "-1px" }}>
              My Orders
            </Typography>
            <Typography sx={{ color: "var(--text-secondary)" }}>
              A premium history of your lifestyle choices.
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {loading ? (
              Array.from({ length: 4 }).map((__, i) => (
                <Grid item xs={12} sm={6} md={4} key={i}>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    <Skeleton variant="rectangular" height={400} animation="wave" sx={{ borderRadius: "32px", bgcolor: "rgba(255,255,255,0.05)" }} />
                    <Box sx={{ px: 1, mt: 1 }}>
                      <Skeleton variant="text" width="35%" animation="wave" sx={{ bgcolor: "rgba(255,255,255,0.05)" }} />
                      <Skeleton variant="text" width="70%" height={28} animation="wave" sx={{ bgcolor: "rgba(255,255,255,0.05)", mt: -0.5 }} />
                      <Skeleton variant="text" width="45%" animation="wave" sx={{ bgcolor: "rgba(255,255,255,0.05)" }} />
                      <Skeleton variant="rectangular" width="25%" height={20} animation="wave" sx={{ borderRadius: "6px", bgcolor: "rgba(255,255,255,0.05)", mt: 0.5, mb: 1 }} />
                      <Skeleton variant="text" width="30%" height={32} animation="wave" sx={{ bgcolor: "rgba(255,255,255,0.05)" }} />
                    </Box>
                  </Box>
                </Grid>
              ))
            ) : orders.length > 0 ? (
              orders.map((o) => (
                <Grid item xs={12} sm={6} md={4} key={o.id}>
                  <Box
                    sx={{
                      position: "relative",
                      transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                      "&:hover": { transform: "translateY(-12px)" }
                    }}
                  >
                    {/* Photo Container */}
                    <Box
                      sx={{
                        position: "relative",
                        height: "400px",
                        borderRadius: "32px",
                        overflow: "hidden",
                        bgcolor: "rgba(255,255,255,0.03)",
                        mb: 2,
                        border: "1px solid rgba(255,255,255,0.08)",
                        boxShadow: "0 10px 40px -15px rgba(0,0,0,0.5)"
                      }}
                    >
                      <Box
                        component="img"
                        src={o.image || `data:image/svg+xml;base64,${btoa('<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>')}`}
                        alt={o.name}
                        sx={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover"
                        }}
                      />

                      <Box sx={{
                        position: "absolute",
                        bottom: 16,
                        right: 16,
                      }}>
                        <Chip
                          label={o.status || "PLACED"}
                          size="small"
                          sx={{
                            bgcolor: "rgba(2, 6, 23, 0.8)",
                            backdropFilter: "blur(8px)",
                            color: "var(--primary)",
                            fontWeight: 900,
                            fontSize: "0.7rem",
                            border: "1px solid rgba(255,255,255,0.1)"
                          }}
                        />
                      </Box>
                    </Box>

                    {/* Text Details */}
                    <Box sx={{ px: 1 }}>
                      <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.4)", fontWeight: 800, textTransform: "uppercase", letterSpacing: 1 }}>
                        Quantity: {o.count}
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 800, color: "white", mb: 0.5 }}>
                        {o.name}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "var(--text-secondary)", mb: 0.5 }}>
                        {formatDate(o.createdAt)}
                      </Typography>
                      <Typography sx={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: "0.65rem",
                        color: "var(--primary)",
                        bgcolor: "rgba(34, 197, 94, 0.05)",
                        px: 1, py: 0.5, borderRadius: "6px",
                        display: "inline-block",
                        mb: 2
                      }}>
                        #{o.id}
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 900, color: "var(--primary)" }}>
                        ₹{o.price * o.count}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              ))
            ) : (
              <Box sx={{ width: "100%", py: 10, textAlign: "center" }}>
                <Package size={64} style={{ color: "rgba(255,255,255,0.1)", marginBottom: 24 }} />
                <Typography variant="h5" sx={{ color: "var(--text-secondary)", mb: 4 }}>No orders found yet</Typography>
                <Button variant="contained" onClick={() => navigate("/shopping")} sx={{ px: 4, borderRadius: "50px" }}>
                  Start Shopping
                </Button>
              </Box>
            )}
          </Grid>
        </motion.div>
      </Container>
    </Box>
  );
}
