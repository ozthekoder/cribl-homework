import styled from "@emotion/styled";

export interface ColumnProps {
  width?: string;
}

export const Column = styled.div<ColumnProps>((props) => ({
  display: "flex",
  flexDirection: "column",
  justifyContent: "flex-start",
  width: props.width || "100%",
  height: "100%",
  overflow: "hidden",
}));

export default Column;
