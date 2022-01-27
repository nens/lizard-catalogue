import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Raster } from '../../interface';
import { getCurrentRasterList, getSelectedItem, getFilters, getAllRasters, MyStore } from '../../reducers';
import BasketNotification from '../../components/BasketNotification';
import SearchBar from '../../components/SearchBar';
import Pagination from '../../components/Pagination';
import rasterTemporalIcon from '../../images/raster-temporal.svg';
import rasterNonTemporalIcon from '../../images/raster-non-temporal.svg';
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
    updateBasketWithRaster: (rasters: string[]) => void
};

export default function RasterList (props: MyProps) {
    const { searchTerm, onPageClick, onSearchChange, onSearchSubmit, onSorting, selectItem, updateBasketWithRaster } = props;
    const currentRasterList = useSelector(getCurrentRasterList);
    const allRasters = useSelector(getAllRasters);
    const selectedItem = useSelector(getSelectedItem);
    const page = useSelector(getFilters).page;

    const [checkedRasters, setCheckedRasters] = useState<string[]>([]);

    // Show loading screen if there is no data or data is being fetched
    if (!currentRasterList || currentRasterList.isFetching) return <LoadingScreen />;

    const { count, rasterList } = currentRasterList;
    const rasters = rasterList.map(uuid => allRasters[uuid as keyof MyStore['allRasters']]) as Raster[];

    const onCheckboxSelect = (uuid: string) => {
        // Check if the WMS layer has already been selected or not
        const selectedUuid = checkedRasters.find(rasterUuid => rasterUuid === uuid);

        // If not yet selected then add this new uuid into the basket
        if (!selectedUuid) {
            setCheckedRasters([...checkedRasters, uuid]);
        } else {
            //If already selected then remove this uuid from the basket
            setCheckedRasters(checkedRasters.filter(rasterUuid => rasterUuid !== uuid));
        };
    };

    const addToBasket = () => {
        // Open the notification popup
        window.location.href = '#notification';
        updateBasketWithRaster(checkedRasters);
        setCheckedRasters([]);
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
                <div className={styles.ListLength}>{count} rasters</div>
            </div>
            <div className={styles.ListContent}>
                <ul className={styles.ListMainList}>
                    <li className={styles.ListRowHeader}>
                        <div className={`${styles.ListRow} ${styles.ListRowBox}`} />
                        <div className={styles.ListRow}>
                            Type
                            <i className="fa fa-sort" onClick={() => onSorting('temporal')} />
                        </div>
                        <div className={`${styles.ListRow} ${styles.ListRowName}`}>
                            Name
                            <i className="fa fa-sort" onClick={() => onSorting('name')} />
                        </div>
                        <div className={`${styles.ListRow} ${styles.ListRowOrg}`}>
                            Organisation (owner)
                            <i className="fa fa-sort" onClick={() => onSorting('organisation__name')} />
                        </div>
                        <div className={`${styles.ListRow} ${styles.ListRowRasterDescription}`}>
                            Description
                        </div>
                        <div className={`${styles.ListRow} ${styles.ListRowTime}`}>
                            Last update
                            <i className="fa fa-sort" onClick={() => onSorting('last_modified')} />
                        </div>
                        <div className={`${styles.ListRow} ${styles.ListRowAccess}`} />
                    </li>
                    {rasters.map((raster: Raster) => {
                        const checked = !!checkedRasters.find(uuid => uuid === raster.uuid);
                        return (
                            <li
                                className={selectedItem === raster.uuid ? `${styles.ListRowLi} ${styles.ListRowLi__Selected}` : styles.ListRowLi}
                                key={raster.uuid}
                                onClick={() => selectItem(raster.uuid)}
                            >
                                <input className={`${styles.ListRow} ${styles.ListRowNormal} ${styles.ListRowBox}`} type="checkbox" onChange={() => onCheckboxSelect(raster.uuid)} checked={checked} />
                                {raster.temporal ?
                                    <img className={`${styles.ListRow} ${styles.ListRowNormal}`} src={rasterTemporalIcon} alt="temporal" title="Temporal"/> :
                                    <img className={`${styles.ListRow} ${styles.ListRowNormal}`} src={rasterNonTemporalIcon} alt="non-temporal" title="Non-temporal"/>
                                }
                                <div className={`${styles.ListRow} ${styles.ListRowNormal} ${styles.ListRowName}`} title={raster.name}>{raster.name}</div>
                                <div className={`${styles.ListRow} ${styles.ListRowNormal} ${styles.ListRowOrg}`}title={raster.organisation && raster.organisation.name}>{raster.organisation && raster.organisation.name}</div>
                                <div className={`${styles.ListRow} ${styles.ListRowNormal} ${styles.ListRowRasterDescription}`} title={raster.description}>{raster.description}</div>
                                <div className={`${styles.ListRow} ${styles.ListRowNormal} ${styles.ListRowTime}`}>{new Date(raster.last_modified).toLocaleDateString()}</div>
                                <div className={`${styles.ListRow} ${styles.ListRowNormal} ${styles.ListRowAccess}`}>
                                    <AccessModifier accessModifier={raster.access_modifier} />
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
                    disabled={checkedRasters.length === 0 ? true : false}
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