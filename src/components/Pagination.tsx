import styles from './Pagination.module.css';

interface MyProps {
    count: number,
    page: number,
    onPageClick: (page: number) => void,
};

export default function Pagination (props: MyProps) {
    const { count, page, onPageClick } = props;
    const totalPages = Math.ceil(count / 10);
    const paginatedPages = [page - 2, page - 1, page, page + 1, page + 2];

    return (
        <div
            className={styles.Pagination}
            style={{
                visibility: count === 0 ? "hidden" : "visible"
            }}
        >
            <button
                onClick={() => onPageClick(page - 1)}
                disabled={page > 1 ? false : true}
            >
                &lsaquo;
            </button>
            <div className={styles.PaginationPages}>
                {paginatedPages.map(pageNumber => {
                    if (pageNumber > 0 && pageNumber <= totalPages) {
                        return (
                            <span
                                key={pageNumber}
                                onClick={() => pageNumber !== page ? onPageClick(pageNumber) : null}
                                className={pageNumber === page ? styles.PaginationCurrentPage : styles.PaginationPage}
                            >
                                {pageNumber}
                            </span>
                        )
                    }
                    return null;
                })}
            </div>
            <button
                onClick={() => onPageClick(page + 1)}
                disabled={page < totalPages ? false : true}
            >
                &rsaquo;
            </button>
        </div>
    )
}