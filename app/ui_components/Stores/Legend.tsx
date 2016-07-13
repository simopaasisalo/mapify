import {observable, computed} from 'mobx';

export class Legend implements ILegend {
    /** The name of the legend. Is shown in the UI */
    @observable title: string;
    /** A description of the data or other user-generated text. Is shown in the bottom of the legend */
    @observable meta: string;
    /** Should the legend be horizontally aligned */
    @observable horizontal: boolean;
    /** Is the legend shown on the map */
    @observable visible: boolean;
    @observable showPercentages: boolean;
}
