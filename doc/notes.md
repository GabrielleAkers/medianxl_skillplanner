- median manifest: https://launcher.median-xl.com/mxl/release/public/manifest

- class codes:
    ama - 0
    sor - 1
    nec - 2
    pal - 3
    bar - 4
    dru - 5
    ass - 6

- mpq format: http://www.zezula.net/en/mpq/mpqformat.html

- referenced some code here: https://github.com/blacha/diablo2

- structs are from https://d2mods.info/forum/viewtopic.php?f=8&t=61189&p=478998&hilit=bin+file+struct#p478998 some important ones for our purposes:
    ```
    typedef unsigned char BYTE
    typedef unsigned short WORD
    typedef unsigned int DWORD

    struct D2SkillsTxt
    {
        DWORD dwSkillId; 					//0x00
        DWORD dwFlags[2];					//0x04
        DWORD dwClassId;					//0x0C
        BYTE nAnim;							//0x10
        BYTE nMonAnim;						//0x11
        BYTE nSeqTrans;						//0x12
        BYTE nSeqNum;						//0x13
        BYTE nRange;						//0x14
        BYTE nSelectProc;					//0x15
        BYTE nSeqInput;						//0x16
        BYTE unk0x17;						//0x17
        WORD wITypeA1;						//0x18
        WORD wITypeA2;						//0x1A
        WORD wITypeA3;						//0x1C
        WORD wITypeB1;						//0x1E
        WORD wITypeB2;						//0x20
        WORD wITypeB3;						//0x22
        WORD wETypeA1;						//0x24
        WORD wETypeA2;						//0x26
        WORD wETypeB1;						//0x28
        WORD wETypeB2;						//0x2A
        WORD wSrvStartFunc;					//0x2C
        WORD wSrvDoFunc;					//0x2E
        WORD wSrvPrgFunc1;					//0x30
        WORD wSrvPrgFunc2;					//0x32
        WORD wSrvPrgFunc3;					//0x34
        WORD unk0x36;						//0x36
        DWORD dwPrgCalc1;					//0x38
        DWORD dwPrgCalc2;					//0x3C
        DWORD dwPrgCalc3;					//0x40
        WORD wPrgDamage;					//0x44
        WORD wSrvMissile;					//0x46
        WORD wSrvMissileA;					//0x48
        WORD wSrvMissileB;					//0x4A
        WORD wSrvMissileC;					//0x4C
        WORD wSrvOverlay;					//0x4E
        DWORD dwAuraFilter;					//0x50
        WORD wAuraStat1;					//0x54
        WORD wAuraStat2;					//0x56
        WORD wAuraStat3;					//0x58
        WORD wAuraStat4;					//0x5A
        WORD wAuraStat5;					//0x5C
        WORD wAuraStat6;					//0x5E
        DWORD dwAuraLenCalc;				//0x60
        DWORD dwAuraRangeCalc;				//0x64
        DWORD dwAuraStatCalc1;				//0x68
        DWORD dwAuraStatCalc2;				//0x6C
        DWORD dwAuraStatCalc3;				//0x70
        DWORD dwAuraStatCalc4;				//0x74
        DWORD dwAuraStatCalc5;				//0x78
        DWORD dwAuraStatCalc6;				//0x7C
        WORD wAuraState;					//0x80
        WORD wAuraTargetState;				//0x82
        WORD wAuraEvent1;					//0x84
        WORD wAuraEvent2;					//0x86
        WORD wAuraEvent3;					//0x88
        WORD wAuraEventFunc1;				//0x8A
        WORD wAuraEventFunc2;				//0x8C
        WORD wAuraEventFunc3;				//0x8E
        WORD wAuraTgtEvent;					//0x90
        WORD wAuraTgtEventFunc;				//0x92
        WORD wPassiveState;					//0x94
        WORD wPassiveIType;					//0x96
        WORD wPassiveStat1;					//0x98
        WORD wPassiveStat2;					//0x9A
        WORD wPassiveStat3;					//0x9C
        WORD wPassiveStat4;					//0x9E
        WORD wPassiveStat5;					//0xA0
        WORD unk0xA2;						//0xA2
        DWORD dwPassiveCalc1;				//0xA4
        DWORD dwPassiveCalc2;				//0xA8
        DWORD dwPassiveCalc3;				//0xAC
        DWORD dwPassiveCalc4;				//0xB0
        DWORD dwPassiveCalc5;				//0xB4
        WORD wPassiveEvent;					//0xB8
        WORD wPassiveEventFunc;				//0xBA
        WORD wSummon;						//0xBC
        BYTE nPetType;						//0xBE
        BYTE nSumMode;						//0xBF
        DWORD dwPetMax;						//0xC0
        WORD wSumSkill1;					//0xC4
        WORD wSumSkill2;					//0xC6
        WORD wSumSkill3;					//0xC8
        WORD wSumSkill4;					//0xCA
        WORD wSumSkill5;					//0xCC
        WORD unk0xCE;						//0xCE
        DWORD dwSumSkCalc1;					//0xD0
        DWORD dwSumSkCalc2;					//0xD4
        DWORD dwSumSkCalc3;					//0xD8
        DWORD dwSumSkCalc4;					//0xDC
        DWORD dwSumSkCalc5;					//0xE0
        WORD wSumUMod;						//0xE4
        WORD wSumOverlay;					//0xE6
        WORD wCltMissile;					//0xE8
        WORD wCltMissileA;					//0xEA
        WORD wCltMissileB;					//0xEC
        WORD wCltMissileC;					//0xEE
        WORD wCltMissileD;					//0xF0
        WORD wCltStFunc;					//0xF2
        WORD wCltDoFunc;					//0xF4
        WORD wCltPrgFunc1;					//0xF6
        WORD wCltPrgFunc2;					//0xF8
        WORD wCltPrgFunc3;					//0xFA
        WORD wStSound;						//0xFC
        WORD unk0xFE;						//0xFE
        WORD wDoSound;						//0x100
        WORD wDoSoundA;						//0x102
        WORD wDoSoundB;						//0x104
        WORD wCastOverlay;					//0x106
        WORD wTgtOverlay;					//0x108
        WORD wTgtSound;						//0x10A
        WORD wPrgOverlay;					//0x10C
        WORD wPrgSound;						//0x10E
        WORD wCltOverlayA;					//0x110
        WORD wCltOverlayB;					//0x112
        DWORD dwCltCalc1;					//0x114
        DWORD dwCltCalc2;					//0x118
        DWORD dwCltCalc3;					//0x11C
        WORD wItemTarget;					//0x120
        WORD wItemCastSound;				//0x122
        DWORD wItemCastOverlay;				//0x124
        DWORD dwPerDelay;					//0x128
        WORD wMaxLvl;						//0x12C
        WORD wResultFlags;					//0x12E
        DWORD dwHitFlags;					//0x130
        DWORD dwHitClass;					//0x134
        DWORD dwCalc1;						//0x138
        DWORD dwCalc2;						//0x13C
        DWORD dwCalc3;						//0x140
        DWORD dwCalc4;						//0x144
        DWORD dwParam1;						//0x148
        DWORD dwParam2;						//0x14C
        DWORD dwParam3;						//0x150
        DWORD dwParam4;						//0x154
        DWORD dwParam5;						//0x158
        DWORD dwParam6;						//0x15C
        DWORD dwParam7;						//0x160
        DWORD dwParam8;						//0x164
        WORD wWeapSel;						//0x168
        WORD wItemEffect;					//0x16A
        DWORD wItemCltEffect;				//0x16C
        DWORD dwSkPoints;					//0x170
        WORD wReqLevel;						//0x174
        WORD wReqStr;						//0x176
        WORD wReqDex;						//0x178
        WORD wReqInt;						//0x17A
        WORD wReqVit;						//0x17C
        WORD wReqSkill1;					//0x17E
        WORD wReqSkill2;					//0x180
        WORD wReqSkill3;					//0x182
        WORD wStartMana;					//0x184
        WORD wMinMana;						//0x186
        WORD wManaShift;					//0x188
        WORD wMana;							//0x18A
        WORD wLevelMana;					//0x18C
        BYTE nAttackRank;					//0x18E
        BYTE nLineOfSight;					//0x18F
        DWORD dwDelay;						//0x190
        DWORD wSkillDesc;					//0x194
        DWORD dwToHit;						//0x198
        DWORD dwLevToHit;					//0x19C
        DWORD dwToHitCalc;					//0x1A0
        BYTE nToHitShift;					//0x1A4
        BYTE nSrcDam;						//0x1A5
        WORD unk0x1A6;						//0x1A6
        DWORD dwMinDam;						//0x1A8
        DWORD dwMaxDam;						//0x1AC
        DWORD dwMinLvlDam1;					//0x1B0
        DWORD dwMinLvlDam2;					//0x1B4
        DWORD dwMinLvlDam3;					//0x1B8
        DWORD dwMinLvlDam4;					//0x1BC
        DWORD dwMinLvlDam5;					//0x1C0
        DWORD dwMaxLvlDam1;					//0x1C4
        DWORD dwMaxLvlDam2;					//0x1C8
        DWORD dwMaxLvlDam3;					//0x1CC
        DWORD dwMaxLvlDam4;					//0x1D0
        DWORD dwMaxLvlDam5;					//0x1D4
        DWORD dwDmgSymPerCalc;				//0x1D8
        WORD wEType;						//0x1DC
        WORD unk0x1DE;						//0x1DE
        DWORD dwEMin;						//0x1E0
        DWORD dwEMax;						//0x1E4
        DWORD dwEMinLev1;					//0x1E8
        DWORD dwEMinLev2;					//0x1EC
        DWORD dwEMinLev3;					//0x1F0
        DWORD dwEMinLev4;					//0x1F4
        DWORD dwEMinLev5;					//0x1F8
        DWORD dwEMaxLev1;					//0x1FC
        DWORD dwEMaxLev2;					//0x200
        DWORD dwEMaxLev3;					//0x204
        DWORD dwEMaxLev4;					//0x208
        DWORD dwEMaxLev5;					//0x20C
        DWORD dwEDmgSymPerCalc;				//0x210
        DWORD dwELen;						//0x214
        DWORD dwELevLen1;					//0x218
        DWORD dwELevLen2;					//0x21C
        DWORD dwELevLen3;					//0x220
        DWORD dwELenSymPerCalc;				//0x224
        WORD wRestrict;						//0x228
        WORD wState1;						//0x22A
        WORD wState2;						//0x22C
        WORD wState3;						//0x22E
        WORD wAiType;						//0x230
        WORD wAiBonus;						//0x232
        DWORD dwCostMult;					//0x234
        DWORD dwCostAdd;					//0x238
    };

    struct D2SkillDescTxt
    {
        WORD wSkillDesc;					//0x00
        BYTE nSkillPage;					//0x02
        BYTE nSkillRow;						//0x03
        BYTE nSkillColumn;					//0x04
        BYTE nListRow;						//0x05
        BYTE nListPool;						//0x06
        BYTE nIconCel;						//0x07
        WORD wStrName;						//0x08
        WORD wStrShort;						//0x0A
        WORD wStrLong;						//0x0C
        WORD wStrAlt;						//0x0E
        WORD wStrMana;						//0x10
        WORD wDescDam;						//0x12
        WORD wDescAtt;						//0x14
        WORD unk0x16;						//0x16
        DWORD dwDamCalc[2];					//0x18
        BYTE nPrgDamElem[4];				//0x20
        DWORD dwProgDmgMin[3];				//0x24
        DWORD dwProgDmgMax[3];				//0x30
        WORD wDescMissile[3];				//0x3C
        BYTE nDescLine[18];					//0x42
        WORD wDescTextA[17];				//0x54
        WORD wDescTextB[17];				//0x76
        DWORD dwDescCalcA[17];				//0x98
        DWORD dwDescCalcB[17];				//0xDC
    };

    // thx to kambala
    struct SkillTabs {
        BitFieldByte classCode; // 0x00
        BitFieldByte page; // 0x01
        StringIndex tabDescIndex; // 0x02
        BitFieldSkipBytes<2 + 2> _0;
    };

    struct D2SkillCalcTxt {
        union
        {
            DWORD dwCode;					//0x00
            char szCode[4];					//0x00
        };
    };

    // this one is generated by the game from txt and doesnt follow the convention the other bin files do
    // see: https://github.com/andersgong/d2bin2txt/blob/master/bin2txt/skillscode.c
    struct D2SkillsCodeTxt {
        ??
    }
    ```