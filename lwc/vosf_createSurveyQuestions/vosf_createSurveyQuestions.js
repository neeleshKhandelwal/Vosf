import { api, LightningElement } from "lwc";
import createSurveyQuestions from "@salesforce/apex/Vosf_SurveyController.createSurveyQuestions";
import hasChildQuestions from "@salesforce/apex/Vosf_SurveyController.hasChildQuestions";
import { NavigationMixin } from "lightning/navigation";

export default class Vosf_createSurveyQuestions extends NavigationMixin(
  LightningElement
) {
  @api surveyName;
  @api listViewIds=[];
  showmodal = true;
  name;
  showError=false;
  errorMsg='';
  showmodalContent=true;
  handleChangetxt(event) {
    console.log(event.detail);
    this.name = event.detail.value;
  }
  surveyRecordid;

  renderedCallback() {
    
    if (this.listViewIds.length==0) {
      this.showError=true;
      this.errorMsg='Please select questions for creating survey.';
      this.showmodalContent=false;
    }
    
  }
  handleSuccess(event) {
    console.log("recordid" + this.recordid);
    this.surveyRecordid = event.detail.id;
    createSurveyQuestions({
      surveyRecordid: this.surveyRecordid,
      listViewIds: this.listViewIds
    })
      .then((result) => {
        console.log("result" + result);
        if (result) {
          window.open(
            "/lightning/r/Vosf_Survey__c/" + this.surveyRecordid + "/view",
            "_self"
          );
        }
      })
      .catch((error) => {
        this.error = error;
        this.showError=true;
        this.errorMsg=error.message.body;
    
      });
  }

  handleChange() {
    this.showError=false;
     let checkval = this.template.querySelector("lightning-input-field");
     checkval.reportValidity();
     if (checkval.value){
      hasChildQuestions({
        listViewIds: this.listViewIds
      })
        .then((result) => {
          console.log("result" + result);
          if (!result) {
            this.template.querySelector("lightning-record-edit-form").submit();
          }
          else{
            this.showError=true;
            this.errorMsg='Your selection has child questions. Please select parent questions only.'
            this.showmodalContent=false;
          }
        })
        .catch((error) => {
          this.error = error;
          this.showError=true;
          this.errorMsg=error.message.body;
        });
     }
     
  }

  closeModal() {
    this.showmodal = false;
  }
}