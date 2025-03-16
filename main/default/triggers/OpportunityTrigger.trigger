trigger OpportunityTrigger on Opportunity (before update) {
    
    if(Trigger.isBefore && Trigger.isUpdate){
        OpportunityTriggerHandler.beforeUpdate(Trigger.new, Trigger.oldMap);
    }
}