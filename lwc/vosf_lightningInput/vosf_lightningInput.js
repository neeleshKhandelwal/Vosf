import { LightningElement, api, track } from "lwc";
import { compareValidationValues } from "c/vosf_utils";
export default class Vosf_lightningInput extends LightningElement {
  @api questionData;
  @api isPrimary;
  @api firstIndex;
  @api secondIndex;
  @api thirdIndex;
  @api isDisabled;
  responseMap;
  value;
  questionStyle;
  indexNumber;
  haschoices = false;
  description;
  choiceLabel='';
  min;
  max;
  maxRangeErrorMessage;
  minRangeErrorMessage;
  connectedCallback() {
    console.log('this.questionData', JSON.parse(JSON.stringify(this.questionData)))
    this.description = this.questionData.Question.Description__c;
    if (this.questionData.Responses && this.questionData.Responses.length > 0) {
      this.value = this.questionData.Responses[0].Response__c;
    }
    if (this.thirdIndex || this.thirdIndex == 0) {
      this.indexNumber =
        this.firstIndex +
        "." +
        (parseInt(this.secondIndex) + 1) +
        "." +
        (parseInt(this.thirdIndex) + 1) +
        "." +
        " ";
    } else if (this.secondIndex || this.secondIndex == 0) {
      this.indexNumber =
        this.firstIndex + "." + (parseInt(this.secondIndex) + 1) + "." + " ";
    } else if (this.firstIndex) {
      this.indexNumber = parseInt(this.firstIndex) + "." + " ";
    }
    if (this.questionData.Choices && this.questionData.Choices.length > 0) {
      this.choiceLabel=this.questionData.Choices[0].Choice.Label__c;
      if (!this.isDisabled) {
        this.isDisabled=!this.questionData.Choices[0].Choice.IsEditable__c;
      }
      
      this.haschoices = true;
      if(this.questionData.Choices[0].Choice.Max__c ){
        this.max=this.questionData.Choices[0].Choice.Max__c;
        this.minRangeErrorMessage='Value must be less than or equal to '+this.questionData.Choices[0].Choice.Max__c;
      }
      if(this.questionData.Choices[0].Choice.Min__c ){
        this.min=this.questionData.Choices[0].Choice.Min__c;
        this.maxRangeErrorMessage='Value must be greater than or equal to '+this.questionData.Choices[0].Choice.Min__c;
      }
    }
    if (this.isPrimary) {
      this.questionStyle = "font-size: 16px;font-weight: bold;";
    } else {
      this.questionStyle = "font-size: 16px;";
    }
  }
  handleChange(event) {
    let questionId = event.target.dataset.id;

    if (this.value != event.target.value) {
      if (this.questionData.Validations) {
        for (const element of this.questionData.Validations) {
          if (element.Question__c == questionId) {
            let resvalue;
            if (this.responseMap && this.responseMap.has(element.Dependent_Question__c)) {
              resvalue = this.responseMap.get(element.Dependent_Question__c)[0]
                .response;
            }
            let value2 =
              resvalue != undefined
                ? resvalue
                : element.validationDependantResponse;
                
            let compareRes = compareValidationValues(
              element.Operator__c,
              Number(event.target.value),
              Number(value2)
            );
           
            let linput = this.template.querySelector("lightning-input");
            if (!compareRes[0]) {
              linput.setCustomValidity(
                "Value must be " + compareRes[1] + " " + value2
              );
              linput.reportValidity();
              break;
            } else {
              linput.setCustomValidity("");
              linput.reportValidity();
            }
          }
        }
      }
      this.updateResponse(event.target.value);
    }
    console.log("handle change called");
  }
  updateResponse(value) {
    console.log("this.value" + value);
    if (value) {
      let responsesList = [];
      var response = new Object();
      response["response"] = value;
      response["questionId"] = this.questionData.Question.Id;
      response["responseId"] =
        this.questionData.Responses != null &&
        this.questionData.Responses.length > 0
          ? this.questionData.Responses[0].Id
          : null;
      response['isNumber'] = this.questionData.Question.Question_Type__c == 'Number' ? true : false;
      responsesList.push(response);
      this.responses = responsesList;
      console.log("responsesList", JSON.stringify(responsesList));
      let selectedEvent = new CustomEvent("responses", {
        detail: {
          response: responsesList
        }
      });
      this.dispatchEvent(selectedEvent);
    }
  }
  reportvalidity = false;
  @api changedata(data) {
    this.responseMap = new Map(data);
  }
  @api
  inputValue() {
    if(this.haschoices){
    let element = this.template.querySelector("lightning-input");
    return { value: element.value, "data-id": element.getAttribute("data-id") };
    }return { value: 0, "data-id": 'NA' };
  }
  @api
  reportValidity() {
    this.reportvalidity = true;
    let inputs = this.template.querySelector("lightning-input");
    if (inputs) {
      if (inputs.reportValidity()) {
        this.reportvalidity = true;
      } else {
        this.reportvalidity = false;
      }
    }
    return this.reportvalidity;
  }
}