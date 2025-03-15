import "../styles/Notification.css"

function Notification ({notification_type, notification_messsage, activated}) {
    return ( 
        
        <div className={`notification_base ${activated ? notification_type : ""}`}>
            <p className={`notification_words ${activated ? notification_type + "_words" : ""}`}> {notification_messsage} </p>
        </div>
    );
}

export default Notification ;