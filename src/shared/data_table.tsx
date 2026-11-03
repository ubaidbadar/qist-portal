import type { MouseEvent, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card } from '../ui';

export interface Column<T> {
  header: string;
  cell: (row: T) => ReactNode;
  /** Classes for the column's cells, e.g. "text-right". */
  className?: string;
  /** Left out of the mobile card. The first column is the card's title. */
  hideOnMobile?: boolean;
}

interface DataTableProps<T> {
  rows: T[];
  columns: Column<T>[];
  rowKey: (row: T) => string;
  /** Rows open this page when clicked. Put a link in the first column too, for keyboard users. */
  rowHref?: (row: T) => string;
  /** Shown instead of the table when there are no rows. */
  empty: ReactNode;
  hasMore?: boolean;
  loadingMore?: boolean;
  onLoadMore?: () => void;
}

/** A table on wide screens and a list of cards on phones, with "Load more" for paged lists. */
export default function DataTable<T>({ rows, columns, rowKey, rowHref, empty, hasMore, loadingMore, onLoadMore }: DataTableProps<T>) {
  const navigate = useNavigate();
  if (rows.length === 0) return <Card padding="none">{empty}</Card>;

  const [titleColumn, ...detailColumns] = columns;
  // Clicks on a link or button inside the row do their own thing.
  const openRow = (row: T) => (event: MouseEvent) => {
    if (rowHref && !(event.target as HTMLElement).closest('a, button')) navigate(rowHref(row));
  };
  const clickable = rowHref ? 'cursor-pointer transition-colors duration-150 hover:bg-canvas' : '';

  return (
    <Card padding="none" className="overflow-hidden">
      <table className="hidden w-full text-left text-sm md:table">
        <thead className="border-b border-border text-xs text-muted">
          <tr>
            {columns.map((column) => (
              <th key={column.header} scope="col" className={`px-5 py-3 font-medium ${column.className ?? ''}`}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((row) => (
            <tr key={rowKey(row)} onClick={openRow(row)} className={clickable}>
              {columns.map((column) => (
                <td key={column.header} className={`px-5 py-3 align-middle text-body ${column.className ?? ''}`}>
                  {column.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <ul className="divide-y divide-border md:hidden">
        {rows.map((row) => (
          <li key={rowKey(row)} onClick={openRow(row)} className={`space-y-2 px-4 py-3 ${clickable}`}>
            <div className="text-ink">{titleColumn.cell(row)}</div>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              {detailColumns
                .filter((column) => !column.hideOnMobile)
                .map((column) => (
                  <div key={column.header} className="min-w-0">
                    <dt className="text-xs text-muted">{column.header}</dt>
                    <dd className="truncate text-body">{column.cell(row)}</dd>
                  </div>
                ))}
            </dl>
          </li>
        ))}
      </ul>

      {hasMore && (
        <div className="border-t border-border p-3 text-center">
          <Button variant="ghost" size="sm" loading={loadingMore} onClick={onLoadMore}>
            Load more
          </Button>
        </div>
      )}
    </Card>
  );
}
