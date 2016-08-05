import { observable, computed } from 'mobx';

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
    x: number;
    y: number;

    constructor(prev?: Legend) {

        this.title = prev && prev.title || "";
        this.meta = prev && prev.meta || "";

        this.horizontal = prev && prev.horizontal !==undefined ? prev.horizontal : true; //longer format needed because default is true: if previous value is false in the shorter syntax, will resolve to false
        this.visible = prev && prev.visible || false;
        this.showPercentages = prev && prev.showPercentages || false;
        this.edit = prev && prev.edit || false;
        this.x = prev && prev.x || 0;
        this.y = prev && prev.y || 0;

    }
}
