public with sharing class ApprovalProcessController {
    @AuraEnabled(cacheable=true)
    public static String getTargetObjectId(String workItemId) {
        ProcessInstanceWorkItem workItem = [
            SELECT ProcessInstance.TargetObjectId 
            FROM ProcessInstanceWorkItem 
            WHERE Id = :workItemId 
            LIMIT 1
        ];
        return workItem.ProcessInstance.TargetObjectId;
    }
    
    @AuraEnabled(cacheable=true)
    public static String getProductName(String targetObjectId) {
        Brand_Review__c review = [
                SELECT Product__r.Name 
                FROM Brand_Review__c 
                WHERE Id = :targetObjectId 
                LIMIT 1
            ];
        return review.Product__r != null ? review.Product__r.Name : null;
    }
}