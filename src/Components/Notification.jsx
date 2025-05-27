import "../styles/Notification.css"

function Notification ({notification_type, notification_message, activated})
 {
    return ( 
        
        <div className={`notification_base ${notification_type || ""} ${activated ? "notification_start" : ""}`}>
            <p className={`notification_words ${(notification_type + "_words") || ""}`}> 
                {notification_message} 
            </p>
        </div>
    );
}

export default Notification ;