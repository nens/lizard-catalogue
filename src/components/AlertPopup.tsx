interface MyProps {
    toggleAlert: () => void,
};

export default function AlertPopup (props: MyProps) {
    return (
        <div
            className="authorisation-alert"
            onClick={props.toggleAlert}
            style={{ display: 'flex' }}
        >
            No data found! Please check your search selection
            <br />
            You may need to login or might have insufficient rights to view the data
        </div>
    )
}