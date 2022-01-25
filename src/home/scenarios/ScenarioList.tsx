import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Scenario } from '../../interface';
import { getSelectedItem, getFilters, getCurrentScenariosList, getAllScenarios } from '../../reducers';
import { getLocalDateString } from '../../utils/dateUtils';
import SearchBar from '../../components/SearchBar';
import Pagination from '../../components/Pagination';
import LoadingScreen from '../../components/LoadingScreen';
import AccessModifier from '../../components/AccessModifier';
import BasketNotification from '../../components/BasketNotification';
import '../../styles/List.css';

interface MyProps {
    searchTerm: string,
    onPageClick: (page: number) => void,
    onSearchChange: (event: object) => void,
    onSearchSubmit: (event: object) => void,
    onSorting: (ordering: string) => void,
    selectItem: (uuid: string) => void,
    updateBasketWithScenarios: (scenarios: string[]) => void
};

export default function ScenariosList (props: MyProps) {
    const { searchTerm, onPageClick, onSearchChange, onSearchSubmit, onSorting, selectItem, updateBasketWithScenarios } = props;
    const currentScenariosList = useSelector(getCurrentScenariosList);
    const allScenarios = useSelector(getAllScenarios);
    const selectedItem = useSelector(getSelectedItem);
    const page = useSelector(getFilters).page;

    const [checkedScenarios, setCheckedScenarios] = useState<string[]>([]);

    // Show loading screen if there is no data or data is being fetched
    if (!currentScenariosList || currentScenariosList.isFetching) return <LoadingScreen />;

    const { count, scenariosList } = currentScenariosList;
    const scenarios = scenariosList.map(uuid => allScenarios[uuid]);

    const onCheckboxSelect = (uuid: string) => {
        // Check if the WMS layer has already been selected or not
        const selectedUuid = checkedScenarios.find(scenarioUuid => scenarioUuid === uuid);

        // If not yet selected then add this new uuid into the basket
        if (!selectedUuid) {
            setCheckedScenarios([...checkedScenarios, uuid]);
        } else {
            //If already selected then remove this uuid from the basket
            setCheckedScenarios(checkedScenarios.filter(scenarioUuid => scenarioUuid !== uuid));
        };
    };

    const addToBasket = () => {
        // Open the notification popup
        window.location.href = '#notification';
        updateBasketWithScenarios(checkedScenarios);
        setCheckedScenarios([]);
    };

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
                        <div className="list__row list__row-box" />
                        <div className="list__row list__row-name">
                            Name
                            <i className="fa fa-sort" onClick={() => onSorting('name')} />
                        </div>
                        <div className="list__row list__row-name">
                            Model name
                            <i className="fa fa-sort" onClick={() => onSorting('model_name')} />
                        </div>
                        <div className="list__row list__row-name">
                            Username
                            <i className="fa fa-sort" onClick={() => onSorting('username')} />
                        </div>
                        <div className="list__row list__row-org">
                            Organisation (owner)
                            <i className="fa fa-sort" onClick={() => onSorting('organisation__name')} />
                        </div>
                        <div className="list__row list__row-time">
                            Last update
                            <i className="fa fa-sort" onClick={() => onSorting('last_modified')} />
                        </div>
                        <div className="list__row list__row-access" />
                    </li>
                    {scenarios.map((scenario: Scenario) => {
                        const checked = !!checkedScenarios.find(uuid => uuid === scenario.uuid);
                        return (
                            <li
                                className={selectedItem === scenario.uuid ? "list__row-li list__row-li-selected" : "list__row-li"}
                                key={scenario.uuid}
                                onClick={() => selectItem(scenario.uuid)}
                            >
                                <input className="list__row list__row-normal list__row-box" type="checkbox" onChange={() => onCheckboxSelect(scenario.uuid)} checked={checked} />
                                <div className="list__row list__row-normal list__row-name" title={scenario.name}>{scenario.name}</div>
                                <div className="list__row list__row-normal list__row-name" title={scenario.model_name}>{scenario.model_name}</div>
                                <div className="list__row list__row-normal list__row-name" title={scenario.username}>{scenario.username}</div>
                                <div className="list__row list__row-normal list__row-org" title={scenario.organisation && scenario.organisation.name}>{scenario.organisation && scenario.organisation.name}</div>
                                <div className="list__row list__row-normal list__row-time" title={scenario.last_modified}>{getLocalDateString(scenario.last_modified)}</div>
                                <div className="list__row list__row-normal list__row-access">
                                    <AccessModifier accessModifier={scenario.access_modifier} />
                                </div>
                            </li>
                        )
                    })}
                </ul>
            </div>
            <div className="list__footer">
                <Pagination
                    count={count}
                    page={page}
                    onPageClick={onPageClick}
                />
                <button
                    className="list__button-basket"
                    disabled={checkedScenarios.length === 0 ? true : false}
                    onClick={addToBasket}
                >
                    ADD TO BASKET
                </button>
            </div>
            {/* Notification popup when click on the Add to Basket button */}
            <div className="modal" id="notification">
                <BasketNotification />
            </div>
        </div>
    )
}