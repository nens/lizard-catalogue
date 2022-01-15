import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { WMS } from '../../interface';
import { getCurrentWMSList, getAllWms, getSelectedItem, getFilters } from '../../reducers';
import BasketNotification from '../../components/BasketNotification';
import SearchBar from '../../components/SearchBar';
import Pagination from '../../components/Pagination';
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
                <div className="list__length">{count} WMS layers</div>
            </div>
            <div className="list__content">
                <ul className="list__list">
                    <li className="list__row-header">
                        <div className="list__row list__row-box" />
                        <div className="list__row list__row-name">
                            Name
                            <i className="fa fa-sort" onClick={() => onSorting('name')} />
                        </div>
                        <div className="list__row list__row-org">
                            Organisation (owner)
                            <i className="fa fa-sort" onClick={() => onSorting('organisation__name')} />
                        </div>
                        <div className="list__row list__row-wms-description">
                            Description
                        </div>
                        <div className="list__row list__row-access" />
                    </li>
                    {wmsLayers.map((wms: WMS) => {
                        const checked = !!checkedWmsLayers.find(uuid => uuid === wms.uuid);
                        return (
                            <li
                                className={selectedItem === wms.uuid ? "list__row-li list__row-li-selected" : "list__row-li"}
                                key={wms.uuid}
                                onClick={() => selectItem(wms.uuid)}
                            >
                                <input className="list__row list__row-normal list__row-box" type="checkbox" onChange={() => onCheckboxSelect(wms.uuid)} checked={checked} />
                                <div className="list__row list__row-normal list__row-name" title={wms.name}>{wms.name}</div>
                                <div className="list__row list__row-normal list__row-org" title={wms.organisation && wms.organisation.name}>{wms.organisation && wms.organisation.name}</div>
                                <div className="list__row list__row-normal list__row-wms-description" title={wms.description}>{wms.description}</div>
                                <div className="list__row list__row-normal list__row-access">
                                    <AccessModifier accessModifier={wms.access_modifier} />
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