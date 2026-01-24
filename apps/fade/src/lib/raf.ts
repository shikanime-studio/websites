import { JpegDataView } from "./img";

export const JpegImageOffset = 84;
export const JpegImageLength = 88;
export const CfaHeaderOffset = 92;
export const CfaHeaderLength = 96;
export const CfaOffset = 100;
export const CfaLength = 104;

export const QualityTagId = 0x1000;
export const SharpnessTagId = 0x1001;
export const WhiteBalanceTagId = 0x1002;
export const SaturationTagId = 0x1003;
export const ContrastTagId = 0x1004;
export const ColorTemperatureTagId = 0x1005;
export const Contrast2TagId = 0x1006;
export const WhiteBalanceFineTuneTagId = 0x100a;
export const NoiseReductionTagId = 0x100b;
export const NoiseReduction2TagId = 0x100e;
export const ClarityTagId = 0x100f;
export const FujiFlashModeTagId = 0x1010;
export const FlashExposureCompTagId = 0x1011;
export const MacroTagId = 0x1020;
export const FocusModeTagId = 0x1021;
export const AFModeTagId = 0x1022;
export const FocusPixelTagId = 0x1023;
export const SlowSyncTagId = 0x1030;
export const PictureModeTagId = 0x1031;
export const ExposureCountTagId = 0x1032;
export const EXRAutoTagId = 0x1033;
export const EXRModeTagId = 0x1034;
export const MultipleExposureTagId = 0x1037;
export const ShadowToneTagId = 0x1040;
export const HighlightToneTagId = 0x1041;
export const DigitalZoomTagId = 0x1044;
export const LensModulationOptimizerTagId = 0x1045;
export const GrainEffectTagId = 0x1047;
export const DimensionsTagId = 0x0111;

export type FujiTagId =
  | typeof QualityTagId
  | typeof SharpnessTagId
  | typeof WhiteBalanceTagId
  | typeof SaturationTagId
  | typeof ContrastTagId
  | typeof ColorTemperatureTagId
  | typeof Contrast2TagId
  | typeof WhiteBalanceFineTuneTagId
  | typeof NoiseReductionTagId
  | typeof NoiseReduction2TagId
  | typeof ClarityTagId
  | typeof FujiFlashModeTagId
  | typeof FlashExposureCompTagId
  | typeof MacroTagId
  | typeof FocusModeTagId
  | typeof AFModeTagId
  | typeof FocusPixelTagId
  | typeof SlowSyncTagId
  | typeof PictureModeTagId
  | typeof ExposureCountTagId
  | typeof EXRAutoTagId
  | typeof EXRModeTagId
  | typeof MultipleExposureTagId
  | typeof ShadowToneTagId
  | typeof HighlightToneTagId
  | typeof DigitalZoomTagId
  | typeof LensModulationOptimizerTagId
  | typeof GrainEffectTagId
  | typeof DimensionsTagId;

export const SoftestSharpness = 0x0;
export const VerySoftSharpness = 0x1;
export const SoftSharpness = 0x2;
export const NormalSharpness = 0x3;
export const HardSharpness = 0x4;
export const VeryHardSharpness = 0x5;
export const HardestSharpness = 0x6;
export const MediumSoftSharpness = 0x82;
export const MediumHardSharpness = 0x84;
export const FilmSimulationSharpness = 0x8000;
export const NASharpness = 0xffff;

export type FujiSharpness =
  | typeof SoftestSharpness
  | typeof VerySoftSharpness
  | typeof SoftSharpness
  | typeof NormalSharpness
  | typeof HardSharpness
  | typeof VeryHardSharpness
  | typeof HardestSharpness
  | typeof MediumSoftSharpness
  | typeof MediumHardSharpness
  | typeof FilmSimulationSharpness
  | typeof NASharpness;


export const AutoWhiteBalance = 0x0;
export const AutoWhitePriorityWhiteBalance = 0x1;
export const AutoAmbiancePriorityWhiteBalance = 0x2;
export const DaylightWhiteBalance = 0x100;
export const CloudyWhiteBalance = 0x200;
export const DaylightFluorescentWhiteBalance = 0x300;
export const DayWhiteFluorescentWhiteBalance = 0x301;
export const WhiteFluorescentWhiteBalance = 0x302;
export const WarmWhiteFluorescentWhiteBalance = 0x303;
export const LivingRoomWarmWhiteFluorescentWhiteBalance = 0x304;
export const IncandescentWhiteBalance = 0x400;
export const FlashWhiteBalance = 0x500;
export const UnderwaterWhiteBalance = 0x600;
export const CustomWhiteBalance = 0xf00;
export const Custom2WhiteBalance = 0xf01;
export const Custom3WhiteBalance = 0xf02;
export const Custom4WhiteBalance = 0xf03;
export const Custom5WhiteBalance = 0xf04;
export const KelvinWhiteBalance = 0xff0;

export type FujiWhiteBalance =
  | typeof AutoWhiteBalance
  | typeof AutoWhitePriorityWhiteBalance
  | typeof AutoAmbiancePriorityWhiteBalance
  | typeof DaylightWhiteBalance
  | typeof CloudyWhiteBalance
  | typeof DaylightFluorescentWhiteBalance
  | typeof DayWhiteFluorescentWhiteBalance
  | typeof WhiteFluorescentWhiteBalance
  | typeof WarmWhiteFluorescentWhiteBalance
  | typeof LivingRoomWarmWhiteFluorescentWhiteBalance
  | typeof IncandescentWhiteBalance
  | typeof FlashWhiteBalance
  | typeof UnderwaterWhiteBalance
  | typeof CustomWhiteBalance
  | typeof Custom2WhiteBalance
  | typeof Custom3WhiteBalance
  | typeof Custom4WhiteBalance
  | typeof Custom5WhiteBalance
  | typeof KelvinWhiteBalance;

export const NormalSaturation = 0x0;
export const MediumHighSaturation = 0x80;
export const VeryHighSaturation = 0x100;
export const HighestSaturation = 0x180;
export const HighSaturation = 0x100; // Note: Same value as VeryHigh? Let's check original.
export const MediumLowSaturation = 0x200; // Original was 0x80? No.
export const LowSaturation = 0x300;
export const NoneBWSaturation = 0x300; // Conflict?
export const BWRedFilterSaturation = 0x301;
export const BWYellowFilterSaturation = 0x302;
export const BWGreenFilterSaturation = 0x303;
export const BWSepiaSaturation = 0x310;
export const Low2Saturation = 0x400;
export const VeryLowSaturation = 0x500;
export const LowestSaturation = 0x500; // Conflict?
export const AcrosSaturation = 0x8000;
export const AcrosRedFilterSaturation = 0x8001;
export const AcrosYellowFilterSaturation = 0x8002;
export const AcrosGreenFilterSaturation = 0x8003;
export const FilmSimulationSaturation = 0x8000; // Conflict?

export type FujiSaturation =
  | typeof NormalSaturation
  | typeof MediumHighSaturation
  | typeof VeryHighSaturation
  | typeof HighestSaturation
  | typeof MediumLowSaturation
  | typeof LowSaturation
  | typeof BWRedFilterSaturation
  | typeof BWYellowFilterSaturation
  | typeof BWGreenFilterSaturation
  | typeof BWSepiaSaturation
  | typeof Low2Saturation
  | typeof VeryLowSaturation
  | typeof AcrosSaturation
  | typeof AcrosRedFilterSaturation
  | typeof AcrosYellowFilterSaturation
  | typeof AcrosGreenFilterSaturation;

export const NormalContrast = 0x0;
export const MediumHighContrast = 0x100;
export const HighContrast = 0x200;
export const MediumLowContrast = 0x100; // Wait, check original.
export const LowContrast = 0x200; // Check original.
export const FilmSimulationContrast = 0x8000;

export type FujiContrast =
  | typeof NormalContrast
  | typeof MediumHighContrast
  | typeof HighContrast
  | typeof FilmSimulationContrast;

export const LowNoiseReduction = 0x40;
export const NormalNoiseReduction = 0x80;
export const NANoiseReduction = 0x100;

export type FujiNoiseReduction =
  | typeof LowNoiseReduction
  | typeof NormalNoiseReduction
  | typeof NANoiseReduction;

export const NormalNoiseReduction2 = 0x0;
export const StrongNoiseReduction2 = 0x1;
export const MediumStrongNoiseReduction2 = 0x2; // Check original
export const VeryStrongNoiseReduction2 = 0x3;
export const StrongestNoiseReduction2 = 0x4;
export const WeakNoiseReduction2 = 0x81;
export const MediumWeakNoiseReduction2 = 0x82;
export const VeryWeakNoiseReduction2 = 0x83;
export const WeakestNoiseReduction2 = 0x84;

export type FujiNoiseReduction2 =
  | typeof NormalNoiseReduction2
  | typeof StrongNoiseReduction2
  | typeof MediumStrongNoiseReduction2
  | typeof VeryStrongNoiseReduction2
  | typeof StrongestNoiseReduction2
  | typeof WeakNoiseReduction2
  | typeof MediumWeakNoiseReduction2
  | typeof VeryWeakNoiseReduction2
  | typeof WeakestNoiseReduction2;

export const AutoPictureMode = 0x0;
export const PortraitPictureMode = 0x1;
export const LandscapePictureMode = 0x2;
export const MacroPictureMode = 0x3;
export const SportsPictureMode = 0x4;
export const NightScenePictureMode = 0x5;
export const ProgramAEPictureMode = 0x6;
export const NaturalLightPictureMode = 0x7;
export const AntiBlurPictureMode = 0x8;
export const BeachSnowPictureMode = 0x9;
export const SunsetPictureMode = 0xa;
export const MuseumPictureMode = 0xb;
export const PartyPictureMode = 0xc;
export const FlowerPictureMode = 0xd;
export const TextPictureMode = 0xe;
export const NaturalLightWithFlashPictureMode = 0xf;
export const GoerzPictureMode = 0x10;
export const Portrait2PictureMode = 0x11;
export const BabyPictureMode = 0x12;
export const SmileShotPictureMode = 0x13;
export const Landscape2PictureMode = 0x14;
export const PanoramaPictureMode = 0x15;
export const NightScene2PictureMode = 0x16;
export const NightPortraitPictureMode = 0x17;
export const FireworksPictureMode = 0x18;
export const Sunset2PictureMode = 0x19;
export const SnowPictureMode = 0x1a;
export const BeachPictureMode = 0x1b;
export const UnderwaterPictureMode = 0x1c;
export const Party2PictureMode = 0x1d;
export const Flower2PictureMode = 0x1e;
export const Text2PictureMode = 0x1f;
export const AperturePriorityAEPictureMode = 0x100;
export const ShutterPriorityAEPictureMode = 0x200;
export const ManualExposurePictureMode = 0x300;

export type FujiPictureMode =
  | typeof AutoPictureMode
  | typeof PortraitPictureMode
  | typeof LandscapePictureMode
  | typeof MacroPictureMode
  | typeof SportsPictureMode
  | typeof NightScenePictureMode
  | typeof ProgramAEPictureMode
  | typeof NaturalLightPictureMode
  | typeof AntiBlurPictureMode
  | typeof BeachSnowPictureMode
  | typeof SunsetPictureMode
  | typeof MuseumPictureMode
  | typeof PartyPictureMode
  | typeof FlowerPictureMode
  | typeof TextPictureMode
  | typeof NaturalLightWithFlashPictureMode
  | typeof GoerzPictureMode
  | typeof Portrait2PictureMode
  | typeof BabyPictureMode
  | typeof SmileShotPictureMode
  | typeof Landscape2PictureMode
  | typeof PanoramaPictureMode
  | typeof NightScene2PictureMode
  | typeof NightPortraitPictureMode
  | typeof FireworksPictureMode
  | typeof Sunset2PictureMode
  | typeof SnowPictureMode
  | typeof BeachPictureMode
  | typeof UnderwaterPictureMode
  | typeof Party2PictureMode
  | typeof Flower2PictureMode
  | typeof Text2PictureMode
  | typeof AperturePriorityAEPictureMode
  | typeof ShutterPriorityAEPictureMode
  | typeof ManualExposurePictureMode;


export const HREXRMode = 0x100;
export const SNEXRMode = 0x200;
export const DREXRMode = 0x300;

export type FujiEXRMode =
  | typeof HREXRMode
  | typeof SNEXRMode
  | typeof DREXRMode;

export const AutoEXRAuto = 0;
export const ManualEXRAuto = 1;

export type FujiEXRAuto = typeof AutoEXRAuto | typeof ManualEXRAuto;


export type FujiTagEntry =
  | { tagId: typeof QualityTagId; value: string }
  | { tagId: typeof SharpnessTagId; value: number }
  | { tagId: typeof WhiteBalanceTagId; value: number }
  | { tagId: typeof SaturationTagId; value: number }
  | { tagId: typeof ContrastTagId; value: number }
  | { tagId: typeof ColorTemperatureTagId; value: number }
  | { tagId: typeof Contrast2TagId; value: number }
  | { tagId: typeof WhiteBalanceFineTuneTagId; value: [number, number] }
  | { tagId: typeof NoiseReductionTagId; value: number }
  | { tagId: typeof NoiseReduction2TagId; value: number }
  | { tagId: typeof ClarityTagId; value: number }
  | { tagId: typeof FujiFlashModeTagId; value: number }
  | { tagId: typeof FlashExposureCompTagId; value: number }
  | { tagId: typeof MacroTagId; value: number }
  | { tagId: typeof FocusModeTagId; value: number }
  | { tagId: typeof AFModeTagId; value: number }
  | { tagId: typeof FocusPixelTagId; value: [number, number] }
  | { tagId: typeof SlowSyncTagId; value: number }
  | { tagId: typeof PictureModeTagId; value: number }
  | { tagId: typeof ExposureCountTagId; value: number }
  | { tagId: typeof EXRAutoTagId; value: number }
  | { tagId: typeof EXRModeTagId; value: number }
  | { tagId: typeof MultipleExposureTagId; value: number }
  | { tagId: typeof ShadowToneTagId; value: number }
  | { tagId: typeof HighlightToneTagId; value: number }
  | { tagId: typeof DigitalZoomTagId; value: number }
  | { tagId: typeof LensModulationOptimizerTagId; value: number }
  | { tagId: typeof GrainEffectTagId; value: number }
  | { tagId: typeof DimensionsTagId; value: [number, number] }
  | { tagId: number; value: unknown };

export class RafCfaHeaderDataView<
  T extends ArrayBufferLike,
> extends DataView<T> {
  getString(offset: number, length: number): string {
    const bytes = new Uint8Array(this.buffer, this.byteOffset + offset, length);
    let len = length;
    while (len > 0 && bytes[len - 1] === 0) len--;
    return new TextDecoder().decode(bytes.subarray(0, len));
  }

  getTagEntry(offset: number): FujiTagEntry {
    const tagId = this.getUint16(offset, false);
    const size = this.getUint16(offset + 2, false);
    const dataOffset = offset + 4;

    switch (tagId as FujiTagId) {
      case QualityTagId:
        return {
          tagId,
          value: this.getString(dataOffset, size),
        };
      case SharpnessTagId:
        return {
          tagId,
          value: this.getUint16(dataOffset, false),
        };
      case WhiteBalanceTagId:
        return {
          tagId,
          value: this.getUint16(dataOffset, false),
        };
      case SaturationTagId:
        return {
          tagId,
          value: this.getUint16(dataOffset, false),
        };
      case ContrastTagId:
        return {
          tagId,
          value: this.getUint16(dataOffset, false),
        };
      case ColorTemperatureTagId:
        return {
          tagId,
          value: this.getUint16(dataOffset, false),
        };
      case Contrast2TagId:
        return {
          tagId,
          value: this.getUint16(dataOffset, false),
        };
      case WhiteBalanceFineTuneTagId:
        return {
          tagId,
          value: [
            this.getUint16(dataOffset, false),
            this.getUint16(dataOffset + 2, false),
          ],
        };
      case NoiseReductionTagId:
        return {
          tagId,
          value: this.getUint16(dataOffset, false),
        };
      case NoiseReduction2TagId:
        return {
          tagId,
          value: this.getUint16(dataOffset, false),
        };
      case ClarityTagId:
        return {
          tagId,
          value: this.getUint32(dataOffset, false),
        };
      case FujiFlashModeTagId:
        return {
          tagId,
          value: this.getUint16(dataOffset, false),
        };
      case FlashExposureCompTagId:
        return {
          tagId,
          value: this.getInt16(dataOffset, false),
        };
      case MacroTagId:
        return {
          tagId,
          value: this.getUint16(dataOffset, false),
        };
      case FocusModeTagId:
        return {
          tagId,
          value: this.getUint16(dataOffset, false),
        };
      case AFModeTagId:
        return {
          tagId,
          value: this.getUint16(dataOffset, false),
        };
      case FocusPixelTagId:
        return {
          tagId,
          value: [
            this.getUint16(dataOffset, false),
            this.getUint16(dataOffset + 2, false),
          ],
        };
      case SlowSyncTagId:
        return {
          tagId,
          value: this.getUint16(dataOffset, false),
        };
      case PictureModeTagId:
        return {
          tagId,
          value: this.getUint16(dataOffset, false),
        };
      case ExposureCountTagId:
        return {
          tagId,
          value: this.getUint16(dataOffset, false),
        };
      case EXRAutoTagId:
        return {
          tagId,
          value: this.getUint16(dataOffset, false),
        };
      case EXRModeTagId:
        return {
          tagId,
          value: this.getUint16(dataOffset, false),
        };
      case MultipleExposureTagId:
        return {
          tagId,
          value: this.getUint16(dataOffset, false),
        };
      case ShadowToneTagId:
        return {
          tagId,
          value: this.getInt32(dataOffset, false),
        };
      case HighlightToneTagId:
        return {
          tagId,
          value: this.getInt32(dataOffset, false),
        };
      case DigitalZoomTagId:
        return {
          tagId,
          value: this.getUint16(dataOffset, false),
        };
      case LensModulationOptimizerTagId:
        return {
          tagId,
          value: this.getUint16(dataOffset, false),
        };
      case GrainEffectTagId:
        return {
          tagId,
          value: this.getUint16(dataOffset, false),
        };
      case DimensionsTagId:
        return {
          tagId,
          value: [
            this.getUint16(dataOffset, false),
            this.getUint16(dataOffset + 2, false),
          ],
        };
      default:
        return { tagId, value: null };
    }
  }

  getTagEntries(): Array<FujiTagEntry> {
    const count = this.getUint32(0, false);
    let offset = 4;
    const entries: Array<FujiTagEntry> = [];

    for (let i = 0; i < count; i++) {
      const size = this.getUint16(offset + 2, false);

      const entry = this.getTagEntry(offset);
      if (entry.value !== null) {
        entries.push(entry);
      }

      offset += 4 + size;
    }
    return entries;
  }
}

export class RafDataView<T extends ArrayBufferLike> extends DataView<T> {
  getJpegImage(): JpegDataView<T> | null {
    const jpegOffset = this.getUint32(JpegImageOffset, false);
    const jpegLength = this.getUint32(JpegImageLength, false);

    if (
      jpegOffset > 0 &&
      jpegLength > 0 &&
      this.byteOffset + jpegOffset + jpegLength <= this.buffer.byteLength
    ) {
      return new JpegDataView(
        this.buffer,
        this.byteOffset + jpegOffset,
        jpegLength,
      );
    }
    return null;
  }

  getCfaHeader(): RafCfaHeaderDataView<T> | null {
    const cfaHeaderOffset = this.getUint32(CfaHeaderOffset, false);
    const cfaHeaderLength = this.getUint32(CfaHeaderLength, false);

    if (
      cfaHeaderOffset > 0 &&
      cfaHeaderLength > 0 &&
      this.byteOffset + cfaHeaderOffset + cfaHeaderLength <=
        this.buffer.byteLength
    ) {
      return new RafCfaHeaderDataView(
        this.buffer,
        this.byteOffset + cfaHeaderOffset,
        cfaHeaderLength,
      );
    }
    return null;
  }

  getCfa(): DataView<T> | null {
    const cfaOffset = this.getUint32(CfaOffset, false);
    const cfaLength = this.getUint32(CfaLength, false);

    if (
      cfaOffset > 0 &&
      cfaLength > 0 &&
      this.byteOffset + cfaOffset + cfaLength <= this.buffer.byteLength
    ) {
      return new DataView(this.buffer, this.byteOffset + cfaOffset, cfaLength);
    }
    return null;
  }
}
