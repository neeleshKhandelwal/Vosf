import { LightningElement, api, track } from "lwc";

const COMBO_BOX = "slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click";
const IS_OPEN = " slds-is-open";
export default class Vosf_multiSelectLookup extends LightningElement {
    @api placeHolder = "Search...";
    @track optionsToDisplay = [];
    @track selectedOptions = [];
    showSelectedOptions = false;
    comboBoxClass = COMBO_BOX;
    comboExpanded = false;
    searchKey;
    noResultsFound = false;
    _options = [];
    selOptionsMap = new Map();

    @api
    set options(value) {
        value.forEach((elm, index) => {
            let opt = { ...elm };
            opt.index = index;
            opt.hasIcon = opt.icon ? true : false;
            opt.isSelected = false;
            this.optionsToDisplay.push(opt);
            this._options.push(opt);
            console.log('this._options'+this._options);
        });
    }
    get options() {
        return this._options;
    }

    showOptions() {
        this.comboExpanded = true;
        this.comboBoxClass = COMBO_BOX + IS_OPEN;
    }

    hideOptions() {
        this.comboExpanded = false;
        this.comboBoxClass = COMBO_BOX;
    }

    handleSearch(event) {
        const searchKey = event.target.value;
        this.noResultsFound = false;
        if (searchKey) {
            console.log('searchKey'+searchKey);
            this.optionsToDisplay = this._options.filter((obj) =>
                obj.label.toLowerCase().includes(searchKey.toLowerCase())
            );
            if (this.optionsToDisplay.length === 0) this.noResultsFound = true;
            console.log('this.optionsToDisplay '+this.optionsToDisplay );
            this.showOptions();
        } else {
            this.hideOptions();
            this.optionsToDisplay = this._options;
        }
    }

    handleSelection(event) {
        let index = Number(event.currentTarget.dataset.index);
        let selOption = this.optionsToDisplay[index];
        selOption.isSelected = !selOption.isSelected;

        if (selOption.isSelected) this.selOptionsMap.set(selOption.index, selOption);
        else this.selOptionsMap.delete(selOption.index);
        
        this.sendSelectedOptions();
    }

    removeSelectedOption(event) {
        let index = event.target.name;
        let selOption = this.selectedOptions[index];
        selOption.isSelected = false;

        this.selOptionsMap.delete(selOption.index);
        this.sendSelectedOptions();
    }

    sendSelectedOptions() {
        this.selectedOptions = Array.from(this.selOptionsMap.values());
        this.showSelectedOptions = this.selectedOptions.length > 0;
        this.dispatchEvent(new CustomEvent("change", { detail: this.selectedOptions }));
    }

    @api //Method can be called from parent component
    clear() {
        this.selectedOptions = [];
        this.selOptionsMap.forEach((val, key) => {
            val.isSelected = false;
        });
        this.selOptionsMap = new Map();
        this.showSelectedOptions = false;
        this.template.querySelector(".slds-combobox__input-value").value = "";
        this.optionsToDisplay = this._options;
    }
}