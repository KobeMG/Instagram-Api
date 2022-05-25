const Instagram = require('instagram-web-api')
require('dotenv').config();
const username = process.env.INSTAGRAM_USERNAME
const password = process.env.INSTAGRAM_PASSWORD

const FileCookieStore = require('tough-cookie-filestore2')

const cookieStore = new FileCookieStore('./cookies.json')
const client = new Instagram({ username, password, cookieStore })

client.login().then(() => {
    console.log('Logged in!')

    const instagramPostPictureFunction = async () => {
        const photo ='pikachu.jpg'
        //const photo = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/700.png'
        await client
            .uploadPhoto({ photo: photo, caption: 'testing', post: 'feed' });
    };
    instagramPostPictureFunction();

});

//Funcion que convierte una imagen png a jpg