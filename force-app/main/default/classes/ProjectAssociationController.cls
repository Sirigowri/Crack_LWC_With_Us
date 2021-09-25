public with sharing class ProjectAssociationController{
    @AuraEnabled(Cacheable = true)
    public static List<Contact> retriveEmployees(String employeeName){
        try{
            String query = 'SELECT  Id,Name,Email,Phone,Role__c,Count_project_Associations__c FROM Contact';
            if(employeeName != null && employeeName != ''){      
                String key = '%' + employeeName + '%';
                query += ' WHERE Name LIKE :key Order by Count_project_Associations__c DESC LIMIT 1000';
            }
            else{
                query += ' Order by Count_project_Associations__c DESC LIMIT 1000';
            }
            System.debug('query'+query);
            List<Contact> listEmployees = Database.query(query);
            System.debug('listEmployees'+listEmployees);
            return listEmployees;
        }
        catch(Exception e){
            System.debug('Exception Occured'+e);
            return null;
        }
    }
    @auraEnabled(cacheable = true)
    public static Project__c retriveProjectDetails(String projectId){
        Project__c projectDetails = [SELECT Id, Name, Account__r.Name, Client__r.Name FROM Project__c WHERE Id=:projectId];
        return projectDetails;
    }
    @auraEnabled
    public static String saveProjectAssociations(Project_Association__c projectAssoc,List<Contact> lstEmployees, String projectId){
        try{
            System.debug('projectAssoc'+projectAssoc);
            System.debug('lstEmployees'+lstEmployees);
            System.debug('projectId'+projectId);
            List<Project_Association__c> listOfPrjAssoc = new List<Project_Association__c>();
            for(Contact emp:lstEmployees){
                Project_Association__c prjAssoc = new Project_Association__c();
                prjAssoc.Project_Start_Date__c = projectAssoc.Project_Start_Date__c;
                prjAssoc.Project__c = projectId;
                prjAssoc.Employee__c = emp.Id;
                prjAssoc.Active__c = true;
                prjAssoc.Project_End_Date__c = projectAssoc.Project_End_Date__c;
                prjAssoc.Reason_for_Mapping__c = projectAssoc.Reason_for_Mapping__c;
                listOfPrjAssoc.add(prjAssoc);
            }
            if(listOfPrjAssoc.size()>0){
                insert listOfPrjAssoc;
            }
            return 'success';
        }
        catch(Exception e){
            System.debug('Exception Occured'+e);
            return null;
        }
    }
}
