// declare constant DOM elements
const body = document.body;
const firstDiv = document.getElementById('one');
const secondDiv = document.getElementById('two');
const locationInputField = document.getElementById('location-input-field');
const submitLocationBtn = document.getElementById('submit-location-button');
const errorMessage = document.getElementById('error-message');

// DYNAMICALLY CREATE DOM ELEMENTS
// dynamically build new review form
const reviewFormDiv = document.createElement('div');
const formTitle = document.createElement('h1');
const reviewForm = document.createElement('form');
const orgInput = document.createElement('input');
const reviewTypesDiv = document.createElement('div');

formTitle.innerHTML = 'What company/org would you like to review:'

orgInput.setAttribute('type', 'text');
orgInput.setAttribute('placeholder', 'company or organization');

reviewForm.appendChild(orgInput);
reviewFormDiv.appendChild(formTitle);
reviewFormDiv.appendChild(reviewForm)
reviewFormDiv.appendChild(reviewTypesDiv);

let reviewTypesArr = ['gender/gender identity', 'race/ethnicity', 'education', 'religion', 'physical ability', 'sexual orientation'];

let makeReviewTypesCheckboxes = (arr) => {
  arr.forEach(type => {
    let checkbox = document.createElement('input');
    checkbox.setAttribute('type', 'checkbox');
    let label = document.createElement('label');
    label.innerHTML = type;
    label.appendChild(checkbox);
    reviewTypesDiv.appendChild(label);
  });

}

makeReviewTypesCheckboxes(reviewTypesArr);

// Get a reference to the firebase database
const database = firebase.database();
const databaseRootRef = database.ref('Orgs');
// dataArr stores refreshed firebase data
let dataArr = [];
// googlePlaceSelected tracks whether or not the location entered into the
// locationInputField was a proper Google autocomplete result
let googlePlaceSelected = false;
let searchResults = '';

// div elements
let makeReviewButton = document.createElement('button');
makeReviewButton.innerHTML = 'new review';
makeReviewButton.id = 'make-review-button';

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

// GOOGLE API - handle the location input field autocomplete
let options = {
  // will only return cities
  types: ['(cities)'],
  // will only return US locations
  componentRestrictions: {country: 'us'}
};

let autocomplete = new google.maps.places.Autocomplete(locationInputField, options);
autocomplete.addListener('place_changed', () => {
  // clear error message when a new place is selected
  clearErrorMessage();
  let place = autocomplete.getPlace();
  if(place.address_components) {
    googlePlaceSelected = true;
  }
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
$(document).ready(function() {

  // BODY: shink responsive buttons when clicks occur elsewhere
  body.addEventListener('click', firstDivPageClicks);

  // LOCATION INPUT FIELD: re-style locationInputField on click
  locationInputField.addEventListener('click', () => {
      locationInputField.style.width = '250px';
      locationInputField.style.textAlign = 'left';
      locationInputField.placeholder = 'search by location...';
      submitLocationBtn.style.display = 'inline';
  });

  // FIRST DIV
  firstDiv.addEventListener('keypress', event => {
    if(event.keyCode === 13) {
      scrollOneToTwo();
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

  function scrollOneToTwo() {
    // if the location is valid (providded by Google autocomplete)
    if(googlePlaceSelected) {
      handlesSubmitClick();
      $('html, body').animate({scrollTop: $('#two').offset().top}, 'slow');
      let results = dataArr;
      results.forEach(resultObj => {
        showResults(resultObj);
      });
      // append 'new review' button
      secondDiv.appendChild(makeReviewButton);
      secondDiv.appendChild(reviewFormDiv);
    } else {
      secondDiv.innerHTML = '';
      secondDiv.style.display = 'none';
      errorMessage.innerHTML = 'please enter a valid location'
    }
    // set locationAutoSelected back to false
    googlePlaceSelected = false;
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
      if (googlePlaceSelected) {locationInputField.size = locationInputField.value.length}
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
  listItem.className = 'reviews-list-item';
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
  // construct list item
  let reviewsList = document.createElement('ul');
  reviewsList.className = 'reviews-list';
  reviewsList.className = 'divTwoHeaders';
  let header = dataObj.name;
  let p = dataObj.score;

  let listItem = createListItem(header, p);

  reviewsList.appendChild(listItem);

  secondDiv.appendChild(reviewsList);
}
