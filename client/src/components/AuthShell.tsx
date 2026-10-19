import SavingsOutlinedIcon from "@mui/icons-material/SavingsOutlined";
import { Box, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";

const points = ["Monthly budget", "Spending by category", "Your own expenses"];

export function AuthShell({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <Box
      sx={{
        minHeight: "100dvh",
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "240px 1fr", lg: "300px 1fr" },
        background: "#0E1016",
      }}
    >
      <Box
        sx={{
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          justifyContent: "space-between",
          p: { md: 3, lg: 4 },
          background: "radial-gradient(circle at 20% 20%, #6D28D9 0%, #3B0764 42%, #120818 100%)",
          color: "#F4F4F5",
        }}
      >
        <Stack direction="row" spacing={1.25} sx={{ alignItems: "center" }}>
          <Box sx={{ width: 40, height: 40, borderRadius: 2, display: "grid", placeItems: "center", bgcolor: "rgba(255,255,255,0.14)" }}>
            <SavingsOutlinedIcon />
          </Box>
          <Typography sx={{ fontWeight: 800, letterSpacing: 0.4 }}>Retain</Typography>
        </Stack>
        <Box>
          <Typography sx={{ fontSize: { md: 28, lg: 32 }, fontWeight: 800, lineHeight: 1.15 }}>
            See where the month goes.
          </Typography>
          <Typography variant="body2" sx={{ mt: 1.5, color: "rgba(244,244,245,0.78)" }}>
            Track spending, set a budget, and keep each month in one place.
          </Typography>
          <Stack spacing={1} sx={{ mt: 3 }}>
            {points.map((point) => (
              <Typography key={point} sx={{ color: "rgba(244,244,245,0.9)" }}>
                {point}
              </Typography>
            ))}
          </Stack>
        </Box>
        <Typography variant="body2" sx={{ color: "rgba(244,244,245,0.55)" }}>
          Amounts in South African rand.
        </Typography>
      </Box>

      <Box sx={{ display: "grid", alignItems: "center", minWidth: 0, px: { xs: 2, sm: 4 }, py: { xs: 3, sm: 5 } }}>
        <Box sx={{ width: "100%", maxWidth: 440, mx: "auto" }}>
          <Stack direction="row" spacing={1.25} sx={{ alignItems: "center", mb: 3, display: { md: "none" } }}>
            <Box sx={{ width: 36, height: 36, borderRadius: 2, display: "grid", placeItems: "center", bgcolor: "primary.main" }}>
              <SavingsOutlinedIcon fontSize="small" />
            </Box>
            <Typography sx={{ fontWeight: 800 }}>Retain</Typography>
          </Stack>
          <Typography variant="h4" sx={{ fontWeight: 800, fontSize: { xs: 30, sm: 34 } }}>
            {title}
          </Typography>
          {subtitle ? (
            <Typography color="text.secondary" sx={{ mt: 1, mb: 3 }}>
              {subtitle}
            </Typography>
          ) : (
            <Box sx={{ mb: 3 }} />
          )}
          {children}
        </Box>
      </Box>
    </Box>
  );
}
