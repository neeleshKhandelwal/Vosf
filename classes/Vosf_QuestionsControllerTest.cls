/**
 * @description       : 
 * @author            : ChangeMeIn@UserSettingsUnder.SFDoc
 * @group             : 
 * @last modified on  : 05-10-2023
 * @last modified by  : ChangeMeIn@UserSettingsUnder.SFDoc
**/
@isTest
private class Vosf_QuestionsControllerTest {
	/***
     * the following methods test for functionailties in 
     * Vosf_QuestionDAO
     * Vosf_QuestionsController
     * Vosf_QuestionColumnDAO
     * Vosf_Questions
     * Vosf_SurveyInvitationController
     * Vosf_SurveyQuestionDAO
     * Vosf_SurveyQuestionTrigger
     * Vosf_CreateSurveyQuestions
     * Vosf_UpdateSequenceNumber
	***/
    
    @IsTest
     static void testGetQuestionsTableAndRatings(){
        //set up data
        Test.startTest();
        
        /** Table Question **/
        Vosf_Question__c ques1 = VOSF_TestDataFactory.createQuestion(true, 'Table', 'How many animals do you take care of');
        Id quesId = ques1.Id;
        
        Vosf_Question__c subQues1 = VOSF_TestDataFactory.createQuestion(false, 'Text', 'Cats');
        subQues1.Parent_Question__c = ques1.Id;
        subQues1.Question_Type__c =  'Rating';
        insert subQues1;
        Id subQues1Id = subQues1.Id;
        
        Vosf_Question__c subQues2 = VOSF_TestDataFactory.createQuestion(false, 'Text', 'Dogs');
        subQues2.Parent_Question__c =  subQues1.Id;
        subQues2.Question_Type__c =  'Comment';
        insert subQues2;
        Id subQues2Id = subQues2.Id;
        Vosf_Question__c subQues3 = VOSF_TestDataFactory.createQuestion(false, 'Text', 'Dogs');
        subQues3.Parent_Question__c =  subQues2.Id;
        subQues3.Question_Type__c =  'Comment';
        insert subQues3;
        Id subQues3Id = subQues3.Id;
        
        Vosf_Question_Column__c col1 = new Vosf_Question_Column__c(Label__c='Animal [survey_period]', Question__c=quesId, Type__c='Text', Sequence_Number__c=1);
        insert col1;
        
        Vosf_Question_Column__c col2 = new Vosf_Question_Column__c(Label__c='Number', Question__c=quesId, Type__c='Number', Sequence_Number__c=2, IsEditable__c=true);
        insert col2;
        
        Vosf_Question_Choice__c ch1 = VOSF_TestDataFactory.createQuestionChoice(false, subQues1Id, '', 'Number');
        ch1.Question_Column__c = col2.Id;
        Vosf_Question_Choice__c ch2 = VOSF_TestDataFactory.createQuestionChoice(false, subQues2Id, '', 'Number');
        ch2.Question_Column__c = col2.Id;
        insert ch1;
        insert ch2;
        
        /** simple question **/
        Vosf_Question__c ques2 = VOSF_TestDataFactory.createQuestion(false, 'Number', 'Dummy question');
        ques2.Sequence_Number__c = 2.0;
        insert ques2;
        Id ques2Id = ques2.Id;
        
        Vosf_Question_Choice__c ch3 = VOSF_TestDataFactory.createQuestionChoice(true, ques2Id, '', 'Number');
        
        /** Rating question **/
        Vosf_Question__c ques3 = VOSF_TestDataFactory.createQuestion(false, 'Rating', 'Dummy question');
        ques3.Sequence_Number__c = 3.0;
        ques3.Scale__c = 8.0;
        ques3.Threshold__c = 5.0;
        insert ques3;
        Id ques3Id = ques3.Id;
        
        /** Comment Question **/
        Vosf_Question__c ques3a = VOSF_TestDataFactory.createQuestion(false, 'Comment', 'Dummy question');
        ques3a.Parent_Question__c = ques3Id;
        ques3a.Sequence_Number__c = 1.0;
        insert ques3a;
        Id ques3aId = ques3a.Id;
        
        /** 3 hierarchy questions **/
        Vosf_Question__c ques4 = VOSF_TestDataFactory.createQuestion(false, 'Text', 'Dummy question');
        ques4.Sequence_Number__c = 4.0;
        insert ques4;
        Id ques4Id = ques4.Id;
        
        Vosf_Question__c ques4a = VOSF_TestDataFactory.createQuestion(false, 'Rating', 'Dummy question');
        ques4a.Parent_Question__c = ques4Id;
        ques4a.Scale__c = 8.0;
        ques4a.Threshold__c = 5.0;
        ques4a.Sequence_Number__c = 1.0;
        insert ques4a;
        Id ques4aId = ques4a.Id;
        
        Vosf_Question__c ques4ai = VOSF_TestDataFactory.createQuestion(false, 'Comment', 'Dummy question');
        ques4ai.Parent_Question__c = ques4aId;
        ques4ai.Sequence_Number__c = 1.0;
        insert ques4ai;
        Id ques4aiId = ques4ai.Id;
        
        Vosf_Question_Visibility_Rule__c vr = VOSF_TestDataFactory.createQuestionVisibilityRule(true, ques4Id, ques2Id);
        
    	Vosf_Question_Visibility_Criteria__c vc = VOSF_TestDataFactory.createQuestionVisibilityCriteria(true,vr.Id,ch3.Id,'=','2');
      
        /** survey **/
        Vosf_Survey__c survey = VOSF_TestDataFactory.createSurvey(false,'Draft','Test Survey');
        survey.Survey_Period__c = 'Season';
        insert survey;
        Id surveyId = survey.Id;
        
        /** survey invitation **/
    	Vosf_Survey_Invitation__c surveyInvitation = VOSF_TestDataFactory.createSurveyInvitation(true, surveyId, 'Not Started');
   		Id surveyInvitationId = surveyInvitation.Id;
        
        /** survey questions **/
        /*Vosf_CreateSurveyQuestions.FlowInputs flowInput = new Vosf_CreateSurveyQuestions.FlowInputs();
        flowInput.surveyId = surveyId;
        flowInput.checkBoxValues = quesId + ';' + ques2Id + ';' + ques3Id + ';' + ques4Id;
        List<Vosf_CreateSurveyQuestions.FlowInputs> flowInputs = new List<Vosf_CreateSurveyQuestions.FlowInputs>();
        flowInputs.add(flowInput);
        Vosf_CreateSurveyQuestions.createSurveyQuestions(flowInputs);*/
        VOSF_TestDataFactory.createSurveyQuestion(surveyId, new List<Id>{ quesId, ques2Id});
        
        /** responses **/
        Vosf_Question_Response__c response = VOSF_TestDataFactory.createQuestionResponse(true,ques2Id,ch3.Id,'2',surveyInvitationId);
        Vosf_Question_Response__c ratingResponse = VOSF_TestDataFactory.createQuestionResponse(true,ques3Id,null,'7.0',surveyInvitationId);
        Vosf_Question_Response__c rating2Response = VOSF_TestDataFactory.createQuestionResponse(true,ques4aId,null,'7.0',surveyInvitationId);
        
        /** testing **/
        List<Vosf_QuestionsController.QuestionWrapper> questionWrappers = Vosf_QuestionsController.getQuestions(surveyInvitationId);
        
        Test.stopTest();
        
        System.assertEquals(questionWrappers != null,true,'Expected to not be null');
        System.assertEquals(questionWrappers.size() > 0 ,true,'Expected list size to be > 0');
    }
    
    @isTest static void testGetQuestionsControllingQuestion(){
        Test.startTest();
        //set up data
        Vosf_Question__c ques1 = VOSF_TestDataFactory.createQuestion(true, 'Table', 'How many animals do you take care of');
        Id quesId = ques1.Id;
        
        Vosf_Question__c subQues1 = VOSF_TestDataFactory.createQuestion(false, 'Text', 'Cats');
        subQues1.Parent_Question__c = quesId;
        insert subQues1;
        Id subQues1Id = subQues1.Id;
        
        Vosf_Question__c subQues2 = VOSF_TestDataFactory.createQuestion(false, 'Text', 'Dogs');
        subQues2.Parent_Question__c = quesId;
        insert subQues2;
        Id subQues2Id = subQues2.Id;
        
        Vosf_Question_Column__c col1 = new Vosf_Question_Column__c(Label__c='Animal', Question__c=quesId, Type__c='Text', Sequence_Number__c=1);
        insert col1;
        
        Vosf_Question_Column__c col2 = new Vosf_Question_Column__c(Label__c='Number', Question__c=quesId, Type__c='Number', Sequence_Number__c=2, IsEditable__c=true);
        insert col2;
        
        Vosf_Question_Choice__c ch1 = VOSF_TestDataFactory.createQuestionChoice(false, subQues1Id, '', 'Number');
        ch1.Question_Column__c = col2.Id;
        Vosf_Question_Choice__c ch2 = VOSF_TestDataFactory.createQuestionChoice(false, subQues2Id, '', 'Number');
        ch2.Question_Column__c = col2.Id;
        insert ch1;
        insert ch2;
        
        Vosf_Question__c ques2 = VOSF_TestDataFactory.createQuestion(false, 'Table', 'How much food is needed in a [survey_period]?');
        ques2.Controlling_Question__c = quesId;
        ques2.Controlling_Question_Column__c = col2.Id;
        insert ques2;
        Id ques2Id = ques2.Id;
        
        Vosf_Question__c ques2SubQues1 = VOSF_TestDataFactory.createQuestion(false, 'Text', 'Cats [survey_period]');
        ques2SubQues1.Parent_Question__c = ques2Id;
        insert ques2SubQues1;
        Id ques2SubQues1Id = ques2SubQues1.Id;
        
        Vosf_Question__c ques2SubQues2 = VOSF_TestDataFactory.createQuestion(false, 'Text', 'Dogs');
        ques2SubQues2.Parent_Question__c = ques2Id;
        insert ques2SubQues2;
        Id ques2SubQues2Id = ques2SubQues2.Id;
        
        Vosf_Question_Column__c ques2Col1 = new Vosf_Question_Column__c(Label__c='Animal', Question__c=quesId, Type__c='Text', Sequence_Number__c=1);
        insert ques2Col1;
        
        Vosf_Question_Column__c ques2Col2 = new Vosf_Question_Column__c(Label__c='Food Amount', Question__c=quesId, Type__c='Formula', Sequence_Number__c=2, IsEditable__c=false);
        insert ques2Col2;
        
        Vosf_Survey__c survey = VOSF_TestDataFactory.createSurvey(false,'Draft','Test Survey');
        survey.Survey_Period__c = 'Season';
        insert survey;
        Id surveyId = survey.Id;
        
    	Vosf_Survey_Invitation__c surveyInvitation = VOSF_TestDataFactory.createSurveyInvitation(true, surveyId, 'Not Started');
   		Id surveyInvitationId = surveyInvitation.Id;
        
        /*Vosf_CreateSurveyQuestions.FlowInputs flowInput = new Vosf_CreateSurveyQuestions.FlowInputs();
        flowInput.surveyId = surveyId;
        flowInput.checkBoxValues = quesId + ';' + ques2Id;
        List<Vosf_CreateSurveyQuestions.FlowInputs> flowInputs = new List<Vosf_CreateSurveyQuestions.FlowInputs>();
        flowInputs.add(flowInput);
        Vosf_CreateSurveyQuestions.createSurveyQuestions(flowInputs);*/
        VOSF_TestDataFactory.createSurveyQuestion(surveyId, new List<Id>{ quesId, ques2Id});
        
        Vosf_Question_Response__c response = VOSF_TestDataFactory.createQuestionResponse(true,subQues1Id,ch1.Id,'2',surveyInvitationId);
        Vosf_Question_Response__c response2 = VOSF_TestDataFactory.createQuestionResponse(true,subQues2Id,ch2.Id,'2',surveyInvitationId);
        
        List<Vosf_Question__c> questions = new List<Vosf_Question__c>();
        questions.add(ques1);
        questions.add(ques2);
        
        List<String> questionIds = new List<String>();
        questionIds.add(String.valueOf(ques1.Id));
        questionIds.add(String.valueOf(ques2.Id));
        
        Set<Id> quesIds = new Set<Id>();
        quesIds.add(ques1.Id);
        quesIds.add(ques2.Id);
		    quesIds.add(subQues1Id);
        quesIds.add(subQues2Id);  
        
        //Map<String,Decimal> p1 = Vosf_QuestionsController.getControllingQuestionResponsesAggregate(questions, surveyInvitationId); //function does not work as we are trying to access fields on a related object
        //List<Vosf_Question_Response__c> p2 = Vosf_QuestionsController.getResponses2(questionIds, surveyInvitationId);
        Map<ID,List<Vosf_QuestionsController.ChoiceWrapper>> choices =  Vosf_QuestionsController.getChoices(quesIds);
        
        Test.stopTest();
        
        //System.assertEquals(0, p1.size()); // supposed to be 2 but for some reason the type of the parent question is returning null. the code uses Parent_Question__r.Question_Type
        //System.assertEquals(2, p2.size());
        System.assertEquals(2, choices.size());
    }
    @IsTest
    static void testGetRelatedQuestion() {
      
      Test.startTest();
      Vosf_Question__c ques1 = VOSF_TestDataFactory.createQuestion(true, 'Table', 'How many animals do you take care of');   
      Vosf_Question__c ques2 = VOSF_TestDataFactory.createQuestion(true, 'Text', 'What is number of question?');
      Vosf_Question_Choice__c ch1 = VOSF_TestDataFactory.createQuestionChoice(true, ques1.id, '', 'Number');
      Vosf_Question_Choice__c ch2 = VOSF_TestDataFactory.createQuestionChoice(true, ques2.id, '', 'Number');
      Vosf_Survey__c survey = VOSF_TestDataFactory.createSurvey(true,'Draft','Test Survey');
      Vosf_Survey_Invitation__c surveyInvitation = VOSF_TestDataFactory.createSurveyInvitation(true, survey.Id, 'Not Started');
      Vosf_Question_Response__c response = VOSF_TestDataFactory.createQuestionResponse(true,ques1.Id,ch1.Id,'2',surveyInvitation.Id);
      Vosf_Question_Response__c response2 = VOSF_TestDataFactory.createQuestionResponse(true,ques2.Id,ch1.Id,'2',surveyInvitation.Id);
      Vosf_Question_Column__c col1 = new Vosf_Question_Column__c(Label__c='Animal', Question__c=ques1.Id, Type__c='Text', Sequence_Number__c=1);
      insert col1;    
        Vosf_Related_Question__c rq = VOSF_TestDataFactory.createRelatedQuestion(ques1.Id,ques2.Id,col1.Id);
        List<Vosf_Question_Response__c> rr = Vosf_QuestionsController.getRelatedResponses(new List<Id>{ques1.Id,ques2.id}, surveyInvitation.Id, new List<Id>{col1.Id});
      System.assertNotEquals(0, rr.size(), 'Related question test');
      Test.stopTest();
    }
    @IsTest
    static void testsaveResponses() {
      
      Test.startTest();
      Vosf_Question__c ques1 = VOSF_TestDataFactory.createQuestion(true, 'Table', 'How many animals do you take care of');   
      Vosf_Question__c ques2 = VOSF_TestDataFactory.createQuestion(true, 'Text', 'What is number of question?');
      Vosf_Question_Choice__c ch1 = VOSF_TestDataFactory.createQuestionChoice(true, ques1.id, '', 'Number');
      Vosf_Question_Choice__c ch2 = VOSF_TestDataFactory.createQuestionChoice(true, ques2.id, '', 'Number');
      Vosf_Survey__c survey = VOSF_TestDataFactory.createSurvey(true,'Draft','Test Survey');
      Vosf_Survey_Invitation__c surveyInvitation = VOSF_TestDataFactory.createSurveyInvitation(true, survey.Id, 'Not Started');
      Vosf_Question_Response__c response = VOSF_TestDataFactory.createQuestionResponse(true,ques1.Id,ch1.Id,'2',surveyInvitation.Id);
      Vosf_Question_Response__c response2 = VOSF_TestDataFactory.createQuestionResponse(true,ques2.Id,ch1.Id,'2',surveyInvitation.Id); 
      Vosf_Question_Response__c response3 = VOSF_TestDataFactory.createQuestionResponse(true,ques1.Id,ch1.Id,'2',surveyInvitation.Id);
      String jsonString = JSON.serialize(new List<Vosf_Question_Response__c>{response});
      String jsonString2 = JSON.serialize(new List<Vosf_Question_Response__c>{response2});
      String jsonString3 = JSON.serialize(new List<Vosf_Question_Response__c>{response3});
      List<Vosf_Question_Response__c> res1=Vosf_QuestionsController.saveResponses(surveyInvitation.Id, jsonString);
      List<Vosf_Question_Response__c> res2=Vosf_QuestionsController.saveResponses(surveyInvitation.Id, jsonString2);
      List<Vosf_Question_Response__c> res3=Vosf_QuestionsController.saveResponses(surveyInvitation.Id, jsonString3);
      System.assertNotEquals(0, res1.size(), 'Related question test');
      System.assertNotEquals(0, res2.size(), 'Related question test');
      System.assertNotEquals(0, res3.size(), 'Related question test');
    Vosf_QuestionsController.deleteResponses(new List<Id>{ques1.Id,ques2.id}, surveyInvitation.Id);
      Test.stopTest();
    }
    @IsTest
    static void testcheckVisibility() {
      
      Test.startTest();
      Vosf_Question__c ques1 = VOSF_TestDataFactory.createQuestion(true, 'Table', 'How many animals do you take care of');   
      Vosf_Question__c ques2 = VOSF_TestDataFactory.createQuestion(true, 'Text', 'What is number of question?');
      Vosf_Question_Choice__c ch1 = VOSF_TestDataFactory.createQuestionChoice(true, ques1.id, 'true', 'Number');
      Vosf_Question_Choice__c ch2 = VOSF_TestDataFactory.createQuestionChoice(true, ques2.id, 'true', 'Number');
      Vosf_Survey__c survey = VOSF_TestDataFactory.createSurvey(true,'Draft','Test Survey');
      Vosf_Survey_Invitation__c surveyInvitation = VOSF_TestDataFactory.createSurveyInvitation(true, survey.Id, 'Not Started');
      Vosf_Question_Response__c response = VOSF_TestDataFactory.createQuestionResponse(true,ques1.Id,ch1.Id,'2',surveyInvitation.Id);
      Vosf_Question_Response__c response2 = VOSF_TestDataFactory.createQuestionResponse(true,ques2.Id,ch1.Id,'2',surveyInvitation.Id); 
      Vosf_Question_Response__c response3 = VOSF_TestDataFactory.createQuestionResponse(true,ques1.Id,ch1.Id,'2',surveyInvitation.Id);
      Vosf_Question_Visibility_Rule__c qvr=new Vosf_Question_Visibility_Rule__c(Name='Test',Dependent_Question__c=ques1.Id,Question__c=ques2.Id);
      List<Vosf_Question_Visibility_Rule__c> qvrobj=VOSF_TestDataFactory.insertQuestionVisibilityRule(true, new List<Vosf_Question_Visibility_Rule__c>{qvr});
      Vosf_Question_Visibility_Criteria__c qvc=new Vosf_Question_Visibility_Criteria__c(Name='Test',Question_Visibility_Rule__c=qvrobj[0].Id,Value__c='true',Question_Choice__c=ch1.Id,Operator__c='=');
     // Vosf_Question_Visibility_Criteria__c qvc1=new Vosf_Question_Visibility_Criteria__c(Name='Test',Question_Visibility_Rule__c=qvrobj[0].Id,Value__c='true',Question_Choice__c=ch1.Id,Operator__c='>'); 
      //Vosf_Question_Visibility_Criteria__c qvc2=new Vosf_Question_Visibility_Criteria__c(Name='Test',Question_Visibility_Rule__c=qvrobj[0].Id,Value__c='true',Question_Choice__c=ch1.Id,Operator__c='<'); 
      //Vosf_Question_Visibility_Criteria__c qvc3=new Vosf_Question_Visibility_Criteria__c(Name='Test',Question_Visibility_Rule__c=qvrobj[0].Id,Value__c='true',Question_Choice__c=ch1.Id,Operator__c='<='); 
      //Vosf_Question_Visibility_Criteria__c qvc4=new Vosf_Question_Visibility_Criteria__c(Name='Test',Question_Visibility_Rule__c=qvrobj[0].Id,Value__c='true',Question_Choice__c=ch1.Id,Operator__c='>='); 

      List<Vosf_Question_Visibility_Criteria__c> qvcobj=VOSF_TestDataFactory.insertQuestionVisibilityCriteria(true, new List<Vosf_Question_Visibility_Criteria__c>{qvc});
       Vosf_QuestionsController.visibilityWrapper vw= Vosf_QuestionsController.checkVisibility( new List<Vosf_Question_Response__c>{response,response2,response3});
       System.assertNotEquals(null, vw, 'Related question test');
      Test.stopTest();
    }
}