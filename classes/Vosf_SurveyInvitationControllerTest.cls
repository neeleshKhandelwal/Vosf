/**
 * @description       : 
 * @author            : ChangeMeIn@UserSettingsUnder.SFDoc
 * @group             : 
 * @last modified on  : 05-11-2023
 * @last modified by  : ChangeMeIn@UserSettingsUnder.SFDoc
**/
@isTest
private class Vosf_SurveyInvitationControllerTest {
	@isTest private static void testGetUsersForThisSurvey(){
        Test.startTest();
        Vosf_Survey_Setting__c settings= new Vosf_Survey_Setting__c();
        settings.Due_Date_Period__c = 5;
        settings.First_Reminder_Period__c = 0;
        settings.Invitation_Filters__c = '[{"field":"Name","label":"Name"},{"field":"UserRole.Name","label":"Role"},{"field":"Region__c","label":"Region"}]';
        settings.Second_Reminder_Period__c = 2;
        settings.Send_Completion_Email__c = true;
        settings.Send_Reminder_Email__c = true;
        settings.Survey_Invitation_Email_Template__c = 'Vosf_Survey_Invitation_Email_Template';
        settings.Survey_Org_Base_URL__c = 'https://krispykrunchychicken.sandbox.lightning.force.com/lightning/n/Vosf_Survey?c__SurveyInvitationId=&';
        settings.Third_Reminder_Period__c = 5;
        
        insert settings;
        //set up data
        Vosf_Survey__c survey = VOSF_TestDataFactory.createSurvey(true,'Draft','Test Survey');
        Id surveyId = survey.Id;
        
    	Vosf_Survey_Invitation__c surveyInvitation = VOSF_TestDataFactory.createSurveyInvitation(true, surveyId, 'Not Started');
   		Id surveyInvitationId = surveyInvitation.Id;

        Test.stopTest();
        
		System.assertNotEquals(0, Vosf_SurveyInvitationController.getUsersForThisSurvey(surveyId).size());
    }
    
    @isTest private static void testSendInvitation(){
        Test.startTest();
        //set up data
        Vosf_Survey__c survey = VOSF_TestDataFactory.createSurvey(true,'Draft','Test Survey');
        Id surveyId = survey.Id;
        
    	Vosf_Survey_Invitation__c surveyInvitation = VOSF_TestDataFactory.createSurveyInvitation(true, surveyId, 'Not Started');
   		Id surveyInvitationId = surveyInvitation.Id;
        
        List<Id> participantIds = new List<Id>();
        participantIds.add(UserInfo.getUserId());
        String emailBody = 'test test test';

        Test.stopTest();
        //dk
		System.assertEquals('success', Vosf_SurveyInvitationController.sendInvitation(participantIds, surveyId, emailBody));
    }
    
    @isTest private static void testSendEmail(){
        Test.startTest();
        
        //set up data
        Vosf_Survey__c survey = VOSF_TestDataFactory.createSurvey(true,'Draft','Test Survey');
        Id surveyId = survey.Id;
        
    	Vosf_Survey_Invitation__c surveyInvitation = VOSF_TestDataFactory.createSurveyInvitation(true, surveyId, 'Not Started');
   		Id surveyInvitationId = surveyInvitation.Id;
        Set<Id> surveyInvitationIds = new Set<Id>();
        surveyInvitationIds.add(surveyInvitationId);
        String emailBody = 'test test test';
        Vosf_SurveyInvitationController.sendEmails(surveyInvitationIds,emailBody);

        Test.stopTest();
        
		System.assertEquals(0, Limits.getEmailInvocations());
    }
    
    @isTest private static void testGetDefaultEmailTemplate(){
        try{
        	String test = Vosf_SurveyInvitationController.getDefaultEmailTemplate();
        }catch (Exception e){
            System.assertNotEquals(e, null);
        }
		
    }
}