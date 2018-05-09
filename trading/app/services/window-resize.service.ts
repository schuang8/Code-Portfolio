import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs/Rx';

export interface WindowParameters {
    screenWidth: number;
    screenHeight: number;
    ratio: number;
}

@Injectable()
export class WindowResizeService {
    // Create a variable and make it to be an observable.
    // This variable will be subscribed by glviz component,
    // and when device pixel ratio changed the webGL layer will response.
    // No default value.
    // If this value increased then the fontsize inside webGL layer will also change.

    private previousDPR = 0.0;
    private currentDPR: number;
    private onWindowResize: ReplaySubject<WindowParameters> = new ReplaySubject<WindowParameters>(1);
    onWindowResize$ = this.onWindowResize.asObservable();

    constructor() {
        // Initialize the ratio makesure that is not 0.0;
        this.emitWindowParameters();
        // Callback function: will be executed if there is a change in devicePixelRatio
        window.onresize = () => {
            this.emitWindowParameters();
        };
    }

    // helper function
    emitWindowParameters() {
        this.onWindowResize.next({
            screenWidth: document.body.clientWidth,
            screenHeight: document.body.clientHeight,
            ratio: this.setCurrentPixelRatio(window.devicePixelRatio)
        } as WindowParameters);
    }

    setCurrentPixelRatio(value: number) {
        if (this.previousDPR === 0.0) {
            this.previousDPR = value;
        }
        this.currentDPR = value;
        return (this.currentDPR / this.previousDPR);
    }

}
