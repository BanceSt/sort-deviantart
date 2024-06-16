import React, { useEffect, useState, useRef } from 'react';
import Header from '../Components/Header';
import { urls } from '../assets/urls/urls';
import { grant_type_autho, grant_type_refresh, redirect_uri } from '../assets/params/params';
import "../styles/Home.css"
import Box from '../Components/Box';

//client_id=${client_id}&client_secret=${client_secret}&grant_type=${grant_type}&code=${code}&redirect_uri=${redirect_uri}
function Home(props) {
    const urlParam = new URLSearchParams(window.location.search);

    const [clientId, setClientId] = useState(window.localStorage.getItem("Client_id"));
    const [clientSecret, setClientSecret] = useState(window.localStorage.getItem("Client_secret"));
    const [loginState, setLoginState] = useState(false);
    const [code, setCode] = useState(urlParam.get('code'));
    const [accessToken, setAccessToken] = useState(window.localStorage.getItem("access_token"));
    const [accessRefresh, setRefreshToken] = useState(window.localStorage.getItem("refresh_token"));
    const [accessTokenTime, setAccessTokenTime] = useState(window.localStorage.getItem("access_token_time"));
    const [data, setData] = useState(null);
    const [url, setUrl] = useState(null);
    const [queryParams, setQueryParams] = useState(null);
    const [folders, setFolders] = useState(null);


    // ===================================== useEffect
    useEffect(() => {
        // Vérification pour la premier connection
        if (code && !accessToken) {
            setUrl("Token")
            setQueryParams(new URLSearchParams({
                "client_id" : clientId,
                "client_secret" : clientSecret,
                "grant_type" : grant_type_autho,
                "code" : code,
                "redirect_uri": redirect_uri}).toString());
        } else if ( ((Date.now() / 1000) - accessTokenTime) > 3600) {
            setUrl("Token")
            setQueryParams(new URLSearchParams({
                "client_id" : clientId,
                "client_secret" : clientSecret,
                "grant_type" : grant_type_refresh,
                "refresh_token": accessRefresh}).toString());
        }
    }, [])

    // request
    useEffect(() => {
        async function fetch_data() {
            try {
                const url_fl = urls[url](queryParams);
                const response = await fetch(url_fl)
                const data_temp = await response.json()
                console.log(data_temp);
                console.log(data_temp.access_token);

                
                setData(data_temp);
            } catch (err){
                console.error(err);
            } 
        }

        if (url) fetch_data();
        
    },[url]);

    // response treatment
    useEffect(() => {
        if (data) {
            if ((url === "Token") && data.access_token) {
                // sauvegarde
                const tokenTime = Date.now() / 1000;
                window.localStorage.setItem("access_token", data.access_token);
                window.localStorage.setItem("refresh_token", data.refresh_token);
                window.localStorage.setItem("access_token_time", tokenTime);
    
                setAccessToken(data.access_token);
                setRefreshToken(data.refresh_token);
                setAccessTokenTime(tokenTime);
            } else if (url === "Folders") {
                setFolders(data.results);
                console.log("Folders : ", data.results);
            }
        }
        
    }, [data])

    // functions
    // charge the folders
    const chargeFolders = () => {
        setQueryParams(new URLSearchParams({
            "access_token" : accessToken,
            "ext_preload" : false,
            "limit" : 50,}).toString());
        setFolders(true);
        setUrl("Folders");
        
    }

    return (
        <div className='ccontainer'> 
            <Header access_token={accessToken}/>
            {
                !accessToken ? 
                <h1> nope yet </h1> :
                !folders ?
                chargeFolders()
                  :
                <div className="main">
                    <div className="center_main">
                        <div className="grp_box">
                            <Box name='FOLDERS' elements={folders}/>
                            <Box />
                            <Box />
                        </div>
                    </div>
                </div>

                
            }
        </div>
    );
}

export default Home;
