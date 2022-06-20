export class SettingsConfig {
    constructor(json) {
        this.linkSortStyle = json.linkSortStyle;
    }

    getLinkSortStyle() {
        return this.linkSortStyle;
    }
}