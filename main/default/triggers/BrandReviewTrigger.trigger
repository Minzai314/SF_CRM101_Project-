trigger BrandReviewTrigger on Brand_Review__c (before update) {
    List<Brand_Review__c> reviewsToCheck = new List<Brand_Review__c>();
    
    for (Brand_Review__c review : Trigger.new) {
        Brand_Review__c oldReview = Trigger.oldMap.get(review.Id);
        
        Boolean approvalStarted = oldReview.Approval_Status__c == '미제출' && review.Approval_Status__c == '1차 승인 대기';
        
        if (approvalStarted) {
            reviewsToCheck.add(review);
        }
    }
    
    
    if (reviewsToCheck.isEmpty()) {
        return;
    }
    
    List<Opportunity> existingOpportunities = [SELECT Id, name, Contract_Start_Date__c, Contract_End_Date__c, Product_Name__c
                                               FROM Opportunity];
    
    for (Brand_Review__c review : reviewsToCheck) {
        String reviewProductName = '';
        try {
            reviewProductName = [SELECT Name FROM Product2 WHERE Id = :review.Product__c LIMIT 1].Name;
        } catch (Exception e) {
            System.debug('조회 실패: ' + e.getMessage());
            continue;
        }
        for (Opportunity opp : existingOpportunities) {
            
            if (ContractValidationService.isOverlapping(review, opp) && reviewProductName == opp.Product_Name__c) {
                review.addError(
                    '기존 계약과 중복됩니다. 계약 기간을 조정하세요. '
                    + '[중복 계약: ' + opp.Name + ' ('
                    + opp.Contract_Start_Date__c + ' ~ '
                    + opp.Contract_End_Date__c + ')]'
                    );
            }
        }
    }
}