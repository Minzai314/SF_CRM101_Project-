public with sharing class OpportunityTriggerHandler {
    public static void beforeUpdate(List<Opportunity> newList, Map<Id, Opportunity> oldMap) {
        Set<Id> opportunityIdsToCheck = new Set<Id>();
        
        //StartDate 또는 EndDate가 변경된 레코드만 필터링
        for (Opportunity opp : newList) {
            Opportunity oldOpp = oldMap.get(opp.Id);
            
            Boolean startDateChanged = opp.Contract_Start_Date__c != oldOpp.Contract_Start_Date__c;
            Boolean endDateChanged = opp.Contract_End_Date__c != oldOpp.Contract_End_Date__c;
            Boolean productChanged = opp.Product_Name__c != oldOpp.Product_Name__c;
            Boolean wasClosedLost = oldOpp.StageName == 'Closed Lost';
            Boolean isClosedLost = opp.StageName == 'Closed Lost';
            // 둘다 없으면 담을 필요 없음
            if (opp.Contract_Start_Date__c == null && opp.Contract_End_Date__c == null) {
                continue;
            }
            
            // 하나만 입력된 경우 에러 발생
            if (opp.Contract_Start_Date__c == null || opp.Contract_End_Date__c == null) {
                opp.addError('계약 시작일과 계약 종료일은 함께 입력해야 합니다.');
                continue;
            }
            
            // 둘다 입력돼 있는데 하나라도 변경되었다면 리스트에 추가
            if ((!isClosedLost && (startDateChanged || endDateChanged || productChanged))
            || (wasClosedLost && !isClosedLost)) {
                opportunityIdsToCheck.add(opp.Id);
            }
        }
        
        //검증할 데이터가 없으면 종료
        if (opportunityIdsToCheck.isEmpty()) {
            return;
        }
        
        //있으면 검증 메서드 실행
        ContractValidationService.checkContracts(opportunityIdsToCheck,newList);
    }
    
}