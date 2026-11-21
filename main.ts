// Push-optimal Sokoban solver. Rooms are independent (a box pushed into the
// hallway never returns), so per-room optima add up to P*. Each room: BFS over
// pushes, pruned by dead squares and frozen 2x2 blocks. No clock, no randomness.
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const I = process.env.MAKEFUN_INPUT_DIR ?? '/input';
const O = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const MAX = 250000;
const D = [[0, -1, 'u', 'U'], [0, 1, 'd', 'D'], [-1, 0, 'l', 'L'], [1, 0, 'r', 'R']];
function parse(t) {
  const r = t.split('\n').filter((x) => x.length), h = r.length, w = Math.max(...r.map((x) => x.length));
  const wall = new Uint8Array(w * h).fill(1), goals = [], boxes = [];
  let p = -1;
  r.forEach((row, y) => { for (let x = 0; x < row.length; x++) {
    const i = y * w + x, c = row[x];
    if (c === '#') continue;
    wall[i] = 0;
    if ('.*+'.includes(c)) goals.push(i);
    if ('$*'.includes(c)) boxes.push(i);
    if ('@+'.includes(c)) p = i; } });
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (!x || !y || x === w - 1 || y === h - 1) wall[y * w + x] = 1;
  return { w, h, wall, goals, boxes: boxes.sort((a, b) => a - b), player: p };
}
function live(lv) {
  const { w, wall, goals } = lv, L = new Uint8Array(wall.length), q = [...goals];
  for (const g of goals) L[g] = 1;
  for (let i = 0; i < q.length; i++) { const x = q[i];
    for (const [dx, dy] of D) { const d = dy * w + dx, y = x - d;
      if (!wall[y] && !wall[y - d] && !L[y]) { L[y] = 1; q.push(y); } } }
  return L;
}
function reach(w, wall, occ, from, seen, stamp, stack) {
  let low = from, n = 0;
  stack[n++] = from; seen[from] = stamp;
  while (n > 0) { const p = stack[--n];
    if (p < low) low = p;
    for (const q of [p - w, p + w, p - 1, p + 1])
      if (!wall[q] && !occ[q] && seen[q] !== stamp) { seen[q] = stamp; stack[n++] = q; } }
  return low;
}
function frz(w, wall, occ, goal, t) {
  for (const a of [t, t - 1, t - w, t - w - 1]) { const b = a + 1, c = a + w, d = c + 1;
    if ((wall[a] || occ[a]) && (wall[b] || occ[b]) && (wall[c] || occ[c]) && (wall[d] || occ[d])
      && ((occ[a] && !goal[a]) || (occ[b] && !goal[b]) || (occ[c] && !goal[c]) || (occ[d] && !goal[d]))) return true; }
  return false;
}
function walk(w, wall, occ, from, to) {
  if (from === to) return '';
  const prev = new Int32Array(wall.length).fill(-1), how = new Array(wall.length), q = [from];
  prev[from] = from;
  for (let i = 0; i < q.length; i++) { const p = q[i];
    if (p === to) break;
    for (const [dx, dy, c] of D) { const s = p + dy * w + dx;
      if (wall[s] || occ[s] || prev[s] !== -1) continue;
      prev[s] = p; how[s] = c; q.push(s); } }
  if (prev[to] === -1) throw new Error('unreachable');
  let s = '';
  for (let p = to; p !== from; p = prev[p]) s = how[p] + s;
  return s;
}
function sp(lv, max = MAX) {
  const { w, wall, goals, player } = lv, size = wall.length, goal = new Uint8Array(size);
  for (const g of goals) goal[g] = 1;
  const L = live(lv);
  if (lv.boxes.some((b) => !L[b])) return null;
  const occ = new Uint8Array(size), seen = new Int32Array(size), mark = new Int32Array(size), stack = new Int32Array(size);
  let stamp = 0;
  const done = (bs) => bs.every((b) => goal[b]);
  const key = (bs, low) => low + '|' + bs.join(',');
  const B = [lv.boxes], P = [player], par = [-1], ix = new Map();
  for (const b of lv.boxes) occ[b] = 1;
  ix.set(key(lv.boxes, reach(w, wall, occ, player, seen, ++stamp, stack)), 0);
  for (const b of lv.boxes) occ[b] = 0;
  let found = done(lv.boxes) ? 0 : -1;
  for (let h = 0; found < 0 && h < B.length; h++) {
    const bs = B[h];
    for (const b of bs) occ[b] = 1;
    reach(w, wall, occ, P[h], seen, ++stamp, stack);
    const here = stamp;
    for (let bi = 0; bi < bs.length && found < 0; bi++) { const b = bs[bi];
      for (const [dx, dy] of D) { const d = dy * w + dx, t = b + d;
        if (seen[b - d] !== here || wall[t] || occ[t] || !L[t]) continue;
        occ[b] = 0; occ[t] = 1;
        const f = frz(w, wall, occ, goal, t);
        let k = '', nx = null;
        if (!f) { nx = bs.slice(); nx[bi] = t; nx.sort((a, c) => a - c);
          k = key(nx, reach(w, wall, occ, b, mark, ++stamp, stack)); }
        occ[t] = 0; occ[b] = 1;
        if (f || ix.has(k)) continue;
        if (B.length >= max) { for (const x of bs) occ[x] = 0; return null; }
        ix.set(k, B.length);
        B.push(nx); P.push(b); par.push(h);
        if (done(nx)) { found = B.length - 1; break; } } }
    for (const x of bs) occ[x] = 0;
  }
  if (found < 0) return null;
  const path = [];
  for (let s = found; s > 0; s = par[s]) path.push(s);
  path.reverse();
  let moves = '', p = player, bs = lv.boxes;
  for (const s of path) { const nb = B[s];
    const from = bs.find((b) => !nb.includes(b)), to = nb.find((b) => !bs.includes(b)), d = to - from;
    const dir = D.find(([dx, dy]) => dy * w + dx === d);
    for (const b of bs) occ[b] = 1;
    moves += walk(w, wall, occ, p, from - d);
    for (const b of bs) occ[b] = 0;
    moves += dir[3]; p = from; bs = nb; }
  return { pushes: path.length, moves };
}
function rooms(lv) {
  const { w, wall, goals, boxes, player } = lv, L = live(lv), row = Math.floor(player / w);
  const cut = new Uint8Array(wall.length);
  for (let i = row * w; i < (row + 1) * w; i++) if (!wall[i] && !L[i]) cut[i] = 1;
  if (boxes.some((b) => cut[b])) return null;
  const part = new Int32Array(wall.length).fill(-1), R = [];
  for (let s = 0; s < wall.length; s++) {
    if (wall[s] || cut[s] || part[s] >= 0) continue;
    const sq = [s];
    part[s] = R.length;
    for (let i = 0; i < sq.length; i++) for (const [dx, dy] of D) { const q = sq[i] + dy * w + dx;
      if (!wall[q] && !cut[q] && part[q] < 0) { part[q] = R.length; sq.push(q); } }
    R.push({ boxes: [], goals: [], done: false });
  }
  for (const b of boxes) R[part[b]].boxes.push(b);
  for (const g of goals) if (part[g] >= 0) R[part[g]].goals.push(g);
  if (goals.some((g) => part[g] < 0) || R.some((r) => r.boxes.length !== r.goals.length)) return null;
  return R.filter((r) => r.boxes.length > 0);
}
function solve(text) {
  const lv = parse(text), R = rooms(lv);
  if (R === null) { const r = sp(lv); return r ? r.moves : ''; }
  let player = lv.player, moves = '';
  for (const room of R) {
    const wall = lv.wall.slice();
    for (const o of R) if (o !== room) for (const b of o.done ? o.goals : o.boxes) wall[b] = 1;
    const r = sp({ w: lv.w, h: lv.h, wall, goals: [...room.goals].sort((a, b) => a - b), boxes: [...room.boxes].sort((a, b) => a - b), player });
    if (r === null) return '';
    moves += r.moves;
    for (const c of r.moves.toLowerCase()) player += c === 'u' ? -lv.w : c === 'd' ? lv.w : c === 'l' ? -1 : 1;
    room.done = true;
  }
  return moves;
}
for (const id of readdirSync(I).sort()) {
  let m = '';
  try { m = solve(readFileSync(join(I, id, 'level.txt'), 'utf8')); } catch { m = ''; }
  mkdirSync(join(O, id), { recursive: true });
  writeFileSync(join(O, id, 'solution.txt'), m + '\n');
}
