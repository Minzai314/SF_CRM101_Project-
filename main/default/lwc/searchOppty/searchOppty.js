import { LightningElement, wire, api } from 'lwc';
import getOpportunitiesByProductId from '@salesforce/apex/OpportunityController.getOpportunitiesByProductId';
import getProductName from '@salesforce/apex/OpportunityController.getProductName';

export default class SearchOppty extends  LightningElement {
    
    currentProductId;
    @api
    get productId(){
        return this.currentProductId;
    }
    set productId(value){
        if(value !== this.currentProductId){
            this.currentProductId = value;
            if(value){
                this.loadData();
            }else{
                this.resetData();
            }
        }
    }
   
    isLoading = false;
    opportunities = [];
    productName = '';
    error;
    columns = [
        { label: '매장명', fieldName: 'recordUrl', 
            type: 'url',
            typeAttributes: { 
                label: { fieldName: 'accountName' },
                target: '_self' }},
        { label: '시작일', fieldName: 'startDate', type: 'date' },
        { label: '종료일', fieldName: 'endDate', type: 'date' }
    ];

    resetData(){
        this.opportunities = [];
        this.productName = '';
        this.error = '';
    }

    async loadData(){
        if(!this.currentProductId){
            return;
        }
        this.isLoading = true;
        this.error = '';
        this.productName = '';
        this.opportunities = [];

        try {
            const [productNameResult,opportunitiesResult] = await Promise.allSettled([
                getProductName({productId: this.currentProductId}),
                getOpportunitiesByProductId({productId: this.currentProductId})
            ])
            if(productNameResult.status === 'fulfilled' && productNameResult.value?.length){
                this.productName = productNameResult.value[0].Name;
            }
            if(opportunitiesResult.status === 'fulfilled' && opportunitiesResult.value?.length){
                this.opportunities = opportunitiesResult.value.map(opp => ({
                    ...opp,
                    recordUrl: `/lightning/r/Opportunity/${opp.id}/view`
                }));
            }
            if (productNameResult.status === 'rejected' && opportunitiesResult.status === 'rejected') {
                this.error = '두 요청 모두 실패';
            }

            
        } catch (error) {
            this.error = error;
            console.log('데이터 로드 중 오류 발생: ',error);
        } finally{
            this.isLoading = false;
        }
    }

}