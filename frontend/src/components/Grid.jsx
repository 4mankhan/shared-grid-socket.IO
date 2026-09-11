"use client";

import { useCallback, useMemo } from "react";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";
import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import Cell from "./Cell";

export default function Grid({
  rows,
  columns,
  cells,
  recentlyUpdated,
  currentUsername,
  onClaim,
  claimDisabled,
}) {
  const cellMap = useMemo(() => {
    const map = new Map();

    cells.forEach((cell) => {
      map.set(`${cell.row}-${cell.column}`, cell);
    });

    return map;
  }, [cells]);

  const gridCells = useMemo(() => {
    const items = [];

    for (let row = 0; row < rows; row += 1) {
      for (let column = 0; column < columns; column += 1) {
        const key = `${row}-${column}`;
        const cell = cellMap.get(key) || {
          row,
          column,
          owner: null,
          color: null,
        };

        items.push(cell);
      }
    }

    return items;
  }, [rows, columns, cellMap]);

  const handleClaim = useCallback(
    (row, column) => {
      onClaim(row, column);
    },
    [onClaim]
  );

  return (
    <div className="glass-card overflow-hidden p-3 sm:p-4">
      <TransformWrapper
        initialScale={1}
        minScale={0.4}
        maxScale={4}
        centerOnInit
        wheel={{ step: 0.08 }}
        doubleClick={{ disabled: true }}
      >
        {({ zoomIn, zoomOut, resetTransform }) => (
          <>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm text-zinc-400">
                {rows} × {columns} grid • scroll to zoom • drag to pan
              </p>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => zoomOut()}
                  className="icon-button"
                  aria-label="Zoom out"
                >
                  <ZoomOut className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => zoomIn()}
                  className="icon-button"
                  aria-label="Zoom in"
                >
                  <ZoomIn className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => resetTransform()}
                  className="icon-button"
                  aria-label="Reset view"
                >
                  <Maximize2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="max-h-[62vh] overflow-hidden rounded-xl border border-white/10 bg-zinc-950/60">
              <TransformComponent
                wrapperClass="!w-full !h-full"
                contentClass="!w-full !h-full"
              >
                <div
                  className="grid gap-[2px] p-2"
                  style={{
                    gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                    width: `${columns * 14}px`,
                  }}
                >
                  {gridCells.map((cell) => {
                    const key = `${cell.row}-${cell.column}`;

                    return (
                      <div key={key} className="h-[12px] w-[12px]">
                        <Cell
                          row={cell.row}
                          column={cell.column}
                          owner={cell.owner}
                          color={cell.color}
                          isRecentlyUpdated={recentlyUpdated.has(key)}
                          isOwnedByCurrentUser={cell.owner === currentUsername}
                          onClaim={handleClaim}
                          disabled={claimDisabled}
                        />
                      </div>
                    );
                  })}
                </div>
              </TransformComponent>
            </div>
          </>
        )}
      </TransformWrapper>
    </div>
  );
}
