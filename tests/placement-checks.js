/* Placement invariants, run inside the app page (window context). Returns a list of violations.
   Used by tests/run-placement.mjs (headless Chromium) — no WebGL needed. */
window.placementChecks = function placementChecks(D, o) {
  const out = [], TALL = ['wardrobe', 'fridge'], EPS = 0.02;
  const inside = (q, R) => q.x >= R.x - EPS && q.y >= R.y - EPS && q.x + q.w <= R.x + R.w + EPS && q.y + q.h <= R.y + R.h + EPS;
  o.floors.forEach(F => {
    const SW = swingsOf(D, o, F), ops = openingsFor(D, o, F);
    F.rooms.forEach(room => {
      if (room.void) return;
      const items = furnOf(D, o, F, room), solids = items.filter(p => p.solid && !p.veh), tag = (p, msg) => out.push({ floor: F.fi, room: room.type, role: p.role, msg, rect: [p.x, p.y, p.w, p.h].map(v => +(+v).toFixed(2)) });
      solids.forEach((p, i) => {
        if (!inside(p, room.rect)) tag(p, 'outside room');
        if (room.subs.some(s => ovl(p, s) > 0.04)) tag(p, 'inside a bath / pooja sub-room');
        // door leaves: every swing on the floor, including doors of neighbouring rooms that open into this one
        SW.forEach(s => { if (s.sq ? hitSwing(p, s) : ovl(p, s) > 0.04) tag(p, 'in a door swing'); });
        // nothing big right in front of a door: at least 2 ft clear (3 ft wherever the room allows; the kitchen platform along its walls is let off)
        if (!['counter', 'hob', 'sink', 'chair'].includes(p.role) && !p.pinned && roomEntries(D, o, F, room).some(([x, y]) => ovl(p, { x: x - 1, y: y - 1, w: 2, h: 2 }) > 0.04)) tag(p, 'in front of a door');
        solids.slice(i + 1).forEach(q => { const tucked = (p.role === 'dtable' && q.role === 'chair' && (p.parts || []).includes(q)) || (q.role === 'dtable' && p.role === 'chair' && (q.parts || []).includes(p)); if (!tucked && ovl(p, q) > 0.04) tag(p, 'overlaps ' + q.role); });
        // tall pieces must not stand in front of a window or french door
        if (TALL.includes(p.role)) ops.filter(op => op.kind === 'window' || op.kind === 'french').forEach(op => {
          const [x1, y1, x2, y2] = op.seg, hz = Math.abs(y1 - y2) < 0.01, a = Math.min(hz ? x1 : y1, hz ? x2 : y2), z = Math.max(hz ? x1 : y1, hz ? x2 : y2), at = hz ? y1 : x1;
          const band = hz ? { x: a, y: at - 1.2, w: z - a, h: 2.4 } : { x: at - 1.2, y: a, w: 2.4, h: z - a };
          if (ovl(p, band) > 0.04) tag(p, 'blocks a ' + op.kind);
        });
      });
      // a 2 ft path from the first door to every other door and to the front of every piece
      const ent = roomEntries(D, o, F, room), targets = items.filter(p => p.clr).map(p => p.clr);
      // only furniture is judged here: a room whose own shape already has no 2 ft path is a plan note, not a placement fault
      if (ent.length && walkCheck(room, [], ent, []) && !walkCheck(room, solids, ent, targets)) out.push({ floor: F.fi, room: room.type, role: '-', msg: 'walking path blocked', rect: [] });
    });
  });
  // Vastu: the pooja never shares a wall with a toilet, and no toilet sits above it
  o.floors.forEach(F => F.rooms.forEach(room => room.subs.forEach(s => { if (s.type === 'pooja' && poojaClash(o.floors, F, s)) out.push({ floor: F.fi, room: room.type, role: 'pooja', msg: 'pooja next to or under a toilet', rect: [s.x, s.y, s.w, s.h] }); })));
  return out;
};
