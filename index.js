const dungeons = require('./Additional-Data/Dungeonoverview/dungeons.json');
const skills = require('./Additional-Data/Skillconfiguration/skills.json');
const SettingsUI = require('tera-mod-ui').Settings;

module.exports = function Lazyrootbeer(mod) {

    if (mod.proxyAuthor !== 'caali' || !global.TeraProxy) {
        mod.warn('You are trying to use this module on an unsupported legacy version of tera-proxy.');
        mod.warn('The module may not work as expected, and even if it works for now, it may break at any point in the future!');
        mod.warn('It is highly recommended that you download the latest official version from the #proxy channel in http://tiny.cc/caalis-tera-proxy');
    }

    if (mod.platform === 'classic') {
        mod.log('This version of tera is currently not supported. Affected module is Lazyrootbeer.');
        return;
    }

    let notusable = [19698, 19701, 19704, 19734, 19735, 80280, 80281],
        useoutofcombat, userootbeeron, usebroochon, delay,
        broochinfo, dungeon, beer,
        zone = false,
        brooch = {
            id: 0,
            cooldown: 0
        },
        rootbeer = {
            id: 80081,
            amount: 0,
            cooldown: 0
        };

    mod.command.add('lazyconfig', () => {
        if (ui) {
            ui.show();
        }
    });

    mod.command.add('lazybeer', () => {
        mod.settings.enabled = !mod.settings.enabled;
        mod.command.message(`Lazyrootbeer is now ${mod.settings.enabled ? "enabled" : "disabled"}.`);
    });

    mod.command.add('lazydebug', () => {
        mod.settings.debug = !mod.settings.debug;
        mod.command.message(`Debugging of skills is now ${mod.settings.debug ? "enabled" : "disabled"}.`);
    });

    mod.command.add('lazyworld', () => {
        mod.settings.world = !mod.settings.world;
        mod.command.message(`Lazyrootbeer in open world is now ${mod.settings.world ? "enabled" : "disabled"}.`);
    });

    let useitem = (item, loc, w) => {
        if (item === 0 || notusable.includes(item)) return;
        mod.send('C_USE_ITEM', 3, {
            gameId: mod.game.me.gameId,
            id: item,
            dbid: 0,
            target: 0,
            amount: 1,
            dest: {
                x: 0,
                y: 0,
                z: 0
            },
            loc: loc,
            w: w,
            unk1: 0,
            unk2: 0,
            unk3: 0,
            unk4: true
        });
    };

    let handle = (info) => {
        if ((useoutofcombat || mod.game.me.inCombat) && !mod.game.me.inBattleground && zone || mod.settings.world) {
            if (usebroochon.includes(info.skill.id) && Date.now() > brooch.cooldown)
                setTimeout(useitem, delay, brooch.id, info.loc, info.w);
            if (userootbeeron.includes(info.skill.id) && rootbeer.amount > 0 && Date.now() > rootbeer.cooldown) {
                rootbeer.amount -= 1;
                setTimeout(useitem, delay, rootbeer.id, info.loc, info.w);
            }
        }
    };

    mod.game.on('enter_game', () => {
        dungeon = dungeons["dungeons"];
        usebroochon = skills[mod.game.me.class].usebroochon;
        userootbeeron = skills[mod.game.me.class].userootbeeron;
        useoutofcombat = skills[mod.game.me.class].useoutofcombat;
        delay = skills[mod.game.me.class].delay;
    });

    mod.hook('S_INVEN', 17, (event) => {
        if (mod.settings.enabled) {
            broochinfo = event.items.find(item => item.slot === 20);
            beer = event.items.find(item => item.id === rootbeer.id);
            if (broochinfo) brooch.id = broochinfo.id;
            if (beer) rootbeer.amount = beer.amount;
        }
    });

    mod.hook('C_START_SKILL', 7, {order: Number.NEGATIVE_INFINITY}, (event) => {
        if (mod.settings.enabled)
            handle(event);
        if (mod.settings.debug)
            mod.log('Skill ID | ' + event.skill.id + ' | for further instructions read the readme.');
    });

    mod.hook('S_START_COOLTIME_ITEM', 1, {order: Number.NEGATIVE_INFINITY}, (event) => {
        if (mod.settings.enabled) {
            if (event.item === brooch.id)
                brooch.cooldown = Date.now() + event.cooldown * 1000;
            else if (event.item === rootbeer.id)
                rootbeer.cooldown = Date.now() + event.cooldown * 1000;
        }
    });

    mod.hook('S_SYSTEM_MESSAGE', 1, (event) => {
        if (mod.settings.enabled) {
            const msg = mod.parseSystemMessage(event.message);
            if (msg.id === 'SMT_NO_ITEM' && beer === undefined) return false;
        }
    });

    mod.hook('S_LOAD_TOPO', 3, (event) => {
        if (mod.settings.enabled) {
            if (dungeon.includes(event.zone))
                zone = true;
            else if (!dungeon.includes(event.zone))
                zone = false;
        }
    });

    let ui = null;
    if (global.TeraProxy.GUIMode) {
        ui = new SettingsUI(mod, require('./settings_structure'), mod.settings, { height: 190 }, { alwaysOnTop: true });
        ui.on('update', settings => { mod.settings = settings; });

        this.destructor = () => {
            if (ui) {
                ui.close();
                ui = null;
            }
        };
    }
};