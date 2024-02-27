import { LightningElement, api } from 'lwc';

export default class Vosf_comboBoxTable extends LightningElement {

  @api choiceData;
  @api isPrimary;
  @api firstIndex;
  @api secondIndex;
  @api thirdIndex;
  @api isDisabled;
  @api cdataColumnIndex;
  @api cdataQuestionId;
  @api cdataChoiceId
  @api cdataColumnId;
  @api cdataId;
  @api cdataRowId;
  @api isRequired;

  @api
  set selectedBoxDisable(value){
    this.isDisabled = value;
  }
  get selectedBoxDisable(){
    return this.isDisabled;
  }

  options = [];
  @api value;
  questionStyle;
  indexNumber;

  @api
  reportValidity() {
    let element = this.template.querySelector('lightning-combobox');
    element.reportValidity();
    return element.checkValidity();

  }

  connectedCallback() {
    if (this.choiceData && this.choiceData.Options) {
      let optiondata = this.choiceData.Options.split('\n');
      this.options = [];
      for (const list of optiondata) {
        const option = {
          label: list,
          value: list
        };
        this.options.push(option);
      }
    }

  }

  handleChange(event) {
    if (this.value != event.target.value) {
      this.value = event.target.value;
      console.log('handle change called');
      let response = {};
      response['response'] = this.value;
      response['questionId'] = this.cdataQuestionId;
      response['choiceId'] = this.cdataChoiceId;
      response['columnId'] = this.cdataColumnId;
      response['responseId'] = this.cdatQuestionId;
      response['isText'] = true;
      let selectedEvent = new CustomEvent('comboresponses', {
        detail: {
          response: response
        }
      });
      this.dispatchEvent(selectedEvent);
    }
  }
}