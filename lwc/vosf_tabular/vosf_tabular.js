import { LightningElement, api, track } from "lwc";
import { compareValidationValues } from "c/vosf_utils";
import getRelatedResponses from "@salesforce/apex/Vosf_QuestionsController.getRelatedResponses";
export default class Vosf_Tabular extends LightningElement {
  @api questionWrapper;
  @api surveyInvitationId;
  @api isDisabled;
  @api firstIndex;
  @track question;
  @track valueArray = [];
  @track value = [];
  @track questionId;
  @track choiceId;
  @track columnId;
  @track responseId;
  @track responses = [];
  description;
  total = 0;
  mapValues = new Map();
  errorMsg = "";
  showError = false;
  isTotalValidationRequired = false;
  @track
  numberTypeColums;
  firstColumnId;
  @track
  is_Other;
  connectedCallback() {
    this.question = JSON.parse(JSON.stringify(this.questionWrapper));
    //to store current responses
    this.mapResponse = new Map();
    if (
      this.question.relatedQuestions &&
      this.question.relatedQuestions.length > 0
    ) {
      this.getRelatedResponses();
    } else {
      console.log('getReponses called')
      this.getReponses();
    }

    console.log("questionYouWant" , JSON.parse(JSON.stringify(this.question)));
    console.log("columnw" + JSON.stringify(this.question.Columns));
    this.firstColumnId = this.question.Columns[0].Id
    this.numberTypeColums = this.question.Columns.filter(
      (x) => x.Type__c == "Number" && x.Show_Sum__c == true);// -- ISSUE FOR CODE VALIDATION NOT WORKING NACHIKET.
    //);
    console.log('numberColumn: ' + this.numberTypeColums);
    this.question.ChildQuestions.forEach((element, index) => {
      let lstIndex2 = [];
      element.Choices.forEach((element2, index2) => {
        if (this.isDisabled) {
          element2.Choice.isDisabled = true;
        }
        if (element2.Choice.Type__c.includes('Formula') || element2.Choice.Type__c.includes('Output')) {
          element2.Choice.isOutput = true;
        }
        if (element2.Choice.Max__c) {
          this.question.ChildQuestions[index].Choices[index2].Choice.minRangeErrorMessage = 'Value must be less than or equal to ' + element2.Choice.Max__c;
        }
        if (element2.Choice.Min__c) {
          this.question.ChildQuestions[index].Choices[index2].Choice.maxRangeErrorMessage = 'Value must be greater than or equal to ' + element2.Choice.Min__c;
        }

        element2.Choice.Type__c.includes('Number') || element2.Choice.Type__c.includes('Text') ? (
          this.question.ChildQuestions[index].Choices[index2].Choice.valueMissingErrorMessage = 'You must specify value',
          this.question.ChildQuestions[index].Choices[index2].Choice.isRequired = element.Question.IsRequired__c,
          lstIndex2.push(index2)
        ) : (
            this.question.ChildQuestions[index].Choices[index2].Choice.valueMissingErrorMessage = '',
            this.question.ChildQuestions[index].Choices[index2].Choice.isRequired = element.Question.IsRequired__c
          )
      });
      if (element.Question.Is_Other__c) {
        lstIndex2.forEach(item => {
          this.question.ChildQuestions[index].Choices[item].Choice.valueMissingErrorMessage = '';
          this.question.ChildQuestions[index].Choices[item].Choice.isRequired = false;
        });
        if (element.Responses && element.Responses.length > 0) {
          let bCheck = false;
          for (const res of element.Responses) {
            if (res.Is_Other__c == true) {
              this.is_Other = res.Response__c;
              (res.Response__c != null && res.Response__c != '') && (
                lstIndex2.forEach(item => {
                  this.question.ChildQuestions[index].Choices[item].Choice.valueMissingErrorMessage = 'You must specify value';
                  this.question.ChildQuestions[index].Choices[item].Choice.isRequired = true;
                }),
                bCheck = true
              )

              break;
            }

          }

          if (!bCheck) {
            element.Choices.forEach((element2, index2) => {
              element2.Choice.isDisabled = true;
            })
          }

        } else {
          element.Choices.forEach((element2, index2) => {
            element2.Choice.isDisabled = true;
          })
        }
      }

      // if (element.Question.Is_Other__c == true && element.Responses && element.Responses.length > 0) {

      //   for (const res of element.Responses) {
      //     if (res.Is_Other__c == true) {
      //       this.is_Other = res.Response__c;
      //       break;
      //     }
      //   }
      // }
    });
    console.log(' THIS QUESTION', JSON.parse(JSON.stringify(this.question)) )
    this.isTotalValidationRequired = this.question.Question.Is_Total_Validation_Required__c;
    
    this.event1 = setTimeout(() => {
      this.calculateColumnTotal('connectedCallback');
    }, 1500);
  }
  initialRender = true;
  event1;
  renderedCallback() {
    if (!this.initialRender) {
      return;
    }
  //  if (this.numberTypeColums && this.numberTypeColums.length > 0) {
    // timeout is added because element.value is zero at the time of onload and calculation of total sum is zero
    this.event1 = setTimeout(() => {
      this.calculateColumnTotal('renderedCallback');
    }, 1500);

      //this.calculateColumnTotal('renderedCallback');
 //   }
    this.disableRowsOnLoad();
    this.initialRender = false;
  }

  
  disableRowsOnLoad() {
    if (this.disblerowdata) {
      this.disblerowdata.forEach(element => {
        this.template.querySelectorAll("lightning-input[data-question-id='" + element + "']").forEach(element2 => {
          if (element2.type != 'checkbox')
            element2.disabled = true;
        });
      });
    }
  }
  disblerowdata = [];
  getReponses() {

    if (this.question.ChildQuestions != null && this.question.ChildQuestions.length > 0) {
      for (let i = 0; i < this.question.ChildQuestions.length; i++) {
        if (
          this.question.ChildQuestions[i].Choices != null &&
          this.question.ChildQuestions[i].Choices.length > 0
        ) {
          for (let j = 0; j < this.question.ChildQuestions[i].Choices.length; j++) {
            this.question.ChildQuestions[i].Choices[j]["Options"] =
              this.question.ChildQuestions[i].Choices[j].Choice.Value__c;
            if (
              this.question.ChildQuestions[i].Responses != null &&
              this.question.ChildQuestions[i].Responses.length > 0
            ) {
              for (
                let k = 0;
                k < this.question.ChildQuestions[i].Responses.length;
                k++
              ) {
                console.log(
                  "in loop Responses" +
                  JSON.stringify(this.question.ChildQuestions[i].Responses[k])
                );
                if (
                  this.question.ChildQuestions[i].Responses[k] != null &&
                  this.question.ChildQuestions[i].Responses[k].Question__c ==
                  this.question.ChildQuestions[i].Question.Id &&
                  this.question.ChildQuestions[i].Responses[k]
                    .Question_Choice__c == this.question.ChildQuestions[i].Choices[j].Choice.Id
                ) {
                  if (this.question.ChildQuestions[i].Responses[k].Response__c == 'true') {
                    this.question.ChildQuestions[i].Choices[j]["Value"] = true;
                    this.disblerowdata.push(this.question.ChildQuestions[i].Question.Id);
                  } else if (this.question.ChildQuestions[i].Responses[k].Response__c == 'false') {
                    this.question.ChildQuestions[i].Choices[j]["Value"] = false;
                  }
                  else {
                    this.question.ChildQuestions[i].Choices[j]["Value"] = this.question.ChildQuestions[i].Responses[k].Response__c;
                    this.question.ChildQuestions[i].Choices[j]["ResponseId"] = this.question.ChildQuestions[i].Responses[k].Id;
                  }
                }
              }
            }
          }
        }
      }

      for (let i = 0; i < this.question.ChildQuestions.length; i++) {
        if (
          this.question.ChildQuestions[i].Choices != null &&
          this.question.ChildQuestions[i].Choices.length > 0
        ) {
          for (
            let j = 0;
            j < this.question.ChildQuestions[i].Choices.length;
            j++
          ) {
            console.log('this.question.ChildQuestions[i].Choices[j]', JSON.parse(JSON.stringify(this.question.ChildQuestions[i].Choices[j])))
            if (
              this.question.ChildQuestions[i].Choices[j].Choice.IsEditable__c
            ) {
              console.log(
                "this.question.ChildQuestions[i].Choices[columnIndex].Choice.Value__c" +
                this.question.ChildQuestions[i].Choices[j].Value
              );
              if (this.question.ChildQuestions[i].Choices[j].Value) {
                this.question.ChildQuestions[i].Choices[j].Choice.Value__c =
                  this.question.ChildQuestions[i].Choices[j].Value;
                this.calculateFormula(
                  i,
                  j,
                  this.question.ChildQuestions[i].Choices.length - 1,
                  this.question.ChildQuestions[i].Choices[j].Value,
                  '',
                  '',
                  ''
                );
              }
            }
          }
        }
      }
    }
  }
  comboResponses(event) {
    console.log("detail" + JSON.stringify(event.detail));
    let responsesList = [];
    responsesList.push(event.detail.response);
    this.updateResponse(responsesList);
  }
  rowSum = new Map();
  requiredRowSumValidation = false;
  mapResponse = new Map();
  handleBlur(event) {

    try {

      let responsesList = [];
      let value = event.target.value;
      let questionId = event.target.dataset.questionId;
      let choiceId = event.target.dataset.choiceId;
      let columnId = event.target.dataset.columnId;
      let rowIndex = event.target.dataset.rowId;
      let columnIndex = event.target.dataset.columnIndex;
      let noChoices = this.question.ChildQuestions[rowIndex].Choices.length - 1;
      this.question.ChildQuestions[rowIndex].Choices[
        columnIndex
      ].Choice.Value__c = value;
      let responseId = this.question.ChildQuestions[rowIndex].Choices[columnIndex].ResponseId;
      if (event.target.value) {
        this.question.ChildQuestions.forEach(childqns => {
          if (childqns.Validations) {
            for (const element of childqns.Validations) {
              if (element.Question__c == questionId) {
                let linput = this.template.querySelector("lightning-input[data-question-id=" +
                  childqns.Question.Id + "]");
                let resvalue;
                if (this.mapResponse && this.mapResponse.get(element.Dependent_Question__c)) {
                  resvalue = this.mapResponse.get(element.Dependent_Question__c).response;
                }
                let value2 = resvalue != undefined ? resvalue : element.validationDependantResponse;
                let compareRes = compareValidationValues(element.Operator__c, event.target.value, value2)
                if (!compareRes[0]) {
                  linput.setCustomValidity('Value must be ' + compareRes[1] + ' ' + value2);
                  linput.reportValidity();
                  break;
                } else {
                  linput.setCustomValidity('');
                  linput.reportValidity();
                }
              }
            }
          }
        });
        this.calculateFormula(rowIndex, columnIndex, noChoices, value,questionId,choiceId,columnId);
        let response = new Object();
        response["response"] = value;
        response["questionId"] = questionId;
        response["choiceId"] = choiceId;
        response["columnId"] = columnId;
        response["responseId"] = responseId;
        response["is_Other"] = false;
        response["isNumber"] = this.question.ChildQuestions[rowIndex].Choices[columnIndex].IsNumber;

        let responseFieldObject = new Object();
        responseFieldObject = {
          "Id": "",
          "Name": "",
          "Question__c": questionId,
          "Question_Choice__c": choiceId,
          "Question_Column__c": columnId,
          "Survey_Invitation__c": "",
          "Response__c": value,
          "Is_Other__c": false,
          "Primary_Question__c": "",
          "Question_Choice__r": {
            "Id": choiceId
          }
        }



        if (this.question.ChildQuestions[rowIndex].Responses && this.question.ChildQuestions[rowIndex].Responses.length > 0) {
          let responseIndex = this.question.ChildQuestions[rowIndex].Responses.findIndex(item => item.Question_Column__c == columnId);

          if (responseIndex >= 0) {
            this.question.ChildQuestions[rowIndex].Responses[responseIndex] = responseFieldObject;
          } else {
            this.question.ChildQuestions[rowIndex].Responses.push(responseFieldObject);
          }
        } else {
          this.question.ChildQuestions[rowIndex].Responses = []
          this.question.ChildQuestions[rowIndex].Responses.push(responseFieldObject);
        }


        this.mapResponse.set(questionId, response)
        responsesList.push(response);

        this.updateResponse(responsesList);
      }
    } catch (error) {
      console.error(error);
    }

  }
  handleBlurOthers(event) {
    try {
      console.log(event.target.dataset.rowId);
      console.log(event.target.dataset);
      let value = event.target.value;
      let questionId = event.target.dataset.questionId;
      let columnId = event.target.dataset.columnId;
      let rowId = event.target.dataset.rowId;
      let responsesList = [];

      if (value != null && value != '') {
        let response = new Object();
        response["response"] = value;
        response["questionId"] = questionId;
        response["columnId"] = columnId;
        response["responseId"] = questionId;
        response["is_Other"] = true;

        responsesList.push(response);
        this.question.ChildQuestions[rowId].Choices.forEach((item, index) => {
          this.question.ChildQuestions[rowId].Choices[index].Choice.isDisabled = false;
          this.question.ChildQuestions[rowId].Choices[index].Choice.valueMissingErrorMessage = 'You must specify value';
          this.question.ChildQuestions[rowId].Choices[index].Choice.isRequired = true;
        })

        this.updateResponse(responsesList, true)


        this.question = JSON.parse(JSON.stringify(this.question));
      } else {

        if (this.question.ChildQuestions[rowId].Responses && this.question.ChildQuestions[rowId].Responses.length > 0) {
          this.question.ChildQuestions[rowId].Responses = {}
          this.question.ChildQuestions[rowId].Responses = JSON.parse(JSON.stringify({}));
        }

        this.question.ChildQuestions[rowId].Choices.forEach((item, index) => {
          this.question.ChildQuestions[rowId].Choices[index].Choice.valueMissingErrorMessage = '';
          this.question.ChildQuestions[rowId].Choices[index].Choice.isRequired = false;
          this.question.ChildQuestions[rowId].Choices[index].Choice.isDisabled = true;
          this.question.ChildQuestions[rowId].Choices[index].Value = '';
        })

        let selectedEvent = new CustomEvent("deleteresponses", {
          detail: {
            questionId: rowId
          }
        });
        this.dispatchEvent(selectedEvent);

        this.question = JSON.parse(JSON.stringify(this.question));
      }
    } catch (error) {
      console.error(error);


    }
  }
  calculateFormula(rowIndex, columnIndex, noChoices, value, questionId,choiceId,columnId) {
    console.log(
      "check " , JSON.parse(JSON.stringify(this.question)) ,
      this.question.ChildQuestions[rowIndex].Choices[noChoices].Choice.Type__c
    );
    if (
      this.question.ChildQuestions[rowIndex].Choices[noChoices].Choice !=
      null &&
      this.question.ChildQuestions[rowIndex].Choices[noChoices].Choice
        .Type__c == "Formula Percentage"
    ) {
      var sum = 0;
      for (let i = 0; i < this.question.ChildQuestions.length; i++) {
        sum =
          this.question.ChildQuestions[i].Choices[columnIndex].Choice != null &&
            this.question.ChildQuestions[i].Choices[columnIndex].Choice
              .Value__c != null &&
            this.question.ChildQuestions[i].Choices[columnIndex].Choice
              .Value__c != "" &&
            this.question.ChildQuestions[i].Choices[columnIndex].Choice
              .Value__c != undefined
            ? sum +
            parseFloat(
              this.question.ChildQuestions[i].Choices[columnIndex].Choice
                .Value__c
            )
            : sum;
      }
      console.log("sum" + sum);
      for (let i = 0; i < this.question.ChildQuestions.length; i++) {
        let num =
          this.question.ChildQuestions[i].Choices[columnIndex].Choice != null &&
            this.question.ChildQuestions[i].Choices[columnIndex].Choice
              .Value__c != null &&
            this.question.ChildQuestions[i].Choices[columnIndex].Choice
              .Value__c != "" &&
            this.question.ChildQuestions[i].Choices[columnIndex].Choice
              .Value__c != undefined
            ? parseFloat(
              this.question.ChildQuestions[i].Choices[columnIndex].Choice
                .Value__c
            ) * 100
            : 0;
        let den = sum != null && sum != undefined && sum != 0 ? sum : 1;
        let forValue = "";
        forValue = (num / den).toFixed(2).toString();
        this.question.ChildQuestions[i].Choices[noChoices].Choice.Value__c =
          forValue != null && forValue != undefined && !isNaN(forValue)
            ? forValue
            : "";
      }
    } else if (
      this.question.ChildQuestions[rowIndex].Choices[noChoices] != null &&
      this.question.ChildQuestions[rowIndex].Choices[noChoices].Choice
        .Type__c == "Formula SUM"
    ) {
      var forValue = 0;
      for (
        var i = 0;
        i < this.question.ChildQuestions[rowIndex].Choices.length - 1;
        i++
      ) {
        forValue =
          this.question.ChildQuestions[rowIndex].Choices[i].Choice.Value__c !=
            null &&

            this.question.ChildQuestions[rowIndex].Choices[i].Choice.Type__c !=
            'Checkbox'
            &&
            this.question.ChildQuestions[rowIndex].Choices[i].Choice.Value__c !=
            undefined &&
            this.question.ChildQuestions[rowIndex].Choices[i].Choice.Value__c !=
            ""
            ? forValue +
            parseFloat(
              this.question.ChildQuestions[rowIndex].Choices[i].Choice
                .Value__c
            )
            : forValue;
      }
      this.requiredRowSumValidation = true;
      console.log('this.requiredRowSumValidation: ' + this.requiredRowSumValidation);
      this.rowSum.set(
        this.question.ChildQuestions[rowIndex].Choices[noChoices].Choice.Id,
        forValue
      );
      this.question.ChildQuestions[rowIndex].Question.RowSum = forValue;

      this.question.ChildQuestions[rowIndex].Choices[
        noChoices
      ].Choice.Value__c = forValue.toFixed(2).toString();
    } else if (
      this.question.ChildQuestions[rowIndex].Choices[noChoices] != null &&
      this.question.ChildQuestions[rowIndex].Choices[noChoices].Choice
        .Type__c === "Formula Value" &&
      this.question.ControllingQuesSUM != null &&
      value != null
    ) {
      var forValue = 0;
      forValue =
        value != "" && this.question.ControllingQuesSUM != ""
          ? (
            (parseFloat(value) *
              parseFloat(this.question.ControllingQuesSUM)) /
            100
          ).toFixed(2)
          : "";
      this.question.ChildQuestions[rowIndex].Choices[
        noChoices
      ].Choice.Value__c = forValue.toString();

      console.log('questionId', questionId)
      console.log('choiceId',choiceId);
      console.log('columnId', columnId)
      if(questionId == '' || choiceId == '' || columnId == ''){

      }else{
          let responsesList = [];

          let response = new Object();
          response["response"] = forValue.toString();
          response["questionId"] = this.question.ChildQuestions[rowIndex].Question.Id //'a3sRt000003gl1KIAQ';
          response["choiceId"] = this.question.ChildQuestions[rowIndex].Choices[noChoices].Choice.Id//'a3nRt000009Ju4nIAC';
          response["columnId"] = this.question.Columns[this.question.Columns.length-1].Id //columnId;//'a3oRt0000001ocgIAA';
          response["responseId"] = '';
          response["is_Other"] = false;
          response["isNumber"] = true;

          responsesList.push(response);
          this.updateResponse(responsesList);
      }
      
        
    } else if (this.Relatedresponse && this.Relatedresponse.length > 0) {
      console.log('FORMULA NAME', this.question.ChildQuestions[rowIndex].Choices[2].Choice.Type__c)
      console.log('Relatedresponse', JSON.parse(JSON.stringify(this.Relatedresponse)) )
      if (
        this.question.ChildQuestions[rowIndex].Choices[1] != null &&
        this.question.ChildQuestions[rowIndex].Choices[1].Choice.Type__c ===
        "Formula 1" &&
        value != null
      ) {
        let val1 = this.Relatedresponse.find(function (relelement) {
          return relelement.Vosf_Related_Question__c && relelement.Vosf_Related_Question__c.Indentity__c == "Q9R2";
        });
        val1 =
          parseFloat(val1.Response__c) /
          parseFloat(this.relatedColumnSumMap.get("Q9C3"));
        let val2 = this.Relatedresponse.find(function (relelement) {
          return relelement.Vosf_Related_Question__c && relelement.Vosf_Related_Question__c.Indentity__c == "Q9R1";
        });
        val2 =
          parseFloat(val2.Response__c) /
          parseFloat(this.relatedColumnSumMap.get("Q9C3"));
        let val3 = this.Relatedresponse.find(function (relelement) {
          return (
            relelement.Vosf_Related_Question__c &&
            relelement.Vosf_Related_Question__c.Indentity__c == "Q9R5"
          );
        });
        val3 =
          parseFloat(val3.Response__c) /
          parseFloat(this.relatedColumnSumMap.get("Q9C3"));

        console.log(' Formula 1 val1 ',val1,'val2 ',val2, 'val3', val3, 'year value',parseFloat(this.relatedColumnSumMap.get("Q8C2")))
        let forValue1 =
          value != ""
            ? (
              (parseFloat(val1) + parseFloat(val2) + parseFloat(val3)) *
              (parseFloat(value) / 100) * (365 - parseFloat(this.relatedColumnSumMap.get("Q8C2")))
            ).toFixed(2)
            : "";
        this.question.ChildQuestions[rowIndex].Choices[1].Choice.Value__c =
          forValue1.toString();
      }
      if (
        this.question.ChildQuestions[rowIndex].Choices[noChoices] != null &&
        this.question.ChildQuestions[rowIndex].Choices[2].Choice.Type__c ===
        "Formula 2"
      ) {
        let label =
          this.question.ChildQuestions[rowIndex].Question.Question_Label__c;
          console.log('LABEL', label)
        let val1 = this.Relatedresponse.find(function (relelement) {
          return (
            relelement.Vosf_Related_Question__c &&
            relelement.Vosf_Related_Question__c.Related_Question__r
              .Question_Label__c == label
          );
        });
        console.log('val1', val1)
        this.question.ChildQuestions[rowIndex].Choices[2].Choice.Value__c = val1 != null && val1 != undefined && val1.Response__c != null && val1.Response__c != undefined ?
          val1.Response__c.toString() : undefined;
          console.log('this.question.ChildQuestions[rowIndex].Choices[2].Choice.Value__c', this.question.ChildQuestions[rowIndex].Choices[2].Choice.Value__c)
      }
      if (
        this.question.ChildQuestions[rowIndex].Choices[noChoices] != null &&
        this.question.ChildQuestions[rowIndex].Choices[3] &&
        this.question.ChildQuestions[rowIndex].Choices[3].Choice.Type__c ===
        "Formula 3" &&
        this.question.ChildQuestions[rowIndex].Choices[2].Choice.Value__c != undefined &&
        this.question.ChildQuestions[rowIndex].Choices[2].Choice.Value__c != "0"
      ) {
        let divresult = (
          parseFloat(
            this.question.ChildQuestions[rowIndex].Choices[1].Choice.Value__c
          ) /
          parseFloat(
            this.question.ChildQuestions[rowIndex].Choices[2].Choice.Value__c
          )
        ).toFixed(2);
        this.question.ChildQuestions[rowIndex].Choices[3].Choice.Value__c =
          divresult.toString();
      }
      if (
        this.question.ChildQuestions[rowIndex].Choices[noChoices] != null &&
        this.question.ChildQuestions[rowIndex].Choices[3] &&
        this.question.ChildQuestions[rowIndex].Choices[4].Choice.Type__c ===
        "Formula 4"
      ) {
        let val1 = this.Relatedresponse.find(function (relelement) {
          return (
            relelement.Vosf_Related_Question__c &&
            relelement.Vosf_Related_Question__c.Indentity__c == "Q9R2"
          );
        });
        val1 =
          parseFloat(val1.Response__c) /
          parseFloat(this.relatedColumnSumMap.get("Q9C3"));
        let val2 = this.Relatedresponse.find(function (relelement) {
          return (
            relelement.Vosf_Related_Question__c &&
            relelement.Vosf_Related_Question__c.Indentity__c == "Q9R1"
          );
        });
        val2 =
          parseFloat(val2.Response__c) /
          parseFloat(this.relatedColumnSumMap.get("Q9C3"));
        let val3 = this.Relatedresponse.find(function (relelement) {
          return (
            relelement.Vosf_Related_Question__c &&
            relelement.Vosf_Related_Question__c.Indentity__c == "Q9R5"
          );
        });
        val3 =
          parseFloat(val3.Response__c) /
          parseFloat(this.relatedColumnSumMap.get("Q9C3"));
        let remainingdays = 365 - parseFloat(this.relatedColumnSumMap.get("Q8C2"))
        let forValue1 =
          value != ""
            ? (
              (remainingdays *
                (parseFloat(val1) + parseFloat(val2) + parseFloat(val3))) /
              parseFloat(
                this.question.ChildQuestions[rowIndex].Choices[3].Choice
                  .Value__c
              )
            ).toFixed(2)
            : "";
          console.log('forValue1',typeof forValue1,forValue1)
        this.question.ChildQuestions[rowIndex].Choices[4].Choice.Value__c = forValue1 != null && forValue1 != undefined && forValue1 != "NaN" && forValue1 != "Infinity" ?
          forValue1.toString() : "0" ; 
      }
    }
  }
  Relatedresponse;
  relatedColumnSumMap = new Map();
  getRelatedResponses() {
    let relatedIds = [];
    let relatedClmIds = [];
    this.question.relatedQuestions.forEach((element) => {
      if (element.Related_Question__c)
        relatedIds.push(element.Related_Question__c);
      if (element.Related_Question_Column__c) {
        relatedClmIds.push(element.Related_Question_Column__c);
      }
    });
    console.log('relatedIds: ',relatedIds)
    console.log('this.surveyInvitationId: ',this.surveyInvitationId)
    console.log('relatedClmIds: ',relatedClmIds)
    getRelatedResponses({
      questionIds: relatedIds,
      surveyInvitationId: this.surveyInvitationId,
      columnIds: relatedClmIds
    }).then((result) => {
      this.relatedColumnSumMap.clear();
      console.log('RESULT', result);
      this.Relatedresponse = result;
      this.Relatedresponse.forEach((element, index) => {
        if (relatedClmIds.includes(element.Question_Column__c)) {
          let val = this.question.relatedQuestions.find(function (relelement) {
            return (
              relelement.Related_Question_Column__c ==
              element.Question_Column__c
            );
          });
          if (this.relatedColumnSumMap.has(val.Indentity__c)) {
            this.relatedColumnSumMap.set(
              val.Indentity__c,
              this.relatedColumnSumMap.get(val.Indentity__c) +
              Number(element.Response__c)
            );
          } else {
            this.relatedColumnSumMap.set(
              val.Indentity__c,
              Number(element.Response__c)
            );
          }
        }
        let val2 = this.question.relatedQuestions.find(function (relelement) {
          return relelement.Related_Question__c == element.Question__c;
        });
        this.Relatedresponse[index].Vosf_Related_Question__c = val2;
      });
      console.log('getReponses called from getRelatedResponses')
      this.getReponses();
    });
  }
  updateResponse(responsesList, is_Other) {
    this.responses = responsesList;
    console.log("responsesList", JSON.stringify(responsesList));
    let selectedEvent = new CustomEvent("responses", {
      detail: {
        response: responsesList,
        is_Other: is_Other
      }
    });
    this.dispatchEvent(selectedEvent);
  }
  calculateColumnTotal(methodName) {
    console.log('calculateColumnTotal called',methodName);
    let numberTypeColums = this.question.Columns.filter(
      (x) => x.Type__c == "Number");
    let total = 0;
    let totalDays = 0;
    let totalDaysInYear = 365;
    console.log('numberTypeColums', JSON.parse(JSON.stringify(numberTypeColums)) )
    for (let index = 0; index < numberTypeColums.length; index++) {
      total = 0;
      this.template
        .querySelectorAll(
          "lightning-input[data-column-id=" +
          numberTypeColums[index].Id +
          "]"
        )
        .forEach((element) => {
          total += Number(element.value);
          totalDays += Number(element.value);
          console.log('element', JSON.stringify(element.name))
          console.log('value', JSON.parse(JSON.stringify(element.value)));
        });
      
      console.log('total',total)
      numberTypeColums[index].total = total;
      if (numberTypeColums[index].Max_Total_Value__c != null)
        totalDaysInYear = numberTypeColums[index].Max_Total_Value__c;
      if (numberTypeColums[index].daysOnRecurring__c) {
        numberTypeColums[index].total = totalDaysInYear - totalDays;
      }
      if (numberTypeColums[index].percentOfPeriodicActivities__c) {
        numberTypeColums[index].total = ((totalDays / totalDaysInYear) * 100).toFixed(2);
      }
      console.log(
        "numberTypeColums" + JSON.stringify(numberTypeColums)
      );
    }
    this.numberTypeColums = numberTypeColums.filter(
      (x) => x.Show_Sum__c == true);
    let eventColoumn = new CustomEvent('eventcolumn', { detail: numberTypeColums });
    this.dispatchEvent(eventColoumn);
  }

  inputChangeHandler() {
    this.calculateColumnTotal('inputChangeHandler');
  }
  checkboxHandler(event) {
    let value = event.target.checked;
    let rowIndex = event.target.dataset.rowId;
    let choiceId = event.target.dataset.choiceId;
    let columnId = event.target.dataset.columnId;
    let currentColumnData = this.question.Columns.find(function (item) {
      return item && item.Id == columnId;
    });
    if (currentColumnData && currentColumnData.Type__c == "Unselect Row") {
      this.template.querySelectorAll("lightning-input[data-row-id='" + rowIndex + "']").forEach(element => {
        if (choiceId !== element.getAttribute('data-choice-id'))
          element.disabled = value;
      });
    }
    let questionId = event.target.dataset.questionId;
    let columnIndex = event.target.dataset.columnIndex;
    this.question.ChildQuestions[rowIndex].Choices[columnIndex].Choice.Value__c = value;
    let responseId = this.question.ChildQuestions[rowIndex].Choices[columnIndex].ResponseId;
    let responsesList = [];
    let response = new Object();
    response["response"] = value;
    response["questionId"] = questionId;
    response["choiceId"] = choiceId;
    response["columnId"] = columnId;
    response["responseId"] = responseId;
    response["isNumber"] = this.question.ChildQuestions[rowIndex].Choices[columnIndex].IsNumber;
    responsesList.push(response);
    this.updateResponse(responsesList);
  }
  @api
  reportValidity() {
    let selectionMap = new Map();
    this.reportvalidity = true;
    this.errorMsg = "";
    this.showError = false;
    this.total = 0;
    this.template.querySelectorAll("lightning-input").forEach((element) => {
      element.reportValidity();
    });
    let inputs = this.template.querySelectorAll("lightning-input");
    if (inputs != undefined) {
      for (let index = 0; index < inputs.length; index++) {
        this.mapValues.set(
          inputs[index].getAttribute("data-row-id"),
          inputs[index].value
        );

        console.log("validity" + inputs[index].checkValidity());
        if (inputs[index].checkValidity() == true)
          this.reportvalidity = inputs[index].checkValidity();
        else {
          this.reportvalidity = false;
          break;
        }
      }
      if (this.reportvalidity) {
        this.template
          .querySelectorAll("c-vosf_combo-box-table")
          .forEach((element) => {
            element.reportValidity();
          });

        let combos = this.template.querySelectorAll("c-vosf_combo-box-table");
        if (combos != undefined) {
          for (let index = 0; index < combos.length; index++) {
            if (combos[index].reportValidity() == true)
              this.reportvalidity = combos[index].reportValidity();
            else {
              this.reportvalidity = false;
              break;
            }
          }
        }
      }
    }
    for (const x of this.mapValues.values()) {
      this.total += Number(x);
      console.log("total" + this.total);
    }
    console.log('Question: ' + this.question);
    for (let index = 0; index < this.numberTypeColums.length; index++) {
      console.log('in for for');
      console.log('Is_Total_Validation_Required__c: ' + this.numberTypeColums[index].Is_Total_Validation_Required__c);
      console.log('Required_Total__c: ' + this.numberTypeColums[index].Required_Total__c);
      console.log('Required_Child_Total__c: ' + this.question.Required_Child_Total__c);
      if (
        this.numberTypeColums[index].Is_Total_Validation_Required__c &&
        this.numberTypeColums[index].total !==
        this.numberTypeColums[index].Required_Total__c
      ) {
        this.errorMsg =
          "Total must be " +
          this.numberTypeColums[index].Required_Total__c +
          " for " +
          this.numberTypeColums[index].Label__c;
        this.showError = true;
        this.showTotalError = true;
        this.reportvalidity = false;
        break;
      }
      if (
        this.numberTypeColums[index].Max_Total_Value__c && Number(this.numberTypeColums[index].total) >
        Number(this.numberTypeColums[index].Max_Total_Value__c)
      ) {
        this.errorMsg =
          "Total must be less than " +
          this.numberTypeColums[index].Max_Total_Value__c +
          " for " +
          this.numberTypeColums[index].Label__c;
        this.showError = true;
        this.showTotalError = true;
        this.reportvalidity = false;
        break;
      }

    }

    console.log('reportValidity', this.reportvalidity);

    this.question.ChildQuestions.forEach((ques) => {
      console.log('Is_Other__c' + ques.Question.Is_Other__c);
      // console.log('Is_Other__c' + ques.Responses && ques.Responses.length > 0);
      console.log('ques.Required_Child_Total__c:' + ques.Question.Required_Child_Total__c);
      if (ques.Question.Required_Child_Total__c == 100) {
        if ((ques.Question.Is_Other__c && !(ques.Responses && ques.Responses.length > 0))) return;
        if (Number(ques.Question.RowSum) != 100) {
          this.errorMsg = ques.Question.Question_Label__c + " total must be 100.";
          this.showError = true;
          this.showTotalError = true;
          this.reportvalidity = false;
        }
      }
    })
    console.log('returning');
    return this.reportvalidity;
  }
}