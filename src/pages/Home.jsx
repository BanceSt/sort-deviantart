import React, { useEffect, useState, useRef } from 'react';
import Header from '../Components/Header';
import { setFolderId, urls } from '../assets/urls/urls';
import { grant_type_autho, grant_type_refresh, redirect_uri } from '../assets/params/params';
import "../styles/Home.css"
import Box from '../Components/Box';
import { sorts_types } from '../assets/params/func_sort';
import "../db/db"


//client_id=${client_id}&client_secret=${client_secret}&grant_type=${grant_type}&code=${code}&redirect_uri=${redirect_uri}
function Home(props) {
    // Vérification de l'url
    const urlParam = new URLSearchParams(window.location.search);

    // Récupération des identifiants
    const clientId = window.localStorage.getItem("Client_id");
    const clientSecret = window.localStorage.getItem("Client_secret");
    const code = urlParam.get('code');

    const [chargeFolders, setChargeFolders] = useState(false);

    // variable pour gérer les requêtes
    const url = useRef("");
    // const [tempUrl, setTempUrl] = useState(null);
    const [tempForm, setTempForm] = useState({});

    const [data, setData] = useState(null);
    // const [error, setError] = useState(false);
    const [folders, setFolders] = useState(null);
    const [deviants, setDeviants] = useState(null);
    const [nextOffset, setNextOffset] = useState(-1);
    const [nextOffsetC, setNextOffsetC] = useState(0);
    const [selections, setSelections] = useState([
        "", "", ""
    ]);

    // ===================================== func call api =================================
    // function request api
    async function fetch_data(formParam, queryParams = "") {
        try {
            //Récupération de l'url complete
            const url_fl = urls[url.current](queryParams);

            // Emmetre la requête est récupération de la réponse
            const response = await fetch(url_fl, {
                method : "POST",
                body : formParam
            });
            const data_temp = await response.json();
            setData(data_temp);

        } catch (err){
            // Capture des erreurs,
            console.error(err)
            // setTempUrl(url);                                        si l'erreur arrive durant une requête récupération de la requête en cours
            setTempForm(formParam);
            // setUrl(null);
            // setError(true);
        } 
    }

    // ===================================== useEffect ===================================== 
    // useEffect |================| Récupération de token
    useEffect(() => {
        // Vérification pour la premier connection
        if (code && !window.localStorage.getItem("access_token")) {
            console.log("Token premier connection");
            // Sélection de l'url
            url.current = "Token"

            //form pour récupération de Token
            const formData = new FormData();
            formData.append('client_id', clientId);
            formData.append('client_secret', clientSecret);
            formData.append('code', code);
            formData.append('grant_type', grant_type_autho);
            
            // call api pour recevoir un token
            fetch_data(formData)
        }

        // Token plus à jour 
        else if ( ((Date.now() / 1000) - window.localStorage.getItem("access_token_time")) > 3600) {
            console.log("token par refresh");
            // Sélection de l'url
            url.current = "Token"

            //form pour récupération d'un nouveau Token
            const formData = new FormData();
            formData.append('client_id', clientId);
            formData.append('client_secret', clientSecret);
            formData.append('grant_type', grant_type_refresh);
            formData.append('refresh_token', window.localStorage.getItem("refresh_token"));

            // call api pour rafraîchir le token
            fetch_data(formData)    
        }
        // Token toujours bon
        else {
            console.log("token non necessaire");
            setChargeFolders(true);
        }
    }, [])

    // =====================================  response treatment
    useEffect(() => {
       
        if (data) {
            // Vérification qu'une erreur ne s'est pas produite dans la requete
            if (data.error) {
                console.log("Error : ", data)
                // setTempUrl(url);
                // setTempForm(form);
                url.current = null
                // setError(true);
                return
            }

            // 
            if ((url.current === "Token") && data.access_token) {
                // sauvegarde des tokens et du temps de sauvagarde
                console.log("TOKEN SAVE");

                const tokenTime = Date.now() / 1000;
                window.localStorage.setItem("access_token", data.access_token);
                window.localStorage.setItem("refresh_token", data.refresh_token);
                window.localStorage.setItem("access_token_time", tokenTime);

                //Chargement des dossiers
                setChargeFolders(true);
            } else if (url.current === "Folders") {
                // Récupérations des dossiers
                setFolders(data.results);
                console.log("Folders-zone");
                
                // reprise de la requête en cours si y'en à une
                // if (tempUrl) {
                //     console.log("reprsie de fonction en cours");
                //     console.log("tempUrl : ", tempUrl);
                //     console.log("tempForm : ", tempForm);
                //     setUrl(tempUrl);
                //     setForm(tempForm);
                //     setTempUrl(null);
                //     setTempForm({});
                // }
            } else if (url.current === "Folder") {
                // Récupération des deviations
     

                // console.log("data folder :", data);
                // si c'est le première requête sur les deviants
                if (nextOffset === -1)  {
                    setDeviants([...data.results]);
                } else { // si il y'en a d'autre à faire
                    setDeviants([...deviants, ...data.results]);
                }
                setNextOffset(data.next_offset);                               // y'a t'il d'autre deviants à récupérer
                
            } else if (url.current === "Copy") {
                // Copie des deviations
                if (deviants.length > ((nextOffsetC + 1) * 24)) { //copie des éléments pas groupe de 24
                    setNextOffsetC(nextOffsetC + 1);
                } else { //fin de copie
                    setNextOffsetC(0);
                }
            } 
        }
    }, [data])

    // useEffect |================| Gestion erreur
    // useEffect(() => {
    //     if (error) {
    //         // setError(false);
    //         // token invalidé durant la connection
    //         if (data.error === "invalid_token") {
    //             console.log("Sect erreur durant utilisation invalide token");
    //             console.log("tempUrl - invalid_token: ", tempUrl);
    //             console.log("tempForm - invalid_token: ", tempForm.getAll());
    //             //demander un nouveau token
    //             setUrl("Token")

    //             //form pour récupération d'un nouveau Token
    //             const formData = new FormData();
    //             formData.append('client_id', clientId);
    //             formData.append('client_secret', clientSecret);
    //             formData.append('grant_type', grant_type_refresh);
    //             formData.append('refresh_token', accessRefresh);
    //             setForm(formData)    
                
    //         }
            
    //     }
    // }, [error])

    // useEffect |================| vérification que l'on possède tous les déviants
    useEffect(() => {
        
        // Reste t'il des requêtes à éffectuer
        if (nextOffset !== -1) {
            console.log("deviants : ", deviants);

            // Récupération des deviations
            if (nextOffset) {
                console.log("x demande requete")
                // Sélection de l'url pour récupérer des éléments dans un dossier
                url.current = "Folder"

                const queryParams = new URLSearchParams({
                                        "access_token" : window.localStorage.getItem("access_token"),
                                        "offset": nextOffset,
                                        "limit" : 24,
                                        "mature_content" : true}).toString();

                // call api pour récupérer les deviations
                fetch_data({}, queryParams)
            // Fin de récupération des deviations
            } else {
                setNextOffset(-1)
                // console.log("tempFolder before treatement : ", deviants)
                let tempdeviants = selections[1].func([...deviants]);
                setDeviants([...tempdeviants]);
                // console.log("tempFolder after treatement : ", tempdeviants)
                console.log("End request");
                // Sélection de l'url pour copier des éléments dans un dossier
                url.current = "Copy"

                //formulaire pour réorganiser
                const formData = new FormData();
                formData.append('access_token', window.localStorage.getItem("access_token"));
                formData.append('target_folderid', selections[0].folderid);
                formData.append("mature_content", true);
                for (let i = Math.max((tempdeviants.length - 24), 0); i < tempdeviants.length; i++) {
                    formData.append(`deviationids[${i}]`, tempdeviants[i].deviationid)
                }

                // call api pour copier les deviations
                fetch_data(formData)

            }
        }
    }, [nextOffset])


    // useEffect |================| Copie de toutes les déviations
    useEffect(() => {
        if (nextOffsetC > 0)
        {
            // Sélection de l'url pour copier des éléments dans un dossier
            url.current = "Copy"

            // création du formData pour la requetes POST
            const formData = new FormData();
            formData.append('access_token', window.localStorage.getItem("access_token"));
            formData.append('target_folderid', selections[0].folderid);
            formData.append("mature_content", true);

            const start = Math.max((deviants.length - 24 * (nextOffsetC + 1)), 0);
            const end = deviants.length - 24 * nextOffsetC
            for (let i = start; i < end; i++) {     
                formData.append(`deviationids[${i}]`, deviants[i].deviationid)
            }

            // call api pour copier les deviations
            fetch_data(formData)
        }
    }, [nextOffsetC])

    // useEffect |================| charger les dossiers après la connection
    useEffect (() => {
        if (chargeFolders) {
            // Sélection de l'url pour récupérer les dossiers
            url.current = "Folders"

            // Aucun dossiers au début
            setFolders([]);

            //form pour récupération les dossiers
            const formData = new FormData();
            formData.append('access_token', window.localStorage.getItem("access_token"));
            formData.append('ext_preload', false);
            formData.append('limit', 50);
            
            // call api pour récupérer les dossiers
            fetch_data(formData)
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
                // const formData = new FormData();
                // formData.append('access_token', accessToken);

                // Sélection de l'url pour récupérer des éléments dans un dossier
                url.current = "Folder"

                const queryParams = new URLSearchParams({
                                        "access_token" : window.localStorage.getItem("access_token"),
                                        "offset": 0,
                                        "limit" : 24,
                                        "mature_content" : true}).toString();

                // call api pour récupérer les deviations
                fetch_data({}, queryParams)
            }
             
        }
        
    }

    return (
        <div className='ccontainer' onKeyDown={launchSelect} tabIndex="0"> 
            <Header access_token={window.localStorage.getItem("access_token")}/>
            {
                !window.localStorage.getItem("access_token") ? 
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
