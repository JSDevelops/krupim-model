#!/usr/bin/env python3
"""Batch 3D Model Generator - FINE MODEL AR 3D + AI Learning (v2 fixed)"""
import os, io, time, zipfile
import numpy as np
import trimesh
import psycopg2

DB_URL    = "postgresql://postgres:fiKyHoXHVqBTwcvXYCJuBxEiGqXURbwV@maglev.proxy.rlwy.net:12104/railway"
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), '..', 'public', 'uploads')
PROD_BASE  = "https://www.krupim-finemodel3d-ar.com/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

def make_usdz(glb_bytes, name):
    slug = name.replace(' ','_').replace('(','').replace(')','').replace('/','')
    usda = f'#usda 1.0\n( defaultPrim = "Root" )\ndef Xform "Root" {{ }}\n'
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, 'w', zipfile.ZIP_STORED) as zf:
        for arcname, data in [(f"{slug}.usda", usda.encode()), (f"{slug}.glb", glb_bytes)]:
            zinfo = zipfile.ZipInfo(arcname)
            current_pos = buf.tell()
            header_base = 30 + len(arcname.encode())
            data_offset = current_pos + header_base
            pad = (64 - (data_offset % 64)) % 64
            zf.writestr(zinfo, data + b'\x00'*pad)
    return buf.getvalue()

def pbr(r,g,b,a=1.0,metallic=0.05,rough=0.45):
    return trimesh.visual.material.PBRMaterial(
        baseColorFactor=[r,g,b,a], metallicFactor=metallic, roughnessFactor=rough)
def mat_metal():          return pbr(0.78,0.76,0.74, metallic=0.9, rough=0.2)
def mat_glass():          return pbr(0.8,0.9,1.0, a=0.4, metallic=0.0, rough=0.05)
def mat_ceramic(r=0.92,g=0.90,b=0.87): return pbr(r,g,b)

def apply_mat(mesh, mat):
    mesh.visual = trimesh.visual.TextureVisuals(material=mat)
    return mesh

def lathe(radii, heights, sec=40):
    """Revolve profile around Y axis"""
    radii, heights = np.array(radii, float), np.array(heights, float)
    angles = np.linspace(0, 2*np.pi, sec, endpoint=False)
    n = len(radii)
    v = np.array([[r*np.cos(a), h, r*np.sin(a)]
                  for r,h in zip(radii,heights) for a in angles])
    f = []
    for i in range(n-1):
        for j in range(sec):
            j1=(j+1)%sec
            a,b,c,d = i*sec+j, i*sec+j1, (i+1)*sec+j, (i+1)*sec+j1
            f+=[[a,c,b],[b,c,d]]
    m = trimesh.Trimesh(vertices=v, faces=np.array(f, dtype=np.int64), process=False)
    m.fix_normals()
    return m

def cap(y, r, sec=40, flip=False):
    """Flat circular cap — face indices FIXED"""
    a  = np.linspace(0, 2*np.pi, sec, endpoint=False)
    v  = np.array([[0,y,0]] + [[r*np.cos(x),y,r*np.sin(x)] for x in a])
    f  = []
    for j in range(sec):
        nxt = (j+1)%sec + 1       # wraps correctly: j=sec-1 → 1
        cur = j + 1
        if not flip:
            f.append([0, cur, nxt])
        else:
            f.append([0, nxt, cur])
    return trimesh.Trimesh(vertices=v, faces=np.array(f, dtype=np.int64), process=False)

def concat(*parts):
    valid = [p for p in parts if p is not None]
    m = trimesh.util.concatenate(valid)
    m.fix_normals()
    return m

# ── Shape library ─────────────────────────────────────────────────────

def bowl(top_r=.09, bot_r=.02, depth=.05, wall=.005, mat=None):
    n=28; h=np.linspace(0,depth,n)
    ro = bot_r + (top_r-bot_r)*(h/depth)**.7
    ri = np.maximum(ro-wall, .001)
    # inner ring: skip first point (shares base with outer)
    m = concat(lathe(ro, h), lathe(ri[1:], h[1:]), cap(0, ro[0]))
    return apply_mat(m, mat) if mat else m

def plate(top_r=.13, rim_h=.01, depth=.02, mat=None):
    rs = np.array([.01,.02, top_r*.6, top_r*.85, top_r, top_r])
    hs = np.array([0, .002, depth*.5, depth*.85, depth, depth+rim_h])
    m = concat(lathe(rs, hs), cap(0, rs[0]))
    return apply_mat(m, mat) if mat else m

def highball(br=.035, tr=.042, h=.14, mat=None):
    """Straight-sided glass — FIX: slice numpy arrays, not Trimesh"""
    hs = np.linspace(0, h, 20)
    ro = br + (tr-br)*(hs/h)
    ri = ro[1:]*0.88                  # numpy slice ✅
    m  = concat(lathe(ro, hs), lathe(ri, hs[1:]+.003), cap(0, ro[0]))
    return apply_mat(m, mat) if mat else m

def cup(br=.035, tr=.048, h=.075, mat=None, handle=False):
    hs = np.linspace(0, h, 20)
    rs = br + (tr-br)*(hs/h)
    ri = rs[1:]*0.88                  # numpy slice ✅
    parts = [lathe(rs, hs), lathe(ri, hs[1:]+.003), cap(0, rs[0])]
    if handle:
        hm = trimesh.creation.torus(major_radius=.03, minor_radius=.005)
        hm.apply_transform(trimesh.transformations.rotation_matrix(np.pi/2,[0,0,1]))
        hm.apply_translation([tr+.025, h*.5, 0])
        parts.append(hm)
    m = concat(*parts)
    return apply_mat(m, mat) if mat else m

def wine_glass(sh=.12, bt=.045, bd=.065, br=.04, mat=None):
    base = trimesh.creation.cylinder(radius=br, height=.005, sections=40)
    base.apply_translation([0,.0025,0])
    stem = trimesh.creation.cylinder(radius=.004, height=sh, sections=20)
    stem.apply_translation([0, sh/2+.005, 0])
    hs = np.linspace(0, bd, 20); rs = bt*(hs/bd)**.45
    ri = rs[1:]*0.85
    bwl = concat(lathe(rs[::-1], hs), lathe(ri[::-1], hs[1:]+.003))
    bwl.apply_translation([0, sh+.005, 0])
    m = concat(base, stem, bwl)
    return apply_mat(m, mat) if mat else m

def spoon(br=.022, hl=.16, dp=.008, mat=None):
    bwl = trimesh.creation.icosphere(radius=br, subdivisions=3)
    bwl.apply_scale([1.0, dp/br, 1.3])
    hnd = trimesh.creation.box([.008, dp*.3, hl])
    hnd.apply_translation([0, 0, -hl/2-br*1.2])
    m = concat(bwl, hnd)
    m.apply_transform(trimesh.transformations.rotation_matrix(np.pi/2,[1,0,0]))
    return apply_mat(m, mat) if mat else m

def fork(tines=4, hl=.18, mat=None):
    sp=.006; tw=.002; th=.045; tot=(tines-1)*sp
    parts=[]
    for i in range(tines):
        t=trimesh.creation.box([tw,.003,th]); t.apply_translation([-tot/2+i*sp,0,th/2]); parts.append(t)
    neck=trimesh.creation.box([.006,.003,.02]); neck.apply_translation([0,0,-.01])
    hnd=trimesh.creation.box([.010,.003,hl]); hnd.apply_translation([0,0,-hl/2-.02])
    m=concat(*parts, neck, hnd)
    m.apply_transform(trimesh.transformations.rotation_matrix(np.pi/2,[1,0,0]))
    return apply_mat(m, mat) if mat else m

def knife(bl=.12, hl=.12, mat=None):
    blade=trimesh.creation.box([.020,.002,bl]); blade.apply_translation([0,0,bl/2])
    hnd=trimesh.creation.box([.016,.008,hl]); hnd.apply_translation([0,0,-hl/2])
    m=concat(blade, hnd)
    m.apply_transform(trimesh.transformations.rotation_matrix(np.pi/2,[1,0,0]))
    return apply_mat(m, mat) if mat else m

# ── Item catalogue (only the 24 that failed) ─────────────────────────
ITEMS_FAILED = [
    ("Beer Mug",                      lambda: cup(br=.042,tr=.045,h=.145,mat=mat_glass(),handle=True)),
    ("Beer Pilsner Glass",            lambda: highball(br=.016,tr=.048,h=.20,mat=mat_glass())),
    ("Collins Glass",                 lambda: highball(br=.030,tr=.033,h=.18,mat=mat_glass())),
    ("Highball Glass",                lambda: highball(mat=mat_glass())),
    ("Hurricane Glass",               lambda: cup(br=.038,tr=.055,h=.18,mat=mat_glass())),
    ("Irish Coffee Glass",            lambda: cup(br=.035,tr=.042,h=.14,mat=mat_glass(),handle=True)),
    ("Rock Glass",                    lambda: highball(br=.040,tr=.045,h=.09,mat=mat_glass())),
    ("Shot Glass",                    lambda: highball(br=.022,tr=.026,h=.06,mat=mat_glass())),
    ("Appetizer Plate",               lambda: plate(top_r=.11,rim_h=.008,depth=.012,mat=mat_ceramic())),
    ("Bouillon Cup (Broth Bowl)",     lambda: cup(br=.04,tr=.05,h=.055,mat=mat_ceramic())),
    ("Cappuccino Cup",                lambda: cup(br=.038,tr=.046,h=.058,mat=mat_ceramic(),handle=True)),
    ("Coffee Cup",                    lambda: cup(br=.033,tr=.040,h=.065,mat=mat_ceramic(),handle=True)),
    ("Dessert Bowl",                  lambda: bowl(top_r=.09,mat=mat_ceramic())),
    ("Espresso Cup (Demitasse Cup)",  lambda: cup(br=.022,tr=.026,h=.045,mat=mat_ceramic(),handle=True)),
    ("Finger Bowl",                   lambda: bowl(top_r=.065,bot_r=.015,depth=.04,mat=mat_ceramic())),
    ("Mug",                           lambda: cup(br=.038,tr=.040,h=.095,mat=mat_ceramic(0.82,0.85,0.90),handle=True)),
    ("Ramekin",                       lambda: cup(br=.04,tr=.048,h=.045,mat=mat_ceramic())),
    ("Salad Bowl",                    lambda: bowl(top_r=.14,bot_r=.04,depth=.07,mat=mat_ceramic())),
    ("Saucer",                        lambda: plate(top_r=.09,rim_h=.006,depth=.008,mat=mat_ceramic())),
    ("Serving Platter (Meat Platter)",lambda: plate(top_r=.18,rim_h=.015,depth=.018,mat=mat_ceramic(0.95,0.93,0.88))),
    ("Serving Platter (Oval Platter)",lambda: plate(top_r=.16,rim_h=.012,depth=.015,mat=mat_ceramic(0.95,0.93,0.88))),
    ("Soup Tureen",                   lambda: bowl(top_r=.13,bot_r=.06,depth=.10,mat=mat_ceramic())),
    ("Soup Tureen (Open with Ladle)", lambda: bowl(top_r=.13,bot_r=.06,depth=.10,mat=mat_ceramic())),
    ("Tea Cup",                       lambda: cup(br=.035,tr=.048,h=.060,mat=mat_ceramic(),handle=True)),
]

def generate_all():
    conn = psycopg2.connect(DB_URL, sslmode='require')
    cur  = conn.cursor()
    ok=0; failed=[]

    for idx, (name_en, mesh_fn) in enumerate(ITEMS_FAILED, 1):
        print(f"\n[{idx}/{len(ITEMS_FAILED)}] {name_en}")
        try:
            mesh = mesh_fn()
            ts   = int(time.time()*1000)
            slug = name_en.replace(' ','_').replace('(','').replace(')','').replace('/','')[:35]
            glb_name  = f"{ts}_{slug}_glb.glb"
            usdz_name = f"{ts}_{slug}_usdz.usdz"

            glb_bytes = mesh.export(file_type='glb')
            with open(os.path.join(UPLOAD_DIR, glb_name), 'wb') as f: f.write(glb_bytes)
            usdz_bytes = make_usdz(glb_bytes, slug)
            with open(os.path.join(UPLOAD_DIR, usdz_name), 'wb') as f: f.write(usdz_bytes)

            glb_url  = f"{PROD_BASE}/{glb_name}"
            usdz_url = f"{PROD_BASE}/{usdz_name}"

            cur.execute("""
                UPDATE vocabulary_items
                SET glb_url=%s, usdz_url=%s, updated_at=NOW()
                WHERE name_en LIKE %s AND (glb_url IS NULL OR glb_url='')
            """, (glb_url, usdz_url, f"%{name_en}%"))
            rows = cur.rowcount; conn.commit()
            print(f"  GLB {len(glb_bytes)//1024}KB | USDZ {len(usdz_bytes)//1024}KB | DB rows={rows} {'✅' if rows else '⚠️ name?'}")
            ok += 1
        except Exception as e:
            print(f"  ❌ {e}"); failed.append(name_en)
            try: conn.rollback()
            except: pass

    cur.close(); conn.close()
    print(f"\n{'='*55}\nDone: {ok}/{len(ITEMS_FAILED)} | Failed: {failed or 'None 🎉'}")

if __name__ == '__main__':
    generate_all()
