import { hexCoordsToXyCoords } from "./hexIndex";
import { getFrequencyNthTone } from "./music";
import { Key } from "../Key";
import { Synthesizer } from "../Synthesizer";



export function createKeys(
    nrKeysPerRow: number, nrRows: number, scale: number,
    synth: Synthesizer,
    labelFunction: (frequency: number, alpha: number, beta: number, gamma: number) => string,
    fillColor: (frequency: number, x: number, y: number, alpha: number, beta: number, gamma: number) => number,
    lineColor: (frequency: number, x: number, y: number, alpha: number, beta: number, gamma: number) => number) 
: {[index: string]: Key} {

    const keys: {[index: string]: Key} = {};
 
    const betaMin = Math.round(-nrRows / 2);
    const betaMax = Math.round(nrRows / 2);
    for (let beta = betaMin; beta < betaMax; beta++) {
        const alphaMin = Math.round(- nrKeysPerRow / 2 - beta * 0.5);
        const alphaMax = Math.round(nrKeysPerRow / 2 - beta * 0.5);
        for (let alpha = alphaMin; alpha < alphaMax; alpha++) {
            const gamma = - alpha - beta;
            const index = `${alpha}/${beta}/${gamma}`;
            const frequency = getFrequencyFromHexCoords(alpha, beta, gamma);
            const [xPos, yPos] = hexCoordsToXyCoords(scale, alpha, beta, gamma);
            const fc = fillColor(frequency, xPos, yPos, alpha, beta, gamma);
            const lc = lineColor(frequency, xPos, yPos, alpha, beta, gamma)
            const key = new Key(synth, fc, lc, xPos, yPos, scale, scale * 0.0125, frequency, labelFunction(frequency, alpha, beta, gamma));
            keys[index] = key;
        }
    }

    return keys;
}


function getFrequencyFromHexCoords(alpha: number, beta: number, gamma: number): number {
    return getFrequencyNthTone(
        440,
        3.5 * (alpha - gamma) + 0.5 * beta
    );
}