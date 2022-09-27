import fetch from 'node-fetch';
import {config} from "./config.js";

const REQUEST_HEADERS = {headers: config.headers};

const REQUEST = {
    friendshipsUrl: 'https://i.instagram.com/api/v1/friendships', followers: {
        queryUrl: `https://www.instagram.com/graphql/query/?query_hash=c76146de99bb02f6415203be841dd25a&variables=`,
        key: `edge_followed_by`,
        type: 'followers',
    }, following: {
        queryUrl: `https://www.instagram.com/graphql/query/?query_hash=d04b0a864b4b54837c0d870b0e77e076&variables=`,
        key: `edge_follow`,
        type: 'following',
    }
};

const MAX_REQUEST_SIZE = 200;

export const instagramRequests = (function () {

    return {
        getFollowersAndFollowing
    }

    async function getFollowersAndFollowing() {
        try {
            const {userId, followersCount, followingCount} = await getUserData();
            let followers = await getAccounts(userId, REQUEST.followers, followersCount);
            let following = await getAccounts(userId, REQUEST.following, followingCount);
            return {followers, following};
        } catch (err) {
            console.error(err);
        }
    }

    async function getAccounts(userId, request, count) {
        let followers = [];
        let hasReachLimit = false
        let nextMaxId = null;
        while (!hasReachLimit) {
            const url = `${REQUEST.friendshipsUrl}/${userId}/${request.type}/?count=${MAX_REQUEST_SIZE}&${nextMaxId ? `max_id=${nextMaxId}` : ''}`;
            const rawRes = await fetch(url, REQUEST_HEADERS);
            const res = await rawRes.json();
            nextMaxId = res.next_max_id;
            hasReachLimit = !nextMaxId;

            const currentUsers = res.users;
            const userDetails = currentUsers.map(user => ({
                username: user.username,
                fullName: user.full_name,
                profilePicUrl: user.profile_pic_url
            }));
            followers = followers.concat(userDetails);
        }

        return followers;
    }

    async function getUserData() {
        let res = await fetch(`https://i.instagram.com/api/v1/users/web_profile_info/?username=${config.username}`, REQUEST_HEADERS);
        res = await res.json();
        return {
            userId: res.data.user.id,
            followersCount: res.data.user.edge_followed_by.count,
            followingCount: res.data.user.edge_follow.count,
        };
    }

    async function getAccountsByQueryHash(userId, request) {
        let followers = [];
        let hasNext = true;
        let after = null;
        while (hasNext) {
            await fetch(request.queryUrl + encodeURIComponent(JSON.stringify({
                id: userId,
                include_reel: true,
                fetch_mutual: true,
                first: 50,
                after: after
            })), REQUEST_HEADERS).then(res => res.json()).then(res => {
                hasNext = res.data.user[request.key].page_info.has_next_page
                after = res.data.user[request.key].page_info.end_cursor
                followers = followers.concat(res.data.user[request.key].edges.map(({node}) => {
                    return {
                        username: node.username,
                        fullName: node.full_name,
                        profilePicUrl: node.profile_pic_url,
                    }
                }))
            })
        }
        return followers;
    }

})();
