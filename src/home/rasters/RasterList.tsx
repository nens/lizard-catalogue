import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Raster } from '../../interface';
import { getCurrentRasterList, getSelectedItem, getFilters, getAllRasters } from '../../reducers';
import BasketNotification from '../../components/BasketNotification';
import SearchBar from '../../components/SearchBar';
import Pagination from '../../components/Pagination';
import rasterTemporalIcon from '../../images/raster-temporal.svg';
import rasterNonTemporalIcon from '../../images/raster-non-temporal.svg';
import LoadingScreen from '../../components/LoadingScreen';
import AccessModifier from '../../components/AccessModifier';
import '../../styles/List.css';

interface MyProps {
    searchTerm: string,
    onPageClick: (page: number) => void,
    onSearchChange: (event: object) => void,
    onSearchSubmit: (event: object) => void,
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
    const rasters = rasterList.map(uuid => allRasters[uuid]);

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
        //Click the button will open the notification popup
        window.location.href = '#notification';
        updateBasketWithRaster(checkedRasters);
        setCheckedRasters([]);
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
                <div className="list__length">{count} rasters</div>
            </div>
            <div className="list__content">
                <ul className="list__list">
                    <li className="list__row-header">
                        <div className="list__row list__row-box" />
                        <div className="list__row list__row-type">
                            Type
                            <i className="fa fa-sort" onClick={() => onSorting('temporal')} />
                        </div>
                        <div className="list__row list__row-name">
                            Name
                            <i className="fa fa-sort" onClick={() => onSorting('name')} />
                        </div>
                        <div className="list__row list__row-org">
                            Organisation (owner)
                            <i className="fa fa-sort" onClick={() => onSorting('organisation__name')} />
                        </div>
                        <div className="list__row list__row-raster-description">
                            Description
                        </div>
                        <div className="list__row list__row-time">
                            Latest update
                            <i className="fa fa-sort" onClick={() => onSorting('last_modified')} />
                        </div>
                        <div className="list__row list__row-access" />
                    </li>
                    {rasters.map((raster: Raster) => {
                        const checked = checkedRasters.filter(uuid => uuid === raster.uuid).length === 0 ? false : true;
                        return (
                            <li
                                className={selectedItem === raster.uuid ? "list__row-li list__row-li-selected" : "list__row-li"}
                                key={raster.uuid}
                                onClick={() => selectItem(raster.uuid)}
                            >
                                <input className="list__row list__row-normal list__row-box" type="checkbox" onChange={() => onCheckboxSelect(raster.uuid)} checked={checked} />
                                {raster.temporal ?
                                    <img className="list__row list__row-normal list__row-type" src={rasterTemporalIcon} alt="temporal" title="Temporal"/> :
                                    <img className="list__row list__row-normal list__row-type" src={rasterNonTemporalIcon} alt="non-temporal" title="Non-temporal"/>
                                }
                                <div className="list__row list__row-normal list__row-name" title={raster.name}>{raster.name}</div>
                                <div className="list__row list__row-normal list__row-org"title={raster.organisation && raster.organisation.name}>{raster.organisation && raster.organisation.name}</div>
                                <div className="list__row list__row-normal list__row-raster-description" title={raster.description}>{raster.description}</div>
                                <div className="list__row list__row-normal list__row-time">{new Date(raster.last_modified).toLocaleDateString()}</div>
                                <div className="list__row list__row-normal list__row-access">
                                    <AccessModifier accessModifier={raster.access_modifier} />
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
                    paginatedPages={[page - 2, page - 1, page, page + 1, page + 2]}
                    totalPages={Math.ceil(count / 10)}
                    onPageClick={onPageClick}
                />
                <button
                    className="list__button-basket"
                    disabled={checkedRasters.length === 0 ? true : false}
                    onClick={addToBasket}
                >
                    ADD TO BASKET
                </button>
            </div>
            {/*Notification popup when click on the Add to Basket button*/}
            <div className="modal" id="notification">
                <BasketNotification />
            </div>
        </div>
    )
}