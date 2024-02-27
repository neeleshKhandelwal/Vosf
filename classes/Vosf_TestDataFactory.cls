/**
 * @description       : 
 * @author            : ChangeMeIn@UserSettingsUnder.SFDoc
 * @group             : 
 * @last modified on  : 05-10-2023
 * @last modified by  : ChangeMeIn@UserSettingsUnder.SFDoc
**/

public with sharing class Vosf_TestDataFactory {
   
    public static List<Vosf_Question_Visibility_Rule__c> insertQuestionVisibilityRule(Boolean isInsert,List<Vosf_Question_Visibility_Rule__c> visibilityRuleList) {
        if (isInsert) {
            insert visibilityRuleList;
        }
        return visibilityRuleList;
        
    }
    public static List<Vosf_Question_Visibility_Criteria__c> insertQuestionVisibilityCriteria(Boolean isInsert,List<Vosf_Question_Visibility_Criteria__c> visibilityCriteria) {
        if (isInsert) {
            insert visibilityCriteria;
        }
        return visibilityCriteria;
        
    }
    public static List<Vosf_Question_Choice__c> insertQuestionChoices(Boolean isInsert,List<Vosf_Question_Choice__c> questionChoices) {
        if (isInsert) {
            insert questionChoices;
        }
        return questionChoices;
        
    }
    public static List<Vosf_Question_Response__c> insertQuestionResponses(Boolean isInsert,List<Vosf_Question_Response__c> questionResponses) {
        if (isInsert) {
            insert questionResponses;
        }
        return questionResponses;
        
    }
    
    public static Vosf_Module__c createModule(Boolean isInsert,String name,String recordTypeId) {
        Vosf_Module__c module = new Vosf_Module__c(Name = name,RecordTypeId = recordTypeId);
        if (isInsert) {
            insert module;
        }
        return module;    
    }
    
    public static Vosf_Survey_Setting__c createSurveySetting(Boolean isInsert,Boolean sendReminderEmail) {
        Vosf_Survey_Setting__c  surveySetting = new Vosf_Survey_Setting__c (Survey_Org_Base_URL__c = 'https://test-1f8-dev-ed.develop.lightning.force.com/lightning/n/VOSF_Survey?c__SurveyInvitationId=',
                                                                           First_Reminder_Period__c = 0,
                                                                           Second_Reminder_Period__c = 2,
                                                                           Third_Reminder_Period__c = 4,
                                                                           Send_Reminder_Email__c = sendReminderEmail);
        if (isInsert) {
            insert surveySetting;
        }
        return surveySetting;    
    }
    public static Vosf_Question__c createQuestion(Boolean isInsert,String type,String questionText) {
        Vosf_Question__c qns=new Vosf_Question__c(Question_Type__c=type,Sequence_Number__c=1,Question_Label__c=questionText, Name=questionText);
        if (isInsert) {
            insert qns;
        }
        return qns;
        
    }
    public static Vosf_Question_Visibility_Rule__c createQuestionVisibilityRule(Boolean isInsert,Id questionid,Id depedantQuestionId) {
        Vosf_Question_Visibility_Rule__c qvr =new Vosf_Question_Visibility_Rule__c(Question__c=questionid,Dependent_Question__c=depedantQuestionId);
        if (isInsert) {
            insert qvr;
        }
        return qvr;
        
    }
    public static Vosf_Question_Visibility_Criteria__c createQuestionVisibilityCriteria(Boolean isInsert,Id visibilityRuleId,Id choiceId,string operator,String value) {
        Vosf_Question_Visibility_Criteria__c qvc=new Vosf_Question_Visibility_Criteria__c(Question_Choice__c=choiceId,Question_Visibility_Rule__c=visibilityRuleId,Operator__c=operator,Value__c=value );
        if (isInsert) {
            insert qvc;
        }
        return qvc;
        
    }
    public static Vosf_Question_Choice__c createQuestionChoice(Boolean isInsert,Id questionId,String value,String type) {
        Vosf_Question_Choice__c qc=new Vosf_Question_Choice__c(Question__c=questionId,Value__c=value,Type__c=type);
        if (isInsert) {
            insert qc;
        }
        return qc;
        
    }
    public static Vosf_Survey__c createSurvey(Boolean isInsert,String status,String Name) {
        Vosf_Survey__c survey=new Vosf_Survey__c(Status__c=status,Name=Name);
        if (isInsert) {
            insert survey;
        }
        return survey;
    }

    public static Vosf_Survey_Invitation__c  createSurveyInvitation(Boolean isInsert,Id surveyId,String status) {
        System.debug(UserInfo.getUserId());
        Vosf_Survey_Invitation__c   surveyInvitation=new Vosf_Survey_Invitation__c(Survey__c=surveyId,Status__c=status,Participant__c=UserInfo.getUserId());
        if (isInsert) {
            insert surveyInvitation;
        }
        return surveyInvitation;
    }
    
    public static Vosf_Question_Response__c createQuestionResponse(Boolean isInsert,Id quetionId,Id choiceId,String response,String SinvitationId) {
        Vosf_Question_Response__c qs=new Vosf_Question_Response__c(Response__c=response,Question__c=quetionId,Question_Choice__c=choiceId,Survey_Invitation__c=SinvitationId);
        if (isInsert) {
            insert qs;
        }
        return qs;
    }    
    
    public static List<Vosf_Survey_Question__c> createSurveyQuestion(Id surveyId,List<Id> listOfQuestionId){
        List<Vosf_Survey_Question__c> surveyQuestionList = new List<Vosf_Survey_Question__c>();
        for(String questionId : listOfQuestionId){
            Vosf_Survey_Question__c surveyQuestion = new Vosf_Survey_Question__c(Question__c = questionId, Survey__c = surveyId);
            surveyQuestionList.add(surveyQuestion);
        }
        if(!surveyQuestionList.isEmpty()){
            Database.insert(surveyQuestionList,false);
        }
        return surveyQuestionList;
    }

    public static Vosf_Related_Question__c createRelatedQuestion(Id question,Id relatedQuestion,Id relatedquestioncolumn) {
        Vosf_Related_Question__c rqobj=new Vosf_Related_Question__c(Question__c=question,Related_Question__c=relatedQuestion,Related_Question_Column__c=relatedquestioncolumn);
        return rqobj;
    }
}