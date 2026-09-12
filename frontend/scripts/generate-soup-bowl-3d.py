#!/usr/bin/env python3
"""
3D Model Generator for Soup Bowl (FINE MODEL F&B Tableware)
Generates:
1. .glb (glTF 2.0 Binary with PBR porcelain material, vertex normals, and decorative blue pattern)
2. .usdz (Apple AR Quick Look package with strict 64-byte alignment)
"""

import math
import struct
import json
import os
import io
import zipfile
import numpy as np
from PIL import Image, ImageDraw

def create_texture():
    """Create ceramic porcelain texture with blue pattern band matching the reference image."""
    width, height = 1024, 1024
    img = Image.new("RGB", (width, height), (248, 247, 244))
    draw = ImageDraw.Draw(img)

    # Subtle porcelain gradient
    for y in range(height):
        shade = int(248 - 5 * math.sin(y / height * math.pi))
        draw.line([(0, y), (width, y)], fill=(shade, shade - 1, shade - 4))
    
    # Decorative band region (Y: 120 - 220)
    band_top = 120
    band_bot = 220
    
    blue_border = (88, 122, 168)
    blue_inner = (108, 142, 184)
    
    # Outer trim lines
    draw.line([(0, band_top), (width, band_top)], fill=blue_border, width=3)
    draw.line([(0, band_top + 4), (width, band_top + 4)], fill=blue_border, width=1)
    draw.line([(0, band_bot - 4), (width, band_bot - 4)], fill=blue_border, width=1)
    draw.line([(0, band_bot), (width, band_bot)], fill=blue_border, width=3)

    # Interlocking diamond / braided chain lattice
    pattern_cols = 48
    step_w = width / pattern_cols
    
    for i in range(pattern_cols + 2):
        x0 = i * step_w
        x1 = x0 + step_w
        x2 = x0 + step_w * 2
        
        draw.line([(x0, band_top + 5), (x1, (band_top + band_bot) / 2)], fill=blue_inner, width=2)
        draw.line([(x1, (band_top + band_bot) / 2), (x2, band_top + 5)], fill=blue_inner, width=2)
        
        draw.line([(x0, band_bot - 5), (x1, (band_top + band_bot) / 2)], fill=blue_inner, width=2)
        draw.line([(x1, (band_top + band_bot) / 2), (x2, band_bot - 5)], fill=blue_inner, width=2)
        
        cx = int(x1)
        cy = int((band_top + band_bot) / 2)
        draw.ellipse([cx - 2, cy - 2, cx + 2, cy + 2], fill=blue_border)

    buf = io.BytesIO()
    img.save(buf, format="PNG", optimize=True)
    return buf.getvalue()

def generate_models(output_dir):
    os.makedirs(output_dir, exist_ok=True)
    texture_bytes = create_texture()

    # Profile curve in (r, y, v_tex)
    # Dimensions in meters: 14 cm diameter, 5.6 cm height
    profile_data = []

    # 1. Base inner underside
    profile_data.append((0.000, 0.002, 0.50))
    profile_data.append((0.025, 0.002, 0.50))
    profile_data.append((0.030, 0.001, 0.50))

    # 2. Foot ring
    profile_data.append((0.033, 0.000, 0.48))
    profile_data.append((0.036, 0.000, 0.46))

    # 3. Outer curve rising up
    for t in np.linspace(0.0, 0.65, 10):
        r = 0.036 + (0.070 - 0.036) * math.sin(t * math.pi / 2)
        y = 0.002 + 0.053 * (t ** 0.85)
        v = 0.45 - (0.45 - 0.22) * (t / 0.65)
        profile_data.append((r, y, v))

    # Band region (patterned rim)
    for t in np.linspace(0.68, 0.94, 6):
        r = 0.036 + (0.070 - 0.036) * math.sin(t * math.pi / 2)
        y = 0.002 + 0.053 * (t ** 0.85)
        factor = (t - 0.68) / (0.94 - 0.68)
        v = 0.215 - (0.215 - 0.125) * factor
        profile_data.append((r, y, v))

    # Top outer rim lip
    for t in np.linspace(0.96, 1.0, 3):
        r = 0.036 + (0.070 - 0.036) * math.sin(t * math.pi / 2)
        y = 0.002 + 0.053 * (t ** 0.85)
        v = 0.11 - 0.05 * ((t - 0.96) / 0.04)
        profile_data.append((r, y, v))

    # 4. Rounded rim lip
    profile_data.append((0.0700, 0.0553, 0.05))
    profile_data.append((0.0685, 0.0558, 0.05))
    profile_data.append((0.0670, 0.0553, 0.05))

    # 5. Inner bowl cavity
    for t in np.linspace(1.0, 0.0, 16):
        r = 0.0001 + (0.067 - 0.0001) * math.sin(t * math.pi / 2)
        y = 0.006 + 0.049 * (t ** 0.85)
        v = 0.60 + 0.20 * (1.0 - t)
        profile_data.append((r, y, v))

    profile_data.append((0.000, 0.006, 0.80))

    N_PROFILE = len(profile_data)
    N_RADIAL = 64

    # Calculate smooth profile normals
    profile_normals = []
    for i in range(N_PROFILE):
        if i == 0:
            dr = profile_data[1][0] - profile_data[0][0]
            dy = profile_data[1][1] - profile_data[0][1]
        elif i == N_PROFILE - 1:
            dr = profile_data[-1][0] - profile_data[-2][0]
            dy = profile_data[-1][1] - profile_data[-2][1]
        else:
            dr = profile_data[i+1][0] - profile_data[i-1][0]
            dy = profile_data[i+1][1] - profile_data[i-1][1]
        
        length = math.hypot(dr, dy)
        nr, ny = (-dy / length, dr / length) if length > 1e-7 else (0.0, 1.0)
        profile_normals.append((nr, ny))

    positions = []
    normals = []
    texcoords = []
    indices = []

    for j in range(N_PROFILE):
        r, y, v = profile_data[j]
        nr, ny = profile_normals[j]
        
        for i in range(N_RADIAL + 1):
            phi = (2.0 * math.pi * i) / N_RADIAL
            cos_phi = math.cos(phi)
            sin_phi = math.sin(phi)
            
            positions.append((r * cos_phi, y, r * sin_phi))
            
            if r < 1e-5:
                normals.append((0.0, 1.0 if ny >= 0 else -1.0, 0.0))
            else:
                nx = nr * cos_phi
                ny_norm = ny
                nz = nr * sin_phi
                n_len = math.hypot(nx, ny_norm, nz)
                normals.append((nx / n_len, ny_norm / n_len, nz / n_len) if n_len > 1e-7 else (0.0, 1.0, 0.0))
            
            texcoords.append((i / N_RADIAL, v))

    for j in range(N_PROFILE - 1):
        for i in range(N_RADIAL):
            v0 = j * (N_RADIAL + 1) + i
            v1 = v0 + 1
            v2 = (j + 1) * (N_RADIAL + 1) + i
            v3 = v2 + 1
            indices.extend([v0, v1, v2, v1, v3, v2])

    pos_array = np.array(positions, dtype=np.float32)
    norm_array = np.array(normals, dtype=np.float32)
    uv_array = np.array(texcoords, dtype=np.float32)
    idx_array = np.array(indices, dtype=np.uint16)

    def pad4(b):
        pad = (4 - (len(b) % 4)) % 4
        return b + b'\x00' * pad

    idx_bytes = pad4(idx_array.tobytes())
    pos_bytes = pad4(pos_array.tobytes())
    norm_bytes = pad4(norm_array.tobytes())
    uv_bytes = pad4(uv_array.tobytes())
    tex_bytes_padded = pad4(texture_bytes)

    bin_buffer = idx_bytes + pos_bytes + norm_bytes + uv_bytes + tex_bytes_padded

    offset_idx = 0
    offset_pos = len(idx_bytes)
    offset_norm = offset_pos + len(pos_bytes)
    offset_uv = offset_norm + len(norm_bytes)
    offset_tex = offset_uv + len(uv_bytes)

    gltf_json = {
        "asset": {
            "version": "2.0",
            "generator": "FINE MODEL 3D Generator (Photogrammetry Lathe Engine)"
        },
        "scene": 0,
        "scenes": [{ "nodes": [0] }],
        "nodes": [{ "mesh": 0, "name": "Soup Bowl" }],
        "materials": [{
            "name": "Ceramic_Porcelain",
            "pbrMetallicRoughness": {
                "baseColorTexture": { "index": 0 },
                "metallicFactor": 0.05,
                "roughnessFactor": 0.22
            },
            "doubleSided": True
        }],
        "textures": [{ "sampler": 0, "source": 0 }],
        "images": [{ "bufferView": 4, "mimeType": "image/png" }],
        "samplers": [{ "magFilter": 9729, "minFilter": 9987, "wrapS": 10497, "wrapT": 33071 }],
        "meshes": [{
            "name": "SoupBowlMesh",
            "primitives": [{
                "attributes": {
                    "POSITION": 1,
                    "NORMAL": 2,
                    "TEXCOORD_0": 3
                },
                "indices": 0,
                "material": 0,
                "mode": 4
            }]
        }],
        "accessors": [
            {
                "bufferView": 0,
                "byteOffset": 0,
                "componentType": 5123,
                "count": len(indices),
                "type": "SCALAR",
                "max": [int(idx_array.max())],
                "min": [int(idx_array.min())]
            },
            {
                "bufferView": 1,
                "byteOffset": 0,
                "componentType": 5126,
                "count": len(positions),
                "type": "VEC3",
                "max": pos_array.max(axis=0).tolist(),
                "min": pos_array.min(axis=0).tolist()
            },
            {
                "bufferView": 2,
                "byteOffset": 0,
                "componentType": 5126,
                "count": len(normals),
                "type": "VEC3",
                "max": norm_array.max(axis=0).tolist(),
                "min": norm_array.min(axis=0).tolist()
            },
            {
                "bufferView": 3,
                "byteOffset": 0,
                "componentType": 5126,
                "count": len(texcoords),
                "type": "VEC2",
                "max": uv_array.max(axis=0).tolist(),
                "min": uv_array.min(axis=0).tolist()
            }
        ],
        "bufferViews": [
            { "buffer": 0, "byteOffset": offset_idx, "byteLength": len(idx_array.tobytes()), "target": 34963 },
            { "buffer": 0, "byteOffset": offset_pos, "byteLength": len(pos_array.tobytes()), "target": 34962 },
            { "buffer": 0, "byteOffset": offset_norm, "byteLength": len(norm_array.tobytes()), "target": 34962 },
            { "buffer": 0, "byteOffset": offset_uv, "byteLength": len(uv_array.tobytes()), "target": 34962 },
            { "buffer": 0, "byteOffset": offset_tex, "byteLength": len(texture_bytes) }
        ],
        "buffers": [{ "byteLength": len(bin_buffer) }]
    }

    json_str = json.dumps(gltf_json, separators=(',', ':'))
    json_bytes = json_str.encode('utf-8')
    json_pad_len = (4 - (len(json_bytes) % 4)) % 4
    json_bytes += b' ' * json_pad_len

    total_glb_len = 12 + 8 + len(json_bytes) + 8 + len(bin_buffer)
    glb_header = struct.pack('<4sII', b'glTF', 2, total_glb_len)
    json_chunk_header = struct.pack('<II', len(json_bytes), 0x4E4F534A)
    bin_chunk_header = struct.pack('<II', len(bin_buffer), 0x004E4942)

    glb_data = glb_header + json_chunk_header + json_bytes + bin_chunk_header + bin_buffer

    glb_file = os.path.join(output_dir, 'soup_bowl_sample.glb')
    with open(glb_file, 'wb') as f:
        f.write(glb_data)

    # Generate USDZ with 64-byte alignment
    usda_text = f"""#usda 1.0
(
    defaultPrim = "SoupBowl"
    metersPerUnit = 1.0
    upAxis = "Y"
)

def Xform "SoupBowl" (
    assetInfo = {{ string name = "Soup Bowl" }}
    kind = "component"
)
{{
    def Mesh "Mesh"
    {{
        int[] faceVertexCounts = [{', '.join(['3'] * (len(indices) // 3))}]
        int[] faceVertexIndices = [{', '.join(map(str, indices))}]
        point3f[] points = [{', '.join(f"({p[0]:.5f}, {p[1]:.5f}, {p[2]:.5f})" for p in positions)}]
        normal3f[] normals = [{', '.join(f"({n[0]:.5f}, {n[1]:.5f}, {n[2]:.5f})" for n in normals)}] (
            interpolation = "vertex"
        )
        texCoord2f[] primvars:st = [{', '.join(f"({uv[0]:.5f}, {1.0 - uv[1]:.5f})" for uv in texcoords)}] (
            interpolation = "vertex"
        )
        uniform token subdivisionScheme = "none"
        rel material:binding = </SoupBowl/Materials/Porcelain>
    }}

    def Scope "Materials"
    {{
        def Material "Porcelain"
        {{
            token outputs:surface.connect = </SoupBowl/Materials/Porcelain/PBRShader.outputs:surface>

            def Shader "PBRShader"
            {{
                uniform token info:id = "UsdPreviewSurface"
                color3f inputs:diffuseColor.connect = </SoupBowl/Materials/Porcelain/DiffuseTexture.outputs:rgb>
                float inputs:roughness = 0.22
                float inputs:metallic = 0.05
                token outputs:surface
            }}

            def Shader "DiffuseTexture"
            {{
                uniform token info:id = "UsdUVTexture"
                asset inputs:file = @texture.png@
                float2 inputs:st.connect = </SoupBowl/Materials/Porcelain/PrimvarReader.outputs:result>
                float3 outputs:rgb
            }}

            def Shader "PrimvarReader"
            {{
                uniform token info:id = "UsdPrimvarReader_float2"
                token inputs:varname = "st"
                float2 outputs:result
            }}
        }}
    }}
}}
"""
    usda_bytes = usda_text.encode('utf-8')
    usdz_file = os.path.join(output_dir, 'soup_bowl_sample.usdz')

    # Construct strictly 64-byte aligned ZIP
    entries = [('model.usda', usda_bytes), ('texture.png', texture_bytes)]
    buf = bytearray()
    cd_entries = []

    for name, data in entries:
        name_bytes = name.encode('utf-8')
        local_header_len = 30 + len(name_bytes)
        current_offset = len(buf)
        data_offset = current_offset + local_header_len
        padding = (64 - (data_offset % 64)) % 64
        extra = b'\x00' * padding
        crc = zipfile.crc32(data)

        header = struct.pack(
            '<4sHHHHHIIIHH',
            b'PK\x03\x04',
            20, 0, 0, 0, 0, crc,
            len(data), len(data),
            len(name_bytes), len(extra)
        )
        entry_offset = len(buf)
        buf.extend(header)
        buf.extend(name_bytes)
        buf.extend(extra)
        buf.extend(data)
        cd_entries.append((name_bytes, crc, len(data), entry_offset))

    cd_offset = len(buf)
    for name_bytes, crc, size, entry_offset in cd_entries:
        cd_header = struct.pack(
            '<4sHHHHHHIIIHHHHHII',
            b'PK\x01\x02',
            20, 20, 0, 0, 0, 0, crc,
            size, size, len(name_bytes),
            0, 0, 0, 0, 0, entry_offset
        )
        buf.extend(cd_header)
        buf.extend(name_bytes)

    eocd = struct.pack(
        '<4sHHHHIIH',
        b'PK\x05\x06',
        0, 0, len(cd_entries), len(cd_entries),
        len(buf) - cd_offset, cd_offset, 0
    )
    buf.extend(eocd)

    with open(usdz_file, 'wb') as f:
        f.write(buf)

    print(f"🎉 Generated successfully!")
    print(f"  - GLB  (Android/Web): {glb_file} ({len(glb_data)} bytes)")
    print(f"  - USDZ (iOS QuickLook): {usdz_file} ({len(buf)} bytes)")
    return glb_file, usdz_file

if __name__ == '__main__':
    output_dir = os.path.join(os.path.dirname(__file__), '..', 'public', 'uploads')
    generate_models(output_dir)
