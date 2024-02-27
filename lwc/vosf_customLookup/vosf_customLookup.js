import { LightningElement, api, track } from 'lwc';
export default class Vosf_customLookup extends LightningElement {
  picklistOrdered;
  searchResults;
  selectedSearchResult;
  @api lookuplabel;
  @track
  selectedValue;
  @api options;
  connectedCallback() {
    this.picklistOrdered = this.options;
  }
  search(event) {
    const input = event.detail.value.toLowerCase();
    const result = this.picklistOrdered.filter((picklistOption) =>
      picklistOption.label.toLowerCase().includes(input)
    );
    this.searchResults = result;
  }
  selectSearchResult(event) {
    const selectedValue = event.currentTarget.dataset.value;
    this.selectedSearchResult = this.picklistOrdered.find(
      (picklistOption) => picklistOption.value === selectedValue
    );
    this.selectedValue = this.selectedSearchResult ? this.selectedSearchResult.label : null;
    this.clearSearchResults();
    this.dispatchEvent(new CustomEvent("change", { detail: selectedValue }));
  }
  clearSearchResults() {
    this.searchResults = null;
  }
  @api
  clearsearch() {
    this.selectedValue=null;
  }
  showPicklistOptions() {
    if (!this.searchResults) {
      this.searchResults = this.picklistOrdered;
    }
  }
}