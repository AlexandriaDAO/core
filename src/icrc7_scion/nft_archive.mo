import ICRC7 "mo:icrc7-mo";
import Principal "mo:base/Principal";
import D "mo:base/Debug";
import Array "mo:base/Array";

module {
  // Define a type for the variable parts of each NFT
  type NFTData = {
    token_id: Nat;
    owner: Principal;
    description: Text;
  };

  public func initialize_nfts(icrc7: ICRC7.ICRC7, caller: Principal) : async () {
    let base_nft : ICRC7.SetNFTItemRequest = {
      created_at_time = null;
      memo = null;
      metadata = #Text(""); // Use an empty string as a placeholder
      override = false;
      owner = null; // This will be overwritten
      token_id = 0; // This will be overwritten
    };

    // Define the variable data for each NFT
    let nft_data : [NFTData] = [
      { token_id = 23_488_611_310_657_419_238_046_794_413_934_876_814_112_419_328_749_130_577_747_181_376_576_938_241_310; owner = Principal.fromText("2vxsx-fae"); description = ""; },
      { token_id = 1_986_593_300_987_535_914_180_049_530_962_874_657_164_380_109_956_141_747_037_709_565_802_331_738_699_840_388_666_345_080_709_091; owner = Principal.fromText("2ljyd-77i5g-ix222-szy7a-ru4cu-ns4j7-kxc2z-oazam-igx3u-uwee6-yqe"); description = ""; },
      { token_id = 1_986_593_300_987_535_914_219_784_576_269_852_932_078_473_115_824_316_056_973_383_662_846_012_025_301_278_355_013_091_370_745_492; owner = Principal.fromText("2ljyd-77i5g-ix222-szy7a-ru4cu-ns4j7-kxc2z-oazam-igx3u-uwee6-yqe"); description = ""; },
      { token_id = 1_187_062_600_132_777_102_544_848_125_420_507_541_412_162_002_674_514_218_872_469_185_259_367_244_674_748_317_650_508_198_888_544; owner = Principal.fromText("2ljyd-77i5g-ix222-szy7a-ru4cu-ns4j7-kxc2z-oazam-igx3u-uwee6-yqe"); description = ""; },
      { token_id = 1_187_062_600_132_777_102_611_949_083_834_065_573_218_135_363_988_447_428_240_577_333_239_052_057_832_598_735_877_615_671_260_056; owner = Principal.fromText("2ljyd-77i5g-ix222-szy7a-ru4cu-ns4j7-kxc2z-oazam-igx3u-uwee6-yqe"); description = ""; },
      { token_id = 1_187_062_600_132_777_102_532_370_141_340_496_438_547_734_781_096_859_498_372_193_100_481_721_394_729_967_491_385_906_154_333_004; owner = Principal.fromText("2ljyd-77i5g-ix222-szy7a-ru4cu-ns4j7-kxc2z-oazam-igx3u-uwee6-yqe"); description = ""; },
      { token_id = 1_187_062_600_132_777_102_547_618_227_151_803_031_785_052_070_501_265_782_648_608_975_324_419_503_729_018_904_514_447_878_763_450; owner = Principal.fromText("2ljyd-77i5g-ix222-szy7a-ru4cu-ns4j7-kxc2z-oazam-igx3u-uwee6-yqe"); description = ""; },
      { token_id = 1_187_062_600_132_777_102_577_623_314_342_865_824_220_666_163_662_453_193_336_504_858_946_855_472_647_654_129_284_947_773_715_152; owner = Principal.fromText("2ljyd-77i5g-ix222-szy7a-ru4cu-ns4j7-kxc2z-oazam-igx3u-uwee6-yqe"); description = ""; },
      { token_id = 1_187_062_600_132_777_102_528_651_783_388_146_101_877_024_108_188_619_635_687_501_313_142_118_774_125_607_197_947_270_400_105_962; owner = Principal.fromText("2ljyd-77i5g-ix222-szy7a-ru4cu-ns4j7-kxc2z-oazam-igx3u-uwee6-yqe"); description = ""; },
      { token_id = 1_187_062_600_132_777_102_551_793_151_036_136_776_223_831_601_613_604_159_977_973_838_819_766_472_777_897_513_804_925_049_181_635; owner = Principal.fromText("2ljyd-77i5g-ix222-szy7a-ru4cu-ns4j7-kxc2z-oazam-igx3u-uwee6-yqe"); description = ""; },
      { token_id = 1_187_062_600_132_777_102_546_473_735_181_710_362_309_052_784_436_171_673_080_399_207_308_304_761_264_474_540_975_431_550_605_961; owner = Principal.fromText("2ljyd-77i5g-ix222-szy7a-ru4cu-ns4j7-kxc2z-oazam-igx3u-uwee6-yqe"); description = ""; },
      { token_id = 1_187_062_600_132_777_102_612_749_827_713_834_157_122_033_320_058_164_855_181_492_750_284_092_974_083_633_875_344_020_427_440_860; owner = Principal.fromText("2ljyd-77i5g-ix222-szy7a-ru4cu-ns4j7-kxc2z-oazam-igx3u-uwee6-yqe"); description = ""; },
      { token_id = 1_187_062_600_132_777_102_604_367_678_125_549_023_447_558_203_964_505_995_664_562_743_996_254_986_642_456_237_643_856_620_869_479; owner = Principal.fromText("2ljyd-77i5g-ix222-szy7a-ru4cu-ns4j7-kxc2z-oazam-igx3u-uwee6-yqe"); description = ""; },
      { token_id = 1_187_062_600_132_777_102_565_529_971_877_656_516_180_853_419_271_495_507_435_049_387_304_342_365_673_055_585_275_667_152_443_008; owner = Principal.fromText("2ljyd-77i5g-ix222-szy7a-ru4cu-ns4j7-kxc2z-oazam-igx3u-uwee6-yqe"); description = ""; },
      { token_id = 1_187_062_600_132_777_102_518_901_632_622_587_014_451_253_270_750_590_770_477_692_873_042_509_600_486_991_106_281_923_131_782_550; owner = Principal.fromText("2ljyd-77i5g-ix222-szy7a-ru4cu-ns4j7-kxc2z-oazam-igx3u-uwee6-yqe"); description = ""; },
      { token_id = 1_187_062_600_132_777_102_517_558_535_754_108_722_362_049_954_041_561_073_333_952_900_658_458_651_687_255_811_271_705_761_381_826; owner = Principal.fromText("2ljyd-77i5g-ix222-szy7a-ru4cu-ns4j7-kxc2z-oazam-igx3u-uwee6-yqe"); description = ""; },
      { token_id = 1_187_062_600_132_777_102_594_799_485_113_240_252_005_655_218_314_058_672_043_172_081_532_057_723_174_411_086_824_172_950_807_177; owner = Principal.fromText("2ljyd-77i5g-ix222-szy7a-ru4cu-ns4j7-kxc2z-oazam-igx3u-uwee6-yqe"); description = ""; },
      { token_id = 1_187_062_600_132_777_102_607_821_582_446_338_262_384_269_713_380_294_551_273_895_136_660_902_486_650_002_796_500_193_305_576_017; owner = Principal.fromText("2ljyd-77i5g-ix222-szy7a-ru4cu-ns4j7-kxc2z-oazam-igx3u-uwee6-yqe"); description = ""; },
      { token_id = 1_187_062_600_132_777_102_514_059_844_913_941_538_111_940_792_901_805_419_069_301_007_737_613_885_524_387_753_861_492_719_999_547; owner = Principal.fromText("2ljyd-77i5g-ix222-szy7a-ru4cu-ns4j7-kxc2z-oazam-igx3u-uwee6-yqe"); description = ""; },
      { token_id = 1_187_062_600_132_777_102_562_404_179_733_517_955_783_853_708_074_239_920_327_567_048_703_070_267_284_494_729_219_386_743_704_107; owner = Principal.fromText("2ljyd-77i5g-ix222-szy7a-ru4cu-ns4j7-kxc2z-oazam-igx3u-uwee6-yqe"); description = ""; },
      { token_id = 1_187_062_600_132_777_102_569_504_015_479_362_416_625_517_857_895_363_942_439_951_708_368_859_016_663_679_380_844_555_732_242_087; owner = Principal.fromText("2ljyd-77i5g-ix222-szy7a-ru4cu-ns4j7-kxc2z-oazam-igx3u-uwee6-yqe"); description = ""; },
      { token_id = 1_187_062_600_132_777_102_553_307_364_466_314_514_076_987_193_068_453_469_042_645_121_681_868_062_769_072_455_387_071_017_885_318; owner = Principal.fromText("2ljyd-77i5g-ix222-szy7a-ru4cu-ns4j7-kxc2z-oazam-igx3u-uwee6-yqe"); description = ""; },
      { token_id = 1_187_062_600_132_777_102_575_190_052_095_248_859_720_782_578_292_368_596_266_023_224_357_695_575_682_930_670_506_267_726_379_747; owner = Principal.fromText("2ljyd-77i5g-ix222-szy7a-ru4cu-ns4j7-kxc2z-oazam-igx3u-uwee6-yqe"); description = ""; },
      { token_id = 1_187_062_600_132_777_102_598_559_479_904_781_172_072_628_535_369_033_062_771_930_355_953_797_419_206_492_634_648_172_355_581_178; owner = Principal.fromText("2ljyd-77i5g-ix222-szy7a-ru4cu-ns4j7-kxc2z-oazam-igx3u-uwee6-yqe"); description = ""; },
      { token_id = 1_187_062_600_132_777_102_572_139_388_596_769_974_671_184_800_402_492_386_917_504_852_049_363_139_782_731_384_477_842_205_491_782; owner = Principal.fromText("2ljyd-77i5g-ix222-szy7a-ru4cu-ns4j7-kxc2z-oazam-igx3u-uwee6-yqe"); description = ""; },
      { token_id = 1_187_062_600_132_777_102_559_909_286_019_253_587_143_735_335_966_955_708_499_559_430_175_208_568_811_493_780_835_668_291_032_735; owner = Principal.fromText("2ljyd-77i5g-ix222-szy7a-ru4cu-ns4j7-kxc2z-oazam-igx3u-uwee6-yqe"); description = ""; },
      { token_id = 789_405_031_334_497_732_914_175_754_029_685_141_044_817_823_604_493_328_046_330_522_336_062_129_501_689_184_862_306_622_813_898; owner = Principal.fromText("e2mqm-f5kv2-wacvn-7sjl2-4wmrn-zumo5-l4g2v-ac752-2vgow-tnd7c-qae"); description = ""; },
      { token_id = 789_405_031_334_497_732_970_387_410_860_866_224_512_604_318_763_091_018_745_659_735_570_759_658_730_833_464_599_470_258_300_816; owner = Principal.fromText("e2mqm-f5kv2-wacvn-7sjl2-4wmrn-zumo5-l4g2v-ac752-2vgow-tnd7c-qae"); description = ""; },
      { token_id = 789_405_031_334_497_732_962_465_122_358_394_773_822_324_909_765_310_031_428_030_696_923_772_792_552_574_009_090_697_493_626_541; owner = Principal.fromText("e2mqm-f5kv2-wacvn-7sjl2-4wmrn-zumo5-l4g2v-ac752-2vgow-tnd7c-qae"); description = ""; },
      { token_id = 789_405_031_334_497_732_996_007_683_808_827_762_133_151_923_143_768_427_455_280_738_516_789_408_833_562_605_870_329_997_700_021; owner = Principal.fromText("e2mqm-f5kv2-wacvn-7sjl2-4wmrn-zumo5-l4g2v-ac752-2vgow-tnd7c-qae"); description = ""; },
      { token_id = 789_405_031_334_497_732_998_791_939_468_815_354_536_276_384_247_960_367_592_615_573_605_455_551_780_210_555_655_596_073_738_039; owner = Principal.fromText("e2mqm-f5kv2-wacvn-7sjl2-4wmrn-zumo5-l4g2v-ac752-2vgow-tnd7c-qae"); description = ""; },
      { token_id = 789_405_031_334_497_732_980_727_989_836_074_341_951_530_679_571_009_368_842_282_823_926_406_608_027_705_414_142_925_254_460_145; owner = Principal.fromText("e2mqm-f5kv2-wacvn-7sjl2-4wmrn-zumo5-l4g2v-ac752-2vgow-tnd7c-qae"); description = ""; },
      { token_id = 789_405_031_334_497_732_935_975_925_406_387_456_328_644_713_863_145_981_723_567_155_002_685_944_272_605_867_467_014_974_808_246; owner = Principal.fromText("e2mqm-f5kv2-wacvn-7sjl2-4wmrn-zumo5-l4g2v-ac752-2vgow-tnd7c-qae"); description = ""; },
      { token_id = 789_405_031_334_497_733_006_322_563_822_116_254_233_919_888_968_710_760_740_303_032_392_770_571_879_415_336_894_632_274_024_413; owner = Principal.fromText("e2mqm-f5kv2-wacvn-7sjl2-4wmrn-zumo5-l4g2v-ac752-2vgow-tnd7c-qae"); description = ""; },
      { token_id = 789_405_031_334_497_732_918_927_799_842_810_921_352_828_526_853_543_976_564_577_293_093_949_884_806_973_858_091_435_410_541_788; owner = Principal.fromText("e2mqm-f5kv2-wacvn-7sjl2-4wmrn-zumo5-l4g2v-ac752-2vgow-tnd7c-qae"); description = ""; },
      { token_id = 789_405_031_334_497_732_984_125_145_726_144_816_040_337_609_944_753_559_759_060_728_893_420_379_570_321_474_987_455_804_787_420; owner = Principal.fromText("e2mqm-f5kv2-wacvn-7sjl2-4wmrn-zumo5-l4g2v-ac752-2vgow-tnd7c-qae"); description = ""; },
      { token_id = 789_405_031_334_497_732_911_846_199_581_367_206_706_236_793_954_526_721_268_025_640_565_420_871_268_681_643_759_044_629_541_901; owner = Principal.fromText("e2mqm-f5kv2-wacvn-7sjl2-4wmrn-zumo5-l4g2v-ac752-2vgow-tnd7c-qae"); description = ""; },
      { token_id = 789_405_031_334_497_733_002_796_843_650_582_386_550_974_025_532_169_251_874_825_716_122_588_380_942_713_294_441_987_104_197_936; owner = Principal.fromText("e2mqm-f5kv2-wacvn-7sjl2-4wmrn-zumo5-l4g2v-ac752-2vgow-tnd7c-qae"); description = ""; },
      { token_id = 789_405_031_334_497_732_990_430_653_689_406_486_717_898_099_667_196_259_783_651_406_279_863_605_815_002_107_922_003_161_549_945; owner = Principal.fromText("e2mqm-f5kv2-wacvn-7sjl2-4wmrn-zumo5-l4g2v-ac752-2vgow-tnd7c-qae"); description = ""; },
      { token_id = 789_405_031_334_497_732_953_419_873_952_540_239_322_957_752_048_549_466_127_662_223_957_047_680_268_383_633_149_104_505_728_813; owner = Principal.fromText("e2mqm-f5kv2-wacvn-7sjl2-4wmrn-zumo5-l4g2v-ac752-2vgow-tnd7c-qae"); description = ""; },
      { token_id = 789_405_031_334_497_732_913_388_174_798_330_866_446_254_704_175_989_684_912_123_402_653_287_824_744_946_799_161_365_566_143_566; owner = Principal.fromText("e2mqm-f5kv2-wacvn-7sjl2-4wmrn-zumo5-l4g2v-ac752-2vgow-tnd7c-qae"); description = ""; },
      { token_id = 789_405_031_334_497_732_913_151_936_509_522_517_545_115_731_558_487_472_186_044_985_413_664_088_127_544_620_872_277_903_769_026; owner = Principal.fromText("e2mqm-f5kv2-wacvn-7sjl2-4wmrn-zumo5-l4g2v-ac752-2vgow-tnd7c-qae"); description = ""; },
      { token_id = 789_405_031_334_497_732_924_245_184_143_559_897_060_089_885_705_546_034_539_593_397_897_324_210_565_896_007_547_842_542_493_162; owner = Principal.fromText("e2mqm-f5kv2-wacvn-7sjl2-4wmrn-zumo5-l4g2v-ac752-2vgow-tnd7c-qae"); description = ""; },
      { token_id = 789_405_031_334_497_732_943_211_627_907_216_826_968_117_848_018_192_181_500_701_060_079_624_940_169_307_714_115_020_021_150_650; owner = Principal.fromText("e2mqm-f5kv2-wacvn-7sjl2-4wmrn-zumo5-l4g2v-ac752-2vgow-tnd7c-qae"); description = ""; },
      { token_id = 789_405_031_334_497_732_903_412_323_092_236_054_885_167_205_962_644_005_467_416_834_430_750_588_393_167_608_073_404_118_163_427; owner = Principal.fromText("e2mqm-f5kv2-wacvn-7sjl2-4wmrn-zumo5-l4g2v-ac752-2vgow-tnd7c-qae"); description = ""; },
      { token_id = 789_405_031_334_497_732_961_123_372_633_070_311_363_919_196_788_421_906_287_141_472_059_547_802_113_344_394_876_239_294_830_208; owner = Principal.fromText("e2mqm-f5kv2-wacvn-7sjl2-4wmrn-zumo5-l4g2v-ac752-2vgow-tnd7c-qae"); description = ""; },
      { token_id = 789_405_031_334_497_732_973_216_715_098_279_619_403_731_941_179_379_592_188_596_943_702_060_909_087_942_938_885_519_916_102_352; owner = Principal.fromText("e2mqm-f5kv2-wacvn-7sjl2-4wmrn-zumo5-l4g2v-ac752-2vgow-tnd7c-qae"); description = ""; },
      { token_id = 789_405_031_334_497_732_990_633_678_243_848_561_498_783_740_854_740_706_416_682_915_992_361_088_591_845_779_925_708_248_836_604; owner = Principal.fromText("e2mqm-f5kv2-wacvn-7sjl2-4wmrn-zumo5-l4g2v-ac752-2vgow-tnd7c-qae"); description = ""; },
      { token_id = 789_405_031_334_497_732_986_986_495_102_153_187_758_352_813_257_653_706_224_955_138_392_021_523_421_688_014_034_802_751_209_681; owner = Principal.fromText("e2mqm-f5kv2-wacvn-7sjl2-4wmrn-zumo5-l4g2v-ac752-2vgow-tnd7c-qae"); description = ""; },
      { token_id = 789_405_031_334_497_732_959_262_584_176_020_301_348_783_968_415_868_214_003_024_416_276_305_945_264_581_371_198_861_044_801_203; owner = Principal.fromText("e2mqm-f5kv2-wacvn-7sjl2-4wmrn-zumo5-l4g2v-ac752-2vgow-tnd7c-qae"); description = ""; },
      { token_id = 789_405_031_334_497_733_004_913_954_800_801_645_568_742_675_660_436_371_206_837_332_290_508_345_889_504_102_529_787_685_740_114; owner = Principal.fromText("e2mqm-f5kv2-wacvn-7sjl2-4wmrn-zumo5-l4g2v-ac752-2vgow-tnd7c-qae"); description = ""; },
      { token_id = 789_405_031_334_497_732_901_642_393_130_971_615_306_588_117_206_811_958_331_067_636_817_965_722_325_731_240_352_340_097_464_876; owner = Principal.fromText("e2mqm-f5kv2-wacvn-7sjl2-4wmrn-zumo5-l4g2v-ac752-2vgow-tnd7c-qae"); description = ""; },
      { token_id = 789_405_031_334_497_732_972_518_950_287_300_202_790_140_546_530_995_993_733_105_179_027_707_933_557_238_784_803_830_969_519_140; owner = Principal.fromText("e2mqm-f5kv2-wacvn-7sjl2-4wmrn-zumo5-l4g2v-ac752-2vgow-tnd7c-qae"); description = ""; },
      { token_id = 789_405_031_334_497_732_925_860_482_307_300_126_542_139_862_293_219_976_009_632_270_844_346_390_475_604_971_308_878_128_452_277; owner = Principal.fromText("e2mqm-f5kv2-wacvn-7sjl2-4wmrn-zumo5-l4g2v-ac752-2vgow-tnd7c-qae"); description = ""; },
      { token_id = 789_405_031_334_497_732_915_956_455_982_050_271_100_264_425_075_587_844_655_537_980_409_656_446_519_972_968_444_478_312_101_917; owner = Principal.fromText("e2mqm-f5kv2-wacvn-7sjl2-4wmrn-zumo5-l4g2v-ac752-2vgow-tnd7c-qae"); description = ""; },
      { token_id = 789_405_031_334_497_732_927_534_703_629_384_686_094_334_851_637_317_103_651_963_029_441_174_249_745_107_395_034_854_423_252_089; owner = Principal.fromText("e2mqm-f5kv2-wacvn-7sjl2-4wmrn-zumo5-l4g2v-ac752-2vgow-tnd7c-qae"); description = ""; },
      { token_id = 789_405_031_334_497_732_935_307_418_892_408_219_421_614_237_538_267_960_402_528_748_852_910_270_384_800_983_124_409_504_365_492; owner = Principal.fromText("e2mqm-f5kv2-wacvn-7sjl2-4wmrn-zumo5-l4g2v-ac752-2vgow-tnd7c-qae"); description = ""; },
      { token_id = 789_405_031_334_497_732_967_270_980_205_067_582_924_103_412_135_951_831_777_040_629_450_220_676_583_120_007_170_851_671_817_794; owner = Principal.fromText("e2mqm-f5kv2-wacvn-7sjl2-4wmrn-zumo5-l4g2v-ac752-2vgow-tnd7c-qae"); description = ""; },
      { token_id = 789_405_031_334_497_732_912_482_500_191_641_648_321_506_763_130_629_439_352_521_680_660_755_685_971_434_623_920_990_360_481_122; owner = Principal.fromText("e2mqm-f5kv2-wacvn-7sjl2-4wmrn-zumo5-l4g2v-ac752-2vgow-tnd7c-qae"); description = ""; },
      { token_id = 789_405_031_334_497_732_928_056_275_327_870_639_131_189_332_776_271_040_084_504_300_151_099_794_276_179_199_106_489_013_012_112; owner = Principal.fromText("e2mqm-f5kv2-wacvn-7sjl2-4wmrn-zumo5-l4g2v-ac752-2vgow-tnd7c-qae"); description = ""; },
      { token_id = 789_405_031_334_497_732_979_247_371_945_797_481_229_038_576_446_788_950_229_756_221_870_015_271_188_096_396_206_770_967_412_893; owner = Principal.fromText("e2mqm-f5kv2-wacvn-7sjl2-4wmrn-zumo5-l4g2v-ac752-2vgow-tnd7c-qae"); description = ""; },
      { token_id = 789_405_031_334_497_732_981_444_306_323_402_133_499_941_535_066_484_670_901_666_725_165_434_537_669_147_334_793_790_778_144_919; owner = Principal.fromText("e2mqm-f5kv2-wacvn-7sjl2-4wmrn-zumo5-l4g2v-ac752-2vgow-tnd7c-qae"); description = ""; },
      { token_id = 789_405_031_334_497_732_954_624_038_521_394_997_862_451_013_962_476_965_428_739_462_263_958_182_021_612_950_370_034_559_460_882; owner = Principal.fromText("e2mqm-f5kv2-wacvn-7sjl2-4wmrn-zumo5-l4g2v-ac752-2vgow-tnd7c-qae"); description = ""; },
      { token_id = 789_405_031_334_497_732_973_802_172_195_955_311_949_946_148_262_498_254_912_838_584_974_798_393_673_866_387_886_954_091_399_888; owner = Principal.fromText("e2mqm-f5kv2-wacvn-7sjl2-4wmrn-zumo5-l4g2v-ac752-2vgow-tnd7c-qae"); description = ""; },
      { token_id = 789_405_031_334_497_732_970_866_007_925_670_339_122_795_133_172_257_155_124_493_632_211_495_465_563_390_176_944_151_327_997_355; owner = Principal.fromText("e2mqm-f5kv2-wacvn-7sjl2-4wmrn-zumo5-l4g2v-ac752-2vgow-tnd7c-qae"); description = ""; },
      { token_id = 789_405_031_334_497_732_990_935_783_658_342_908_171_388_298_478_610_782_978_465_174_259_072_583_633_894_997_983_597_274_724_032; owner = Principal.fromText("e2mqm-f5kv2-wacvn-7sjl2-4wmrn-zumo5-l4g2v-ac752-2vgow-tnd7c-qae"); description = ""; },
      { token_id = 789_405_031_334_497_732_964_577_080_260_236_968_347_574_998_983_732_254_789_853_975_309_214_081_062_098_669_114_213_213_659_279; owner = Principal.fromText("e2mqm-f5kv2-wacvn-7sjl2-4wmrn-zumo5-l4g2v-ac752-2vgow-tnd7c-qae"); description = ""; },
      { token_id = 789_405_031_334_497_732_939_768_954_228_034_152_649_589_030_212_364_755_487_244_063_108_772_278_429_776_080_559_856_814_861_805; owner = Principal.fromText("e2mqm-f5kv2-wacvn-7sjl2-4wmrn-zumo5-l4g2v-ac752-2vgow-tnd7c-qae"); description = ""; },
      { token_id = 789_405_031_334_497_732_943_620_122_252_873_265_326_714_885_845_983_989_370_107_204_409_854_934_492_150_231_139_586_044_618_026; owner = Principal.fromText("e2mqm-f5kv2-wacvn-7sjl2-4wmrn-zumo5-l4g2v-ac752-2vgow-tnd7c-qae"); description = ""; },
      { token_id = 789_405_031_334_497_732_991_302_603_715_591_871_645_728_521_820_988_698_450_143_620_186_515_113_946_406_444_432_665_794_572_625; owner = Principal.fromText("e2mqm-f5kv2-wacvn-7sjl2-4wmrn-zumo5-l4g2v-ac752-2vgow-tnd7c-qae"); description = ""; },
      { token_id = 789_405_031_334_497_732_996_010_452_026_138_165_217_392_210_950_726_501_198_295_861_688_657_399_089_134_633_173_179_148_848_824; owner = Principal.fromText("e2mqm-f5kv2-wacvn-7sjl2-4wmrn-zumo5-l4g2v-ac752-2vgow-tnd7c-qae"); description = ""; },
      { token_id = 789_405_031_334_497_732_928_991_270_823_400_314_907_052_086_721_551_800_740_974_569_159_638_964_622_835_427_934_165_070_303_309; owner = Principal.fromText("e2mqm-f5kv2-wacvn-7sjl2-4wmrn-zumo5-l4g2v-ac752-2vgow-tnd7c-qae"); description = ""; },
      { token_id = 789_405_031_334_497_732_935_437_570_059_054_908_986_239_692_711_790_391_332_134_935_914_751_344_414_916_545_736_303_682_760_398; owner = Principal.fromText("e2mqm-f5kv2-wacvn-7sjl2-4wmrn-zumo5-l4g2v-ac752-2vgow-tnd7c-qae"); description = ""; },
      { token_id = 789_405_031_334_497_732_921_279_864_609_127_575_154_712_823_586_777_012_991_506_941_202_382_312_480_997_515_894_661_710_933_109; owner = Principal.fromText("e2mqm-f5kv2-wacvn-7sjl2-4wmrn-zumo5-l4g2v-ac752-2vgow-tnd7c-qae"); description = ""; },
      { token_id = 789_405_031_334_497_732_953_687_272_601_807_203_733_446_280_451_823_645_945_896_475_766_928_422_090_484_389_983_873_539_909_070; owner = Principal.fromText("e2mqm-f5kv2-wacvn-7sjl2-4wmrn-zumo5-l4g2v-ac752-2vgow-tnd7c-qae"); description = ""; },
    ];

    let initial_nfts = Array.map<NFTData, ICRC7.SetNFTItemRequest>(
      nft_data,
      func (data: NFTData) : ICRC7.SetNFTItemRequest {
        {
          base_nft with
          token_id = data.token_id;
          owner = ?{owner = data.owner; subaccount = null;};
          metadata = #Map([("description", #Text(data.description))]);
        }
      }
    );

    let set_nft_request : ICRC7.SetNFTRequest = initial_nfts;

    switch(icrc7.set_nfts<system>(caller, set_nft_request, true)){
      case(#ok(val)) D.print("Successfully initialized NFTs: " # debug_show(val));
      case(#err(err)) D.trap("Failed to initialize NFTs: " # err);
    };
  };
}
