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
    const [chargeFolders, setChargeFolders] = useState(false);
    // const [loginState, setLoginState] = useState(false);   

    // variable pour gérer les requêtes
    const [data, setData] = useState(null);
    const [form, setForm] = useState({});
    const [url, setUrl] = useState(null);
    const [queryParams, setQueryParams] = useState("");
    const [folders, setFolders] = useState(null);
    const [deviants, setDeviants] = useState(null);
    const [nextOffset, setNextOffset] = useState(-1);
    const [nextOffsetC, setNextOffsetC] = useState(-1);
    const [selections, setSelections] = useState([
        "", "", ""
    ]);


    // ===================================== useEffect
    // Récupération de token
    useEffect(() => {
        // Vérification pour la premier connection
        // console.log("Vérification token");
        // console.log("Result time : ",(Date.now() / 1000) - accessTokenTime)
        if (code && !accessToken) {
            console.log("Token premier connection");
            setUrl("Token")

            //form pour récupération de Token
            const formData = new FormData();
            formData.append('client_id', clientId);
            formData.append('client_secret', clientSecret);
            formData.append('grant_type', grant_type_refresh);
            formData.append('refresh_token', accessRefresh);
            setForm(formData)
        }
        // Token plus à jour 
        else if ( ((Date.now() / 1000) - accessTokenTime) > 3600) {
            console.log("token par refresh");
            setUrl("Token")

            //form pour récupération d'un nouveau Token
            const formData = new FormData();
            formData.append('client_id', clientId);
            formData.append('client_secret', clientSecret);
            formData.append('grant_type', grant_type_refresh);
            formData.append('refresh_token', accessRefresh);
            setForm(formData)    
        }
        // Token toujours bon
        else {
            console.log("token non necessaire");
            setChargeFolders(true);
        }
    }, [])

    // request
    useEffect(() => {
        async function fetch_data() {
            try {
                const url_fl = urls[url](queryParams);
                console.log("complete URL : ",url_fl);
                const response = await fetch(url_fl, {
                    method : "POST",
                    body : form
                });
                const data_temp = await response.json();
                
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
                console.log("TOKEN SAVE");
                const tokenTime = Date.now() / 1000;
                window.localStorage.setItem("access_token", data.access_token);
                window.localStorage.setItem("refresh_token", data.refresh_token);
                window.localStorage.setItem("access_token_time", tokenTime);
    
                setAccessToken(data.access_token);
                setRefreshToken(data.refresh_token);
                setAccessTokenTime(tokenTime);

                //Chargement des dossiers
                setChargeFolders(true);
            } else if (url === "Folders") {
                setFolders(data.results);
                // console.log("Folders : ", data.results);
            } else if (url === "Folder") {
                // Récupération des deviants
                setUrl(null);
                // console.log("data folder :", data);
                // si c'est le première requête sur les deviants
                if (nextOffset === -1)  {
                    console.log("Premier demande requete")
                    setDeviants([...data.results]);
                } else { // si il y'en a d'autre à faire
                    setDeviants([...deviants, ...data.results]);
                }
                setNextOffset(data.next_offset);                               // y'a t'il d'autre deviants à récupérer
                
            }
        }
    }, [data])

    // vérification que l'on possède tous les déviants
    useEffect(() => {
        // console.log("deviants : ", deviants);
        // console.log("offset : ", nextOffset);
        if (nextOffset !== -1) {
            if (nextOffset) {
                console.log("x demande requete")
                setQueryParams(new URLSearchParams({
                    "access_token" : accessToken,
                    "offset": nextOffset,
                    "limit" : 24,
                    "mature_content" : true}).toString());
                    setUrl("Folder")
            } else {
                setNextOffset(-1)
                // console.log("tempFolder before treatement : ", deviants)
                let tempdeviants = selections[1].func([...deviants]);
                setDeviants([...tempdeviants]);
                // console.log("tempFolder after treatement : ", tempdeviants)
                console.log("End request");

                //requête de copy
                setNextOffsetC(deviants.length >= 24 ? 24 : deviants.length)
                
            }
        }
    }, [nextOffset])

    // charger les dossiers après la connection
    useEffect (() => {
        if (chargeFolders) {
            //form pour récupération les dossiers
            const formData = new FormData();
            formData.append('access_token', accessToken);
            formData.append('ext_preload', false);
            formData.append('limit', 50);

            setForm(formData) 
            setFolders([]);
            setUrl("Folders");
        }
    }, [chargeFolders])

    // functions
    // charge the folders
    // const chargeFolders = () => {
    //     setQueryParams(new URLSearchParams({
    //         "access_token" : accessToken,
    //         "ext_preload" : false,
    //         "limit" : 50,}).toString());
    //     setFolders([]);
    //     setUrl("Folders");
        
    // }

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
                // Sélection du dossier
                setFolderId(selections[0].folderid);

                // form pour récupérer les deviations
                const formData = new FormData();
                formData.append('access_token', accessToken);
                setForm(formData) 

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

                <div className="main">
                    <div className="center_main">
                        <div className="grp_box">
                            <Box index={0} name='FOLDERS' elements={folders ? folders : []} choice={selections[0]} onClick={handleSelect}/>
                            <Box index={1} name="SORT BY" elements={folders ? sorts_types : []} choice={selections[1]} onClick={handleSelect}/>
                            <Box index={2} name="LOG" />
                        </div>
                    </div>
                </div>

                
            }
        </div>
    );
}

export default Home;
