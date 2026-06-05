import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion"; // eslint-disable-line
import { Box, Typography, Button } from "@mui/material";
import { ChevronLeft, ChevronRight, Tag } from "lucide-react";

export default function ModernGlassCarousel({ slides = [], onProductClick }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!slides.length) return;
    const id = setInterval(
      () => setIndex((i) => (i + 1) % slides.length),
      6000
    );
    return () => clearInterval(id);
  }, [slides]);

  if (!slides.length) return null;

  const next = () => setIndex((i) => (i + 1) % slides.length);
  const prev = () => setIndex((i) => (i - 1 + slides.length) % slides.length);

  return (
    <Box
      sx={{
        position: "relative",
        height: { xs: "300px", md: "500px" },
        width: "100%",
        borderRadius: "40px",
        overflow: "hidden",
        boxShadow: "0 20px 80px -20px rgba(0,0,0,0.5)",
        bgcolor: "#020617"
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          style={{ position: "absolute", inset: 0 }}
        >
          {/* Main Background Image with Zoom */}
          <motion.img
            src={slides[index].image}
            alt={slides[index].title}
            initial={{ scale: 1.15 }}
            animate={{ scale: 1.05 }}
            transition={{ duration: 7, ease: "linear" }}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              filter: "brightness(0.6)"
            }}
          />

          {/* Content Overlay */}
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              px: { xs: 4, md: 10 },
              background: "linear-gradient(90deg, rgba(2,6,23,0.8) 0%, transparent 60%)"
            }}
          >
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              {slides[index].offer && (
                <Box sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 1,
                  bgcolor: "var(--primary)",
                  color: "#020617",
                  px: 2,
                  py: 0.5,
                  borderRadius: "100px",
                  mb: 3,
                  fontWeight: 900,
                  fontSize: "0.8rem",
                  letterSpacing: "1px"
                }}>
                  <Tag size={14} /> EXCLUSIVE OFFER
                </Box>
              )}

              <Typography
                variant="h2"
                sx={{
                  fontWeight: 900,
                  color: "white",
                  mb: 2,
                  fontSize: { xs: "2rem", md: "4.5rem" },
                  lineHeight: 1,
                  letterSpacing: "-2px"
                }}
              >
                {slides[index].title}
              </Typography>

              <Typography
                sx={{
                  color: "rgba(255,255,255,0.6)",
                  fontSize: { xs: "1rem", md: "1.2rem" },
                  maxWidth: "500px",
                  mb: 4,
                  lineHeight: 1.6
                }}
              >
                {slides[index].subtitle}
              </Typography>

              <Button
                variant="contained"
                onClick={() => onProductClick && onProductClick(slides[index].productId)}
                sx={{
                  borderRadius: "100px",
                  px: 4,
                  py: 1.5,
                  fontSize: "1rem",
                  fontWeight: 800,
                  boxShadow: "0 10px 30px -5px var(--primary)"
                }}
              >
                Shop Now
              </Button>
            </motion.div>
          </Box>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      <Box sx={{ position: "absolute", bottom: 40, right: 40, display: "flex", gap: 2, zIndex: 10 }}>
        <Box
          onClick={prev}
          sx={{
            width: 50, height: 50, borderRadius: "50%",
            border: "1px solid rgba(255,255,255,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: "white", transition: "0.3s",
            "&:hover": { bgcolor: "white", color: "#020617" }
          }}
        >
          <ChevronLeft size={24} />
        </Box>
        <Box
          onClick={next}
          sx={{
            width: 50, height: 50, borderRadius: "50%",
            border: "1px solid rgba(255,255,255,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: "white", transition: "0.3s",
            "&:hover": { bgcolor: "white", color: "#020617" }
          }}
        >
          <ChevronRight size={24} />
        </Box>
      </Box>

      {/* Modern Progress Indicators */}
      <Box sx={{ position: "absolute", bottom: 0, left: 0, width: "100%", display: "flex" }}>
        {slides.map((_, i) => (
          <Box key={i} sx={{ flex: 1, height: "4px", bgcolor: "rgba(255,255,255,0.1)", position: "relative" }}>
            {index === i && (
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 6, ease: "linear" }}
                style={{ height: "100%", background: "var(--primary)", position: "absolute", top: 0, left: 0 }}
              />
            )}
          </Box>
        ))}
      </Box>
    </Box>
  );
}
