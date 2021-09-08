import { IonButton, IonModal } from '@ionic/react';
import React from 'react';
import { BoardService } from '../state/board.svc';



export class Board extends React.Component<{ boardSvc: BoardService }, { showStartModal: boolean }> {

    private canvas: React.RefObject<HTMLCanvasElement>;

    constructor(props: { boardSvc: BoardService }) {
        super(props);
        this.state = {
            showStartModal: true
        };

        this.canvas = React.createRef<HTMLCanvasElement>();

        const doResize = () => {
            if (this.canvas.current) {
                this.props.boardSvc.setBoardSize(window.innerWidth, window.innerHeight);
            }
        };
        window.addEventListener('orientationchange', () => doResize() );  // mobile
        window.addEventListener('resize', () => doResize() );  // browser
    }

    private go() {
        this.props.boardSvc.initSynth();
        this.setState({
            showStartModal: false
        });
    }

    componentDidMount() {
        const doOnTimeOut = () => {
            if (this.canvas.current) {
                this.props.boardSvc.initBoard(
                    this.canvas.current, window.innerWidth, window.innerHeight,
                );
                console.log('board initialized')
            } else {
                setTimeout(doOnTimeOut, 100);
                console.log('Waiting for board ...');
            }
        };
        setTimeout(doOnTimeOut, 100);
    }

    render() {
        return (
            <div style={{ width: '100%', height: '100%' }}>
                <IonModal isOpen={this.state.showStartModal}>
                    <IonButton color={'primary'} onClick={(evt) => this.go()}>Go!</IonButton>
                </IonModal>
                <canvas ref={this.canvas}></canvas>
            </div>

        );
    }
}
