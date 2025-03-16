public with sharing class ContractValidationService {
    
    public static void checkContracts(Set<Id> opportunityIds,List<Opportunity>triggeringRecords) {
        List<Opportunity> opportunities = OpportunityDAO.getRelatedOpportunities(opportunityIds);
        // System.debug(opportunities);
        if (opportunities.isEmpty()) {
            return;
        }
        
        for (Opportunity opp : triggeringRecords) {
            // System.debug(opp.Contract_Start_Date__c);
            // System.debug(opp.Contract_End_Date__c);
            
            for (Opportunity existingOpp : opportunities) {
                if (opp.Id != existingOpp.Id && isOverlapping(opp, existingOpp)) {
                    opp.addError(
                        '이미 등록된 계약이 있습니다. 계약 기간을 조정하세요. '
                        + '[중복 계약: ' + existingOpp.Name + ' ('
                        + existingOpp.Contract_Start_Date__c + ' ~ '
                        + existingOpp.Contract_End_Date__c + ')]'
                        );
                    
                    // System.debug('중복계약발생');
                }
            }
        }
    }
    
    //기간이 겹치는지 확인하는 메서드
    public static Boolean isOverlapping(Opportunity newOpp, Opportunity existingOpp) {
        return (newOpp.Contract_Start_Date__c <= existingOpp.Contract_End_Date__c) &&
            (existingOpp.Contract_Start_Date__c <= newOpp.Contract_End_Date__c);
    }
    //브랜드 리뷰에서 사용하려고 오버라이딩함
    public static Boolean isOverlapping(Brand_Review__c review, Opportunity existingOpp) {
        return (review.Contract_Start_Date__c <= existingOpp.Contract_End_Date__c) &&
            (existingOpp.Contract_Start_Date__c <= review.Contract_End_Date__c);
    }
}