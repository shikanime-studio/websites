import { describe, it, expect } from "vitest";
import { demosaic, detectCfaPattern, CfaPattern } from "./demosaic";

describe("demosaic", () => {
  describe("normalizeRaw", () => {
    it("normalizes 16-bit values correctly", () => {
      // 2x2 RGGB: R(0xffff) G(0) / G(0) B(0)
      const cfa = new Uint16Array([0xffff, 0x0000, 0x0000, 0x0000]);
      const result = demosaic(cfa, 2, 2, CfaPattern.Rggb, 16);
      expect(result.pixels[0]).toBe(255); // R at 0xffff -> 255
    });

    it("normalizes 14-bit values correctly", () => {
      // 14-bit: 0x3fff -> 255
      const cfa = new Uint16Array([0x3fff, 0x0000, 0x0000, 0x0000]);
      const result = demosaic(cfa, 2, 2, CfaPattern.Rggb, 14);
      expect(result.pixels[0]).toBe(255); // R at 0x3fff -> 255
    });

    it("normalizes 8-bit values correctly", () => {
      const cfa = new Uint16Array([255, 0, 0, 128]);
      const result = demosaic(cfa, 2, 2, CfaPattern.Rggb, 8);
      expect(result.pixels[0]).toBe(255); // R=255
      const bPxIdx = 3 * 3; // B at position 3
      expect(result.pixels[bPxIdx + 2]).toBe(128); // B=128
    });
  });

  describe("RGGB Bayer pattern", () => {
    it("produces correct dimensions", () => {
      const cfa = new Uint16Array(20 * 20);
      const result = demosaic(cfa, 20, 20, CfaPattern.Rggb, 16);
      expect(result.width).toBe(20);
      expect(result.height).toBe(20);
      expect(result.pixels.length).toBe(20 * 20 * 3);
    });

    it("correctly demosaics a pure R pixel at corner", () => {
      // RGGB 2x2:
      // R G
      // G B
      const cfa = new Uint16Array([0xffff, 0x0000, 0x0000, 0x0000]);
      const result = demosaic(cfa, 2, 2, CfaPattern.Rggb, 16);

      // R at (0,0) should be 255
      expect(result.pixels[0]).toBe(255);
      // G: horizontal neighbors (x-1,OOB→fallback to rawR=0xffff) and (x+1,G=0)
      // Average = 32767 → normalize → 127
      expect(result.pixels[1]).toBe(127);
      // B: vertical neighbors (0,y-1→OOB→0) and (0,1→G=0) → B=0
      expect(result.pixels[2]).toBe(0);
    });

    it("correctly demosaics a pure B pixel at bottom-right", () => {
      // RGGB 2x2:
      // R G
      // G B(0xffff)
      const cfa = new Uint16Array([0x0000, 0x0000, 0x0000, 0xffff]);
      const result = demosaic(cfa, 2, 2, CfaPattern.Rggb, 16);

      // B at (1,1) should be 255
      const bPxIdx = 3 * 3;
      expect(result.pixels[bPxIdx + 2]).toBe(255);
    });

    it("interpolates R from horizontal neighbors for G at (odd, even)", () => {
      // 4x4 RGGB:
      // R(0xffff) G(0) R(0xffff) G(0)
      // G(0)      B(0) G(0)      B(0)
      // ...
      const cfa = new Uint16Array(16);
      cfa[0] = 0xffff; // R at (0,0)
      cfa[2] = 0xffff; // R at (2,0)
      const result = demosaic(cfa, 4, 4, CfaPattern.Rggb, 16);

      // G at (1,0): R from horizontal neighbors (0,0)=0xffff and (2,0)=0xffff
      const gPxIdx = 1 * 3;
      expect(result.pixels[gPxIdx + 0]).toBe(255); // R
      expect(result.pixels[gPxIdx + 1]).toBe(0); // G
      expect(result.pixels[gPxIdx + 2]).toBe(0); // B
    });

    it("interpolates R from vertical neighbors for G at (even, odd)", () => {
      // 4x4 RGGB:
      // R(0) G(0) R(0) G(0)
      // G(0) B(0) G(0) B(0)
      // R(0xffff) G(0) R(0) G(0)
      // ...
      const cfa = new Uint16Array(16);
      cfa[2 * 4 + 0] = 0xffff; // R at (0,2)
      cfa[2 * 4 + 2] = 0xffff; // R at (2,2)
      const result = demosaic(cfa, 4, 4, CfaPattern.Rggb, 16);

      // G at (0,1): R from vertical neighbors (0,0)=0 and (0,2)=0xffff
      // Average = 0xffff/2 ≈ 32767 → normalize → ~128
      const gPxIdx = (1 * 4 + 0) * 3;
      // R should be normalized from average of 0 and 0xffff
      expect(result.pixels[gPxIdx + 0]).toBeGreaterThan(0);
      expect(result.pixels[gPxIdx + 0]).toBeLessThan(255); // not full, since one neighbor is 0
    });

    it("interpolates B from vertical neighbors for G at (odd, even)", () => {
      // 4x4 RGGB:
      // R(0) G(0) R(0) G(0)
      // G(0) B(0xffff) G(0) B(0)
      // ...
      const cfa = new Uint16Array(16);
      cfa[1 * 4 + 1] = 0xffff; // B at (1,1)
      const result = demosaic(cfa, 4, 4, CfaPattern.Rggb, 16);

      // G at (1,0): B from vertical neighbors (1,-1)=OOB→fallback and (1,1)=0xffff
      const gPxIdx = 1 * 3;
      // B = normalizeRaw((0 + 0xffff) / 2) ≈ normalizeRaw(32767) ≈ 128
      expect(result.pixels[gPxIdx + 2]).toBeGreaterThan(0);
    });

    it("interpolates B from horizontal neighbors for G at (even, odd)", () => {
      // 4x4 RGGB:
      // R(0) G(0) R(0) G(0)
      // G(0) B(0) B(0) G(0)  ← wait, (1,1) and (3,1) are both B
      // ...
      const cfa = new Uint16Array(16);
      cfa[1 * 4 + 1] = 0xffff; // B at (1,1)
      cfa[1 * 4 + 3] = 0xffff; // B at (3,1)
      const result = demosaic(cfa, 4, 4, CfaPattern.Rggb, 16);

      // G at (2,1): B from horizontal neighbors (1,1)=0xffff and (3,1)=0xffff
      const gPxIdx = (1 * 4 + 2) * 3;
      expect(result.pixels[gPxIdx + 2]).toBe(255); // B
    });

    it("interpolates R from vertical neighbors for B pixel at (odd, odd)", () => {
      // 4x4 RGGB:
      // R(0xffff) G(0) R(0)    G(0)
      // G(0)      B(0) G(0)    B(0)
      // R(0)      G(0) R(0xffff) G(0)
      // G(0)      B(0) G(0)    B(0)
      const cfa = new Uint16Array(16);
      cfa[0] = 0xffff;       // R at (0,0)
      cfa[2 * 4 + 2] = 0xffff; // R at (2,2)
      const result = demosaic(cfa, 4, 4, CfaPattern.Rggb, 16);

      // B at (1,1): R from vertical neighbors (1,0)=G and (1,2)=G — both 0
      // R should be 0 since both neighbors are 0
      const bPxIdx = (1 * 4 + 1) * 3;
      expect(result.pixels[bPxIdx + 0]).toBe(0); // R
      expect(result.pixels[bPxIdx + 2]).toBe(0); // B (raw, 0)
    });

    it("clamps out-of-bounds access without crashing", () => {
      const cfa = new Uint16Array([0xffff, 0x0000, 0x8000, 0x8000]);
      const result = demosaic(cfa, 2, 2, CfaPattern.Rggb, 16);
      expect(result.pixels.length).toBe(4 * 3);
    });

    it("handles 1x1 edge case", () => {
      const cfa = new Uint16Array([0xffff]);
      const result = demosaic(cfa, 1, 1, CfaPattern.Rggb, 16);
      expect(result.width).toBe(1);
      expect(result.height).toBe(1);
      expect(result.pixels.length).toBe(3);
      expect(result.pixels[0]).toBe(255); // R
    });
  });

  describe("detectCfaPattern", () => {
    it("detects Fuji as RGGB", () => {
      expect(detectCfaPattern("Fujifilm")).toBe(CfaPattern.Rggb);
      expect(detectCfaPattern("FUJIFILM")).toBe(CfaPattern.Rggb);
    });

    it("detects Sony as RGGB", () => {
      expect(detectCfaPattern("Sony")).toBe(CfaPattern.Rggb);
      expect(detectCfaPattern("SONY")).toBe(CfaPattern.Rggb);
    });

    it("returns Rggb for unknown make", () => {
      expect(detectCfaPattern("Canon")).toBe(CfaPattern.Rggb);
      expect(detectCfaPattern(null)).toBe(CfaPattern.Rggb);
    });
  });

  describe("Fujifilm-specific demosaic", () => {
    it("demosaics Fujifilm RAF data correctly", () => {
      const cfa = new Uint16Array(4 * 4);
      cfa[0] = 0xffff; // R at (0,0)
      const result = demosaic(cfa, 4, 4, CfaPattern.Rggb, 16, "Fujifilm");
      expect(result.pixels[0]).toBe(255); // R
      expect(result.width).toBe(4);
      expect(result.height).toBe(4);
    });
  });

  describe("Sony-specific demosaic", () => {
    it("demosaics Sony ARW data correctly", () => {
      const cfa = new Uint16Array(4 * 4);
      cfa[0] = 0xffff; // R at (0,0)
      const result = demosaic(cfa, 4, 4, CfaPattern.Rggb, 16, "Sony");
      expect(result.pixels[0]).toBe(255); // R
      expect(result.width).toBe(4);
      expect(result.height).toBe(4);
    });
  });

  describe("edge cases", () => {
    it("handles all-zero CFA", () => {
      const cfa = new Uint16Array(4 * 4);
      const result = demosaic(cfa, 4, 4, CfaPattern.Rggb, 16);
      for (let i = 0; i < result.pixels.length; i++) {
        expect(result.pixels[i]).toBe(0);
      }
    });

    it("handles all-max CFA", () => {
      // Use a 4x4 with all max — interior pixels should all be 255
      const cfa = new Uint16Array(4 * 4).fill(0xffff);
      const result = demosaic(cfa, 4, 4, CfaPattern.Rggb, 16);
      // Interior R pixel at (2,2): all neighbors are 0xffff
      const rPxIdx = (2 * 4 + 2) * 3;
      expect(result.pixels[rPxIdx + 0]).toBe(255); // R
      expect(result.pixels[rPxIdx + 1]).toBe(255); // G (neighbors also 0xffff)
      expect(result.pixels[rPxIdx + 2]).toBe(255); // B (neighbors also 0xffff)
    });

    it("handles Unknown pattern as fallback to RGGB", () => {
      const cfa = new Uint16Array([0xffff, 0x0000, 0x0000, 0x8000]);
      const result = demosaic(cfa, 2, 2, CfaPattern.Unknown, 16);
      expect(result.pixels.length).toBe(4 * 3);
    });
  });
});
