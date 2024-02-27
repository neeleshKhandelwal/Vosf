/**
 * @description       : 
 * @author            : ChangeMeIn@UserSettingsUnder.SFDoc
 * @group             : 
 * @last modified on  : 06-22-2023
 * @last modified by  : ChangeMeIn@UserSettingsUnder.SFDoc
**/
public with sharing class Vosf_QuestionsController {
     
    public class QuestionWrapper {
        @AuraEnabled public Vosf_Question__c Question {get;set;} // choice as subquery
        @AuraEnabled public Integer QuestionSequence {get;set;}
        @AuraEnabled public Decimal ControllingQuesSUM {get;set;}
        @AuraEnabled public List <Vosf_Question_Column__c> Columns {get;set;}
        @AuraEnabled public List <Vosf_Question_Response__c> Responses {get;set;}
        @AuraEnabled public List <ChoiceWrapper> Choices {get;set;}
        @AuraEnabled public List <QuestionWrapper> ChildQuestions {get;set;}
        @AuraEnabled public List <Vosf_Related_Question__c> relatedQuestions {get;set;}//depedant qns
        @AuraEnabled public List <Vosf_Validation__c> Validations {get;set;}
        @AuraEnabled public Boolean IsHidden {get;set;}
        @AuraEnabled public Boolean IsTable {get;set;}
        @AuraEnabled public Boolean IsTextArea {get;set;}
        @AuraEnabled public Boolean IsText {get;set;}
        @AuraEnabled public Boolean IsCombobox {get;set;}
        @AuraEnabled public Boolean IsRadio {get;set;}
        @AuraEnabled public Boolean IsSlider {get;set;}
        @AuraEnabled public Boolean IsCheckbox {get;set;}
        @AuraEnabled public Boolean IsNumber {get;set;}
        @AuraEnabled public Boolean IsMultiselect {get;set;}
        @AuraEnabled public Boolean IsRating {get;set;}
        @AuraEnabled public Boolean IsComment {get;set;}
    }
    public class ChoiceWrapper{
        @AuraEnabled public Vosf_Question_Choice__c Choice {get;set;}
        @AuraEnabled public Boolean IsText {get;set;}
        @AuraEnabled public Boolean IsRadio {get;set;}
        @AuraEnabled public Boolean IsCheckbox {get;set;}
        @AuraEnabled public Boolean IsNumber {get;set;}
        @AuraEnabled public Boolean IsCombo{get;set;}
    }
    @AuraEnabled
    public static List<QuestionWrapper> getQuestions(Id surveyInvitationId){      
        List<QuestionWrapper> listQuestionWrap = new List <QuestionWrapper>();
        List<VOSF_Survey_Invitation__c> surveyInvitations = 
            VOSF_SurveyInvitationDAO.getSurveyInvitationByID(surveyInvitationId);
            Map<Id, List<Vosf_Validation__c>> validationMap =getValidations();
        if(surveyInvitations != null && !surveyInvitations.isEmpty()){
            Set<Id> questionIds = new Set<Id>();
            List<Vosf_Survey_Question__c> surveyQuestions =VOSF_SurveyQuestionDAO.getSurveyQuesBySurveyId(surveyInvitations[0].Survey__c);    
            for(Vosf_Survey_Question__c sqObj:surveyQuestions){
                if(sqObj.Question__c != null){
                    questionIds.add(sqObj.Question__c);
                }
            }
            if(!questionIds.isEmpty()){
                Map<Id,List<Vosf_Question_Column__c>> questionWithColumns = getColumns(questionIds,surveyInvitations[0].Survey__r.Survey_Period__c);
                Set<Id> parentQuestionIds = new Set<Id>();
                Set<Id> controllingQuestionIds = new Set<Id>();
                System.Debug('questionIds:' + questionIds);
                List<Vosf_Question__c> questionsList= [SELECT Id, Question_Type__c,isRequired__c,Description__c,
                                                  Is_Total_Validation_Required__c,Parent_Question__c,Threshold__c,
                                                  Controlling_Question__c,Controlling_Question__r.Parent_Question__c,
                                                  Controlling_Question__r.Question_Type__c,Is_Other__c,
                                                  Controlling_Question_Column__c, Sequence_Number__c,Question_Label__c,
                                                  Scale__c,Comment_Label__c,Required_Child_Total__c,Required_Total__c, Module__r.Name, Module__r.Sequence_Number__c
                                                  FROM Vosf_Question__c 
                                                  WHERE ID IN:questionIds 
                                                  OR Parent_Question__c IN:questionIds 
                                                  OR Parent_Question__r.Parent_Question__c IN:questionIds 
                                                  ORDER BY Module__r.Sequence_Number__c,Sequence_Number__c];
                                                  Set<Id> questionIds2 = new Set<Id>();
                                for(Vosf_Question__c sqObj:questionsList){
                                if(sqObj.Question_Label__c != null){
                                    questionIds2.add(sqObj.Id);
                                }
                            }
                getResponsesWrapper responseWrap = new getResponsesWrapper();
                responseWrap = getResponses(questionIds2,surveyInvitationId);
                
                Map<Id,List<Vosf_Question_Response__c>> questionWithResponses = responseWrap.questionResponseMap;
                Set<Id> questionsToHideSet = new Set<Id>();
                if(responseWrap != null && !responseWrap.questionResponseList.isEmpty()){
                    visibilityWrapper wrapperToSetIsHidden = checkVisibility(responseWrap.questionResponseList);
                    for(visibilityInnerWrapper hideQues : wrapperToSetIsHidden.quesToHide){
                        questionsToHideSet.add(hideQues.quesId);
                    }
                }
                Map<Id,List<ChoiceWrapper>> questionWithChoices = getChoices(questionIds2);
                Integer sequence = 0;
                for(Vosf_Question__c question: questionsList){
                    String parentQuestion = null;
                    if(question.Parent_Question__c == null){ // Parent Questions
                        sequence++;
                        QuestionWrapper questionWrapper = new QuestionWrapper();
                        questionWrapper.Question = getDynamicQuestion(question,surveyInvitations[0].Survey__r.Survey_Period__c);
                        questionWrapper.relatedQuestions = getRelatedQuestion(question.Id);
                        questionWrapper.Validations=validationMap.get(question.Id);
                        questionWrapper.QuestionSequence = sequence;
                        questionWrapper.IsTable = question.Question_Type__c == 'Table' ? true : false;
                        questionWrapper.IsTextArea = question.Question_Type__c == 'TextArea' ? true : false;
                        questionWrapper.IsCombobox = question.Question_Type__c == 'Combobox' ? true : false;
                        questionWrapper.IsRadio = question.Question_Type__c == 'Radio' ? true : false;
                        questionWrapper.IsMultiSelect = question.Question_Type__c == 'Multiselect' ? true : false;
                        questionWrapper.IsNumber = question.Question_Type__c == 'Number' ? true : false;
                        questionWrapper.IsCheckbox = question.Question_Type__c == 'Checkbox' ? true : false;
                        questionWrapper.IsText = question.Question_Type__c == 'Text' ? true : false;
                        questionWrapper.IsSlider = question.Question_Type__c == 'Slider' ? true : false;
                        questionWrapper.IsRating = question.Question_Type__c == 'Rating' ? true : false;
                        questionWrapper.IsComment = question.Question_Type__c == 'Comment' ? true : false;
                        questionWrapper.Columns = questionWithColumns.get(question.Id);
                        questionWrapper.Responses = questionWithResponses.get(question.Id);
                        questionWrapper.Choices = questionWithChoices.get(question.Id);
                        questionWrapper.ChildQuestions = new List<QuestionWrapper>();
                        questionWrapper.IsHidden = questionsToHideSet.contains(question.Id) ? true : false;
                        
                        for(Vosf_Question__c ques:questionsList){
                            if(ques.Parent_Question__c == question.Id ){ // Child Questions
                                QuestionWrapper quesWrapper = new QuestionWrapper();
                                System.debug('ques'+ques);
                                SYstem.debug('surveyInvitations[0].Survey__r.Survey_Period__c'+surveyInvitations[0].Survey__r.Survey_Period__c);
                                quesWrapper.Question = getDynamicQuestion(ques,surveyInvitations[0].Survey__r.Survey_Period__c);
                                quesWrapper.IsTable = ques.Question_Type__c == 'Table' ? true : false;
                                quesWrapper.IsTextArea = ques.Question_Type__c == 'TextArea' ? true : false;
                                quesWrapper.IsCombobox = ques.Question_Type__c == 'Combobox' ? true : false;
                                quesWrapper.IsRadio = ques.Question_Type__c == 'Radio' ? true : false;
                                quesWrapper.IsMultiSelect = ques.Question_Type__c == 'Multiselect' ? true : false;
                                quesWrapper.IsNumber = ques.Question_Type__c == 'Number' ? true : false;
                                quesWrapper.IsCheckbox = ques.Question_Type__c == 'Checkbox' ? true : false;
                                quesWrapper.IsText = ques.Question_Type__c == 'Text' ? true : false;
                                quesWrapper.IsSlider = ques.Question_Type__c == 'Slider' ? true : false;
                                quesWrapper.IsRating = ques.Question_Type__c == 'Rating' ? true : false;
                                quesWrapper.IsComment = ques.Question_Type__c == 'Comment' ? true : false;
                                quesWrapper.Columns = questionWithColumns.get(ques.Id);
                                quesWrapper.Responses = questionWithResponses.get(ques.Id);
                                quesWrapper.Choices = questionWithChoices.get(ques.Id);
                                quesWrapper.IsHidden = questionsToHideSet.contains(ques.Id) ? true : false;
                                quesWrapper.Validations=validationMap.get(ques.Id);
                                if(questionWrapper.IsRating && quesWrapper.IsComment){
                                    if(questionWrapper.Responses != null && questionWrapper.Responses.size() > 0){
                                        Vosf_Question_Response__c quesResp = questionWrapper.Responses[0];
                                        if(question.Threshold__c != null && quesResp.Response__c != null && 
                                           Decimal.valueOf(quesResp.Response__c) > question.Threshold__c){
                                            quesWrapper.IsHidden = true;
                                        }
                                    }
                                }

                                quesWrapper.ChildQuestions = new List<QuestionWrapper>();
                                
                                for(Vosf_Question__c que:questionsList){
                                    if(que.Parent_Question__c == ques.Id ){ // Grand Child Questions
                                        QuestionWrapper queWrapper = new QuestionWrapper();
                                        queWrapper.Question =getDynamicQuestion(que,surveyInvitations[0].Survey__r.Survey_Period__c);
                                        queWrapper.IsTable = que.Question_Type__c == 'Table' ? true : false;
                                        queWrapper.IsTextArea = que.Question_Type__c == 'TextArea' ? true : false;
                                        queWrapper.IsCombobox = que.Question_Type__c == 'Combobox' ? true : false;
                                        queWrapper.IsRadio = que.Question_Type__c == 'Radio' ? true : false;
                                        queWrapper.IsMultiSelect = que.Question_Type__c == 'Multiselect' ? true : false;
                                        queWrapper.IsNumber = que.Question_Type__c == 'Number' ? true : false;
                                        queWrapper.IsCheckbox = que.Question_Type__c == 'Checkbox' ? true : false;
                                        queWrapper.IsText = que.Question_Type__c == 'Text' ? true : false;
                                        queWrapper.IsSlider = que.Question_Type__c == 'Slider' ? true : false;
                                        queWrapper.IsRating = que.Question_Type__c == 'Rating' ? true : false;
                                        queWrapper.IsComment = que.Question_Type__c == 'Comment' ? true : false;
                                        queWrapper.Columns = questionWithColumns.get(que.Id);
                                        queWrapper.Responses = questionWithResponses.get(que.Id);
                                        queWrapper.Choices = questionWithChoices.get(que.Id);
                                        queWrapper.IsHidden = questionsToHideSet.contains(que.Id) ? true : false;
                                        queWrapper.Validations=validationMap.get(que.Id);                                    
                                        if(quesWrapper.IsRating && queWrapper.IsComment){
                                            if(quesWrapper.Responses != null && quesWrapper.Responses.size() > 0){
                                                Vosf_Question_Response__c quesResp = quesWrapper.Responses[0];
                                                if(ques.Threshold__c != null && quesResp.Response__c != null &&
                                                   Decimal.valueOf(quesResp.Response__c) > ques.Threshold__c){
                                                    queWrapper.IsHidden = true;
                                                }
                                            }
                                        }                                        
                                        quesWrapper.ChildQuestions.add(queWrapper);
                                    }
                                }
                                questionWrapper.ChildQuestions.add(quesWrapper);
                            }
                        }
                        listQuestionWrap.add(questionWrapper);
                    }
                }                
            }
        }
        System.Debug('listQuestionWrapper:' + JSON.serialize(listQuestionWrap));
        return listQuestionWrap;
    }
  private static List<Vosf_Related_Question__c> getRelatedQuestion(String questionId){
return [select Name,Question__c,Related_Question__c,Related_Question__r.Question_Label__c,Related_Question_Column__c,Indentity__c from Vosf_Related_Question__c where Question__c=:questionId];
    }
    public static Map<Id, List<Vosf_Validation__c>>  getValidations(){
        Map<Id, List<Vosf_Validation__c>> validationMap = new Map<Id, List<Vosf_Validation__c>>();
        List<Vosf_Validation__c> listVal=[SELECT Question__c,Dependent_Question__c,Operator__c FROM Vosf_Validation__c];
        for (Vosf_Validation__c validObj : listVal) {
            if(!validationMap.containsKey(validObj.Question__c)){
                validationMap.put(validObj.Question__c, new List<Vosf_Validation__c>());
            }
            validationMap.get(validObj.Question__c).add(validObj);
        }
        return validationMap;
    }
        

    private static Vosf_Question__c getDynamicQuestion(Vosf_Question__c question,String surveyPeriod) {
        if(question.Question_Label__c.Contains(System.Label.Survey_Period)){
            question.Question_Label__c=question.Question_Label__c.replace(System.Label.Survey_Period,surveyPeriod);       
        }
        if(question.Description__c!=null && question.Description__c.Contains(System.Label.Survey_Period)){
            question.Description__c=question.Description__c.replace(System.Label.Survey_Period,surveyPeriod);       
        }
       
        return question;
    }
    private static Vosf_Question_Column__c getDynamicColumn(Vosf_Question_Column__c column,String surveyPeriod) {
        if( column.Label__c!=null && column.Label__c.Contains(System.Label.Survey_Period) )
        {
            column.Label__c=column.Label__c.replace(System.Label.Survey_Period,surveyPeriod);       
        }
       
        return column;
    }
    public static Map<ID,List <Vosf_Question_Column__c>> getColumns( Set<Id> questionIds, String surveyPeriod) { 
        
        Map<Id,List<Vosf_Question_Column__c>> questionWithCOlumns = new Map<Id,List<Vosf_Question_Column__c>>();
        List<Vosf_Question_Column__c> columnList =  [SELECT Id, Question__c, Description__c, IsEditable__c, Type__c, Label__c,Show_Sum__c,
                                                     Is_Total_Validation_Required__c,Required_Total__c,Max_Total_Value__c,daysOnRecurring__c,percentOfPeriodicActivities__c,hideColumn__c
                                                     FROM Vosf_Question_Column__c 
                                                     WHERE Question__c IN :questionIds 
                                                     ORDER BY Sequence_Number__c ];
        for(Vosf_Question_Column__c column : columnList){
           
                column= getDynamicColumn(column,surveyPeriod);         
             
            if(!questionWithCOlumns.containsKey(column.Question__c)){
                questionWithCOlumns.put(column.Question__c,new List<Vosf_Question_Column__c>());
            }
            questionWithCOlumns.get(column.Question__c).add(column);
        }
        return questionWithCOlumns;
        
    }

    @AuraEnabled
    public static List<Vosf_Question_Response__c> getRelatedResponses( List<String> questionIds, ID surveyInvitationId,List<String> columnIds ) { 
        System.debug('questionIds: '+questionIds);
        getResponsesWrapper responseWrap = new getResponsesWrapper();
        Map<Id,List<Vosf_Question_Response__c>> questionWithResponses = new Map<Id,List<Vosf_Question_Response__c>>();
        List<Vosf_Question_Response__c> responseList =  [SELECT Id, Name, Question__c, Question_Choice__c, 
                                                        Question_Column__c,Survey_Invitation__c,Response__c,
                                                        Question_Choice__r.Value__c ,Primary_Question__c
                                                        FROM Vosf_Question_Response__c 
                                                        WHERE (Question__c IN :questionIds OR Question_Column__c IN :columnIds)
                                                        AND Survey_Invitation__c =:surveyInvitationId];
        return responseList;   
    }
    //To get responses for question
    public static getResponsesWrapper getResponses( Set<Id> questionIds, ID surveyInvitationId ) { 
        
        getResponsesWrapper responseWrap = new getResponsesWrapper();
        Map<Id,List<Vosf_Question_Response__c>> questionWithResponses = new Map<Id,List<Vosf_Question_Response__c>>();
        List<Vosf_Question_Response__c> responseList =  [SELECT Id, Name, Question__c, Question_Choice__c, 
                                                        Question_Column__c,Survey_Invitation__c,Response__c,Is_Other__c,
                                                        Question_Choice__r.Value__c,Primary_Question__c
                                                        FROM Vosf_Question_Response__c 
                                                        WHERE Question__c IN :questionIds 
                                                        AND Survey_Invitation__c =:surveyInvitationId];
        for(Vosf_Question_Response__c response : responseList){
            if(!questionWithResponses.containsKey(response.Question__c)){
                questionWithResponses.put(response.Question__c,new List<Vosf_Question_Response__c>());
            }
            questionWithResponses.get(response.Question__c).add(response);
        }
        responseWrap.questionResponseList = responseList;
        responseWrap.questionResponseMap = questionWithResponses;
        return responseWrap;   
    }
    
    public static Map<ID,List <ChoiceWrapper>> getChoices( Set<Id> questionIds ) { 
        
        Map<Id,List<ChoiceWrapper>> questionWithChoices = new Map<Id,List<ChoiceWrapper>>();
        List<Vosf_Question_Choice__c> choiceList =  [SELECT Id,IsEditable__c,Question_Column__c,Max__c,Min__c,Group_Name__c, Name, Question__c, Type__c,
                                                Value__c,Place_Holder__c,Range_Validation__c, Question_Choice__c,Label__c,Default_Value__c
                                                FROM Vosf_Question_Choice__c
                                                WHERE Question__c IN :questionIds
                                                ORDER BY Sequence_Number__c];
        for(Vosf_Question_Choice__c choice : choiceList){
            ChoiceWrapper choicewrapperObj = new ChoiceWrapper();
            choicewrapperObj.Choice = choice;
            choicewrapperObj.IsText = choice.Type__c != null && choice.Type__c == 'Text' ? true : false;
            choicewrapperObj.IsNumber = choice.Type__c != null && choice.Type__c == 'Number' ? true : false;
            choicewrapperObj.IsCheckbox = choice.Type__c != null && choice.Type__c == 'Checkbox' ? true : false;
            choicewrapperObj.IsRadio = choice.Type__c != null && choice.Type__c == 'Radio' ? true : false;
            choicewrapperObj.IsCombo = choice.Type__c != null && choice.Type__c == 'Combobox' ? true : false;
            if(!questionWithChoices.containsKey(choice.Question__c)){
                questionWithChoices.put(choice.Question__c,new List<ChoiceWrapper>());
            }
            questionWithChoices.get(choice.Question__c).add(choicewrapperObj);
        }
        return questionWithChoices;
        
    }
    
       public static Map<String,Decimal> getControllingQuestionResponsesAggregate( List <Vosf_Question__c> QuestionList , String surveyInvitationId) { 
        
        Map<String,String> questionWithControllingColumn = new Map<String,String>();
        Map<String,Decimal> columnWithSum = new Map<String,Decimal>();
        Map<String,Decimal> questionWithSum = new Map<String,Decimal>();
        Map<String,String> nonTabularControllingQuestionToIdMap = new Map<String,String>();
        for(Vosf_Question__c question: QuestionList){
            if(question.Controlling_Question__c != null && question.Controlling_Question__r.Question_Type__c == 'Table' 
               && question.Controlling_Question_Column__c != null){
                   questionWithControllingColumn.put(question.ID,question.Controlling_Question_Column__c);
               }
            if(question.Controlling_Question__c != null && question.Controlling_Question__r.Question_Type__c == 'Number' )
            {
                nonTabularControllingQuestionToIdMap.put(question.Controlling_Question__c,question.ID);
            }
        }
        if(questionWithControllingColumn!=null && !questionWithControllingColumn.isEmpty()){
            List<Vosf_Question_Response__c> responseList =  [SELECT Id, Question__c,Question__r.Parent_Question__c ,
                                                        Question_Column__c, Response__c 
                                                        FROM Vosf_Question_Response__c 
                                                        WHERE Question_Column__c IN : questionWithControllingColumn.values()
                                                        AND Survey_Invitation__c = :surveyInvitationId]; 
            for(Vosf_Question_Response__c response: responseList){ 
                if(!columnWithSum.containsKey(response.Question_Column__c)){
                    columnWithSum.put(response.Question_Column__c,Decimal.valueOf(response.Response__c));
                }else {
                    columnWithSum.put(response.Question_Column__c,columnWithSum.get(response.Question_Column__c) 
                                      + Decimal.valueOf(response.Response__c));
                } 
            }
        }
        if(!nonTabularControllingQuestionToIdMap.isEmpty()){
            List<Vosf_Question_Response__c> responseList =  [SELECT Id, Question__c,Question__r.Parent_Question__c,
                                                             Response__c FROM Vosf_Question_Response__c 
                                                             WHERE Question__c IN : nonTabularControllingQuestionToIdMap.KeySet()
                                                             AND Survey_Invitation__c = :surveyInvitationId]; 
            for(Vosf_Question_Response__c response: responseList){
                System.debug('question>>'+nonTabularControllingQuestionToIdMap.get(response.Question__c));
                System.debug('response>>'+ Decimal.valueOf(response.Response__c));
                questionWithSum.put(nonTabularControllingQuestionToIdMap.get(response.Question__c),Decimal.valueOf(response.Response__c));             
            }
            
        }
        for(String questionId: questionWithControllingColumn.keySet()){
            if(columnWithSum!=null && columnWithSum.containsKey(questionWithControllingColumn.get(questionId)) 
               && columnWithSum.get(questionWithControllingColumn.get(questionId)) != null){
                   questionWithSum.put(questionId,columnWithSum.get(questionWithControllingColumn.get(questionId)) );
               }
        }
        return questionWithSum;
    }

    @AuraEnabled
    public static List<Vosf_Question_Response__c> saveResponses(Id SurveyInvitationId,String Response){
        List<responses> responseList = (List<responses>)JSON.deserialize(Response, List<responses>.class);
        //check response Id. If it exists delete the record. Create a new record with inputs provided. 
        //we don't go with the upsert approach.  
        List<Vosf_Question_Response__c> responsesToInsert = new List<Vosf_Question_Response__c>();
        List<Vosf_Question_Response__c> responsesToDelete = new List<Vosf_Question_Response__c>();
        Set<String> questionIds = new Set<String>();
        for(responses responseRecord : responseList){
            if(responseRecord.questionId != null){
                questionIds.add(responseRecord.questionId + (String.isBlank(responseRecord.columnId) ? '' : responseRecord.columnId));
            }
        }
        
        responsesToDelete = [SELECT Id FROM Vosf_Question_Response__c 
                             WHERE QuestionAndColumn__c IN :questionIds 
                             AND Survey_Invitation__c = :SurveyInvitationId];
        for(responses responseRecord : responseList){
            Vosf_Question_Response__c quesResp = new Vosf_Question_Response__c();
            // key is Survey_Invitation__c,Vosf_Question__c 
            quesResp.Question_Choice__c = responseRecord.choiceId;
            quesResp.Question__c = responseRecord.questionId;
            quesResp.Response__c = responseRecord.response;
            quesResp.Response_Number__c = responseRecord.isNumber != null && responseRecord.isNumber && String.isNotBlank(responseRecord.response)
                && Decimal.valueOf(responseRecord.response) != null ? Decimal.valueOf(responseRecord.response) : null;
            quesResp.Response_Text__c = responseRecord.isText != null && responseRecord.isText && String.isNotBlank(responseRecord.response) ? 
                String.valueOf(responseRecord.response) : null;
            quesResp.Question_Column__c = responseRecord.columnId;
            quesResp.Is_Other__c=responseRecord.is_Other==true? true:false;
            quesResp.Survey_Invitation__c = SurveyInvitationId;
            responsesToInsert.add(quesResp);  
        }
        if(!responsesToInsert.isEmpty()){
            insert responsesToInsert;
        }
        if(!responsesToDelete.isEmpty()){
            delete responsesToDelete;
        }
        return responsesToInsert;     
    }
    
    //To delete question responses of hidden questions if they exist. 
    @AuraEnabled
    public static void deleteResponses(List<String> questionsToHideIds, String surveyInvitationId){
        List<Vosf_Question_Response__c> questionResponses = [SELECT Id 
                                                        FROM Vosf_Question_Response__c 
                                                        WHERE (Question__c IN :questionsToHideIds OR
                                                        Primary_Question__c IN :questionsToHideIds)
                                                        AND Survey_Invitation__c = :surveyInvitationId];
        if(!questionResponses.isEmpty()){
            Database.delete(questionResponses);
        }
    }
    
    //To check visibility for questions. This method returns set of question Ids that should be hidden & shown 
    @AuraEnabled
    public static visibilityWrapper checkVisibility(List<Vosf_Question_Response__c> responses){
        Map<Id,Vosf_Question_Response__c> quesIdVsResponse = new Map<Id,Vosf_Question_Response__c>();
        List<visibilityInnerWrapper> quesToHideList = new List<visibilityInnerWrapper>();
        List<visibilityInnerWrapper> quesToShowList = new List<visibilityInnerWrapper>();
        visibilityWrapper finalWrapper = new visibilityWrapper();
        for(Vosf_Question_Response__c questionResponse : responses){
            quesIdVsResponse.put(questionResponse.Question__c,questionResponse);
        }
            System.debug(quesIdVsResponse.size());
            System.debug(quesIdVsResponse);
        if(quesIdVsResponse != null && !quesIdVsResponse.isEmpty()){
            for(Vosf_Question_Visibility_Rule__c rule : [SELECT Id,Question__c,Dependent_Question__c,
                                                Dependent_Question__r.Parent_Question__c,
                                                Dependent_Question__r.Parent_Question__r.Parent_Question__c,
                                                (SELECT Operator__c,Value__c, Question_Choice__c
                                                FROM Question_Visibility_Criteria__r ) 
                                                FROM Vosf_Question_Visibility_Rule__c
                                                WHERE Question__c IN :quesIdVsResponse.keySet()])
            {
                Id parentId = rule.Dependent_Question__r.Parent_Question__c == null ? rule.Dependent_Question__c :
                              rule.Dependent_Question__r.Parent_Question__r.Parent_Question__c != null ? 
                              rule.Dependent_Question__r.Parent_Question__r.Parent_Question__c :
                              rule.Dependent_Question__r.Parent_Question__c;
                System.debug('RULE'+ rule);
                System.debug('ERROR 1'+quesIdVsResponse.get(rule.Question__c));
                System.debug('ERROR 2'+rule.Question_Visibility_Criteria__r);
                if(compareValues(quesIdVsResponse.get(rule.Question__c),rule.Question_Visibility_Criteria__r)){
                    visibilityInnerWrapper quesToHide = new visibilityInnerWrapper(false,parentId,rule.Dependent_Question__c);
                    quesToHideList.add(quesToHide);
                }else{
                    visibilityInnerWrapper quesToShow = new visibilityInnerWrapper(true,parentId,rule.Dependent_Question__c);
                    quesToShowList.add(quesToShow);
                }                       
            }
        }
       
        finalWrapper.quesToShow = quesToShowList;
        finalWrapper.quesToHide = quesToHideList;
        return finalWrapper;
    }
    
    public static Boolean compareValues(Vosf_Question_Response__c response, Vosf_Question_Visibility_Criteria__c criteria) {
        // Ask Kushal why we have different operators when comparison is for choice only. May be it is for future context
        if(response != null && criteria != null){
            if(criteria.question_choice__c!=null){
                return response.question_choice__c==criteria.question_choice__c;
            }
            String value1 = response.Response__c;
            String value2 = criteria.Value__c;
            switch on criteria.Operator__c {
                when '=' {
                    return value1 == value2;
                }
                when '>' {
                    return value1 >value2;
                }
                when '<' {
                    return value1 < value2;
                }
                when '>=' {
                    return value1 >= value2;
                }
                when '<=' {
                    return value1 <= value2;
                }  
            }
        }
        return false;
    }
    
    public class getResponsesWrapper{
        @AuraEnabled public List<Vosf_Question_Response__c> questionResponseList;
        @AuraEnabled public Map<Id,List<Vosf_Question_Response__c>> questionResponseMap;
    }
    
    public class visibilityWrapper{
        @AuraEnabled public List<visibilityInnerWrapper> quesToShow {get;set;}
        @AuraEnabled public List<visibilityInnerWrapper> quesToHide {get;set;}
    }
    
    public class visibilityInnerWrapper{
        @AuraEnabled public Boolean showHide; //true for show, false for hide
        @AuraEnabled public String parentId;
        @AuraEnabled public String quesId;
        public visibilityInnerWrapper(Boolean showHide,String parentId,String quesId) {
            this.showHide = showHide;
            this.parentId = parentId;
            this.quesId = quesId;
        }
   }
    
    
    public class responses{
        @AuraEnabled public String response;
        @AuraEnabled public String questionId;
        @AuraEnabled public String choiceId;
        @AuraEnabled public String columnId; //only for Table type Question
        @AuraEnabled public Boolean isNumber = false;
        @AuraEnabled public Boolean isText = false;
        @AuraEnabled public Boolean is_Other = false;
    }   
}