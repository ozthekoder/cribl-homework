import styled from "@emotion/styled";

export interface RowProps {
  height?: string;
}

export const Row = styled.div<RowProps>((props) => ({
  display: "flex",
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "flex-start",
  height: props.height || "100%",
  width: "100%",
  overflow: "hidden",
}));

export default Row;
