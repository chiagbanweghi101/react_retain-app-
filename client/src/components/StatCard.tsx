import { Box, Paper, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";

export function StatCard({
  label,
  value,
  hint,
  icon,
  accent = "#7C3AED",
}: {
  label: string;
  value: string;
  hint?: string;
  icon?: ReactNode;
  accent?: string;
}) {
  return (
    <Paper variant="outlined" sx={{ p: 2.5, height: "100%" }}>
      <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "flex-start", gap: 2 }}>
        <Box>
          <Typography variant="body2" color="text.secondary">
            {label}
          </Typography>
          <Typography variant="h5" sx={{ mt: 1, fontWeight: 700 }}>
            {value}
          </Typography>
          {hint ? (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {hint}
            </Typography>
          ) : null}
        </Box>
        {icon ? (
          <Box sx={{ color: accent, bgcolor: `${accent}22`, borderRadius: 2, p: 1, display: "grid" }}>{icon}</Box>
        ) : null}
      </Stack>
    </Paper>
  );
}
