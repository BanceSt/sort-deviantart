export const urls = {
    "Authorization" : (response_type, client_id, redirect_uri, scope) => {
        return `https://www.deviantart.com/oauth2/authorize?response_type=${response_type}&client_id=${client_id}&redirect_uri=${redirect_uri}&scope=${scope}`;
    },
    "Test" : () => {
        return `https://www.deviantart.com/api/v1/oauth2/placebo?`;
    },
    "Token" : (client_id, client_secret, grant_type, code, redirect_uri) => {
        return `https://www.deviantart.com/oauth2/token?client_id=${client_id}&client_secret=${client_secret}&grant_type=${grant_type}&code=${code}&redirect_uri=${redirect_uri}`;
    },
    "Folders" : "https://www.deviantart.com/api/v1/oauth2/collections/folders?",
}