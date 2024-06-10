import React, { useEffect, useState } from 'react';
import Header from '../Components/Header';
import { urls } from '../assets/urls/urls';
import { grant_type_autho, redirect_uri } from '../assets/params/params';

function Home(props) {
    const urlParam = new URLSearchParams(window.location.search);

    const [clientId, setClientId] = useState(window.localStorage.getItem("Client_id"));
    const [clientSecret, setClientSecret] = useState(window.localStorage.getItem("Client_secret"));
    const [loginState, setLoginState] = useState(false);
    const [code, setCode] = useState(urlParam.get('code'));
    const [accessToken, setAccessToken] = useState(window.localStorage.getItem("access_token"));
    const [accessRefresh, setRefreshToken] = useState(window.localStorage.getItem("refresh_token"));
    const [accessTokenTime, setAccessTokenTime] = useState(window.localStorage.getItem("access_token_time"));

    useEffect(() => {
        console.log("Code : ", code);
        if (loginState) return;

        async function first_login() {
            
            try {
                const url_fl = urls["Token"](clientId, clientSecret, grant_type_autho, code, redirect_uri);
                const response = await fetch(url_fl)
                const data = await response.json()
                console.log(data);
                console.log(data.access_token);

                // sauvegarde
                const tokenTime = Date.now() / 1000;
                window.localStorage.setItem("access_token", data.access_token);
                window.localStorage.setItem("refresh_token", data.refresh_token);
                window.localStorage.setItem("access_token_time", tokenTime);

                setAccessToken(data.access_token);
                setRefreshToken(data.refresh_token);
                setAccessTokenTime(tokenTime);
            } catch (err){
                console.error(err);

            } 
        }
        //Premier connection
        if (code && !loginState) {
            setLoginState(true);
            console.log("HEre");
            first_login();
        }
    },[loginState]);

    return (
        <div className='ccontainer'> 
            <Header />
        </div>
    );
}

export default Home;
