async function CheckFollowersCount() {
    let url = 'https://instagram-scraper-20251.p.rapidapi.com/userfollowers/?username_or_id=__mherrr';
    const options = {
      method: 'GET',
      headers: {
        'x-rapidapi-key': 'fc13cee4d5mshfdd3b7b20b193bep1d4a8ajsncbd396eaa2a7', // --> mheaabbcc@gmail.com
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
    url = `https://instagram-scraper-20251.p.rapidapi.com/userfollowers/?username_or_id=__mherrr&pagination_token=${nextToken}`;
  }

  return allFollowers.length
}


module.exports = {
    CheckFollowersCount
}