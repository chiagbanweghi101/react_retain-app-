import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import InsightsOutlinedIcon from "@mui/icons-material/InsightsOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import MenuIcon from "@mui/icons-material/Menu";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import SavingsOutlinedIcon from "@mui/icons-material/SavingsOutlined";
import { AppBar, Box, Drawer, IconButton, List, ListItemButton, ListItemIcon, ListItemText, Toolbar, Typography } from "@mui/material";
import { useState, type ReactNode } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth.ts";
import { resetFilters } from "../store/filtersSlice.ts";
import { useAppDispatch } from "../store/hooks.ts";

const drawerWidth = 248;

function NavItem({ to, icon, label }: { to: string; icon: ReactNode; label: string }) {
  return (
    <ListItemButton component={NavLink} to={to} sx={{ borderRadius: 2, mx: 1, mb: 0.5, "&.active": { bgcolor: "primary.main", color: "white" } }}>
      <ListItemIcon sx={{ color: "inherit", minWidth: 36 }}>{icon}</ListItemIcon>
      <ListItemText primary={label} />
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
    <Box sx={{ bgcolor: "#12141B", height: "100%", pt: 2 }}>
      <Typography sx={{ px: 2.5, mb: 2, fontWeight: 800, letterSpacing: 0.4 }}>Retain</Typography>
      <Typography variant="caption" color="text.secondary" sx={{ px: 2.5 }}>
        MAIN
      </Typography>
      <List>
        <NavItem to="/" icon={<DashboardOutlinedIcon />} label="Home" />
      </List>
      <Typography variant="caption" color="text.secondary" sx={{ px: 2.5 }}>
        SPENDING
      </Typography>
      <List>
        <NavItem to="/expenses" icon={<ReceiptLongOutlinedIcon />} label="Expenses" />
        <NavItem to="/budget" icon={<SavingsOutlinedIcon />} label="Budget" />
      </List>
      {user?.role === "admin" ? (
        <>
          <Typography variant="caption" color="text.secondary" sx={{ px: 2.5 }}>
            ADMIN
          </Typography>
          <List>
            <NavItem to="/admin" icon={<InsightsOutlinedIcon />} label="Insights" />
            <NavItem to="/admin/categories" icon={<CategoryOutlinedIcon />} label="Categories" />
          </List>
        </>
      ) : null}
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <AppBar position="fixed" elevation={0} sx={{ bgcolor: "#12141B", borderBottom: "1px solid #2A2E3A", width: { md: `calc(100% - ${drawerWidth}px)` }, ml: { md: `${drawerWidth}px` } }}>
        <Toolbar>
          <IconButton color="inherit" edge="start" onClick={() => setOpen(true)} sx={{ mr: 1, display: { md: "none" } }} aria-label="Open navigation">
            <MenuIcon />
          </IconButton>
          <Typography sx={{ flexGrow: 1 }}>{user?.name}</Typography>
          <IconButton color="inherit" onClick={leave} aria-label="Sign out">
            <LogoutOutlinedIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Drawer variant="temporary" open={open} onClose={() => setOpen(false)} sx={{ display: { md: "none" } }} ModalProps={{ keepMounted: true }}>
        <Box sx={{ width: drawerWidth }} onClick={() => setOpen(false)}>
          {drawer}
        </Box>
      </Drawer>
      <Drawer variant="permanent" sx={{ display: { xs: "none", md: "block" }, width: drawerWidth, "& .MuiDrawer-paper": { width: drawerWidth, boxSizing: "border-box", borderRight: "1px solid #2A2E3A" } }} open>
        {drawer}
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 3 }, mt: 8, width: { md: `calc(100% - ${drawerWidth}px)` } }}>
        <Outlet />
      </Box>
    </Box>
  );
}
