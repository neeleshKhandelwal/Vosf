@isTest
private class Vosf_QuestionDAOTest {
    /***
     * the following methods test for functionailties in 
     * Vosf_QuestionDAO
     * Vosf_QuestionChoiceDAO
     * Vosf_QuestionColumnDAO
     * Vosf_Questions
     * Vosf_SurveyInvitationDAO
     * Vosf_SurveyQuestionDAO
     * Vosf_SurveyQuestionTrigger
     * Vosf_CreateSurveyQuestions
     * Vosf_UpdateSequenceNumber
	***/
    
    @isTest static void testQuestionDoesNotExist(){
        //set up data
        Vosf_Question__c ques1 = VOSF_TestDataFactory.createQuestion(false, 'Table', 'How many animals do you take care of');
        Id quesId = ques1.Id;
        System.assertEquals(Vosf_QuestionDAO.getById(quesId), null);
    }
    
    @isTest static void testCloneTable(){
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
        
        Vosf_Question_Column__c col1 = new Vosf_Question_Column__c(Name='', Question__c=quesId, Type__c='Text', Sequence_Number__c=1);
        insert col1;
        
        Vosf_Question_Column__c col2 = new Vosf_Question_Column__c(Name='', Question__c=quesId, Type__c='Text', Sequence_Number__c=2, IsEditable__c=true);
        insert col2;
        
        Vosf_Question_Choice__c ch1 = VOSF_TestDataFactory.createQuestionChoice(false, subQues1Id, '', 'Number');
        ch1.Question_Column__c = col2.Id;
        Vosf_Question_Choice__c ch2 = VOSF_TestDataFactory.createQuestionChoice(false, subQues2Id, '', 'Number');
        ch2.Question_Column__c = col2.Id;
        insert ch1;
        insert ch2;
        
        
        //run clone
        Id quesCloneId = Vosf_Questions.cloneQuestionData(quesId);
        Vosf_Question__c quesClone = VOSF_QuestionDAO.getById(quesCloneId);
        
        String clonedLabel = ('Copy - ' + ques1.Name).mid(0,80);
        System.assertEquals(quesClone.Name, clonedLabel); 
    }
    
    
    @isTest static void testClone3Layers(){
        //set up data
        Vosf_Question__c ques1 = VOSF_TestDataFactory.createQuestion(true, 'Number', 'Dummy question');
        Id quesId = ques1.Id;
        
        Vosf_Question__c subQues = VOSF_TestDataFactory.createQuestion(false, 'Number', 'Dummy question');
        subQues.Parent_Question__c = quesId;
        insert subQues;
        Id subQuesId = subQues.Id;
        
        Vosf_Question__c subSubQues = VOSF_TestDataFactory.createQuestion(false, 'Number', 'Dummy question');
        subSubQues.Parent_Question__c = subQuesId;
        insert subSubQues;
        Id subSubQuesId = subSubQues.Id;
        
        //run clone
        Id quesCloneId = Vosf_Questions.cloneQuestionData(quesId);
        Vosf_Question__c quesClone = VOSF_QuestionDAO.getById(quesCloneId);
        
        String clonedLabel = ('Copy - ' + ques1.Name).mid(0,80);
        System.assertEquals(quesClone.Name, clonedLabel);
        
        
    }
    
    @isTest static void testSurveyFunctionality(){
        //set up data
        Vosf_Question__c ques1 = VOSF_TestDataFactory.createQuestion(true, 'Number', 'How many dogs do you take care of?');
        Id ques1Id = ques1.Id;
        
        Vosf_Question__c ques2 = VOSF_TestDataFactory.createQuestion(false, 'Number', 'How many cats do you take care of?');
        ques2.Sequence_Number__c = 2.0;
        insert ques2;
        Id ques2Id = ques2.Id;
        
        Vosf_Question_Choice__c ch1 = VOSF_TestDataFactory.createQuestionChoice(true, ques1Id, '', 'Number');
        Vosf_Question_Choice__c ch2 = VOSF_TestDataFactory.createQuestionChoice(true, ques2Id, '', 'Number');
        
        Vosf_Survey__c survey = VOSF_TestDataFactory.createSurvey(true,'Draft','Test Survey');
        Id surveyId = survey.Id;
        
        /*Vosf_CreateSurveyQuestions.FlowInputs flowInput = new Vosf_CreateSurveyQuestions.FlowInputs();
        flowInput.surveyId = surveyId;
        flowInput.checkBoxValues = ques1Id + ';' + ques2Id;
        List<Vosf_CreateSurveyQuestions.FlowInputs> flowInputs = new List<Vosf_CreateSurveyQuestions.FlowInputs>();
        flowInputs.add(flowInput);
        Vosf_CreateSurveyQuestions.createSurveyQuestions(flowInputs);*/
        VOSF_TestDataFactory.createSurveyQuestion(surveyId, new List<Id>{ ques1Id, ques2Id});
        
       	System.assertEquals(ques1Id, Vosf_SurveyQuestionDAO.getSurveyQuesBySurveyId(surveyId)[0].Question__c);
        
        /*Vosf_CreateSurveyQuestions.FlowInputs flowInput2 = new Vosf_CreateSurveyQuestions.FlowInputs();
        flowInput2.surveyId = surveyId;
        flowInput2.checkBoxValues = ques1Id;
        List<Vosf_CreateSurveyQuestions.FlowInputs> flowInputs2 = new List<Vosf_CreateSurveyQuestions.FlowInputs>();
        flowInputs2.add(flowInput2);
        Vosf_CreateSurveyQuestions.createSurveyQuestions(flowInputs2);*/
        VOSF_TestDataFactory.createSurveyQuestion(surveyId, new List<Id>{ ques1Id });
        System.assertEquals(2, Vosf_SurveyQuestionDAO.getSurveyQuesBySurveyId(surveyId).size());
    }
    
    @isTest static void testSurveyInvitationFunctionality(){
		//set up data
		Vosf_Survey__c survey = VOSF_TestDataFactory.createSurvey(true,'Draft','Test Survey');
        Id surveyId = survey.Id;
        
    	Vosf_Survey_Invitation__c surveyInvitation = VOSF_TestDataFactory.createSurveyInvitation(false, surveyId, 'Not Started');
   		Id surveyInvitationId = surveyInvitation.Id;
        System.assertEquals(new List<Vosf_Survey_Invitation__c>(), Vosf_SurveyInvitationDAO.getSurveyInvitationByID(surveyInvitationId));
        
        Vosf_Survey_Invitation__c surveyInvitation1 = VOSF_TestDataFactory.createSurveyInvitation(false, surveyId, 'Not Started');
        Vosf_Survey_Invitation__c surveyInvitation2 = VOSF_TestDataFactory.createSurveyInvitation(false, surveyId, 'Not Started');
        Vosf_Survey_Invitation__c surveyInvitation3 = VOSF_TestDataFactory.createSurveyInvitation(false, surveyId, 'Not Started');
        Set<Id> ids = new Set<Id>();
        ids.add(surveyInvitation1.Id);
        ids.add(surveyInvitation2.Id);
        ids.add(surveyInvitation3.Id);
        System.assertEquals(new List<Vosf_Survey_Invitation__c>(), Vosf_SurveyInvitationDAO.getSurveyInvitationByIDs(ids));
    }
    
    /*@isTest static void testUpdateSeqNumFunctionality(){
        //set up data
        Vosf_Question__c ques1 = VOSF_TestDataFactory.createQuestion(true, 'Number', 'How many dogs do you take care of?');
        Id ques1Id = ques1.Id;
        
        Vosf_Question__c ques2 = VOSF_TestDataFactory.createQuestion(false, 'Number', 'How many cats do you take care of?');
        ques2.Sequence_Number__c = 2.0;
        insert ques2;
        Id ques2Id = ques2.Id;
        
        Vosf_UpdateQuestionSequenceNumber.updateSeq(ques2Id, 1.0, Vosf_GlobalConstant.MOVE_WITH_SHIFT);
        System.assertEquals(1.0, Vosf_QuestionDAO.getById(ques2Id).Sequence_Number__c);
        System.assertEquals(2.0, Vosf_QuestionDAO.getById(ques1Id).Sequence_Number__c);
    }*/
}