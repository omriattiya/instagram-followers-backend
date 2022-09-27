import {instagramRequests} from "./instagramRequests.js";
import express from 'express';
import cors from 'cors';

const app = express();

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

app.listen(process.env.port || 8080);
