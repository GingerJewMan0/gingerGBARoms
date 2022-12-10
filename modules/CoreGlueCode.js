"use strict";
/*
 Copyright (C) 2012-2017 Grant Galitz

 Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

 var games = {
    // "binary-id": "Game Name",
    "advancewars": "Advance Wars",
    "advancewars2": "Advance Wars 2",
    "ff1and2": "Final Fantasy 1 & 2 Advance",
    "ff4S": "Final Fantasy IV Advance (Sound Restoration Mod)",
    "ff6": "Final Fantasy VI Advance",
    "final_fantasy_tactics": "Final Fantasy Tactics Advance",
    "fire_emblem": "Fire Emblem",
    "fire_emblem_sacret_stone": "Fire Emblem The Sacred Stones",
    "fzero_gp": "F-Zero - GP Legend",
    "fzero_max": "F-Zero - Maximum Velocity",
    "goldensun": "Golden Sun",
    "goldensun2": "Golden Sun La Era Perdida",
    "kirbymirror": "Kirby & The Amazing Mirror",
    "kirbynightmare": "Kirby: Nightmare in Dreamland",
    "mariokart": "Mario Kart: Super Circuit",
    "marioland": "Mario Land Game Boy",
    "marioparty": "Mario Party Advance",
    "megamanbass": "Megaman & Bass",
    "megaman_battle1": "Megaman Battle Network 1",
    "megaman_battle2": "Megaman Battle Network 2",
    "megaman_battle3_blue": "Megaman Battle Network 3 Blue",
    "megaman_battle4_blue": "Megaman Battle Network 4 Blue Moon",
    "megaman_battle4_red": "Megaman Battle Network 4 Red Sun",
    "megaman_battle5": "Megaman Battle Network 5 Team Protoman",
    "megaman_battle6": "Megaman Battle Network 6 Cybeast Falzar",
    "megaman_zero1": "Megaman Zero",
    "megaman_zero2": "Megaman Zero 2",
    "megaman_zero3": "Megaman Zero 3",
    "megaman_zero4": "Megaman Zero 4",
    "metroid_fusion": "Metroid Fusion",
    "metroidzero": "Metroid Zero Mission",
    "pokemonemerald": "Pokemon Emerald",
    "pokemongreen": "Pokemon Verde Hoja",
    "mysteryred": "Pokémon Mundo Misterioso: Equipo de Rescate Rojo",
    "mysteryblue": "Pokémon Mundo Misterioso: Equipo de Rescate Azul",
    "pokemonruby": "Pokemon Rubí",
    "pokemonsapphire": "Pokemon Zafiro",
    "pokemonred": "Pokemon Rojo Fuego",
    "sonic_advance": "Sonic Advance",
    "sonic_advance2": "Sonic Advance 2",
    "sonic_advance3": "Sonic Advance 3",
    "superstar": "Mario & Luigi: Superstar Saga",
    "supermarioadvance": "Super Mario Advance",
    "supermarioadvance2": "Super Mario Advance 2",
    "supermarioadvance3": "Super Mario Advance 3",
    "supermarioadvance4": "Super Mario Advance 4",
    "warioland4": "Wario Land 4",
    "wario_ware": "Wario Ware Inc",
    "zelda_past": "The Legend of Zelda: A Link to the Past",
    "zelda_minish": "The Legend of Zelda: The Minish Cap",
};

// Change title

var defaultTitle = document.title;
var hashTags = location.hash.substr(1); //substr removes the leading #
var gameName = games[hashTags];
var startLetter = hashTags.charAt(0);

if (hashTags.length > 0) {
    console.log(`[PLAYER] Current game: ${gameName} [${hashTags}]`);
    document.title = `${gameName} on GBA Online`;

    // Add notification

    var t = document.createElement("p");
    t.innerHTML = "Loaded \"" + gameName + "\"";
    t.id = "loadedGameMsg";
    document.body.appendChild(t);

    // fade out after 3secs
    setTimeout(function () {
        $("#loadedGameMsg").fadeOut();
        setTimeout(function () {
            $("#loadedGameMsg").remove();
        }, 3000);
    }, 3000);
} else {
    document.title = defaultTitle;
    console.log("No game is currently loaded!");
};


var IodineGUI = {
    Iodine: null,
    Blitter: null,
    coreTimerID: null,
    GUITimerID: null,
    toMap: null,
    toMapIndice: 0,
    suspended: false,
    isPlaying: false,
    startTime: (+(new Date()).getTime()),
    mixerInput: null,
    currentSpeed: [false, 0],
    defaults: {
        timerRate: 8,
        sound: true,
        volume: 1,
        skipBoot: false,
        toggleSmoothScaling: true,
        toggleDynamicSpeed: false,
        toggleOffthreadGraphics: true,
        toggleOffthreadCPU: (navigator.userAgent.indexOf("AppleWebKit") == -1 || (navigator.userAgent.indexOf("Windows NT 10.0") != -1 && navigator.userAgent.indexOf("Trident") == -1)),
        keyZonesGBA: [
            // GBA key mapping:

            88, //A (X):
            90, //B (Z):
            32, // Select (SPACE):
            13, // Start (ENTER):
            39, // Right (RIGHT):
            37, // Left (LEFT):
            38, // Up (UP):
            40, // Down (DOWN):
            83, // R (S):
            65  // L (A):
        ],
        keyZonesControl: [
            // Emulator function key mapping:
            
            55, // Volume Down (7):
            56, // Volume Up (8):
            52, // Speed Up (4):
            51, // Slow Down (3):
            53, // Reset Speed (5):
            54, // Toggle Fullscreen (6):
            80, // Play/pause (P):
            82  // Restart (R):
        ]
    }
};
window.onload = function() {
    //Populate settings:
    registerDefaultSettings();
    //Initialize Iodine:
    registerIodineHandler();
    //Initialize the timer:
    calculateTiming();
    //Initialize the graphics:
    registerBlitterHandler();
    //Initialize the audio:
    registerAudioHandler();
    //Register the save handler callbacks:
    registerSaveHandlers();
    //Register the GUI controls.
    registerGUIEvents();
    //Register GUI settings.
    registerGUISettings();
    if (!games[location.hash.substr(1)]) {
        alert("Invalid game request!");
        return;
    }
    //Download the BIOS:
    downloadBIOS();
}

function downloadBIOS() {
    downloadFile("binaries/gba_bios.bin", registerBIOS);
}

function registerBIOS() {
    processDownload(this, attachBIOS);
    downloadROM(location.hash.substr(1));
}

function downloadROM(gamename) {
    writeRedTemporaryText("Downloading \"" + games[gamename] + ".\"");
    downloadFile("binaries/" + gamename + ".gba", registerROM);
}

function registerROM() {
    clearTempString();
    processDownload(this, attachROM);
}

function registerIodineHandler() {
    try {
        /*
        We utilize SharedArrayBuffer and Atomics API,
        which browsers prior to 2016 do not support:
        */
        if (typeof SharedArrayBuffer != "function" || typeof Atomics != "object") {
            throw null;
        } else if (!IodineGUI.defaults.toggleOffthreadCPU && IodineGUI.defaults.toggleOffthreadGraphics) {
            //Try starting Iodine normally, but initialize offthread gfx:
            IodineGUI.Iodine = new iodineGBAWorkerGfxShim();
        } else if (IodineGUI.defaults.toggleOffthreadGraphics) {
            //Try starting Iodine in a webworker:
            IodineGUI.Iodine = new iodineGBAWorkerShim();
            //In order for save on page unload, this needs to be done:
            addEvent("beforeunload", window, registerBeforeUnloadHandler);
        } else {
            throw null;
        }
    } catch (e) {
        //Otherwise just run on-thread:
        IodineGUI.Iodine = new GameBoyAdvanceEmulator();
    }
}

function registerBeforeUnloadHandler(e) {
    IodineGUI.Iodine.pause();
    if (e.preventDefault) {
        e.preventDefault();
    }
    return "iodineGBA needs to process your save data, leaving now may result in not saving current data.";
}

function initTimer() {
    IodineGUI.Iodine.setIntervalRate(+IodineGUI.defaults.timerRate);
    IodineGUI.coreTimerID = setInterval(function() {
        IodineGUI.Iodine.timerCallback(((+(new Date()).getTime()) - (+IodineGUI.startTime)) >>> 0);
    }, IodineGUI.defaults.timerRate | 0);
}

function calculateTiming() {
    IodineGUI.Iodine.setIntervalRate(+IodineGUI.defaults.timerRate);
}

function startTimer() {
    IodineGUI.coreTimerID = setInterval(function() {
        IodineGUI.Iodine.timerCallback(((+(new Date()).getTime()) - (+IodineGUI.startTime)) >>> 0);
    }, IodineGUI.defaults.timerRate | 0);
}

function updateTimer(newRate) {
    newRate = newRate | 0;
    if ((newRate | 0) != (IodineGUI.defaults.timerRate | 0)) {
        IodineGUI.defaults.timerRate = newRate | 0;
        IodineGUI.Iodine.setIntervalRate(+IodineGUI.defaults.timerRate);
        if (IodineGUI.isPlaying) {
            if (IodineGUI.coreTimerID) {
                clearInterval(IodineGUI.coreTimerID);
            }
            initTimer();
        }
    }
}

function registerBlitterHandler() {
    IodineGUI.Blitter = new GfxGlueCode(240, 160);
    IodineGUI.Blitter.attachCanvas(document.getElementById("emulator_target"));
    IodineGUI.Iodine.attachGraphicsFrameHandler(IodineGUI.Blitter);
    IodineGUI.Blitter.attachGfxPostCallback(function() {
        if (IodineGUI.currentSpeed[0]) {
            var speedDOM = document.getElementById("speed");
            speedDOM.textContent = "Speed: " + IodineGUI.currentSpeed[1] + "%";
        }
    });
}

function registerAudioHandler() {
    var Mixer = new GlueCodeMixer(document.getElementById("play"));
    IodineGUI.mixerInput = new GlueCodeMixerInput(Mixer);
    IodineGUI.Iodine.attachAudioHandler(IodineGUI.mixerInput);
}
