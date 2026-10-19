import { Box, CircularProgress } from "@mui/material";

export function FullPageSpinner() {
  return (
    <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
      <CircularProgress />
    </Box>
  );
}
