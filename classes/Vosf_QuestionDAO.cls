public with sharing class Vosf_QuestionDAO {
    public static Vosf_Question__c getById(String questionId){
        List<Vosf_Question__c> questionList = 
            [SELECT Id, Controlling_Question__c, Controlling_Question_Column__c, Description__c,
                Is_Total_Validation_Required__c, isRequired__c, Module__c,
                Sequence_Number__c, Parent_Question__c, Question_Label__c, Name,
                Question_Type__c
             FROM Vosf_Question__c 
             WHERE Id = : questionId
            ];
        
        if(questionList != null && !questionList.isEmpty()){
            return questionList[0];
        }
        
        return null;
    }
    
    public static List<Vosf_Question__c> insertQuestions(List<Vosf_Question__c> questionList){
        insert questionList;
        return questionList;
    }
    
    public static List<Vosf_Question__c> getByParent(String questionId){
        return [
            SELECT Id, Controlling_Question__c, Controlling_Question_Column__c, Description__c,
                Is_Total_Validation_Required__c, isRequired__c, Module__c,
                Sequence_Number__c, Parent_Question__c, Question_Label__c, Name,
                Question_Type__c
            FROM Vosf_Question__c 
            WHERE Parent_Question__c = : questionId
        ];
    }
    
    public static List<Vosf_Question__c> getByGrandParent(String questionId){
        return [
            SELECT Id, Controlling_Question__c, Controlling_Question_Column__c, Description__c,
                Is_Total_Validation_Required__c, isRequired__c, Module__c,
                Sequence_Number__c, Parent_Question__c, Question_Label__c, Name,
                Question_Type__c
            FROM Vosf_Question__c 
            WHERE Parent_Question__r.Parent_Question__c = : questionId
        ];
    }    
    
}