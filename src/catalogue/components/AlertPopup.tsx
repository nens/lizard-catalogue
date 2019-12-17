import * as React from 'react';

interface MyProps {
    toggleAlert: () => void,
};

export default class AlertPopup extends React.Component<MyProps> {
    render() {
        return (
            <div
                className="authorisation-alert"
                onClick={this.props.toggleAlert}
                style={{ display: 'flex' }}
            >
                No Rasters/WMS layers found!
                Please check your search selection
                <br />
                You may need to login or might have insufficient rights to view
                the Rasters/WMS layers
            </div>
        );
    };
};