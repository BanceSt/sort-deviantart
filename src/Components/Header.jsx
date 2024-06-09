import React from 'react';
import "../styles/Header.css"

function Header(props) {
    return (
        <div className='Header'>
            <input type="text" name="client_id" id="" className='CI' placeholder='Client id'/>
            <input type="text" name="client_secret" id="" className='CS' placeholder='Client secret'/>
            <input type="submit" value="Connection" className='but_submit_logio'/>
        </div>
    );
}

export default Header;