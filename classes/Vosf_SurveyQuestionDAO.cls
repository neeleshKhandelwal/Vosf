public with sharing class Vosf_SurveyQuestionDAO {
	public static List<Vosf_Survey_Question__c> getSurveyQuesBySurveyId(Id surveyId){
        return [
            SELECT Id, Survey__c, Question__c 
            FROM Vosf_Survey_Question__c 
            WHERE Survey__c =:surveyId
        ];
    }
}