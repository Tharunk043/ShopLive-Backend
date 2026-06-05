import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion"; // eslint-disable-line
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";
import Typewriter from "typewriter-effect";

import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  CircularProgress,
  Alert,
  Divider,
  IconButton
} from "@mui/material";
import { ArrowLeft, UserPlus } from "lucide-react";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.name || form.name.trim().length < 3) {
      setError("Username must be at least 3 characters long.");
      return;
    }

    if (!form.password || form.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        "https://demo-springboot-zdym.onrender.com/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form)
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed");

      setSuccess("Account created successfully! Redirecting...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box sx={{ minHeight: "100vh", position: "relative", bgcolor: "#020617", overflow: "hidden" }}>
      {/* 🌌 Background Orbs */}
      <Box
        sx={{
          position: "absolute",
          top: "-15%",
          left: "-10%",
          width: "500px",
          height: "500px",
          background: "var(--primary)",
          filter: "blur(180px)",
          opacity: 0.1,
          zIndex: 0
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: "-10%",
          right: "-5%",
          width: "400px",
          height: "400px",
          background: "var(--secondary)",
          filter: "blur(150px)",
          opacity: 0.1,
          zIndex: 0
        }}
      />

      <Particles
        init={loadSlim}
        options={{
          particles: {
            number: { value: 60 },
            size: { value: 1.5 },
            opacity: { value: 0.2 },
            move: { enable: true, speed: 0.4 },
            links: { enable: true, opacity: 0.1, distance: 150 }
          }
        }}
        style={{ position: "absolute", zIndex: 1 }}
      />

      <Container
        maxWidth="sm"
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          zIndex: 2
        }}
      >
        <Button
          startIcon={<ArrowLeft size={18} />}
          onClick={() => navigate("/")}
          sx={{
            alignSelf: "flex-start",
            mb: 4,
            color: "var(--text-secondary)",
            "&:hover": { color: "var(--primary)" }
          }}
        >
          Back to home
        </Button>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="glass-panel"
          style={{
            padding: "40px",
            width: "100%",
            textAlign: "center"
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
            <Box sx={{ p: 1.5, borderRadius: "16px", bgcolor: "rgba(56, 189, 248, 0.1)", color: "var(--secondary)" }}>
              <UserPlus size={32} />
            </Box>
          </Box>

          <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, letterSpacing: "-1px" }}>
            <Typewriter
              options={{
                strings: ["Create account.", "Join ShopLive"],
                autoStart: true,
                loop: true,
                delay: 60
              }}
            />
          </Typography>

          <Typography sx={{ color: "var(--text-secondary)", mb: 4 }}>
            Start your premium shopping journey today
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: "12px", bgcolor: "rgba(244, 63, 94, 0.1)", color: "#fb7185", border: "1px solid rgba(244, 63, 94, 0.2)" }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 3, borderRadius: "12px", bgcolor: "rgba(34, 197, 94, 0.1)", color: "#4ade80", border: "1px solid rgba(34, 197, 94, 0.2)" }}>
              {success}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              placeholder="Full Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              sx={inputStyles}
            />

            <TextField
              fullWidth
              placeholder="Email Address"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              sx={{ ...inputStyles, mt: 2 }}
            />

            <TextField
              fullWidth
              placeholder="Password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
              sx={{ ...inputStyles, mt: 2 }}
            />

            <Button
              fullWidth
              type="submit"
              disabled={loading}
              variant="contained"
              sx={{
                mt: 4,
                py: 1.8,
                fontSize: "1rem",
                bgcolor: "var(--secondary)",
                "&:hover": { bgcolor: "#0ea5e9" },
                boxShadow: "0 0 20px rgba(56, 189, 248, 0.3)"
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Create Account"}
            </Button>
          </Box>

          <Divider sx={{ my: 4, borderColor: "rgba(255,255,255,0.08)" }} />

          <Typography variant="body2" sx={{ color: "var(--text-secondary)" }}>
            Already have an account?{" "}
            <Button
              onClick={() => navigate("/login")}
              sx={{ p: 0, textTransform: "none", fontWeight: 700, color: "var(--secondary)" }}
            >
              Log in instead
            </Button>
          </Typography>
        </motion.div>
      </Container>
    </Box>
  );
}

const inputStyles = {
  "& .MuiOutlinedInput-root": {
    color: "white",
    bgcolor: "rgba(255,255,255,0.03)",
    borderRadius: "12px",
    "& fieldset": { borderColor: "rgba(255,255,255,0.1)" },
    "&:hover fieldset": { borderColor: "rgba(255,255,255,0.2)" },
    "&.Mui-focused fieldset": { borderColor: "var(--secondary)" },
  },
  "& .MuiInputBase-input::placeholder": {
    color: "var(--text-secondary)",
    opacity: 1,
  }
};
