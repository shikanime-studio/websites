import { JpegDataView } from "./img";

export const RafOffset = {
  JpegImageOffset: 84,
  JpegImageLength: 88,
  CfaHeaderOffset: 92,
  CfaHeaderLength: 96,
  CfaOffset: 100,
  CfaLength: 104,
} as const;

export enum FujiTagId {
  Quality = 0x1000,
  Sharpness = 0x1001,
  WhiteBalance = 0x1002,
  Saturation = 0x1003,
  Contrast = 0x1004,
  ColorTemperature = 0x1005,
  Contrast2 = 0x1006,
  WhiteBalanceFineTune = 0x100a,
  NoiseReduction = 0x100b,
  NoiseReduction2 = 0x100e,
  Clarity = 0x100f,
  FujiFlashMode = 0x1010,
  FlashExposureComp = 0x1011,
  Macro = 0x1020,
  FocusMode = 0x1021,
  AFMode = 0x1022,
  FocusPixel = 0x1023,
  SlowSync = 0x1030,
  PictureMode = 0x1031,
  ExposureCount = 0x1032,
  EXRAuto = 0x1033,
  EXRMode = 0x1034,
  MultipleExposure = 0x1037,
  ShadowTone = 0x1040,
  HighlightTone = 0x1041,
  DigitalZoom = 0x1044,
  LensModulationOptimizer = 0x1045,
  GrainEffect = 0x1047,
  Dimensions = 0x0111,
}

export enum FujiSharpness {
  Softest = 0x0,
  VerySoft = 0x1,
  Soft = 0x2,
  Normal = 0x3,
  Hard = 0x4,
  VeryHard = 0x5,
  Hardest = 0x6,
  MediumSoft = 0x82,
  MediumHard = 0x84,
  FilmSimulation = 0x8000,
  NA = 0xffff,
}

export enum FujiWhiteBalance {
  Auto = 0x0,
  AutoWhitePriority = 0x1,
  AutoAmbiancePriority = 0x2,
  Daylight = 0x100,
  Cloudy = 0x200,
  DaylightFluorescent = 0x300,
  DayWhiteFluorescent = 0x301,
  WhiteFluorescent = 0x302,
  WarmWhiteFluorescent = 0x303,
  LivingRoomWarmWhiteFluorescent = 0x304,
  Incandescent = 0x400,
  Flash = 0x500,
  Underwater = 0x600,
  Custom = 0xf00,
  Custom2 = 0xf01,
  Custom3 = 0xf02,
  Custom4 = 0xf03,
  Custom5 = 0xf04,
  Kelvin = 0xff0,
}

export enum FujiSaturation {
  Normal = 0x0,
  MediumHigh = 0x80,
  VeryHigh = 0xc0,
  Highest = 0xe0,
  High = 0x100,
  MediumLow = 0x180,
  Low = 0x200,
  NoneBW = 0x300,
  BWRedFilter = 0x301,
  BWYellowFilter = 0x302,
  BWGreenFilter = 0x303,
  BWSepia = 0x310,
  Low2 = 0x400,
  VeryLow = 0x4c0,
  Lowest = 0x4e0,
  Acros = 0x500,
  AcrosRedFilter = 0x501,
  AcrosYellowFilter = 0x502,
  AcrosGreenFilter = 0x503,
  FilmSimulation = 0x8000,
}

export enum FujiContrast {
  Normal = 0x0,
  MediumHigh = 0x80,
  High = 0x100,
  MediumLow = 0x180,
  Low = 0x200,
  FilmSimulation = 0x8000,
}

export enum FujiNoiseReduction {
  Low = 0x40,
  Normal = 0x80,
  NA = 0x100,
}

export enum FujiNoiseReduction2 {
  Normal = 0x0,
  Strong = 0x100,
  MediumStrong = 0x180,
  VeryStrong = 0x1c0,
  Strongest = 0x1e0,
  Weak = 0x200,
  MediumWeak = 0x280,
  VeryWeak = 0x2c0,
  Weakest = 0x2e0,
}

export enum FujiPictureMode {
  Auto = 0x0,
  Portrait = 0x1,
  Landscape = 0x2,
  Macro = 0x3,
  Sports = 0x4,
  NightScene = 0x5,
  ProgramAE = 0x6,
  NaturalLight = 0x7,
  AntiBlur = 0x8,
  BeachSnow = 0x9,
  Sunset = 0xa,
  Museum = 0xb,
  Party = 0xc,
  Flower = 0xd,
  Text = 0xe,
  NaturalLightFlash = 0xf,
  Beach = 0x10,
  Snow = 0x11,
  Fireworks = 0x12,
  Underwater = 0x13,
  PortraitSkinCorrection = 0x14,
  Panorama = 0x16,
  NightTripod = 0x17,
  ProLowLight = 0x18,
  ProFocus = 0x19,
  Portrait2 = 0x1a,
  DogFaceDetection = 0x1b,
  CatFaceDetection = 0x1c,
  HDR = 0x30,
  AdvancedFilter = 0x40,
  AperturePriorityAE = 0x100,
  ShutterSpeedPriorityAE = 0x200,
  Manual = 0x300,
}

export enum FujiEXRMode {
  HR = 0x100,
  SN = 0x200,
  DR = 0x300,
}

export enum FujiEXRAuto {
  Auto = 0,
  Manual = 1,
}

export type FujiTagEntry =
  | { tagId: FujiTagId.Quality; value: string }
  | { tagId: FujiTagId.Sharpness; value: string | number }
  | { tagId: FujiTagId.WhiteBalance; value: string | number }
  | { tagId: FujiTagId.Saturation; value: string | number }
  | { tagId: FujiTagId.Contrast; value: string | number }
  | { tagId: FujiTagId.ColorTemperature; value: number }
  | { tagId: FujiTagId.Contrast2; value: number }
  | { tagId: FujiTagId.WhiteBalanceFineTune; value: [number, number] }
  | { tagId: FujiTagId.NoiseReduction; value: string | number }
  | { tagId: FujiTagId.NoiseReduction2; value: string | number }
  | { tagId: FujiTagId.Clarity; value: number }
  | { tagId: FujiTagId.FujiFlashMode; value: number }
  | { tagId: FujiTagId.FlashExposureComp; value: number }
  | { tagId: FujiTagId.Macro; value: number }
  | { tagId: FujiTagId.FocusMode; value: number }
  | { tagId: FujiTagId.AFMode; value: number }
  | { tagId: FujiTagId.FocusPixel; value: [number, number] }
  | { tagId: FujiTagId.SlowSync; value: number }
  | { tagId: FujiTagId.PictureMode; value: string | number }
  | { tagId: FujiTagId.ExposureCount; value: number }
  | { tagId: FujiTagId.EXRAuto; value: string | number }
  | { tagId: FujiTagId.EXRMode; value: string | number }
  | { tagId: FujiTagId.MultipleExposure; value: number }
  | { tagId: FujiTagId.ShadowTone; value: number }
  | { tagId: FujiTagId.HighlightTone; value: number }
  | { tagId: FujiTagId.DigitalZoom; value: number }
  | { tagId: FujiTagId.LensModulationOptimizer; value: number }
  | { tagId: FujiTagId.GrainEffect; value: number }
  | { tagId: FujiTagId.Dimensions; value: [number, number] }
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
      case FujiTagId.Quality:
        return {
          tagId,
          value: this.getString(dataOffset, size),
        };
      case FujiTagId.Sharpness: {
        const val = this.getUint16(dataOffset, false);
        return {
          tagId,
          value: FujiSharpness[val] || val,
        };
      }
      case FujiTagId.WhiteBalance: {
        const val = this.getUint16(dataOffset, false);
        return {
          tagId,
          value: FujiWhiteBalance[val] || val,
        };
      }
      case FujiTagId.Saturation: {
        const val = this.getUint16(dataOffset, false);
        return {
          tagId,
          value: FujiSaturation[val] || val,
        };
      }
      case FujiTagId.Contrast: {
        const val = this.getUint16(dataOffset, false);
        return {
          tagId,
          value: FujiContrast[val] || val,
        };
      }
      case FujiTagId.ColorTemperature:
        return {
          tagId,
          value: this.getUint16(dataOffset, false),
        };
      case FujiTagId.Contrast2:
        return {
          tagId,
          value: this.getUint16(dataOffset, false),
        };
      case FujiTagId.WhiteBalanceFineTune:
        return {
          tagId,
          value: [
            this.getInt32(dataOffset, false),
            this.getInt32(dataOffset + 4, false),
          ],
        };
      case FujiTagId.NoiseReduction: {
        const val = this.getUint16(dataOffset, false);
        return {
          tagId,
          value: FujiNoiseReduction[val] || val,
        };
      }
      case FujiTagId.NoiseReduction2: {
        const val = this.getUint16(dataOffset, false);
        return {
          tagId,
          value: FujiNoiseReduction2[val] || val,
        };
      }
      case FujiTagId.Clarity:
        return {
          tagId,
          value: this.getInt32(dataOffset, false),
        };
      case FujiTagId.FujiFlashMode:
        return {
          tagId,
          value: this.getUint16(dataOffset, false),
        };
      case FujiTagId.FlashExposureComp:
        return {
          tagId,
          value:
            this.getInt32(dataOffset, false) /
            this.getInt32(dataOffset + 4, false),
        };
      case FujiTagId.Macro:
        return {
          tagId,
          value: this.getUint16(dataOffset, false),
        };
      case FujiTagId.FocusMode:
        return {
          tagId,
          value: this.getUint16(dataOffset, false),
        };
      case FujiTagId.AFMode:
        return {
          tagId,
          value: this.getUint16(dataOffset, false),
        };
      case FujiTagId.FocusPixel:
        return {
          tagId,
          value: [
            this.getUint16(dataOffset, false),
            this.getUint16(dataOffset + 2, false),
          ],
        };
      case FujiTagId.SlowSync:
        return {
          tagId,
          value: this.getUint16(dataOffset, false),
        };
      case FujiTagId.PictureMode: {
        const val = this.getUint16(dataOffset, false);
        return {
          tagId,
          value: FujiPictureMode[val] || val,
        };
      }
      case FujiTagId.ExposureCount:
        return {
          tagId,
          value: this.getUint16(dataOffset, false),
        };
      case FujiTagId.EXRAuto: {
        const val = this.getUint16(dataOffset, false);
        return {
          tagId,
          value: FujiEXRAuto[val] || val,
        };
      }
      case FujiTagId.EXRMode: {
        const val = this.getUint16(dataOffset, false);
        return {
          tagId,
          value: FujiEXRMode[val] || val,
        };
      }
      case FujiTagId.MultipleExposure:
        return {
          tagId,
          value: this.getUint16(dataOffset, false),
        };
      case FujiTagId.ShadowTone:
        return {
          tagId,
          value: this.getInt32(dataOffset, false),
        };
      case FujiTagId.HighlightTone:
        return {
          tagId,
          value: this.getInt32(dataOffset, false),
        };
      case FujiTagId.DigitalZoom:
        return {
          tagId,
          value: this.getUint32(dataOffset, false),
        };
      case FujiTagId.LensModulationOptimizer:
        return {
          tagId,
          value: this.getUint32(dataOffset, false),
        };
      case FujiTagId.GrainEffect:
        return {
          tagId,
          value: this.getUint16(dataOffset, false),
        };
      case FujiTagId.Dimensions:
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
    const jpegOffset = this.getUint32(RafOffset.JpegImageOffset, false);
    const jpegLength = this.getUint32(RafOffset.JpegImageLength, false);

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
    const headerOffset = this.getUint32(RafOffset.CfaHeaderOffset, false);
    const headerLength = this.getUint32(RafOffset.CfaHeaderLength, false);

    if (
      headerOffset > 0 &&
      headerLength > 0 &&
      this.byteOffset + headerOffset + headerLength <= this.buffer.byteLength
    ) {
      return new RafCfaHeaderDataView(
        this.buffer,
        this.byteOffset + headerOffset,
        headerLength,
      );
    }
    return null;
  }

  getCfa(): Uint16Array | null {
    const cfaOffset = this.getUint32(RafOffset.CfaOffset, false);
    const cfaLength = this.getUint32(RafOffset.CfaLength, false);

    if (
      cfaOffset > 0 &&
      cfaLength > 0 &&
      this.byteOffset + cfaOffset + cfaLength <= this.buffer.byteLength
    ) {
      return new Uint16Array(
        this.buffer.slice(
          this.byteOffset + cfaOffset,
          this.byteOffset + cfaOffset + cfaLength,
        ),
      );
    }
    return null;
  }
}
