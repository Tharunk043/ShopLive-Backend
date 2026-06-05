import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemText,
  AppBar,
  Toolbar,
  Typography,
  Button
} from "@mui/material";
import { useState } from "react";
import OrdersPage from "./OrdersPage";

const drawerWidth = 240;

export default function MainLayout({ onLogout }) {
  const [page, setPage] = useState("orders");

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", background: "#0f172a" }}>
      <AppBar position="fixed" sx={{ zIndex: 1201, background: "#020617" }}>
        <Toolbar>
          <Typography sx={{ flexGrow: 1 }}>
            ShopLive Control Center
          </Typography>
          <Button color="inherit" onClick={onLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            background: "#020617",
            color: "white"
          }
        }}
      >
        <Toolbar />
        <List>
          <ListItem button onClick={() => setPage("orders")}>
            <ListItemText primary="📦 Live Orders" />
          </ListItem>
          <ListItem button>
            <ListItemText primary="📊 Analytics" />
          </ListItem>
          <ListItem button>
            <ListItemText primary="⚙ Settings" />
          </ListItem>
        </List>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        {page === "orders" && <OrdersPage />}
      </Box>
    </Box>
  );
}
