const { LocalStorage } = require('node-localstorage');
const localStorage = new LocalStorage('../scratch');
const TelegramBot = require(`node-telegram-bot-api`)
const {getAllFollowers} = require(`./index`)
const {CheckFollowersCount} = require(`./eye`)


let token; // --> IMPORTANT !!!
const bot = new TelegramBot(token , {polling : true})




const start = () => {

    // GLOBAL state (doesn't reset per message)
let username // --> instagram username here
let PASSWORD // --> IMPORTANT !!! create your password, and bot will want it after you type /start
let passwordCorrect = false;
let waitingPassword = false;
let cancelled = false;
let intervalId = null;
    
    bot.setMyCommands([
        {command: `/start` , description: `to start the bot`},
        {command: `commands` , description: `to get all the commands`},
        {command: `/update` , description: `to update the list and check unfollows/follows`},
        {command: `/followers` , description: `to check your followers list`},
        {command: `/allnames` , description: "to see full name and username of followers"},
        {command: `/followerscount` , description: "to see how many followers account has got"},
        {command : `/cancel` , description: "to cancel the function 1/24"},
        {command: `/on` , description: "to activate the function 1/24"},
        {command: `/info` , description: "to get all information about the bot"}
    ])

    let chatid;
    bot.on('message' , async msg => {

        chatid = msg.chat.id   
        const text = msg.text

        // --- /start = ask for password ---
        if (text === `/start`) {
            waitingPassword = true
            return bot.sendMessage(chatid , `Please enter the password before begining`)
        }

        if (waitingPassword) {
            if (text === PASSWORD) {
                passwordCorrect = true;
                waitingPassword = false;
                return bot.sendMessage(chatid, `welcome to my bot that helps you to track your followers list, first of all, please type /update so I get all your followers list. Type /info to see how this bot actually works`);
            } else {
                return bot.sendMessage(chatid, "Wrong password. Try again.");
            }
        }

        // --- BLOCK EVERYTHING IF NOT AUTHENTICATED ---
        if (!passwordCorrect) {
            return bot.sendMessage(chatid, "Please type /start and enter password first.");
        }


        const info_text = `
        Tracker bot is a tool that allows you to control your followers list by simple commands (type /commands to see all the commands available)

How does it work:

Tracker bot connects to API from rapidapi.com and tracks your followers list, but it doesnt mean that it keeps eye on the list 24/7.You have to do it manually by using the commands list.
By typing /update you get notification where bot says, "you've got an unfollow" or other text, it depends from situation.If you want the bot to send you updates once every 24h type /on to activate that function and /cancel to cancel.

IMPORTANT NOTES!:

1) by typing /update you also update your follower list, it means that if you havent updated your list and got a new follow/unfollow the list will still be the old one,
so for example by typing /followerscount you will get 115 instead of 116.Don't forget to update your list sometimes

2) you dont't have unlimited request access, the limit is 50 requests monthly for command /update and you also get 50 requests monthly for getting your daily notification
        `

        const command_text =  `
        here are the helpfull commands to control this bot! 
        /start -> start the bot 
        /update -> updates your list, and shows unfollows/follows
        /followers -> shows all of your followers usernames
        /allnames -> shows both full name and username of 
                                followers
        /cancel -> cancels a function to send update every 24h
        /on -> to activate 1/24 function
        /info -> to read how this bot works
        `

        if (text === `/info`) {
            return bot.sendMessage(chatid , info_text)
        }
        else if (text === `/cancel`) {

            cancelled = true;
            clearInterval(intervalId);
            intervalId = null;
            return bot.sendMessage(chatid, "Daily automatic updates disabled.");

        }else if (text === `/on`) {

        if (!intervalId) {
                intervalId = setInterval(async () => {
                    const count = await CheckFollowersCount(username);
                    if (typeof count !== "string" && typeof count !== "number") {
                        return bot.sendMessage(chatid, "Your API subscription ended.");
                    }

                    let prev = JSON.parse(localStorage.getItem('myfollowers_length'));
                    if (Number(count) !== Number(prev)) {
                        localStorage.setItem('myfollowers_length', count);

                        const av = await getAllFollowers(username);
                        if (typeof av !== "object") {
                            return bot.sendMessage(chatid, "Your subscription ended.");
                        }

                        if (av.unfollowed || av.followed) {
                            return bot.sendMessage(chatid, `Activity detected: ${av.user}`);
                        } else {
                            return bot.sendMessage(chatid, "No changes since last check.");
                        }
                    }

                }, 24 * 60 * 60 * 1000); // every 24h
            }

            return bot.sendMessage(chatid, "Daily automatic updates enabled.");


        }else if (text === `/commands`) {
            return bot.sendMessage(chatid , command_text)
        }else if (text === `/update`) {
           await bot.sendMessage(chatid , `please wait, checking followers may take few seconds...`)
           getAllFollowers(username).then(av => {

            if (typeof av !== "object") {
                return bot.sendMessage(chatid , `your subscription plan had ended, please update it on https://rapidapi.com/DavidGelling/api/instagram-scraper-20251/playground/apiendpoint_468cd28f-1103-44c9-8492-9495ad57a61f`)
            }
             

            if (av.unfollowed || av.followed) {
                if (av.unfollowed == false) {
                   return bot.sendMessage(chatid , `you have got new follower(s): ${av.user}`)
                }else{
                   return bot.sendMessage(chatid , `you have got unfollow(s): ${av.user}`)
                }
            }else{
                return bot.sendMessage(chatid , `you have got 0 follows/unfollows`)
            }
           })
        }else if (text === `/followers` || text === `/allnames`) {
            
    let initial_array;

    if (text === `/followers`) {
        // array of STRINGS
        initial_array = JSON.parse(localStorage.getItem('myfollowers_usernames'));
    } else {
        // array of OBJECTS
        initial_array = JSON.parse(localStorage.getItem('myfollowers_allnames'));
    }

    let initial_text = `here are all your followers:`;    

    for (let i = 0; i < initial_array.length; i++) {

        if (text === `/followers`) {
            // followers = usernames only
            initial_text += `\n @${initial_array[i]}`;
        } else {
            // allnames = objects with username + full_name
            const item = initial_array[i];
            const name = item.full_name ? ` — ${item.full_name}` : "";
            initial_text += `\n @${item.username}${name}`;
        }

    }

            return bot.sendMessage(chatid, initial_text);
        }else if (text === `/followerscount`) {
            return bot.sendMessage(chatid, `your followers count: ${JSON.parse(localStorage.getItem('myfollowers')).length}`)
        }else{
            return bot.sendMessage(chatid, `sorry i don't understand you, please type /commands to see all commands available`)
        }

    })
    
}
start()
