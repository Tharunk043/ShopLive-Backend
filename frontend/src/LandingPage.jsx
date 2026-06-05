import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion"; // eslint-disable-line
import { useNavigate } from "react-router-dom";
import { Info, Mail, Phone, MapPin, Rocket, ChevronRight, ShoppingBag } from "lucide-react";
import {
  Button,
  Box,
  Container,
  Typography,
  Skeleton
} from "@mui/material";

const slides = [
  {
    title: "Real-Time Orders",
    subtitle: "Track every order live with instant updates and transparent status flows.",
    image: "https://img.businessoffashion.com/resizer/v2/RPIJFAIDLBA3FPTMZW5EAXDJTE.png?auth=2a5a3e2ac0df4995abc1ecf86c5323de3d6e1465a04ae29de1401f03b57416e2&width=1440"
  },
  {
    title: "Smart Shopping",
    subtitle: "Experience personalized deals powered by our high-performance AI engine.",
    image: "https://img.freepik.com/free-photo/two-hugging-woman-with-paper-bags_23-2147688807.jpg?semt=ais_hybrid&w=740&q=80"
  },
  {
    title: "Exclusive Offers",
    subtitle: "Unlock massive savings with our daily flash sales and VIP member rewards.",
    image: "https://www.beyoung.in/mobile/images/locations/Plain-tshirt-mobile-view.jpg"
  }
];

export default function LandingPage() {
  const [index, setIndex] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    slides.forEach((slide) => {
      const img = new Image();
      img.src = slide.image;
      img.onload = () => {
        setImagesLoaded((prev) => ({ ...prev, [slide.image]: true }));
      };
    });

    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <Box sx={{ minHeight: "100vh", color: "white" }}>
      {/* ===================== */}
      {/* GLASS HEADER */}
      {/* ===================== */}
      <Box
        component="header"
        className="glass-panel"
        sx={{
          position: "fixed",
          top: 16,
          left: "50%",
          transform: "translateX(-50%)",
          width: "calc(100% - 32px)",
          maxWidth: "1200px",
          zIndex: 1000,
          px: 3,
          py: 1.5,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderRadius: "100px",
          border: "1px solid rgba(255, 255, 255, 0.15)",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <ShoppingBag className="text-primary" size={28} />
          <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: "-0.5px" }}>
            Shop<span style={{ color: "var(--primary)" }}>Live</span>
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            onClick={() => navigate("/login")}
            sx={{ color: "white", textTransform: "none", fontWeight: 600 }}
          >
            Login
          </Button>
          <Button
            variant="contained"
            onClick={() => navigate("/register")}
            sx={{
              textTransform: "none",
              borderRadius: "50px",
              px: 3
            }}
          >
            Join Now
          </Button>
        </Box>
      </Box>

      {/* ===================== */}
      {/* HERO SECTION */}
      {/* ===================== */}
      <Box sx={{ position: "relative", height: "100vh", overflow: "hidden" }}>
        <AnimatePresence mode="wait">
          {imagesLoaded[slides[index].image] ? (
            <motion.div
              key={slides[index].image}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2 }}
              style={{
                position: "absolute",
                width: "100%",
                height: "100%",
                backgroundImage: `linear-gradient(to bottom, rgba(2, 6, 23, 0.4), rgba(2, 6, 23, 0.9)), url(${slides[index].image})`,
                backgroundSize: "cover",
                backgroundPosition: "center"
              }}
            />
          ) : (
            <motion.div
              key={`skeleton-${index}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2 }}
              style={{
                position: "absolute",
                width: "100%",
                height: "100%"
              }}
            >
              <Skeleton 
                variant="rectangular" 
                width="100%" 
                height="100%" 
                animation="wave" 
                sx={{ bgcolor: "rgba(255,255,255,0.05)" }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <Container
          sx={{
            position: "relative",
            zIndex: 2,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: { xs: "center", md: "flex-start" },
            textAlign: { xs: "center", md: "left" }
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={slides[index].title}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -30, opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: "3rem", md: "5rem" },
                  fontWeight: 900,
                  lineHeight: 1,
                  mb: 2
                }}
              >
                {slides[index].title}
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  maxWidth: "600px",
                  color: "var(--text-secondary)",
                  mb: 6,
                  fontWeight: 400
                }}
              >
                {slides[index].subtitle}
              </Typography>
            </motion.div>
          </AnimatePresence>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Box sx={{ display: "flex", gap: 2, flexDirection: { xs: "column", sm: "row" } }}>
              <Button
                variant="contained"
                size="large"
                endIcon={<ChevronRight />}
                onClick={() => navigate("/register")}
                sx={{ borderRadius: "50px", px: 4, py: 1.5, fontSize: "1.1rem" }}
              >
                Get Started
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate("/login")}
                sx={{
                  borderRadius: "50px",
                  px: 4,
                  py: 1.5,
                  fontSize: "1.1rem",
                  borderColor: "rgba(255,255,255,0.2)",
                  color: "white",
                  "&:hover": { borderColor: "var(--primary)" }
                }}
              >
                View Collections
              </Button>
            </Box>
          </motion.div>
        </Container>

        {/* Floating Background Orbs */}
        <Box
          sx={{
            position: "absolute",
            top: "20%",
            right: "5%",
            width: "400px",
            height: "400px",
            background: "var(--primary)",
            filter: "blur(150px)",
            opacity: 0.1,
            zIndex: 1,
            animation: "pulse 10s infinite"
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: "10%",
            left: "10%",
            width: "300px",
            height: "300px",
            background: "var(--secondary)",
            filter: "blur(120px)",
            opacity: 0.1,
            zIndex: 1,
            animation: "pulse 8s infinite"
          }}
        />
      </Box>

      {/* ===================== */}
      {/* FEATURES SECTION */}
      {/* ===================== */}
      <Box sx={{ py: 15, position: "relative" }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: "center", mb: 10 }}>
            <Typography variant="overline" sx={{ color: "var(--primary)", fontWeight: 800, letterSpacing: 4 }}>
              WHY CHOOSE US
            </Typography>
            <Typography variant="h2" sx={{ fontWeight: 900, mb: 2 }}>
              The Future of Shopping
            </Typography>
            <Box sx={{ width: 60, height: 4, bgcolor: "var(--primary)", mx: "auto", borderRadius: 2 }} />
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
              gap: 4
            }}
          >
            {[
              {
                icon: <Rocket size={40} className="text-primary" />,
                title: "Fast & Real-Time",
                text: "Track your orders in real-time with blazing-fast updates powered by modern cloud infrastructure."
              },
              {
                icon: <Info size={40} className="text-secondary" />,
                title: "Smart Shopping",
                text: "AI-powered recommendations help you discover products you’ll love — every time you visit."
              },
              {
                icon: <Mail size={40} className="text-accent" />,
                title: "Secure Platform",
                text: "We use enterprise-grade security, JWT authentication, and encrypted data storage."
              }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="glass-card"
                style={{ height: "100%", padding: "40px", textAlign: "center" }}
              >
                <Box sx={{ mb: 3, display: "flex", justifyContent: "center", color: "var(--primary)" }}>
                  {item.icon}
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                  {item.title}
                </Typography>
                <Typography sx={{ color: "var(--text-secondary)", lineHeight: 1.7 }}>
                  {item.text}
                </Typography>
              </motion.div>
            ))}
          </Box>
        </Container>
      </Box>

      {/* ===================== */}
      {/* CONTACT SECTION */}
      {/* ===================== */}
      <Box sx={{ py: 15, bgcolor: "rgba(255,255,255,0.02)" }}>
        <Container maxWidth="lg">
          <Box className="glass-panel" sx={{ p: { xs: 4, md: 8 }, position: "relative", overflow: "hidden" }}>
            <Box sx={{ position: "relative", zIndex: 2 }}>
              <Typography variant="h3" sx={{ fontWeight: 900, mb: 6, textAlign: "center" }}>
                Connect With Us
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
                  gap: 4
                }}
              >
                {[
                  { icon: <Mail size={24} />, title: "Email", value: "support@shoplive.com" },
                  { icon: <Phone size={24} />, title: "Phone", value: "+91 98765 43210" },
                  { icon: <MapPin size={24} />, title: "Location", value: "Bangalore, India" }
                ].map((item, i) => (
                  <Box key={i} sx={{ textAlign: "center" }}>
                    <Box sx={{ mb: 2, color: "var(--primary)", display: "flex", justifyContent: "center" }}>
                      {item.icon}
                    </Box>
                    <Typography sx={{ fontWeight: 700, mb: 0.5 }}>{item.title}</Typography>
                    <Typography sx={{ color: "var(--text-secondary)" }}>{item.value}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* FOOTER */}
      <Box sx={{ py: 6, textAlign: "center", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <Typography sx={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
          © 2026 ShopLive. All rights reserved. Built with Glassmorphism.
        </Typography>
      </Box>

      <style>
        {`
          @keyframes pulse {
            0% { transform: scale(1); opacity: 0.1; }
            50% { transform: scale(1.2); opacity: 0.15; }
            100% { transform: scale(1); opacity: 0.1; }
          }
          .text-primary { color: var(--primary); }
          .text-secondary { color: var(--secondary); }
          .text-accent { color: var(--accent); }
        `}
      </style>
    </Box>
  );
}
