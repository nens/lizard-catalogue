import * as React from 'react';
import '../styles/SearchBar.css';

interface MyProps {
    name: "searchBar" | "filterSearchBar",
    searchTerm: string,
    title: string,
    placeholder: string,
    onSearchChange: (e: React.FormEvent<HTMLInputElement>) => void,
    onSearchSubmit: (e: React.FormEvent<HTMLFormElement>) => void,
};

export default class SearchBar extends React.Component<MyProps> {
    
    render() {
        const { name, searchTerm, title, placeholder, onSearchSubmit, onSearchChange } = this.props;

        return (
            <form onSubmit={onSearchSubmit} className="searchbar" title={title}>
                <input
                    type="text"
                    className={name === "filterSearchBar" ? "searchbar-input searchbar-input-filter" : "searchbar-input"}
                    placeholder={placeholder}
                    onChange={onSearchChange}
                    value={searchTerm}
                />
                <button className="searchbar-button" type="submit">
                    <svg className="searchbar-icon">
                        <use xlinkHref="image/symbols.svg#icon-search" />
                    </svg>
                </button>
            </form>
        );
    };
};