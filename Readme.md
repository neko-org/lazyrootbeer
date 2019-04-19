## Tera proxy module which automatically uses brooch and or rootbeer.

---

## Console Command
- Type `/8 lazy beer` to enable or disable auto use of brooch and or rootbeer function. Enabled by default.
- Type `/8 lazy debug` to enable or disable debug function for setting up the module. Disabled by default.
- Type `/8 lazy world` to enable or disable the zone restriction function. Enabled by default.
    - Enabled is that brooch and or rootbeer will be used everywhere in the game.
    - Disabled is that brooch and or rootbeer will only be used in dungeons.

---

## Interface Command
- Type `/8 lazy config` to enable or disable the functions written above.

---

## Configuration
- If you want to edit the config you just need to edit the skills.json file.
    - Which can be found here /Additional-Data/Skillconfiguration/skills.json in the modules folder.

---

- A list of things that can be edited can be found here. Only for experienced users.
    - use_out_of_combat => Choose if the module should only work in combat mode or out of combat too.
    - use_rootbeer_on => Put the desired skill id in here where you want the module to take effect.
    - use_brooch_on => Put the desired skill id in here where you want the module to take effect.
    - delay => Delay in milliseconds between using the skill and using brooch and or rootbeer.

---

## Skillinfo
- Debug command listed above.
- [Teralore Database](https://teralore.com/en/skills/)

---

## Note
- An list of the dungeons which are currently added in the dungeons.json file can be found here [Dungeon Overview](https://github.com/Tera-Shiraneko/lazyrootbeer/tree/master/Additional-Data/Dungeonconfiguration).
- An list of the skills which are currently added in the skills.json file can be found here [Skill Overview](https://github.com/Tera-Shiraneko/lazyrootbeer/tree/master/Additional-Data/Skillconfiguration).
- If you enter multiple skill id's in skills.json you need to put an comma between each skill you add.
- If you got multiple skill id's it will use brooch and or rootbeer on the first skill you use.
- I don't play every class so it's possible you have to edit the skills.json file manually.
    - Which can be found under the path written above.