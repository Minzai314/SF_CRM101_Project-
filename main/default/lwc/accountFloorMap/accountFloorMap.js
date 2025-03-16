import { api, LightningElement, wire } from 'lwc';
import getActiveOpportunities from '@salesforce/apex/OpportunityController.getActiveOpportunities';
import accountMapController from '@salesforce/apex/AccountController.accountMapController';
import { NavigationMixin } from 'lightning/navigation';


import B1_map from '@salesforce/resourceUrl/B1_map';
import F1_map from '@salesforce/resourceUrl/F1_map';
import F2_map from '@salesforce/resourceUrl/F2_map';
import F3_map from '@salesforce/resourceUrl/F3_map';
import F4_map from '@salesforce/resourceUrl/F4_map';
import F5_map from '@salesforce/resourceUrl/F5_map';

export default class AccountFloorMap extends NavigationMixin(LightningElement) {
    B1_map = B1_map;
    F1_map = F1_map;
    F2_map = F2_map;
    F3_map = F3_map;
    F4_map = F4_map;
    F5_map = F5_map;

    value = '';
    productName = '';
    stores = [];
    selectedDate = new Date().toISOString().slice(0, 10);
    contStartDate;
    contEndDate;


    @api recordId;
    statusValue;

    @wire(accountMapController, { accountId: '$recordId' })
    resultMap({ error, data }) {
        if (data !== null && data !== undefined) {
            this.error = undefined;
            this.productName = data.productNames
            this.selectedDate = data.displayDate
            this.contStartDate = data.contStartDate
            this.contEndDate = data.contEndDate
            // console.log("data:",data);
            // console.log(floor);
            this.setFloorMap(this.productName);

        } else if (error) {
            console.error('레코드 불러오기 실패', error);
        }

    }

    setFloorMap(productName) {
        // console.log(setFloorMap 호출 productName: ${productName}`);
        if (!productName) {
            console.warn('productName이 비어 있음');
            return;
        }
    
        const prefix = productName.slice(0, 2);
        // console.log(prefix);
        const floorMap = {
            'B2': 'B2',
            'B1': 'B1',
            'F1': 'F1',
            'F2': 'F2',
            'F3': 'F3',
            'F4': 'F4',
            'F5': 'F5',
        };
        this.value = floorMap[prefix];
        // console.log(설정된 층: ${this.value}`);
        if (this.value === 'B2') {
            this.fetchStores();

        }
    }

    get isB2() { return this.value === 'B2'; }
    get isB1() { return this.value === 'B1'; }
    get is1F() { return this.value === 'F1'; }
    get is2F() { return this.value === 'F2'; }
    get is3F() { return this.value === 'F3'; }
    get is4F() { return this.value === 'F4'; }
    get is5F() { return this.value === 'F5'; }


    fetchStores() {
        getActiveOpportunities({ selectedDate: this.selectedDate })
            .then(data => {
                if (data) {
                    // console.log(this.data);
                    this.stores = data.map(store => ({
                        id: store.AccountId,
                        name: store.Account?.Name,
                        productClass: store.OpportunityLineItems.length > 0
                            ? store.OpportunityLineItems[0].Product2Id
                            : null
                    }));
                    this.updateSvgAndText();

                }
            })
            .catch(error => {
                console.error('데이터 로드 실패:', error);
            });
    }

    updateSvgAndText() {
        const svgShapes = this.template.querySelectorAll('.all-stores polygon, .all-stores rect, .all-stores path');
        // console.log(this.productName);



        svgShapes.forEach(shape => {
            const shapeProductName = shape.getAttribute('data-note');
            if(shapeProductName === this.productName){
                shape.classList.add('selected-store');
            }
        });

        const svgTexts = this.template.querySelectorAll('.text-group text');
        
        svgTexts.forEach(text => {
            const className = text.getAttribute('class');
            const store = this.stores.find(s => s.productClass === className);
            if (store) {
                text.textContent = store.name;
            }
            else {
                text.textContent = '';
            }
        });
        
    }
    handleClickStore(event) {
        const productId = event.target.dataset.id;
        // console.log(productId);
        // console.log(event.target.dataset.note);  
        const store = this.stores.find(s => s.productClass === productId);
        if (store && store.id) {
            this[NavigationMixin.Navigate]({
                type: 'standard__recordPage',
                attributes: {
                    recordId: store.id,
                    actionName: 'view'
                }
            });
        } else {
            console.log('클릭 위치에서 id값 얻어올 수 없음');

        }
    }


   
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