import { LightningElement } from 'lwc';

export default class SalesHomeMain extends LightningElement {
    selectedStoreId = null;
    selectedProductId = null;

    handleSelectStore(event){
        this.selectedStoreId = event.detail.storeId;
        this.selectedProductId = event.detail.productId;
    }
    handleDateChange() {
        this.selectedStoreId = undefined;
    }
    handleFloorChange() {
        this.selectedStoreId = undefined;
        this.selectedProductId = undefined;
        
    }
}