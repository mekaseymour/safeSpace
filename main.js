// declare constant DOM elements
const body = document.body;
const firstDiv = document.getElementById('one');
const secondDiv = document.getElementById('two');
const searchDivContainer = document.getElementsByClassName('search-div')[0];
const locationInputField = document.getElementById('location-input-field');
const submitLocationBtn = document.getElementById('submit-location-button');
const errorMessage = document.getElementById('error-message');

const orgInput = document.getElementById('org-input');
orgInput.style.display = 'block';

// function setUpSearchBar(bar, button) {
//   bar.addEventListener('click', () => {
//     bar.classList.add('active');
//     // bar.style.width = '250px';
//     // bar.style.textAlign = 'left';
//     bar.placeholder = 'search by location...';
//
//     button.classList.add('active');
//     // button.style.display = 'inline';
//   })
// }
class SearchBar {
  constructor(searchBar, searchBtn) {
    this.searchBar = searchBar;
    this.searchBtn = searchBtn;
    this.searchBar.addEventListener('click', this.clickedSearchBar.bind(this));
  }

  clickedSearchBar() {
    this.searchBar.style.width = '250px';
    this.searchBar.style.textAlign = 'left';
    this.searchBar.placeholder = 'search by location...';
    this.searchBtn.style.display = 'inline';
  }
}

class Form {
  constructor(formEl) { //constructor(id)
    this.form = formEl;
  }

  populateDatalist(inputEl, callback) {
    inputEl.addEventListener('keydown', e => {
      callback(inputEl.value);
    });
  }

  handleSubmitBtn(btnEl, btnCallback) {
    let btn = btnEl;
    btn.addEventListener('click', btnCallback);
    // return btn
  }

}

// CREATE DOM ELEMENTS

// find orgs form
const findOrgsEl = document.getElementById('find-orgs-form');
const listOfCompanies = document.getElementsByTagName('datalist')[0];
const findOrgsForm = new Form(findOrgsEl);
//const formCheckboxes = firstForm.makeCheckboxes(reviewTypesArr);
const findOrgsBtn = document.getElementById('find-org-button');
//findOrgsBtn.style.display = 'block';
findOrgsForm.handleSubmitBtn(findOrgsBtn, orgsBtnCallback);
let selectedOrg = '';

function orgsBtnCallback() {
  findOrgsForm.form.className = 'hidden';
  reviewTypeForm.form.className = 'visible'
  //secondFormDiv.style.display = 'block';
  console.log('hide old form, show new form');
}

// MAKE FORM
/*

//findOrgsFormDiv.style.backgroundColor = 'white';
findOrgsForm.appendChild(searchForOrgsBtn);
*/

const reviewTypeForm = new Form('review-type-form');
const reviewTypeBtn = document.getElementById('review-type-button');
reviewTypeForm.handleSubmitBtn(reviewTypeBtn, secondFormCallback);

function secondFormCallback() {
  reviewTypeForm.form.className = 'hidden';
  let types = document.getElementsByName('type');
  types.forEach(radio => {
    if(radio.checked) {
      console.log(radio.id);
    }
  });
  thirdFormDiv.className = 'visible';
  console.log('second form submitted');
}

/*
const thirdForm = new Form('third-form');
const feedbackForm = thirdForm.form;
thirdFormDiv.style.display = 'none';
feedbackForm.appendChild(textArea);
thirdForm.handleSubmitBtn('make review', makeNewReview);
thirdFormDiv.appendChild(feedbackForm);
findOrgsFormDiv.appendChild(thirdFormDiv);

function makeNewReview() {
  console.log('new review made');
}
*/
// main location search input on div one
const mainSearchBar = new SearchBar(locationInputField, submitLocationBtn);

// Get a reference to the firebase database
const database = firebase.database();
const databaseRootRef = database.ref('Orgs');
// dataArr stores refreshed firebase data
let dataArr = [];
// googlePlaceSelected tracks whether or not the location entered into the
// locationInputField was a proper Google autocomplete result
let googlePlaceSelected = false;
let searchResults = '';

// // Get Firebase data
// databaseRootRef.on('value', snapshot => {
//   dataArr = snapshot.map(child => child.val());
//   console.log(dataArr);
// });

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

///////////////const orgsDatabase = new Database('Orgs');

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

// EVENT LISTENERS
$(document).ready(function() {

  // using clearbit API to do company search and get logo, name, url
  // http://blog.clearbit.com/company-autocomplete-api/

  function getCompanyInfo(input) {

    // if input is truthy (ins't blank, for example)
    if(input) {
      $.ajax({
        type: 'GET',
        url: 'https://autocomplete.clearbit.com/v1/companies/suggest?query=' + input,
        success: (arrOfObjects) => {

          listOfCompanies.innerHTML = '';
          let arrOfCompanyObjs = [];
          let selectedOrg = '';
          let selectedOrgLogo = '';

          for(var i = 0; i < arrOfObjects.length; i++) {
            let companyName = arrOfObjects[i].name;
            let companyLogo = arrOfObjects[i].logo;
            let obj = {name: companyName, logo: companyLogo};
            let option = document.createElement('option');
            option.value = companyName;
            //console.log('name of company:', companyName);
            listOfCompanies.appendChild(option);
            arrOfCompanyObjs.push();
          }

          findOrgsForm.form.appendChild(listOfCompanies);

          }
      });
      console.log(listOfCompanies);
    }
  }

  findOrgsForm.populateDatalist(orgInput, getCompanyInfo);
  orgInput.addEventListener('input', () => {
    console.log(orgInput.value, 'selected!');
  });

  // BODY: shink responsive buttons when clicks occur elsewhere
  body.addEventListener('click', firstDivPageClicks);

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
      //let results = orgsDatabase.getData();
      let results = dataArr;

      results.forEach(resultObj => {
        showResults(resultObj);
      });

      // append 'new review' button
      //secondDiv.appendChild(makeReviewButton);
      secondDiv.appendChild(findOrgsForm.form);
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

function showResults(dataObj) {
  // construct list item
  console.log(dataObj);
}
