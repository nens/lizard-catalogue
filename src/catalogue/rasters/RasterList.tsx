import * as React from 'react';
import MDSpinner from "react-md-spinner";
import { connect } from 'react-redux';
import { Raster } from '../../interface';
import { MyStore, getRaster } from '../../reducers';
import BasketNotification from '../components/BasketNotification';
import SearchBar from '../components/SearchBar';
import Pagination from '../components/Pagination';
import rasterTemporalIcon from '../../images/raster-temporal.svg';
import rasterNonTemporalIcon from '../../images/raster-non-temporal.svg';
import '../styles/List.css';

interface MyProps {
    searchTerm: string,

    currentRasterList: MyStore['currentRasterList'] | null,

    onPageClick: (page: number) => void,
    onSearchChange: (event: object) => void,
    onSearchSubmit: (event: object) => void,
    onSorting: (ordering: string) => void,

    selectItem: (uuid: string) => void,
    updateBasketWithRaster: (rasters: string[]) => void
};

interface PropsFromState {
    rasters: Raster[],
    selectedItem: string,
    page: number,
};

type RasterListProps = MyProps & PropsFromState;

interface MyState {
    checkedRasters: string[]
};

class RasterList extends React.Component<RasterListProps, MyState> {
    state: MyState = {
        checkedRasters: []
    };

    onCheckboxSelect = (uuid: string) => {
        //Check if the raster has already been selected or not
        const selectedUuid = this.state.checkedRasters.filter(id => id === uuid)

        //If not yet selected then add this new uuid into the basket
        if (selectedUuid.length === 0) {
            this.setState({
                checkedRasters: [...this.state.checkedRasters, uuid]
            });
        } else {
            //If already selected then remove this uuid from the basket
            this.setState({
                checkedRasters: this.state.checkedRasters.filter(id => id !== uuid)
            });
        };
    };

    renderLoadingScreen() {
        return <div className="list loading-screen"><MDSpinner size={50} /></div>;
    };

    render() {
        //Destructure all props of the Raster List component
        const { searchTerm, page, onPageClick, onSearchChange, onSearchSubmit, onSorting, currentRasterList, selectItem, updateBasketWithRaster, rasters, selectedItem } = this.props;
        const { checkedRasters } = this.state;

        //number of pages displayed in the pagination bar stored in an array with 5 pages
        const paginatedPages = [page - 2, page - 1, page, page + 1, page + 2];

        //If nothing is fetched, show loading screen
        if (!currentRasterList) return <this.renderLoadingScreen />;

        //If data is being requested from the API, show loading screen
        if (currentRasterList.isFetching) return <this.renderLoadingScreen />;

        //Destructure the currentRasterList object
        const { count } = currentRasterList;
        const totalPages = Math.ceil(count / 10);

        //Add to basket function which will do the followings
        //1- open the notification box
        //2- dispatch an action to update the basket
        //3- set the state of the RasterList component again
        const addToBasket = () => {
            //Click the button will open the notification popup
            window.location.href = '#notification';

            updateBasketWithRaster(checkedRasters);
            this.setState({ 
                checkedRasters: [] 
            });
        };

        return (
            <div className="list">
                <div className="list__top">
                    <SearchBar
                        name="searchBar"
                        searchTerm={searchTerm}
                        title="Type name or UUID of raster/wms layer"
                        placeholder="Search in Lizard or type a UUID"
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
                            //Here is a logic to define whether a raster has been selected (check-box has been checked or not)
                            //if yes then the checked value of the input field will be true
                            //if no then the checked value of the input field will be false
                            const checked = checkedRasters.filter(uuid => uuid === raster.uuid).length === 0 ? false : true;

                            const renderAccessModifier = () => {
                                if (raster.access_modifier === "Public" || raster.access_modifier === "Publiek") {
                                    return <div className="access-modifier public">{raster.access_modifier.toUpperCase()}</div>
                                } else if (raster.access_modifier === "Private" || raster.access_modifier === "Privaat") {
                                    return <div className="access-modifier private">{raster.access_modifier.toUpperCase()}</div>
                                } else {
                                    return <div className="access-modifier common">{raster.access_modifier.toUpperCase()}</div>
                                }
                            }

                            return (
                                <li
                                    className={selectedItem === raster.uuid ? "list__row-li list__row-li-selected" : "list__row-li"}
                                    key={raster.uuid}
                                    onClick={() => selectItem(raster.uuid)}
                                >
                                    <input className="list__row list__row-normal list__row-box" type="checkbox" onChange={() => this.onCheckboxSelect(raster.uuid)} checked={checked} />
                                    {raster.temporal ?
                                        <img className="list__row list__row-normal list__row-type" src={rasterTemporalIcon} alt="temporal" title="Temporal"/> :
                                        <img className="list__row list__row-normal list__row-type" src={rasterNonTemporalIcon} alt="non-temporal" title="Non-temporal"/>
                                    }
                                    <div className="list__row list__row-normal list__row-name" title={raster.name}>{raster.name}</div>
                                    <div className="list__row list__row-normal list__row-org"title={raster.organisation && raster.organisation.name}>{raster.organisation && raster.organisation.name}</div>
                                    <div className="list__row list__row-normal list__row-raster-description" title={raster.description}>{raster.description}</div>
                                    <div className="list__row list__row-normal list__row-time">{new Date(raster.last_modified).toLocaleDateString()}</div>
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
                        paginatedPages={paginatedPages}
                        totalPages={totalPages}
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
        );
    };
};

const mapStateToProps = (state: MyStore, ownProps: MyProps): PropsFromState => {
    if (!ownProps.currentRasterList) return {
        rasters: [],
        selectedItem: '',
        page: 1,
    };
    return {
        rasters: ownProps.currentRasterList.rasterList.map(uuid => getRaster(state, uuid)),
        selectedItem: state.selectedItem,
        page: state.filters.page,
    };
};

export default connect(mapStateToProps)(RasterList);