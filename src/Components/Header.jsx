import React, { useRef, useEffect, useState } from 'react';
import "../styles/Header.css"
import { urls } from '../assets/urls/urls';
import { redirect_uri, response_type, scope } from '../assets/params/params';


function Header(props) {
    const clientIdRef = useRef();
    const clientSecretRef = useRef();
    

    //Comportement

    const handleLoginButtonClick = () => {
        console.log("Start_test");

        console.log(clientIdRef.current.value);
        console.log(clientSecretRef.current.value);

        //sauvegarde des infos de connection
        window.localStorage.setItem("Client_id", clientIdRef.current.value);
        window.localStorage.setItem("Client_secret", clientSecretRef.current.value);

        //urls Authorization
        const urlAuthorization = urls["Authorization"](response_type, clientIdRef.current.value, redirect_uri, scope);

        window.open(urlAuthorization);
    }

    return (
        <div className='Header'>
            <input type="text" name="client_id" id="" className='CI' placeholder='Client id' ref={clientIdRef}/>
            <input type="text" name="client_secret" id="" className='CS' placeholder='Client secret' ref={clientSecretRef}/>
            <input type="submit" value="Connection" className='but_submit_logio' onClick={handleLoginButtonClick}/>
        </div>
    );
}

export default Header;