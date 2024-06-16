import React, { useRef, useEffect, useState } from 'react';
import "../styles/Header.css"
import { urls } from '../assets/urls/urls';
import { redirect_uri, response_type, scope } from '../assets/params/params';


function Header({access_token}) {
    const clientIdRef = useRef();
    const clientSecretRef = useRef();

    // console.log(access_token);
    

    //Comportement

    const handleLoginButtonClick = () => {

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
            <input type="text" name="client_id" id="" className='CI' placeholder='Client id' ref={clientIdRef} disabled={access_token ? true : false}/>
            <input type="text" name="client_secret" id="" className='CS' placeholder='Client secret' ref={clientSecretRef} disabled={access_token ? true : false}/>
            <input type="submit" value="Connection" className='but_submit_logio' onClick={handleLoginButtonClick} disabled={access_token ? true : false}/>
        </div>
    );
}

export default Header;