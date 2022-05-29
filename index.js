const express = require('express');
const cors = require('cors');
const app = express();
const Jimp = require("jimp");
const axios = require('axios'); //Usando axios porque fetch no funciona en el servidor
const fs = require('fs'); //Para eliminar archivos
require('dotenv').config();
const username = process.env.INSTAGRAM_USERNAME
const password = process.env.INSTAGRAM_PASSWORD


//Instagram
const FileCookieStore = require('tough-cookie-filestore2');
const cookieStore = new FileCookieStore('./cookies.json');
const Instagram = require('instagram-web-api')
const client = new Instagram({ username, password, cookieStore });

//Server
app.use(express.json());
const port = process.env.PORT || 4000;
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});

// Stats del pokemon
let weight = 0;
let height = 0;
let pokemonName = "";

app.use(cors({
    //  origin: 'https://pokemonwild-app.netlify.app',
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

// End points
app.get('/hello', (req, res) => {
    res.send('Hello World!');
});
app.post('/posting', (req, res) => {

    //  const trainerName = req.body.trainerName;
    // const pokemonID = req.body.pokemonID;
    //const trainerName = "Juan";
    //const pokemonID = "1";
    console.log(trainerName, pokemonID);
    console.log("He recibido una petición de: " + trainerName + " con el pokemonID: " + pokemonID);
    console.log("----------------------");
    // res.send({ received: true, message: '¡Pokemon recibido! Podrás revisarlo en la cuenta @pokemonwebapp en Instagram.' });
    res.send({ received: true, message: 'Entrenador: ' + trainerName + ' Pokemon: ' + pokemonID });
    getPokemonImage(pokemonID);
    fetchPokemonStats(pokemonID);

    //Subiendo pokemon a instagram
    client.login().then(() => {  //Es necesario ingresar a la cuenta de instagram primero
        console.log('Logged in!');
        const caption = "¡" + trainerName + " ha capturado un " + pokemonName +
            " salvaje! \n" + "Su peso es de: " + weight + "kg. \n" + "Su altura es de: " + height + "m." +
            "\n" + "#nodejs #reactjs #pokemon #pokemonwebapp";

        const instagramPostPictureFunction = async () => {
            const photo = 'image.jpg';
            //const photo = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/001.png'
            await client
                .uploadPhoto({ photo: photo, caption: caption, post: 'feed' });
            deleteFile('image.jpg');
        };
        instagramPostPictureFunction();

    });
});

const fetchPokemonStats = async (pokemonID) => {


    const res = await axios.get("https://pokeapi.co/api/v2/pokemon/" + pokemonID);
    const pokemon = await res.data;

    pokemonName = pokemon.name;
    weight = parseFloat(pokemon.weight) * 0.1;
    height = parseFloat(pokemon.height) * 0.1;
    height = height.toFixed(1); //redondea a 1 decimal
    weight = weight.toFixed(1); //redondea a 1 decimal
    console.log("----------------------");
    console.log("¡Ha aparecido un " + pokemon.name + " salvaje!");
    console.log("De tipo: " + pokemon.types[0].type.name);
    console.log("Su peso es: " + weight + "kg");
    console.log("Su altura es: " + height + "m");
    console.log("----------------------");
};

const getPokemonImage = async (pokemonID) => {

    //Read the PNG file and convert it to editable format
    await Jimp.read("https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/" + pokemonID + ".png", function (err, image) {
        if (err) {
            // Return if any error
            console.log(err);
            return;
        }
        image.write("image.jpg");
    });
}

const deleteFile = (path) => {
    try {
        fs.unlinkSync(path)
        console.log('File removed')
    } catch (err) {
        console.error('Something wrong happened removing the file', err)
    }
};

