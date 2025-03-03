import styled from "@emotion/styled";
import { memo } from "react";
import { Log } from "../../utils/types";
import { Container } from "../Container";
import VirtualizedList from "../VirtualizedList";

export interface LogsTableProps {
  rows: Log[];
  columns: (keyof Log)[];
  height?: number;
  rowHeight?: number;
}

interface TdProps {
  width: string;
}

const TableHeader = styled.div({
  height: "32px",
  width: "100%",
  display: "flex",
  position: "sticky",
  top: 0,
  backgroundColor: "#f2f2f2",
  zIndex: 10,
});

const Th = styled.div<TdProps>((props) => ({
  width: props.width,
  borderTop: "1px solid rgb(224, 224, 224)",
  borderBottom: "1px solid rgb(224, 224, 224)",
  backgroundColor: "#f2f2f2",
  padding: "6px",
  textAlign: "left",
  fontWeight: "bold",
  display: "flex",
  alignItems: "center",
}));

const Tr = styled.div<{ height: number; isEven: boolean }>((props) => ({
  display: "flex",
  borderBottom: "1px solid rgb(224, 224, 224)",
  backgroundColor: props.isEven ? "#f2f2f2" : "#f9f9f9",
  cursor: "pointer",
  height: `${props.height}px`,
}));

const Td = styled.div<TdProps>((props) => ({
  width: props.width,
  paddingLeft: "6px",
  paddingRight: "6px",
  overflow: "hidden",
  display: "flex",
  alignItems: "center",
  borderTop: "1px solid rgb(224, 224, 224)",
  borderBottom: "1px solid rgb(224, 224, 224)",
  borderCollapse: "collapse",
}));

const TdInside = styled.div({
  width: "100%",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

const TrExpanded = styled.div<{ height: number; isEven: boolean }>((props) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  borderBottom: "1px solid rgb(224, 224, 224)",
  backgroundColor: props.isEven ? "#f2f2f2" : "#f9f9f9",
  cursor: "pointer",
  height: `${props.height}px`,
}));

const TdExpandedInside = styled.pre({
  width: "100%",
  backgroundColor: "#fff",
  fontSize: "12px",
  lineHeight: "16px",
  margin: 0,
  paddingTop: "8px",
  paddingBottom: "8px",
});

const Caret = styled.div<{ expanded: boolean }>((props) => ({
  width: "32px",
  height: "32px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "16px",
  color: "rgb(128, 128, 128)",
  transform: props.expanded ? "rotate(90deg)" : "rotate(0deg)",
  transition: "transform 0.2s ease",
}));

const TableRow = memo(
  <T,>({
    index,
    data,
    columns,
    rowHeight,
    expanded = false,
  }: {
    index: number;
    data: T;
    columns: (keyof T)[];
    rowHeight: number;
    expanded: boolean;
  }) => {
    const row = data;
    if (expanded) {
      return (
        <TrExpanded
          role="row"
          isEven={index % 2 === 0}
          height={rowHeight}
          data-index={index}
          data-expanded={expanded}
        >
          {columns.map((column, i) => (
            <Td key={String(column)} width={"100%"}>
              {i === 0 && <Caret expanded={true}>&#x276F;</Caret>}

              {i === 0 ? (
                <TdInside>{String(row[column])}</TdInside>
              ) : (
                <TdExpandedInside>
                  {JSON.stringify(JSON.parse(String(row[column])), null, 2)}
                </TdExpandedInside>
              )}
            </Td>
          ))}
        </TrExpanded>
      );
    }
    return (
      <Tr
        role="row"
        height={rowHeight}
        isEven={index % 2 === 0}
        data-index={index}
        data-expanded={expanded}
      >
        {columns.map((column, i) => (
          <Td
            key={String(column)}
            width={i === 0 ? "200px" : "calc(100% - 200px)"}
          >
            {i === 0 && <Caret expanded={false}>&#x276F;</Caret>}
            <TdInside>{String(row[column])}</TdInside>
          </Td>
        ))}
      </Tr>
    );
  },
) as any;

export function LogsTable({
  rows,
  columns,
  height = 500,
  rowHeight = 32,
}: LogsTableProps) {
  return (
    <Container role="table">
      <TableHeader>
        {columns.map((column, i) => (
          <Th
            key={String(column)}
            width={i === 0 ? "200px" : "calc(100% - 200px)"}
          >
            {String(column)}
          </Th>
        ))}
      </TableHeader>
      <VirtualizedList
        height={height}
        itemCount={rows.length}
        itemSize={rowHeight}
        itemData={rows}
      >
        {({ index, data, rowHeight, expanded }) => (
          <TableRow
            key={index}
            index={index}
            expanded={expanded}
            data={data}
            columns={columns}
            rowHeight={rowHeight}
          />
        )}
      </VirtualizedList>
    </Container>
  );
}

export default LogsTable;
