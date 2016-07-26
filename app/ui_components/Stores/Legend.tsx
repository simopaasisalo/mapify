import {observable, computed} from 'mobx';

export class Legend {
    /** The name of the legend. Is shown in the UI */
    @observable title: string;
    /** A description of the data or other user-generated text. Is shown in the bottom of the legend */
    @observable meta: string;
    /** Should the legend be horizontally aligned */
    @observable horizontal: boolean;
    /** Is the legend shown on the map */
    @observable visible: boolean;
    @observable showPercentages: boolean;
    @observable edit: boolean;

    constructor(prev?: Legend) {
        this.title = prev && prev.title || "";
        this.meta = prev && prev.meta || "";
        this.horizontal = prev && prev.horizontal || true;
        this.visible = prev && prev.visible || false;
        this.showPercentages = prev && prev.showPercentages || false;
        this.edit = prev && prev.edit || false;

    }
}
