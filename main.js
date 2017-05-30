// declare constant DOM elements
const body = document.body;
const firstDiv = document.getElementById('one');
const secondDiv = document.getElementById('two');
const searchDivContainer = document.getElementsByClassName('search-div')[0];
const locationInputField = document.getElementById('location-input-field');
const submitLocationBtn = document.getElementById('submit-location-button');
const errorMessage = document.getElementById('error-message');

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
  constructor() {
    this.form = document.createElement('form');
  }

  makeTextInput(id, placeholder) {
    let newInputEl = document.createElement('input');
    newInputEl.id = id;
    newInputEl.placeholder = placeholder;
    newInputEl.type = 'text';
    newInputEl.className = 'form';
    this.form.appendChild(newInputEl)
    return newInputEl;
  }

  makeCheckboxes(arr) {
    let div = document.createElement('div');
    arr.forEach(el => {
      let label = document.createElement('label');
      let checkbox = document.createElement('input');
      checkbox.setAttribute('type', 'checkbox');
      label.innerHTML = el;
      div.appendChild(checkbox);
      div.appendChild(label);
    });
    this.form.appendChild(div);
    return div;
  }

  makeSubmitBtn(text, btnCallback) {
    let btn = document.createElement('input');
    btn.type = 'button';
    btn.value = text;
    btn.addEventListener('click', btnCallback);
    this.form.appendChild(btn);
    return btn;
  }

}

// CREATE DOM ELEMENTS
// build new review form
const reviewFormDiv = document.createElement('div');
const formTitle = document.createElement('h1');
formTitle.style.color = '#383838';
const listOfCompanies = document.createElement('datalist');
const companyInfoDiv = document.createElement('div');
const reviewTypesDiv = document.createElement('div');

// make first step 'leave review' form


const firstForm = new Form();
const reviewForm = firstForm.form;
const orgInput = firstForm.makeTextInput('org-input-field', 'company or organization');
const reviewTypesArr = ['gender/gender identity', 'race/ethnicity', 'education', 'religion', 'physical ability', 'sexual orientation'];
//const formCheckboxes = firstForm.makeCheckboxes(reviewTypesArr);
const searchForOrgsBtn = firstForm.makeSubmitBtn('next', orgsBtnCallback);
let selectedOrg = '';

function orgsBtnCallback() {
  let selectedOrgInput = document.getElementById('org-input-field');
  selectedOrg = selectedOrgInput.value;
  reviewForm.style.display = 'none';
  formTitle.style.display = 'none';
  console.log('type form display block');
  typeForm.style.display = 'block';
  console.log(selectedOrg);
}

// MAKE FORM

formTitle.innerHTML = 'What company/org would you like to review:'

listOfCompanies.setAttribute('id', 'companies');
companyInfoDiv.style.textAlign = 'center';
orgInput.setAttribute('list', listOfCompanies.id);

reviewFormDiv.appendChild(formTitle);
reviewFormDiv.appendChild(reviewForm);
reviewForm.appendChild(orgInput);
reviewForm.appendChild(companyInfoDiv);
reviewForm.appendChild(reviewTypesDiv);
//reviewFormDiv.style.backgroundColor = 'white';
reviewForm.appendChild(searchForOrgsBtn);

const secondForm = new Form();
const typeForm = secondForm.form;
console.log('type form display none');
typeForm.style.display = 'none';
secondForm.makeCheckboxes(reviewTypesArr);
secondForm.makeSubmitBtn('next', secondFormCallback);

function secondFormCallback() {
  typeForm.style.display = 'none';
  console.log('second form submitted');
}

const typeFormTitle = document.createElement('h1');
typeFormTitle.innerHTML = 'What type of review is this?';
reviewFormDiv.appendChild(typeForm);

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

          reviewForm.appendChild(listOfCompanies);

          }
      });
    }
  }


  orgInput.addEventListener('keyup', e => {
    getCompanyInfo(orgInput.value);
  });

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
      let results = dataArr;
      /*
      results.forEach(resultObj => {
        showResults(resultObj);
      });
      */
      // append 'new review' button
      //secondDiv.appendChild(makeReviewButton);
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
