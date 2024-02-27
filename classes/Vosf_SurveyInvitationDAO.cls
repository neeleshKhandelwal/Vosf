/**
 * @description       : 
 * @author            : ChangeMeIn@UserSettingsUnder.SFDoc
 * @group             : 
 * @last modified on  : 06-01-2023
 * @last modified by  : ChangeMeIn@UserSettingsUnder.SFDoc
**/
public with sharing class Vosf_SurveyInvitationDAO {
	public static List<Vosf_Survey_Invitation__c> getSurveyInvitationByIDs(Set<Id> surveyInvitationIds){
        return [
            SELECT Id, Survey__c, Participant__c, Participant__r.Email,Survey_Link__c, 
                Survey__r.Welcome_Page_Content__c,Participant__r.Name  
            FROM Vosf_Survey_Invitation__c 
            WHERE Id IN:surveyInvitationIds AND Participant__r.Email != null
            ];
    }
    
    public static List<Vosf_Survey_Invitation__c> getSurveyInvitationByID(Id surveyInvitationId){
        return [
            SELECT Id, Survey__r.Welcome_Page_Content__c, Survey__r.Survey_Period__c,Participant__r.Name,Survey_Link__c,
                Last_Answered_Question__c, Status__c 
            FROM Vosf_Survey_Invitation__c 
            WHERE Id =:surveyInvitationId];
    }
    /**
     * @description return all the survey
     * @return  `List<Vosf_Survey__c>`
     */
    public static List<Vosf_Survey__c> getAllSurvey(){
        return [SELECT Id,Name FROM Vosf_Survey__c ];
    }
}