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

    // variable pour gérer les requêtes
    const [url, setUrl] = useState(null);
    const [form, setForm] = useState({});
    const [tempUrl, setTempUrl] = useState(null);
    const [tempForm, setTempForm] = useState({});

    const [data, setData] = useState(null);
    const [error, setError] = useState(false);
    const [queryParams, setQueryParams] = useState("");
    const [folders, setFolders] = useState(null);
    const [deviants, setDeviants] = useState(null);
    const [nextOffset, setNextOffset] = useState(-1);
    const [nextOffsetC, setNextOffsetC] = useState(0);
    const [selections, setSelections] = useState([
        "", "", ""
    ]);


    // ===================================== useEffect ===================================== 
    // useEffect |================| Récupération de token
    useEffect(() => {
        // Vérification pour la premier connection
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

    // useEffect |================| request api deviantart
    useEffect(() => {
        // function request api
        async function fetch_data() {
            try {
                //Récupération de l'url complete
                const url_fl = urls[url](queryParams);

                // Emmetre la requête est récupération de la réponse
                const response = await fetch(url_fl, {
                    method : "POST",
                    body : form
                });
                const data_temp = await response.json();
                setData(data_temp);

            } catch (err){
                // Capture des erreurs,
                console.error(err)
                setTempUrl(url);                                        //si l'erreur arrive durant une requête récupération de la requête en cours
                setTempForm(form);
                setUrl(null);
                setError(true);
            } 
        }

        // déclenche si on a une url
        if (url) fetch_data();
        
    },[url]);

    // =====================================  response treatment
    useEffect(() => {
       
        if (data) {
            // Vérification qu'une erreur ne x'est pas produite dans la requete
            if (data.error) {
                console.log("Error : ", data)
                setTempUrl(url);
                setTempForm(form);
                setUrl(null)
                setError(true);
                return
            }

            // 
            if ((url === "Token") && data.access_token) {
                // sauvegarde des tokens et du temps de sauvagarde
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
                // Récupérations des dossiers
                setFolders(data.results);
                
                // reprise de la requête en cours si y'en à une
                if (tempUrl) {
                    setUrl(tempUrl);
                    setForm(tempForm);
                    setTempUrl(null);
                    setTempForm({});
                }
            } else if (url === "Folder") {
                // Récupération des deviations
                setUrl(null);
                // console.log("data folder :", data);
                // si c'est le première requête sur les deviants
                if (nextOffset === -1)  {
                    setDeviants([...data.results]);
                } else { // si il y'en a d'autre à faire
                    setDeviants([...deviants, ...data.results]);
                }
                setNextOffset(data.next_offset);                               // y'a t'il d'autre deviants à récupérer
                
            } else if (url === "Copy") {
                // Copie des deviations
                setUrl(null);
                if (deviants.length > ((nextOffsetC + 1) * 24)) { //copie des éléments pas groupe de 24
                    setNextOffsetC(nextOffsetC + 1);
                } else { //fin de copie
                    setNextOffsetC(0);
                }
            } 
        }
    }, [data])

    // useEffect |================| Gestion erreur
    useEffect(() => {
        if (error) {
            setError(false);
            // token invalidé durant la connection
            if (data.error === "invalid_token") {
                console.log("Sect erreur durant utilisation invalide token");
                //demander un nouveau token
                setUrl("Token")

                //form pour récupération d'un nouveau Token
                const formData = new FormData();
                formData.append('client_id', clientId);
                formData.append('client_secret', clientSecret);
                formData.append('grant_type', grant_type_refresh);
                formData.append('refresh_token', accessRefresh);
                setForm(formData)    
                
            }
            
        }
    }, [error])

    // useEffect |================| vérification que l'on possède tous les déviants
    useEffect(() => {
        
        // console.log("offset : ", nextOffset);
        if (nextOffset !== -1) {
            console.log("deviants : ", deviants);

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

                //formulaire pour réorganiser
                const formData = new FormData();
                formData.append('access_token', accessToken);
                formData.append('target_folderid', selections[0].folderid);
                formData.append("mature_content", true);
                for (let i = Math.max((tempdeviants.length - 24), 0); i < tempdeviants.length; i++) {
                    formData.append(`deviationids[${i}]`, tempdeviants[i].deviationid)
                }

                setForm(formData)
                setUrl("Copy")

            }
        }
    }, [nextOffset])


    // useEffect |================| Copie de toutes les déviations
    useEffect(() => {
        if (nextOffsetC > 0)
        {
            // création du formData pour la requetes POST
            const formData = new FormData();
            formData.append('access_token', accessToken);
            formData.append('target_folderid', selections[0].folderid);
            formData.append("mature_content", true);

            const start = Math.max((deviants.length - 24 * (nextOffsetC + 1)), 0);
            const end = deviants.length - 24 * nextOffsetC
            for (let i = start; i < end; i++) {     
                formData.append(`deviationids[${i}]`, deviants[i].deviationid)
            }
            

        setForm(formData)
        setUrl("Copy")

        }
    }, [nextOffsetC])

    // useEffect |================| charger les dossiers après la connection
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
    // function |================| gérer les sélections
    const handleSelect = (event, index) => {
        const selections_temp = [...selections];
        if (index === 0) {
            selections_temp[index] = folders[event.target.id];
            

        } else if (index === 1) {
            selections_temp[index] = sorts_types[event.target.id];
            
        }
        setSelections(selections_temp);
    }


    // function |================| Gére le traitement des deviants
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
