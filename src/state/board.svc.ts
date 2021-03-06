import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { Renderer } from '../hexaphone/Renderer';
import { Board } from '../hexaphone/Board';
import { Tonality } from '../hexaphone/helpers/music';
import { Synthesizer, Timbre } from '../hexaphone/Synthesizer';
import { defaultFillColorFunction, defaultLineColorFunction } from '../hexaphone/helpers/board';
import { first, mergeMap } from 'rxjs/operators';




/**
 * ** BOARD SERVICE **
 * 
 * Our app's interface to the `Board` class.
 * 
 * This service's task is to
 *  - set the state for `Board`
 *  - expose an API with which the app may alter the `Board`'s state
 *  - connect app- and browser-events with the `Board`
 *  - connect board-events with the app (as observables)
 * 
 * The actual board-logic is implemented in the `Board` class.
 */
export class BoardService {

    private canvas!: HTMLCanvasElement;
    private width!: number;
    private height!: number;
    private renderer!: Renderer;
    private board!: Board;
    private synth!: Synthesizer;
    private fillColor!: (frequency: number, x: number, y: number, alpha: number, beta: number, gamma: number) => string;
    private lineColor!: (frequency: number, x: number, y: number, alpha: number, beta: number, gamma: number) => string;
    private tonality$!: BehaviorSubject<Tonality>;
    private timbre$!: BehaviorSubject<Timbre>;
    private timbreLoaded$!: Observable<boolean>;
    private touches$ = new Subject<number[]>();

    public initBoard(
        canvas: HTMLCanvasElement,
        width: number,
        height: number,
        fillColor: (frequency: number, x: number, y: number, alpha: number, beta: number, gamma: number) => string = defaultFillColorFunction,
        lineColor: (frequency: number, x: number, y: number, alpha: number, beta: number, gamma: number) => string = defaultLineColorFunction,
        tonality: Tonality = null
    ): void {
        console.log("Initializing board ...");

        if (this.renderer || this.board) {
            console.error("App has already been created!");
            return;
        }

        const renderer: Renderer = new Renderer(canvas);
        renderer.resize(width, height);

        const synth = new Synthesizer();

        const board = new Board(synth, width, height, fillColor, lineColor);
        renderer.addElement(board);



        const dragSampleRate = 20;
        let dragging = false;
        let dragTime: number;
        const startDragListener = (evt: any) => {
            dragging = true;
            dragTime = new Date().getTime();
        };
        const whileDraggingListener = (evt: any) => {
            if (dragging) {
                const currentTime = new Date().getTime();
                const passedTime = currentTime - dragTime;
                dragTime = currentTime;
                if (passedTime > dragSampleRate) {
                    const frequencies = board.touch(evt);
                    this.touches$.next(frequencies);
                }
            }
        };
        const endDragListener = (evt: any) => {
            dragging = false;
        };
        const clickListener = (evt: any) => {
            const frequencies = board.click(evt);
            this.touches$.next(frequencies);
        };
        canvas.addEventListener('mousedown', startDragListener);
        canvas.addEventListener('mousemove', whileDraggingListener);
        canvas.addEventListener('mouseup', endDragListener);
        canvas.addEventListener('click', clickListener);

        // on mobile
        const touchListener = (evt: any) => {
            const frequencies: number[] = [];
            for (let i = 0; i < evt.touches.length; i++) {
                const touch = evt.touches[i];
                const touchedFrequencies = board.touch(touch);
                frequencies.push(...touchedFrequencies);
            }
            this.touches$.next(frequencies);
            evt.preventDefault();
        };
        const dragListener = (evt: any) => {
            const frequencies: number[] = [];
            for (let i = 0; i < evt.touches.length; i++) {
                const touch = evt.touches[i];
                const touchedFrequencies = board.touch(touch, true);
                frequencies.push(...touchedFrequencies);
            }
            this.touches$.next(frequencies);
            evt.preventDefault();
        };
        canvas.addEventListener('touchstart', touchListener);
        canvas.addEventListener('touchmove', dragListener);


        

        this.canvas = canvas;
        this.width = width;
        this.height = height;
        this.renderer = renderer;
        this.board = board;
        this.synth = synth;
        this.fillColor = fillColor;
        this.lineColor = lineColor;
        this.tonality$ = new BehaviorSubject(tonality);
        this.tonality$.subscribe(t => this.board.buildKeys(this.width, this.height, this.fillColor, this.lineColor, t));
        this.timbre$ = new BehaviorSubject<Timbre>(this.synth.getTimbre());

        renderer.loop(30);
    }

    public initSynth(): Observable<boolean> {
        return this.synth.start();
    }

    public setBoardSize(width: number, height: number): void {
        if (width === this.width && height === this.height) return;
        console.log("Setting board size ...");
        this.width = width;
        this.height = height;
        this.renderer.resize(this.width, this.height);
        this.board.buildKeys(this.width, this.height, this.fillColor, this.lineColor, this.tonality$.getValue());
    }

    public loadSamplerData(timbre: Timbre): Observable<boolean> {
        return this.synth.loadSamplerData(timbre);
    }

    public getTimbre(): Observable<Timbre> {
        return this.timbre$;
    }

    public getTimbreSync(): Timbre {
        return this.timbre$.getValue();
    }

    public setTimbre(timbre: Timbre): Observable<boolean> {
        this.timbre$.next(timbre);
        return this.timbre$.pipe(mergeMap(t => this.synth.setTimbre(t)), first());
    }

    public getTonality(): Observable<Tonality> {
        return this.tonality$;
    };

    public getTonalitySync(): Tonality {
        return this.tonality$.getValue();
    }

    public setTonality(tonality: Tonality) {
        this.tonality$.next(tonality);
    }

    public listenToTouches(): Observable<number[]> {
        return this.touches$;
    }
}


