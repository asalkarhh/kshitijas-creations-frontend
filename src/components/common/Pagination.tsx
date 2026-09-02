import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination = ({ currentPage, totalPages, onPageChange }: PaginationProps) => (
  <nav aria-label="Product pages" className="flex items-center justify-center gap-2">
    <button
      aria-label="Previous page"
      className="page-button"
      disabled={currentPage <= 1}
      onClick={() => onPageChange(currentPage - 1)}
      type="button"
    >
      <ChevronLeft aria-hidden="true" className="size-4" />
    </button>
    {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
      <button
        aria-current={page === currentPage ? 'page' : undefined}
        aria-label={`Page ${page}`}
        className={`page-button ${page === currentPage ? 'bg-maroon text-white' : ''}`}
        key={page}
        onClick={() => onPageChange(page)}
        type="button"
      >
        {page}
      </button>
    ))}
    <button
      aria-label="Next page"
      className="page-button"
      disabled={currentPage >= totalPages}
      onClick={() => onPageChange(currentPage + 1)}
      type="button"
    >
      <ChevronRight aria-hidden="true" className="size-4" />
    </button>
  </nav>
);
