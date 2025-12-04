async function CheckFollowersCount(username) {
    let API_KEY;
    let url = `https://instagram-scraper-20251.p.rapidapi.com/userfollowers/?username_or_id=${username}`;
    const options = {
      method: 'GET',
      headers: {
        'x-rapidapi-key': API_KEY,
        'x-rapidapi-host': 'instagram-scraper-20251.p.rapidapi.com'
      }
};

    let nextToken = null;
    let allFollowers = []

 while (true) {
    const response = await fetch(url, options);
    const result = await response.json();

    // // add current page followers
    allFollowers.push(...result.data.items);

    // check pagination
    nextToken = result.pagination_token;
    if (!nextToken) break;

    // update URL for the next page
    url = `https://instagram-scraper-20251.p.rapidapi.com/userfollowers/?username_or_id=${username}&pagination_token=${nextToken}`;
  }

  return allFollowers.length
}


module.exports = {
    CheckFollowersCount
}