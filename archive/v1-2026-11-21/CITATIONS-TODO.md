# Citations and figures still needed

The film currently carries two citations — Chui 1999 and Müller 2017 — and they
cover only the crystal structure and the colour mechanism. Everything else is
stated on screen without a source, and every scene is a schematic drawing: there
is no photograph, micrograph, spectrum or device image anywhere in the cut.

This file lists, scene by scene, what is cited today, what still needs a source,
and what real image each beat is missing. Please fill in the `Source` lines and
drop the files into `public/figures/`, then we can place them.

Naming convention for dropped files: `<scene>-<beat>-<what>.<ext>`,
e.g. `07-co2-capture-pilot-plant.jpg`.

---

## Already cited

| Where | Claim on screen | Citation |
|---|---|---|
| 04 paddlewheel | Cu–Cu 2.628 Å, Cu–O(eq) 1.952 Å | Chui et al., *Science* 1999 |
| 04 open site | Cu–OH₂ 2.165 Å | Chui et al., *Science* 1999 |
| 06 colour | defect green, low-defect HKUST-1 nearly colourless, UV–vis + CASSCF | Müller et al., *ACS Appl. Mater. Interfaces* 2017, 9, 37463 (doi 10.1021/acsami.7b12045) |
| 01 hook | 1 g = 10,400 m² (Langmuir), BET 6,240 m²/g | Furukawa et al., *Science* 2010, 329, 424 |

---

## 01 · hook — 0:00–0:12

**On screen** — "1 gram of MOF-210 can have a surface area of up to ~40 tennis
courts", with the Langmuir/BET caveat and the court dimensions.

**Cited** — Furukawa 2010 for both areas.

**Still needed**
- [ ] Primary citation, full author list and page range — `Source:`
- [ ] Is MOF-210 the right example for *this* film? The film is about HKUST-1.
      If the number should come from HKUST-1 instead, a source is needed.
- [ ] Real image: none required, but a TEM or photo of the powder would help.
      `public/figures/01-hook-mof210-powder.jpg`

---

## 02 · general info — 0:12–0:48

**On screen** — "What is a metal–organic framework?", ordered, crystalline, the
2D lattice turning into a 3D framework.

**Cited** — nothing.

**Still needed**
- [ ] Definition source (a review is fine — Furukawa 2013, Zhou 2012, or a
      textbook chapter). `Source:`
- [ ] Real image: an actual MOF crystal photograph or SEM micrograph, ideally a
      single crystal of HKUST-1 showing the blue colour.
      `public/figures/02-general-hkust1-crystals.jpg`
- [ ] Real image (optional): a diffraction pattern or the published crystal
      packing diagram to stand in for "ordered, crystalline".
      `public/figures/02-general-xrd.png`

---

## 04 · inorganic — 0:48–1:50

Beats: node geometry → modularity → paddlewheel distances → HSAB → open site →
degradation in water.

**Cited** — Chui 1999 for the three distances only.

**Still needed**
- [ ] Node geometry table (Zn₄O / Cu₂ paddlewheel / Zr₆O₄(OH)₄, 6/4/12
      connections). One source per framework, or a single review.
      `Source MOF-5:` `Source HKUST-1:` `Source UiO-66:`
- [ ] Paddlewheel electron density or an ORTEP-style figure from Chui 1999 —
      permission to reproduce. `public/figures/04-paddlewheel-ortep.png`
- [ ] HSAB theory: original Pearson reference (1963) plus a MOF-specific
      application. `Source:`
- [ ] "Early MOFs degraded and collapsed on exposure to moisture and heat" —
      needs a stability source. Candidates: HKUST-1 hydrolysis studies, or the
      UiO-66 / ZIF water-stability comparison. `Source:`
- [ ] Real image: a before/after colour photo of HKUST-1 powder exposed to
      humidity. `public/figures/04-degradation-before-after.jpg`
- [ ] Real image: the actual paddlewheel rendered from the deposited CIF, if we
      want to replace the schematic balls with measured geometry.
      `public/figures/04-paddlewheel-cif.png`

**Open chemistry question** — the film says the paddlewheel loses water and the
Cu becomes a Lewis acid that binds CO₂. That is the standard HKUST-1 activation
story, but it needs one explicit source for the CO₂ binding site.
`Source:`

---

## 05 · organic — 1:50–2:50

Beats: deprotonation (carboxylate, imidazolate) → BTC → rigid core → geometry →
length.

**Cited** — nothing.

**Still needed**
- [ ] Deprotonation / anionic donor statement — a linker-chemistry review.
      `Source:`
- [ ] BTC (benzene-1,3,5-tricarboxylate) as the MOF-199 linker — Chui 1999
      already covers this, but confirm the naming convention (MOF-199 vs HKUST-1)
      is cited to the same paper. `Source:`
- [ ] "A good linker has a rigid core, defined geometry, right length" — this is
      textbook framing; needs a review that states it in these terms.
      `Source:`
- [ ] Tritopic 120° geometry — trivial, but cite a structures review.
      `Source:`
- [ ] Linker length / pore size relationship — needs a source if we keep the
      claim specific. `Source:`
- [ ] Real image: the three organic linkers as published chemical structures, or
      a photograph of the reagents. `public/figures/05-linkers-reagents.jpg`

---

## 06 · colour — 2:50–3:33

Beats: two octahedra → missing linker → d–d transition → UV–vis bands →
turquoise vs deep blue → heat under vacuum restores.

**Cited** — Müller 2017 for everything on this page, which is thin for the
number of claims.

**Still needed**
- [ ] The actual UV–vis reflectance spectrum from Müller 2017, if we can
      reproduce it. Right now the band positions (570–600 nm, 600–650 nm) are
      drawn as a schematic.
      `public/figures/06-uvvis-spectrum.png`
- [ ] Colour photographs of the real powders: as-made (turquoise), activated
      (deep blue), defect-rich (green). Müller 2017 has these.
      `public/figures/06-powders-turquoise.jpg`, `-deepblue.jpg`, `-green.jpg`
- [ ] d–d transition energy values, if we want to put numbers on the diagram
      instead of a schematic Δ. `Source:`
- [ ] Crystal-field / Tanabe–Sugano reference for the square planar ↔ square
      pyramidal splitting argument. `Source:`
- [ ] Jahn–Teller: original paper (Jahn & Teller 1937) plus a Cu(II) specific
      treatment. `Source:`

---

## 07 · current uses — 3:33–4:11

Beats: catalysis → CO₂ capture → gas storage → water from desert air.

**Cited** — nothing on this page at all.

**Still needed**
- [ ] Catalysis: one concrete industrial or flagship example with a citation.
      Currently the beat shows a generic sphere on a ring.
      `Source:` `public/figures/07-catalysis-example.jpg`
- [ ] CO₂ capture: a real capture capacity number, plus the pilot plant or
      sorbent photo. `Source:` `public/figures/07-co2-plant.jpg`
- [ ] Gas storage: methane or hydrogen uptake figure, plus a photo of a storage
      vessel. `Source:` `public/figures/07-gas-storage.jpg`
- [ ] Water from desert air: the Al/Zr MOF claim needs its own source — this is
      almost certainly the MOF-303 / Cr-soc-MOF atmospheric water harvesting work.
      `Source:` `public/figures/07-desert-device.jpg`
- [ ] The desert scene itself is a rendered illustration. If a photo of the real
      harvester exists, it should replace or accompany it.

---

## 08 · future — 4:11–4:52

Beats: batch → continuous flow → drug delivery → conductive MOFs → solid-state
batteries → rare-earth reduction → grid storage.

**Cited** — nothing on this page at all.

**Still needed**
- [ ] Continuous-flow MOF production: a real paper and, ideally, a reactor photo.
      `Source:` `public/figures/08-flow-reactor.jpg`
- [ ] MOF nano-carriers for drug delivery: a specific study with loading capacity
      and a targeting mechanism, not the generic statement currently on screen.
      `Source:` `public/figures/08-drug-delivery.jpg`
- [ ] Conductive MOFs: the delocalisation claim needs a citation (the 2D
      honeycomb family — Ni-HITP, Cu-HHTP and similar). `Source:`
- [ ] Solid-state battery electrode application: a real cell result.
      `Source:`
- [ ] "Reduce reliance on rare earth minerals" — this is a strong claim and needs
      a source or should be softened. `Source:`
- [ ] Grid storage capacity numbers. `Source:`

---

## Summary

| Scene | Cited today | Needs a source | Needs a real image |
|---|---|---|---|
| 01 hook | 1 | 1 | 0–1 |
| 02 general | 0 | 1 | 2 |
| 04 inorganic | 1 (distances) | 5 | 3 |
| 05 organic | 0 | 5 | 1 |
| 06 colour | 1 | 5 | 3 |
| 07 current uses | 0 | 4 | 4 |
| 08 future | 0 | 6 | 2 |
| **total** | **3** | **27** | **15** |

Roughly 27 sources and 15 images. The two heaviest gaps are **07 current uses**
(nothing is cited on a page that makes four concrete performance claims) and
**08 future** (seven forward-looking claims, no citations).
