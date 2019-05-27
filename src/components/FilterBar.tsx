import * as React from 'react';
import './FilterBar.css';

class FilterBar extends React.Component<{}, {}> {
    render() {
        return (
            <div className="filter">
                <div className="filter-title"><h3>Filters</h3></div>
                <div className="filter-box">
                    <div className="filter-observation-type">
                        <h3>Observation Type</h3>
                    </div>
                    <div className="filter-organisaton">
                        <h3>Organisation</h3>
                    </div>
                </div>
            </div>
        );
    };
};

export default FilterBar;