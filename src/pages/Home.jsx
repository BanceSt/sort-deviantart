import React, { useEffect, useState, useRef } from 'react';
import Header from '../Components/Header';
import { setFolderId, urls } from '../assets/urls/urls';
import { grant_type_autho, grant_type_refresh, redirect_uri } from '../assets/params/params';
import "../styles/Home.css"
import Box from '../Components/Box';
import { sorts_types } from '../assets/params/func_sort';
import "../db/db"
import Notification from '../Components/Notification';
import LoadingBar from '../Components/LoadingBar';


const CLIENT_ID = window.localStorage.getItem("Client_id");
const CLIENT_SECRET = window.localStorage.getItem("Client_secret");

function Home(props) {
    // Vérification de l'url
    const urlParam = new URLSearchParams(window.location.search);

    // Récupération des identifiants
    const code = urlParam.get('code');

    // variable pour gérer les requêtes
    const url = useRef("");
    const error = useRef(false);
    const block_call_api = useRef(false);
    const folder_length = useRef(0);
    const [infoNotif, setInfoNotif] = useState({});

    const [data, setData] = useState(null);
    const [folders, setFolders] = useState(null);
    const [deviants, setDeviants] = useState([]);
    const [nextOffset, setNextOffset] = useState(-1);
    const [selections, setSelections] = useState([
        "", "", ""
    ]);
    const [progressBar, setProgressBar] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);

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
            error.current = true
            setInfoNotif({
                "type" : "error",
                "message" : err.message,
                "activate" : true
            })
        } 
    }

    // function de récupération des dossiers
    function fetchFolder() {
        // Sélection de l'url pour récupérer les dossiers
        url.current = "Folders"

        // Aucun dossiers au début
        setFolders([]);

        
        const queryParams = new URLSearchParams({
                                        "access_token" : window.localStorage.getItem("access_token"),
                                        "ext_preload": false,
                                        "calculate_size" : true,
                                        "limit" : 50}).toString();
        
        // call api pour récupérer les dossiers
        fetch_data({}, queryParams)
    }

    // function pour récupérer des deviations
    function charge_deviations() {
        const queryParams = new URLSearchParams({
                                        "access_token" : window.localStorage.getItem("access_token"),
                                        "offset": nextOffset,
                                        "limit" : 24,
                                        "mature_content" : true}).toString();

        // call api pour récupérer les deviations
        fetch_data({}, queryParams)
    }

    // function pour copier des deviations
    function copy_deviations() {
        // création du formData pour la requetes POST
        const formData = new FormData();
        formData.append('access_token', window.localStorage.getItem("access_token"));
        formData.append('target_folderid', selections[0].folderid);
        formData.append("mature_content", true);
        
        const start = Math.max((deviants.length - 24 * (nextOffset + 1)), 0);
        const end = deviants.length - 24 * nextOffset
        
        for (let i = start; i < end; i++) {     
            formData.append(`deviationids[${i}]`, deviants[i].deviationid)
        }
        
        // call api pour copier les deviations
        fetch_data(formData)
    }

    // ===================================== useEffect ===================================== 
    // useEffect |================| Récupération de token
    useEffect(() => {
        // 
        const token_age = window.localStorage.getItem("access_token_time") ?? (Date.now() / 1000);

        // Vérification pour la premier connection
        if (code && !window.localStorage.getItem("access_token")) {
            console.log("Token premier connection");
            // Sélection de l'url
            url.current = "Token"

            //form pour récupération de Token
            const formData = new FormData();
            formData.append('client_id', CLIENT_ID);
            formData.append('client_secret', CLIENT_SECRET);
            formData.append('code', code);
            formData.append('grant_type', grant_type_autho);
            formData.append('redirect_uri', redirect_uri);
            
            // call api pour recevoir un token
            fetch_data(formData)
        }

        // Token plus à jour 
        else if ( ((Date.now() / 1000) - token_age) > 3600) {
            console.log("token par refresh");
            // Sélection de l'url
            url.current = "Token"

            //form pour récupération d'un nouveau Token
            const formData = new FormData();
            formData.append('client_id', CLIENT_ID);
            formData.append('client_secret', CLIENT_SECRET);
            formData.append('grant_type', grant_type_refresh);
            formData.append('refresh_token', window.localStorage.getItem("refresh_token"));

            // call api pour rafraîchir le token
            fetch_data(formData)    
        }
        // Token toujours bon
        else if (window.localStorage.getItem("access_token")) {
            console.log("token non necessaire");
            fetchFolder();
        }
    }, [])

    // =====================================  response treatment
    useEffect(() => {
       
        if (data && !(error.current)) {
            // 
            if ((url.current === "Token") && data.access_token) {
                // sauvegarde des tokens et du temps de sauvagarde
                console.log("TOKEN SAVE");

                const tokenTime = Date.now() / 1000;
                window.localStorage.setItem("access_token", data.access_token);
                window.localStorage.setItem("refresh_token", data.refresh_token);
                window.localStorage.setItem("access_token_time", tokenTime);

                //Chargement des dossiers
                fetchFolder();
            } else if (url.current === "Folders") {
                // Récupérations des dossiers
                setFolders(data.results);
                console.log("Folders-zone : ", data);
                
            } else if (url.current === "Folder") {
                // Récupération des deviations
                setProgressBar(progressBar + (data.results.length / folder_length.current * 100));
                if (data.next_offset) {
  
                    // si c'est le première requête sur les deviants
                    
                    if (nextOffset === 0)  {
                        setDeviants([...data.results]);
                    } else { // si il y'en a d'autre à faire
                        setDeviants([...deviants, ...data.results]);
                    }
                    setNextOffset(data.next_offset);  // y'a t'il d'autre deviants à récupérer
                }
                else  {

                    let tempdeviants = selections[1].func([...deviants, ...data.results]);
                    url.current = "Copy";
                    setDeviants([...tempdeviants]); 
                    setNextOffset(tempdeviants.length > 24 ? 0 : -2);        
                }
                
            } else if (url.current === "Copy") {
                // Copie des deviations
                if (deviants.length > ((nextOffset + 1) * 24)) { //copie des éléments pas groupe de 24
                    // update de la barre de progression
                    setProgressBar(progressBar + (24 / folder_length.current * 100));
                    setNextOffset(nextOffset + 1);
                } else { //fin de copie
                    // update de la barre de progression
                    setProgressBar(progressBar + ((deviants.length - (nextOffset * 24)) / folder_length.current * 100));
                    setNextOffset(-1);
                    setDeviants([]);
                    block_call_api.current = false;

                    setTimeout(() => {
                        setIsProcessing(false);
                        setInfoNotif({
                            "type" : "success",
                            "message" : "Rangement de \"" + selections[0].name + "\" terminé !",
                            "activate" : true
                        })
                    }, 1000)
                    console.log("....End")
                }
            } 
        } else if (error.current) {
            // Erreur dans la requête
            setInfoNotif({
                "message" : data.error
            })
        }
    }, [data])


    // useEffect |================| vérification que l'on possède tous les déviants
    useEffect(() => {
        
        // Reste t'il des requêtes à éffectuer
        if (nextOffset >= 0) {
            // console.log("Deviations : ", deviants)
            if (url.current === "Folder") charge_deviations();
            else if (url.current === "Copy") copy_deviations();
        } else if (nextOffset === -2) setNextOffset(0);
    }, [nextOffset])

    // useEffect |================| Notification
    useEffect(() => {
        let timeout = false
        if ((Object.keys(infoNotif).length !== 0) && (infoNotif.activate)) {
            timeout = setTimeout(() => {
                let tempInfoNotif = {...infoNotif}
                // on enlève la notification
                tempInfoNotif.activate = false
                setInfoNotif(tempInfoNotif)
            }, 3000)
        }


        return () => {
            if (timeout && (infoNotif.activate)) {
                clearTimeout(timeout)
            }
        }
    }, [infoNotif])

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
        if (((event.key === "Enter") || (event.target.className === "btn_start")) 
            && (!block_call_api.current)) {
            if (selections[0] && selections[1]) {
                setInfoNotif({
                    "type" : "info",
                    "message" : "Lancemenet du rangement de " + selections[0].name + " avec la function " + selections[1].name + ".",
                    "activate" : true
                })

                // on block la possibilité de réaliser des commandes
                block_call_api.current = true;

                // Sélection du dossier
                setFolderId(selections[0].folderid);

                // on récupère la taille du dossier pour la barre de progression
                folder_length.current = selections[0].size * 2; // multiplication par 2 pour compter la récupération et la copie
                setProgressBar(0);
                setIsProcessing(true);

                // Sélection de l'url pour récupérer des éléments dans un dossier
                url.current = "Folder"

                // Démarrage de récupération des dossiers
                setNextOffset(0)
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
                    <div className='notification_div'>
                        <Notification 
                            notification_type={infoNotif.type} 
                            notification_message={infoNotif.message} 
                            activated={infoNotif.activate}/>
                    </div>
                    {/* <Notification notification_type={infoNotif.type} notification_messsage={infoNotif.message} activated={infoNotif.activate}/> */}
                    <div className="center_main">
                        <div className="grp_box">
                            <Box index={0} name='FOLDERS' elements={folders ? folders : []} choice={selections[0]} onClick={handleSelect}/>
                            <Box index={1} name="SORT BY" elements={folders ? sorts_types : []} choice={selections[1]} onClick={handleSelect}/>
                            <Box index={2} name="LOG" />
                        </div>
                    </div>

                    {/*LoadingBar */}
                    <LoadingBar progress={progressBar} activated={isProcessing}/>

                    {/* bouton d'éxécution */}
                    <button className="btn_start" onClick={launchSelect}>
                        LANCER
                    </button>
                </div>
            }
        </div>
    );
}

export default Home;
