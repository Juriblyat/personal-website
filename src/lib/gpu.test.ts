import { describe, expect, it } from 'vitest';
import { isSoftwareRenderer } from './gpu';

describe('isSoftwareRenderer', () => {
  it.each([
    'ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero)), SwiftShader driver)',
    'llvmpipe (LLVM 15.0.7, 256 bits)',
    'Microsoft Basic Render Driver',
    'Mesa softpipe',
  ])('flags %s', (r) => expect(isSoftwareRenderer(r)).toBe(true));

  it.each([
    'ANGLE (Apple, ANGLE Metal Renderer: Apple M2, Unspecified Version)',
    'ANGLE (NVIDIA, NVIDIA GeForce RTX 4070 Direct3D11 vs_5_0 ps_5_0, D3D11)',
    'Mali-G78',
    '',
  ])('does not flag %s', (r) => expect(isSoftwareRenderer(r)).toBe(false));
});
