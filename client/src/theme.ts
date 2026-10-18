import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#7C3AED" },
    background: { default: "#0E1016", paper: "#171A22" },
    divider: "#2A2E3A",
    text: { primary: "#F4F4F5", secondary: "#A1A1AA" },
    success: { main: "#22C55E" },
    warning: { main: "#F59E0B" },
    error: { main: "#F43F5E" },
  },
  typography: { fontFamily: '"DM Sans", sans-serif' },
  shape: { borderRadius: 12 },
});
