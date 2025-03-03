import styled from "@emotion/styled";
import { MouseEventHandler, useState, useRef, useEffect, JSX } from "react";
import { Log } from "../../utils/types";
import { getJsonLineCount } from "../../utils/functions";
import { Container } from "../Container";

export interface LogsTableProps {
  rows: Log[];
  columns: (keyof Log)[];
  height?: number;
  rowHeight?: number;
}

const VirtualizedContainer = styled.div<{ totalHeight: number }>((props) => ({
  height: `${props.totalHeight}px`,
  position: "relative",
}));

const VirtualizedRows = styled.div<{ translateY: number }>((props) => ({
  transform: `translateY(${props.translateY}px)`,
  position: "absolute",
  width: "100%",
}));

export const VirtualizedList = ({
  height,
  itemCount,
  itemSize,
  itemData,
  children,
}: {
  height: number;
  itemCount: number;
  itemSize: number;
  itemData: Log[];
  children: ({
    key,
    index,
    data,
    expanded,
    rowHeight,
  }: {
    key: number | string;
    index: number;
    data: Log;
    expanded: boolean;
    rowHeight: number;
  }) => JSX.Element;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [startIndex, setStartIndex] = useState(0);
  const [expandedRows, setExpandedRows] = useState<Map<number, number>>(
    new Map(),
  );

  const totalHeight = Array.from({ length: itemCount }).reduce(
    (acc: number, _, index) => {
      return acc + itemSize + (expandedRows.get(index) || 0);
    },
    0,
  );

  const computeTranslateY = (index: number): number => {
    let offset = 0;
    for (let i = 0; i < index; i++) {
      offset += itemSize + (expandedRows.get(i) || 0);
    }
    return offset;
  };

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const scrollTop = containerRef.current.scrollTop;

      let currentHeight = 0;
      let newIndex = 0;

      for (let i = 0; i < itemCount; i++) {
        currentHeight += itemSize + (expandedRows.get(i) || 0);
        if (currentHeight > scrollTop) {
          newIndex = i;
          break;
        }
      }

      setStartIndex(newIndex);
    };

    const ref = containerRef.current;
    ref?.addEventListener("scroll", handleScroll);
    return () => ref?.removeEventListener("scroll", handleScroll);
  }, [itemSize, expandedRows, itemCount]);

  const endIndex = Math.min(
    startIndex + Math.ceil(height / itemSize) + 5,
    itemCount,
  );

  const onClick: MouseEventHandler<HTMLDivElement> = (e: any) => {
    if (e.target.closest("[data-index]")) {
      const index = Number(e.target.closest("[data-index]").dataset.index);
      setExpandedRows((prev) => {
        const newMap = new Map(prev);
        if (newMap.has(index)) {
          newMap.delete(index);
        } else {
          const jsonLines = getJsonLineCount(JSON.parse(itemData[index].Event));
          newMap.set(index, jsonLines * 16 + 16);
        }
        return newMap;
      });
    }
  };

  const ChildRow = children;

  return (
    <Container
      ref={containerRef}
      style={{ height }}
      data-testid="virtualized-container"
    >
      <VirtualizedContainer totalHeight={totalHeight}>
        <VirtualizedRows
          data-testid="virtualized-rows"
          translateY={computeTranslateY(startIndex)}
          onClick={onClick}
        >
          {itemData.slice(startIndex, endIndex).map((_, index) => {
            const rowIndex = startIndex + index;
            const expandedHeight = expandedRows.get(rowIndex) || 0;
            return (
              <ChildRow
                key={rowIndex}
                index={rowIndex}
                expanded={expandedRows.has(rowIndex)}
                data={itemData[rowIndex]}
                rowHeight={itemSize + expandedHeight}
              />
            );
          })}
        </VirtualizedRows>
      </VirtualizedContainer>
    </Container>
  );
};

export default VirtualizedList;
