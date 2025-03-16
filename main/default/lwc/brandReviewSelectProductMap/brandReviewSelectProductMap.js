import { LightningElement, wire, api } from 'lwc';
import { updateRecord } from 'lightning/uiRecordApi'
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

import B1_map from '@salesforce/resourceUrl/B1_map';
import F1_map from '@salesforce/resourceUrl/F1_map';
import F2_map from '@salesforce/resourceUrl/F2_map';
import F3_map from '@salesforce/resourceUrl/F3_map';
import F4_map from '@salesforce/resourceUrl/F4_map';
import F5_map from '@salesforce/resourceUrl/F5_map';
import { getRecord } from 'lightning/uiRecordApi';
import PRODUCT_ID_FIELD from '@salesforce/schema/Brand_Review__c.Product__c';


export default class BrandReviewSelectProductMap extends LightningElement {
    B1_map = B1_map;
    F1_map = F1_map;
    F2_map = F2_map;
    F3_map = F3_map;
    F4_map = F4_map;
    F5_map = F5_map;

    @api recordId;
    productId = '';
    productName = '';
    value = 'B2';
    get options() {
        return [
            { label: '지하 2층', value: 'B2' },
            { label: '지하 1층', value: 'B1' },
            { label: '1층', value: '1F' },
            { label: '2층', value: '2F' },
            { label: '3층', value: '3F' },
            { label: '4층', value: '4F' },
            { label: '5층', value: '5F' },
        ];
    }

    get isB2() { return this.value === 'B2'; }
    get isB1() { return this.value === 'B1'; }
    get is1F() { return this.value === '1F'; }
    get is2F() { return this.value === '2F'; }
    get is3F() { return this.value === '3F'; }
    get is4F() { return this.value === '4F'; }
    get is5F() { return this.value === '5F'; }

    get isButtonDisabled() {
        return !this.productName; 
    }
    
    
    updateProduct(){
        const fields = {};
        fields.Id = this.recordId;
        fields.Product__c = this.productId;
        const recordWrapper = {fields};

        updateRecord(recordWrapper)
        .then(()=> {
            this.showToast('성공','Product가 성공적으로 업데이트되었습니다.','success');
        })
        .catch(error => {
            this.showToast('실패','업데이트 중 오류가 발생했습니다.','error');
        });
    }
    
    showToast(title,message,variant){
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(event);
    }

    handleFloorChange(event) {
        this.value = event.detail.value;
        
    }

    handleClickStore(event) {
        
        this.productId = event.target.dataset.id;
        this.productName = event.target.dataset.note;

        const previousSelected = this.template.querySelector('.selected-store');
        if (previousSelected) {
            previousSelected.classList.remove('selected-store');
        }
        const storeElement = event.target;
        storeElement.classList.add('selected-store');
    }
    
    handleButtonClick(){
        this.updateProduct();
    }



    // ✅ 줌 & 이동 관련 변수
    zoomLevel = 1;
    translateX = 0;
    translateY = 0;
    isDragging = false;
    startX = 0;
    startY = 0;

    constructor() {
        super();
        this.startDrag = this.startDrag.bind(this);
        this.drag = this.drag.bind(this);
        this.endDrag = this.endDrag.bind(this);
        this.handleWheelZoom = this.handleWheelZoom.bind(this);
    }

    renderedCallback() {
        const svgElement = this.template.querySelector('svg');
        if (svgElement) {
            svgElement.addEventListener('wheel', this.handleWheelZoom);
        }
    }

    disconnectedCallback() {
        const svgElement = this.template.querySelector('svg');
        if (svgElement) {
            svgElement.removeEventListener('wheel', this.handleWheelZoom);
        }
    }

    handleWheelZoom = (event) => {
        event.preventDefault();

        const zoomFactor = 0.1;
        const svgElement = this.template.querySelector('svg');
        if (!svgElement) return;

        const { left, top, width, height } = svgElement.getBoundingClientRect();
        const mouseX = event.clientX - left;
        const mouseY = event.clientY - top;

        const prevZoom = this.zoomLevel;
        if (event.deltaY < 0) {
            this.zoomLevel = Math.min(3, this.zoomLevel + zoomFactor); // 확대
        } else {
            this.zoomLevel = Math.max(1, this.zoomLevel - zoomFactor); // 축소 (최소 1배)
        }

        const zoomChange = this.zoomLevel / prevZoom;
        this.translateX = mouseX - (mouseX - this.translateX) * zoomChange;
        this.translateY = mouseY - (mouseY - this.translateY) * zoomChange;

        this.updateTransform();
    }

    zoomIn() {
        const container = this.template.querySelector('.map-wrapper');
        const svgElement = this.template.querySelector('svg');

        if (!container || !svgElement) return;

        const containerRect = container.getBoundingClientRect();
        const svgRect = svgElement.getBoundingClientRect();

        const centerX = containerRect.width / 2;
        const centerY = containerRect.height / 2;

        const prevZoom = this.zoomLevel;
        this.zoomLevel = Math.min(3, this.zoomLevel + 0.3);

        const zoomRatio = this.zoomLevel / prevZoom;

        this.translateX = (this.translateX - centerX) * zoomRatio + centerX;
        this.translateY = (this.translateY - centerY) * zoomRatio + centerY;

        this.updateTransform();
    }

    zoomOut() {
        this.zoomLevel = Math.max(1, this.zoomLevel - 0.3);
        this.updateTransform();
    }

    resetZoom() {
        this.zoomLevel = 1;
        this.translateX = 0;
        this.translateY = 0;
        this.updateTransform();
    }

    updateTransform() {
        const svgElement = this.template.querySelector('svg');
        if (svgElement) {
            svgElement.style.transform = `translate(${this.translateX}px, ${this.translateY}px) scale(${this.zoomLevel})`;
            svgElement.style.transformOrigin = "top left";
        }
    }

    startDrag = (event) => {
        this.isDragging = true;
        this.startX = event.clientX - this.translateX;
        this.startY = event.clientY - this.translateY;

        window.addEventListener("mousemove", this.drag);
        window.addEventListener("mouseup", this.endDrag);
    };

    drag = (event) => {
        if (!this.isDragging) return;

        const svgElement = this.template.querySelector('svg');
        const container = this.template.querySelector('.map-wrapper');

        if (!svgElement || !container) return;

        const containerRect = container.getBoundingClientRect();
        const svgWidth = svgElement.clientWidth * this.zoomLevel;
        const svgHeight = svgElement.clientHeight * this.zoomLevel;

        let newTranslateX = event.clientX - this.startX;
        let newTranslateY = event.clientY - this.startY;

        const minX = Math.min(0, containerRect.width - svgWidth);
        const maxX = 0;
        const minY = Math.min(0, containerRect.height - svgHeight);
        const maxY = 0;

        this.translateX = Math.max(minX, Math.min(newTranslateX, maxX));
        this.translateY = Math.max(minY, Math.min(newTranslateY, maxY));

        this.updateTransform();
    };

    endDrag = () => {
        this.isDragging = false;
        window.removeEventListener("mousemove", this.drag);
        window.removeEventListener("mouseup", this.endDrag);
    };

}