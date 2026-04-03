'use strict';

// ═══════════════════════════════════════════════════════════════════════════
//  Elevator Scheduling Simulator — Application Logic
// ═══════════════════════════════════════════════════════════════════════════

// ── Constants ──────────────────────────────────────────────────────────────
const TICK_MS_MIN = 16;
const TICK_MS_MAX = 500;
const FLOOR_MOVE_TICKS = 8;
const DOOR_ANIM_TICKS = 8;
const DOOR_OPEN_TICKS_BASE = 20;
const DOOR_OPEN_TICKS_PER_PAX = 3;
const DOOR_OPEN_TICKS_MAX = 60;
const MAX_CAPACITY = 8;
const ENERGY_PER_FLOOR_BASE = 0.002;
const ENERGY_PER_FLOOR_PAX = 0.0005;
const AUTO_PAX_RATE_DEFAULT = 5;
const MAX_LOG_ENTRIES = 120;
const CHART_HISTORY = 120;
const ELEV_COLORS = ['#4fc3f7','#7c4dff','#00e676','#ff9100','#ff5252','#ffea00'];

// ── I18N ───────────────────────────────────────────────────────────────────
const I18N = {
  zh: {
    title:'电梯调度算法模拟器',
    labelAlgo:'算法', labelMode:'模式', labelFloors:'楼层', labelElevs:'电梯',
    labelApply:'应用', labelSpeed:'速度', labelAuto:'自动', labelAB:'A/B对比',
    btnStart:'开始', btnPause:'暂停', btnResume:'继续', btnReset:'重置',
    statusIdle:'就绪', statusRunning:'运行中', statusPaused:'已暂停',
    algoSCAN:'扫描算法 (SCAN)', algoFCFS:'先来先服务 (FCFS)',
    algoLOOK:'LOOK 算法', algoSSTF:'最短寻道优先 (SSTF)',
    modeNormal:'普通', modeZone:'分区', modeOddEven:'奇偶层',
    statCompleted:'已完成', statWaiting:'等待中',
    statAvgWait:'平均等待(s)', statAvgTravel:'平均行程(s)',
    statMaxWait:'最大等待(s)', statThroughput:'吞吐/分钟',
    statEmptyRate:'空载率%', statFullRate:'满载率%',
    statFloors:'总楼层移动', statEnergy:'电耗(kWh)',
    elevFloor:'楼层', elevStatus:'状态', elevPassengers:'乘客',
    elevIdle:'空闲', elevMoving:'运行中', elevOpen:'已开门',
    elevOpening:'开门中', elevClosing:'关门中',
    ctrlAddPassenger:'手动添加乘客', ctrlFrom:'出发楼层', ctrlTo:'目标楼层', ctrlAdd:'添加',
    ctrlAddDesc:'指定一位乘客的出发楼层和目标楼层，模拟该乘客呼叫电梯。',
    ctrlPresets:'场景预设',
    ctrlMorningRush:'🌅 早高峰', ctrlEveningRush:'🌆 晚高峰',
    ctrlLunchtime:'🍜 午餐时间', ctrlCrowd:'🏟️ 满员涌入',
    ctrlAutoRate:'自动生成频率',
    logEmpty:'暂无日志',
    algoDescTitle:'算法详解',
    zoneLow:'低区', zoneHigh:'高区', zoneOdd:'奇数层', zoneEven:'偶数层',
    zoneLowRange:'低区: {from}F - {to}F', zoneHighRange:'高区: {from}F - {to}F',
    zoneSplit:'分区分界层', zoneSplitDesc:'低区电梯服务 1F 到分界层，高区电梯服务分界层+1 到顶层。',
    crowdTriggered:'🏟️ 满员涌入: 第{floor}层 {n}名乘客',
    passengerAdded:'乘客: {from}F → {to}F',
    simReset:'模拟已重置',
    applied:'已应用: {floors}层 · {elevs}台电梯',
    autoOn:'自动生成: 已开启', autoOff:'自动生成: 已关闭',
    abEnabled:'A/B对比: 已开启', abDisabled:'A/B对比: 已关闭',
    abCompare:'A/B 算法对比', abAlgoA:'主算法 (A)', abAlgoB:'对比算法 (B)',
    abDesc:'开启后，两种算法将同时接收相同的乘客请求，对比各项性能指标。',
    abHowTo:'先在顶部选择主算法 A，再在下方选择对比算法 B，然后点击顶部「A/B对比」按钮开启。',
    metricCompleted:'完成数', metricAvgWait:'平均等待(s)',
    metricMaxWait:'最大等待(s)', metricAvgTravel:'平均行程(s)',
    metricThroughput:'吞吐/分钟', metricEnergy:'电耗(kWh)',
    metricEmptyRate:'空载率%', metricTotalFloors:'总楼层',
    abSelect:'请先开启 A/B 对比模式',
    chartWait:'平均等待', chartTravel:'平均行程',
    floorUp:'上行呼叫', floorDown:'下行呼叫',
    elevDir1:'↑', elevDirN1:'↓', elevDir0:'●',
    presetMorningDesc:'🌅 早高峰: 大量乘客从低层前往高层',
    presetEveningDesc:'🌆 晚高峰: 大量乘客从高层返回低层',
    presetLunchDesc:'🍜 午餐时间: 各层均有乘客需求',
    algoFCFSName:'先来先服务 (FCFS)', algoSCANName:'扫描算法 (SCAN)',
    algoLOOKName:'LOOK 算法', algoSSTFName:'最短寻道优先 (SSTF)',
    coreIdea:'核心思想', howWorks:'工作原理', pros:'优点', cons:'缺点', bestFor:'适用场景',
    fcfsCoreIdea:'按请求到达的先后顺序依次服务，不考虑当前位置。',
    fcfsHowWorks:'每个新请求添加到队列末尾；电梯按队列顺序逐一服务每个楼层，完成后处理下一个请求。',
    fcfsPros:'实现简单，公平（先到先服务），无饥饿问题。',
    fcfsCons:'效率低，可能造成大量空行程；重载情况下平均等待时间长。',
    fcfsBestFor:'低流量场景、公平性优先的场合、教学演示。',
    scanCoreIdea:'电梯在大楼内来回扫描，就像磁盘调度中的电梯算法。',
    scanHowWorks:'电梯朝一个方向移动，服务沿途所有请求，到达顶层（或底层）后反向，重复此过程。',
    scanPros:'避免方向反复变化，效率较高；对中间楼层公平。',
    scanCons:'端点楼层等待时间稍长；即使没有请求也会到达端点。',
    scanBestFor:'中高流量场景、分布均匀的请求、通用电梯系统。',
    lookCoreIdea:'SCAN的改进版：只在最后一个请求处反向，而非物理端点。',
    lookHowWorks:'与SCAN类似，但电梯在最后一个待服务请求处换向，不再前往楼层端点。',
    lookPros:'比SCAN更高效，减少无效行程；响应时间更短。',
    lookCons:'实现略复杂；高并发场景下与SCAN差异不大。',
    lookBestFor:'通用场景，是对SCAN的实用优化，推荐作为默认算法。',
    sstfCoreIdea:'每次优先服务距当前位置最近的请求（类似磁盘调度的SSTF）。',
    sstfHowWorks:'计算所有待服务请求与当前楼层的距离，每次选择最近的请求移动。',
    sstfPros:'平均响应时间短，整体吞吐量高，电梯移动总距离小。',
    sstfCons:'可能造成远端请求"饥饿"；负载不均衡时某些楼层等待极长。',
    sstfBestFor:'高流量/高吞吐量场景，对平均响应时间要求高的系统。',
  },
  en: {
    title:'Elevator Scheduling Simulator',
    labelAlgo:'Algo', labelMode:'Mode', labelFloors:'Floors', labelElevs:'Elevs',
    labelApply:'Apply', labelSpeed:'Speed', labelAuto:'Auto', labelAB:'A/B',
    btnStart:'Start', btnPause:'Pause', btnResume:'Resume', btnReset:'Reset',
    statusIdle:'Ready', statusRunning:'Running', statusPaused:'Paused',
    algoSCAN:'SCAN Algorithm', algoFCFS:'First Come First Serve',
    algoLOOK:'LOOK Algorithm', algoSSTF:'Shortest Seek Time First',
    modeNormal:'Normal', modeZone:'Zone', modeOddEven:'Odd/Even',
    statCompleted:'Completed', statWaiting:'Waiting',
    statAvgWait:'Avg Wait(s)', statAvgTravel:'Avg Travel(s)',
    statMaxWait:'Max Wait(s)', statThroughput:'Thru/min',
    statEmptyRate:'Empty %', statFullRate:'Full %',
    statFloors:'Total Floors', statEnergy:'Energy(kWh)',
    elevFloor:'Floor', elevStatus:'Status', elevPassengers:'Pax',
    elevIdle:'Idle', elevMoving:'Moving', elevOpen:'Open',
    elevOpening:'Opening', elevClosing:'Closing',
    ctrlAddPassenger:'Add Passenger Manually', ctrlFrom:'Depart floor', ctrlTo:'Dest floor', ctrlAdd:'Add',
    ctrlAddDesc:'Specify a passenger\'s departure and destination floors to simulate an elevator call.',
    ctrlPresets:'Presets',
    ctrlMorningRush:'🌅 Morning', ctrlEveningRush:'🌆 Evening',
    ctrlLunchtime:'🍜 Lunch', ctrlCrowd:'🏟️ Crowd',
    ctrlAutoRate:'Auto-gen Rate',
    logEmpty:'No log entries',
    algoDescTitle:'Algorithm Details',
    zoneLow:'Low Zone', zoneHigh:'High Zone', zoneOdd:'Odd Floors', zoneEven:'Even Floors',
    zoneLowRange:'Low: {from}F - {to}F', zoneHighRange:'High: {from}F - {to}F',
    zoneSplit:'Zone split floor', zoneSplitDesc:'Low-zone elevators serve 1F to split floor; high-zone elevators serve split+1 to top.',
    crowdTriggered:'🏟️ Crowd burst: Floor {floor}, {n} passengers',
    passengerAdded:'Passenger: {from}F → {to}F',
    simReset:'Simulation reset',
    applied:'Applied: {floors} floors · {elevs} elevators',
    autoOn:'Auto generate: ON', autoOff:'Auto generate: OFF',
    abEnabled:'A/B compare: ON', abDisabled:'A/B compare: OFF',
    abCompare:'A/B Algorithm Comparison', abAlgoA:'Primary (A)', abAlgoB:'Comparison (B)',
    abDesc:'When enabled, both algorithms receive the same passenger requests to compare performance metrics.',
    abHowTo:'Select the primary algorithm A in the header, then pick comparison algorithm B below, and click "A/B" button in the header to enable.',
    metricCompleted:'Completed', metricAvgWait:'Avg Wait(s)',
    metricMaxWait:'Max Wait(s)', metricAvgTravel:'Avg Travel(s)',
    metricThroughput:'Thru/min', metricEnergy:'Energy(kWh)',
    metricEmptyRate:'Empty %', metricTotalFloors:'Total Floors',
    abSelect:'Enable A/B mode first',
    chartWait:'Avg Wait', chartTravel:'Avg Travel',
    floorUp:'Call Up', floorDown:'Call Down',
    elevDir1:'↑', elevDirN1:'↓', elevDir0:'●',
    presetMorningDesc:'🌅 Morning rush: passengers going up from lower floors',
    presetEveningDesc:'🌆 Evening rush: passengers going down from upper floors',
    presetLunchDesc:'🍜 Lunchtime: passengers from all floors',
    algoFCFSName:'First Come First Serve (FCFS)', algoSCANName:'SCAN Algorithm',
    algoLOOKName:'LOOK Algorithm', algoSSTFName:'Shortest Seek Time First (SSTF)',
    coreIdea:'Core Idea', howWorks:'How It Works', pros:'Pros', cons:'Cons', bestFor:'Best For',
    fcfsCoreIdea:'Serve requests in the order they arrive, regardless of current position.',
    fcfsHowWorks:'Each new request is appended to the queue; the elevator services each floor in queue order, one at a time.',
    fcfsPros:'Simple to implement, fair (first-come-first-served), no starvation.',
    fcfsCons:'Inefficient with many empty trips; long average wait times under heavy load.',
    fcfsBestFor:'Low-traffic scenarios, fairness-critical settings, educational demos.',
    scanCoreIdea:'The elevator sweeps back and forth through the building like the disk scheduling elevator algorithm.',
    scanHowWorks:'Travels in one direction, serves all requests along the way, reaches the top/bottom, then reverses.',
    scanPros:'Avoids thrashing direction changes; efficient; fair to middle floors.',
    scanCons:'Slightly longer waits at extreme floors; still travels to endpoints even with no requests.',
    scanBestFor:'Medium-to-high traffic, evenly distributed requests, general-purpose systems.',
    lookCoreIdea:'An improvement over SCAN: reverses direction at the last pending request, not the physical endpoint.',
    lookHowWorks:'Like SCAN but reverses at the last pending request in each direction, eliminating unnecessary travel.',
    lookPros:'More efficient than SCAN; shorter response times; reduces unnecessary travel.',
    lookCons:'Slightly more complex; marginal gain over SCAN at very high concurrency.',
    lookBestFor:'General use; practical improvement over SCAN — recommended as default.',
    sstfCoreIdea:'Always service the request nearest to the current floor (analogous to disk scheduling SSTF).',
    sstfHowWorks:'Calculates distance from current floor to all pending requests and moves to the nearest one each time.',
    sstfPros:'Shortest average response time; high overall throughput; minimizes total distance traveled.',
    sstfCons:'May cause starvation for distant requests; uneven service under imbalanced load.',
    sstfBestFor:'High-traffic / high-throughput scenarios where average response time is the primary metric.',
  }
};

let currentLang = 'zh';
function t(key, vars={}) {
  let str = (I18N[currentLang] && I18N[currentLang][key]) || (I18N['zh'] && I18N['zh'][key]) || key;
  for (const [k, v] of Object.entries(vars)) str = str.replace('{' + k + '}', v);
  return str;
}
function applyI18n() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });
  renderAlgoDescriptions();
  renderABTable();
}

// ── Utilities ──────────────────────────────────────────────────────────────
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
function rand(lo, hi) { return Math.floor(Math.random() * (hi - lo + 1)) + lo; }
function ticksToSec(ticks) { return (ticks * currentTickMs / 1000).toFixed(1); }

// ── Passenger ──────────────────────────────────────────────────────────────
class Passenger {
  constructor(id, fromFloor, toFloor, requestTime) {
    this.id = id;
    this.fromFloor = fromFloor;
    this.toFloor = toFloor;
    this.requestTime = requestTime;
    this.boardTime = null;
    this.exitTime = null;
    this.assignedElev = null;
    this.state = 'waiting';
  }
}

// ── Elevator ───────────────────────────────────────────────────────────────
class Elevator {
  constructor(id, startFloor, numFloors) {
    this.id = id;
    this.floor = startFloor;
    this.position = startFloor;
    this.direction = 0;
    this.state = 'idle';
    this.passengers = [];
    this.stops = new Set();
    this.doorTimer = 0;
    this.doorProgress = 0;
    this.moveTimer = 0;
    this.capacity = MAX_CAPACITY;
    this.numFloors = numFloors;
    this.color = ELEV_COLORS[id % ELEV_COLORS.length];
    this.movingTicks = 0;
    this.emptyMovingTicks = 0;
    this.fullMovingTicks = 0;
    this.energyKWh = 0;
    this.totalFloorsMoved = 0;
  }
}

// ── Simulation ─────────────────────────────────────────────────────────────
class Simulation {
  constructor(cfg) {
    this.algorithm = cfg.algorithm || 'SCAN';
    this.numFloors = cfg.numFloors || 20;
    this.numElevators = cfg.numElevators || 4;
    this.serviceMode = cfg.serviceMode || 'normal';
    this.zoneSplitFloor = cfg.zoneSplitFloor || Math.ceil(this.numFloors / 2);
    this.ticks = 0;
    this.nextPassengerId = 0;
    this.elevators = [];
    this.waiting = [];
    this.completed = [];
    this.stats = { totalWaitTicks: 0, totalTravelTicks: 0, maxWaitTicks: 0, completed: 0 };
    this._initElevators();
  }

  _initElevators() {
    const halfElevs = Math.ceil(this.numElevators / 2);
    for (let i = 0; i < this.numElevators; i++) {
      let startFloor = 1;
      if (this.serviceMode === 'zone' && i >= halfElevs) {
        startFloor = this.zoneSplitFloor + 1;
      }
      startFloor = clamp(startFloor, 1, this.numFloors);
      this.elevators.push(new Elevator(i, startFloor, this.numFloors));
    }
  }

  addPassenger(fromFloor, toFloor) {
    fromFloor = clamp(fromFloor, 1, this.numFloors);
    toFloor = clamp(toFloor, 1, this.numFloors);
    if (fromFloor === toFloor) return null;
    const p = new Passenger(this.nextPassengerId++, fromFloor, toFloor, this.ticks);
    this.waiting.push(p);
    this._assignPassenger(p);
    return p;
  }

  _floorServableBy(floor, elevId) {
    if (this.serviceMode === 'normal') return true;
    if (this.serviceMode === 'zone') {
      const halfElevs = Math.ceil(this.numElevators / 2);
      return elevId < halfElevs ? floor <= this.zoneSplitFloor : floor > this.zoneSplitFloor;
    }
    if (this.serviceMode === 'odd-even') {
      if (floor === 1) return true;
      return elevId % 2 === 0 ? (floor % 2 === 1) : (floor % 2 === 0);
    }
    return true;
  }

  _findBestElevator(p) {
    let best = null, bestScore = Infinity;
    for (const elev of this.elevators) {
      if (elev.passengers.length >= elev.capacity) continue;
      if (!this._floorServableBy(p.fromFloor, elev.id)) continue;
      if (!this._floorServableBy(p.toFloor, elev.id)) continue;
      const dist = Math.abs(elev.position - p.fromFloor);
      let score = dist;
      if (elev.direction !== 0) {
        const headingToward =
          (elev.direction === 1 && elev.floor <= p.fromFloor) ||
          (elev.direction === -1 && elev.floor >= p.fromFloor);
        if (headingToward) score -= 4;
      }
      if (score < bestScore) { bestScore = score; best = elev; }
    }
    return best;
  }

  _assignPassenger(p) {
    const elev = this._findBestElevator(p);
    if (elev) {
      p.assignedElev = elev.id;
      elev.stops.add(p.fromFloor);
    }
  }

  step() {
    this.ticks++;
    for (const elev of this.elevators) this._stepElevator(elev);
    for (const p of this.waiting) {
      if (p.assignedElev === null) this._assignPassenger(p);
    }
  }

  _stepElevator(elev) {
    switch (elev.state) {
      case 'idle': {
        const next = this._nextTarget(elev);
        if (next !== null) elev.state = 'moving';
        break;
      }
      case 'moving': {
        const prevPos = elev.position;
        const target = this._nextTarget(elev);
        if (target === null) { elev.state = 'idle'; elev.direction = 0; break; }
        if (target > elev.floor) elev.direction = 1;
        else if (target < elev.floor) elev.direction = -1;
        else elev.direction = 0;

        elev.moveTimer++;
        if (elev.moveTimer >= FLOOR_MOVE_TICKS) {
          elev.moveTimer = 0;
          elev.floor += elev.direction;
          elev.floor = clamp(elev.floor, 1, elev.numFloors);
        }
        elev.position = elev.floor + (elev.direction * elev.moveTimer / FLOOR_MOVE_TICKS);

        const floorsStep = Math.abs(elev.position - prevPos);
        elev.movingTicks++;
        if (elev.passengers.length === 0) elev.emptyMovingTicks++;
        if (elev.passengers.length >= elev.capacity) elev.fullMovingTicks++;
        elev.energyKWh += floorsStep * (ENERGY_PER_FLOOR_BASE + elev.passengers.length * ENERGY_PER_FLOOR_PAX);
        elev.totalFloorsMoved += floorsStep;

        if (elev.floor === target && elev.moveTimer === 0) {
          elev.stops.delete(elev.floor);
          const hasBoarding = this.waiting.some(p => p.fromFloor === elev.floor && p.assignedElev === elev.id);
          const hasExiting = elev.passengers.some(p => p.toFloor === elev.floor);
          if (hasBoarding || hasExiting) {
            elev.state = 'opening';
            elev.doorTimer = DOOR_ANIM_TICKS;
            elev.doorProgress = 0;
          }
        }
        break;
      }
      case 'opening': {
        elev.doorTimer--;
        elev.doorProgress = clamp(1 - elev.doorTimer / DOOR_ANIM_TICKS, 0, 1);
        if (elev.doorTimer <= 0) {
          elev.doorProgress = 1;
          elev.state = 'open';
          const count = this._handleBoardingAndExiting(elev);
          elev.doorTimer = clamp(DOOR_OPEN_TICKS_BASE + count * DOOR_OPEN_TICKS_PER_PAX, DOOR_OPEN_TICKS_BASE, DOOR_OPEN_TICKS_MAX);
        }
        break;
      }
      case 'open': {
        elev.doorTimer--;
        if (elev.doorTimer <= 0) {
          elev.state = 'closing';
          elev.doorTimer = DOOR_ANIM_TICKS;
          elev.doorProgress = 1;
        }
        break;
      }
      case 'closing': {
        elev.doorTimer--;
        elev.doorProgress = clamp(elev.doorTimer / DOOR_ANIM_TICKS, 0, 1);
        if (elev.doorTimer <= 0) { elev.doorProgress = 0; elev.state = 'idle'; }
        break;
      }
    }
  }

  _handleBoardingAndExiting(elev) {
    let count = 0;
    const exiters = elev.passengers.filter(p => p.toFloor === elev.floor);
    for (const p of exiters) {
      elev.passengers = elev.passengers.filter(x => x.id !== p.id);
      p.state = 'done';
      p.exitTime = this.ticks;
      const travelTicks = p.exitTime - p.boardTime;
      const waitTicks = p.boardTime - p.requestTime;
      this.stats.totalTravelTicks += travelTicks;
      this.stats.totalWaitTicks += waitTicks;
      if (waitTicks > this.stats.maxWaitTicks) this.stats.maxWaitTicks = waitTicks;
      this.stats.completed++;
      this.completed.push(p);
      count++;
    }
    const boarders = this.waiting.filter(p => p.fromFloor === elev.floor && p.assignedElev === elev.id);
    for (const p of boarders) {
      if (elev.passengers.length >= elev.capacity) break;
      this.waiting = this.waiting.filter(x => x.id !== p.id);
      p.state = 'riding';
      p.boardTime = this.ticks;
      elev.passengers.push(p);
      elev.stops.add(p.toFloor);
      count++;
    }
    return count;
  }

  _nextTarget(elev) {
    if (elev.stops.size === 0) return null;
    const stops = Array.from(elev.stops);
    switch (this.algorithm) {
      case 'FCFS': return stops[0];
      case 'SSTF': return stops.reduce((best, s) =>
        Math.abs(s - elev.floor) < Math.abs(best - elev.floor) ? s : best);
      case 'SCAN': {
        if (elev.direction === 0) elev.direction = 1;
        let ahead = stops.filter(s => elev.direction === 1 ? s >= elev.floor : s <= elev.floor);
        if (ahead.length > 0) return elev.direction === 1 ? Math.min(...ahead) : Math.max(...ahead);
        elev.direction = -elev.direction;
        ahead = stops.filter(s => elev.direction === 1 ? s >= elev.floor : s <= elev.floor);
        if (ahead.length > 0) return elev.direction === 1 ? Math.min(...ahead) : Math.max(...ahead);
        return stops[0];
      }
      case 'LOOK': {
        if (elev.direction === 0) elev.direction = 1;
        let ahead = stops.filter(s => elev.direction === 1 ? s > elev.floor : s < elev.floor);
        if (ahead.length > 0) return elev.direction === 1 ? Math.min(...ahead) : Math.max(...ahead);
        if (stops.includes(elev.floor)) return elev.floor;
        elev.direction = -elev.direction;
        ahead = stops.filter(s => elev.direction === 1 ? s > elev.floor : s < elev.floor);
        if (ahead.length > 0) return elev.direction === 1 ? Math.min(...ahead) : Math.max(...ahead);
        return stops[0];
      }
      default: return stops[0];
    }
  }

  getStats() {
    const n = this.stats.completed;
    const ticksPerSec = 1000 / currentTickMs;
    const simSec = this.ticks / ticksPerSec;
    let totalMoving = 0, totalEmpty = 0, totalFull = 0, totalEnergy = 0, totalFloors = 0;
    for (const e of this.elevators) {
      totalMoving += e.movingTicks;
      totalEmpty += e.emptyMovingTicks;
      totalFull += e.fullMovingTicks;
      totalEnergy += e.energyKWh;
      totalFloors += e.totalFloorsMoved;
    }
    return {
      completed: n, waiting: this.waiting.length,
      avgWaitSec: n > 0 ? (this.stats.totalWaitTicks / n / ticksPerSec).toFixed(1) : '-',
      avgTravelSec: n > 0 ? (this.stats.totalTravelTicks / n / ticksPerSec).toFixed(1) : '-',
      maxWaitSec: this.stats.maxWaitTicks > 0 ? (this.stats.maxWaitTicks / ticksPerSec).toFixed(1) : '-',
      throughput: simSec > 0 ? (n / simSec * 60).toFixed(1) : '0',
      emptyRate: totalMoving > 0 ? (totalEmpty / totalMoving * 100).toFixed(1) : '-',
      fullRate: totalMoving > 0 ? (totalFull / totalMoving * 100).toFixed(1) : '-',
      energy: totalEnergy.toFixed(3),
      totalFloors: Math.round(totalFloors),
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
//  UI / App
// ═══════════════════════════════════════════════════════════════════════════

let sim = null, simB = null;
let abEnabled = false, running = false, autoGen = false;
let autoRate = AUTO_PAX_RATE_DEFAULT, autoTick = 0;
let rafId = null, lastTime = 0, currentTickMs = 120;
let config = { numFloors: 20, numElevators: 4, algorithm: 'SCAN', serviceMode: 'normal', zoneSplitFloor: 10 };
let chartData = { wait: [], travel: [] };
let logEntries = [];

function buildConfig() {
  return {
    numFloors: config.numFloors,
    numElevators: config.numElevators,
    algorithm: document.getElementById('algo-select').value,
    serviceMode: document.getElementById('service-mode-select').value,
  };
}

function addPassengerMirrored(from, to) {
  const p = sim ? sim.addPassenger(from, to) : null;
  if (abEnabled && simB) simB.addPassenger(from, to);
  return p;
}

// ── Build UI ───────────────────────────────────────────────────────────────
function buildUI() {
  const cfg = buildConfig();
  config = { ...config, ...cfg };
  sim = new Simulation(config);
  simB = abEnabled ? new Simulation({ ...config, algorithm: document.getElementById('ab-algo-select').value }) : null;
  chartData = { wait: [], travel: [] };
  logEntries = [];
  renderBuilding();
  renderAlgoDescriptions();
  renderABTable();
  updateStats();
  renderLog();
  render(); // position elevator cars at their initial floor
}

function renderBuilding() {
  const building = document.getElementById('building');
  building.innerHTML = '';
  const { numFloors, numElevators } = config;

  // Shaft headers row
  const headerRow = document.createElement('div');
  headerRow.style.cssText = 'display:flex;flex-shrink:0;';
  const labelSpacer = document.createElement('div');
  labelSpacer.style.cssText = 'width:30px;flex-shrink:0;';
  headerRow.appendChild(labelSpacer);
  const callSpacer = document.createElement('div');
  callSpacer.style.cssText = 'width:16px;flex-shrink:0;';
  headerRow.appendChild(callSpacer);
  const waitSpacer = document.createElement('div');
  waitSpacer.style.cssText = 'width:22px;flex-shrink:0;';
  headerRow.appendChild(waitSpacer);

  for (let e = 0; e < numElevators; e++) {
    const sh = document.createElement('div');
    sh.className = 'shaft-header';
    sh.style.cssText = 'width:var(--shaft-w);border-left:1px solid var(--border);';
    const nameSpan = document.createElement('span');
    nameSpan.textContent = 'E' + (e + 1);
    nameSpan.style.color = ELEV_COLORS[e % ELEV_COLORS.length];
    nameSpan.style.fontWeight = '700';
    nameSpan.style.fontSize = '10px';
    sh.appendChild(nameSpan);
    const zoneLabel = document.createElement('span');
    zoneLabel.className = 'shaft-zone-label';
    const zoneText = getZoneLabel(e);
    if (zoneText) { zoneLabel.textContent = zoneText; sh.appendChild(zoneLabel); }
    headerRow.appendChild(sh);
  }
  building.appendChild(headerRow);

  // Floor rows container
  const inner = document.createElement('div');
  inner.className = 'building-inner';

  for (let f = 1; f <= numFloors; f++) {
    const row = document.createElement('div');
    row.className = 'floor-row';
    row.id = 'floor-row-' + f;

    const lbl = document.createElement('div');
    lbl.className = 'floor-label';
    lbl.textContent = f;
    row.appendChild(lbl);

    const callWrap = document.createElement('div');
    callWrap.className = 'floor-call-btns';
    if (f < numFloors) {
      const btnUp = document.createElement('button');
      btnUp.className = 'call-btn';
      btnUp.id = 'call-up-' + f;
      btnUp.textContent = '▲';
      btnUp.title = t('floorUp');
      btnUp.addEventListener('click', () => onCallBtn(f, 1));
      callWrap.appendChild(btnUp);
    }
    if (f > 1) {
      const btnDn = document.createElement('button');
      btnDn.className = 'call-btn';
      btnDn.id = 'call-dn-' + f;
      btnDn.textContent = '▼';
      btnDn.title = t('floorDown');
      btnDn.addEventListener('click', () => onCallBtn(f, -1));
      callWrap.appendChild(btnDn);
    }
    row.appendChild(callWrap);

    const waitDiv = document.createElement('div');
    waitDiv.className = 'floor-waiting';
    waitDiv.id = 'floor-wait-' + f;
    row.appendChild(waitDiv);

    for (let e = 0; e < numElevators; e++) {
      const cell = document.createElement('div');
      cell.className = 'shaft-floor';
      cell.style.cssText = 'width:var(--shaft-w);border-left:1px solid var(--border);display:inline-block;';
      row.appendChild(cell);
    }
    inner.appendChild(row);
  }
  building.appendChild(inner);

  // Elevator cars — positioned absolutely over shaft columns
  const carsLayer = document.createElement('div');
  carsLayer.id = 'cars-layer';
  // Compute left offset from floor-label + call-btns + waiting column widths
  const leftOffset = 30 + 16 + 22; // floor-label(30) + call-btns(16) + waiting(22)
  const topOffset = 24; // shaft header height
  // Total height of floor area = numFloors * floorH
  const floorH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--floor-h')) || 28;
  const totalFloorsHeight = numFloors * floorH;
  carsLayer.style.cssText = 'position:absolute;top:' + topOffset + 'px;left:' + leftOffset + 'px;display:flex;pointer-events:none;';
  building.style.position = 'relative';

  for (let e = 0; e < numElevators; e++) {
    const col = document.createElement('div');
    col.style.cssText = 'width:var(--shaft-w);position:relative;height:' + totalFloorsHeight + 'px;';
    col.id = 'car-col-' + e;
    const car = document.createElement('div');
    car.className = 'elev-car';
    car.id = 'car-' + e;
    car.style.color = ELEV_COLORS[e % ELEV_COLORS.length];
    car.innerHTML = '<div class="elev-car-inner">' +
      '<div class="elev-car-id" id="car-id-' + e + '">E' + (e + 1) + '</div>' +
      '<div class="elev-car-pax" id="car-pax-' + e + '">0</div>' +
      '</div>' +
      '<div class="door-overlay door-left" id="door-left-' + e + '"></div>' +
      '<div class="door-overlay door-right" id="door-right-' + e + '"></div>';
    col.appendChild(car);
    carsLayer.appendChild(col);
  }
  building.appendChild(carsLayer);
}

function getZoneLabel(elevId) {
  if (config.serviceMode === 'zone') {
    const isLow = elevId < Math.ceil(config.numElevators / 2);
    if (isLow) {
      return t('zoneLowRange', { from: 1, to: config.zoneSplitFloor });
    } else {
      return t('zoneHighRange', { from: config.zoneSplitFloor + 1, to: config.numFloors });
    }
  }
  if (config.serviceMode === 'odd-even') {
    return elevId % 2 === 0 ? t('zoneOdd') : t('zoneEven');
  }
  return '';
}

function onCallBtn(floor, dir) {
  if (!sim) return;
  let toFloor;
  if (dir === 1) toFloor = rand(floor + 1, config.numFloors);
  else toFloor = rand(1, floor - 1);
  addPassengerMirrored(floor, toFloor);
  logEntry('info', t('passengerAdded', { from: floor, to: toFloor }));
  const btnId = dir === 1 ? 'call-up-' + floor : 'call-dn-' + floor;
  const btn = document.getElementById(btnId);
  if (btn) { btn.classList.add('active'); setTimeout(() => btn.classList.remove('active'), 600); }
}

// ── Render ─────────────────────────────────────────────────────────────────
function render() {
  if (!sim) return;
  const floorH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--floor-h')) || 28;
  const carH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--car-h')) || 22;

  for (const elev of sim.elevators) {
    const car = document.getElementById('car-' + elev.id);
    if (!car) continue;
    // Floor 1 = 0px from bottom of the car column; position is 1-indexed
    const bottomPx = (elev.position - 1) * floorH + (floorH - carH) / 2;
    car.style.bottom = bottomPx + 'px';
    car.style.position = 'absolute';
    car.style.left = '50%';
    car.style.transform = 'translateX(-50%)';

    const paxEl = document.getElementById('car-pax-' + elev.id);
    if (paxEl) paxEl.textContent = elev.passengers.length + '/' + elev.capacity;

    const doorW = (elev.doorProgress * 50) + '%';
    const dL = document.getElementById('door-left-' + elev.id);
    const dR = document.getElementById('door-right-' + elev.id);
    if (dL) dL.style.width = doorW;
    if (dR) dR.style.width = doorW;
  }

  const waitMap = {};
  for (const p of sim.waiting) waitMap[p.fromFloor] = (waitMap[p.fromFloor] || 0) + 1;
  for (let f = 1; f <= config.numFloors; f++) {
    const el = document.getElementById('floor-wait-' + f);
    if (el) el.textContent = waitMap[f] ? waitMap[f] : '';
  }

  updateStats();
}

function updateStats() {
  if (!sim) return;
  const s = sim.getStats();
  const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  set('stat-completed', s.completed);
  set('stat-waiting', s.waiting);
  set('stat-avg-wait', s.avgWaitSec);
  set('stat-avg-travel', s.avgTravelSec);
  set('stat-max-wait', s.maxWaitSec);
  set('stat-throughput', s.throughput);
  set('stat-empty-rate', s.emptyRate);
  set('stat-full-rate', s.fullRate);
  set('stat-energy', s.energy);
  set('stat-floors', s.totalFloors);
  set('tick-display', 'T:' + ticksToSec(sim.ticks) + 's');
}

function updateElevsPanel() {
  if (!sim) return;
  const panel = document.getElementById('elevs-panel');
  if (!panel) return;
  panel.innerHTML = '';
  for (const elev of sim.elevators) {
    const card = document.createElement('div');
    card.className = 'elev-card';
    const stateName = { idle: t('elevIdle'), moving: t('elevMoving'), open: t('elevOpen'),
      opening: t('elevOpening'), closing: t('elevClosing') }[elev.state] || elev.state;
    const dirStr = elev.direction === 1 ? t('elevDir1') : elev.direction === -1 ? t('elevDirN1') : t('elevDir0');
    card.innerHTML =
      '<div class="elev-card-header">' +
        '<span class="elev-name" style="color:' + elev.color + '">E' + (elev.id + 1) + ' ' + dirStr + '</span>' +
        '<span class="elev-state-badge ' + elev.state + '">' + stateName + '</span>' +
      '</div>' +
      '<div class="elev-row">' +
        '<span>' + t('elevFloor') + ': ' + elev.floor + '</span>' +
        '<span>' + t('elevPassengers') + ': ' + elev.passengers.length + '/' + elev.capacity + '</span>' +
      '</div>' +
      '<div class="pax-dots">' + elev.passengers.map(() => '<div class="pax-dot"></div>').join('') + '</div>';
    panel.appendChild(card);
  }
}

function renderAlgoDescriptions() {
  const container = document.getElementById('algo-desc-container');
  if (!container) return;
  const algos = [
    { key:'FCFS', color:'#4fc3f7', nameKey:'algoFCFSName', coreKey:'fcfsCoreIdea', howKey:'fcfsHowWorks', prosKey:'fcfsPros', consKey:'fcfsCons', bestKey:'fcfsBestFor' },
    { key:'SCAN', color:'#7c4dff', nameKey:'algoSCANName', coreKey:'scanCoreIdea', howKey:'scanHowWorks', prosKey:'scanPros', consKey:'scanCons', bestKey:'scanBestFor' },
    { key:'LOOK', color:'#00e676', nameKey:'algoLOOKName', coreKey:'lookCoreIdea', howKey:'lookHowWorks', prosKey:'lookPros', consKey:'lookCons', bestKey:'lookBestFor' },
    { key:'SSTF', color:'#ff9100', nameKey:'algoSSTFName', coreKey:'sstfCoreIdea', howKey:'sstfHowWorks', prosKey:'sstfPros', consKey:'sstfCons', bestKey:'sstfBestFor' },
  ];
  container.innerHTML = algos.map(a =>
    '<div class="algo-card">' +
    '<h3 style="color:' + a.color + '">' + t(a.nameKey) + '</h3>' +
    '<div class="algo-prop"><strong>' + t('coreIdea') + '</strong>' + t(a.coreKey) + '</div>' +
    '<div class="algo-prop"><strong>' + t('howWorks') + '</strong>' + t(a.howKey) + '</div>' +
    '<div class="algo-prop"><strong>' + t('pros') + '</strong>' + t(a.prosKey) + '</div>' +
    '<div class="algo-prop"><strong>' + t('cons') + '</strong>' + t(a.consKey) + '</div>' +
    '<div class="algo-prop"><strong>' + t('bestFor') + '</strong>' + t(a.bestKey) + '</div>' +
    '</div>'
  ).join('');
}

function renderABTable() {
  const wrap = document.getElementById('ab-table-wrap');
  if (!wrap) return;
  if (!abEnabled || !sim || !simB) {
    wrap.innerHTML = '<div style="color:var(--text-dim);font-size:10px;padding:6px">' + t('abSelect') + '</div>';
    return;
  }
  const sA = sim.getStats(), sB = simB.getStats();
  const metrics = [
    { key:'metricCompleted', a:sA.completed, b:sB.completed, higherBetter:true },
    { key:'metricAvgWait', a:sA.avgWaitSec, b:sB.avgWaitSec, higherBetter:false },
    { key:'metricMaxWait', a:sA.maxWaitSec, b:sB.maxWaitSec, higherBetter:false },
    { key:'metricAvgTravel', a:sA.avgTravelSec, b:sB.avgTravelSec, higherBetter:false },
    { key:'metricThroughput', a:sA.throughput, b:sB.throughput, higherBetter:true },
    { key:'metricEnergy', a:sA.energy, b:sB.energy, higherBetter:false },
    { key:'metricEmptyRate', a:sA.emptyRate, b:sB.emptyRate, higherBetter:false },
    { key:'metricTotalFloors', a:sA.totalFloors, b:sB.totalFloors, higherBetter:false },
  ];
  const algoAName = document.getElementById('algo-select').value;
  const algoBName = document.getElementById('ab-algo-select').value;
  let html = '<table class="ab-table"><thead><tr><th></th><th>' + algoAName + '</th><th>' + algoBName + '</th></tr></thead><tbody>';
  for (const m of metrics) {
    const aNum = parseFloat(m.a), bNum = parseFloat(m.b);
    let aCls = '', bCls = '';
    if (!isNaN(aNum) && !isNaN(bNum) && aNum !== bNum) {
      const aBetter = m.higherBetter ? aNum > bNum : aNum < bNum;
      aCls = aBetter ? 'better' : 'worse';
      bCls = aBetter ? 'worse' : 'better';
    }
    html += '<tr><td>' + t(m.key) + '</td><td class="' + aCls + '">' + m.a + '</td><td class="' + bCls + '">' + m.b + '</td></tr>';
  }
  html += '</tbody></table>';
  wrap.innerHTML = html;
}

function renderLog() {
  const list = document.getElementById('log-list');
  if (!list) return;
  list.innerHTML = '';
  if (logEntries.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'log-entry info';
    empty.textContent = t('logEmpty');
    list.appendChild(empty);
    return;
  }
  const entries = logEntries.slice(-MAX_LOG_ENTRIES).reverse();
  for (const e of entries) {
    const div = document.createElement('div');
    div.className = 'log-entry ' + e.type;
    div.textContent = '[' + e.time + '] ' + e.msg;
    list.appendChild(div);
  }
}

function logEntry(type, msg) {
  const time = sim ? ticksToSec(sim.ticks) + 's' : '0s';
  logEntries.push({ type, msg, time });
  if (logEntries.length > MAX_LOG_ENTRIES) logEntries.shift();
  const activeTab = document.querySelector('.tab-btn.active');
  if (activeTab && activeTab.dataset.tab === 'log') renderLog();
}

// ── Chart ──────────────────────────────────────────────────────────────────
function updateChart() {
  if (!sim) return;
  const s = sim.getStats();
  const wv = parseFloat(s.avgWaitSec), tv = parseFloat(s.avgTravelSec);
  if (!isNaN(wv)) chartData.wait.push(wv);
  if (!isNaN(tv)) chartData.travel.push(tv);
  if (chartData.wait.length > CHART_HISTORY) chartData.wait.shift();
  if (chartData.travel.length > CHART_HISTORY) chartData.travel.shift();
  drawChart();
}

function drawChart() {
  const canvas = document.getElementById('perf-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.clientWidth, H = canvas.clientHeight;
  canvas.width = W; canvas.height = H;
  ctx.clearRect(0, 0, W, H);
  const drawLine = (data, color) => {
    if (data.length < 2) return;
    const maxV = Math.max(...data, 1);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    data.forEach((v, i) => {
      const x = (i / (CHART_HISTORY - 1)) * W;
      const y = H - (v / maxV) * (H - 4) - 2;
      if (i === 0) { ctx.moveTo(x, y); } else { ctx.lineTo(x, y); }
    });
    ctx.stroke();
  };
  drawLine(chartData.wait, 'rgba(79,195,247,0.8)');
  drawLine(chartData.travel, 'rgba(255,145,0,0.8)');
}

// ── Main loop ──────────────────────────────────────────────────────────────
function loop(timestamp) {
  if (!running) return;
  rafId = requestAnimationFrame(loop);
  const dt = timestamp - lastTime;
  if (dt < currentTickMs) return;
  lastTime = timestamp;

  if (autoGen && sim) {
    autoTick++;
    if (autoTick >= autoRate) {
      autoTick = 0;
      const f1 = rand(1, config.numFloors);
      let f2 = rand(1, config.numFloors);
      while (f2 === f1) f2 = rand(1, config.numFloors);
      addPassengerMirrored(f1, f2);
    }
  }

  if (sim) sim.step();
  if (abEnabled && simB) simB.step();

  render();
  if (sim && sim.ticks % 10 === 0) updateChart();
  if (abEnabled) renderABTable();
}

// ── Controls ───────────────────────────────────────────────────────────────
function startSim() {
  if (!sim) buildUI();
  running = true;
  lastTime = performance.now();
  if (rafId) cancelAnimationFrame(rafId);
  rafId = requestAnimationFrame(loop);
  const chip = document.getElementById('status-chip');
  if (chip) { chip.textContent = t('statusRunning'); chip.className = 'running'; }
  document.getElementById('start-btn').disabled = true;
  document.getElementById('pause-btn').disabled = false;
  document.getElementById('start-btn').textContent = t('btnStart');
}

function pauseSim() {
  running = false;
  if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
  const chip = document.getElementById('status-chip');
  if (chip) { chip.textContent = t('statusPaused'); chip.className = 'paused'; }
  document.getElementById('start-btn').disabled = false;
  document.getElementById('start-btn').textContent = t('btnResume');
  document.getElementById('pause-btn').disabled = true;
}

function resetSim() {
  running = false;
  if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
  buildUI();
  const chip = document.getElementById('status-chip');
  if (chip) { chip.textContent = t('statusIdle'); chip.className = ''; }
  document.getElementById('start-btn').disabled = false;
  document.getElementById('start-btn').textContent = t('btnStart');
  document.getElementById('pause-btn').disabled = true;
  logEntry('info', t('simReset'));
  renderLog();
}

// ── Event listeners ────────────────────────────────────────────────────────
function initEventListeners() {
  document.getElementById('start-btn').addEventListener('click', startSim);
  document.getElementById('pause-btn').addEventListener('click', pauseSim);
  document.getElementById('reset-btn').addEventListener('click', resetSim);

  document.getElementById('speed-slider').addEventListener('input', e => {
    const v = parseInt(e.target.value);
    currentTickMs = Math.round(TICK_MS_MAX - (v - 1) / (10 - 1) * (TICK_MS_MAX - TICK_MS_MIN));
  });

  document.getElementById('algo-select').addEventListener('change', e => {
    if (sim) sim.algorithm = e.target.value;
    // Update A/B panel label showing algo A name
    const abLabel = document.getElementById('ab-algo-a-label');
    if (abLabel) abLabel.textContent = e.target.value;
  });
  document.getElementById('service-mode-select').addEventListener('change', () => {
    config.serviceMode = document.getElementById('service-mode-select').value;
    updateZoneSplitVisibility();
    resetSim();
  });

  document.getElementById('apply-btn').addEventListener('click', () => {
    const fl = clamp(parseInt(document.getElementById('floors-input').value) || 20, 2, 60);
    const el = clamp(parseInt(document.getElementById('elevs-input').value) || 4, 1, 6);
    config.numFloors = fl;
    config.numElevators = el;
    config.zoneSplitFloor = clamp(config.zoneSplitFloor, 1, fl - 1);
    document.getElementById('floors-input').value = fl;
    document.getElementById('elevs-input').value = el;
    updateZoneSplitSlider();
    resetSim();
    logEntry('success', t('applied', { floors: fl, elevs: el }));
    renderLog();
  });

  document.getElementById('auto-btn').addEventListener('click', e => {
    autoGen = !autoGen;
    e.target.classList.toggle('active', autoGen);
    logEntry('info', autoGen ? t('autoOn') : t('autoOff'));
  });

  document.getElementById('ab-btn').addEventListener('click', e => {
    abEnabled = !abEnabled;
    e.target.classList.toggle('active', abEnabled);
    if (abEnabled) {
      simB = new Simulation({ ...config, algorithm: document.getElementById('ab-algo-select').value });
    } else {
      simB = null;
    }
    logEntry('info', abEnabled ? t('abEnabled') : t('abDisabled'));
    renderABTable();
  });

  document.getElementById('ab-algo-select').addEventListener('change', () => {
    if (abEnabled) simB = new Simulation({ ...config, algorithm: document.getElementById('ab-algo-select').value });
    renderABTable();
  });

  document.getElementById('theme-btn').addEventListener('click', e => {
    const html = document.documentElement;
    const isDark = html.dataset.theme === 'dark';
    html.dataset.theme = isDark ? 'light' : 'dark';
    e.target.textContent = isDark ? '☀️' : '🌙';
  });

  document.getElementById('lang-btn').addEventListener('click', () => {
    currentLang = currentLang === 'zh' ? 'en' : 'zh';
    document.getElementById('lang-btn').textContent = currentLang === 'zh' ? 'EN' : '中文';
    document.documentElement.lang = currentLang === 'zh' ? 'zh-CN' : 'en';
    applyI18n();
    // Rebuild building to update zone labels and titles
    renderBuilding();
    render();
  });

  // Tab switching
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.style.display = 'none');
      btn.classList.add('active');
      const panel = document.getElementById('tab-' + btn.dataset.tab);
      if (panel) panel.style.display = '';
      if (btn.dataset.tab === 'log') renderLog();
      if (btn.dataset.tab === 'ab') renderABTable();
      if (btn.dataset.tab === 'algo') renderAlgoDescriptions();
      if (btn.dataset.tab === 'elevs') updateElevsPanel();
    });
  });

  // Manual passenger add
  document.getElementById('add-pax-btn').addEventListener('click', () => {
    if (!sim) return;
    const from = clamp(parseInt(document.getElementById('pax-from').value) || 1, 1, config.numFloors);
    const to = clamp(parseInt(document.getElementById('pax-to').value) || 5, 1, config.numFloors);
    if (from === to) return;
    addPassengerMirrored(from, to);
    logEntry('info', t('passengerAdded', { from, to }));
  });

  // Presets
  document.getElementById('preset-morning').addEventListener('click', () => {
    if (!sim) return;
    for (let i = 0; i < 15; i++) {
      addPassengerMirrored(rand(1, Math.ceil(config.numFloors * 0.3)), rand(Math.ceil(config.numFloors * 0.5), config.numFloors));
    }
    logEntry('warn', t('presetMorningDesc'));
  });

  document.getElementById('preset-evening').addEventListener('click', () => {
    if (!sim) return;
    for (let i = 0; i < 15; i++) {
      addPassengerMirrored(rand(Math.ceil(config.numFloors * 0.5), config.numFloors), rand(1, Math.ceil(config.numFloors * 0.3)));
    }
    logEntry('warn', t('presetEveningDesc'));
  });

  document.getElementById('preset-lunch').addEventListener('click', () => {
    if (!sim) return;
    for (let i = 0; i < 12; i++) {
      const f1 = rand(1, config.numFloors);
      let f2 = rand(1, config.numFloors);
      while (f2 === f1) f2 = rand(1, config.numFloors);
      addPassengerMirrored(f1, f2);
    }
    logEntry('info', t('presetLunchDesc'));
  });

  document.getElementById('preset-crowd').addEventListener('click', () => {
    if (!sim) return;
    const burstFloor = rand(2, config.numFloors - 1);
    for (let i = 0; i < 25; i++) {
      const dir = Math.random() < 0.5 ? 1 : -1;
      if (dir === 1 && burstFloor < config.numFloors) {
        addPassengerMirrored(burstFloor, rand(burstFloor + 1, config.numFloors));
      } else if (burstFloor > 1) {
        addPassengerMirrored(burstFloor, rand(1, burstFloor - 1));
      }
    }
    logEntry('warn', t('crowdTriggered', { floor: burstFloor, n: 25 }));
  });

  document.getElementById('auto-rate-slider').addEventListener('input', e => {
    autoRate = parseInt(e.target.value);
    const lbl = document.getElementById('auto-rate-label');
    if (lbl) lbl.textContent = autoRate + ' ticks/pax';
  });

  document.getElementById('zone-split-slider').addEventListener('input', e => {
    config.zoneSplitFloor = parseInt(e.target.value);
    updateZoneSplitLabel();
    resetSim();
  });
}

// ── Zone split helpers ──────────────────────────────────────────────────────
function updateZoneSplitVisibility() {
  const section = document.getElementById('zone-split-section');
  if (section) {
    section.style.display = config.serviceMode === 'zone' ? '' : 'none';
  }
  updateZoneSplitSlider();
}

function updateZoneSplitSlider() {
  const slider = document.getElementById('zone-split-slider');
  if (slider) {
    slider.min = 1;
    slider.max = config.numFloors - 1;
    slider.value = config.zoneSplitFloor;
  }
  updateZoneSplitLabel();
}

function updateZoneSplitLabel() {
  const lbl = document.getElementById('zone-split-label');
  if (lbl) {
    lbl.textContent = t('zoneLowRange', { from: 1, to: config.zoneSplitFloor }) +
      '  |  ' + t('zoneHighRange', { from: config.zoneSplitFloor + 1, to: config.numFloors });
  }
}

// ── Init ───────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initEventListeners();
  config.zoneSplitFloor = Math.ceil(config.numFloors / 2);
  updateZoneSplitVisibility();
  buildUI();
  document.getElementById('pause-btn').disabled = true;
  renderAlgoDescriptions();
  // Set initial speed from slider
  const v = parseInt(document.getElementById('speed-slider').value);
  currentTickMs = Math.round(TICK_MS_MAX - (v - 1) / (10 - 1) * (TICK_MS_MAX - TICK_MS_MIN));
  // Set initial algo A label in AB panel
  const abLabel = document.getElementById('ab-algo-a-label');
  if (abLabel) abLabel.textContent = document.getElementById('algo-select').value;
});
