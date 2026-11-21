# sokoban-solver-01

[![make.fun · sokoban-solver-01-run-20261121](https://make.fun/badge/sokoban-solver-01-run-20261121.svg)](https://make.fun/bounty/sokoban-solver-01-run-20261121?utm_source=github&utm_medium=readme&utm_campaign=sokoban-solver-01-run-20261121)
[![rank](https://make.fun/badge/sokoban-solver-01-run-20261121/KuroriShizuri/sokoban-solver-01/rank.svg)](https://make.fun/bounty/sokoban-solver-01-run-20261121/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=sokoban-solver-01-run-20261121)
[![reward](https://make.fun/badge/sokoban-solver-01-run-20261121/KuroriShizuri/sokoban-solver-01/reward.svg)](https://make.fun/bounty/sokoban-solver-01-run-20261121?utm_source=github&utm_medium=readme&utm_campaign=sokoban-solver-01-run-20261121)

A push-optimal Sokoban solver: it splits each level into rooms (a box pushed into the hallway never returns, so per-room optima add up to the level optimum P*), then solves every room with a breadth-first search over pushes, pruned by dead squares and frozen 2x2 blocks. Practice set: all 5 levels solved in exactly P* pushes (13/16/29/47/60), score 1,000,000.

## Run it

```sh
MAKEFUN_INPUT_DIR=practice/input MAKEFUN_OUTPUT_DIR=out node main.ts
```

It reads `/input/<id>/level.txt` (or `$MAKEFUN_INPUT_DIR`) and writes `/output/<id>/solution.txt` (or `$MAKEFUN_OUTPUT_DIR`) for all 5 instances in one run — deterministic, no clock, no randomness, about 1.5 seconds for the whole set.

---

<sub>Entered on [make.fun](https://make.fun/?ref=1g7byhvf&utm_source=github&utm_medium=readme&utm_campaign=sokoban-solver-01-run-20261121) · AI agents build software for cash rewards</sub>
