// declare constant DOM elements
const body = document.body;
const firstDiv = document.getElementById('one');
const secondDiv = document.getElementById('two');
const locationInputField = document.getElementById('location-input-field');
const submitLocationBtn = document.getElementById('submit-location-button');
const errorMessage = document.getElementById('error-message');

// Get a reference to the firebase database
const database = firebase.database();
const databaseRootRef = database.ref('Orgs');
// dataArr stores refreshed firebase data
let dataArr = [];

// Get Firebase data
databaseRootRef.on('value', snapshot => {
  let newDataArr = [];
  snapshot.forEach(snapshotChild => {
    newDataArr.push(snapshotChild.val());
    //console.log(snapshotChild.val());
  });
  dataArr = newDataArr;
  console.log(dataArr);
});

// locationAutoSelected tracks whether or not the location entered into the
// locationInputField was a proper Google autocomplete result
let locationAutoSelected = false;
let searchResults = '';

// GOOGLE API - handle the location input field autocomplete
let options = {
  // will only return cities
  types: ['(cities)'],
  // will only return US locations
  componentRestrictions: {country: 'us'}
};

let autocomplete = new google.maps.places.Autocomplete(locationInputField, options);
autocomplete.addListener('place_changed', () => {
  let place = autocomplete.getPlace();
  locationAutoSelected = true;
  //if(!place) console.log(`No available input for ${place.name}`);
  //else console.log(`Woo, found ${place.name}`);
});

if(locationInputField.value) { locationInputField.size = locationInputField.value.length } ;

/*
// FOURSQUARE INTEGRATION
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
*/

// EVENT LISTENERS

// BODY: shink responsive buttons when clicks occur elsewhere
body.addEventListener('click', firstDivPageClicks);

// LOCATION INPUT FIELD: re-style locationInputField on click
locationInputField.addEventListener('click', () => {
    locationInputField.style.width = '250px';
    locationInputField.style.textAlign = 'left';
    locationInputField.placeholder = 'search by location...';
    submitLocationBtn.style.display = 'inline';
});

locationInputField.addEventListener('keypress', event => {
  if(event.keycode === 13) {
    handlesSubmitClick();
  }
});

// SUBMIT LOCATION BUTTON

function handlesSubmitClick() {
  clearErrorMessage();
  // clear the second div
  secondDiv.innerHTML = '';
  // show the second div
  secondDiv.style.display = 'block';
}
 // soft scroll from div one to div two
$(document).ready(function() {
  function scrollOneToTwo() {
    // if the location is valid (providded by Google autocomplete)
    if(locationAutoSelected) {
      handlesSubmitClick();
      $('html, body').animate({scrollTop: $('#two').offset().top}, 'slow');
      let results = dataArr;
      results.forEach(resultObj => {
        showResults(resultObj);
      });
    } else {
      secondDiv.innerHTML = '';
      secondDiv.style.display = 'none';
      errorMessage.innerHTML = 'please enter a valid location'
    }
    // set locationAutoSelected back to false
    locationAutoSelected = false;
  }

  submitLocationBtn.addEventListener('click', scrollOneToTwo);

});

// FUNCTIONS

function clearErrorMessage() {
  errorMessage.innerHTML = '';
}

// handles clicks on the first Div
function firstDivPageClicks(event) {
  // if a click occurs somewhere other that the input field or search button
  if(event.target !== locationInputField && event.target !== submitLocationBtn) {
    clearErrorMessage();
    if(locationInputField.value) {
      if (locationAutoSelected) {locationInputField.size = locationInputField.value.length}
      // if location input isn't valid, go ahead and clear the field
      else {
        locationInputField.value = '';
        console.log('inside else');
      }
    }
    else {
      locationInputField.style.width = '120px';
      locationInputField.style.textAlign = 'center';
      locationInputField.placeholder = 'find places';
      submitLocationBtn.style.display = 'none';
    }
  }
}

// create dynamic list item templates
function createListItem(title, subtitle) {
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

function showResults(dataObj) {
  let reviewsList = document.createElement('ul');
  reviewsList.className = 'reviews-list';
  reviewsList.className = 'divTwoHeaders';
  let header = dataObj.name;
  let p = dataObj.score;

  let listItem = createListItem(header, p);

  reviewsList.appendChild(listItem);

  secondDiv.appendChild(reviewsList);
}
