import { Scale, Midi } from '@tonaljs/tonal';


export function getFrequencyNthTone(base: number, n: number): number {
    return base * Math.pow(2.0, (n / 12));
}

export function getNthToneFromFrequency(base: number, f: number): number {
    return 12 * Math.log2( f / base );
}

export type KeyLabels = 'number' | 'major' | 'minor';
export const keyLabels = ['number', 'major', 'minor'];

export function getNoteName(frequency: number, labels: KeyLabels): string {
    const midi = Midi.freqToMidi(frequency);
    let nString: string;
    if (labels === 'number') {
      nString = `${Math.round(getNthToneFromFrequency(440, frequency))}`;
    } else if (labels === 'major') {
      nString = Midi.midiToNoteName(midi, {sharps: true});
    } else {
      nString = Midi.midiToNoteName(midi, {sharps: false});
    }
    return nString;
}

export type Tonality =  null |
                        'C major'  | 'G major'  | 'D major'  | 'A major'   | 'E major'   | 'B major'   | 'F# major' | 'Db major' | 'Ab major' | 'Eb major' | 'Bb major'  | 'F major' |
                        'A minor'  | 'E minor'  | 'B minor'  | 'F# minor'  | 'C# minor'  | 'G# minor'  | 'E minor'  | 'Bb minor' | 'F minor'  | 'C minor'  | 'G minor'   | 'D minor';
export const tonalities: Tonality[] = [
                        'C major'  , 'G major'  , 'D major'  , 'A major'   , 'E major'   , 'B major'   , 'F# major' , 'Db major' , 'Ab major' , 'Eb major' , 'Bb major'  , 'F major' ,
                        'A minor'  , 'E minor'  , 'B minor'  , 'F# minor'  , 'C# minor'  , 'G# minor'  , 'E minor'  , 'Bb minor' , 'F minor'  , 'C minor'  , 'G minor'   , 'D minor'
];


export function isInKey(frequency: number, key: Tonality): boolean {
    if (key === null) return true;

    // const sharps = key.includes('major');
    const scale = Scale.get(key);
    const sharps = scale.notes.join(' ').includes('#');
    
    const midiNr = Midi.freqToMidi(frequency);
    const midiName = Midi.midiToNoteName(midiNr, {sharps});
    const noteName = midiName.replace(/\d+$/, "");
    
    return scale.notes.includes(noteName);
}