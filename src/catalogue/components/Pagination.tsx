import * as React from 'react';
import '../styles/Pagination.css';

interface MyProps {
    count: number,
    page: number,
    paginatedPages: number[],
    totalPages: number,
    onPageClick: (page: number) => void,
};

export default class Pagination extends React.Component<MyProps> {
    render() {
        const { count, page, paginatedPages, totalPages, onPageClick } = this.props;
        return (
            <div
                className="pagination"
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
                <div className="pagination-pages">
                    {paginatedPages.map(pageNumber => {
                        if (pageNumber > 0 && pageNumber <= totalPages) {
                            return (
                                <span
                                    key={pageNumber}
                                    onClick={() => pageNumber !== page ? onPageClick(pageNumber) : null}
                                    className={pageNumber === page
                                        ? "pagination-current-page"
                                        : "pagination-page"
                                    }
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
        );
    };
};