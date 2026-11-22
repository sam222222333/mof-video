# Voice-over script and picture cues (draft, ~150 words per minute)

> Now lets take a look at the organic linkers. A base is used to deprotonate the acidic proton or protons on the linker molecule creating an anionic donor. These donors bind to the metal cations with their lone pairs. A good linker has a rigid core so the nodes remain a fixed distance apart and the pores don’t collapse. They are often based around a N-heterocycle or a benzene ring such as the benzene-1,3,5-tricarboxylate anion used in MOF-199. Because this is a tricarboxylic acid it has three binding groups (known as tritopic) 120° apart giving it a trigonal planar shape and creating the “paddles” of the paddlewheel. Carboxylates are hard linkers used to bind high valence cations whereas a soft linker like pyrazolate is used to bind transition metals in the +2 oxidation state. The length of different linkers is used to customise the size of the pores.

| Sentence | Frames (30 fps) | Picture |
|---|---|---|
| Now lets take a look at the organic linkers | 0–120 | title ORGANIC LINKERS; neutral acid and imidazole appear |
| A base is used to deprotonate ... anionic donor | 120–335 | H leaves as H⁺; charges appear; imidazolate resonance forms |
| These donors bind to the metal cations with their lone pairs | 335–470 | lone pairs, metal cations, dashed bonds |
| A good linker has a rigid core ... pores don’t collapse | 470–710 | framework cell squeezed from the corners, nothing moves |
| often based around N-heterocycle or benzene ... BTC ... MOF-199 | 710–950 | imidazole, benzene ring, then BTC (named, MOF-199) |
| tricarboxylic acid ... tritopic ... 120° ... trigonal planar ... paddles | 950–1290 | BTC moves left, 120° arcs, paddlewheel with four paddles |
| Carboxylates hard ... pyrazolate soft | 1290–1620 | carboxylate + M⁴⁺, pyrazolate + M²⁺ |
| The length of different linkers ... size of the pores | 1620–1810 | cell grows one ring to two; "longer linker → bigger pore" |
| (end hold) | 1810–1830 | fade out |

To re-time to the real recording: change the frame numbers in `src/organic/OrganicLinkers.tsx`
(search for the `ramp(F, ...)` and `win(F, ...)` calls in `OrganicLinkers`).

## Suggested wording change (to avoid the Cu(II) tension)

MOF-199 is a copper(II) carboxylate framework, so say "generally":

> Carboxylates are generally hard linkers used to bind high valence cations, whereas a soft linker like pyrazolate is typically used to bind transition metals in the +2 oxidation state.

The on-screen text already says "typically".
