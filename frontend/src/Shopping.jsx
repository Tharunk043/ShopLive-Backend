import { useEffect, useMemo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion"; // eslint-disable-line
import ModernCarousel from "./ModernCarousel";
import {
  Menu,
  Search,
  LogOut,
  ShoppingCart,
  Star,
  List,
  Heart,
  X,
  ShoppingBag,
  User,
  Package,
  ChevronDown,
  MessageSquare,
  Send
} from "lucide-react";
import Confetti from "react-confetti";
import Typewriter from "typewriter-effect";
import {
  Card,
  CardContent,
  CardActions,
  Button,
  Typography,
  Box,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Drawer,
  IconButton,
  Badge,
  Select,
  MenuItem,
  Skeleton,
  Container,
  Rating,
  Avatar,
  Divider
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const API_PRODUCTS = "https://demo-springboot-zdym.onrender.com/products";
const API_ORDERS = "https://demo-springboot-zdym.onrender.com/orders";
const API_REVIEWS = "https://demo-springboot-zdym.onrender.com/reviews";

const getId = (p) => p?.id || p?._id || "unknown";
const truncate = (str, len = 25) => str?.length > len ? str.substring(0, len) + "..." : str;

export default function Shopping() {
  // const [navOpen, setNavOpen] = useState(false);
  // const [username] = useState(localStorage.getItem("username"));
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState({});
  const [selected, setSelected] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  // Dynamic Slides for Carousel
  const carouselSlides = useMemo(() => {
    if (products.length === 0) return [];
    // Pick 3 random products or first 3 if list is small
    const shuffled = [...products].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3).map(p => {
      if (!p) return null;
      return {
        productId: getId(p),
        image: p.image ? `data:image/jpeg;base64,${p.image}` : "https://via.placeholder.com/800",
        title: p.name || "Exclusive Item",
        subtitle: truncate(p.description, 80) || "Discover our latest premium selection.",
        offer: true
      };
    }).filter(Boolean);
  }, [products]);

  // Reviews System
  const [reviews, setReviews] = useState({});
  const [newComment, setNewComment] = useState("");
  const [newRating, setNewRating] = useState(5);


  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem("wishlist");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [search, setSearch] = useState("");

  const navigate = useNavigate();
  const token = localStorage.getItem("accessToken");

  const loadReviews = useCallback(async (productId) => {
    try {
      const res = await fetch(`${API_REVIEWS}/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setReviews(prev => ({ ...prev, [productId]: data }));
      }
    } catch {
      // console.error("Failed to fetch reviews");
    }
  }, [token]);

  const logout = useCallback(() => {
    localStorage.clear();
    navigate("/login", { replace: true });
  }, [navigate]);

  useEffect(() => {
    if (!token) {
      logout();
      return;
    }

    try {
      const cachedProducts = localStorage.getItem("cached_products");
      if (cachedProducts) {
        const parsed = JSON.parse(cachedProducts);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setProducts(parsed);
          setLoading(false);
        }
      }
    } catch {
      // ignore cache parsing errors
    }

    fetch(API_PRODUCTS, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => {
        if (res.status === 401 || res.status === 403) {
          logout();
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setProducts(data);
          setLoading(false);
          try {
            localStorage.setItem("cached_products", JSON.stringify(data));
          } catch {
            // ignore storage errors like quota exceeded
          }
        } else {
          setLoading(false);
          console.error("API did not return an array:", data);
        }
      })
      .catch(() => setLoading(false));
  }, [token, logout]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (selected) {
      loadReviews(getId(selected));
    }
  }, [selected, loadReviews]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const name = p?.name || "";
      const desc = p?.description || "";
      const text = `${name} ${desc}`.toLowerCase();
      return text.includes((search || "").toLowerCase());
    });
  }, [products, search]);

  const addToCart = useCallback((id) => setCart(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 })), []);
  const removeFromCart = useCallback((id) => setCart(prev => ({ ...prev, [id]: Math.max((prev[id] || 1) - 1, 0) })), []);
  const totalItems = useMemo(() => Object.values(cart).reduce((a, b) => a + b, 0), [cart]);

  const toggleWishlist = useCallback((id) => {
    setWishlist(prev => {
      const updated = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      localStorage.setItem("wishlist", JSON.stringify(updated));
      return updated;
    });
  }, []);


  const handleAddReview = useCallback(async (productId) => {
    if (!newComment.trim()) return;
    try {
      const res = await fetch(`${API_REVIEWS}/${productId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          stars: newRating,
          text: newComment
        })
      });
      if (res.ok) {
        const savedReview = await res.json();
        setReviews(prev => ({
          ...prev,
          [productId]: [savedReview, ...(prev[productId] || [])]
        }));
        setNewComment("");
        setNewRating(5);
      }
    } catch {
      alert("Failed to post review");
    }
  }, [newComment, newRating, token]);

  const getAverageRating = (productId) => {
    const prodReviews = reviews[productId];
    if (!prodReviews) return 0; // Loading or no data yet
    if (prodReviews.length === 0) return 0;
    const sum = prodReviews.reduce((a, b) => a + (Number(b.stars) || Number(b.rating) || 0), 0);
    return sum / prodReviews.length;
  };

  const checkout = useCallback(async () => {
    try {
      if (placing) return;
      setPlacing(true);
      const items = Object.entries(cart)
        .filter(([id, qty]) => id && qty > 0)
        .map(([id, qty]) => {
          const product = products.find(p => getId(p) === id);
          return product && { productId: getId(product), name: product.name, price: product.price, count: qty };
        }).filter(Boolean);

      if (!items.length) {
        alert("🛒 Your cart is empty");
        return;
      }

      const res = await fetch(API_ORDERS, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(items)
      });

      if (res.status === 429) {
        alert("🚫 Too many orders. Please wait 1 minute and try again.");
        return;
      }
      if (!res.ok) throw new Error();

      setCart({});
      setSuccessOpen(true);
      setSidebarOpen(false);
    } catch {
      alert("❌ Session expired. Please login again.");
      logout();
    } finally {
      setPlacing(false);
    }
  }, [placing, cart, products, token, logout]);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#020617", color: "white" }}>
      {/* ===================== */}
      {/* MODERN GLASS NAVBAR */}
      {/* ===================== */}
      <Box
        component="nav"
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 1000,
          background: "rgba(2, 6, 23, 0.8)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        <Container maxWidth="xl">
          <Box sx={{ height: "80px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, cursor: "pointer" }} onClick={() => navigate("/")}>
              <Box sx={{ p: 1, borderRadius: "12px", bgcolor: "rgba(34, 197, 94, 0.1)", color: "var(--primary)" }}>
                <ShoppingBag size={24} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 900, letterSpacing: "-0.5px" }}>
                Shop<span style={{ color: "var(--primary)" }}>Live</span>
              </Typography>
            </Box>

            <Box sx={{ flex: 1, maxWidth: "500px", mx: 4, display: { xs: "none", md: "block" } }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search premium products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: <Search size={18} style={{ marginRight: 12, color: "var(--text-secondary)" }} />,
                  sx: {
                    borderRadius: "50px",
                    bgcolor: "rgba(255,255,255,0.05)",
                    "& fieldset": { borderColor: "rgba(255,255,255,0.1)" },
                    "&:hover fieldset": { borderColor: "rgba(255,255,255,0.2)" },
                    "&.Mui-focused fieldset": { borderColor: "var(--primary)" },
                    color: "white"
                  }
                }}
              />
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <IconButton
                onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
                sx={{
                  display: { xs: "flex", md: "none" },
                  color: mobileSearchOpen ? "var(--primary)" : "white",
                  bgcolor: "rgba(255,255,255,0.05)"
                }}
              >
                <Search size={22} />
              </IconButton>

              <IconButton
                onClick={() => navigate("/dashboard")}
                sx={{
                  display: { xs: "flex", sm: "none" },
                  color: "white",
                  bgcolor: "rgba(255,255,255,0.05)"
                }}
              >
                <Package size={22} />
              </IconButton>

              <Button
                onClick={() => navigate("/dashboard")}
                startIcon={<Package size={18} />}
                sx={{
                  color: "white",
                  textTransform: "none",
                  fontWeight: 600,
                  display: { xs: "none", sm: "flex" },
                  "&:hover": { color: "var(--primary)" }
                }}
              >
                Orders
              </Button>

              <IconButton
                onClick={() => setSidebarOpen(true)}
                sx={{
                  bgcolor: "rgba(255,255,255,0.05)",
                  color: "white",
                  "&:hover": { bgcolor: "rgba(34, 197, 94, 0.1)", color: "var(--primary)" }
                }}
              >
                <Badge badgeContent={totalItems} color="success" overlap="circular">
                  <ShoppingCart size={22} />
                </Badge>
              </IconButton>

              <Box sx={{ mx: 1, height: "24px", width: "1px", bgcolor: "rgba(255,255,255,0.1)", display: { xs: "none", sm: "block" } }} />

              <IconButton
                onClick={logout}
                sx={{
                  color: "var(--accent)",
                  "&:hover": { bgcolor: "rgba(244, 63, 94, 0.1)" }
                }}
              >
                <LogOut size={22} />
              </IconButton>
            </Box>
          </Box>

          {/* MOBILE SEARCH BAR */}
          <AnimatePresence>
            {mobileSearchOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Box sx={{ pb: 3, pt: 1, display: { xs: "block", md: "none" } }}>
                  <TextField
                    fullWidth
                    autoFocus
                    size="small"
                    placeholder="Search premium products..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    InputProps={{
                      startAdornment: <Search size={18} style={{ marginRight: 12, color: "var(--text-secondary)" }} />,
                      sx: {
                        borderRadius: "15px",
                        bgcolor: "rgba(255,255,255,0.05)",
                        "& fieldset": { borderColor: "rgba(255,255,255,0.1)" },
                        "&.Mui-focused fieldset": { borderColor: "var(--primary)" },
                        color: "white"
                      }
                    }}
                  />
                </Box>
              </motion.div>
            )}
          </AnimatePresence>
        </Container>
      </Box>

      <Box sx={{ py: 4, px: { xs: 2, md: 4 } }}>
        <Container maxWidth="xl">
          <Box sx={{ mb: 6 }}>
            <Typography variant="h3" sx={{ fontWeight: 900, mb: 1, letterSpacing: "-1px", minHeight: "48px" }}>
              <Typewriter
                onInit={(typewriter) => {
                  typewriter
                    .typeString(`Welcome back, <span style="color: var(--primary)">${localStorage.getItem("username") || "Guest"}</span>`)
                    .start();
                }}
                options={{
                  autoStart: true,
                  delay: 50,
                  cursor: "▋",
                  wrapperClassName: "typewriter-wrapper"
                }}
              />
            </Typography>
            <Typography sx={{ color: "var(--text-secondary)", fontSize: "1.1rem" }}>
              Your curated premium selection is ready.
            </Typography>
          </Box>

          {loading ? (
            <Box sx={{ mb: 10 }}>
              <Skeleton variant="rectangular" height={500} animation="wave" sx={{ borderRadius: "40px", bgcolor: "rgba(255,255,255,0.05)", width: "100%", display: { xs: "none", md: "block" } }} />
              <Skeleton variant="rectangular" height={300} animation="wave" sx={{ borderRadius: "40px", bgcolor: "rgba(255,255,255,0.05)", width: "100%", display: { xs: "block", md: "none" } }} />
            </Box>
          ) : (
            !search.trim() && carouselSlides.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                <Box sx={{ mb: 10 }}>
                  <ModernCarousel slides={carouselSlides} onProductClick={(id) => setSelected(products.find(p => getId(p) === id))} />
                </Box>
              </motion.div>
            )
          )}

          <Grid container spacing={4}>
            {loading ? (
              Array.from({ length: 8 }).map((__, i) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    <Skeleton variant="rectangular" height={400} animation="wave" sx={{ borderRadius: "32px", bgcolor: "rgba(255,255,255,0.05)" }} />
                    <Box sx={{ px: 1, mt: 1 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                        <Skeleton variant="text" width="30%" animation="wave" sx={{ bgcolor: "rgba(255,255,255,0.05)" }} />
                        <Skeleton variant="text" width="20%" animation="wave" sx={{ bgcolor: "rgba(255,255,255,0.05)" }} />
                      </Box>
                      <Skeleton variant="text" width="80%" height={32} animation="wave" sx={{ bgcolor: "rgba(255,255,255,0.05)", mb: 1 }} />
                      <Skeleton variant="rectangular" height={40} animation="wave" sx={{ borderRadius: "15px", bgcolor: "rgba(255,255,255,0.05)", mt: 1.5 }} />
                    </Box>
                  </Box>
                </Grid>
              ))
            ) : filteredProducts.length > 0 ? (
              filteredProducts.map((p) => {
                const id = getId(p);
                const isWished = wishlist.includes(id);
                const avgRating = getAverageRating(id);
                return (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={id}>
                    <Box
                      onClick={() => setSelected(p)}
                      sx={{
                        position: "relative",
                        cursor: "pointer",
                        transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                        "&:hover": { transform: "translateY(-12px)" }
                      }}
                    >
                      {/* Image Container with Editorial Ratio */}
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
                          src={`data:image/jpeg;base64,${p.image}`}
                          alt={p.name}
                          sx={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            transition: "transform 0.8s ease",
                            "&:hover": { transform: "scale(1.1)" }
                          }}
                        />

                        {/* Wishlist Button Overlay */}
                        <IconButton
                          onClick={(e) => { e.stopPropagation(); toggleWishlist(id); }}
                          sx={{
                            position: "absolute",
                            top: 16,
                            right: 16,
                            bgcolor: "rgba(0,0,0,0.4)",
                            backdropFilter: "blur(4px)",
                            color: isWished ? "var(--accent)" : "white",
                            "&:hover": { bgcolor: "white", color: "#020617" }
                          }}
                        >
                          <Heart size={18} fill={isWished ? "var(--accent)" : "none"} />
                        </IconButton>

                        {/* Price Tag Overlay */}
                        <Box sx={{
                          position: "absolute",
                          bottom: 16,
                          left: 16,
                          bgcolor: "rgba(34, 197, 94, 0.95)",
                          color: "#020617",
                          px: 2,
                          py: 0.5,
                          borderRadius: "12px",
                          fontWeight: 900,
                          fontSize: "1rem"
                        }}>
                          ₹{p.price}
                        </Box>
                      </Box>

                      {/* Clean Text Content */}
                      <Box sx={{ px: 1 }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
                          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.4)", fontWeight: 800, textTransform: "uppercase", letterSpacing: 1 }}>
                            {p.category || "Lifestyle"}
                          </Typography>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                            {avgRating > 0 ? (
                              <>
                                <Star size={12} fill="var(--primary)" color="var(--primary)" />
                                <Typography variant="caption" sx={{ color: "white", fontWeight: 700 }}>{avgRating.toFixed(1)}</Typography>
                              </>
                            ) : (
                              <Typography variant="caption" sx={{ color: "var(--primary)", fontWeight: 800, textTransform: "uppercase", letterSpacing: 1 }}>New</Typography>
                            )}
                          </Box>
                        </Box>

                        <Typography variant="h6" sx={{ fontWeight: 800, color: "white", mb: 0.5 }}>
                          {truncate(p.name, 22)}
                        </Typography>

                        <Box sx={{ display: "flex", gap: 1, mt: 1.5 }}>
                          <Button
                            fullWidth
                            variant="contained"
                            onClick={(e) => { e.stopPropagation(); addToCart(id); }}
                            sx={{
                              borderRadius: "15px",
                              bgcolor: "white",
                              color: "#020617",
                              fontWeight: 800,
                              fontSize: "0.8rem",
                              "&:hover": { bgcolor: "var(--primary)", color: "white" }
                            }}
                          >
                            Quick Add
                          </Button>
                        </Box>
                      </Box>
                    </Box>
                  </Grid>
                );
              })
            ) : (
              <Box sx={{ width: "100%", py: 10, textAlign: "center" }}>
                <Typography variant="h5" sx={{ color: "var(--text-secondary)" }}>No products found matching your search.</Typography>
              </Box>
            )}
          </Grid>
        </Container>
      </Box>

      {/* ===================== */}
      {/* PRODUCT DETAIL DIALOG */}
      {/* ===================== */}
      <Dialog
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: {
            borderRadius: "32px",
            bgcolor: "rgba(10, 15, 30, 0.98)",
            backdropFilter: "blur(30px)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            color: "white",
            overflowX: "hidden",
            overflowY: "auto"
          }
        }}
      >
        {selected && (
          <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, minHeight: 500 }}>
            {/* Left: Product Image */}
            <Box sx={{ flex: 1, position: "relative" }}>
              <Box
                component="img"
                src={`data:image/jpeg;base64,${selected.image}`}
                sx={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              <IconButton
                onClick={() => setSelected(null)}
                sx={{ position: "absolute", top: 16, left: 16, bgcolor: "rgba(0,0,0,0.5)", color: "white", "&:hover": { bgcolor: "rgba(0,0,0,0.7)" } }}
              >
                <X size={20} />
              </IconButton>
            </Box>

            {/* Right: Content & Reviews */}
            <Box sx={{ flex: 1.2, display: "flex", flexDirection: "column", height: { xs: "auto", md: "80vh" } }}>
              <Box sx={{ p: 4, overflowY: { xs: "visible", md: "auto" }, flexGrow: 1 }}>
                <Typography variant="caption" sx={{ color: "var(--primary)", fontWeight: 800, textTransform: "uppercase", letterSpacing: 2 }}>
                  {selected.category || "EXCLUSIVELY SHOPLIVE"}
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 900, mb: 1 }}>{selected.name}</Typography>

                <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
                  <Typography variant="h4" sx={{ fontWeight: 900, color: "var(--primary)" }}>₹{selected.price}</Typography>
                  <Divider orientation="vertical" flexItem sx={{ borderColor: "rgba(255,255,255,0.1)" }} />
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Rating value={getAverageRating(getId(selected))} precision={0.5} readOnly size="small" />
                    <Typography variant="body2" sx={{ color: "var(--text-secondary)" }}>
                      ({reviews[getId(selected)]?.length || 0} reviews)
                    </Typography>
                  </Box>
                </Box>

                <Typography sx={{ color: "var(--text-secondary)", mb: 4, lineHeight: 1.7, fontSize: "1.05rem" }}>
                  {selected.description}
                </Typography>

                <Divider sx={{ mb: 4, borderColor: "rgba(255,255,255,0.1)" }} />

                {/* Reviews Section */}
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, mb: 3, display: "flex", alignItems: "center", gap: 1.5 }}>
                    <MessageSquare size={20} /> User Reviews
                  </Typography>

                  {/* Review Form */}
                  <Box sx={{ mb: 5, p: 3, borderRadius: "20px", bgcolor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 700 }}>Write a review</Typography>
                    <Rating
                      value={newRating}
                      onChange={(_, v) => setNewRating(v)}
                      sx={{ mb: 2, color: "var(--primary)" }}
                    />
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      variant="standard"
                      placeholder="Share your experience..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      InputProps={{
                        disableUnderline: true,
                        sx: { color: "white", fontSize: "0.95rem" }
                      }}
                      sx={{ mb: 2 }}
                    />
                    <Button
                      variant="contained"
                      endIcon={<Send size={16} />}
                      onClick={() => handleAddReview(getId(selected))}
                      sx={{ borderRadius: "100px", px: 3 }}
                      disabled={!newComment.trim()}
                    >
                      Post Review
                    </Button>
                  </Box>

                  {/* Reviews List */}
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                    {(reviews[getId(selected)] || []).length > 0 ? (
                      reviews[getId(selected)].map((r) => (
                        <Box key={r.id || r.createdAt}>
                          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                              <Avatar sx={{ width: 32, height: 32, fontSize: "0.8rem", bgcolor: "var(--primary)", color: "#020617" }}>
                                {(r.username || "C")[0]}
                              </Avatar>
                              <Box>
                                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{r.username || "Customer"}</Typography>
                                <Rating value={r.stars || 5} size="small" readOnly sx={{ color: "var(--primary)" }} />
                              </Box>
                            </Box>
                            <Typography variant="caption" sx={{ color: "var(--text-secondary)" }}>
                              {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "Just now"}
                            </Typography>
                          </Box>
                          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)", pl: 6 }}>{r.text}</Typography>
                        </Box>
                      ))
                    ) : (
                      <Typography sx={{ color: "var(--text-secondary)", textAlign: "center", fontStyle: "italic", py: 2 }}>
                        No reviews yet. Be the first to review this product!
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Box>

              {/* Bottom Sticky Action */}
              <Box sx={{ p: 4, bgcolor: "rgba(0,0,0,0.3)", borderTop: "1px solid rgba(255,255,255,0.1)", display: "flex", gap: 2 }}>
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={() => { addToCart(getId(selected)); setSelected(null); }}
                  sx={{ py: 2, borderRadius: "16px", fontSize: "1.1rem", fontWeight: 800 }}
                >
                  Add to Shopping Bag
                </Button>
                <IconButton
                  onClick={() => toggleWishlist(getId(selected))}
                  sx={{
                    width: 64,
                    bgcolor: "rgba(255,255,255,0.05)",
                    color: wishlist.includes(getId(selected)) ? "var(--accent)" : "white",
                    borderRadius: "16px",
                    "&:hover": { bgcolor: "rgba(255,255,255,0.1)" }
                  }}
                >
                  <Heart size={24} fill={wishlist.includes(getId(selected)) ? "var(--accent)" : "none"} />
                </IconButton>
              </Box>
            </Box>
          </Box>
        )}
      </Dialog>

      {/* CART DRAWER & SUCCESS DIALOG remain (with same logic but slightly updated spacing) */}
      <Drawer
        anchor="right"
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        PaperProps={{
          sx: {
            width: { xs: "100%", sm: 400 },
            bgcolor: "rgba(10, 15, 30, 0.98)",
            backdropFilter: "blur(30px)",
            color: "white",
            borderLeft: "1px solid rgba(255, 255, 255, 0.1)"
          }
        }}
      >
        <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
          <Box sx={{ p: 4, display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
            <Typography variant="h5" sx={{ fontWeight: 900 }}>Your Bag</Typography>
            <IconButton onClick={() => setSidebarOpen(false)} sx={{ color: "white" }}>
              <X size={24} />
            </IconButton>
          </Box>
          <Box sx={{ flex: 1, overflowY: "auto", p: 3 }}>
            {totalItems === 0 ? (
              <Box sx={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 2 }}>
                <ShoppingBag size={64} style={{ opacity: 0.1 }} />
                <Typography sx={{ color: "var(--text-secondary)", fontWeight: 700 }}>Nothing in your bag yet.</Typography>
              </Box>
            ) : (
              Object.entries(cart).map(([id, qty]) => {
                const p = products.find(prod => getId(prod) === id);
                if (!p || qty === 0) return null;
                return (
                  <Box key={id} sx={{ display: "flex", gap: 2, mb: 3, p: 2, borderRadius: "20px", bgcolor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <Box component="img" src={`data:image/jpeg;base64,${p.image}`} sx={{ width: 80, height: 80, borderRadius: "14px", objectFit: "cover" }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ fontWeight: 800, mb: 0.5 }}>{p.name}</Typography>
                      <Typography variant="body2" sx={{ color: "var(--primary)", fontWeight: 800 }}>₹{p.price}</Typography>
                      <Box sx={{ mt: 1.5, display: "flex", alignItems: "center", gap: 2 }}>
                        <IconButton size="small" onClick={() => removeFromCart(id)} sx={{ color: "white", bgcolor: "rgba(255,255,255,0.05)" }}>-</IconButton>
                        <Typography sx={{ fontWeight: 900 }}>{qty}</Typography>
                        <IconButton size="small" onClick={() => addToCart(id)} sx={{ color: "white", bgcolor: "rgba(255,255,255,0.05)" }}>+</IconButton>
                      </Box>
                    </Box>
                  </Box>
                );
              })
            )}
          </Box>
          {totalItems > 0 && (
            <Box sx={{ p: 4, borderTop: "1px solid rgba(255,255,255,0.1)", bgcolor: "rgba(0,0,0,0.3)" }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
                <Typography sx={{ color: "var(--text-secondary)", fontWeight: 700 }}>Subtotal</Typography>
                <Typography variant="h5" sx={{ fontWeight: 900, color: "var(--primary)" }}>
                  ₹{Object.entries(cart).reduce((t, [id, q]) => t + (products.find(pr => getId(pr) === id)?.price || 0) * q, 0)}
                </Typography>
              </Box>
              <Button fullWidth variant="contained" size="large" onClick={checkout} disabled={placing} sx={{ py: 2, borderRadius: "16px", fontWeight: 800 }}>
                {placing ? "Processing..." : "Secure Checkout"}
              </Button>
            </Box>
          )}
        </Box>
      </Drawer>

      <Dialog open={successOpen} onClose={() => setSuccessOpen(false)} PaperProps={{ sx: { borderRadius: "32px", bgcolor: "#020617", border: "1px solid rgba(255,255,255,0.15)", p: 2 } }}>
        <DialogContent sx={{ textAlign: "center", py: 8 }}>
          <Box sx={{ mb: 4, display: "inline-flex", p: 3, borderRadius: "50%", bgcolor: "rgba(34, 197, 94, 0.15)", color: "var(--primary)" }}>
            <ShoppingBag size={64} />
          </Box>
          <Typography variant="h3" sx={{ fontWeight: 900, mb: 2 }}>Success!</Typography>
          <Typography sx={{ color: "var(--text-secondary)", mb: 5, fontSize: "1.1rem" }}>
            Your order has been placed. Experience the best of ShopLive.
          </Typography>
          <Button variant="contained" fullWidth onClick={() => { setSuccessOpen(false); navigate("/dashboard"); }} sx={{ py: 2, borderRadius: "16px", fontWeight: 800 }}>
            Track My Order
          </Button>
        </DialogContent>
        {successOpen && <Confetti numberOfPieces={250} recycle={false} gravity={0.15} />}
      </Dialog>
    </Box>
  );
};
