import CustomTypography from "../../Common/Typography";

// TSX for colum heading
const ColumnHeading = (props: { text: string; className?: string }) => (
  <div className={props.className} style={{ marginBottom: 8 }}>
    <CustomTypography variant="label">{props.text}</CustomTypography>
  </div>
);

export default ColumnHeading;
