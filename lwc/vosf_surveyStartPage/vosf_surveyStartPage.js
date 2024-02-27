import { LightningElement, track, wire, api } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';
import zs_logo from '@salesforce/resourceUrl/VoSF_ZS_Logo';
import getStartPage from '@salesforce/apex/Vosf_SurveyStartPageController.getStartPage';
import INVT_LAST_QUESTION from '@salesforce/schema/Vosf_Survey_Invitation__c.Last_Answered_Question__c';
import INVT_ID from '@salesforce/schema/Vosf_Survey_Invitation__c.Id';
import { updateRecord } from 'lightning/uiRecordApi';
import INVT_STATUS from '@salesforce/schema/Vosf_Survey_Invitation__c.Status__c';
import { loadStyle } from "lightning/platformResourceLoader";
import VOSFResource from "@salesforce/resourceUrl/VOSFResource";
const STATUS_IN_PROGRESS = 'In Progress';
const STATUS_COMPLETED = 'Completed';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
export default class Vosf_surveyStartPage extends LightningElement {
    VoSF_ZS_Logo = zs_logo;
    @track questionList;
    @track surveyInvitationId;
    showSpinner = false;
    error = '';
    errorMessage = '';
    welcomeMessage = '';
    showStartPage = false;
     showEndPage=false;
    @track surveyInvitation;
    lastAnsweredQues = '';
    cachedSurveyInvitationId;

    @wire(CurrentPageReference)
    setCurrentPageReference(currentPageReference) {
        this.surveyInvitationId = currentPageReference?.state?.c__SurveyInvitationId;
        console.log('this.surveyInvitationId got it' + this.surveyInvitationId);
    }
    get disableButton() {
        return this.surveyInvitation != null ? false : true;
    }
    // connectedCallback() {
    //     this.getStartPage();
    // }
 
    initialRender = false;
    renderedCallback() {
        if (this.initialRender && this.cachedSurveyInvitationId==this.surveyInvitationId) {
            return;
        }
        this.cachedSurveyInvitationId=this.surveyInvitationId;
        this.getStartPage();
        this.initialRender = true;
    }
    // renderedCallback() {
    //     Promise.all([loadStyle(this, VOSFResource + '/VOSFResource/Vosf_Design.css')])
    //       .then(() => {
    //         console.log("Files loaded");
    //       })
    //       .catch((error) => {
    //         console.log(error.body.message);
    //       });
    
    //     console.log("Connected");
    //   }


    getStartPage() {
        this.showSpinner = true;
        getStartPage({ surveyInvitationId: this.surveyInvitationId })
            .then(result => {
                this.showSpinner = false;
                let response = [];
                response = result;
                if(response && response.length > 0 ){
                    this.surveyInvitation = response[0];
                    this.welcomeMessage = this.surveyInvitation.Survey__r.Welcome_Page_Content__c ?
                            this.surveyInvitation.Survey__r.Welcome_Page_Content__c : '';
                    this.lastAnsweredQues =  this.surveyInvitation.Last_Answered_Question__c ? 
                            this.surveyInvitation.Last_Answered_Question__c : '';
                    this.showStartPage = this.surveyInvitation.Status__c == STATUS_IN_PROGRESS ? 
                            false : true;
                            this.showEndPage = this.surveyInvitation.Status__c == STATUS_COMPLETED ? 
                            true : false;
                            if(this.showEndPage){
                                this.showReview=true;
                                this.showStartPage=false;
                            }
                            else{
                    this.questionPage = !this.showStartPage;}
                }else{
                    this.errorMessage =  "Page doesn't exist enter a valid url and try again.";
                }
                console.log('response', result);

            })
            .catch(error => {
                this.showSpinner = false;
                this.error = error;
                if (error.body === undefined) {
                    this.errorMessage = 'Something went wrong, Please contact your adminstrator with following error - ' + error.message;
                }
                else {
                    this.errorMessage = 'Something went wrong, Please contact your adminstrator with following error - ' + error.body.message;
                }
            })
    }
    showReview=false;
    handleShowReview(){
        this.showReview=true;
    }
    showThanksPage(event){
        console.log('thanks');
        this.questionList = event.detail.data;
        this.showStartPage = false;
        this.questionPage=false;
        this.showReview=true;
    }
    questionPage=false;
    updateResponses(){
        this.lastAnsweredQues='';
        this.showStartPage = false;
        this.questionPage=true;
        this.showReview=false;
        const fields = {};
    fields[INVT_ID.fieldApiName] = this.surveyInvitationId;
    fields[INVT_LAST_QUESTION.fieldApiName] = null;
    updateRecord({fields})
    .then(() => {
    })
    .catch(error => {
        this.showToast('Error!!', error.body.message, 'error', 'dismissable');
    });
    }
    handleNext(){
        this.showStartPage = false;
        this.questionPage=true;
        const fields = {};
        fields[INVT_ID.fieldApiName] = this.surveyInvitationId;
        fields[INVT_STATUS.fieldApiName] = STATUS_IN_PROGRESS;
        updateRecord({fields})
        .then(() => {
        })
        .catch(error => {
            this.showToast('Error!!', error.body.message, 'error', 'dismissable');
        });
    }
    showToast(title,message,variant,mode) {
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
            mode: mode
        });
        this.dispatchEvent(event);
    }
}