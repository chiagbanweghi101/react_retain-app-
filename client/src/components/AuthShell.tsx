import MenuIcon from "@mui/icons-material/Menu";
import SavingsOutlinedIcon from "@mui/icons-material/SavingsOutlined";
import { Box, IconButton, Menu, MenuItem, Stack, ThemeProvider, Typography, createTheme } from "@mui/material";
import { useState, type ReactNode } from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";

const authTheme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#6D28D9" },
    text: { primary: "#1F2937", secondary: "#6B7280" },
    background: { default: "#FFFFFF", paper: "#F4F6FB" },
  },
  typography: { fontFamily: '"DM Sans", sans-serif' },
  shape: { borderRadius: 16 },
  components: {
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: "#FFFFFF",
          borderRadius: 16,
          "& .MuiOutlinedInput-notchedOutline": { borderColor: "#E5E7EB" },
          "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#D1D5DB" },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#6D28D9" },
        },
      },
    },
  },
});

const links = [
  { to: "/signin", label: "Sign in" },
  { to: "/signup", label: "Create account" },
];

export function AuthShell({ title, children }: { title: string; subtitle?: string; children: ReactNode }) {
  const { pathname } = useLocation();
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);

  return (
    <ThemeProvider theme={authTheme}>
      <Box sx={{ minHeight: "100dvh", bgcolor: "#FFFFFF", color: "#1F2937", display: "flex", flexDirection: "column" }}>
        <Box sx={{ position: "fixed", top: 0, right: 0, bottom: 0, width: 10, bgcolor: "#6D28D9" }} />
        <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", px: { xs: 2, sm: 4 }, py: 2.5 }}>
          <Stack direction="row" spacing={1.25} sx={{ alignItems: "center" }}>
            <Box sx={{ width: 42, height: 42, borderRadius: "50%", display: "grid", placeItems: "center", bgcolor: "#6D28D9", color: "#FFFFFF" }}>
              <SavingsOutlinedIcon />
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 800, letterSpacing: 0.6, color: "#5B21B6", lineHeight: 1 }}>RETAIN</Typography>
              <Typography sx={{ fontSize: 10, letterSpacing: 1.1, color: "#9CA3AF" }}>EXPENSE MANAGER</Typography>
            </Box>
          </Stack>
          <Stack direction="row" spacing={3} sx={{ display: { xs: "none", sm: "flex" } }}>
            {links.map((link) => (
              <Typography
                key={link.to}
                component={RouterLink}
                to={link.to}
                sx={{ textDecoration: "none", color: pathname === link.to ? "#111827" : "#6B7280", fontWeight: pathname === link.to ? 700 : 500 }}
              >
                {link.label}
              </Typography>
            ))}
          </Stack>
          <IconButton aria-label="Open menu" onClick={(event) => setMenuAnchor(event.currentTarget)} sx={{ display: { sm: "none" }, border: "1px solid #E5E7EB" }}>
            <MenuIcon />
          </IconButton>
          <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}>
            {links.map((link) => (
              <MenuItem key={link.to} component={RouterLink} to={link.to} onClick={() => setMenuAnchor(null)}>
                {link.label}
              </MenuItem>
            ))}
          </Menu>
        </Stack>

        <Box sx={{ flex: 1, display: "grid", placeItems: "center", px: 2, pb: 6 }}>
          <Box sx={{ width: "100%", maxWidth: 460, textAlign: "center" }}>
            <Typography sx={{ fontSize: { xs: 36, sm: 44 }, fontWeight: 700, lineHeight: 1.1 }}>{title}</Typography>
            <Typography sx={{ mt: 1, mb: 3, color: "#9CA3AF" }}>Home | {title}</Typography>
            <Box sx={{ bgcolor: "#F4F6FB", borderRadius: 6, px: { xs: 2.5, sm: 4 }, py: { xs: 3, sm: 4 }, textAlign: "left" }}>{children}</Box>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
