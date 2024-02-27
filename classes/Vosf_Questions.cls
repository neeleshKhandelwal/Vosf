/**
 * @description       : 
 * @author            : ChangeMeIn@UserSettingsUnder.SFDoc
 * @group             : 
 * @last modified on  : 03-31-2023
 * @last modified by  : ChangeMeIn@UserSettingsUnder.SFDoc
**/
public with sharing class Vosf_Questions { 

    @AuraEnabled
    public static String cloneQuestionData(String questionId){
        Map<Id, Vosf_Question__c> mapOfQuestion = new Map<Id, Vosf_Question__c>();
        Vosf_Question__c question = VOSF_QuestionDAO.getById(questionId);
        Vosf_Question__c clonedQuestion = cloneQuestions(new List<Vosf_Question__c>{ question }, null)[0];
        
        mapOfQuestion.put(question.Id, clonedQuestion);
        List<Vosf_Question_Choice__c> choiceList = VOSF_QuestionChoiceDAO.getByQuestions(new List<Id>{ question.Id });
        List<Vosf_Question_Choice__c> clonedChoiceList = cloneChoices(choiceList, mapOfQuestion);
        if(question.Question_Type__c == 'Table'){
            List<Vosf_Question_Column__c> columnList = VOSF_QuestionColumnDAO.getByQuestions(new List<Id>{ question.Id });
        	List<Vosf_Question_Column__c> clonedColumnList = cloneColumns(columnList, mapOfQuestion);
        }
        List<Vosf_Question__c> subQuestionList = VOSF_QuestionDAO.getByParent(question.Id);
        
        if(subQuestionList != null && !subQuestionList.isEmpty()){
            
            List<Id> subQuestionIds = new List<Id>();
            for(Vosf_Question__c subQuestion : subQuestionList){
                subQuestionIds.add(subQuestion.Id);
            }
            
            List<Vosf_Question__c> clonedSubQuestionList = cloneQuestions(subQuestionList, mapOfQuestion);
            
            for(Vosf_Question__c clonedSubQuestion: clonedSubQuestionList){
                mapOfQuestion.put(clonedSubQuestion.Cloned_From__c, clonedSubQuestion);
            }
            
            List<Vosf_Question_Choice__c> subChoiceList = VOSF_QuestionChoiceDAO.getByQuestions(subQuestionIds);
            List<Vosf_Question_Choice__c> clonedSubChoiceList = cloneChoices(subChoiceList, mapOfQuestion);
            
            List<Vosf_Question__c> grandChildQuestionList = VOSF_QuestionDAO.getByGrandParent(question.Id);
            
            if(grandChildQuestionList != null && !grandChildQuestionList.isEmpty()){
                List<Id> grandChildQuestionIds = new List<Id>();
                for(Vosf_Question__c grandChildQuestion : grandChildQuestionList){
                    grandChildQuestionIds.add(grandChildQuestion.Id);
                }
                List<Vosf_Question__c> clonedGrandQuestionList = cloneQuestions(grandChildQuestionList, mapOfQuestion);
                
                for(Vosf_Question__c clonedGrandChildQuestion: clonedGrandQuestionList){
                    mapOfQuestion.put(clonedGrandChildQuestion.Cloned_From__c, clonedGrandChildQuestion);
                }
                
                List<Vosf_Question_Choice__c> grandChoiceList = VOSF_QuestionChoiceDAO.getByQuestions(grandChildQuestionIds);
                List<Vosf_Question_Choice__c> clonedGrandChoiceList = cloneChoices(grandChoiceList, mapOfQuestion);  
            }
        }  
        return clonedQuestion.Id;
    }
    
    public static List<Vosf_Question__c> cloneQuestions(List<Vosf_Question__c> questionList, Map<Id, Vosf_Question__c> mapOfQuestion){
        List<Vosf_Question__c> clonedQuestionList = new List<Vosf_Question__c>();
        for(Vosf_Question__c question: questionList){
            Vosf_Question__c clonedQuestion = question.clone(false, false, false, false);
            String cQName = 'Copy - ' + question.Name;
            clonedQuestion.Name = cQName.mid(0,80);
            clonedQuestion.Cloned_From__c = question.Id;
            if(mapOfQuestion!= null && mapOfQuestion.containsKey(question.Parent_Question__c)){
            	clonedQuestion.Parent_Question__c = mapOfQuestion.get(question.Parent_Question__c).Id;
            }
            clonedQuestionList.add(clonedQuestion);
        }
        
        if(!clonedQuestionList.isEmpty())
        	clonedQuestionList = VOSF_QuestionDAO.insertQuestions(clonedQuestionList);
        
        return clonedQuestionList;
    }
    
    public static List<Vosf_Question_Choice__c> cloneChoices(List<Vosf_Question_Choice__c> choiceList, Map<Id, Vosf_Question__c> mapOfQuestion){
        List<Vosf_Question_Choice__c> clonedChoiceList = new List<Vosf_Question_Choice__c>();
        for(Vosf_Question_Choice__c choice: choiceList){
            Vosf_Question_Choice__c clonedChoice = choice.clone(false, false, false, false);
            if(mapOfQuestion.containsKey(choice.Question__c)){
            	clonedChoice.Question__c = mapOfQuestion.get(choice.Question__c).Id;
            }
            clonedChoiceList.add(clonedChoice);
        }
        if(!clonedChoiceList.isEmpty()){
        	clonedChoiceList = VOSF_QuestionChoiceDAO.insertChoices(clonedChoiceList);
        }
        
        return clonedChoiceList;
    }
    
    public static List<Vosf_Question_Column__c> cloneColumns(List<Vosf_Question_Column__c> columnList, Map<Id, Vosf_Question__c> mapOfQuestion){
        List<Vosf_Question_Column__c> clonedColumnList = new List<Vosf_Question_Column__c>();
        for(Vosf_Question_Column__c column: columnList){
            Vosf_Question_Column__c clonedColumn = column.clone(false, false, false, false);
            if(mapOfQuestion.containsKey(column.Question__c)){
            	clonedColumn.Question__c = mapOfQuestion.get(column.Question__c).Id;
            }
            clonedColumnList.add(clonedColumn);
        }
        if(!clonedColumnList.isEmpty()){
        	clonedColumnList = VOSF_QuestionColumnDAO.insertColumns(clonedColumnList);
        }
        
        return clonedColumnList;
    }
}