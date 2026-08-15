// ===================================
// CSS BATTLE — TARGET BANK
// Used by CSSBattle (typing-game.js). Loaded before it in index.html.
//
// Shape: { tier, title, brief, html, hint }
// - tier: 1 easy (25 marks) | 2 medium (35) | 3 hard (40); each game deals
//   one random target per tier, played easy -> hard.
// - html: reference markup rendered in a 240x180 white canvas. It is the
//   PICTURE to copy — players recreate the look with ONE .box div + CSS.
// - Grading is pixel-based (ink match), so colors/sizes/positions matter.
// ===================================

window.CSS_TARGETS = [
    // ---------- TIER 1 · EASY ----------
    {
        tier: 1, title: 'Red Square',
        brief: 'A crisp 80×80 red (#e53935) square, dead centre.',
        html: '<div style="position:absolute;left:80px;top:50px;width:80px;height:80px;background:#e53935"></div>',
        hint: '.box { position:absolute; left:80px; top:50px; width:80px; height:80px; background:#e53935 }'
    },
    {
        tier: 1, title: 'Blue Dot',
        brief: 'A 90px blue (#1e88e5) circle in the centre.',
        html: '<div style="position:absolute;left:75px;top:45px;width:90px;height:90px;border-radius:50%;background:#1e88e5"></div>',
        hint: 'border-radius:50% turns a square into a circle. Centre is left:75px; top:45px.'
    },
    {
        tier: 1, title: 'Sunset Strip',
        brief: 'A full-width orange (#fb8c00) bar, 40px tall, glued to the bottom.',
        html: '<div style="position:absolute;left:0;bottom:0;width:240px;height:40px;background:#fb8c00"></div>',
        hint: 'position:absolute; bottom:0 pins it down. Full width = 240px.'
    },
    {
        tier: 1, title: 'Half & Half',
        brief: 'The entire left half filled green (#43a047).',
        html: '<div style="position:absolute;left:0;top:0;width:120px;height:180px;background:#43a047"></div>',
        hint: 'The canvas is 240×180 — half of it is a 120×180 block at left:0; top:0.'
    },
    {
        tier: 1, title: 'Rounded Mint',
        brief: 'A 100×100 mint (#26a69a) square with 20px rounded corners, centred.',
        html: '<div style="position:absolute;left:70px;top:40px;width:100px;height:100px;border-radius:20px;background:#26a69a"></div>',
        hint: 'border-radius:20px softens the corners. Centre at left:70px; top:40px.'
    },
    {
        tier: 1, title: 'Purple Pill',
        brief: 'A 140×60 purple (#8e24aa) pill (fully rounded ends), centred.',
        html: '<div style="position:absolute;left:50px;top:60px;width:140px;height:60px;border-radius:30px;background:#8e24aa"></div>',
        hint: 'A pill is border-radius = half the height (30px here).'
    },
    {
        tier: 1, title: 'Corner Patch',
        brief: 'A 70×70 yellow (#fdd835) square tucked into the top-right corner.',
        html: '<div style="position:absolute;right:0;top:0;width:70px;height:70px;background:#fdd835"></div>',
        hint: 'Use right:0; top:0 instead of calculating left.'
    },

    // ---------- TIER 2 · MEDIUM ----------
    {
        tier: 2, title: 'Twin Dots',
        brief: 'Two 60px coral (#ff7043) circles side by side, 30px apart, centred as a pair.',
        html: '<div style="position:absolute;left:45px;top:60px;width:60px;height:60px;border-radius:50%;background:#ff7043"></div><div style="position:absolute;left:135px;top:60px;width:60px;height:60px;border-radius:50%;background:#ff7043"></div>',
        hint: 'One div + box-shadow: 90px 0 0 #ff7043 paints the twin.'
    },
    {
        tier: 2, title: 'The Ring',
        brief: 'A teal (#00897b) ring: 100px outer, 20px thick, hollow centre, centred.',
        html: '<div style="position:absolute;left:70px;top:40px;width:60px;height:60px;border:20px solid #00897b;border-radius:50%;background:#fff"></div>',
        hint: 'A ring is just border:20px solid + border-radius:50% on a white box.'
    },
    {
        tier: 2, title: 'Diagonal Split',
        brief: 'The whole canvas split corner to corner: navy (#283593) below-left, white above-right.',
        html: '<div style="position:absolute;left:0;top:0;width:240px;height:180px;background:linear-gradient(to top right,#283593 50%,#ffffff 50%)"></div>',
        hint: 'linear-gradient(to top right, #283593 50%, #fff 50%) — hard colour stop.'
    },
    {
        tier: 2, title: 'Triple Stripes',
        brief: 'Three equal vertical stripes: crimson (#d81b60), gold (#ffca28), crimson.',
        html: '<div style="position:absolute;left:0;top:0;width:240px;height:180px;background:linear-gradient(to right,#d81b60 33.33%,#ffca28 33.33%,#ffca28 66.66%,#d81b60 66.66%)"></div>',
        hint: 'One gradient with hard stops at 33.33% and 66.66% paints all three.'
    },
    {
        tier: 2, title: 'Framed',
        brief: 'A white 60×60 centre wrapped in a chunky 15px coral (#ef5350) frame, centred.',
        html: '<div style="position:absolute;left:75px;top:45px;width:60px;height:60px;border:15px solid #ef5350;background:#fff"></div>',
        hint: 'border:15px solid #ef5350 around a white 60×60 box. Borders add to the size!'
    },
    {
        tier: 2, title: 'Half Moon',
        brief: 'An indigo (#5c6bc0) dome: 110px wide semicircle sitting flat, centred.',
        html: '<div style="position:absolute;left:65px;top:62px;width:110px;height:55px;border-radius:55px 55px 0 0;background:#5c6bc0"></div>',
        hint: 'border-radius: 55px 55px 0 0 rounds only the top corners.'
    },
    {
        tier: 2, title: 'Leaf',
        brief: 'A 120×120 green (#7cb342) leaf: opposite corners rounded (60px), the other two sharp. Centred.',
        html: '<div style="position:absolute;left:60px;top:30px;width:120px;height:120px;border-radius:60px 0 60px 0;background:#7cb342"></div>',
        hint: 'border-radius: 60px 0 60px 0 — alternate corners make the leaf.'
    },

    // ---------- TIER 3 · HARD ----------
    {
        tier: 3, title: 'Bullseye',
        brief: 'Concentric target: red (#e53935) core 40px, white ring, red outer ring 120px. Centred.',
        html: '<div style="position:absolute;left:60px;top:30px;width:120px;height:120px;border-radius:50%;background:radial-gradient(circle,#e53935 20px,#ffffff 20px,#ffffff 40px,#e53935 40px,#e53935 60px)"></div>',
        hint: 'radial-gradient(circle, #e53935 20px, #fff 20px, #fff 40px, #e53935 40px) + border-radius:50%.'
    },
    {
        tier: 3, title: 'Checkers',
        brief: 'A 2×2 checkerboard filling the canvas: slate (#455a64) and amber (#ffb300), slate top-left.',
        html: '<div style="position:absolute;left:0;top:0;width:120px;height:90px;background:#455a64"></div><div style="position:absolute;left:120px;top:0;width:120px;height:90px;background:#ffb300"></div><div style="position:absolute;left:0;top:90px;width:120px;height:90px;background:#ffb300"></div><div style="position:absolute;left:120px;top:90px;width:120px;height:90px;background:#455a64"></div>',
        hint: 'conic-gradient(#455a64 25%, #ffb300 25% 50%, #455a64 50% 75%, #ffb300 75%) — or paint quadrants with a gradient per axis.'
    },
    {
        tier: 3, title: 'Traffic Dots',
        brief: 'Three 40px circles stacked vertically, 10px gaps, centred: red (#e53935), yellow (#fdd835), green (#43a047).',
        html: '<div style="position:absolute;left:100px;top:15px;width:40px;height:40px;border-radius:50%;background:#e53935"></div><div style="position:absolute;left:100px;top:70px;width:40px;height:40px;border-radius:50%;background:#fdd835"></div><div style="position:absolute;left:100px;top:125px;width:40px;height:40px;border-radius:50%;background:#43a047"></div>',
        hint: 'One red circle + box-shadow: 0 55px 0 #fdd835, 0 110px 0 #43a047.'
    },
    {
        tier: 3, title: 'Diamond',
        brief: 'An 80×80 goldenrod (#f9a825) square rotated 45° — a diamond, centred.',
        html: '<div style="position:absolute;left:80px;top:50px;width:80px;height:80px;background:#f9a825;transform:rotate(45deg)"></div>',
        hint: 'transform: rotate(45deg) on a centred square.'
    },
    {
        tier: 3, title: 'Corner Dots',
        brief: 'Four 30px navy (#283593) circles, one near each corner (20px inset).',
        html: '<div style="position:absolute;left:20px;top:20px;width:30px;height:30px;border-radius:50%;background:#283593"></div><div style="position:absolute;right:20px;top:20px;width:30px;height:30px;border-radius:50%;background:#283593"></div><div style="position:absolute;left:20px;bottom:20px;width:30px;height:30px;border-radius:50%;background:#283593"></div><div style="position:absolute;right:20px;bottom:20px;width:30px;height:30px;border-radius:50%;background:#283593"></div>',
        hint: 'One dot + box-shadow: 170px 0 0, 0 110px 0, 170px 110px 0 (same colour).'
    },
    {
        tier: 3, title: 'Sunrise',
        brief: 'An orange (#fb8c00) sun, 120px wide, rising half-visible from the bottom edge, centred.',
        html: '<div style="position:absolute;left:60px;top:120px;width:120px;height:60px;border-radius:60px 60px 0 0;background:#fb8c00"></div>',
        hint: 'A 120×60 box at the bottom with border-radius: 60px 60px 0 0.'
    },
    {
        tier: 3, title: 'Neon Sandwich',
        brief: 'Three equal horizontal bands: cyan (#00acc1), black (#212121), cyan.',
        html: '<div style="position:absolute;left:0;top:0;width:240px;height:180px;background:linear-gradient(to bottom,#00acc1 33.33%,#212121 33.33%,#212121 66.66%,#00acc1 66.66%)"></div>',
        hint: 'linear-gradient(to bottom, ...) with hard stops at 33.33% and 66.66%.'
    }
];
