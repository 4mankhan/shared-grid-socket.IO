import Cell from "../models/Cell.js";

export const getGridDimensions = () => ({
  rows: parseInt(process.env.GRID_ROWS || "50", 10),
  columns: parseInt(process.env.GRID_COLUMNS || "50", 10),
});

export const initializeGrid = async () => {
  const { rows, columns } = getGridDimensions();
  const existingCount = await Cell.countDocuments();

  if (existingCount >= rows * columns) {
    return;
  }

  const cells = [];

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      cells.push({ row, column, owner: null, color: null });
    }
  }

  await Cell.bulkWrite(
    cells.map((cell) => ({
      updateOne: {
        filter: { row: cell.row, column: cell.column },
        update: { $setOnInsert: cell },
        upsert: true,
      },
    })),
    { ordered: false }
  );

  console.log(`Grid initialized: ${rows}x${columns} (${rows * columns} cells)`);
};
