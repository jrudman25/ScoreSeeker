import * as Tone from 'tone';

// Convert string to numeric seed
export function getSeedFromString(str) {
    let hash = 0;
    if (!str || str.length === 0) return hash;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
}

// Musical scales
const SCALES = {
    MAJOR: ["C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5"], // Home Win
    MINOR: ["A3", "B3", "C4", "D4", "E4", "F4", "G4", "A4"], // Away Win
    DORIAN: ["D4", "E4", "F4", "G4", "A4", "B4", "C5", "D5"] // Draw
};

// Global audio instances to prevent overlap or memory leaks
let activeSequence = null;
let activeSynth = null;
let stopEventId = null;

export async function playMatchTheme(match) {
    try {
        await Tone.start();

        // 1. Safely teardown any currently playing song
        if (activeSequence) {
            activeSequence.stop();
            activeSequence.dispose();
            activeSequence = null;
        }
        if (stopEventId !== null) {
            Tone.Transport.clear(stopEventId);
            stopEventId = null;
        }
        
        Tone.Transport.stop();
        Tone.Transport.cancel(); // Clear all scheduled events on the timeline

        if (!activeSynth) {
            activeSynth = new Tone.PolySynth(Tone.Synth, {
                envelope: { attack: 0.05, decay: 0.1, sustain: 0.3, release: 1 }
            }).toDestination();
        }

        // 2. Parse Scores
        const homeScore = Number(match.intHomeScore) || 0;
        const awayScore = Number(match.intAwayScore) || 0;
        const totalScore = homeScore + awayScore;
        const scoreDiff = Math.abs(homeScore - awayScore);

        // 3. Determine Key/Mood based on Winner
        let scale = SCALES.DORIAN;
        if (homeScore > awayScore) {
            scale = SCALES.MAJOR;
        } else if (awayScore > homeScore) {
            scale = SCALES.MINOR;
        }

        // 4. Determine Tempo
        let bpm = 80 + (totalScore * 8); // 80 base + 8 per goal
        if (bpm > 180) bpm = 180;
        Tone.Transport.bpm.value = bpm;

        // 5. Determine Instrumentation (Blowout vs Close Game)
        if (scoreDiff >= 3) {
            activeSynth.set({ oscillator: { type: "sawtooth" } });
            activeSynth.volume.value = -4; // Compress volume slightly for harsh waves
        } else {
            activeSynth.set({ oscillator: { type: "triangle" } });
            activeSynth.volume.value = 0;
        }

        // 6. Generate Melody using Match ID as the random seed
        const seed = getSeedFromString(match.idEvent || match.strEvent || "default");
        let currentSeed = seed === 0 ? 1 : seed;

        const melody = [];
        const rhythms = ["8n", "4n", "8n.", "16n"];
        let timeAccumulator = 0;
        
        // Generate exactly 8 notes
        for (let i = 0; i < 8; i++) {
            // LCG Pseudo-random math
            currentSeed = (currentSeed * 16807) % 2147483647;
            const rand1 = currentSeed / 2147483647;
            
            currentSeed = (currentSeed * 16807) % 2147483647;
            const rand2 = currentSeed / 2147483647;

            // Pick note and duration deterministically
            const noteIndex = Math.floor(rand1 * scale.length);
            const note = scale[noteIndex];

            const rhythmIndex = Math.floor(rand2 * rhythms.length);
            const duration = rhythms[rhythmIndex];

            melody.push({ time: timeAccumulator, note: note, duration: duration });
            
            // Advance the time
            timeAccumulator += Tone.Time(duration).toSeconds();
        }

        // Add a final resolving Chord at the end
        const root = scale[0];
        const third = scale[2];
        const fifth = scale[4];
        melody.push({ 
            time: timeAccumulator, 
            note: [root, third, fifth], 
            duration: "2n" 
        });

        // 7. Schedule playback
        activeSequence = new Tone.Part((time, value) => {
            activeSynth.triggerAttackRelease(value.note, value.duration, time);
        }, melody).start(0);

        // Schedule the transport to stop cleanly
        const endTime = timeAccumulator + Tone.Time("2n").toSeconds() + 0.5;
        stopEventId = Tone.Transport.schedule((time) => {
            Tone.Transport.stop();
        }, endTime);

        // 8. Play
        Tone.Transport.start();

    } catch (error) {
        console.warn("Advanced Audio playback error:", error);
    }
}
