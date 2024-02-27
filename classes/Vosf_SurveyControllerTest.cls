/**
 * @description       : 
 * @author            : ChangeMeIn@UserSettingsUnder.SFDoc
 * @group             : 
 * @last modified on  : 05-12-2023
 * @last modified by  : ChangeMeIn@UserSettingsUnder.SFDoc
**/
@IsTest
public class Vosf_SurveyControllerTest {
    
	@TestSetup static void createTestData() {
		VOSF_TestDataFactory.createSurvey(true,'Draft','Test Survey');
        Vosf_Module__c module = VOSF_TestDataFactory.createModule(true,'Module',
                                Schema.SObjectType.Vosf_Module__c.getRecordTypeInfosByDeveloperName()
                                .get('Module').getRecordTypeId());
        Vosf_Module__c submodule = VOSF_TestDataFactory.createModule(false,'Sub-Module',
                                Schema.SObjectType.Vosf_Module__c.getRecordTypeInfosByDeveloperName()
                                .get('Sub_Module').getRecordTypeId());
        submodule.Parent_Module__c = module.Id;
        insert submodule;
        Vosf_Question__c parentQuestion = VOSF_TestDataFactory.createQuestion(true,'Text','Parent Question Label');
        Vosf_Question__c question = VOSF_TestDataFactory.createQuestion(false,'Text','Question Label');
        question.Module__c = module.Id;
        question.Sub_Module__c = submodule.Id;
        question.Parent_Question__c = parentQuestion.Id;
        insert question;
	}
    
    @IsTest
    private static void createSurveyQuestionsTest() {
        String questionId = [SELECT Id FROM Vosf_Question__c LIMIT 1]?.Id;
        Test.startTest();
        Vosf_SurveyController.createSurveyQuestions([SELECT Id FROM Vosf_Survey__c LIMIT 1]?.Id,
                                                    new List<String>{questionId});
        Test.stopTest();
        List<Vosf_Survey_Question__c> surveyQuestions = [SELECT Id,Survey__c,Question__c FROM Vosf_Survey_Question__c];
        System.assertEquals(surveyQuestions != null,true,'Expected to not be null');
        System.assertEquals(surveyQuestions.size() > 0 ,true,'Expected list size to be > 0');
    }
    
    @IsTest
    private static void insertSurveyQuestionsTest() {
        String questionId = [SELECT Id FROM Vosf_Question__c LIMIT 1]?.Id;
        Test.startTest();
        Vosf_SurveyController.insertSurveyQuestions([SELECT Id FROM Vosf_Survey__c LIMIT 1]?.Id,
                                                    new List<String>{questionId});
        Test.stopTest();
        List<Vosf_Survey_Question__c> surveyQuestions = [SELECT Id,Survey__c,Question__c FROM Vosf_Survey_Question__c];
        System.assertEquals(surveyQuestions != null,true,'Expected to not be null');
        System.assertEquals(surveyQuestions.size() > 0 ,true,'Expected list size to be > 0');
    }
    
    @IsTest
    private static void getQuestionsForModulesTest() {
        List<String> moduleIds = new List<String>();
        for(Vosf_Module__c module : [SELECT Id FROM Vosf_Module__c]){
            moduleIds.add(module.Id);
        }
        Test.startTest();
        List<Vosf_SurveyController.QuestionWrapper> questionsWrapper = Vosf_SurveyController.getQuestionsForModules(moduleIds);
        Test.stopTest();
        System.assertEquals(questionsWrapper != null,true,'Expected to not be null');
        System.assertEquals(questionsWrapper.size() > 0 ,true,'Expected list size to be > 0');
    }
    
    @IsTest
    private static void hasChildQuestionsTest() {
        String questionId = [SELECT Id FROM Vosf_Question__c WHERE Parent_Question__c != null LIMIT 1]?.Id;
        Test.startTest();
        Boolean hasChild = Vosf_SurveyController.hasChildQuestions(new List<String>{questionId});
        Test.stopTest();
        System.assertEquals(hasChild,true,'Expected to be true');
    }
}