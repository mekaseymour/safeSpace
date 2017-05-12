// declare constant DOM variables
const body = document.body;
const locationInputField = document.getElementById('location-input-field');
const submitLocationBtn = document.getElementById('submit-location-button');

// Get a reference to the firebase database
const database = firebase.database();
const databaseOrgs = firebase.database().ref('Orgs');
let mainOrgsObject;

// GOOGLE API: handle the location input field autocomplete
let options = {
  types: ['(cities)'],
  componentRestrictions: {country: 'us'}
};

let autocomplete = new google.maps.places.Autocomplete(locationInputField, options);
autocomplete.addListener('place_changed', () => {
  let place = autocomplete.getPlace();
  if(!place) console.log(`No available input for ${place.name}`);
  else console.log(`Woo, found ${place.name}`);
});

if(locationInputField.value) locationInputField.size = locationInputField.value.length;

// make AJAX call to FOURSQUARE
// make an instance of the XMLHttpRequest class
const xhr = new XMLHttpRequest();
xhr.open('GET', 'https://api.foursquare.com/v2/venues/search?ll=40.7,-74&oauth_token=42S2L2GUHLH0M3TEQTVFOR2I1QKMX4CJM5NUEVW5QOZVVXUI&v=20170510', true);
// setting callback to be run on success
xhr.onload = () => {
  //let responseObject = JSON.parse(xhr.response);
  //let venuesArr = responseObject.response;
  //console.log(venuesArr); // why is this coming back as undefined
}
// send off the request
xhr.send(JSON.stringify());

// create some dynamic templates
let createListItem = (title, subtitle) => {
  let listItem = document.createElement('li');
  let listItemTitle = document.createElement('h2');
  let listItemSubtitle = document.createElement('h4');
  //let listItemContent = document.createElement('p');

  listItemTitle.innerHTML = title;
  listItemSubtitle.innerHTML = subtitle;
  //listItemContent.innerHTML = content;

  listItem.appendChild(listItemTitle);
  listItem.appendChild(listItemSubtitle);
  //listItem.appendChild(listItemContent);

  return listItem;

}

// BUTTON CLICKS + EVENT HANDLERS

locationInputField.addEventListener('click', () => {
    locationInputField.style.width = '250px';
    locationInputField.style.textAlign = 'left';
    locationInputField.placeholder = 'search by location...';
    submitLocationBtn.style.display = 'inline';
});

// shink responsive buttons when clicks occur elsewhere
body.addEventListener('click', (e) => {
  if(e.target !== locationInputField && e.target !== submitLocationBtn) {

    if(locationInputField.value) {
      locationInputField.size = locationInputField.value.length;
    } else {
      locationInputField.style.width = '120px';
      locationInputField.style.textAlign = 'center';
      locationInputField.placeholder = 'find places';
      submitLocationBtn.style.display = 'none';
    }
  }

});

// SCREEN SCROLLS
// soft scroll with search btn click
$(document).ready(function() {
  $('#submit-location-button').click(function() {
    $('html, body').animate({scrollTop: $('#two').offset().top}, 'slow');
  });
});

// FUNCTIONS

// function that iterates over object in the database and creates a DOM template
function appendObjectDataToElement(anObject, domElement) {
  for(let item in anObject) {
    let companyName = anObject[item].name;
    let score = anObject[item].score;
    mainText.appendChild(createListItem(companyName, score))
    }
    //console.log('appendObjectDataToElement ran');
}
