// ==UserScript==
// @name         GeoFS-Alarms
// @namespace    https://github.com/fengshuo2004/geofs-alarms
// @version      0.1.2
// @description  Adds cockpit alarm sounds to GeoFS
// @author       PEK-97
// @match        https://www.geo-fs.com/geofs.php*
// @grant        GM.getResourceUrl
// @resource     stall https://github.com/fengshuo2004/geofs-alarms/raw/master/stall.ogg
// @resource     bankangle https://github.com/fengshuo2004/geofs-alarms/raw/master/bankangle.ogg
// @resource     overspeed https://github.com/fengshuo2004/geofs-alarms/raw/master/overspeed.ogg
// ==/UserScript==

(function () {
    'use strict';
    // load the audio clips
    let stickShake;
    GM.getResourceUrl("stall").then(
        (data)=>{
            stickShake = new Audio(data);
            stickShake.loop = true;
        }
    );
    let overspeedClacker;
    GM.getResourceUrl("overspeed").then(
        (data) => {
            overspeedClacker = new Audio(data);
            overspeedClacker.loop = true;
        }
    );
    // wait until flight sim is fully loaded
    let itv = setInterval(
        function(){
            if(unsafeWindow.ui && unsafeWindow.flight){
                main();
                clearInterval(itv);
            }
        }
    ,500);
    function main(){
        // monkey-patch the stall.setVisibility method
        let prevStalled = false;
        unsafeWindow.ui.hud.stall.setVisOld = unsafeWindow.ui.hud.stall.setVisibility;
        unsafeWindow.ui.hud.stall.setVisibility = function (a) {
            if (a) {
                stickShake.play();
            } else if (prevStalled) {
                stickShake.pause();
            }
            prev = a;
            this.setVisOld(a);
        }
        // monkey-patch the setAnimationValue method
        let prevOversped = false;
        unsafeWindow.flight.setAniValOld = unsafeWindow.flight.setAnimationValues;
        unsafeWindow.flight.setAnimationValues = function(a) {
            this.setAniValOld(a);
            if (unsafeWindow.geofs.animation.values.kias >= 320 && !prevOversped){
                overspeedClacker.play();
            } else if (prevOversped){
                overspeedClacker.pause();
            }
            prevOversped = unsafeWindow.geofs.animation.values.kias >= 320;
        }
    }
})();