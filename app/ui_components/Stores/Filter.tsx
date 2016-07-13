import {observable, computed} from 'mobx';

export class Filter implements IFilter {
    /** The unique id of the filter */
    @observable id: number;
    /** The name of the filter. Will be shown on the map*/
    @observable title: string;
    /** Layer Id to filter*/
    @observable layerId: number;
    /** The name of the field to filter*/
    @observable fieldToFilter: string;
    /** Dictionary containing lists of layers by the value being filtered*/
    @observable filterValues: { [value: number]: L.ILayer[] } = {};
    /** Current maximum value */
    @observable currentMax: number;
    /** Current min value */
    @observable currentMin: number;
    /** Original maximum value */
    @observable totalMax: number;
    /** Original min value */
    @observable totalMin: number;
    /** User defined steps*/
    @observable steps: [number, number][] = [];
    /** Whether to remove the filtered layer completely or change opacity*/
    @observable remove: boolean;
    /** The storage of already filtered indices */
    @observable filteredIndices: number[] = [];
}
