import searchIcon from './../images/search.svg';
import styles from './SearchBar.module.css';

interface MyProps {
    name: "searchBar" | "filterSearchBar",
    searchTerm: string,
    title: string,
    placeholder: string,
    onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
    onSearchSubmit: (e: React.FormEvent<HTMLFormElement>) => void,
};

export default function SearchBar (props: MyProps) {
    const { name, searchTerm, title, placeholder, onSearchSubmit, onSearchChange } = props;

    return (
        <form
            className={styles.SearchBar}
            title={title}
            onSubmit={onSearchSubmit}
        >
            <input
                type="text"
                className={name === "filterSearchBar" ? `${styles.SearchBarInput} ${styles.SearchBarInputFilter}` : styles.SearchBarInput}
                placeholder={placeholder}
                onChange={onSearchChange}
                value={searchTerm}
            />
            <button className={styles.SearchBarButton} type="submit">
                <img src={searchIcon} alt="user" className={name === "filterSearchBar" ? `${styles.SearchBarIcon} ${styles.SearchBarIconFilter}` : styles.SearchBarIcon} />
            </button>
        </form>
    )
}