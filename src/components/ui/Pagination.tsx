export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: Readonly<{
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}>) {
  if (totalPages <= 1) {
    return null;
  }

  const range = (start: number, stop: number, step: number = 1) => {
    return Array.from(
      { length: Math.ceil((stop - start) / step) },
      (_, i) => start + i * step
    );
  };

  const getPagesCut = (
    totalPages: number,
    pagesCutCount: number,
    currentPage: number
  ) => {
    const ceiling = Math.ceil(pagesCutCount / 2);
    const floor = Math.floor(pagesCutCount / 2);

    if (totalPages < pagesCutCount) {
      return { start: 1, stop: totalPages + 1 };
    } else if (currentPage >= 1 && currentPage <= ceiling) {
      return { start: 1, stop: pagesCutCount + 1 };
    } else if (currentPage + floor >= totalPages) {
      return { start: totalPages - pagesCutCount + 1, stop: totalPages + 1 };
    } else {
      return {
        start: currentPage - ceiling + 1,
        stop: currentPage + floor + 1,
      };
    }
  };

  const pagesCut = getPagesCut(totalPages, 5, currentPage);
  const pageNumbers: number[] = range(pagesCut.start, pagesCut.stop);
  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;

  return (
    <div className="mt-8 flex justify-center">
      <nav className="inline-flex rounded-md shadow-xl">
        <button
          className={
            isFirstPage
              ? "rounded-l-md bg-gray-600 px-3 py-2 text-sm font-semibold text-white"
              : "rounded-l-md bg-gray-300 px-3 py-2 text-sm font-semibold text-slate-600"
          }
          onClick={() => onPageChange(currentPage - 1)}
          disabled={isFirstPage}
        >
          Prev
        </button>

        {pageNumbers.map((pageNumber, index) => (
          <button
            key={index}
            className={
              pageNumber === currentPage
                ? "bg-gray-600 px-3 py-2 text-sm font-semibold text-white"
                : "bg-gray-300 px-3 py-2 text-sm font-semibold text-slate-600"
            }
            onClick={() => onPageChange(pageNumber)}
          >
            {pageNumber}
          </button>
        ))}

        <button
          className={
            isLastPage
              ? "rounded-r-md bg-gray-600 px-3 py-2 text-sm font-semibold text-white"
              : "rounded-r-md bg-gray-300 px-3 py-2 text-sm font-semibold text-slate-600"
          }
          onClick={() => onPageChange(currentPage + 1)}
          disabled={isLastPage}
        >
          Next
        </button>
      </nav>
    </div>
  );
}
