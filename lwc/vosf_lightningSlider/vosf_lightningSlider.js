import { LightningElement, api, track } from 'lwc';
export default class Vosf_lightningSlider extends LightningElement {
  @api questionData;
  @api isPrimary;
  @api firstIndex;
  @api secondIndex;
  @api thirdIndex;
  @api isDisabled;
  value;
  questionStyle;
  indexNumber;
  min=0;
  max=10;
  description;
  connectedCallback() {
    this.min =  this.questionData.Choices[0].Choice.Min__c
    this.max =  this.questionData.Choices[0].Choice.Max__c;
    this.description= this.questionData.Question.Description__c;
    if (this.questionData.Responses && this.questionData.Responses.length > 0) {
      this.value = this.questionData.Responses[0].Response__c;
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


    if (this.isPrimary) {
      this.questionStyle = "font-size: 16px;font-weight: bold;";
    } else {
      this.questionStyle = "font-size: 16px;";
    }
  }

  handleChange(event) {
    if (this.value != event.target.value) {
      this.updateResponse(event.target.value);
    }
    console.log('handle change called');
  }

  updateResponse(value) {
        console.log('this.value' + value);
        if (value) {
            let responsesList = [];
            var response = new Object();
            response['response'] = value;
            response['questionId'] = this.questionData.Question.Id;
            response['responseId'] = this.questionData.Responses != null && this.questionData.Responses.length > 0 ? 
            this.questionData.Responses[0].Id : null;
            response['isSlider'] = true;
            response["threshold"] = this.questionData.Question.Threshold__c;
            responsesList.push(response);
            this.responses = responsesList;
            console.log('responsesList', JSON.stringify(responsesList));
            let selectedEvent = new CustomEvent('responses', {
                detail: {
                    response: responsesList
                }
            });
            this.dispatchEvent(selectedEvent);
        }
    }

  @api
  reportSliderValidity() {
    let trn = true;
    let sldr = this.template.querySelector('lightning-slider');
    if (sldr) {
      if (sldr.value == undefined || sldr.value.length == 0) {
        sldr.setCustomValidity('Please complete this field.');
        sldr.reportValidity();
        trn = false;
      } else {
        sldr.setCustomValidity('');
        trn = true;
      }
      return trn;
    }
  }
}