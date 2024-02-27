trigger Vosf_SurveyQuestionTrigger on Vosf_Survey_Question__c (before insert) {
    if(Trigger.isInsert){
        
        List<Vosf_Survey_Question__c> surveyQuestionList = Trigger.New; 
        Map<Id,Set<Id>> surveyIdVsQuestionIds = new Map<Id,Set<Id>>();
        Set<Id> surveyIds = new Set<Id>();
        for(Vosf_Survey_Question__c surveyQuestion : surveyQuestionList){
            surveyIds.add(surveyQuestion.Survey__c);
        }
        
        List<Vosf_Survey_Question__c> existingSurveyQuestions = [SELECT Id,Survey__c,Question__c 
                                                                 FROM Vosf_Survey_Question__c 
                                                                 WHERE Survey__c IN : surveyIds];
        for(Vosf_Survey_Question__c surveyQues : existingSurveyQuestions){
            Set<Id> questionsSet = new Set<Id>();
            if(surveyIdVsQuestionIds.get(surveyQues.Survey__c) != null){
                questionsSet = surveyIdVsQuestionIds.get(surveyQues.Survey__c);
            }
            questionsSet.add(surveyQues.Question__c);
            surveyIdVsQuestionIds.put(surveyQues.Survey__c,questionsSet);
        }
        
        for(Vosf_Survey_Question__c surveyQuestion : surveyQuestionList){
            if(surveyIdVsQuestionIds.get(surveyQuestion.Survey__c) != null){
                Set<Id> questionsSet = surveyIdVsQuestionIds.get(surveyQuestion.Survey__c);
                if(questionsSet.contains(surveyQuestion.Question__c)){
                    surveyQuestion.addError('Please ensure survey and question combination is unique.');
                }
            }
        }
    }
}