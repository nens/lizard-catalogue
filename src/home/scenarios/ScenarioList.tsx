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
import styles from '../../styles/List.module.css';

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
        <div className={styles.List}>
            <div className={styles.ListTop}>
                <SearchBar
                    name="searchBar"
                    searchTerm={searchTerm}
                    title="Type name or UUID"
                    placeholder="Search for data in Lizard"
                    onSearchSubmit={onSearchSubmit}
                    onSearchChange={onSearchChange}
                />
                <div className={styles.ListLength}>{count} scenarios</div>
            </div>
            <div className={styles.ListContent}>
                <ul className={styles.ListMainList}>
                    <li className={styles.ListRowHeader}>
                        <div className={`${styles.ListRow} ${styles.ListRowBox}`} />
                        <div className={`${styles.ListRow} ${styles.ListRowName}`}>
                            Name
                            <i className="fa fa-sort" onClick={() => onSorting('name')} />
                        </div>
                        <div className={`${styles.ListRow} ${styles.ListRowName}`}>
                            Model name
                            <i className="fa fa-sort" onClick={() => onSorting('model_name')} />
                        </div>
                        <div className={`${styles.ListRow} ${styles.ListRowName}`}>
                            Username
                            <i className="fa fa-sort" onClick={() => onSorting('username')} />
                        </div>
                        <div className={`${styles.ListRow} ${styles.ListRowOrg}`}>
                            Organisation (owner)
                            <i className="fa fa-sort" onClick={() => onSorting('organisation__name')} />
                        </div>
                        <div className={`${styles.ListRow} ${styles.ListRowTime}`}>
                            Last update
                            <i className="fa fa-sort" onClick={() => onSorting('last_modified')} />
                        </div>
                        <div className={`${styles.ListRow} ${styles.ListRowAccess}`} />
                    </li>
                    {scenarios.map((scenario: Scenario) => {
                        const checked = !!checkedScenarios.find(uuid => uuid === scenario.uuid);
                        return (
                            <li
                                className={selectedItem === scenario.uuid ? `${styles.ListRowLi} ${styles.ListRowLi__Selected}` : styles.ListRowLi}
                                key={scenario.uuid}
                                onClick={() => selectItem(scenario.uuid)}
                            >
                                <input className={`${styles.ListRow} ${styles.ListRowNormal} ${styles.ListRowBox}`} type="checkbox" onChange={() => onCheckboxSelect(scenario.uuid)} checked={checked} />
                                <div className={`${styles.ListRow} ${styles.ListRowNormal} ${styles.ListRowName}`} title={scenario.name}>{scenario.name}</div>
                                <div className={`${styles.ListRow} ${styles.ListRowNormal} ${styles.ListRowName}`} title={scenario.model_name}>{scenario.model_name}</div>
                                <div className={`${styles.ListRow} ${styles.ListRowNormal} ${styles.ListRowName}`} title={scenario.username}>{scenario.username}</div>
                                <div className={`${styles.ListRow} ${styles.ListRowNormal} ${styles.ListRowOrg}`} title={scenario.organisation && scenario.organisation.name}>{scenario.organisation && scenario.organisation.name}</div>
                                <div className={`${styles.ListRow} ${styles.ListRowNormal} ${styles.ListRowTime}`} title={scenario.last_modified}>{getLocalDateString(scenario.last_modified)}</div>
                                <div className={`${styles.ListRow} ${styles.ListRowNormal} ${styles.ListRowAccess}`}>
                                    <AccessModifier accessModifier={scenario.access_modifier} />
                                </div>
                            </li>
                        )
                    })}
                </ul>
            </div>
            <div className={styles.ListFooter}>
                <Pagination
                    count={count}
                    page={page}
                    onPageClick={onPageClick}
                />
                <button
                    className={styles.List__ButtonBasket}
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