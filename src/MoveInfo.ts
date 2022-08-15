const moveInfo: { [move: string]: any } = {
  "POUND": {
  },
  "KARATE CHOP": {
  },
  "DOUBLE SLAP": {
  },
  "COMET PUNCH": {
    "type": "NORMAL",
    "category": "PHYSICAL",
    "pp": 15,
    "power": 18,
    "accuracy": 85
  },
  "MEGA PUNCH": {
    "type": "NORMAL",
    "category": "PHYSICAL",
    "pp": 20,
    "power": 80,
    "accuracy": 85
  },
  "PAY DAY": {
    "type": "NORMAL",
    "category": "PHYSICAL",
    "pp": 20,
    "power": 40,
    "accuracy": 100
  },
  "FIRE PUNCH": {
    "type": "FIRE",
    "category": "PHYSICAL",
    "pp": 15,
    "power": 75,
    "accuracy": 100
  },
  "ICE PUNCH": {
    "type": "ICE",
    "category": "PHYSICAL",
    "pp": 15,
    "power": 75,
    "accuracy": 100
  },
  "THUNDERPUNCH": {
    "type": "ELECTRIC",
    "category": "PHYSICAL",
    "pp": 15,
    "power": 75,
    "accuracy": 100
  },
  "SCRATCH": {
    "anim": "SCRATCH",
    "sfx": "Scratch"
  },
  "VISE GRIP": {
    "type": "NORMAL",
    "category": "PHYSICAL",
    "pp": 30,
    "power": 55,
    "accuracy": 100
  },
  "GUILLOTINE": {
    "type": "NORMAL",
    "category": "PHYSICAL",
    "pp": 5,
    "power": null,
    "accuracy": 30
  },
  "RAZOR WIND": {
    "type": "NORMAL",
    "category": "SPECIAL",
    "pp": 10,
    "power": 80,
    "accuracy": 75
  },
  "SWORDS DANCE": {
    "anim": "SWORDS DANCE",
    "sfx": "SwordsDance"
  },
  "CUT": {
    "type": "NORMAL",
    "category": "PHYSICAL",
    "pp": 30,
    "power": 50,
    "accuracy": 95
  },
  "GUST": {
    "type": "FLYING",
    "category": "SPECIAL",
    "pp": 35,
    "power": 40,
    "accuracy": 100
  },
  "WING ATTACK": {
    "type": "FLYING",
    "category": "PHYSICAL",
    "pp": 35,
    "power": 60,
    "accuracy": 100
  },
  "WHIRLWIND": {
    "type": "NORMAL",
    "category": "STATUS",
    "pp": 20,
    "power": null,
    "accuracy": null
  },
  "FLY": {
    "sfx": "FlyHit",
    "pan": 1
  },
  "FLY_STILL": {
    "sfx": "FlyUp",
    "pan": -1,
    "text": "flew up high"
  },
  "BIND": {
    "type": "NORMAL",
    "category": "PHYSICAL",
    "pp": 20,
    "power": 15,
    "accuracy": 75
  },
  "SLAM": {
    "type": "NORMAL",
    "category": "PHYSICAL",
    "pp": 20,
    "power": 80,
    "accuracy": 75
  },
  "VINE WHIP": {
    "type": "GRASS",
    "category": "PHYSICAL",
    "pp": 10,
    "power": 35,
    "accuracy": 100,
    "sfx": "VineWhip",
    "anim": "VINE WHIP"
  },
  "STOMP": {
    "type": "NORMAL",
    "category": "PHYSICAL",
    "pp": 20,
    "power": 65,
    "accuracy": 100
  },
  "DOUBLE KICK": {
    "type": "FIGHTING",
    "category": "PHYSICAL",
    "pp": 30,
    "power": 30,
    "accuracy": 100
  },
  "MEGA KICK": {
    "type": "NORMAL",
    "category": "PHYSICAL",
    "pp": 5,
    "power": 120,
    "accuracy": 75
  },
  "JUMP KICK": {
    "type": "FIGHTING",
    "category": "PHYSICAL",
    "pp": 25,
    "power": 70,
    "accuracy": 95,
    "sfx": "JumpKick",
    "anim": "JUMP KICK"
  },
  "ROLLING KICK": {
    "type": "FIGHTING",
    "category": "PHYSICAL",
    "pp": 15,
    "power": 60,
    "accuracy": 85
  },
  "SAND ATTACK": {
    "type": "GROUND",
    "category": "STATUS",
    "pp": 15,
    "power": null,
    "accuracy": 100,
    "sfx": "SandAttack",
    "effect": [ "ACCURACY", -1, true ]
  },
  "HEADBUTT": {
    "type": "NORMAL",
    "category": "PHYSICAL",
    "pp": 15,
    "power": 70,
    "accuracy": 100
  },
  "HORN ATTACK": {
    "type": "NORMAL",
    "category": "PHYSICAL",
    "pp": 25,
    "power": 65,
    "accuracy": 100
  },
  "FURY ATTACK": {
    "type": "NORMAL",
    "category": "PHYSICAL",
    "pp": 20,
    "power": 15,
    "accuracy": 85
  },
  "HORN DRILL": {
    "type": "NORMAL",
    "category": "PHYSICAL",
    "pp": 5,
    "power": null,
    "accuracy": 30
  },
  "TACKLE": {
    "sfx": "Tackle",
    "pan": 1
  },
  "BODY SLAM": {
    "type": "NORMAL",
    "category": "PHYSICAL",
    "pp": 15,
    "power": 85,
    "accuracy": 100,
    "sfx": "BodySlam",
    "effect": "BODY SLAM"
  },
  "WRAP": {
    "type": "NORMAL",
    "category": "PHYSICAL",
    "pp": 20,
    "power": 15,
    "accuracy": 85
  },
  "TAKE DOWN": {
    "type": "NORMAL",
    "category": "PHYSICAL",
    "pp": 20,
    "power": 90,
    "accuracy": 85
  },
  "THRASH": {
    "type": "NORMAL",
    "category": "PHYSICAL",
    "pp": 20,
    "power": 90,
    "accuracy": 100
  },
  "DOUBLE-EDGE": {
    "type": "NORMAL",
    "category": "PHYSICAL",
    "pp": 15,
    "power": 120,
    "accuracy": 100
  },
  "TAIL WHIP": {
    "anim": "TAIL WHIP",
    "postAnim": "WIGGLE",
    "sfx": "TailWhip"
  },
  "POISON STING": {
    "type": "POISON",
    "category": "PHYSICAL",
    "pp": 35,
    "power": 15,
    "accuracy": 100
  },
  "TWINEEDLE": {
    "type": "BUG",
    "category": "PHYSICAL",
    "pp": 20,
    "power": 25,
    "accuracy": 100
  },
  "PIN MISSILE": {
    "type": "BUG",
    "category": "PHYSICAL",
    "pp": 20,
    "power": 14,
    "accuracy": 85
  },
  "LEER": {
    "type": "NORMAL",
    "category": "STATUS",
    "pp": 30,
    "power": null,
    "accuracy": 100,
    "effect": [ "DEFENSE", -1, true ]
  },
  "BITE": {
    "type": "DARK",
    "category": "PHYSICAL",
    "pp": 25,
    "power": 60,
    "accuracy": 100
  },
  "GROWL": {
    "pan": -1
  },
  "ROAR": {
    "pan": -1
  },
  "SING": {
    "sfx": "Sing",
    "pan": -1
  },
  "SUPERSONIC": {
    "sfx": "SuperSonic"
  },
  "SONIC BOOM": {
    "type": "NORMAL",
    "category": "SPECIAL",
    "pp": 20,
    "power": null,
    "accuracy": 90
  },
  "DISABLE": {
    "sfx": "Disable",
    "pan": -1
  },
  "ACID": {
    "type": "POISON",
    "category": "SPECIAL",
    "pp": 30,
    "power": 40,
    "accuracy": 100
  },
  "EMBER": {
    "type": "FIRE",
    "category": "SPECIAL",
    "pp": 25,
    "power": 40,
    "accuracy": 100,
    "sfx": "Ember"
  },
  "FLAMETHROWER": {
    "type": "FIRE",
    "category": "SPECIAL",
    "pp": 15,
    "power": 95,
    "accuracy": 100,
    "sfx": "Flamethrower"
  },
  "MIST": {
    "type": "ICE",
    "category": "STATUS",
    "pp": 30,
    "power": null,
    "accuracy": null
  },
  "WATER GUN": {
    "type": "WATER",
    "category": "SPECIAL",
    "pp": 25,
    "power": 40,
    "accuracy": 100
  },
  "HYDRO PUMP": {
    "type": "WATER",
    "category": "SPECIAL",
    "pp": 5,
    "power": 120,
    "accuracy": 80
  },
  "SURF": {
    "type": "WATER",
    "category": "SPECIAL",
    "pp": 15,
    "power": 95,
    "accuracy": 100,
    "sfx": "Surf"
  },
  "ICE BEAM": {
    "type": "ICE",
    "category": "SPECIAL",
    "pp": 10,
    "power": 95,
    "accuracy": 100,
    "sfx": "Icebeam",
    "anim": "ICE BEAM"
  },
  "BLIZZARD": {
    "type": "ICE",
    "category": "SPECIAL",
    "pp": 5,
    "power": 120,
    "accuracy": 70
  },
  "PSYBEAM": {
    "type": "PSYCHIC",
    "category": "SPECIAL",
    "pp": 20,
    "power": 65,
    "accuracy": 100
  },
  "BUBBLE BEAM": {
    "type": "WATER",
    "category": "SPECIAL",
    "pp": 20,
    "power": 65,
    "accuracy": 100
  },
  "AURORA BEAM": {
    "type": "ICE",
    "category": "SPECIAL",
    "pp": 20,
    "power": 65,
    "accuracy": 100,
    "sfx": "AuroraBeam"
  },
  "HYPER BEAM": {
    "type": "NORMAL",
    "category": "SPECIAL",
    "pp": 5,
    "power": 150,
    "accuracy": 90
  },
  "PECK": {
    "type": "FLYING",
    "category": "PHYSICAL",
    "pp": 35,
    "power": 35,
    "accuracy": 100
  },
  "DRILL PECK": {
    "type": "FLYING",
    "category": "PHYSICAL",
    "pp": 20,
    "power": 80,
    "accuracy": 100,
    "sfx": "DrillPeck"
  },
  "SUBMISSION": {
    "type": "FIGHTING",
    "category": "PHYSICAL",
    "pp": 20,
    "power": 80,
    "accuracy": 80,
    "sfx": "Submission"
  },
  "LOW KICK": {
    "type": "FIGHTING",
    "category": "PHYSICAL",
    "pp": 20,
    "power": 50,
    "accuracy": 90
  },
  "COUNTER": {
    "type": "FIGHTING",
    "category": "PHYSICAL",
    "pp": 20,
    "power": null,
    "accuracy": 100
  },
  "SEISMIC TOSS": {
    "type": "FIGHTING",
    "category": "PHYSICAL",
    "pp": 20,
    "power": null,
    "accuracy": 100,
    "effect": "SEISMIC TOSS",
    "sfx": "SeismicToss"
  },
  "STRENGTH": {
    "type": "NORMAL",
    "category": "PHYSICAL",
    "pp": 15,
    "power": 80,
    "accuracy": 100
  },
  "ABSORB": {
    "type": "GRASS",
    "category": "SPECIAL",
    "pp": 20,
    "power": 20,
    "accuracy": 100
  },
  "MEGA DRAIN": {
    "type": "GRASS",
    "category": "SPECIAL",
    "pp": 10,
    "power": 40,
    "accuracy": 100
  },
  "LEECH SEED": {
    "type": "GRASS",
    "category": "STATUS",
    "pp": 10,
    "power": null,
    "accuracy": 90
  },
  "GROWTH": {
    "type": "NORMAL",
    "category": "STATUS",
    "pp": 40,
    "power": null,
    "accuracy": null
  },
  "RAZOR LEAF": {
    "type": "GRASS",
    "category": "PHYSICAL",
    "pp": 25,
    "power": 55,
    "accuracy": 95
  },
  "SOLAR BEAM": {
    "type": "GRASS",
    "category": "SPECIAL",
    "pp": 10,
    "power": 120,
    "accuracy": 100
  },
  "POISON POWDER": {
    "type": "POISON",
    "category": "STATUS",
    "pp": 35,
    "power": null,
    "accuracy": 75
  },
  "STUN SPORE": {
    "type": "GRASS",
    "category": "STATUS",
    "pp": 30,
    "power": null,
    "accuracy": 75,
    "sfx": "StunSpore",
    "effect": "PARALYZE"
  },
  "SLEEP POWDER": {
    "type": "GRASS",
    "category": "STATUS",
    "pp": 15,
    "power": null,
    "accuracy": 75
  },
  "PETAL DANCE": {
    "type": "GRASS",
    "category": "SPECIAL",
    "pp": 20,
    "power": 70,
    "accuracy": 100
  },
  "STRING SHOT": {
    "type": "BUG",
    "category": "STATUS",
    "pp": 40,
    "power": null,
    "accuracy": 95
  },
  "DRAGON RAGE": {
    "type": "DRAGON",
    "category": "SPECIAL",
    "pp": 10,
    "power": null,
    "accuracy": 100
  },
  "FIRE SPIN": {
    "type": "FIRE",
    "category": "SPECIAL",
    "pp": 15,
    "power": 15,
    "accuracy": 70
  },
  "THUNDER SHOCK": {
    "type": "ELECTRIC",
    "category": "SPECIAL",
    "pp": 30,
    "power": 40,
    "accuracy": 100
  },
  "THUNDERBOLT": {
    "type": "ELECTRIC",
    "category": "SPECIAL",
    "pp": 15,
    "power": 95,
    "accuracy": 100,
    "sfx": "Thunderbolt",
    "anim": "THUNDERBOLT",
    "effect": "THUNDERBOLT"
  },
  "THUNDER WAVE": {
    "type": "ELECTRIC",
    "category": "STATUS",
    "pp": 20,
    "power": null,
    "accuracy": 100,
    "sfx": "ThunderWave",
    "effect": "PARALYZE"
  },
  "THUNDER": {
    "type": "ELECTRIC",
    "category": "SPECIAL",
    "pp": 10,
    "power": 120,
    "accuracy": 70
  },
  "ROCK THROW": {
    "type": "ROCK",
    "category": "PHYSICAL",
    "pp": 15,
    "power": 50,
    "accuracy": 90
  },
  "EARTHQUAKE": {
    "type": "GROUND",
    "category": "PHYSICAL",
    "pp": 10,
    "power": 100,
    "accuracy": 100,
    "sfx": "Earthquake"
  },
  "FISSURE": {
    "type": "GROUND",
    "category": "PHYSICAL",
    "pp": 5,
    "power": null,
    "accuracy": 30
  },
  "DIG": {
    "type": "GROUND",
    "category": "PHYSICAL",
    "pp": 10,
    "power": 60,
    "accuracy": 100
  },
  "TOXIC": {
    "type": "POISON",
    "category": "STATUS",
    "pp": 10,
    "power": null,
    "accuracy": 85
  },
  "CONFUSION": {
    "type": "PSYCHIC",
    "category": "SPECIAL",
    "pp": 25,
    "power": 50,
    "accuracy": 100,
    "effect": "CONFUSION",
    "sfx": "Confusion"
  },
  "PSYCHIC": {
    "type": "PSYCHIC",
    "category": "SPECIAL",
    "pp": 10,
    "power": 90,
    "accuracy": 100,
    "sfx": "Psychic",
    "effect": ["SPCL.DEFENSE", -1, true, 10]
  },
  "HYPNOSIS": {
    "type": "PSYCHIC",
    "category": "STATUS",
    "pp": 20,
    "power": null,
    "accuracy": 60
  },
  "MEDITATE": {
    "type": "PSYCHIC",
    "category": "STATUS",
    "pp": 40,
    "power": null,
    "accuracy": null
  },
  "AGILITY": {
    "type": "PSYCHIC",
    "category": "STATUS",
    "pp": 30,
    "power": null,
    "accuracy": null,
    "sfx": "AGILITY",
    "effect": ["SPEED", 2, false]
  },
  "QUICK ATTACK": {
    "type": "NORMAL",
    "category": "PHYSICAL",
    "pp": 30,
    "power": 40,
    "accuracy": 100,
    "priority": 1
  },
  "RAGE": {
    "type": "NORMAL",
    "category": "PHYSICAL",
    "pp": 20,
    "power": 20,
    "accuracy": 100,
    "anim": "RAGE",
    "sfx": "Rage",
    "shaders": [ "rage" ],
    "effect": "RAGE"
  },
  "TELEPORT": {
    "type": "PSYCHIC",
    "category": "STATUS",
    "pp": 20,
    "power": null,
    "accuracy": null
  },
  "NIGHT SHADE": {
    "type": "GHOST",
    "category": "SPECIAL",
    "pp": 15,
    "power": null,
    "accuracy": 100
  },
  "MIMIC": {
    "type": "NORMAL",
    "category": "STATUS",
    "pp": 10,
    "power": null,
    "accuracy": 100
  },
  "SCREECH": {
    "type": "NORMAL",
    "category": "STATUS",
    "pp": 40,
    "power": null,
    "accuracy": 85
  },
  "DOUBLE TEAM": {
    "type": "NORMAL",
    "category": "STATUS",
    "pp": 15,
    "power": null,
    "accuracy": null,
    "effect": [ "EVASION", 1, false ],
    "sfx": "DoubleTeam"
  },
  "RECOVER": {
    "type": "NORMAL",
    "category": "STATUS",
    "pp": 10,
    "power": null,
    "accuracy": null,
    "effect": "HEAL_50",
    "sfx": "Recover"
  },
  "HARDEN": {
    "type": "NORMAL",
    "category": "STATUS",
    "pp": 30,
    "power": null,
    "accuracy": null
  },
  "MINIMIZE": {
    "type": "NORMAL",
    "category": "STATUS",
    "pp": 20,
    "power": null,
    "accuracy": null
  },
  "SMOKESCREEN": {
    "type": "NORMAL",
    "category": "STATUS",
    "pp": 20,
    "power": null,
    "accuracy": 100,
    "effect": [ "ACCURACY", -1, true ],
    "sfx": "SmokeScreen"
  },
  "CONFUSE RAY": {
    "type": "GHOST",
    "category": "STATUS",
    "pp": 10,
    "power": null,
    "accuracy": 100,
    "sfx": "ConfuseRay",
    "effect": "CONFUSE"
  },
  "WITHDRAW": {
    "type": "WATER",
    "category": "STATUS",
    "pp": 40,
    "power": null,
    "accuracy": null
  },
  "DEFENSE CURL": {
    "type": "NORMAL",
    "category": "STATUS",
    "pp": 40,
    "power": null,
    "accuracy": null,
    "effect": ["DEFENSE", 1, false],
    "sfx": "DefenseCurl",
    "anim": "DEFENSE CURL"
  },
  "BARRIER": {
    "type": "PSYCHIC",
    "category": "STATUS",
    "pp": 30,
    "power": null,
    "accuracy": null,
    "effect": ["DEFENSE", 2, false]
  },
  "LIGHT SCREEN": {
    "type": "PSYCHIC",
    "category": "STATUS",
    "pp": 30,
    "power": null,
    "accuracy": null
  },
  "HAZE": {
    "type": "ICE",
    "category": "STATUS",
    "pp": 30,
    "power": null,
    "accuracy": null
  },
  "REFLECT": {
    "type": "PSYCHIC",
    "category": "STATUS",
    "pp": 20,
    "power": null,
    "accuracy": null
  },
  "FOCUS ENERGY": {
    "type": "NORMAL",
    "category": "STATUS",
    "pp": 30,
    "power": null,
    "accuracy": null,
    "sfx": "FocusEnergy",
    "anim": "FOCUS ENERGY",
    "effect": "FOCUS ENERGY"
  },
  "BIDE": {
    "type": "NORMAL",
    "category": "PHYSICAL",
    "pp": 10,
    "power": null,
    "accuracy": 100
  },
  "METRONOME": {
    "sfx": "Metronome",
    "pan": -1
  },
  "MIRROR MOVE": {
    "type": "FLYING",
    "category": "STATUS",
    "pp": 20,
    "power": null,
    "accuracy": null
  },
  "SELF-DESTRUCT": {
    "type": "NORMAL",
    "category": "PHYSICAL",
    "pp": 5,
    "power": 200,
    "accuracy": 100
  },
  "EGG BOMB": {
    "type": "NORMAL",
    "category": "PHYSICAL",
    "pp": 10,
    "power": 100,
    "accuracy": 75
  },
  "LICK": {
    "type": "GHOST",
    "category": "PHYSICAL",
    "pp": 30,
    "power": 20,
    "accuracy": 100
  },
  "SMOG": {
    "type": "POISON",
    "category": "SPECIAL",
    "pp": 20,
    "power": 20,
    "accuracy": 70
  },
  "SLUDGE": {
    "type": "POISON",
    "category": "SPECIAL",
    "pp": 20,
    "power": 65,
    "accuracy": 100
  },
  "BONE CLUB": {
    "type": "GROUND",
    "category": "PHYSICAL",
    "pp": 20,
    "power": 65,
    "accuracy": 85
  },
  "FIRE BLAST": {
    "type": "FIRE",
    "category": "SPECIAL",
    "pp": 5,
    "power": 120,
    "accuracy": 85,
    "sfx": "FireBlast"
  },
  "WATERFALL": {
    "type": "WATER",
    "category": "PHYSICAL",
    "pp": 15,
    "power": 80,
    "accuracy": 100
  },
  "CLAMP": {
    "type": "WATER",
    "category": "PHYSICAL",
    "pp": 10,
    "power": 35,
    "accuracy": 75
  },
  "SWIFT": {
    "type": "NORMAL",
    "category": "SPECIAL",
    "pp": 20,
    "power": 60,
    "accuracy": null
  },
  "SKULL BASH": {
    "type": "NORMAL",
    "category": "PHYSICAL",
    "pp": 15,
    "power": 100,
    "accuracy": 100
  },
  "SPIKE CANNON": {
    "type": "NORMAL",
    "category": "PHYSICAL",
    "pp": 15,
    "power": 20,
    "accuracy": 100
  },
  "CONSTRICT": {
    "type": "NORMAL",
    "category": "PHYSICAL",
    "pp": 35,
    "power": 10,
    "accuracy": 100
  },
  "AMNESIA": {
    "type": "PSYCHIC",
    "category": "STATUS",
    "pp": 20,
    "power": null,
    "accuracy": null
  },
  "KINESIS": {
    "type": "PSYCHIC",
    "category": "STATUS",
    "pp": 15,
    "power": null,
    "accuracy": 80
  },
  "SOFT-BOILED": {
    "type": "NORMAL",
    "category": "STATUS",
    "pp": 10,
    "power": null,
    "accuracy": null,
    "effect": "HEAL_50",
    "sfx": "SoftBoiled"
  },
  "HI JUMP KICK": {
    "type": "FIGHTING",
    "category": "PHYSICAL",
    "pp": 20,
    "power": 85,
    "accuracy": 90
  },
  "GLARE": {
    "type": "NORMAL",
    "category": "STATUS",
    "pp": 30,
    "power": null,
    "accuracy": 75
  },
  "DREAM EATER": {
    "type": "PSYCHIC",
    "category": "SPECIAL",
    "pp": 15,
    "power": 100,
    "accuracy": 100
  },
  "POISON GAS": {
    "type": "POISON",
    "category": "STATUS",
    "pp": 40,
    "power": null,
    "accuracy": 55
  },
  "BARRAGE": {
    "type": "NORMAL",
    "category": "PHYSICAL",
    "pp": 20,
    "power": 15,
    "accuracy": 85
  },
  "LEECH LIFE": {
    "type": "BUG",
    "category": "PHYSICAL",
    "pp": 15,
    "power": 20,
    "accuracy": 100
  },
  "LOVELY KISS": {
    "type": "NORMAL",
    "category": "STATUS",
    "pp": 10,
    "power": null,
    "accuracy": 75
  },
  "SKY ATTACK": {
    "type": "FLYING",
    "category": "PHYSICAL",
    "pp": 5,
    "power": 140,
    "accuracy": 90
  },
  "TRANSFORM": {
    "type": "NORMAL",
    "category": "STATUS",
    "pp": 10,
    "power": null,
    "accuracy": null
  },
  "BUBBLE": {
    "type": "WATER",
    "category": "SPECIAL",
    "pp": 30,
    "power": 20,
    "accuracy": 100
  },
  "DIZZY PUNCH": {
    "type": "NORMAL",
    "category": "PHYSICAL",
    "pp": 10,
    "power": 70,
    "accuracy": 100,
    "effect": "DIZZY PUNCH",
    "sfx": "DizzyPunch"
  },
  "SPORE": {
    "type": "GRASS",
    "category": "STATUS",
    "pp": 15,
    "power": null,
    "accuracy": 100
  },
  "FLASH": {
    "type": "NORMAL",
    "category": "STATUS",
    "pp": 20,
    "power": null,
    "accuracy": 70
  },
  "PSYWAVE": {
    "type": "PSYCHIC",
    "category": "SPECIAL",
    "pp": 15,
    "power": null,
    "accuracy": 80
  },
  "SPLASH": {
    "type": "NORMAL",
    "category": "STATUS",
    "pp": 40,
    "power": null,
    "accuracy": null
  },
  "ACID ARMOR": {
    "type": "POISON",
    "category": "STATUS",
    "pp": 40,
    "power": null,
    "accuracy": null
  },
  "CRABHAMMER": {
    "type": "WATER",
    "category": "PHYSICAL",
    "pp": 10,
    "power": 90,
    "accuracy": 85
  },
  "EXPLOSION": {
    "type": "NORMAL",
    "category": "PHYSICAL",
    "pp": 5,
    "power": 250,
    "accuracy": 100
  },
  "FURY SWIPES": {
    "type": "NORMAL",
    "category": "PHYSICAL",
    "pp": 15,
    "power": 18,
    "accuracy": 80
  },
  "BONEMERANG": {
    "type": "GROUND",
    "category": "PHYSICAL",
    "pp": 10,
    "power": 50,
    "accuracy": 90
  },
  "REST": {
    "type": "PSYCHIC",
    "category": "STATUS",
    "pp": 10,
    "power": null,
    "accuracy": null,
    "sfx": "Rest",
    "effect": "REST",
    "anim": "REST"
  },
  "ROCK SLIDE": {
    "type": "ROCK",
    "category": "PHYSICAL",
    "pp": 10,
    "power": 75,
    "accuracy": 90
  },
  "HYPER FANG": {
    "type": "NORMAL",
    "category": "PHYSICAL",
    "pp": 15,
    "power": 80,
    "accuracy": 90
  },
  "SHARPEN": {
    "type": "NORMAL",
    "category": "STATUS",
    "pp": 30,
    "power": null,
    "accuracy": null
  },
  "CONVERSION": {
    "type": "NORMAL",
    "category": "STATUS",
    "pp": 30,
    "power": null,
    "accuracy": null
  },
  "TRI ATTACK": {
    "type": "NORMAL",
    "category": "SPECIAL",
    "pp": 10,
    "power": 80,
    "accuracy": 100,
    "sfx": "TriAttack"
  },
  "SUPER FANG": {
    "type": "NORMAL",
    "category": "PHYSICAL",
    "pp": 10,
    "power": null,
    "accuracy": 90
  },
  "SLASH": {
    "type": "NORMAL",
    "category": "PHYSICAL",
    "pp": 20,
    "power": 70,
    "accuracy": 100,
    "critical": true,
    "sfx": "Slash",
    "anim": "SLASH"
  },
  "SUBSTITUTE": {
    "sfx": "Substitute",
    "pan": -1
  },
  "STRUGGLE": {
    "type": "NORMAL",
    "category": "PHYSICAL",
    "pp": 1,
    "power": 50,
    "accuracy": 100
  },
  "SKETCH": {
    "type": "NORMAL",
    "category": "STATUS",
    "pp": 1,
    "power": null,
    "accuracy": null
  },
  "TRIPLE KICK": {
    "type": "FIGHTING",
    "category": "PHYSICAL",
    "pp": 10,
    "power": 10,
    "accuracy": 90
  },
  "THIEF": {
    "type": "DARK",
    "category": "PHYSICAL",
    "pp": 10,
    "power": 40,
    "accuracy": 100
  },
  "SPIDER WEB": {
    "type": "BUG",
    "category": "STATUS",
    "pp": 10,
    "power": null,
    "accuracy": null
  },
  "MIND READER": {
    "type": "NORMAL",
    "category": "STATUS",
    "pp": 5,
    "power": null,
    "accuracy": 100
  },
  "NIGHTMARE": {
    "type": "GHOST",
    "category": "STATUS",
    "pp": 15,
    "power": null,
    "accuracy": 100
  },
  "FLAME WHEEL": {
    "type": "FIRE",
    "category": "PHYSICAL",
    "pp": 25,
    "power": 60,
    "accuracy": 100
  },
  "SNORE": {
    "type": "NORMAL",
    "category": "SPECIAL",
    "pp": 15,
    "power": 40,
    "accuracy": 100
  },
  "CURSE": {
    "type": "GHOST",
    "category": "STATUS",
    "pp": 10,
    "power": null,
    "accuracy": null
  },
  "FLAIL": {
    "type": "NORMAL",
    "category": "PHYSICAL",
    "pp": 15,
    "power": null,
    "accuracy": 100
  },
  "CONVERSION 2": {
    "type": "NORMAL",
    "category": "STATUS",
    "pp": 30,
    "power": null,
    "accuracy": null
  },
  "AEROBLAST": {
    "type": "FLYING",
    "category": "SPECIAL",
    "pp": 5,
    "power": 100,
    "accuracy": 95
  },
  "COTTON SPORE": {
    "type": "GRASS",
    "category": "STATUS",
    "pp": 40,
    "power": null,
    "accuracy": 85
  },
  "REVERSAL": {
    "type": "FIGHTING",
    "category": "PHYSICAL",
    "pp": 15,
    "power": null,
    "accuracy": 100
  },
  "SPITE": {
    "type": "GHOST",
    "category": "STATUS",
    "pp": 10,
    "power": null,
    "accuracy": 100
  },
  "POWDER SNOW": {
    "type": "ICE",
    "category": "SPECIAL",
    "pp": 25,
    "power": 40,
    "accuracy": 100
  },
  "PROTECT": {
    "type": "NORMAL",
    "category": "STATUS",
    "pp": 10,
    "power": null,
    "accuracy": null
  },
  "MACH PUNCH": {
    "type": "FIGHTING",
    "category": "PHYSICAL",
    "pp": 30,
    "power": 40,
    "accuracy": 100
  },
  "SCARY FACE": {
    "type": "NORMAL",
    "category": "STATUS",
    "pp": 10,
    "power": null,
    "accuracy": 90
  },
  "FEINT ATTACK": {
    "type": "DARK",
    "category": "PHYSICAL",
    "pp": 20,
    "power": 60,
    "accuracy": null
  },
  "SWEET KISS": {
    "type": "FAIRY",
    "category": "STATUS",
    "pp": 10,
    "power": null,
    "accuracy": 75
  },
  "BELLY DRUM": {
    "type": "NORMAL",
    "category": "STATUS",
    "pp": 10,
    "power": null,
    "accuracy": null
  },
  "SLUDGE BOMB": {
    "sfx": "SludgeBomb",
    "pan": 1
  },
  "MUD-SLAP": {
    "type": "GROUND",
    "category": "SPECIAL",
    "pp": 10,
    "power": 20,
    "accuracy": 100,
    "sfx":"MudSlap",
    "effect": ["ACCURACY", -1, true, 100]
  },
  "OCTAZOOKA": {
    "type": "WATER",
    "category": "SPECIAL",
    "pp": 10,
    "power": 65,
    "accuracy": 85
  },
  "SPIKES": {
    "type": "GROUND",
    "category": "STATUS",
    "pp": 20,
    "power": null,
    "accuracy": null
  },
  "ZAP CANNON": {
    "type": "ELECTRIC",
    "category": "SPECIAL",
    "pp": 5,
    "power": 100,
    "accuracy": 50
  },
  "FORESIGHT": {
    "type": "NORMAL",
    "category": "STATUS",
    "pp": 40,
    "power": null,
    "accuracy": 100
  },
  "DESTINY BOND": {
    "type": "GHOST",
    "category": "STATUS",
    "pp": 5,
    "power": null,
    "accuracy": null
  },
  "PERISH SONG": {
    "type": "NORMAL",
    "category": "STATUS",
    "pp": 5,
    "power": null,
    "accuracy": null
  },
  "ICY WIND": {
    "type": "ICE",
    "category": "SPECIAL",
    "pp": 15,
    "power": 55,
    "accuracy": 95
  },
  "DETECT": {
    "type": "FIGHTING",
    "category": "STATUS",
    "pp": 5,
    "power": null,
    "accuracy": null
  },
  "BONE RUSH": {
    "type": "GROUND",
    "category": "PHYSICAL",
    "pp": 10,
    "power": 25,
    "accuracy": 80
  },
  "LOCK-ON": {
    "type": "NORMAL",
    "category": "STATUS",
    "pp": 5,
    "power": null,
    "accuracy": 100
  },
  "OUTRAGE": {
    "type": "DRAGON",
    "category": "PHYSICAL",
    "pp": 15,
    "power": 90,
    "accuracy": 100
  },
  "SANDSTORM": {
    "type": "ROCK",
    "category": "STATUS",
    "pp": 10,
    "power": null,
    "accuracy": null
  },
  "GIGA DRAIN": {
    "type": "GRASS",
    "category": "SPECIAL",
    "pp": 5,
    "power": 60,
    "accuracy": 100,
    "effect": "GIGA DRAIN",
    "sfx": "GigaDrain"
  },
  "ENDURE": {
    "type": "NORMAL",
    "category": "STATUS",
    "pp": 10,
    "power": null,
    "accuracy": null
  },
  "CHARM": {
    "type": "FAIRY",
    "category": "STATUS",
    "pp": 20,
    "power": null,
    "accuracy": 100
  },
  "ROLLOUT": {
    "type": "ROCK",
    "category": "PHYSICAL",
    "pp": 20,
    "power": 30,
    "accuracy": 90
  },
  "FALSE SWIPE": {
    "type": "NORMAL",
    "category": "PHYSICAL",
    "pp": 40,
    "power": 40,
    "accuracy": 100
  },
  "SWAGGER": {
    "type": "NORMAL",
    "category": "STATUS",
    "pp": 15,
    "power": null,
    "accuracy": 90
  },
  "MILK DRINK": {
    "type": "NORMAL",
    "category": "STATUS",
    "pp": 10,
    "power": null,
    "accuracy": null
  },
  "SPARK": {
    "type": "ELECTRIC",
    "category": "PHYSICAL",
    "pp": 20,
    "power": 65,
    "accuracy": 100
  },
  "FURY CUTTER": {
    "type": "BUG",
    "category": "PHYSICAL",
    "pp": 20,
    "power": 10,
    "accuracy": 95
  },
  "STEEL WING": {
    "type": "STEEL",
    "category": "PHYSICAL",
    "pp": 25,
    "power": 70,
    "accuracy": 90,
    "sfx": "SteelWing",
    "effect": ["DEFENSE", 1, false, 10]
  },
  "MEAN LOOK": {
    "type": "NORMAL",
    "category": "STATUS",
    "pp": 5,
    "power": null,
    "accuracy": null
  },
  "ATTRACT": {
    "type": "NORMAL",
    "category": "STATUS",
    "pp": 15,
    "power": null,
    "accuracy": 100
  },
  "SLEEP TALK": {
    "type": "NORMAL",
    "category": "STATUS",
    "pp": 10,
    "power": null,
    "accuracy": null,
    "effect": "SLEEP TALK",
    "anim": "SLEEP TALK",
    "sfx": "SleepTalk"
  },
  "HEAL BELL": {
    "type": "NORMAL",
    "category": "STATUS",
    "pp": 5,
    "power": null,
    "accuracy": null
  },
  "RETURN": {
    "type": "NORMAL",
    "category": "PHYSICAL",
    "pp": 20,
    "power": null,
    "accuracy": 100
  },
  "PRESENT": {
    "type": "NORMAL",
    "category": "PHYSICAL",
    "pp": 15,
    "power": null,
    "accuracy": 90
  },
  "FRUSTRATION": {
    "type": "NORMAL",
    "category": "PHYSICAL",
    "pp": 20,
    "power": null,
    "accuracy": 100
  },
  "SAFEGUARD": {
    "type": "NORMAL",
    "category": "STATUS",
    "pp": 25,
    "power": null,
    "accuracy": null
  },
  "PAIN SPLIT": {
    "type": "NORMAL",
    "category": "STATUS",
    "pp": 20,
    "power": null,
    "accuracy": 100
  },
  "SACRED FIRE": {
    "type": "FIRE",
    "category": "PHYSICAL",
    "pp": 5,
    "power": 100,
    "accuracy": 95
  },
  "MAGNITUDE": {
    "type": "GROUND",
    "category": "PHYSICAL",
    "pp": 30,
    "power": null,
    "accuracy": 100
  },
  "DYNAMICPUNCH": {
    "type": "FIGHTING",
    "category": "PHYSICAL",
    "pp": 5,
    "power": 100,
    "accuracy": 50,
    "sfx": "DynamicPunch",
    "anim": "DYNAMICPUNCH",
    "effect": "DYNAMICPUNCH"
  },
  "MEGAHORN": {
    "type": "BUG",
    "category": "PHYSICAL",
    "pp": 10,
    "power": 120,
    "accuracy": 85
  },
  "DRAGONBREATH": {
    "type": "DRAGON",
    "category": "SPECIAL",
    "pp": 20,
    "power": 60,
    "accuracy": 100,
    "sfx": "DragonBreath",
    "effect": "DRAGONBREATH"
  },
  "BATON PASS": {
    "type": "NORMAL",
    "category": "STATUS",
    "pp": 40,
    "power": null,
    "accuracy": null
  },
  "ENCORE": {
    "sfx": "Encore", 
    "pan": 1
  },
  "PURSUIT": {
    "type": "DARK",
    "category": "PHYSICAL",
    "pp": 20,
    "power": 40,
    "accuracy": 100
  },
  "RAPID SPIN": {
    "type": "NORMAL",
    "category": "PHYSICAL",
    "pp": 40,
    "power": 20,
    "accuracy": 100
  },
  "SWEET SCENT": {
    "type": "NORMAL",
    "category": "STATUS",
    "pp": 20,
    "power": null,
    "accuracy": 100
  },
  "IRON TAIL": {
    "type": "STEEL",
    "category": "PHYSICAL",
    "pp": 15,
    "power": 100,
    "accuracy": 75
  },
  "METAL CLAW": {
    "type": "STEEL",
    "category": "PHYSICAL",
    "pp": 35,
    "power": 50,
    "accuracy": 95
  },
  "VITAL THROW": {
    "type": "FIGHTING",
    "category": "PHYSICAL",
    "pp": 10,
    "power": 70,
    "accuracy": null,
    "priority": -1,
    "sfx": "VitalThrow"
  },
  "MORNING SUN": {
    "type": "NORMAL",
    "category": "STATUS",
    "pp": 5,
    "power": null,
    "accuracy": null
  },
  "SYNTHESIS": {
    "type": "GRASS",
    "category": "STATUS",
    "pp": 5,
    "power": null,
    "accuracy": null
  },
  "MOONLIGHT": {
    "sfx": "Moonlight",
    "pan": -1
  },
  "HIDDEN POWER": {
    "type": "NORMAL",
    "category": "SPECIAL",
    "pp": 15,
    "power": null,
    "accuracy": 100
  },
  "CROSS CHOP": {
    "type": "FIGHTING",
    "category": "PHYSICAL",
    "pp": 5,
    "power": 100,
    "accuracy": 80,
    "sfx": "CrossChop",
    "critical": true
  },
  "TWISTER": {
    "type": "DRAGON",
    "category": "SPECIAL",
    "pp": 20,
    "power": 40,
    "accuracy": 100
  },
  "RAIN DANCE": {
    "type": "WATER",
    "category": "STATUS",
    "pp": 5,
    "power": null,
    "accuracy": null
  },
  "SUNNY DAY": {
    "type": "FIRE",
    "category": "STATUS",
    "pp": 5,
    "power": null,
    "accuracy": null
  },
  "CRUNCH": {
    "type": "DARK",
    "category": "PHYSICAL",
    "pp": 15,
    "power": 80,
    "accuracy": 100,
    "sfx": "Crunch",
    "anim": "CRUNCH",
    "effect": ["SPCL.DEFENSE", -1, true, 20]
  },
  "MIRROR COAT": {
    "type": "PSYCHIC",
    "category": "SPECIAL",
    "pp": 20,
    "power": null,
    "accuracy": 100
  },
  "PSYCH UP": {
    "type": "NORMAL",
    "category": "STATUS",
    "pp": 10,
    "power": null,
    "accuracy": null
  },
  "EXTREMESPEED": {
    "sfx": "ExtremeSpeed"
  },
  "ANCIENT POWER": {
    "type": "ROCK",
    "category": "SPECIAL",
    "pp": 5,
    "power": 60,
    "accuracy": 100
  },
  "SHADOW BALL": {
    "sfx": "ShadowBall"
  },
  "FUTURE SIGHT": {
    "type": "PSYCHIC",
    "category": "SPECIAL",
    "pp": 15,
    "power": 80,
    "accuracy": 90
  },
  "ROCK SMASH": {
  },
  "WHIRLPOOL": {
  },
  "BEAT UP": {
  }
}
export default moveInfo;