import {instagramRequests} from "./instagramRequests.js";
import express from 'express';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 8080;

app.use(cors());

app.get('/', function (req, res) {
    res.send('Hello World')
});

app.get('/api/instagram', async function (req, res) {
    console.log('request start');
    let users = await instagramRequests.getFollowersAndFollowing()
    res.send(users);
    console.log('request end');
});

app.get('/api/instagram/env', async function (req, res) {
    res.send(process.env);
});

app.listen(port, () => console.log(`app started on port ${port}`));
