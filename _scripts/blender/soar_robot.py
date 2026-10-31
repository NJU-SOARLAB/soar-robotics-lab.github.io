"""Build the SOAR rocket robot for the SOARLAB 3D world.

Run with Blender 3.5+:
    blender -b -P _scripts/blender/soar_robot.py -- --out assets/models/soar-robot.glb [--preview DIR]

The robot is modelled facing +Y with Z up (glTF export converts to Y up, facing -Z).
Every joint is an empty with identity rotation so assets/js/soar-world.js can pose it:
  body, torso, head, shoulder_R/L, elbow_R/L, hip_R/L, knee_R/L, wing_R/L,
  bootJet_R/L and packJet_R/L (rocket exhaust exits).
Proportions match the procedural fallback robot: hips at the origin, about 2.2 units tall.
"""

import math
import os
import sys

import bmesh
import bpy
from mathutils import Matrix, Vector

argv = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
OUT = argv[argv.index("--out") + 1] if "--out" in argv else "soar-robot.glb"
PREVIEW = argv[argv.index("--preview") + 1] if "--preview" in argv else None
POSE = argv[argv.index("--pose") + 1] if "--pose" in argv else "hover"

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
collection = scene.collection

# --------------------------------------------------------------------------- materials


def srgb_to_linear(value):
    return value / 12.92 if value <= 0.04045 else ((value + 0.055) / 1.055) ** 2.4


def hex_color(code):
    code = code.lstrip("#")
    return tuple(srgb_to_linear(int(code[i : i + 2], 16) / 255) for i in (0, 2, 4))


def material(name, color, metallic=0.0, roughness=0.5, clearcoat=0.0, emission=None, strength=1.0):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = (*hex_color(color), 1.0)
    bsdf.inputs["Metallic"].default_value = metallic
    bsdf.inputs["Roughness"].default_value = roughness
    bsdf.inputs["Clearcoat"].default_value = clearcoat
    bsdf.inputs["Clearcoat Roughness"].default_value = 0.08
    if emission:
        bsdf.inputs["Emission"].default_value = (*hex_color(emission), 1.0)
        bsdf.inputs["Emission Strength"].default_value = strength
    return mat


M = {
    "teal": material("armor_teal", "#2aa3b8", metallic=0.35, roughness=0.3, clearcoat=0.7),
    "tealDark": material("armor_teal_dark", "#1b6f86", metallic=0.4, roughness=0.32, clearcoat=0.5),
    "navy": material("frame_navy", "#13324c", metallic=0.55, roughness=0.36),
    "joint": material("joint_dark", "#0c1e2e", metallic=0.6, roughness=0.42),
    "orange": material("accent_orange", "#f05a2a", metallic=0.2, roughness=0.32, clearcoat=0.6),
    "orangeDark": material("accent_orange_dark", "#b9401c", metallic=0.25, roughness=0.36, clearcoat=0.4),
    "visor": material("visor_glass", "#071a2b", metallic=0.3, roughness=0.06, clearcoat=1.0),
    "steel": material("nozzle_steel", "#4a5563", metallic=0.95, roughness=0.24),
    "glowYellow": material("glow_yellow", "#ffc247", emission="#ffc247", strength=6.0),
    "glowCore": material("glow_core", "#ffd27a", emission="#ffb547", strength=8.0),
    "glowHot": material("glow_exhaust", "#ff8a3c", emission="#ff7a2a", strength=10.0),
    "glowCyan": material("glow_cyan", "#7ff0ff", emission="#5fe3f0", strength=5.0),
}

# --------------------------------------------------------------------------- joints

WORLD = {}


def joint(name, location, parent=None):
    obj = bpy.data.objects.new(name, None)
    obj.empty_display_size = 0.06
    collection.objects.link(obj)
    location = Vector(location)
    WORLD[name] = location
    if parent is not None:
        obj.parent = parent
        obj.location = location - WORLD[parent.name]
    else:
        obj.location = location
    return obj


# --------------------------------------------------------------------------- mesh helpers


def finish(name, bm, mat, parent, center, bevel=0.0, segments=3, smooth_angle=40, harden=True, solidify=0.0, subsurf=0):
    mesh = bpy.data.meshes.new(name)
    bm.normal_update()
    bm.to_mesh(mesh)
    bm.free()
    for polygon in mesh.polygons:
        polygon.use_smooth = True
    mesh.use_auto_smooth = True
    mesh.auto_smooth_angle = math.radians(smooth_angle)
    obj = bpy.data.objects.new(name, mesh)
    collection.objects.link(obj)
    obj.data.materials.append(mat)
    obj.parent = parent
    obj.location = Vector(center) - WORLD[parent.name]
    if solidify:
        mod = obj.modifiers.new("Solidify", "SOLIDIFY")
        mod.thickness = solidify
        mod.offset = -1
    if bevel:
        mod = obj.modifiers.new("Bevel", "BEVEL")
        mod.width = bevel
        mod.segments = segments
        mod.limit_method = "ANGLE"
        mod.angle_limit = math.radians(35)
        mod.harden_normals = harden
    if subsurf:
        mod = obj.modifiers.new("Subsurf", "SUBSURF")
        mod.levels = subsurf
        mod.render_levels = subsurf
    if bevel and harden:
        mod = obj.modifiers.new("WeightedNormal", "WEIGHTED_NORMAL")
        mod.keep_sharp = True
    return obj


def rbox(name, size, center, mat, parent, bevel=0.03, segments=3, bottom=1.0, top=1.0, front=1.0, rot=None):
    """Rounded box with optional tapering (bottom/top scale X/Y, front scales Z at +Y)."""
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    for vert in bm.verts:
        vert.co.x *= size[0]
        vert.co.y *= size[1]
        vert.co.z *= size[2]
        if vert.co.z < 0:
            vert.co.x *= bottom
            vert.co.y *= bottom
        else:
            vert.co.x *= top
            vert.co.y *= top
        if vert.co.y > 0:
            vert.co.z *= front
    if rot:
        bmesh.ops.rotate(bm, verts=bm.verts, cent=(0, 0, 0), matrix=Matrix.Rotation(math.radians(rot[1]), 3, rot[0]))
    return finish(name, bm, mat, parent, center, bevel=bevel, segments=segments)


def cyl(name, r1, r2, depth, center, mat, parent, axis="Z", segments=32, bevel=0.008, bevel_segments=2):
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, cap_tris=False, segments=segments, radius1=r1, radius2=r2, depth=depth)
    if axis == "X":
        bmesh.ops.rotate(bm, verts=bm.verts, cent=(0, 0, 0), matrix=Matrix.Rotation(math.radians(90), 3, "Y"))
    elif axis == "Y":
        bmesh.ops.rotate(bm, verts=bm.verts, cent=(0, 0, 0), matrix=Matrix.Rotation(math.radians(90), 3, "X"))
    return finish(name, bm, mat, parent, center, bevel=bevel, segments=bevel_segments)


def sphere(name, radius, center, mat, parent, scale=(1, 1, 1), segments=40, rings=20, keep=None):
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=segments, v_segments=rings, radius=radius)
    for vert in bm.verts:
        vert.co.x *= scale[0]
        vert.co.y *= scale[1]
        vert.co.z *= scale[2]
    if keep is not None:
        doomed = [face for face in bm.faces if not keep(face.calc_center_median())]
        bmesh.ops.delete(bm, geom=doomed, context="FACES")
    return bm


def sphere_obj(name, radius, center, mat, parent, scale=(1, 1, 1), segments=40, rings=20):
    return finish(name, sphere(name, radius, center, mat, parent, scale, segments, rings), mat, parent, center, harden=False)


def torus(name, major, minor, center, mat, parent, axis="Z", segments=40, minor_segments=10):
    bm = bmesh.new()
    for i in range(segments):
        a = 2 * math.pi * i / segments
        ring = []
        for j in range(minor_segments):
            b = 2 * math.pi * j / minor_segments
            r = major + minor * math.cos(b)
            ring.append(bm.verts.new((r * math.cos(a), r * math.sin(a), minor * math.sin(b))))
        if i:
            for j in range(minor_segments):
                bm.faces.new((prev[j], prev[(j + 1) % minor_segments], ring[(j + 1) % minor_segments], ring[j]))
        else:
            first = ring
        prev = ring
    for j in range(minor_segments):
        bm.faces.new((prev[j], prev[(j + 1) % minor_segments], first[(j + 1) % minor_segments], first[j]))
    if axis == "X":
        bmesh.ops.rotate(bm, verts=bm.verts, cent=(0, 0, 0), matrix=Matrix.Rotation(math.radians(90), 3, "Y"))
    elif axis == "Y":
        bmesh.ops.rotate(bm, verts=bm.verts, cent=(0, 0, 0), matrix=Matrix.Rotation(math.radians(90), 3, "X"))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    return finish(name, bm, mat, parent, center, harden=False)


def lathe(name, profile, center, mat, parent, segments=36, solidify=0.0):
    """Revolve a (radius, z) profile around Z. Open profiles get thickness from solidify."""
    bm = bmesh.new()
    verts = [bm.verts.new((r, 0, z)) for r, z in profile]
    edges = [bm.edges.new((verts[i], verts[i + 1])) for i in range(len(verts) - 1)]
    bmesh.ops.spin(bm, geom=verts + edges, cent=(0, 0, 0), axis=(0, 0, 1), angle=2 * math.pi, steps=segments, use_merge=True)
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-5)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    return finish(name, bm, mat, parent, center, harden=False, solidify=solidify)


def plate(name, points, thickness, center, mat, parent, plane="XZ", bevel=0.01, segments=2):
    """Extrude a 2D outline. XZ plane extrudes along Y, YZ plane along X."""
    bm = bmesh.new()
    verts = []
    for u, v in points:
        if plane == "XZ":
            verts.append(bm.verts.new((u, -thickness / 2, v)))
        else:
            verts.append(bm.verts.new((-thickness / 2, u, v)))
    face = bm.faces.new(verts)
    result = bmesh.ops.extrude_face_region(bm, geom=[face])
    moved = [element for element in result["geom"] if isinstance(element, bmesh.types.BMVert)]
    offset = (0, thickness, 0) if plane == "XZ" else (thickness, 0, 0)
    bmesh.ops.translate(bm, verts=moved, vec=offset)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    return finish(name, bm, mat, parent, center, bevel=bevel, segments=segments)


def nozzle(name, exit_center, parent, radius=0.07, length=0.09):
    """Rocket bell pointing down (-Z): steel bell, heat ring, glowing throat."""
    x, y, z = exit_center
    top = z + length
    bell = [(radius * 0.42, length), (radius * 0.5, length * 0.82), (radius * 0.7, length * 0.45), (radius, 0.0)]
    lathe(f"{name}_bell", bell, (x, y, z), M["steel"], parent, solidify=0.01)
    torus(f"{name}_ring", radius * 0.52, 0.012, (x, y, top - 0.012), M["navy"], parent)
    cyl(f"{name}_throat", radius * 0.4, radius * 0.4, 0.012, (x, y, z + length * 0.55), M["glowHot"], parent, bevel=0)


# --------------------------------------------------------------------------- skeleton

root = joint("SOAR", (0, 0, 0))
body = joint("body", (0, 0, 0), root)
torso = joint("torso", (0, 0, 0.10), body)
head = joint("head", (0, 0, 0.84), torso)
shoulders = {s: joint(f"shoulder_{n}", (0.37 * s, 0, 0.62), torso) for s, n in ((1, "R"), (-1, "L"))}
elbows = {s: joint(f"elbow_{n}", (0.37 * s, 0, 0.26), shoulders[s]) for s, n in ((1, "R"), (-1, "L"))}
hips = {s: joint(f"hip_{n}", (0.13 * s, 0, -0.06), body) for s, n in ((1, "R"), (-1, "L"))}
knees = {s: joint(f"knee_{n}", (0.13 * s, 0, -0.48), hips[s]) for s, n in ((1, "R"), (-1, "L"))}
wings = {s: joint(f"wing_{n}", (0.13 * s, -0.31, 0.58), torso) for s, n in ((1, "R"), (-1, "L"))}
boot_jets = {s: joint(f"bootJet_{n}", (0.13 * s, -0.05, -1.0), knees[s]) for s, n in ((1, "R"), (-1, "L"))}
pack_jets = {s: joint(f"packJet_{n}", (0.11 * s, -0.29, 0.2), torso) for s, n in ((1, "R"), (-1, "L"))}

# --------------------------------------------------------------------------- pelvis and torso

rbox("pelvis", (0.38, 0.25, 0.15), (0, 0, 0.0), M["navy"], body, bevel=0.045, bottom=0.78)
rbox("belt", (0.4, 0.27, 0.05), (0, 0, 0.07), M["tealDark"], body, bevel=0.02)
rbox("buckle", (0.1, 0.03, 0.05), (0, 0.14, 0.06), M["orange"], body, bevel=0.012)
rbox("buckle_light", (0.05, 0.012, 0.012), (0, 0.157, 0.06), M["glowYellow"], body, bevel=0.004)
for s in (1, -1):
    rbox(f"hip_plate_{s}", (0.07, 0.2, 0.15), (0.2 * s, 0, -0.02), M["teal"], body, bevel=0.03, bottom=0.8)

rbox("waist_1", (0.28, 0.21, 0.07), (0, 0, 0.15), M["joint"], torso, bevel=0.025)
rbox("waist_2", (0.32, 0.22, 0.07), (0, 0, 0.23), M["navy"], torso, bevel=0.025)
rbox("abs", (0.2, 0.06, 0.15), (0, 0.105, 0.22), M["teal"], torso, bevel=0.025, segments=3, front=0.9)
rbox("chest_inner", (0.42, 0.28, 0.4), (0, -0.01, 0.48), M["navy"], torso, bevel=0.06, bottom=0.82)
chest = rbox("chest", (0.6, 0.34, 0.32), (0, 0.025, 0.54), M["teal"], torso, bevel=0.085, segments=5, bottom=0.68, front=0.95)
rbox("chest_ridge", (0.05, 0.04, 0.24), (0, 0.19, 0.53), M["tealDark"], torso, bevel=0.018)
for s in (1, -1):
    rbox(f"pec_{s}", (0.2, 0.05, 0.13), (0.14 * s, 0.18, 0.58), M["teal"], torso, bevel=0.03, bottom=0.85)
    for i in range(3):
        rbox(f"vent_{s}_{i}", (0.012, 0.11, 0.025), (0.305 * s, 0.0, 0.47 + i * 0.045), M["joint"], torso, bevel=0.004)
    rbox(f"chest_stripe_{s}", (0.03, 0.04, 0.16), (0.235 * s, 0.155, 0.5), M["orange"], torso, bevel=0.01)

# chest core: bezel, glowing heart, inner ring
cyl("core_bezel", 0.088, 0.088, 0.035, (0, 0.195, 0.46), M["navy"], torso, axis="Y", segments=40, bevel=0.01)
cyl("core_light", 0.062, 0.062, 0.02, (0, 0.215, 0.46), M["glowCore"], torso, axis="Y", segments=40, bevel=0.004)
torus("core_ring", 0.072, 0.007, (0, 0.218, 0.46), M["orange"], torso, axis="Y")
cyl("collar", 0.14, 0.12, 0.06, (0, -0.01, 0.72), M["navy"], torso, segments=36, bevel=0.012)
for s in (1, -1):
    rbox(f"trapezius_{s}", (0.17, 0.22, 0.07), (0.2 * s, -0.02, 0.69), M["tealDark"], torso, bevel=0.03, segments=3, top=0.85)

# jetpack with twin rockets
rbox("pack", (0.36, 0.13, 0.38), (0, -0.215, 0.47), M["navy"], torso, bevel=0.04, bottom=0.92)
rbox("pack_plate", (0.22, 0.03, 0.26), (0, -0.285, 0.5), M["tealDark"], torso, bevel=0.015)
rbox("pack_light", (0.12, 0.01, 0.014), (0, -0.302, 0.6), M["glowCyan"], torso, bevel=0.004)
for s in (1, -1):
    x = 0.11 * s
    cyl(f"rocket_body_{s}", 0.068, 0.068, 0.34, (x, -0.29, 0.45), M["teal"], torso, segments=36, bevel=0.012)
    cyl(f"rocket_band_{s}", 0.071, 0.071, 0.03, (x, -0.29, 0.39), M["navy"], torso, segments=36, bevel=0.006)
    cyl(f"rocket_band2_{s}", 0.071, 0.071, 0.03, (x, -0.29, 0.53), M["navy"], torso, segments=36, bevel=0.006)
    lathe(f"rocket_nose_{s}", [(0.0, 0.11), (0.03, 0.095), (0.055, 0.06), (0.068, 0.0)], (x, -0.29, 0.62), M["orange"], torso)
    nozzle(f"rocket_nozzle_{s}", (x, -0.29, 0.2), torso, radius=0.06, length=0.08)
    plate(
        f"rocket_fin_{s}",
        [(0, 0), (0.09 * s, -0.04), (0.1 * s, -0.11), (0, -0.07)],
        0.014,
        (x + 0.055 * s, -0.29, 0.34),
        M["orange"],
        torso,
        plane="XZ",
        bevel=0.004,
    )

# --------------------------------------------------------------------------- head


def in_visor(point):
    direction = Vector(point).normalized()
    azimuth = math.degrees(math.atan2(direction.x, direction.y))
    elevation = math.degrees(math.asin(max(-1, min(1, direction.z))))
    return abs(azimuth) < 78 and -16 < elevation < 17


cyl("neck", 0.072, 0.08, 0.14, (0, 0, 0.8), M["joint"], head, segments=32)
torus("neck_ring", 0.082, 0.012, (0, 0, 0.81), M["navy"], head)
helmet_center = (0, 0, 0.965)
sphere_obj("helmet", 0.235, helmet_center, M["teal"], head, scale=(1.0, 1.06, 1.04), segments=48, rings=24)
visor_bm = sphere("visor", 0.244, helmet_center, M["visor"], head, scale=(1.0, 1.06, 1.04), segments=64, rings=32, keep=in_visor)
finish("visor", visor_bm, M["visor"], head, helmet_center, solidify=0.014, harden=False)
# yellow slit on the right side of the visor, as in the SOAR logo
slit_angle = math.radians(26)
slit = rbox(
    "visor_slit",
    (0.075, 0.016, 0.034),
    (0.262 * math.sin(slit_angle), 0.262 * 1.06 * math.cos(slit_angle), 0.975),
    M["glowYellow"],
    head,
    bevel=0.006,
)
slit.rotation_euler = (0, 0, -slit_angle)
rbox("visor_brow", (0.3, 0.05, 0.03), (0, 0.205, 1.05), M["navy"], head, bevel=0.012, front=0.8)
rbox("chin", (0.17, 0.08, 0.06), (0, 0.15, 0.85), M["navy"], head, bevel=0.022, bottom=0.8)
for s in (1, -1):
    cyl(f"ear_{s}", 0.078, 0.078, 0.07, (0.238 * s, 0, 0.965), M["navy"], head, axis="X", segments=36, bevel=0.012)
    cyl(f"ear_cap_{s}", 0.052, 0.052, 0.02, (0.275 * s, 0, 0.965), M["tealDark"], head, axis="X", segments=36, bevel=0.006)
    cyl(f"ear_light_{s}", 0.022, 0.022, 0.012, (0.288 * s, 0, 0.965), M["glowCyan"], head, axis="X", segments=24, bevel=0)
plate(
    "head_fin",
    [(0.17, -0.01), (0.06, 0.07), (-0.12, 0.115), (-0.31, 0.07), (-0.24, -0.01), (0.1, -0.04)],
    0.036,
    (0, 0, 1.175),
    M["orange"],
    head,
    plane="YZ",
    bevel=0.008,
)

# --------------------------------------------------------------------------- arms

for s, shoulder in shoulders.items():
    x = 0.37 * s
    sphere_obj(f"shoulder_joint_{s}", 0.082, (x, 0, 0.62), M["joint"], shoulder, segments=32, rings=16)
    rbox(f"pauldron_{s}", (0.21, 0.23, 0.15), (x + 0.035 * s, 0, 0.665), M["tealDark"], shoulder, bevel=0.065, segments=5, bottom=0.82)
    rbox(f"pauldron_top_{s}", (0.15, 0.17, 0.04), (x + 0.04 * s, 0, 0.75), M["teal"], shoulder, bevel=0.018, segments=3)
    rbox(f"pauldron_trim_{s}", (0.022, 0.18, 0.05), (x + 0.142 * s, 0, 0.655), M["orange"], shoulder, bevel=0.008)
    cyl(f"upper_arm_core_{s}", 0.055, 0.055, 0.3, (x, 0, 0.44), M["joint"], shoulder, segments=24)
    cyl(f"upper_arm_{s}", 0.082, 0.072, 0.2, (x, 0, 0.45), M["teal"], shoulder, segments=36, bevel=0.018, bevel_segments=3)

for s, elbow in elbows.items():
    x = 0.37 * s
    sphere_obj(f"elbow_joint_{s}", 0.066, (x, 0, 0.26), M["joint"], elbow, segments=32, rings=16)
    cyl(f"forearm_{s}", 0.074, 0.09, 0.19, (x, 0, 0.14), M["teal"], elbow, segments=36, bevel=0.02, bevel_segments=3)
    rbox(f"forearm_plate_{s}", (0.05, 0.05, 0.12), (x, 0.075, 0.15), M["tealDark"], elbow, bevel=0.015)
    cyl(f"cuff_{s}", 0.097, 0.097, 0.035, (x, 0, 0.04), M["orange"], elbow, segments=36, bevel=0.01)
    cyl(f"wrist_{s}", 0.05, 0.05, 0.04, (x, 0, 0.01), M["joint"], elbow, segments=24)
    # fist: palm, four curled fingers, thumb
    rbox(f"palm_{s}", (0.13, 0.14, 0.12), (x, 0.0, -0.05), M["orange"], elbow, bevel=0.038, segments=4)
    for i in range(4):
        fx = x + (-0.045 + i * 0.03) * s
        rbox(f"finger_{s}_{i}", (0.026, 0.06, 0.05), (fx, 0.06, -0.085), M["orangeDark"], elbow, bevel=0.011, segments=3)
    rbox(f"thumb_{s}", (0.035, 0.07, 0.035), (x - 0.06 * s, 0.05, -0.04), M["orangeDark"], elbow, bevel=0.012, segments=3)

# --------------------------------------------------------------------------- legs

for s, hip in hips.items():
    x = 0.13 * s
    sphere_obj(f"hip_joint_{s}", 0.088, (x, 0, -0.06), M["joint"], hip, segments=32, rings=16)
    cyl(f"thigh_core_{s}", 0.06, 0.06, 0.36, (x, 0, -0.26), M["joint"], hip, segments=24)
    rbox(f"thigh_{s}", (0.195, 0.205, 0.29), (x, 0.005, -0.25), M["teal"], hip, bevel=0.07, segments=5, bottom=0.8)
    rbox(f"thigh_stripe_{s}", (0.03, 0.03, 0.18), (x + 0.075 * s, 0.05, -0.25), M["orange"], hip, bevel=0.01)

for s, knee in knees.items():
    x = 0.13 * s
    sphere_obj(f"knee_joint_{s}", 0.074, (x, 0, -0.48), M["joint"], knee, segments=32, rings=16)
    rbox(f"knee_cap_{s}", (0.11, 0.06, 0.12), (x, 0.08, -0.48), M["tealDark"], knee, bevel=0.03, segments=3, front=0.9)
    cyl(f"shin_core_{s}", 0.055, 0.055, 0.3, (x, 0, -0.66), M["joint"], knee, segments=24)
    rbox(f"shin_{s}", (0.175, 0.195, 0.28), (x, 0.01, -0.65), M["teal"], knee, bevel=0.065, segments=5, bottom=0.8)
    rbox(f"shin_plate_{s}", (0.07, 0.035, 0.18), (x, 0.095, -0.64), M["tealDark"], knee, bevel=0.012)
    cyl(f"boot_cuff_{s}", 0.09, 0.095, 0.05, (x, 0, -0.8), M["navy"], knee, segments=36, bevel=0.01)
    rbox(f"boot_{s}", (0.18, 0.3, 0.15), (x, 0.04, -0.895), M["orange"], knee, bevel=0.05, segments=4, top=0.85)
    rbox(f"boot_toe_{s}", (0.15, 0.08, 0.06), (x, 0.17, -0.94), M["orangeDark"], knee, bevel=0.022, segments=3)
    rbox(f"boot_sole_{s}", (0.17, 0.28, 0.02), (x, 0.04, -0.965), M["joint"], knee, bevel=0.008)
    rbox(f"boot_light_{s}", (0.12, 0.012, 0.012), (x, 0.196, -0.88), M["glowYellow"], knee, bevel=0.004)
    nozzle(f"boot_nozzle_{s}", (x, -0.05, -1.0), knee, radius=0.072, length=0.075)
    plate(
        f"boot_fin_{s}",
        [(0.06, 0.0), (-0.1, 0.0), (-0.16, 0.09), (-0.02, 0.05)],
        0.016,
        (x + 0.095 * s, -0.05, -0.9),
        M["orangeDark"],
        knee,
        plane="YZ",
        bevel=0.005,
    )

# --------------------------------------------------------------------------- wings

# Leading edge of the wing in its own plane (u outward, v up), relative to the hinge.
LEADING_EDGE = [(0.0, 0.0), (0.2, 0.22), (0.45, 0.4), (0.72, 0.53), (1.0, 0.6), (1.1, 0.59)]
# Primary feathers: (root u, root v, angle from +u in degrees, length, width, colour)
PRIMARIES = [
    (0.92, 0.56, -12, 0.44, 0.17, "orange"),
    (0.78, 0.51, -32, 0.5, 0.19, "orangeLight"),
    (0.62, 0.45, -51, 0.53, 0.2, "orange"),
    (0.46, 0.37, -69, 0.53, 0.2, "orangeLight"),
    (0.3, 0.27, -85, 0.49, 0.19, "orange"),
    (0.15, 0.15, -100, 0.4, 0.17, "orangeLight"),
]
COVERT = [(0.0, 0.0), (0.2, 0.22), (0.45, 0.4), (0.72, 0.53), (0.98, 0.6), (0.86, 0.42), (0.64, 0.27), (0.42, 0.12), (0.2, -0.02), (0.04, -0.08)]
M["orangeLight"] = material("accent_orange_light", "#ff6a2e", metallic=0.2, roughness=0.3, clearcoat=0.6)


def feather_outline(root_u, root_v, angle, length, width):
    a = math.radians(angle)
    d = Vector((math.cos(a), math.sin(a)))
    n = Vector((-d.y, d.x))
    base = Vector((root_u, root_v))
    w = width / 2
    points = [
        base - n * w * 0.55,
        base + d * length * 0.28 - n * w,
        base + d * length * 0.8 - n * w * 0.92,
        base + d * length,
        base + d * length * 0.86 + n * w * 0.7,
        base + d * length * 0.3 + n * w,
        base + n * w * 0.55,
    ]
    return [(p.x, p.y) for p in points]


for s, wing in wings.items():
    pivot = WORLD[wing.name]
    cyl(f"wing_hinge_{s}", 0.055, 0.055, 0.1, pivot, M["navy"], wing, axis="Y", segments=28)

    def mirror(points):
        mirrored = [(u * s, v) for u, v in points]
        return mirrored if s > 0 else list(reversed(mirrored))

    # covert panel sits behind the primaries and hides their roots
    plate(f"wing_covert_{s}", mirror(COVERT), 0.03, (pivot.x, pivot.y - 0.03, pivot.z), M["orangeDark"], wing, plane="XZ", bevel=0.008)
    for i, (u, v, angle, length, width, colour) in enumerate(PRIMARIES):
        outline = mirror(feather_outline(u, v, angle, length, width))
        plate(f"wing_feather_{s}_{i}", outline, 0.022, (pivot.x, pivot.y - 0.005 + 0.007 * (i % 2), pivot.z), M[colour], wing, plane="XZ", bevel=0.006)
    # leading-edge spar with a light strip on the back face
    for i in range(len(LEADING_EDGE) - 1):
        (u0, v0), (u1, v1) = LEADING_EDGE[i], LEADING_EDGE[i + 1]
        mid = Vector((pivot.x + (u0 + u1) / 2 * s, pivot.y - 0.015, pivot.z + (v0 + v1) / 2))
        seg_len = math.hypot(u1 - u0, v1 - v0) + 0.04
        angle = math.degrees(math.atan2(v1 - v0, (u1 - u0) * s))
        thickness = 0.075 - 0.008 * i
        bar = rbox(f"wing_spar_{s}_{i}", (seg_len, 0.07, thickness), mid, M["navy"], wing, bevel=0.022, segments=3)
        bar.rotation_euler = (0, -math.radians(angle), 0)
        if i < len(LEADING_EDGE) - 2:
            strip = rbox(f"wing_light_{s}_{i}", (seg_len * 0.8, 0.012, 0.012), mid + Vector((0, -0.04, 0)), M["glowCyan"], wing, bevel=0.004)
            strip.rotation_euler = (0, -math.radians(angle), 0)


# --------------------------------------------------------------------------- pose (preview only)


def apply_pose(name):
    if name == "rest":
        return
    if name == "hover":
        shoulders[1].rotation_euler = (math.radians(20), math.radians(0), math.radians(28))
        shoulders[-1].rotation_euler = (math.radians(20), 0, math.radians(-28))
        elbows[1].rotation_euler = (math.radians(35), 0, 0)
        elbows[-1].rotation_euler = (math.radians(35), 0, 0)
        hips[1].rotation_euler = (math.radians(12), 0, math.radians(4))
        knees[1].rotation_euler = (math.radians(-25), 0, 0)
        hips[-1].rotation_euler = (math.radians(4), 0, math.radians(-4))
        knees[-1].rotation_euler = (math.radians(-12), 0, 0)
        wings[1].rotation_euler = (0, math.radians(-15), math.radians(18))
        wings[-1].rotation_euler = (0, math.radians(15), math.radians(-18))
        body.rotation_euler = (math.radians(-10), 0, 0)
        head.rotation_euler = (math.radians(6), 0, 0)
    if name == "flight":
        body.rotation_euler = (math.radians(-78), 0, 0)
        head.rotation_euler = (math.radians(60), 0, 0)
        shoulders[1].rotation_euler = (math.radians(169), 0, math.radians(6))
        shoulders[-1].rotation_euler = (math.radians(-18), 0, math.radians(-17))
        elbows[-1].rotation_euler = (math.radians(9), 0, 0)
        hips[1].rotation_euler = (math.radians(3), 0, math.radians(4))
        hips[-1].rotation_euler = (math.radians(7), 0, math.radians(-4))
        knees[1].rotation_euler = (math.radians(-10), 0, 0)
        knees[-1].rotation_euler = (math.radians(-17), 0, 0)
        wings[1].rotation_euler = (0, math.radians(-6), math.radians(-13))
        wings[-1].rotation_euler = (0, math.radians(6), math.radians(13))


# --------------------------------------------------------------------------- export


def export(path):
    os.makedirs(os.path.dirname(os.path.abspath(path)), exist_ok=True)
    for obj in bpy.data.objects:
        obj.select_set(obj.type in {"MESH", "EMPTY"})
    bpy.ops.export_scene.gltf(
        filepath=path,
        export_format="GLB",
        use_selection=True,
        export_apply=True,
        export_yup=True,
        export_texcoords=False,
        export_normals=True,
        export_colors=False,
        export_cameras=False,
        export_lights=False,
        export_extras=False,
        export_animations=False,
    )


def render_previews(directory):
    os.makedirs(directory, exist_ok=True)
    apply_pose(POSE)
    world = bpy.data.worlds.new("World")
    world.use_nodes = True
    world.node_tree.nodes["Background"].inputs[0].default_value = (*hex_color("#cfe3ea"), 1)
    world.node_tree.nodes["Background"].inputs[1].default_value = 0.9
    scene.world = world
    scene.render.engine = "BLENDER_EEVEE"
    scene.eevee.use_gtao = True
    scene.eevee.use_bloom = True
    scene.eevee.bloom_intensity = 0.04
    scene.eevee.use_ssr = True
    scene.eevee.taa_render_samples = 48
    scene.render.resolution_x = 900
    scene.render.resolution_y = 900
    scene.render.film_transparent = False
    scene.view_settings.view_transform = "Filmic"
    scene.view_settings.look = "Medium High Contrast"

    def light(name, kind, location, energy, color, size=1.0):
        data = bpy.data.lights.new(name, kind)
        data.energy = energy
        data.color = hex_color(color)
        if kind == "AREA":
            data.size = size
        obj = bpy.data.objects.new(name, data)
        obj.location = location
        collection.objects.link(obj)
        direction = Vector((0, 0, 0.2)) - Vector(location)
        obj.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()

    light("key", "AREA", (2.2, 2.6, 2.6), 380, "#fff1dc", size=2.5)
    light("rim", "AREA", (-2.4, -2.2, 2.0), 320, "#9fe9ff", size=2.0)
    light("fill", "AREA", (-2.6, 2.4, 0.4), 90, "#ffd2a0", size=3.0)

    cam_data = bpy.data.cameras.new("cam")
    cam_data.lens = 60
    cam = bpy.data.objects.new("cam", cam_data)
    collection.objects.link(cam)
    scene.camera = cam
    views = {"front": (2.4, 4.6, 0.75), "back": (-2.6, -4.4, 1.4), "side": (5.0, 0.4, 0.4)}
    for view, location in views.items():
        cam.location = location
        target = Vector((0, 0, 0.12))
        cam.rotation_euler = (target - Vector(location)).to_track_quat("-Z", "Y").to_euler()
        scene.render.filepath = os.path.join(directory, f"{POSE}-{view}.png")
        bpy.ops.render.render(write_still=True)


if PREVIEW:
    render_previews(PREVIEW)
else:
    export(OUT)
    tris = 0
    depsgraph = bpy.context.evaluated_depsgraph_get()
    for obj in bpy.data.objects:
        if obj.type == "MESH":
            evaluated = obj.evaluated_get(depsgraph)
            mesh = evaluated.to_mesh()
            tris += sum(len(p.vertices) - 2 for p in mesh.polygons)
            evaluated.to_mesh_clear()
    print(f"EXPORTED {OUT} triangles={tris}")
