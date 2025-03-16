import { LightningElement, track, wire } from 'lwc';
import getActiveOpportunities from '@salesforce/apex/OpportunityController.getActiveOpportunities';
import { NavigationMixin } from 'lightning/navigation';
import B1_map from '@salesforce/resourceUrl/B1_map';
import F1_map from '@salesforce/resourceUrl/F1_map';
import F2_map from '@salesforce/resourceUrl/F2_map';
import F3_map from '@salesforce/resourceUrl/F3_map';
import F4_map from '@salesforce/resourceUrl/F4_map';
import F5_map from '@salesforce/resourceUrl/F5_map';


export default class SvgMapControll extends NavigationMixin(LightningElement) {
    B1_map = B1_map;
    F1_map = F1_map;
    F2_map = F2_map;
    F3_map = F3_map;
    F4_map = F4_map;
    F5_map = F5_map;

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

    stores = [];
    selectedDate = new Date().toISOString().slice(0, 10);

    connectedCallback() {
        this.fetchStores();
    }

    
    fetchStores() {
        getActiveOpportunities({ selectedDate: this.selectedDate })
            .then(data => {
                if (data) {
                    // console.log(data);

                    this.stores = data.map(store => ({
                        id: store.AccountId,
                        name: store.Account?.Name,
                        productClass: store.OpportunityLineItems.length > 0
                            ? store.OpportunityLineItems[0].Product2Id
                            : null
                    }));
                    this.updateSvgText();
                }
            })
            .catch(error => {
                console.error('데이터 로드 실패:', error);
            });
    }

    updateSvgText() {
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
    handleDateChange(event) {
        this.selectedDate = event.target.value;
        this.fetchStores(); 
        this.dispatchEvent(new CustomEvent('datechange'));
    }
    handleFloorChange(event) {
        this.value = event.detail.value;
        this.fetchStores();
        this.updateSvgText();
        this.dispatchEvent(new CustomEvent('floorchange'));
        // console.log('층변경이벤트발생')
    }

    handleClickStore(event) {
        
        const productId = event.target.dataset.id;

        const store =
            this.stores.find(s => s.productClass === productId);

        const storeId = store? store.id : null ;
        this.dispatchEvent(new CustomEvent('selectstore', { detail: { storeId: storeId, productId: productId } }));

        const previousSelected = this.template.querySelector('.selected-store');
        if (previousSelected) {
            previousSelected.classList.remove('selected-store');
        }
        const storeElement = event.target;
        storeElement.classList.add('selected-store');

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