import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#6D28D9" },
    secondary: { main: "#8BC34A" },
    background: { default: "#F4F6FB", paper: "#FFFFFF" },
    divider: "#E6E8EF",
    text: { primary: "#1F2937", secondary: "#6B7280" },
    success: { main: "#22C55E" },
    warning: { main: "#F59E0B" },
    error: { main: "#F43F5E" },
  },
  typography: { fontFamily: '"DM Sans", sans-serif' },
  shape: { borderRadius: 16 },
  components: {
    MuiPaper: {
      styleOverrides: {
        outlined: {
          borderColor: "#E8ECF3",
          boxShadow: "0 8px 24px rgba(31, 41, 55, 0.04)",
        },
      },
    },
  },
});
