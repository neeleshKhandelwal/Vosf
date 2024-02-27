/**
 * @description       : 
 * @author            : ChangeMeIn@UserSettingsUnder.SFDoc
 * @group             : 
 * @last modified on  : 05-12-2023
 * @last modified by  : ChangeMeIn@UserSettingsUnder.SFDoc
 * Vosf_SurveyController.createSurveyQuestions('a0B2w00000CT96uEAD',List<String>{'a072w00000T2C6HAAV'});
**/
public with sharing class Vosf_SurveyController {
 
    /**
     * @description create survely with list of question ids and controoling questions
     * @param  surveyRecordid surveyRecordid description
     * @param  listViewIds    listViewIds description
     * @return                return description
     */
    @AuraEnabled
    public static string createSurveyQuestions(String surveyRecordid,List<String> listViewIds){
        try {
            Set<String> ctrlqnsIds=new Set<String>();
            List<Vosf_Question__c> ctrlqnsList= [SELECT Id,Controlling_Question__c,Parent_Question__c,Controlling_Question__r.Parent_Question__c,Controlling_Question__r.Parent_Question__r.Parent_Question__c from Vosf_Question__c where Id IN :listViewIds AND Controlling_Question__c!=null];
            for (Vosf_Question__c ctrlqns : ctrlqnsList) {
                if(!String.isBlank(ctrlqns.Controlling_Question__r.Parent_Question__r.Parent_Question__c)){
                    ctrlqnsIds.add(ctrlqns.Controlling_Question__r.Parent_Question__r.Parent_Question__c);
                 }
                else if (!String.isBlank(ctrlqns.Controlling_Question__r.Parent_Question__c)) {
                    ctrlqnsIds.add(ctrlqns.Controlling_Question__r.Parent_Question__c); 
                 } 
                else{
                    ctrlqnsIds.add(ctrlqns.Controlling_Question__c);
                }
            }
            List<Vosf_Survey_Question__c> surveyQuestionList=new list<Vosf_Survey_Question__c>();
            ctrlqnsIds.addAll(listViewIds);
            for (String variable : ctrlqnsIds) {
                Vosf_Survey_Question__c surveyQuestionobj=new Vosf_Survey_Question__c();
                surveyQuestionobj.Survey__c=surveyRecordid;
                surveyQuestionobj.Question__c=variable;
                surveyQuestionList.add(surveyQuestionobj);
            } 
            insert surveyQuestionList;
            return 'success';
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    
    }

    @AuraEnabled
    public static Boolean hasChildQuestions(List<String> listViewIds){
        Boolean haschild=false;
        try {
            List<Vosf_Question__c> questionList=[SELECT Id,Parent_Question__c FROM Vosf_Question__c where id in:listViewIds];
            for (Vosf_Question__c  question : questionList) {
                if (question.Parent_Question__c!=null) {
                    haschild=true;
                    break;
                } 
            }
            return haschild;
        
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }   
    
    /*
     * Description : To get module & sub-module wise questions JSON to display in lightning-tree
     * Parameters : surveyId : Survey Record Id
     * 				listViewIds : Ids of the Module (RecordType : Module) Record
     * Return Type : List of questionWrapper
	*/
	@AuraEnabled
    public static List<QuestionWrapper> getQuestionsForModules(List<String> listViewIds){
        Set<Id> moduleIds = new Set<Id>();
        Set<Id> subModuleIds = new Set<Id>();
        for(Vosf_Module__c module : [SELECT Id,RecordType.DeveloperName,Parent_Module__c 
                                FROM Vosf_Module__c WHERE Id IN : listViewIds]){
                                    if(module.RecordType.DeveloperName == 'Module'){
                                        moduleIds.add(module.Id);
                                    }else if(module.RecordType.DeveloperName == 'Sub_Module' 
                                             && module.Parent_Module__c != null){
    									subModuleIds.add(module.Id);
                                        moduleIds.add(module.Parent_Module__c);
                                    }
        }
        List<QuestionWrapper> questionWrapperList = new List<QuestionWrapper>();
        String moduleQuery = 'SELECT Id,Name, (SELECT Id,Name FROM Sub_Module__r ' ;
        String questionQuery = 'SELECT Id,Name,Question_Label__c,Module__c,Sub_Module__c FROM Vosf_Question__c'+ 
                                              ' WHERE Module__c IN :moduleIds ';
        if(subModuleIds.size() > 0 == true) {
            moduleQuery += 'WHERE Id IN : subModuleIds ';
            questionQuery += ' AND Sub_Module__c IN : subModuleIds';
        }
        moduleQuery += ') FROM Vosf_Module__c WHERE Id IN : moduleIds';
        List<Vosf_Module__c> moduleList = Database.query(moduleQuery);
        
        List<Vosf_Question__c> questionList = Database.query(questionQuery);
        Map<Id,List<Vosf_Question__c>> subModIdVsQuestion = new Map<Id,List<Vosf_Question__c>>();
        if(!questionList.isEmpty()){          
            for(Vosf_Question__c question : questionList){
                List<Vosf_Question__c> subModQuestions = new List<Vosf_Question__c>();
                if(subModIdVsQuestion.get(question.Sub_Module__c) != null){
                    subModQuestions = subModIdVsQuestion.get(question.Sub_Module__c);
                }
                subModQuestions.add(question);
                subModIdVsQuestion.put(question.Sub_Module__c,subModQuestions);
            }
            for(Vosf_Module__c module : moduleList){
                if(module.Sub_Module__r != null){
                    QuestionWrapper questionModuleWrap = new QuestionWrapper(); //level 1
                    questionModuleWrap.label = module.Name; 
                    questionModuleWrap.items = new List<QuestionWrapper>();
                    for(Vosf_Module__c subModule : module.Sub_Module__r){
                        
                        if(subModIdVsQuestion != null && subModIdVsQuestion.get(subModule.Id) != null){
                            QuestionWrapper questionSubModuleWrap = new QuestionWrapper(); //level 2
                            questionSubModuleWrap.label = subModule.Name;
                            questionSubModuleWrap.items = new List<QuestionWrapper>();
                            for(Vosf_Question__c question : subModIdVsQuestion.get(subModule.Id)){ //level 3
                                QuestionWrapper questionWrap = new QuestionWrapper();
                                questionWrap.label = question.Question_Label__c;
                                questionWrap.recordId = question.Id;
                                questionSubModuleWrap.items.add(questionWrap);
                            }
                            questionModuleWrap.items.add(questionSubModuleWrap);
                        }
                    } 
                    if(questionModuleWrap.items.size() > 0){
                        questionWrapperList.add(questionModuleWrap);
                    }
                }
            }
        }
        return questionWrapperList;
    }   
    
    /*
     * Description : To insert survey Question records
     * Parameters : surveyId : Survey Record Id
     * 				questionIds : Ids of the Question Record
	*/
	@AuraEnabled
    public static void insertSurveyQuestions(String surveyId, List<String> questionIds){
    
        Set<String> ctrlqnsIds=new Set<String>();
        List<Vosf_Question__c> ctrlqnsList= [SELECT Id,Controlling_Question__c,Parent_Question__c,Controlling_Question__r.Parent_Question__c,Controlling_Question__r.Parent_Question__r.Parent_Question__c from Vosf_Question__c where Id IN :questionIds AND Controlling_Question__c!=null];
        for (Vosf_Question__c ctrlqns : ctrlqnsList) {
            if(!String.isBlank(ctrlqns.Controlling_Question__r.Parent_Question__r.Parent_Question__c)){
                ctrlqnsIds.add(ctrlqns.Controlling_Question__r.Parent_Question__r.Parent_Question__c);
             }
            else if (!String.isBlank(ctrlqns.Controlling_Question__r.Parent_Question__c)) {
                ctrlqnsIds.add(ctrlqns.Controlling_Question__r.Parent_Question__c); 
             } 
            else{
                ctrlqnsIds.add(ctrlqns.Controlling_Question__c);
            }
        }
        ctrlqnsIds.addAll(questionIds);
        List<Vosf_Survey_Question__c> surveyQuestionList = new List<Vosf_Survey_Question__c>();
        if(String.isNotBlank(surveyId)){
            for(String questionId : ctrlqnsIds){
                Vosf_Survey_Question__c surveyQuestion = new Vosf_Survey_Question__c(Question__c = questionId, Survey__c = surveyId);
                surveyQuestionList.add(surveyQuestion);
            }
            if(!surveyQuestionList.isEmpty()){
                Database.insert(surveyQuestionList,false);
            }
        }   
    }
    
    // Wrapper to show Questions by Module & Sub-Module
    public class QuestionWrapper{
        @AuraEnabled public String label; //label of Module/Sub-Module/Question.
        @AuraEnabled public String recordId; //recordId of the question. This is to identify selections. 
        @AuraEnabled public Boolean expanded = true; //to expand the accordian section.
        @AuraEnabled public List<questionWrapper> items; //to have accordians inside accordian. When items is empty, the hierarchy stops.
   }
}