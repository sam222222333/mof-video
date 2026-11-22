"""Build the data files Shot 04 needs.

1. src/data/paddlewheel-solvated.json
   The verified 74-atom paddlewheel (models/paddlewheel.pdb, Angstrom, centred
   on the Cu-Cu midpoint) + the two axial water molecules that
   models/paddlewheel.pdb is missing.  Water geometry comes from the
   experimental structure models/HKUST-1.cif, where every Cu carries exactly one
   axial O at 2.207 A collinear with the Cu-Cu axis.  The video quotes Chui 1999
   (Cu-OH2 = 2.165 A), so the O sits at 2.165 A -- the number shown on screen.

2. src/data/hkust1-tiling.json
   The HKUST-1 topology, tiled REPEAT^3 times, as nodes + triangles:
     - node     = paddlewheel centre (Cu-Cu midpoint)      24 per cell
     - triangle = one BTC linker, i.e. the 3 paddlewheels it bridges (tbo net)
   Each paddlewheel has exactly 4 BTC neighbours and each BTC exactly 3
   paddlewheels (24*4 = 96 = 32*3), asserted below.

   Triangles are GLOBAL node indices, so one reaching into a neighbouring cell
   points at that cell's copy of the paddlewheel.  An earlier version used
   per-cell fractional coordinates and produced 24 edges with a bogus 20+ A
   length; the side-length assert at the bottom guards against that.

Run:  PYTHONPATH=../pylib python3 scripts/build-data.py
"""
import json

import numpy as np
from ase import Atoms
from ase.io import read
from ase.neighborlist import neighbor_list

PW_PDB = "models/paddlewheel.pdb"
CIF = "models/HKUST-1.cif"
OUT_SOLVATED = "src/data/paddlewheel-solvated.json"
OUT_TILING = "src/data/hkust1-tiling.json"
REPEAT = int(__import__('os').environ.get('REPEAT', '3'))

CU_OH2 = 2.165  # A, Chui et al. Science 1999 (the number shown on screen)
O_H = 0.96
HOH = np.radians(104.5)


def unit(v):
    v = np.asarray(v, float)
    return v / np.linalg.norm(v)


def build_solvated():
    atoms = read(PW_PDB)
    sym = np.array(atoms.get_chemical_symbols())
    pos = atoms.get_positions()

    cu = np.where(sym == "Cu")[0]
    assert len(cu) == 2, f"expected 2 Cu, got {len(cu)}"
    n0 = len(sym)
    print(f"Cu-Cu = {np.linalg.norm(pos[cu[1]] - pos[cu[0]]):.3f} A (DFT-relaxed pdb)")

    extra_sym, extra_pos = [], []
    for c in cu:
        partner = cu[1] if c == cu[0] else cu[0]
        outward = unit(pos[c] - pos[partner])
        o = pos[c] + outward * CU_OH2
        ref = np.array([0.0, 0.0, 1.0])
        if abs(np.dot(ref, outward)) > 0.9:
            ref = np.array([0.0, 1.0, 0.0])
        perp = unit(np.cross(outward, ref))
        for s in (+1, -1):
            # The H-O-H bisector points AWAY from the metal: the oxygen donates a
            # lone pair to Cu, so both hydrogens sit on the far side. This gives
            # Cu-O-H ~ 127.7 deg and Cu...H 2.86 A.
            #
            # Do NOT flip this sign back. With `-outward` both hydrogens point at
            # the copper: Cu-O-H 52 deg, Cu...H 1.75 A, i.e. hydrogen sitting on
            # the metal. That bug shipped in the first version of this file.
            d = np.cos(HOH / 2) * outward + np.sin(HOH / 2) * (s * perp)
            extra_sym.append("H")
            extra_pos.append(o + unit(d) * O_H)
        extra_sym.append("O")
        extra_pos.append(o)

    all_sym = list(sym) + extra_sym
    all_pos = np.vstack([pos, np.array(extra_pos)])
    # paddlewheel.pdb has been re-centred into its 40 A cell by ASE, so the
    # model sits near (20,20,20); put the Cu-Cu midpoint back on the origin
    all_pos = all_pos - (pos[cu[0]] + pos[cu[1]]) / 2
    water = list(range(n0, n0 + 6))
    axial_o = [n0 + 2, n0 + 5]

    cut = {("Cu", "O"): 2.45, ("Cu", "Cu"): 2.7, ("O", "C"): 1.55,
           ("C", "C"): 1.75, ("C", "H"): 1.25, ("O", "H"): 1.1}
    tmp = Atoms(symbols=all_sym, positions=all_pos, cell=[60, 60, 60], pbc=False)
    ii, jj = neighbor_list("ij", tmp, cut)
    bonds = sorted({tuple(sorted((int(a), int(b)))) for a, b in zip(ii, jj)})
    water_bonds = [b for b in bonds if b[0] in water]

    data = {
        "atoms": [
            {"e": s, "x": round(float(p[0]), 4), "y": round(float(p[1]), 4), "z": round(float(p[2]), 4)}
            for s, p in zip(all_sym, all_pos)
        ],
        "bonds": [list(b) for b in bonds],
        "axialO": axial_o,
        "waterAtoms": water,
        "waterBonds": [list(b) for b in water_bonds],
    }
    json.dump(data, open(OUT_SOLVATED, "w"), separators=(",", ":"))
    print(f"{OUT_SOLVATED}: {len(all_sym)} atoms, {len(bonds)} bonds, "
          f"water {water}, axial O {axial_o}")


def build_tiling():
    atoms = read(CIF)
    sym = np.array(atoms.get_chemical_symbols())
    cell = np.array(atoms.cell)
    a = float(cell[0][0])
    ii, jj, dd = neighbor_list("ijd", atoms, 3.2)

    und = {}
    for i, j, d in zip(ii, jj, dd):
        x, y = int(min(i, j)), int(max(i, j))
        if (x, y) not in und or d < und[(x, y)]:
            und[(x, y)] = float(d)
    adj = {k: [] for k in range(len(atoms))}
    for (x, y), d in und.items():
        adj[x].append((y, d))
        adj[y].append((x, d))

    def micv(i, j):
        return atoms.get_distance(i, j, mic=True, vector=True)

    cu_pairs = sorted({(x, y) for (x, y), d in und.items()
                       if sym[x] == "Cu" and sym[y] == "Cu" and d < 2.8})
    pw_pos = np.array([atoms.positions[i] + micv(i, j) / 2 for i, j in cu_pairs])
    cu2pw = {}
    for k, (i, j) in enumerate(cu_pairs):
        cu2pw[i] = cu2pw[j] = k

    coo_c = [c for c in range(len(atoms)) if sym[c] == "C" and
             sum(1 for b, d in adj[c] if sym[b] == "O" and d < 1.45) == 2]
    coo_pw = {}
    for c in coo_c:
        pws = set()
        for o, do in adj[c]:
            if sym[o] != "O" or do >= 1.45:
                continue
            for b, db in adj[o]:
                if sym[b] == "Cu" and db < 2.4:
                    pws.add(cu2pw[b])
        assert len(pws) == 1, f"carboxylate C{c} bridges {len(pws)} paddlewheels"
        coo_pw[c] = pws.pop()

    coo_set = set(coo_c)
    ring_c = [c for c in range(len(atoms)) if sym[c] == "C" and c not in coo_set]
    parent = {c: c for c in ring_c}

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    for c in ring_c:
        for b, d in adj[c]:
            if d < 1.6 and b in parent:
                ra, rb = find(c), find(b)
                if ra != rb:
                    parent[ra] = rb
    comps = {}
    for c in ring_c:
        comps.setdefault(find(c), []).append(c)
    sizes = sorted(len(v) for v in comps.values())
    print(f"ring carbon components: {len(comps)} (sizes {sorted(set(sizes))}, "
          f"isolated {sizes.count(1)} -> structure-envelope scatter, ignored)")

    tris = []
    for group in comps.values():
        if len(group) != 6:
            continue
        attached = sorted({coo_pw[c] for c in coo_c
                           if any(b == c and d < 1.6 for g in group for b, d in adj[g])})
        if len(attached) != 3:
            continue
        tris.append(attached)
    assert len(pw_pos) == 24, len(pw_pos)
    assert len(tris) == 32, len(tris)
    print(f"paddlewheels {len(pw_pos)} | BTC triangles {len(tris)}")

    # base cell: the 3 paddlewheels of every triangle as periodic shifts
    rel = []
    for p1, p2, p3 in tris:
        shifts = []
        for p in (p1, p2, p3):
            d = micv(cu_pairs[p1][0], cu_pairs[p][0]) - (pw_pos[p] - pw_pos[p1])
            shifts.append(np.rint(d / a).astype(int))
        rel.append((p1, p2, p3, shifts))

    npw = len(pw_pos)
    n_cells = REPEAT ** 3
    nodes = np.zeros((n_cells * npw, 3))
    for ci in range(n_cells):
        i, rem = divmod(ci, REPEAT * REPEAT)
        j, k = divmod(rem, REPEAT)
        # pw_pos is the fractional-in-cell coordinate (0..a): subtract half a cell
        # so the block is centred on the origin, not on a corner of the cell
        nodes[ci * npw:(ci + 1) * npw] = (pw_pos - a / 2.0) + (np.array([i, j, k]) - (REPEAT - 1) / 2.0) * a

    def gidx(i, j, k, p):
        return ((i * REPEAT + j) * REPEAT + k) * npw + p

    triangles, dropped = [], 0
    for ci in range(n_cells):
        i, rem = divmod(ci, REPEAT * REPEAT)
        j, k = divmod(rem, REPEAT)
        for p1, p2, p3, shifts in rel:
            idx, ok = [], True
            for p, sh in zip((p1, p2, p3), shifts):
                i2, j2, k2 = i + int(sh[0]), j + int(sh[1]), k + int(sh[2])
                if not (0 <= i2 < REPEAT and 0 <= j2 < REPEAT and 0 <= k2 < REPEAT):
                    ok = False
                    break
                idx.append(gidx(i2, j2, k2, int(p)))
            if ok:
                triangles.append(idx)
            else:
                dropped += 1

    deg = np.zeros(len(nodes), int)
    for t in triangles:
        for q in t:
            deg[q] += 1
    print(f"triangles kept {len(triangles)} (dropped {dropped} at the box edge)")
    print(f"paddlewheel triangle degree: {dict(zip(*np.unique(deg, return_counts=True)))}")

    sides = []
    for t in triangles:
        for u, v in ((t[0], t[1]), (t[1], t[2]), (t[2], t[0])):
            sides.append(np.linalg.norm(nodes[u] - nodes[v]))
    sides = np.array(sides)
    print(f"triangle side: min {sides.min():.2f} max {sides.max():.2f} mean {sides.mean():.2f} A")
    assert sides.max() < 22, "cross-cell bogus edge still present"

    # keep only nodes that belong to at least one kept triangle
    used = sorted({q for t in triangles for q in t})
    remap = {old: new for new, old in enumerate(used)}
    nodes = nodes[used]
    triangles = [[remap[q] for q in t] for t in triangles]
    print(f"trimmed orphan nodes: {len(remap)} of {len(deg)} kept")
    # centre on the centroid so the camera and the growth animation are symmetric
    nodes = nodes - nodes.mean(axis=0)

    data = {
        "a": round(a, 4),
        "repeat": REPEAT,
        "nodes": [[round(float(c), 3) for c in p] for p in nodes],
        "triangles": triangles,
    }
    json.dump(data, open(OUT_TILING, "w"), separators=(",", ":"))
    print(f"{OUT_TILING}: {len(nodes)} nodes, {len(triangles)} triangles, {len(sides)} sides")


build_solvated()
build_tiling()
