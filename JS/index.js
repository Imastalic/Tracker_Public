// COMPLETED
// API based -> https://rapidapi.com/DavidGelling/api/instagram-scraper-20251/playground/apiendpoint_fed60638-fcfa-49a0-9f32-fb2950352a3f
const { LocalStorage } = require('node-localstorage');
const localStorage = new LocalStorage('../scratch');


const Difference = (arr1 , arr2) => {
    const diff = [
      ...arr1.filter(x => !arr2.includes(x)),
      ...arr2.filter(x => !arr1.includes(x))
    ];

    return diff
}
async function getAllFollowers(username) {

    let nextToken = null;
    let allFollowers = []
    let usernames = []
    let allnames = []

    let API_KEY; // --> IMPORTANT !!
    let url = `https://instagram-scraper-20251.p.rapidapi.com/userfollowers/?username_or_id=${username}`;
    const options = {
       method: 'GET',
       headers: {
            'x-rapidapi-key': API_KEY,
            'x-rapidapi-host': 'instagram-scraper-20251.p.rapidapi.com'
       }
};

  while (true) {
    const response = await fetch(url, options);
    const result = await response.json();

    console.log("Fetched", result.data.items.length, "followers");

    // add current page followers
    allFollowers.push(...result.data.items);

    // check pagination
    nextToken = result.pagination_token;
    if (!nextToken) break;

    // update URL for the next page
    url = `https://instagram-scraper-20251.p.rapidapi.com/userfollowers/?username_or_id=${username}&pagination_token=${nextToken}`;
  }

  for (let i = 0; i < allFollowers.length; i++) {
     usernames.push(allFollowers[i].username)
     allnames.push({username : allFollowers[i].username , full_name : allFollowers[i].full_name})
  }


  let avelord = Difference(usernames , JSON.parse(localStorage.getItem('myfollowers_usernames')))
  let obj = {}
  console.log(avelord);

  if (avelord.length === 0) {
    obj = {avelord : avelord}
  }else{
    if (JSON.parse(localStorage.getItem('myfollowers_usernames')).length < usernames.length ) {
      obj = {
        unfollowed: false,
        followed: true,
        user: avelord
      }
    }else{
      obj = {
        unfollowed: true,
        followed: false,
        user: avelord
      }
    }
  }
  

  localStorage.setItem('old_list' , JSON.stringify(JSON.parse(localStorage.getItem('myfollowers'))))
  localStorage.setItem('avelord_users' , JSON.stringify(avelord))
  localStorage.setItem('myfollowers' , JSON.stringify(allFollowers))
  localStorage.setItem('myfollowers_usernames' , JSON.stringify(usernames))
  localStorage.setItem('myfollowers_allnames' , JSON.stringify(allnames))

  

  return obj
}

module.exports = {
  getAllFollowers
}
