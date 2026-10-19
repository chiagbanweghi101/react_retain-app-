import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import InsightsOutlinedIcon from "@mui/icons-material/InsightsOutlined";
import MenuIcon from "@mui/icons-material/Menu";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import SavingsOutlinedIcon from "@mui/icons-material/SavingsOutlined";
import { AppBar, Box, Button, Drawer, IconButton, List, ListItemButton, ListItemIcon, ListItemText, Toolbar, Typography } from "@mui/material";
import { useState, type ReactNode } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth.ts";
import { resetFilters } from "../store/filtersSlice.ts";
import { useAppDispatch } from "../store/hooks.ts";

const drawerWidth = 248;

function NavItem({ to, icon, label }: { to: string; icon: ReactNode; label: string }) {
  return (
    <ListItemButton
      component={NavLink}
      to={to}
      sx={{
        borderRadius: 999,
        mx: 1.5,
        mb: 0.5,
        color: "#4B5563",
        "&.active": { bgcolor: "#8BC34A", color: "#FFFFFF" },
      }}
    >
      <ListItemIcon sx={{ color: "inherit", minWidth: 36 }}>{icon}</ListItemIcon>
      <ListItemText primary={label} slotProps={{ primary: { sx: { fontWeight: 600 } } }} />
    </ListItemButton>
  );
}

export function Layout() {
  const { user, signOut } = useAuth();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  function leave() {
    dispatch(resetFilters());
    signOut();
    navigate("/signin");
  }

  const drawer = (
    <Box sx={{ bgcolor: "#FFFFFF", height: "100%", display: "flex", flexDirection: "column", py: 2 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, px: 2.5, mb: 2 }}>
        <Box sx={{ width: 36, height: 36, borderRadius: "50%", display: "grid", placeItems: "center", bgcolor: "#6D28D9", color: "#FFFFFF" }}>
          <SavingsOutlinedIcon fontSize="small" />
        </Box>
        <Typography sx={{ fontWeight: 800, color: "#5B21B6", letterSpacing: 0.4 }}>Retain</Typography>
      </Box>
      <Box sx={{ flex: 1, overflow: "auto" }}>
        <List>
          <NavItem to="/" icon={<DashboardOutlinedIcon />} label="Dashboard" />
          <NavItem to="/expenses" icon={<ReceiptLongOutlinedIcon />} label="Expenses" />
          <NavItem to="/budget" icon={<SavingsOutlinedIcon />} label="Budget" />
          {user?.role === "admin" ? <NavItem to="/admin" icon={<InsightsOutlinedIcon />} label="Insights" /> : null}
          {user?.role === "admin" ? <NavItem to="/admin/categories" icon={<CategoryOutlinedIcon />} label="Categories" /> : null}
        </List>
      </Box>
      <Box sx={{ mx: 2, mt: 2, p: 2, border: "1px solid #E8ECF3", borderRadius: 3 }}>
        <Typography sx={{ fontWeight: 700 }}>{user?.name}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ textTransform: "capitalize" }}>
          {user?.role}
        </Typography>
        <Button variant="outlined" color="error" fullWidth onClick={leave} sx={{ mt: 1.5, borderRadius: 999, textTransform: "none" }}>
          Sign out
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar position="fixed" elevation={0} sx={{ display: { md: "none" }, bgcolor: "#FFFFFF", color: "text.primary", borderBottom: "1px solid #E8ECF3" }}>
        <Toolbar>
          <IconButton color="inherit" edge="start" onClick={() => setOpen(true)} sx={{ mr: 1 }} aria-label="Open navigation">
            <MenuIcon />
          </IconButton>
          <Typography sx={{ fontWeight: 800, color: "#5B21B6" }}>Retain</Typography>
        </Toolbar>
      </AppBar>
      <Drawer variant="temporary" open={open} onClose={() => setOpen(false)} sx={{ display: { md: "none" } }} ModalProps={{ keepMounted: true }}>
        <Box sx={{ width: drawerWidth }} onClick={() => setOpen(false)}>
          {drawer}
        </Box>
      </Drawer>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" },
          width: drawerWidth,
          "& .MuiDrawer-paper": { width: drawerWidth, boxSizing: "border-box", borderRight: "1px solid #E8ECF3" },
        }}
        open
      >
        {drawer}
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 3 }, mt: { xs: 8, md: 0 }, width: { md: `calc(100% - ${drawerWidth}px)` } }}>
        <Outlet />
      </Box>
    </Box>
  );
}
