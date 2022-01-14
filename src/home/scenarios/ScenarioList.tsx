import React from 'react';
import MDSpinner from "react-md-spinner";
import { useSelector } from 'react-redux';
import { Scenario } from '../../interface';
import { getSelectedItem, getFilters, getCurrentScenariosList, getAllScenarios } from '../../reducers';
import SearchBar from '../../components/SearchBar';
import Pagination from '../../components/Pagination';
import '../../styles/List.css';

interface MyProps {
    searchTerm: string,
    onPageClick: (page: number) => void,
    onSearchChange: (event: object) => void,
    onSearchSubmit: (event: object) => void,
    onSorting: (ordering: string) => void,
    selectItem: (uuid: string) => void
};

const LoadingScreen = () => (
    <div className="list loading-screen"><MDSpinner size={50} /></div>
);

const ScenariosList = (props: MyProps) => {
    const { searchTerm, onPageClick, onSearchChange, onSearchSubmit, onSorting, selectItem } = props;
    const currentScenariosList = useSelector(getCurrentScenariosList);
    const allScenarios = useSelector(getAllScenarios);
    const selectedItem = useSelector(getSelectedItem);
    const page = useSelector(getFilters).page;

    // Show loading screen if there is no data or data is being fetched
    if (!currentScenariosList || currentScenariosList.isFetching) return <LoadingScreen />;

    const { count, scenariosList } = currentScenariosList;
    const scenarios = scenariosList.map(uuid => allScenarios[uuid]);

    return (
        <div className="list">
            <div className="list__top">
                <SearchBar
                    name="searchBar"
                    searchTerm={searchTerm}
                    title="Type name or UUID"
                    placeholder="Search for data in Lizard"
                    onSearchSubmit={onSearchSubmit}
                    onSearchChange={onSearchChange}
                />
                <div className="list__length">{count} scenarios</div>
            </div>
            <div className="list__content">
                <ul className="list__list">
                    <li className="list__row-header">
                        <div className="list__row list__row-name">
                            Name
                            <i className="fa fa-sort" onClick={() => onSorting('name')} />
                        </div>
                        <div className="list__row list__row-org">
                            Organisation (owner)
                            <i className="fa fa-sort" onClick={() => onSorting('organisation__name')} />
                        </div>
                        <div className="list__row list__row-raster-description">
                            Created
                            <i className="fa fa-sort" onClick={() => onSorting('created')} />
                        </div>
                        <div className="list__row list__row-access" />
                    </li>
                    {scenarios.map((scenario: Scenario) => {
                        const renderAccessModifier = () => {
                            if (scenario.access_modifier === "Public" || scenario.access_modifier === "Publiek") {
                                return <div className="access-modifier public">{scenario.access_modifier.toUpperCase()}</div>
                            } else if (scenario.access_modifier === "Private" || scenario.access_modifier === "Privaat") {
                                return <div className="access-modifier private">{scenario.access_modifier.toUpperCase()}</div>
                            } else {
                                return <div className="access-modifier common">{scenario.access_modifier.toUpperCase()}</div>
                            }
                        }

                        return (
                            <li
                                className={selectedItem === scenario.uuid ? "list__row-li list__row-li-selected" : "list__row-li"}
                                key={scenario.uuid}
                                onClick={() => selectItem(scenario.uuid)}
                            >
                                <div className="list__row list__row-normal list__row-name" title={scenario.name}>{scenario.name}</div>
                                <div className="list__row list__row-normal list__row-org" title={scenario.organisation && scenario.organisation.name}>{scenario.organisation && scenario.organisation.name}</div>
                                <div className="list__row list__row-normal list__row-raster-description" title={scenario.created}>{scenario.created}</div>
                                <div className="list__row list__row-normal list__row-access">{renderAccessModifier()}</div>
                            </li>
                        )
                    })}
                </ul>
            </div>
            <div className="list__footer">
                <Pagination
                    count={count}
                    page={page}
                    paginatedPages={[page - 2, page - 1, page, page + 1, page + 2]}
                    totalPages={Math.ceil(count / 10)}
                    onPageClick={onPageClick}
                />
            </div>
        </div>
    )
};

export default ScenariosList;