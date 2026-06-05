import { useState } from "react";
import { motion } from "framer-motion"; // eslint-disable-line
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import Particles from "react-tsparticles";
import { loadSlim } from "@tsparticles/slim";
import Typewriter from "typewriter-effect";

import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Divider,
  IconButton,
  Alert
} from "@mui/material";
import { GoogleLogin } from "@react-oauth/google";
import { Eye, EyeOff, ArrowLeft, LogIn } from "lucide-react";

export default function Login({ onLogin }) {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function saveSession(data) {
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
    localStorage.setItem("customerId", data.customerId);
    localStorage.setItem("username", data.username);

    const decoded = jwtDecode(data.accessToken);
    const roles = decoded.roles || [];

    onLogin();
    navigate(roles.includes("ROLE_ADMIN") ? "/admin" : "/shopping", {
      replace: true
    });
  }

  async function handlePasswordLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        "https://demo-springboot-zdym.onrender.com/auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, password })
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");

      await saveSession(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin(credentialResponse) {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        "https://demo-springboot-zdym.onrender.com/auth/google",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: credentialResponse.credential })
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Google login failed");

      await saveSession(data);
    } catch (err) {
      setError(err.message);
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
          top: "-10%",
          right: "-10%",
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
          bottom: "-5%",
          left: "-5%",
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
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="glass-panel"
          style={{
            padding: "40px",
            width: "100%",
            textAlign: "center"
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
            <Box sx={{ p: 1.5, borderRadius: "16px", bgcolor: "rgba(34, 197, 94, 0.1)", color: "var(--primary)" }}>
              <LogIn size={32} />
            </Box>
          </Box>

          <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, letterSpacing: "-1px" }}>
            <Typewriter
              options={{
                strings: ["Welcome back.", "ShopLive Login"],
                autoStart: true,
                loop: true,
                delay: 60
              }}
            />
          </Typography>

          <Typography sx={{ color: "var(--text-secondary)", mb: 4 }}>
            Enter your credentials to continue shopping
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: "12px", bgcolor: "rgba(244, 63, 94, 0.1)", color: "#fb7185", border: "1px solid rgba(244, 63, 94, 0.2)" }}>
              {error}
            </Alert>
          )}

          <Box display="flex" justifyContent="center" mb={4}>
            <GoogleLogin
              onSuccess={handleGoogleLogin}
              onError={() => setError("Google Sign-In Failed")}
              theme="filled_black"
              shape="pill"
            />
          </Box>

          <Divider sx={{ mb: 4, borderColor: "rgba(255,255,255,0.08)" }}>
            <Typography variant="body2" sx={{ color: "var(--text-secondary)", px: 2 }}>OR</Typography>
          </Divider>

          <form onSubmit={handlePasswordLogin}>
            <TextField
              fullWidth
              placeholder="Username"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              sx={inputStyles}
            />

            <TextField
              fullWidth
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              sx={{ ...inputStyles, mt: 2 }}
              InputProps={{
                endAdornment: (
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    sx={{ color: "var(--text-secondary)" }}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </IconButton>
                )
              }}
            />

            <Button
              fullWidth
              type="submit"
              disabled={loading}
              variant="contained"
              sx={{
                mt: 4,
                py: 1.8,
                fontSize: "1rem"
              }}
            >
              {loading ? "Signing in..." : "Continue to Account"}
            </Button>
          </form>

          <Box sx={{ mt: 4 }}>
            <Typography variant="body2" sx={{ color: "var(--text-secondary)" }}>
              Don't have an account?{" "}
              <Button
                onClick={() => navigate("/register")}
                sx={{ p: 0, textTransform: "none", fontWeight: 700, color: "var(--primary)" }}
              >
                Sign up now
              </Button>
            </Typography>
          </Box>
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
    "&.Mui-focused fieldset": { borderColor: "var(--primary)" },
  },
  "& .MuiInputBase-input::placeholder": {
    color: "var(--text-secondary)",
    opacity: 1,
  }
};
