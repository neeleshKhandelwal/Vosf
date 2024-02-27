import { LightningElement, api, track, wire } from "lwc";
import { loadStyle } from "lightning/platformResourceLoader";
import VOSFResource from "@salesforce/resourceUrl/VOSFResource";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import zs_logo from "@salesforce/resourceUrl/VoSF_ZS_Logo";
// Example :- import TRAILHEAD_LOGO from '@salesforce/resourceUrl/trailhead_logo';
import INVT_STATUS from '@salesforce/schema/Vosf_Survey_Invitation__c.Status__c';
import INVT_ID from '@salesforce/schema/Vosf_Survey_Invitation__c.Id';
import { updateRecord } from 'lightning/uiRecordApi';
import INVT_LAST_QUESTION from '@salesforce/schema/Vosf_Survey_Invitation__c.Last_Answered_Question__c';
export default class Vosf_surveyReview extends LightningElement {
  thanksPage = true;
  reviewPage = false;
  @api showEndPage;
  reviewFooter=false;
  handleShowReview() {
    this.thanksPage = false;
    this.reviewPage = true;
    this.reviewFooter=true;
  }
  @api surveyInvitationId;
  @api questionList;
  isDisabled = true;
  VoSF_ZS_Logo = zs_logo;
  showSpinner = false;
  showButton = true;
  error;
  isTable = false;
  currentPage = 1;
  totalRecords;
  recordSize = 1;
  totalPage = 0;
  @track response;

  renderedCallback() {
    Promise.all([loadStyle(this, VOSFResource + "/styles/questionList.css")])
      .then(() => {
        console.log("Files loaded");
      })
      .catch((error) => {
        console.log(error.body.message);
      });

    console.log("Connected");
  }

  connectedCallback(){
    if(this.questionList){
      let newArr = JSON.parse(JSON.stringify(this.questionList));
      newArr.forEach((ques, idx) =>{
        ques.number = idx + 1; 
      });
      this.questionList = newArr;
    }
  }

  handleSubmit(){
    const fields = {};
    fields[INVT_ID.fieldApiName] = this.surveyInvitationId;
    fields[INVT_STATUS.fieldApiName] = 'Completed';
    updateRecord({fields})
    .then(() => {
        this.showToast('', 'Survey submitted successfully!!', 'success', 'dismissable');
        this.reviewPage = false;
        this.showButton=false;
        this.reviewFooter=false;
        this.showEndPage=true;
        this.thanksPage = true;
        
    })
    .catch(error => {
        this.showToast('Error!!', error.body.message, 'error', 'dismissable');
    });
  }

  showToast(title, message, variant, mode) {
    const evt = new ShowToastEvent({
        title: title,
        message: message,
        variant: variant,
        mode: mode
    });
    this.dispatchEvent(evt);
}

  
  handleupdateResponses() {
    const fields = {};
    fields[INVT_ID.fieldApiName] = this.surveyInvitationId;
    fields[INVT_LAST_QUESTION.fieldApiName] = null;
    updateRecord({fields})
    .then(() => {
    })
    .catch(error => {
        this.showToast('Error!!', error.body.message, 'error', 'dismissable');
    });
    this.dispatchEvent(new CustomEvent("updateresponses"));
  }

}