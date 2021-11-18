import React, { useState } from 'react';
import { ObservationType, Organisation, Layercollection } from './../interface';
import SearchBar from './SearchBar';
import './../styles/FilterOption.css';

interface MyProps {
    filterOption: "observationType" | "organisation" | "layercollection",
    listOfItems: (ObservationType | Organisation | Layercollection)[],
    filterValue: string,
    selectItem: (value: string) => void,
    removeItem: () => void,
};

// Helper function to get input value
const getItemValue = (item: ObservationType | Organisation | Layercollection, filterOption: MyProps['filterOption']) => {
    if (filterOption === "observationType") {
        return (item as ObservationType).parameter;
    } else if (filterOption === "organisation") {
        return (item as Organisation).name;
    } else { // filterOption === "layercollection"
        return (item as Layercollection).slug;
    };
};

const FilterOption: React.FC<MyProps> = (props) => {
    const {
        filterOption,
        listOfItems,
        filterValue,
        selectItem,
        removeItem,
    } = props;

    const [searchInput, setSearchInput] = useState('');
    const [numberOfItems, setNumberOfItems] = useState(4);
    const [showList, setShowList] = useState(
        // First filter option (organisation) is open by default
        filterOption === 'organisation' ? true : false
    );

    // Filter items using search input
    const filteredListOfItems = listOfItems.filter(item => {
        if (filterOption === "observationType") {
            return (item as ObservationType).parameter.toLowerCase().includes(searchInput.toLowerCase());
        } else if (filterOption === "organisation") {
            return (item as Organisation).name.toLowerCase().includes(searchInput.toLowerCase());
        } else { // filterOption === "layercollection"
            return (item as Layercollection).slug.toLowerCase().includes(searchInput.toLowerCase());
        };
    });

    let title: string;
    if (filterOption === "observationType") {
        title = "Observation Type";
    } else if (filterOption === "organisation") {
        title = "Organisation (owner)";
    } else { // filterOption = "layercollection"
        title = "Layer Collection";
    };

    return (
        <div
            className="filter-option"
            style={{
                display: listOfItems.length === 0 ? "none" : ""
            }}
        >
            <div className="filter-title">
                <h4 title={title}>{title}</h4>
                {showList ? (
                    <button onClick={() => setShowList(false)}>
                        <i className="fa fa-minus" />
                    </button>
                ) : (
                    <button onClick={() => setShowList(true)}>
                        <i className="fa fa-plus" />
                    </button>
                )}
            </div>
            <div
                className="filter-content"
                style={{
                    display: showList ? undefined : "none"
                }}
            >
                <SearchBar
                    name="filterSearchBar"
                    searchTerm={searchInput}
                    title=""
                    placeholder="search"
                    onSearchSubmit={e => e.preventDefault()}
                    onSearchChange={e => setSearchInput(e.currentTarget.value)}
                />
                {filterValue ? (
                    <div className="filter-checked-item">
                        <button onClick={removeItem}>x</button>
                        {filterValue}
                    </div>
                ) : (
                    <div className="filter-checked-item" />
                )}
                <ul className="filter-list" id="scrollbar">
                    {filteredListOfItems.slice(0, numberOfItems).map((item, i) => (
                        <li className="filter-item" key={i}>
                            <input
                                type="radio"
                                className="filter-radiobutton"
                                onChange={() => selectItem(getItemValue(item, filterOption))}
                                checked={filterValue === getItemValue(item, filterOption)}
                            />
                            <label className="filter-item-name">{getItemValue(item, filterOption)}</label>
                        </li>
                    ))}
                    {numberOfItems < filteredListOfItems.length ? (
                        <button className="filter-list-button" onClick={() => setNumberOfItems(numberOfItems + 4)}>[+] {filteredListOfItems.length - numberOfItems} more</button>
                    ) : null}
                </ul>
            </div>
        </div>
    )
};

export default FilterOption;