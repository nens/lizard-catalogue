import { useState } from 'react';
import { useSelector } from 'react-redux';
import { getCurrentWMSList, getAllWms, getSelectedItem, getFilters } from '../../reducers';
import BasketNotification from '../../components/BasketNotification';
import SearchBar from '../../components/SearchBar';
import Pagination from '../../components/Pagination';
import LoadingScreen from '../../components/LoadingScreen';
import AccessModifier from '../../components/AccessModifier';
import styles from '../../styles/List.module.css';
import buttonStyles from '../../styles/Buttons.module.css';

interface MyProps {
    searchTerm: string,
    onPageClick: (page: number) => void,
    onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void,
    onSearchSubmit: (event: React.FormEvent<HTMLFormElement>) => void,
    onSorting: (ordering: string) => void,
    selectItem: (uuid: string) => void,
    updateBasketWithWMS: (wmsLayers: string[]) => void
};

export default function WmsList (props: MyProps) {
    const { searchTerm, onPageClick, onSearchChange, onSearchSubmit, onSorting, selectItem, updateBasketWithWMS } = props;
    const currentWMSList = useSelector(getCurrentWMSList);
    const allWms = useSelector(getAllWms);
    const selectedItem = useSelector(getSelectedItem);
    const page = useSelector(getFilters).page;

    const [checkedWmsLayers, setCheckedWmsLayers] = useState<string[]>([]);

    // Show loading screen if there is no data or data is being fetched
    if (!currentWMSList || currentWMSList.isFetching) return <LoadingScreen />;

    const { count, wmsList } = currentWMSList;
    const wmsLayers = wmsList.map(uuid => allWms[uuid]);

    const onCheckboxSelect = (uuid: string) => {
        // Check if the WMS layer has already been selected or not
        const selectedUuid = checkedWmsLayers.find(wmsLayerUuid => wmsLayerUuid === uuid);

        // If not yet selected then add this new uuid into the basket
        if (!selectedUuid) {
            setCheckedWmsLayers([...checkedWmsLayers, uuid]);
        } else {
            //If already selected then remove this uuid from the basket
            setCheckedWmsLayers(checkedWmsLayers.filter(wmsLayerUuid => wmsLayerUuid !== uuid));
        };
    };

    const addToBasket = () => {
        // Open the notification popup
        window.location.href = '#notification';
        updateBasketWithWMS(checkedWmsLayers);
        setCheckedWmsLayers([]);
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
                <div className={styles.ListLength}>{count} WMS layers</div>
            </div>
            <div className={styles.ListContent}>
                <ul className={styles.ListMainList}>
                    <li className={styles.ListRowHeader}>
                        <div className={`${styles.ListRow} ${styles.ListRowBox}`} />
                        <div className={`${styles.ListRow} ${styles.ListRowName}`}>
                            Name
                            <i className="fa fa-sort" onClick={() => onSorting('name')} />
                        </div>
                        <div className={`${styles.ListRow} ${styles.ListRowOrg}`}>
                            Organisation (owner)
                            <i className="fa fa-sort" onClick={() => onSorting('organisation__name')} />
                        </div>
                        <div className={`${styles.ListRow} ${styles.ListRowWmsDescription}`}>
                            Description
                        </div>
                        <div className={`${styles.ListRow} ${styles.ListRowAccess}`} />
                    </li>
                    {wmsLayers.map(wms => {
                        const checked = !!checkedWmsLayers.find(uuid => uuid === wms.uuid);
                        return (
                            <li
                                className={selectedItem === wms.uuid ? `${styles.ListRowLi} ${styles.ListRowLi__Selected}` : styles.ListRowLi}
                                key={wms.uuid}
                                onClick={() => selectItem(wms.uuid)}
                            >
                                <input className={`${styles.ListRow} ${styles.ListRowNormal} ${styles.ListRowBox}`} type="checkbox" onChange={() => onCheckboxSelect(wms.uuid)} checked={checked} />
                                <div className={`${styles.ListRow} ${styles.ListRowNormal} ${styles.ListRowName}`} title={wms.name}>{wms.name}</div>
                                <div className={`${styles.ListRow} ${styles.ListRowNormal} ${styles.ListRowOrg}`} title={wms.organisation && wms.organisation.name}>{wms.organisation && wms.organisation.name}</div>
                                <div className={`${styles.ListRow} ${styles.ListRowNormal} ${styles.ListRowWmsDescription}`} title={wms.description}>{wms.description}</div>
                                <div className={`${styles.ListRow} ${styles.ListRowNormal} ${styles.ListRowAccess}`}>
                                    <AccessModifier accessModifier={wms.access_modifier} />
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
                    className={buttonStyles.ButtonBasket}
                    disabled={checkedWmsLayers.length === 0 ? true : false}
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