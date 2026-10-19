import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { IconButton, Stack, Typography } from "@mui/material";
import { monthLabel } from "../format.ts";

export function MonthSwitcher({
  year,
  month,
  onChange,
}: {
  year: number;
  month: number;
  onChange: (next: { year: number; month: number }) => void;
}) {
  function shift(delta: number) {
    const date = new Date(year, month - 1 + delta, 1);
    onChange({ year: date.getFullYear(), month: date.getMonth() + 1 });
  }

  return (
    <Stack direction="row" sx={{ alignItems: "center" }}>
      <IconButton aria-label="Previous month" onClick={() => shift(-1)}>
        <ChevronLeftIcon />
      </IconButton>
      <Typography sx={{ minWidth: 150, textAlign: "center", fontWeight: 600 }}>{monthLabel(year, month)}</Typography>
      <IconButton aria-label="Next month" onClick={() => shift(1)}>
        <ChevronRightIcon />
      </IconButton>
    </Stack>
  );
}
