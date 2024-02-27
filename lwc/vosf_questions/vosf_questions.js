import { LightningElement, track, api } from "lwc";

//To load css
import { loadStyle } from "lightning/platformResourceLoader";

//To show Toast
import { ShowToastEvent } from "lightning/platformShowToastEvent";

//Import LWC
import { compareValidationValues } from "c/vosf_utils";

//Importing static resources
import VOSFResource from "@salesforce/resourceUrl/VOSFResource";
import zs_logo from "@salesforce/resourceUrl/VoSF_ZS_Logo";

//Importing Apex Methods
import getQuestions from "@salesforce/apex/Vosf_QuestionsController.getQuestions";
import saveResponses from "@salesforce/apex/Vosf_QuestionsController.saveResponses";
import checkVisibility from "@salesforce/apex/Vosf_QuestionsController.checkVisibility";
import deleteResponses from "@salesforce/apex/Vosf_QuestionsController.deleteResponses";
//Importing Fields
import INVT_LAST_QUESTION from "@salesforce/schema/Vosf_Survey_Invitation__c.Last_Answered_Question__c";
import INVT_ID from "@salesforce/schema/Vosf_Survey_Invitation__c.Id";
import Survey_Controlling_Question_Sum from "@salesforce/label/c.Survey_Controlling_Question_Sum";
import question_Reference from "@salesforce/label/c.Question_Reference";
//Importing uiRecordApi methods
import { updateRecord } from "lightning/uiRecordApi";
export default class Vosf_Questions extends LightningElement {
  @api surveyInvitationId;
  @track questionList;
  @track originalQuestionList;
  @track currentScreenQuestionList;
  @api lastAnsweredQues = "";
  numberTypeColumns;
  VoSF_ZS_Logo = zs_logo;
  showSpinner = false;
  showButton = true;
  error;

  isTable = false;
  currentPage = 1;
  totalRecords;
  pageNumber = 0;
  totalPage = 0;
  recordSize = 1;
  isRangeValidatedRequired = false;
  minRange = 0;
  maxRange = 0;
  total = 0;
  validateVal;
  checkvalidity = false;
  errorMsg = "";
  showTotalError = false;
  isResponseEventFired = false;
  @track responseMap = new Map();
  showBackButton = true;
  connectedCallback() {
    this.currentPage = 1;
    this.getQuestions();
  }

  renderedCallback() {
    Promise.all([loadStyle(this, VOSFResource + "/styles/Vosf_Design.css")])
      .then(() => {
        console.log("Files loaded");
      })
      .catch((error) => {
        console.log(error.body.message);
      });

    console.log("Connected");
  }
  @track
  modules = [];
  modulesdata = [];
  showModuleProgress() {
    this.modules = [];
    let itemclass = "active";
    if (!this.currentModule) {
      itemclass = "";
    }
    this.modulesdata.forEach((item) => {
      if (item == this.currentModule) {
        this.modules.push({ class: itemclass, value: item });
        itemclass = "";
      } else {
        this.modules.push({ class: itemclass, value: item });
      }
    });
  }

  getQuestions() {
    this.questionList = [];
    this.showSpinner = true;
    getQuestions({ surveyInvitationId: this.surveyInvitationId })
      .then((result) => {
        this.showSpinner = false;
        this.originalQuestionList = result;
        this.questionList = result;
        this.questionList.forEach((element) => {
          if (element.Question.Module__r) {
            this.modulesdata.push(element.Question.Module__r.Name);
          }
        });
        this.modulesdata = [...new Set(this.modulesdata)];
        this.showModuleProgress();
        this.recordSize = Number(this.recordSize);
        this.totalPage = Math.ceil(this.questionList.length / this.recordSize);
        if (
          this.lastAnsweredQues &&
          this.questionList &&
          this.questionList.length > 0
        ) {
          for (let i = 0; i < this.questionList.length; i++) {
            if (!this.questionList[i].IsHidden) {
              this.pageNumber = this.pageNumber + 1;
            }
            if (
              this.questionList[i].Question.Id == String(this.lastAnsweredQues)
            ) {
              this.currentPage = i + 1;
              break;
            }
          }
        } else {
          this.currentPage = 1;
          this.pageNumber = 1;
        }
        this.pageNumber = this.pageNumber - 1;
        this.getCurrentPageQuestions(false, false);
      })
      .catch((error) => {
        console.log("catch");
        this.showSpinner = false;
        console.log(error);
        this.error = error;
      });
  }

  handleSaveResponses(event) {
    if (event) {
      //checking if it is tabular response & a response already exists in the map
      if (!event.detail.is_Other &&
        event.detail.response &&
        event.detail.response.length > 0 &&
        event.detail.response[0].columnId &&
        this.responseMap.has(event.detail.response[0].questionId)
      ) {
        let responseArr = [];
        let existingResponse = this.responseMap.get(
          event.detail.response[0].questionId
        );
        //checking if the existing response is for the same column
        let sameColResponse = existingResponse.find(
          (obj) => obj.columnId === event.detail.response[0].columnId
        );
        if (sameColResponse) {
          this.responseMap.set(
            event.detail.response[0].questionId,
            existingResponse.map(
              (obj) =>
                event.detail.response.find(
                  (newResp) => newResp.columnId === obj.columnId
                ) || obj
            )
          );
        } else {
          responseArr = this.responseMap.get(
            event.detail.response[0].questionId
          );
          responseArr.push(...event.detail.response);
          this.responseMap.set(
            event.detail.response[0].questionId,
            responseArr
          );
        }
      }
      // for all other cases
      else if (event.detail.response && event.detail.response.length > 0) {
        this.responseMap.set(
          event.detail.response[0].questionId,
          event.detail.response
        );
        this.isResponseEventFired = true;

        //only for rating type question check if comment type child ques is to be hidden or not.
        if (event.detail.response[0].isSlider || event.detail.response[0].isRating) {
          let hideComment =
            event.detail.response[0].response <
              event.detail.response[0].threshold
              ? false
              : true;
          let currentIndex = this.questionList.findIndex(
            (ques) =>
              ques.Question.Id === this.currentScreenQuestionList[0].Question.Id
          );
          if (currentIndex > 0) {
            let currentQues = this.questionList[currentIndex];
            if (
              currentQues.ChildQuestions &&
              currentQues.ChildQuestions.length > 0
            ) {
              for (let i = 0; i < currentQues.ChildQuestions.length; i++) {
                if (currentQues.ChildQuestions[i].IsComment) {
                  currentQues.ChildQuestions[i].IsHidden = hideComment;
                }
              }
              this.questionList[currentIndex] = currentQues;
            }
          }
        }
      }
      let nontabular = this.template.querySelectorAll("c-vosf_non-tabular-question");
      nontabular.forEach(element => {
        element.changedata(Array.from(this.responseMap));
      });
    } else {
      this.isResponseEventFired = false;
    }
  }

  handleDeleteResponses(event) {
    console.log('%%%%', 'In delete')
    if (event.detail.questionId != null && event.detail.questionId != '') {
      let currentIndex = this.questionList.findIndex(
        (ques) =>
          ques.Question.Id === this.currentScreenQuestionList[0].Question.Id
      );
      if (currentIndex > 0) {
        this.questionList[currentIndex].ChildQuestions[event.detail.questionId].Responses = JSON.parse(JSON.stringify([]));
        // this.responseMap.set(this.currentScreenQuestionList[0].Question.Id,[])
      }
      this.questionList[currentIndex].ChildQuestions = JSON.parse(JSON.stringify(this.questionList[currentIndex].ChildQuestions));
      console.log('%%%%', this.questionList[currentIndex].ChildQuestions)
    }
  }

  saveResponses(currentQuestion, isLastQuestion) {
    if (this.isResponseEventFired) {
      this.isResponseEventFired = false;
      this.showSpinner = true;
      let responsesArr = [];
      for (const respArr of this.responseMap.values()) {
        responsesArr.push(...respArr);
      }

      console.log('responsesArr',JSON.parse(JSON.stringify(responsesArr)) )

      saveResponses({
        SurveyInvitationId: this.surveyInvitationId,
        Response: JSON.stringify(responsesArr)
      })
        .then((result) => {
          if (result) {
            //refresh response in the questionList
            let replaceQuestion = currentQuestion;
            //const start = (this.currentPage - 2) * this.recordSize;
            currentQuestion.forEach((parent) => {
              if (parent.ChildQuestions && parent.ChildQuestions.length == 0) {
                //only parent no child
                if (
                  (replaceQuestion[0].Responses &&
                    replaceQuestion[0].Responses[0].Question__c ==
                    result[0].Question__c) ||
                  !replaceQuestion[0].Responses
                ) {
                  replaceQuestion[0].Responses = [];
                  for (let i = 0; i < result.length; i++) {
                    replaceQuestion[0].Responses.push(result[i]);
                  }
                }
              } else if (
                parent.ChildQuestions &&
                parent.ChildQuestions.length > 0
              ) {
                //map of result
                let resultMap = new Map();
                for (let i = 0; i < result.length; i++) {
                  let respArr = resultMap.get(result[i].Question__c)
                    ? resultMap.get(result[i].Question__c)
                    : [];
                  respArr.push(result[i]);
                  resultMap.set(result[i].Question__c, respArr);
                }
                //parent
                if (
                  (replaceQuestion[0].Responses &&
                    this.responseMap.has(
                      replaceQuestion[0].Responses[0].Question__c
                    )) ||
                  !replaceQuestion[0].Responses
                ) {
                  replaceQuestion[0].Responses = [];
                  replaceQuestion[0].Responses = resultMap.get(
                    parent.Question.Id
                  );
                }

                //child level 1
                let childArr = [];
                parent.ChildQuestions.forEach((child) => {
                  if (this.responseMap.has(child.Question.Id)) {
                    let childObj = JSON.parse(JSON.stringify(child));
                    childObj.Responses = [];
                    //just to check for ques column type questions
                    if (child.Responses && child.Responses.length > 0) {
                      let responseArr = resultMap.get(child.Question.Id);
                      responseArr.forEach((result) => {
                        let existingRespForOtherQuesCols =
                          child.Responses.filter(
                            (resp) =>
                              resp.Question_Column__c &&
                              resp.Question_Column__c !=
                              result.Question_Column__c
                          );
                        if (
                          existingRespForOtherQuesCols &&
                          existingRespForOtherQuesCols.length > 0
                        ) {
                          childObj.Responses.push(
                            ...existingRespForOtherQuesCols
                          );
                        }
                        childObj.Responses.push(result);
                      });
                    } else {
                      childObj.Responses = resultMap.get(child.Question.Id);
                    }
                    //check for child level 2
                    let grandChildArr = [];
                    if (
                      childObj.ChildQuestions &&
                      childObj.ChildQuestions.length > 0
                    ) {
                      childObj.ChildQuestions.forEach((grandChild) => {
                        if (this.responseMap.has(grandChild.Question.Id)) {
                          let grandChildObj = grandChild;
                          grandChildObj.Responses = [];
                          grandChildObj.Responses = resultMap.get(
                            grandChild.Question.Id
                          );
                          grandChildArr.push(grandChildObj);
                        } else {
                          grandChildArr.push(grandChild);
                        }
                      });
                    }
                    childObj.ChildQuestions = grandChildArr;
                    childArr.push(childObj);
                  } else {
                    //check for child level 2
                    let grandChildArr = [];
                    if (
                      child.ChildQuestions &&
                      child.ChildQuestions.length > 0
                    ) {
                      child.ChildQuestions.forEach((grandChild) => {
                        if (this.responseMap.has(grandChild.Question.Id)) {
                          let grandChildObj = grandChild;
                          grandChildObj.Responses = [];
                          grandChildObj.Responses = resultMap.get(
                            grandChild.Question.Id
                          );
                          grandChildArr.push(grandChildObj);
                        } else {
                          grandChildArr.push(grandChild);
                        }
                      });
                    }
                    child.ChildQuestions = grandChildArr;
                    childArr.push(child);
                  }
                });
                replaceQuestion[0].ChildQuestions = [];
                replaceQuestion[0].ChildQuestions = childArr;
              }
            });
            console.log("replaceQuestion[0] before");
            console.log(JSON.parse(JSON.stringify(replaceQuestion[0])));
            let index = this.questionList.findIndex(
              (ques) => ques.Question.Id === currentQuestion[0].Question.Id
            );

            /*if(replaceQuestion[0].Question.Id == 'a3sRt000003gl01IAA'){
              let arr1 = new Object();
                arr1['Id'] = 'Dummy1';
                arr1['Question_Choice__c'] ='a3nRt000009Ju4nIAC';
                arr1['Question_Column__c'] ='a3oRt0000001ocgIAA';
                arr1['Is_Other__c'] =false;
                arr1['Question__c'] ='a3sRt000003gl1KIAQ';
                arr1['Response_Number__c'] = 4;
                arr1['Response__c'] = '4';
                arr1['Survey_Invitation__c'] = 'a3uRt0000003eSLIAY';
              replaceQuestion[0].ChildQuestions[0].Responses.length==1?replaceQuestion[0].ChildQuestions[0].Responses.push(arr1):'';

              let arr2 = new Object();
                arr2['Id'] = 'Dummy2';
                arr2['Question_Choice__c'] ='a3nRt000009Ju4lIAC';
                arr2['Question_Column__c'] ='a3oRt0000001ocgIAA';
                arr2['Is_Other__c'] =false;
                arr2['Question__c'] ='a3sRt000003gl1JIAQ';
                arr2['Response_Number__c'] = 4;
                arr2['Response__c'] = '4';
                arr2['Survey_Invitation__c'] = 'a3uRt0000003eSLIAY';
              replaceQuestion[0].ChildQuestions[1].Responses.length==1?replaceQuestion[0].ChildQuestions[1].Responses.push(arr2):'';

              let arr3 = new Object();
                arr3['Id'] = 'Dummy3';
                arr3['Question_Choice__c'] ='a3nRt000009Ju4hIAC';
                arr3['Question_Column__c'] ='a3oRt0000001ocgIAA';
                arr3['Is_Other__c'] =false;
                arr3['Question__c'] ='a3sRt000003gl1HIAQ';
                arr3['Response_Number__c'] = 2;
                arr3['Response__c'] = '2';
                arr3['Survey_Invitation__c'] = 'a3uRt0000003eSLIAY';
              replaceQuestion[0].ChildQuestions[2].Responses.length==1?replaceQuestion[0].ChildQuestions[2].Responses.push(arr3):'';

              let arr4 = new Object();
                arr4['Id'] = 'Dummy4';
                arr4['Question_Choice__c'] ='a3nRt000009Ju4rIAC';
                arr4['Question_Column__c'] ='a3oRt0000001ocgIAA';
                arr4['Is_Other__c'] =false;
                arr4['Question__c'] ='a3sRt000003gl1MIAQ';
                arr4['Response_Number__c'] = 2;
                arr4['Response__c'] = '2';
                arr4['Survey_Invitation__c'] = 'a3uRt0000003eSLIAY';
              replaceQuestion[0].ChildQuestions[3].Responses.length==1?replaceQuestion[0].ChildQuestions[3].Responses.push(arr4):'';

              let arr5 = new Object();
                arr5['Id'] = 'Dummy5';
                arr5['Question_Choice__c'] ='a3nRt000009Ju4pIAC';
                arr5['Question_Column__c'] ='a3oRt0000001ocgIAA';
                arr5['Is_Other__c'] =false;
                arr5['Question__c'] ='a3sRt000003gl1LIAQ';
                arr5['Response_Number__c'] = 4;
                arr5['Response__c'] = '4';
                arr5['Survey_Invitation__c'] = 'a3uRt0000003eSLIAY';
              replaceQuestion[0].ChildQuestions[4].Responses.length==1?replaceQuestion[0].ChildQuestions[4].Responses.push(arr5):'';

              let arr6 = new Object();
                arr6['Id'] = 'Dummy6';
                arr6['Question_Choice__c'] ='a3nRt000009Ju4jIAC';
                arr6['Question_Column__c'] ='a3oRt0000001ocgIAA';
                arr6['Is_Other__c'] =false;
                arr6['Question__c'] ='a3sRt000003gl1IIAQ';
                arr6['Response_Number__c'] = 4;
                arr6['Response__c'] = '4';
                arr6['Survey_Invitation__c'] = 'a3uRt0000003eSLIAY';
              replaceQuestion[0].ChildQuestions[5].Responses.length==1?replaceQuestion[0].ChildQuestions[5].Responses.push(arr5):'';

            }*/

            console.log("replaceQuestion[0] after");
            console.log(JSON.parse(JSON.stringify(replaceQuestion[0])));

            if (index >= 0) {
              this.questionList[index] = replaceQuestion[0];
              this.visibilityCheck(index + 1, result, isLastQuestion);
            }
            console.log('this.questionList',JSON.parse(JSON.stringify(this.questionList)))
            this.showToast(
              "Success!!",
              "Your response is saved",
              "success",
              "dismissable"
            );
            return;
          }
        })
        .catch((error) => {
          console.error("Error", error);
          this.error = error;
        })
        .finally(() => {
          this.showSpinner = false;
          this.responseMap = new Map();
        });
    } else {
      this.getCurrentPageQuestions(false, isLastQuestion);
    }
  }

  //To check if question visibility logic is to be applied
  visibilityCheck(start, result, isLastQuestion) {
    // this method returns quesToShow & quesToHide
    checkVisibility({
      responses: result
    })
      .then((visibilityWrapper) => {
        console.log("visibilityWrapper ");
        console.log(visibilityWrapper);
        if (visibilityWrapper) {
          let quesToShowParentIds = []; // To store Ids of Parent Ques of Ques which are to be shown
          let quesToHideParentIds = []; // To store Ids of Parent Ques of Ques which are to be hidden
          let quesToShowIds = [];
          let quesToHideIds = [];
          visibilityWrapper.quesToShow?.forEach((showQuestion) => {
            if (!quesToShowParentIds.includes(showQuestion.parentId)) {
              quesToShowParentIds.push(showQuestion.parentId);
            }
            quesToShowIds.push(showQuestion.quesId);
          });
          visibilityWrapper.quesToHide?.forEach((hideQuestion) => {
            if (!quesToHideParentIds.includes(hideQuestion.parentId)) {
              quesToHideParentIds.push(hideQuestion.parentId);
            }
            quesToHideIds.push(hideQuestion.quesId);
          });

          for (let i = start; i < this.questionList.length; i++) {
            let currentQues = this.questionList[i];
            if (
              quesToShowParentIds.length > 0 &&
              quesToShowParentIds.includes(currentQues.Question.Id)
            ) {
              if (quesToShowIds.includes(currentQues.Question.Id)) {
                this.questionList[i].IsHidden = false;
              }
              for (
                let j = 0;
                j < this.questionList[i].ChildQuestions.length;
                j++
              ) {
                if (
                  quesToShowIds.includes(
                    this.questionList[i].ChildQuestions[j].Question.Id
                  )
                ) {
                  this.questionList[i].ChildQuestions[j].IsHidden = false;
                }
                for (
                  let k = 0;
                  k < this.questionList[i].ChildQuestions[j].length;
                  k++
                ) {
                  if (
                    quesToShowIds.includes(
                      this.questionList[i].ChildQuestions[j].ChildQuestions[k]
                        .Question.Id
                    )
                  ) {
                    this.questionList[i].ChildQuestions[j].ChildQuestions[
                      k
                    ].IsHidden = false;
                  }
                }
              }
            }
            if (
              quesToHideParentIds.length > 0 &&
              quesToHideParentIds.includes(currentQues.Question.Id)
            ) {
              if (quesToHideIds.includes(currentQues.Question.Id)) {
                this.questionList[i].IsHidden = true;
              }
              for (
                let j = 0;
                j < this.questionList[i].ChildQuestions.length;
                j++
              ) {
                if (
                  quesToHideIds.includes(
                    this.questionList[i].ChildQuestions[j].Question.Id
                  )
                ) {
                  this.questionList[i].ChildQuestions[j].IsHidden = true;
                }
                for (
                  let k = 0;
                  k < this.questionList[i].ChildQuestions[j].length;
                  k++
                ) {
                  if (
                    quesToHideIds.includes(
                      this.questionList[i].ChildQuestions[j].ChildQuestions[k]
                        .Question.Id
                    )
                  ) {
                    this.questionList[i].ChildQuestions[j].ChildQuestions[
                      k
                    ].IsHidden = true;
                  }
                }
              }
            }
          }

          //delete responses for these questionIds if they exist
          if (quesToHideIds && quesToHideIds.length > 0) {
            deleteResponses({
              questionsToHideIds: quesToHideIds,
              surveyInvitationId: this.surveyInvitationId
            })
              .then(() => {
                console.log("responses deleted");
              })
              .catch((error) => {
                console.error("Error", error);
                this.error = error;
              });
          }
        }

        //logic to store last question id on survey invitation record
        this.getCurrentPageQuestions(false, isLastQuestion);
      })
      .catch((error) => {
        console.error("Error ", error);
        this.error = error;
      });
  }

  showToast(title, message, variant, mode) {
    const event = new ShowToastEvent({
      title: title,
      message: message,
      variant: variant,
      mode: mode
    });
    this.dispatchEvent(event);
  }

  requiredTotal = 0;

  getNonTabularResponsesSum() {
    console.log('method called');
    let initialSum = 0;
    let isChildQuestion = this.currentScreenQuestionList[0].Question
      .Controlling_Question__r.Parent_Question__c
      ? true
      : false;
    let searchId = isChildQuestion
      ? this.currentScreenQuestionList[0].Question.Controlling_Question__r
        .Parent_Question__c
      : this.currentScreenQuestionList[0].Question.Controlling_Question__c;
    let index = this.questionList.findIndex(
      (ques) => ques.Question.Id === searchId
    );
    if (index > 0) {
      console.log('currentScreenQuestionList');
      console.log(JSON.stringify(this.currentScreenQuestionList[0]));

      let currentIndex = this.questionList.findIndex(
        (ques) =>
          ques.Question.Id === this.currentScreenQuestionList[0].Question.Controlling_Question__c
      );
      if (currentIndex > 0) {

        let currentQues = this.questionList[currentIndex];
        console.log('currentQues' + JSON.stringify(currentQues));

        if (
          currentQues.Responses &&
          currentQues.Responses.length > 0
        ) {
          for (let i = 0; i < currentQues.Responses.length; i++) {
            initialSum += parseFloat(currentQues.Responses[i].Response__c);
          }
        }
      }

      this.questionList[index].ChildQuestions.forEach((childQues) => {
        childQues.Responses.forEach((resp) => {
          if (
            (isChildQuestion &&
              resp.Question__c ===
              this.currentScreenQuestionList[0].Question
                .Controlling_Question__c) ||
            !isChildQuestion
          ) {
            initialSum += parseFloat(resp.Response__c);
          }
        });
      });
    }
    console.log('method exit' + initialSum);
    return initialSum;
  }
  getDyanamicColumnLabel(columns, controllingSum, initialSum, textToReplace) {
    let columns1 = [];
    columns.forEach((item, index) => {
      if (
        initialSum &&
        parseFloat(initialSum) &&
        item.Label__c.includes(initialSum.toString())
      ) {
        item.Label__c = item.Label__c.replace(
          initialSum.toString(),
          controllingSum.toString()
        );
      } else if (item.Label__c.includes(textToReplace)) {
        item.Label__c = item.Label__c.replace(
          textToReplace,
          controllingSum.toString()
        );
      }
      columns1.push(item);
    });
    return columns1;
  }
  getQuestionRefNumber() {

    let isChildQuestion = this.currentScreenQuestionList[0].Question
      .Controlling_Question__r.Parent_Question__c
      ? true
      : false;
    let searchId = isChildQuestion
      ? this.currentScreenQuestionList[0].Question.Controlling_Question__r
        .Parent_Question__c
      : this.currentScreenQuestionList[0].Question.Controlling_Question__c;
    let index = this.questionList.findIndex(
      (ques) => ques.Question.Id === searchId
    );
    return index + 1;
  }
  getDyanamicQuestionLabel(question, controllingSum, textToReplace) {
    console.log('dynamic method called>>' + question.Question_Label__c);
    let isupdated = false;
    if (question.Question_Label__c.includes(textToReplace)) {
      let str = question.Question_Label__c;
      if (str) {
        question.Question_Label__c = str.replace(
          textToReplace,
          controllingSum.toString()
        );
        isupdated = true;
      }
    }
    if (question.Question_Label__c.includes(question_Reference)) {
      let referanceQuestionNumber = this.getQuestionRefNumber();
      let str = question.Question_Label__c;
      if (str) {
        question.Question_Label__c = str.replace(
          question_Reference,
          'Q.' + referanceQuestionNumber
        );
        isupdated = true;
      }
    }
    if (question.Description__c && question.Description__c.includes(question_Reference)) {
      let referanceQuestionNumber = this.getQuestionRefNumber();
      let str = question.Description__c;
      if (str) {
        question.Description__c = str.replace(question_Reference, 'Q.' + referanceQuestionNumber);
        isupdated = true;
      }
    }
    if (question.Description__c && question.Description__c.includes(textToReplace)) {
      let str = question.Description__c;
      if (str) {
        question.Description__c = str.replace(
          textToReplace,
          controllingSum.toString()
        );
        isupdated = true;
      }
    }
    if (isupdated) {
      return question;
    }
    return null;
  }
  CurrentQuestionId;
  currentModule;
  requiredChildTotal = 0;
  getCurrentPageQuestions(isPrevious, isLastQuestion) {
    this.currentScreenQuestionList = [];
    const start = (this.currentPage - 1) * this.recordSize;
    let newArr = isPrevious
      ? this.questionList.slice(0, start + 1).reverse()
      : this.questionList.slice(start);
    for (let parentQuestion of newArr) {
      if (parentQuestion.IsHidden) {
        this.currentPage = isPrevious
          ? this.currentPage - 1
          : this.currentPage + 1;
      } else {
        this.currentScreenQuestionList = this.questionList.slice(
          (this.currentPage - 1) * this.recordSize,
          this.recordSize * this.currentPage
        );
        this.pageNumber = isPrevious
          ? this.pageNumber - 1
          : this.pageNumber + 1;
        break;
      }
    }
    if (
      (this.currentPage > this.totalPage && this.checkvalidity) ||
      isLastQuestion
    ) {
      this.dispatchEvent(
        new CustomEvent("showthankspage", {
          detail: {
            data: this.questionList
          }
        })
      );
      return;
    }
    if (
      this.currentScreenQuestionList &&
      this.currentScreenQuestionList.length > 0
    ) {
      let responsesList = [];
      if ((!this.currentScreenQuestionList[0].Responses
        || !this.currentScreenQuestionList[0].Responses[0].Response__c) && this.currentScreenQuestionList[0].Choices && this.currentScreenQuestionList[0].Choices.length > 0
        && this.currentScreenQuestionList[0].Choices[0].Choice.Default_Value__c) {
        if (!this.currentScreenQuestionList[0].Responses) {
          this.currentScreenQuestionList[0].Responses = [{ 'Response__c': this.currentScreenQuestionList[0].Choices[0].Choice.Default_Value__c }];

        } else {
          this.currentScreenQuestionList[0].Responses[0].Response__c = this.currentScreenQuestionList[0].Choices[0].Choice.Default_Value__c;
        }
        let response = new Object();
        response["response"] = this.currentScreenQuestionList[0].Responses[0].Response__c;
        response["questionId"] = this.currentScreenQuestionList[0].Question.Id;
        response["responseId"] =
          this.currentScreenQuestionList[0].Responses != null &&
            this.currentScreenQuestionList[0].Responses.length > 0
            ? this.currentScreenQuestionList[0].Responses[0].Id
            : null;
        response['isNumber'] = this.currentScreenQuestionList[0].Question.Question_Type__c == 'Number' ? true : false;
        this.responseMap.set(this.currentScreenQuestionList[0].Question.Id, [response]);
        this.isResponseEventFired = true;
      }

      this.currentScreenQuestionList[0].ChildQuestions.forEach((element) => {
        if ((!element.Responses
          || !element.Responses[0].Response__c) && element.Choices && element.Choices.length > 0
          && element.Choices[0].Choice.Default_Value__c) {
          if (!element.Responses) {
            element.Responses = [{ 'Response__c': element.Choices[0].Choice.Default_Value__c }];

          } else {
            element.Responses[0].Response__c = element.Choices[0].Choice.Default_Value__c;
          }

          let response = new Object();
          response["response"] = element.Responses[0].Response__c;
          response["questionId"] = element.Question.Id;
          response["responseId"] =
            element.Responses != null &&
              element.Responses.length > 0
              ? element.Responses[0].Id
              : null;
          response['isNumber'] = element.Question.Question_Type__c == 'Number' ? true : false;
          this.responseMap.set(element.Question.Id, [response]);
          this.isResponseEventFired = true;
        }

      });
      if (
        this.currentScreenQuestionList[0].Question.Controlling_Question__c &&
        this.currentScreenQuestionList[0].Question
          .Controlling_Question_Column__c
      ) {
        let isChildQuestion = this.currentScreenQuestionList[0].Question
          .Controlling_Question__r.Parent_Question__c
          ? true
          : false;
        let searchId = isChildQuestion
          ? this.currentScreenQuestionList[0].Question.Controlling_Question__r
            .Parent_Question__c
          : this.currentScreenQuestionList[0].Question
            .Controlling_Question__c;
        let index = this.questionList.findIndex(
          (ques) => ques.Question.Id === searchId
        );

        if (index > 0) {
          let initialSum =
            this.currentScreenQuestionList[0].ControllingQuesSUM;
          let sum = 0;
          this.questionList[index].ChildQuestions.forEach((childQues) => {
            if(childQues.Responses){
              childQues.Responses.forEach((resp) => {
                if (
                  resp.Question_Column__c &&
                  resp.Question_Column__c ===
                  this.currentScreenQuestionList[0].Question
                    .Controlling_Question_Column__c
                ) {
                  if (
                    (isChildQuestion &&
                      resp.Question__c ===
                      this.currentScreenQuestionList[0].Question
                        .Controlling_Question__c) ||
                    !isChildQuestion
                  ) {
                    sum += parseFloat(resp.Response__c);
                  }
                }
              });
            }
          });

          this.currentScreenQuestionList[0].ControllingQuesSUM = sum;
          let label =
            this.currentScreenQuestionList[0].Question.Question_Label__c;
          let replacedText = this.getDyanamicQuestionLabel(
            this.currentScreenQuestionList[0].Question,
            sum,
            initialSum &&
              parseFloat(initialSum) > 0 &&
              label.includes(initialSum.toString())
              ? initialSum.toString()
              : Survey_Controlling_Question_Sum
          );
          if (replacedText) {
            this.currentScreenQuestionList[0].Question = replacedText;
          }
          this.currentScreenQuestionList[0].Columns =
            this.getDyanamicColumnLabel(
              this.currentScreenQuestionList[0].Columns,
              sum,
              initialSum,
              Survey_Controlling_Question_Sum
            );
        }
      }
      else if (this.currentScreenQuestionList[0].Question.Controlling_Question__c) {
        console.log('non tabular sum block>>');
        let initialSum = this.currentScreenQuestionList[0].ControllingQuesSUM;
        let controllingSum = this.getNonTabularResponsesSum();
        this.currentScreenQuestionList[0].ControllingQuesSUM = controllingSum;
        let label =
          this.currentScreenQuestionList[0].Question.Question_Label__c;
        let replacedText = this.getDyanamicQuestionLabel(
          this.currentScreenQuestionList[0].Question,
          controllingSum,
          initialSum &&
            parseFloat(initialSum) > 0 &&
            label.includes(initialSum.toString())
            ? initialSum.toString()
            : Survey_Controlling_Question_Sum
        );
        if (replacedText) {
          this.currentScreenQuestionList[0].Question = replacedText;
        }
      }
      if (this.currentScreenQuestionList[0].Validations && this.currentScreenQuestionList[0].Validations.length > 0) {
        this.currentScreenQuestionList[0].Validations.forEach(element => {
          for (let i = 0; i < this.questionList.length; i++) {
            if (element.Dependent_Question__c && element.Dependent_Question__c == this.questionList[i].Question.Id && this.questionList[i].Responses && this.questionList[i].Responses.length > 0) {
              console.log('Validation IF');
              element.validationDependantResponse = this.questionList[i].Responses[0].Response__c;
              break;
            }
            else if (this.questionList[i].ChildQuestions) {
              console.log('Validation ELSEIF');
              let index = this.questionList[i].ChildQuestions.findIndex(
                (ques) => ques.Question.Id === element.Dependent_Question__c);
              if (index >= 0 && this.questionList[i].ChildQuestions[index].Responses && this.questionList[i].ChildQuestions[index].Responses.length > 0) {
                element.validationDependantResponse = this.questionList[i].ChildQuestions[index].Responses[0].Response__c;
              }
            }
          }
        });
      }
      // Added 12/11
      // if (this.currentScreenQuestionList[0].Validations && this.currentScreenQuestionList[0].Validations.length > 0) {
      //   this.currentScreenQuestionList[0].Validations.forEach(element => {
      //     if (element.Question.Question_Type__c == 'Tabular') {
      //       if (this.numberTypeColumns && this.numberTypeColumns.length > 0) {
      //         element.validationDependantResponse = this.numberTypeColumns[0].total;
      //       }
      //     }
      //     else {
      //       if (this.currentScreenQuestionList[0].Responses && this.currentScreenQuestionList[0].Responses.length > 0) {
      //         element.validationDependantResponse = this.currentScreenQuestionList[0].Responses[0].Response__c;
      //       }
      //     }
      //     let currentIndex = this.questionList.findIndex(
      //       (ques) =>
      //         ques.Question.Id === element.Dependent_Question__c
      //     );
      //     if(this.questionList[currentIndex].Question.Question_Type__c != 'Tabular'){
      //       element.
      //     }
      //   });
      // }

      if (this.currentScreenQuestionList[0].ChildQuestions) {
        this.currentScreenQuestionList[0].ChildQuestions.forEach(childQues => {
          if (childQues.Validations) {
            childQues.Validations.forEach(element => {
              for (let i = 0; i < this.questionList.length; i++) {
                if (childQues.Validations[0].Dependent_Question__c && childQues.Validations[0].Dependent_Question__c == this.questionList[i].Question.Id && this.questionList[i].Responses && this.questionList[i].Responses.length > 0) {
                  element.validationDependantResponse = this.questionList[i].Responses[0].Response__c;
                  break;
                }
                else if (this.questionList[i].ChildQuestions) {
                  let index = this.questionList[i].ChildQuestions.findIndex(
                    (ques) => ques.Question.Id == element.Dependent_Question__c);
                  if (index >= 0 && this.questionList[i].ChildQuestions[index].Responses && this.questionList[i].ChildQuestions[index].Responses.length > 0) {
                    element.validationDependantResponse = this.questionList[i].ChildQuestions[index].Responses[0].Response__c;
                  }
                }
              }
            });
          }
        });
      }
      let val = JSON.parse(JSON.stringify(this.currentScreenQuestionList));
      this.requiredTotal = val[0].Question.Required_Total__c;
      this.CurrentQuestionId = val[0].Question.Id;
      this.requiredChildTotal = val[0].Question.Required_Child_Total__c;
      if (
        val[0].Question.Module__r &&
        this.currentModule != val[0].Question.Module__r.Name
      ) {
        this.currentModule = val[0].Question.Module__r.Name;
        this.showModuleProgress();
      }
      this.showBackButton = this.currentPage == 1 ? false : true;
      const fields = {};
      fields[INVT_ID.fieldApiName] = this.surveyInvitationId;
      fields[INVT_LAST_QUESTION.fieldApiName] = val[0].Question.Id;
      updateRecord({ fields })
        .then(() => { })
        .catch((error) => {
          this.showToast("Error!!", error.body.message, "error", "dismissable");
        });
    }
    console.log('this.currentScreenQuestionList',JSON.parse(JSON.stringify(this.currentScreenQuestionList)) )
  }
  handlePrevious() {
    if (this.currentPage > 1) {
      this.currentPage = this.currentPage - 1;
      this.getCurrentPageQuestions(true, false);
    }
  }
  showError = false;
  handleNext() {
    this.total = 0;
    this.showError = false;
    let selectionMap = new Map();
    this.checkvalidity = false;
    let table = this.template.querySelector("c-vosf_tabular");
    if (table) {
      let val = this.template.querySelector("c-vosf_tabular").reportValidity();
      console.log("elementvali" + val);

      // let currentIndex = this.questionList.findIndex(
      //   (ques) =>
      //     ques.Question.Id === this.currentScreenQuestionList[0].Question.Id
      // );
      // this.questionList[currentIndex].ChildQuestions.forEach((ques) => {
      // console.log('Is_Other__c' + ques.Question.Is_Other__c);
      // console.log('Is_Other__c' + ques.Responses && ques.Responses.length > 0);
      // console.log('ques.Required_Child_Total__c:' + ques.Question.Required_Child_Total__c);
      // if (ques.Question.Required_Child_Total__c == 100) {
      //   if ((ques.Question.Is_Other__c && !(ques.Responses && ques.Responses.length > 0))) return;
      //   if (Number(ques.Question.RowSum) != 100) {
      //     // this.errorMsg = ques.Question.Question_Label__c + " total must be 100.";
      //     // this.showError = true;
      //     // this.showTotalError = true;
      //     val = false;
      //   }
      //   }
      // })



      if (val === true) this.checkvalidity = true;
      this.handleValidity();
    } else {
      let nontabular = this.template.querySelectorAll(
        "c-vosf_non-tabular-question"
      );
      nontabular.forEach((element) => {
        if (element) {
          element.reportValidity();
        }
      });
      let inputs = this.template.querySelectorAll(
        "c-vosf_non-tabular-question"
      );
      if (inputs != undefined) {
        for (let index = 0; index < inputs.length; index++) {
          if (inputs[index].reportValidity() == true) this.checkvalidity = true;
          else {
            this.checkvalidity = false;
            break;
          }
        }
      }

      if (this.requiredTotal) {
        this.template
          .querySelectorAll("c-vosf_non-tabular-question")
          .forEach((element) => {
            let inputval = element.inputValue();
            selectionMap.set(inputval["data-id"], inputval.value);
          });
        for (const x of selectionMap.values()) {
          this.total += Number(x);
        }
        if (this.total !== this.requiredTotal) {
          this.errorMsg = "Total must be " + this.requiredTotal + ".";
          this.showError = true;
          this.checkvalidity = false;
        }
      }
      if (
        this.requiredChildTotal &&
        this.requiredChildTotal != 0 &&
        this.requiredChildTotal != 0
      ) {
        let Childtotal = 0;
        let childTotalMap = new Map();
        this.template
          .querySelectorAll("c-vosf_non-tabular-question")
          .forEach((element) => {
            let inputval = element.inputValue();
            childTotalMap.set(inputval["data-id"], inputval.value);
          });
        childTotalMap.delete(this.CurrentQuestionId);
        for (const x of childTotalMap.values()) {
          Childtotal += Number(x);
        }

        if (Childtotal != this.requiredChildTotal) {
          this.errorMsg =
            "Sub-questions total must be " + this.requiredChildTotal + ".";
          this.showError = true;
          this.checkvalidity = false;
        }
      }
      
    }



    if (this.currentPage < this.totalPage && this.checkvalidity) {
      this.showBackButton = true;
      this.currentPage = this.currentPage + 1;
      this.saveResponses(this.currentScreenQuestionList, false);
    } else if (this.currentPage >= this.totalPage && this.checkvalidity) {
      this.saveResponses(this.currentScreenQuestionList, true);
    }
  }
  handlechange(event) {
    this.total = 0;
    this.validateVal = undefined;
    this.validateVal = event.detail.value;
    this.isRangeValidatedRequired = event.detail.isRangeValidatedRequired;
    this.minRange = event.detail.min;
    this.maxRange = event.detail.max;
  }
  handleEventColumn(event) {
    console.log('Event-->' + JSON.stringify(event.detail));
    this.numberTypeColumns = event.detail;
  }
@track showCustomErrorMsg='';
@track showCustomError = false;
  handleValidity() {
    this.showCustomError = false;
    console.log("INSIDE handleValidity");
    try{
    console.log(JSON.stringify(this.currentScreenQuestionList[0]));
      console.log(JSON.stringify(this.currentScreenQuestionList[0].Validations));
    if (this.currentScreenQuestionList[0].Validations && this.currentScreenQuestionList[0].Validations.length > 0) {
      this.currentScreenQuestionList[0].Validations.forEach(element => {
        let dependentQuestionSum;
        let questionSum;
        console.log('this.numberTypeColumns'+this.numberTypeColumns);
          if (this.numberTypeColumns && this.numberTypeColumns.length > 0) {
            questionSum = this.numberTypeColumns[0].total;
          }
                  console.log('this.questionSum'+questionSum);

        // else {
        //   if (this.currentScreenQuestionList[0].Responses && this.currentScreenQuestionList[0].Responses.length > 0) {
        //     element.validationDependantResponse = this.currentScreenQuestionList[0].Responses[0].Response__c;
        //   }
        // }
        console.log('this.questionList'+JSON.stringify(this.questionList));
        let currentIndex = this.questionList.findIndex(
          (ques) =>
            ques.Question.Id === element.Dependent_Question__c
        );
        if(currentIndex>0){
        if (this.questionList[currentIndex].Question.Question_Type__c != 'Tabular') {
          dependentQuestionSum = this.questionList[currentIndex].Responses[0].Response__c;
        }
        let compareRes = compareValidationValues(element.Operator__c, questionSum, dependentQuestionSum);
        if (!compareRes[0]) {
          this.showCustomErrorMsg = 'Value must be ' + compareRes[1] + ' ' + dependentQuestionSum;
          this.showCustomError = true;
          this.checkvalidity = false;
          //return false;
        }
        }
      });
      //return true;
    }
    }
    catch(e){
      console.log('exp' + e);
    }
  }
}