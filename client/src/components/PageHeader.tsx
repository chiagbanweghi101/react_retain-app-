import { Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <Stack direction={{ xs: "column", sm: "row" }} sx={{ justifyContent: "space-between", alignItems: { sm: "center" }, gap: 2, mb: 3 }}>
      <Boxless title={title} subtitle={subtitle} />
      {action}
    </Stack>
  );
}

function Boxless({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div>
      <Typography variant="h4" sx={{ fontWeight: 700 }}>
        {title}
      </Typography>
      {subtitle ? <Typography color="text.secondary">{subtitle}</Typography> : null}
    </div>
  );
}
