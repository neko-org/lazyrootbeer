const dungeons = require('./Additional-Data/Dungeonconfiguration/dungeons.json');
const skills = require('./Additional-Data/Skillconfiguration/skills.json');
const SettingsUI = require('tera-mod-ui').Settings;

module.exports = function Lazy_Rootbeer(mod) {

    if (mod.proxyAuthor !== 'caali' || !global.TeraProxy) {
        mod.warn('You are trying to use this module on an unsupported legacy version of tera-proxy.');
        mod.warn('The module may not work as expected, and even if it works for now, it may break at any point in the future!');
        mod.warn('It is highly recommended that you download the latest official version from the #proxy channel in http://tiny.cc/caalis-tera-proxy');
    }

    mod.game.initialize('inventory');

    const not_usable_brooch = [19698, 19701, 19704, 19734, 19735, 80280, 80281];
    const usable_beer = [80081, 206045, 206770];

    let use_out_of_combat, use_rootbeer_on, use_brooch_on, delay,
        brooch_cooldown = 0, rootbeer_cooldown = 0,
        player_location, dungeon,
        zone = false;

    mod.command.add('lazy', (arg_1) => {
        if (arg_1 === 'beer') {
            mod.settings.enabled = !mod.settings.enabled;
            mod.command.message(`Lazyrootbeer is now ${mod.settings.enabled ? 'enabled' : 'disabled'}.`);
        }
        else if (arg_1 === 'world') {
            mod.settings.world = !mod.settings.world;
            mod.command.message(`Lazyrootbeer in open world is now ${mod.settings.world ? 'enabled' : 'disabled'}.`);
        }
        else if (arg_1 === 'debug') {
            mod.settings.debug = !mod.settings.debug;
            mod.command.message(`Debugging of skills is now ${mod.settings.debug ? 'enabled' : 'disabled'}.`);
        }
        else if (arg_1 === 'config') {
            if (ui) {
                ui.show();
            }
        }
    });

    mod.game.on('enter_game', () => {
        dungeon = dungeons['dungeons'];
        use_brooch_on = skills[mod.game.me.class].use_brooch_on;
        use_rootbeer_on = skills[mod.game.me.class].use_rootbeer_on;
        use_out_of_combat = skills[mod.game.me.class].use_out_of_combat;
        delay = skills[mod.game.me.class].delay;
    });

    mod.hook('C_PLAYER_LOCATION', 5, (event) => {
        player_location = event;
    });

    function use_brooch() {
        if (mod.game.inventory.slots[20]) {
            let brooch_info = mod.game.inventory.slots[20];
            if (!not_usable_brooch.includes(brooch_info.id)) {
                mod.send('C_USE_ITEM', 3, {
                    gameId: mod.game.me.gameId,
                    id: brooch_info.id,
                    amount: 1,
                    loc: player_location.loc,
                    w: player_location.w,
                    unk4: true
                });
            }
        }
    }

    function use_beer() {
        let rootbeer_info = mod.game.inventory.findInBag(usable_beer);
        if (rootbeer_info !== undefined) {
            mod.send('C_USE_ITEM', 3, {
                gameId: mod.game.me.gameId,
                id: rootbeer_info.id,
                amount: 1,
                loc: player_location.loc,
                w: player_location.w,
                unk4: true
            });
        }
    }

    mod.hook('S_LOAD_TOPO', 3, (event) => {
        if (dungeon.includes(event.zone)) {
            zone = true;
        } else {
            zone = false;
        }
    });

    mod.hook('S_START_COOLTIME_ITEM', 1, {order: Number.NEGATIVE_INFINITY}, (event) => {
        if (mod.game.inventory.slots[20]) {
            let brooch_info = mod.game.inventory.slots[20];
            if (event.item === brooch_info.id) {
                brooch_cooldown = Date.now() + event.cooldown * 1000;
            }
        }
        if (usable_beer.includes(event.item)) {
            rootbeer_cooldown = Date.now() + event.cooldown * 1000;
        }
    });

    let handle = (info) => {
        if ((use_out_of_combat || mod.game.me.inCombat) && !mod.game.me.inBattleground && zone || mod.settings.world) {
            if (use_brooch_on.includes(info.skill.id) && Date.now() > brooch_cooldown) {
                mod.setTimeout(() => {
                    use_brooch();
                }, delay);
            }
            if (use_rootbeer_on.includes(info.skill.id) && Date.now() > rootbeer_cooldown) {
                mod.setTimeout(() => {
                    use_beer();
                }, delay);
            }
        }
    };

    mod.hook('C_START_SKILL', 7, {order: Number.NEGATIVE_INFINITY}, (event) => {
        if (mod.settings.enabled) {
            handle(event);
        }
        if (mod.settings.debug) {
            mod.log('Skill ID | ' + event.skill.id + ' | for further instructions read the readme.');
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