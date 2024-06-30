import React, { useEffect, useState, useRef } from 'react';
import Header from '../Components/Header';
import { setFolderId, urls } from '../assets/urls/urls';
import { grant_type_autho, grant_type_refresh, redirect_uri } from '../assets/params/params';
import "../styles/Home.css"
import Box from '../Components/Box';
import { sorts_types } from '../assets/params/func_sort';

//client_id=${client_id}&client_secret=${client_secret}&grant_type=${grant_type}&code=${code}&redirect_uri=${redirect_uri}
function Home(props) {
    // Vérification de l'url
    const urlParam = new URLSearchParams(window.location.search);

    // Récupération des identifiants
    const clientId = window.localStorage.getItem("Client_id");
    const clientSecret = window.localStorage.getItem("Client_secret");
    const code = urlParam.get('code');

    const [accessToken, setAccessToken] = useState(window.localStorage.getItem("access_token"));
    const [accessRefresh, setRefreshToken] = useState(window.localStorage.getItem("refresh_token"));
    const [accessTokenTime, setAccessTokenTime] = useState(window.localStorage.getItem("access_token_time"));
    // const [loginState, setLoginState] = useState(false);   

    // variable pour gérer les requêtes
    const [data, setData] = useState(null);
    const [url, setUrl] = useState(null);
    const [queryParams, setQueryParams] = useState(null);
    const [folders, setFolders] = useState(null);
    const [deviants, setDeviants] = useState(null);
    const [nextOffset, setNextOffset] = useState(null);
    const [selections, setSelections] = useState([
        "", "", ""
    ]);


    // ===================================== useEffect
    // Récupération de token
    useEffect(() => {
        // Vérification pour la premier connection
        console.log("TEST 1");
        console.log("Result : ",(Date.now() / 1000) - accessTokenTime)
        if (code && !accessToken) {
            console.log("TEST 2");
            setUrl("Token")
            setQueryParams(new URLSearchParams({
                "client_id" : clientId,
                "client_secret" : clientSecret,
                "grant_type" : grant_type_autho,
                "code" : code,
                "redirect_uri": redirect_uri}).toString());
        }
        // Token plus à jour 
        else if ( ((Date.now() / 1000) - accessTokenTime) > 3600) {
            console.log("TEST 3");
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
                
                // console.log(data_temp.access_token);

                
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
            } else if (url === "Folder") {
                // Récupération des deviants
                setUrl(null);

                // si ce n'est pas le première vérification sur les deviants
                if (nextOffset)  {
                    setDeviants([...deviants, ...data.results]);
                } else {
                    setDeviants([...data.results]);
                }
                setNextOffset(data.next_offset);                               // y'a t'il d'autre deviants à récupérer
                console.log("data folder :", data);
            }
        }
    }, [data])

    // vérification que l'on possède tous les déviants
    useEffect(() => {
        console.log("Here test : ", deviants);
        console.log("offset : ", nextOffset);
        if (nextOffset) {
            setQueryParams(new URLSearchParams({
                "access_token" : accessToken,
                "offset": nextOffset,
                "limit" : 24,
                "mature_content" : true}).toString());
                setUrl("Folder")
        }
    }, [nextOffset])

    // functions
    // charge the folders
    const chargeFolders = () => {
        setQueryParams(new URLSearchParams({
            "access_token" : accessToken,
            "ext_preload" : false,
            "limit" : 50,}).toString());
        setFolders([]);
        setUrl("Folders");
        
    }

    // gérer les sélections
    const handleSelect = (event, index) => {
        const selections_temp = [...selections];
        if (index === 0) {
            selections_temp[index] = folders[event.target.id];
            

        } else if (index === 1) {
            selections_temp[index] = sorts_types[event.target.id];
            
        }
        setSelections(selections_temp);
    }


    // Gére le traitement des deviants
    const launchSelect = (event) => {
        if (event.key === "Enter") {
            if (selections[0] && selections[1]) {
                setFolderId(selections[0].folderid);
                console.log("sort by : ", selections[1]);

                setQueryParams(new URLSearchParams({
                    "access_token" : accessToken,
                    "offset": 0,
                    "limit" : 24,
                    "mature_content" : true}).toString());
                setUrl("Folder");
            }
            
            
            
        }
        
    }

    return (
        <div className='ccontainer' onKeyDown={launchSelect} tabIndex="0"> 
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
                            <Box index={0} name='FOLDERS' elements={folders} choice={selections[0]} onClick={handleSelect}/>
                            <Box index={1} name="SORT BY" elements={sorts_types} choice={selections[1]} onClick={handleSelect}/>
                            <Box index={2} name="LOG" />
                        </div>
                    </div>
                </div>

                
            }
        </div>
    );
}

export default Home;
