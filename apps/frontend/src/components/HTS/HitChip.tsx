import { Box } from "@mui/material";
import clsx from 'clsx';
import { makeStyles } from "@mui/styles";
import CustomTypography from "../Common/Typography";

type HitChipProps  = {
  className?: string
}

const useStyles = makeStyles({
  container: {
    width: 34,
    height: 24,
    backgroundColor: "#EBDCFA",
    borderRadius: 4,
  },
  text: {
    fontSize: 13,
    fontWeight: 500,
    color: "#7F3CBD",
  },
});

const HitChip = ({ className  }: HitChipProps) => {
  const classes = useStyles();
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      className={clsx(classes.container, className)}
    >
      <CustomTypography className={classes.text}>HIT</CustomTypography>
    </Box>
  );
};

export default HitChip;
