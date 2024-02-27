import { LightningElement,api } from 'lwc';

//import Apex Methods
import getQuestionsForModules from "@salesforce/apex/Vosf_SurveyController.getQuestionsForModules";
import insertSurveyQuestions from "@salesforce/apex/Vosf_SurveyController.insertSurveyQuestions";

//import fields
import NAME_FIELD from '@salesforce/schema/Vosf_Survey__c.Name';
import PERIOD_FIELD from '@salesforce/schema/Vosf_Survey__c.Survey_Period__c';

//To show Toast 
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class Vosf_createSurveyQuesFromModule extends LightningElement {
    @api listViewIds = [];
    @api surveyId;
    isLoaded = false;
    moduleWiseQuestions = [];
    errorMsg = '';
    showError = false;
    showmodalContent = true;

    fields = [NAME_FIELD,PERIOD_FIELD];

    connectedCallback(){
        console.log('listViewIds')
        console.log(JSON.stringify(this.listViewIds));
        this.getQuestionsJSON();
    }

    //to get the module wise questions json
    getQuestionsJSON(){
        getQuestionsForModules({
            listViewIds: this.listViewIds
        })
        .then((result) => {
            console.log('result')
            console.log(JSON.stringify(result));
            if(result){
                this.moduleWiseQuestions = result;
            }
        })
        .catch((error) => {
            this.showmodalContent = false;
            this.showError = true;
            this.errorMsg = error.message;
        });
    }

    handleSubmit(event){
        event.preventDefault();       // stop the form from submitting
        const fields = event.detail.fields;
        if(!fields.Name){
            this.showError = true;
            this.errorMsg = 'Please Enter a Name for survey';
        }else{
            this.showError = false;
            this.errorMsg = '';
            this.template.querySelector('lightning-record-edit-form').submit(fields);
        }
        
    }

    //to not disable save button
    handleChange(){
        this.showError = false;
    }

    //create survey and survey questions
    handleCreateSurveyQuestions(event){
        this.surveyId = event.detail.id;
        var questionIdList = [];
        var inputs = this.template.querySelectorAll('lightning-input');
        
        inputs.forEach(function (element) {
            if(element.checked){
                let idStr = element.id;
                questionIdList.push(idStr.split("-")[0])
            }     
        }, this);

        console.log('questionIdList')
        console.log(JSON.stringify(questionIdList))

        if(questionIdList.length > 0){
            insertSurveyQuestions({
                surveyId : this.surveyId,
                questionIds : questionIdList
            })
            .then(() => {
                this.showError = false;
            })
            .catch((error) => {
                this.showmodalContent = false;
                this.showError = true;
                this.errorMsg = error.message;
            });
        }
        if(this.surveyId){
            window.open(
                "/lightning/r/Vosf_Survey__c/" + this.surveyId + "/view",
                "_self"
            );
        }       
    }

    //To navigate back to modules list view
    navigateToModules(){
        window.open(
            '/lightning/o/Vosf_Module__c/list',
            "_self"
        ); 
    }

    //reusable toast event
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