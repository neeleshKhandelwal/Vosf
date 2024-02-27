//import starRating static resource, call it starRating
import starRating from '@salesforce/resourceUrl/VOSFResource';
import { LightningElement, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { loadStyle, loadScript } from 'lightning/platformResourceLoader';

// add constants here
const ERROR_COMMENT = 'Please enter text in the comment box.';
const ERROR_REQUIRED = 'Please asnwer the question';
const ERROR_TITLE = 'Error loading star-rating';
const ERROR_VARIANT = 'error';
const EDITABLE_CLASS = 'c-rating';
const READ_ONLY_CLASS = 'readonly c-rating';
export default class Vosf_rating extends LightningElement {
  //initialize public readOnly and value properties
  @api
  readOnly;
  @api
  value;

  @api
  questionData;
  @api
  firstIndex;
  @api
  secondIndex;
  @api
  thirdIndex;
  @api
  isPrimary;

  maxRating = 10;
  description;
  questionStyle;
  indexNumber;
  editedValue;
  isRendered;
  selectedRating;

  //getter function that returns the correct class depending on if it is readonly
  get starClass() {
    return this.readOnly ? READ_ONLY_CLASS : EDITABLE_CLASS;
  }

  //connectedCallback to set indexNumber
    connectedCallback() {
      this.description= this.questionData.Question.Description__c;
      if (this.questionData.Responses && this.questionData.Responses.length > 0) {
        this.value = this.questionData.Responses[0].Response__c;
        this.selectedRating = this.value;
      }
      if (this.thirdIndex || this.thirdIndex == 0) {
        this.indexNumber = this.firstIndex + "." + (parseInt(this.secondIndex) + 1) + "." + (parseInt(this.thirdIndex) + 1) + "." + " ";
      }
      else if (this.secondIndex || this.secondIndex == 0) {
        this.indexNumber = this.firstIndex + "." + (parseInt(this.secondIndex) + 1) + "." + " ";
      }
      else if (this.firstIndex) {
        this.indexNumber = (parseInt(this.firstIndex)) + "." + " ";
      }
      this.questionStyle = this.isPrimary ? "font-size: 16px;font-weight: bold;" : "font-size: 16px;";
      this.maxRating = this.questionData.Question.Scale__c ? this.questionData.Question.Scale__c : 10;
  }

  // Render callback to load the script once the component renders.
  renderedCallback() {
    if (this.isRendered) {
      return;
    }
    this.loadScript();
    this.isRendered = true;
  }

  //Method to load the 3rd party script and initialize the rating.
  //call the initializeRating function after scripts are loaded
  //display a toast with error message if there is an error loading script
  loadScript() {
    Promise.all([
      loadScript(this, starRating + '/styles/rating.js'),
      loadStyle(this, starRating + '/styles/rating.css')      
    ]).then(() => {
      this.initializeRating();
    })
    .catch(error => {
      const toast = new ShowToastEvent({
          title: ERROR_TITLE,
          message: error.message,
          variant: ERROR_VARIANT,
      });
      this.dispatchEvent(toast);
    });
  }

  initializeRating() {
    let domEl = this.template.querySelector('ul');
    let maxRating = this.maxRating;
    let self = this;
    let callback = function (rating) {
      self.editedValue = rating;
      self.ratingChanged(rating);
    };
    this.ratingObj = window.rating(
      domEl,
      this.value,
      maxRating,
      callback,
      this.readOnly
    );
  }

  // Method to fire event called ratingchange with the following parameter:
  // {detail: { rating: CURRENT_RATING }}); when the user selects a rating
  ratingChanged(rating) {
    this.selectedRating = rating;
    if (this.value != rating) {
      this.selectedRating = rating;
      this.updateResponse(this.selectedRating);
    }   
  }

  updateResponse(value) {
    if (value) {
      let responsesList = [];
      var response = new Object();
      response["response"] = value;
      response['isNumber'] = true;
      response["questionId"] = this.questionData.Question.Id;
      if(this.questionData.Question.Threshold__c){
        response["isRating"] = true;
        response["threshold"] = this.questionData.Question.Threshold__c;
      }
      responsesList.push(response);
      
      console.log("responsesList", JSON.stringify(responsesList));
      let selectedEvent = new CustomEvent("responses", {
        detail: {
          response: responsesList
        }
      });
      this.dispatchEvent(selectedEvent);
    }
  }

  @api
  reportValidity(){
    if(this.selectedRating){
      return true;
    }
    const toast = new ShowToastEvent({
          title: ERROR_REQUIRED,
          variant: ERROR_VARIANT,
      });
    this.dispatchEvent(toast);
    return false;
  }
}