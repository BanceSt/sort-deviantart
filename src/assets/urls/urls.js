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
    "Token" : (queryParams) => {
        return `https://www.deviantart.com/oauth2/token?${queryParams}`;
    },
    "Folders" : (queryParams) => {
        return `https://www.deviantart.com/api/v1/oauth2/collections/folders?${queryParams}`;
    },
    "Folder" : (queryParams) => {
        return `https://www.deviantart.com/api/v1/oauth2/collections/${folderId}?${queryParams}`;
    },
}