import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion"; // eslint-disable-line
import { useNavigate } from "react-router-dom";
import { apiFetch } from "./api";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import {
  ShoppingBag,
  LogOut,
  Package,
  ChevronRight,
  Clock,
  CheckCircle2,
  Truck,
  ShoppingBasket,
  ArrowLeft,
  X
} from "lucide-react";
import {
  Container,
  Typography,
  Box,
  Grid,
  Button,
  IconButton,
  Dialog,
  DialogContent,
  Skeleton,
  Badge,
  Chip
} from "@mui/material";

const STATUS_FLOW = ["PLACED", "CONFIRMED", "SHIPPED", "DELIVERED"];

export default function Dashboard({ onLogout }) {
  const [orders, setOrders] = useState([]);
  const [images, setImages] = useState({});
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const [animStep, setAnimStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const selectedOrder = orders.find(
  o => (o.id || o._id) === selectedOrderId
);  

  const navigate = useNavigate();


useEffect(() => {
  if (!selectedOrder?.status) return;

  const targetIndex = STATUS_FLOW.indexOf(
    selectedOrder.status.toUpperCase()
  );

  if (targetIndex === -1) return;

  if (targetIndex > animStep) {
    let current = animStep;

    const interval = setInterval(() => {
      current++;
      setAnimStep(current);

      if (current >= targetIndex) {
        clearInterval(interval);
      }
    }, 500);

    return () => clearInterval(interval);
  }

}, [selectedOrder?.status]);
  useEffect(() => {
  const socket = new SockJS("https://demo-springboot-zdym.onrender.com/ws");
  const stompClient = new Client({
    webSocketFactory: () => socket,
    reconnectDelay: 5000,
  });

  stompClient.onConnect = () => {
    console.log("WebSocket Connected");

    stompClient.subscribe("/topic/order-status", (message) => {
  const update = JSON.parse(message.body);

  setOrders(prev =>
    prev.map(order =>
      (order.id || order._id) === update.orderId
        ? { ...order, status: update.status }
        : order
    )
  );
});
  };

  stompClient.activate();

  return () => {
    stompClient.deactivate();
  };
}, []);

  const loadProductImage = useCallback(async (productId) => {
    try {
      const res = await apiFetch(`/products/${productId}/image`);
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      return URL.createObjectURL(blob);
    } catch {
      return null;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.clear();
    if (onLogout) onLogout();
    navigate("/login", { replace: true });
  }, [navigate, onLogout]);

  const loadOrders = useCallback(async () => {
    try {
      const res = await apiFetch("/customer/my/orders");
      if (!res.ok) throw new Error("Unauthorized");
      const data = await res.json();
      setOrders(data);
    } catch {
      logout();
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    loadOrders();
    const onFocus = () => loadOrders();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [loadOrders]);

  useEffect(() => {
    orders.forEach(o => {
      if (!images[o.productId]) {
        loadProductImage(o.productId).then(url => {
          if (url) {
            setImages(prev => {
              if (prev[o.productId]) return prev;
              return { ...prev, [o.productId]: url };
            });
          }
        });
      }
    });
  }, [orders, loadProductImage]); // Removed images from dependencies to stop the loop

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case "DELIVERED": return "#22c55e";
      case "SHIPPED": return "#38bdf8";
      case "CONFIRMED": return "#facc15";
      case "CANCELLED": return "#f43f5e";
      default: return "#94a3b8";
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toUpperCase()) {
      case "PLACED": return <Clock size={16} />;
      case "CONFIRMED": return <CheckCircle2 size={16} />;
      case "SHIPPED": return <Truck size={16} />;
      case "DELIVERED": return <ShoppingBasket size={16} />;
      default: return <Package size={16} />;
    }
  };
  
useEffect(() => {
  if (!selectedOrder?.status) return;

  const index = STATUS_FLOW.indexOf(
    selectedOrder.status.toUpperCase()
  );

  if (index !== -1) {
    setAnimStep(index);
  }
}, [selectedOrderId]);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#020617", color: "white", py: 6 }}>
      {/* 🌌 Background Orbs */}
      <Box
        sx={{
          position: "fixed",
          top: "-10%",
          right: "-5%",
          width: "600px",
          height: "600px",
          background: "var(--primary)",
          filter: "blur(200px)",
          opacity: 0.05,
          zIndex: 0,
          pointerEvents: "none"
        }}
      />
      <Box
        sx={{
          position: "fixed",
          bottom: "-5%",
          left: "-5%",
          width: "500px",
          height: "500px",
          background: "var(--secondary)",
          filter: "blur(180px)",
          opacity: 0.05,
          zIndex: 0,
          pointerEvents: "none"
        }}
      />

      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
        {/* HEADER */}
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
          <IconButton onClick={logout} sx={{ color: "var(--accent)", bgcolor: "rgba(244, 63, 94, 0.1)", "&:hover": { bgcolor: "rgba(244, 63, 94, 0.2)" } }}>
            <LogOut size={20} />
          </IconButton>
        </Box>

        <Box sx={{ mb: 6 }}>
          <Typography variant="h3" sx={{ fontWeight: 900, mb: 1, letterSpacing: "-1px" }}>
            My Orders
          </Typography>
          <Typography sx={{ color: "var(--text-secondary)" }}>
            Track your premium purchases and order history
          </Typography>
        </Box>

        {/* ORDERS GRID */}
        <Grid container spacing={3}>
          {loading ? (
            Array.from({ length: 4 }).map((__, i) => (
              <Grid item xs={12} sm={6} md={4} key={i}>
                <Skeleton variant="rectangular" height={350} sx={{ borderRadius: "24px", bgcolor: "rgba(255,255,255,0.05)" }} />
              </Grid>
            ))
          ) : orders.length > 0 ? (
            orders.map((o) => (
              <Grid item xs={12} sm={6} md={4} key={o.id}>
                <motion.div
                  whileHover={{ y: -8 }}
                  onClick={() => setSelectedOrderId(o.id || o._id)}
                  className="glass-card"
                  style={{ cursor: "pointer", height: "100%", overflow: "hidden" }}
                >
                  <Box sx={{ height: 400, position: "relative", bgcolor: "rgba(255,255,255,0.03)" }}>
                    {!images[o.productId] ? (
                      <Skeleton variant="rectangular" height="100%" width="100%" sx={{ bgcolor: "rgba(255,255,255,0.05)" }} />
                    ) : (
                      <Box
                        component="img"
                        src={images[o.productId]}
                        sx={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          transition: "transform 0.8s ease",
                          "&:hover": { transform: "scale(1.1)" }
                        }}
                      />
                    )}
                    <Box sx={{ position: "absolute", bottom: 12, right: 12 }}>
                      <Chip
                        icon={getStatusIcon(o.status)}
                        label={(o.status || "PLACED").toUpperCase()}
                        sx={{
                          bgcolor: "rgba(15, 23, 42, 0.8)",
                          backdropFilter: "blur(8px)",
                          color: getStatusColor(o.status),
                          fontWeight: 700,
                          fontSize: "0.7rem",
                          border: `1px solid ${getStatusColor(o.status)}33`
                        }}
                      />
                    </Box>
                  </Box>

                  <Box sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5, noWrap: true }}>{o.name}</Typography>
                    <Typography variant="body2" sx={{ color: "var(--text-secondary)", mb: 2 }}>
                      Ordered on {new Date(o.createdAt).toLocaleDateString()}
                    </Typography>

                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Box>
                        <Typography variant="caption" sx={{ color: "var(--text-secondary)", display: "block" }}>Amount Paid</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 900 }}>₹{o.price}</Typography>
                      </Box>
                      <Button
                        endIcon={<ChevronRight size={16} />}
                        sx={{ textTransform: "none", fontWeight: 700, p: 0 }}
                      >
                        Details
                      </Button>
                    </Box>
                  </Box>
                </motion.div>
              </Grid>
            ))
          ) : (
            <Box sx={{ width: "100%", py: 10, textAlign: "center" }}>
              <Package size={64} style={{ color: "var(--text-secondary)", opacity: 0.2, marginBottom: 16 }} />
              <Typography variant="h5" sx={{ color: "var(--text-secondary)", mb: 3 }}>No orders found yet</Typography>
              <Button variant="contained" onClick={() => navigate("/shopping")} sx={{ px: 4, borderRadius: "50px" }}>
                Start Shopping
              </Button>
            </Box>
          )}
        </Grid>
      </Container>

      {/* TRACKING DIALOG */}
      <Dialog
        open={Boolean(selectedOrder)}
        onClose={() => setSelectedOrderId(null)}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: "32px",
            bgcolor: "rgba(15, 23, 42, 0.95)",
            backdropFilter: "blur(24px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            color: "white",
            p: 1
          }
        }}
      >
        <DialogContent sx={{ p: 4 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 900 }}>Order Tracking</Typography>
            <IconButton onClick={() => setSelectedOrderId(null)} sx={{ color: "white" }}><X size={24} /></IconButton>
          </Box>

          {selectedOrder && (
            <>
              {/* VISUAL TRACKER */}
              <Box sx={{ px: 2, mb: 10, mt: 4 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", position: "relative", px: 4 }}>
                  {/* Modern Curved Progress Path */}
                  <Box sx={{
                    position: "absolute",
                    top: 20,
                    left: "10%",
                    right: "10%",
                    height: 2,
                    bgcolor: "rgba(255,255,255,0.05)",
                    zIndex: 0
                  }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(animStep / (STATUS_FLOW.length - 1)) * 100}%` }}
                      transition={{ duration: 1.5, ease: "anticipate" }}
                      style={{
                        height: "100%",
                        background: "linear-gradient(90deg, var(--primary), #4ade80)",
                        boxShadow: "0 0 20px var(--primary)",
                        borderRadius: 10
                      }}
                    />
                  </Box>

                  {STATUS_FLOW.map((step, i) => {
                    const isReached = animStep >= i;
                    const isCurrent = animStep === i;
                    return (
                      <Box key={step} sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, zIndex: 1 }}>
                        <motion.div
                          initial={false}
                          animate={{
                            scale: isCurrent ? [1, 1.3, 1] : 1,
                            borderColor: isReached ? "var(--primary)" : "rgba(255,255,255,0.1)",
                            backgroundColor: isReached ? "var(--primary)" : "#020617",
                            boxShadow: isCurrent ? "0 0 30px var(--primary)" : "none"
                          }}
                          transition={{ duration: 0.5 }}
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: "16px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            border: "2px solid",
                            background: "#020617",
                            color: isReached ? "#020617" : "rgba(255,255,255,0.2)"
                          }}
                        >
                          {getStatusIcon(step)}
                        </motion.div>
                        <Box sx={{ textAlign: "center" }}>
                          <Typography variant="caption" sx={{
                            fontWeight: 900,
                            color: isReached ? "white" : "rgba(255,255,255,0.2)",
                            fontSize: "0.65rem",
                            letterSpacing: 1.5,
                            textTransform: "uppercase",
                            display: "block"
                          }}>
                            {step}
                          </Typography>
                          {isCurrent && (
                            <motion.div
                              layoutId="active-indicator"
                              style={{
                                width: 4, height: 4, borderRadius: "50%",
                                bgcolor: "var(--primary)", margin: "8px auto 0"
                              }}
                            />
                          )}
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              </Box>

              <Box sx={{ bgcolor: "rgba(255,255,255,0.03)", borderRadius: "24px", p: 3, border: "1px solid rgba(255,255,255,0.05)" }}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption" sx={{ color: "var(--text-secondary)", display: "block", mb: 0.5 }}>Order ID</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: "'JetBrains Mono', 'Roboto Mono', monospace", letterSpacing: -0.5, color: "var(--primary)" }}>#{selectedOrder.id}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" sx={{ color: "var(--text-secondary)", display: "block", mb: 0.5 }}>Items</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{selectedOrder.count}x {selectedOrder.name}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" sx={{ color: "var(--text-secondary)", display: "block", mb: 0.5 }}>Total Paid</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>₹{selectedOrder.price}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" sx={{ color: "var(--text-secondary)", display: "block", mb: 0.5 }}>Status</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: getStatusColor(selectedOrder.status) }}>
                      {selectedOrder.status || "PLACED"}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>

              <Button
                fullWidth
                variant="outlined"
                onClick={() => setSelectedOrderId(null)}
                sx={{ mt: 4, py: 1.5, borderRadius: "12px", borderColor: "rgba(255,255,255,0.1)", color: "white" }}
              >
                Close Tracking
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
