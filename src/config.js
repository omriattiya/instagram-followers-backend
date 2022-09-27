export const config = {
    username: process.env.instagram_username || 'XXX',
    headers: {
        cookie: process.env.cookie || "XXX",
        "x-ig-app-id": process.env.appId || 'XXX'
    }
};
