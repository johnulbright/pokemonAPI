let mainUrl = "https://pokeapi.co/api/v2/pokemon/";
let pokemonCount;
let numberPokemon;
let pokemon = [];
let catchRates = [];
let pokemonIDs = [];
const section = document.querySelector("section");
let balls = [
  { type: "poke-ball", url: "https://pokeapi.co/api/v2/item/4" },
  { type: "great-ball", url: "https://pokeapi.co/api/v2/item/3" },
  { type: "ultra-ball", url: "https://pokeapi.co/api/v2/item/2" }
]

let source;
let destination;
let ballClick = false;
let ballSource = "none";
let captureCount = 0;
let remainingBalls = 0;

let startButton = document.querySelector(".start");
startButton.addEventListener("click", start);

document.body.addEventListener("load", start);
//window.onload = start;

function start(e) {
  e.preventDefault();
  numberPokemon = document.getElementById("quantity").value;
  remainingBalls = numberPokemon*balls.length;
  document.querySelector(".start").style.display="none";
  document.getElementById("numberform").style.display="none";
  document.querySelector(".banner").innerText = "Click on a ball to select it.  Then click on a pokemon to try to catch it.";
  fetch(mainUrl)
    .then((res) => res.json())
    .then((json) => {
      pokemonCount = 898;
      selectPokemon(numberPokemon);
      getPokemonInfo(pokemonIDs);
      getBalls(balls);
    });
}

function getBalls(arrayOfBalls) {
  for (ball of arrayOfBalls) {
    ball.count = numberPokemon;
    fetch(ball.url)
      .then(res => res.json())
      .then(json => {
        let card = document.createElement("div");
        let picture = document.createElement("img");
        let count = document.createElement("h2");
        picture.src = json.sprites.default;
        card.className = "ball";
        card.id = json.name;
        count.innerText = ball.count;
        count.className = json.name;
        card.appendChild(picture);
        card.appendChild(count);
        document.querySelector('.balls').appendChild(card);
        picture.addEventListener("click", () => {
          if (ballClick) {
            let textToChange = document.getElementsByClassName(ballSource)[0].innerText;
            let newValue = parseInt(textToChange, 10) + 1;
            textToChange = newValue;
            document.getElementsByClassName(ballSource)[0].innerText = newValue;
          }
          if (count.innerText > 0) {
            ballClick = true;
            ballSource = card.id;
            count.innerText--;
            ball
            document.body.style.cursor = 'url("' + picture.src + '"), default';
          }
        })
      })
  }
}

function selectPokemon(x) {

  for (let i = 0; i < x; i++) {
    pokemonIDs.push(Math.floor(Math.random() * pokemonCount));
  }
  let product = 1;
  for (let k = 0; k < x; k++) {
    product *= pokemonIDs[k];
  }
  let result = [];
  for (num of pokemonIDs) {
    let match = false;
    for (unum of result) {
      if (num == unum) {
        match = true;
      }
    }
    if (!match) {
      result.push(num);
    }
  }
  if (result.length != x || product === 0) { selectPokemon(x) };
}


function getPokemonInfo(arrayOfIds) {
  for (let i = 0; i < numberPokemon; i++) {
    let thisPokemon = { id: arrayOfIds[i] };
    let specificURL = mainUrl + arrayOfIds[i];
    fetch(specificURL)
      .then((res) => res.json())
      .then(json => {
        thisPokemon.image = json.sprites.front_default;
        thisPokemon.name = json.name;
        let speciesUrl = json.species.url;
        fetch(speciesUrl)
          .then((res) => res.json())
          .then(json => {
            thisPokemon.catchRate = json.capture_rate;
            thisPokemon.color = json.color.name;
            thisPokemon.captured = false;
            pokemon.push(thisPokemon);
            displayOnePokemon(thisPokemon);
          })
      })

  }
  // console.log(pokemon);
}
function displayOnePokemon(anyPokemonAsObject) {
  let card = document.createElement("div");
  card.style.borderColor = anyPokemonAsObject.color;
  let picture = document.createElement("img");
  let name = document.createElement("h2");
  picture.src = anyPokemonAsObject.image;
  name.innerText = anyPokemonAsObject.name.charAt(0).toUpperCase() + anyPokemonAsObject.name.slice(1);
  card.className = "card";
  card.id = anyPokemonAsObject.id;
  card.appendChild(picture);
  card.appendChild(name);
  section.appendChild(card);
  card.addEventListener("click", () => {
    // console.log(anyPokemonAsObject);
    if (ballClick && !anyPokemonAsObject.captured) {
      decideResult(anyPokemonAsObject.catchRate, ballSource, card.id)
      // console.log(anyPokemonAsObject);  
    }
  })
}


function decideResult(catchrate, ballType, idNumber) {
  remainingBalls--;
  let maxN;
  //Note: This method is taken from Generation 1 of https://bulbapedia.bulbagarden.net/wiki/Catch_rate
  if (ballType == "ultra-ball") {
    maxN = 150;
  } else if (ballType == "great-ball") {
    maxN = 200
  } else {
    maxN = 255;
  }
  let N = Math.random() * maxN;
  if (document.getElementById(ballType).innerText == 0) {
   console.log(ballType);
   console.log(document.getElementById(ballType));
    //document.getElementById(ballType).disabled="true";
    document.getElementById(ballType).style.display = "none";
  }
  document.getElementById(idNumber).classList.add("spinning");
  document.body.style.cursor = 'default';
  setTimeout(() => {
    document.getElementById(idNumber).classList.remove("spinning");
    if (N > catchrate) {
      //escape
      console.log("escape");
    } else {
      captureCount++;
      for (item of pokemon) {
        if (item.id == idNumber) {
          item.captured = true;
        }
      }
      let overlay = document.createElement("h1");
      overlay.innerText = "Captured!"
      document.getElementById(idNumber).appendChild(overlay);
    }
    console.log(captureCount);
    console.log(remainingBalls);
    console.log(numberPokemon);

    ballClick = false;
    if (remainingBalls == 0 && captureCount != numberPokemon) {failed();}
    if (captureCount == numberPokemon) { allCaptured(); }
  }, 1000);


}

function allCaptured() {
  console.log("all captured ran")
  document.body.style.cursor = 'default';
  for (ball of balls) {
    document.getElementById(ball.type).style.display = "none";
  }
  document.querySelector(".reset").style.display="block";
  document.querySelector(".banner").innerText= "You caught 'em all!";
}

function failed() {
  document.querySelector(".reset").style.display="block";
  document.querySelector(".banner").innerText= "You didn't catch 'em all!  Better luck next time!";
}