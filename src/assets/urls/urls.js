let folderId = "";

export const setFolderId = (id) => {
    folderId = id;
}

export const urls = {
    "Authorization" : (response_type, client_id, redirect_uri, scope) => {
        return `https://www.deviantart.com/oauth2/authorize?response_type=${response_type}&client_id=${client_id}&redirect_uri=${redirect_uri}&scope=${scope}`;
    },
    "Test" : () => {
        return `https://www.deviantart.com/api/v1/oauth2/placebo?`;
    },
    "Token" : () => {
        return `https://www.deviantart.com/oauth2/token?`;
    },
    "Folders" : () => {
        return `https://www.deviantart.com/api/v1/oauth2/collections/folders?`;
    },
    "Folder" : (queryParams) => {
        return `https://www.deviantart.com/api/v1/oauth2/collections/${folderId}?${queryParams}`;
    }, "Copy" : () => {
        return "https://www.deviantart.com/api/v1/oauth2/collections/folders/copy_deviations";
    },
}

// ${queryParams}