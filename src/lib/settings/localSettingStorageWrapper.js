const settingNames = ["linkSortStyle"];


export const LOCAL_STORAGE_NAME = 'shipwreckSettings';

export class localSettingStorageWrapper {
    constructor(){
        this.savedSettings = JSON.parse(window.localStorage.getItem(LOCAL_STORAGE_NAME));
    }

    formatFormInput(json){
        var settingConfigs = {}

        settingNames.forEach(element => {
            settingConfigs[element] = json[element].value;
        });

        return settingConfigs;
    }

    setSettings(json){
        var formData = this.formatFormInput(json);
        this.savedSettings = formData;
        window.localStorage.setItem(LOCAL_STORAGE_NAME, JSON.stringify(formData));
    }

    getSetting(settingName){
        return this.savedSettings[settingName];
    }

    
}

export const settings = new localSettingStorageWrapper();