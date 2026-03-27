/**
 * Discrete-Event Simulation Engine for M/M/c Queue
 *
 * Supports configurable number of servers, arrival/service rates,
 * exponential and table-based distributions.
 * Pre-computes all events for step-by-step playback.
 */

import type {
  SimConfig,
  CustomerRecord,
  ServerState,
  SimEvent,
  SimulationSnapshot,
  SimulationResult,
  SimulationStats,
} from './types';
import { generateTime } from './distributions';

interface PendingEvent {
  time: number;
  type: 'ARRIVAL' | 'DEPARTURE';
  customerId: number;
  serverId?: number;
}

function findFreeServer(servers: ServerState[]): ServerState | null {
  for (const s of servers) {
    if (!s.busy) return s;
  }
  return null;
}

function formatQueue(queue: number[]): string {
  if (queue.length === 0) return 'Vacía';
  return '[' + queue.map((id) => `C${id}`).join(', ') + ']';
}

function formatNextEvents(eventQueue: PendingEvent[]): string {
  if (eventQueue.length === 0) return '';
  const upcoming = eventQueue
    .slice(0, 3)
    .map((e) => `${e.type === 'ARRIVAL' ? 'A' : 'D'} en t=${Math.round(e.time * 100) / 100}`)
    .join(', ');
  return upcoming;
}

export function runSimulation(
  config: SimConfig,
  prngSequence: number[]
): SimulationResult {
  const { servers: serverCount, arrivalRate, serviceRate, customerCount, distributionMode } = config;
  const arrivalTable = config.arrivalTable;
  const serviceTable = config.serviceTable;

  // We need at least 2 * customerCount random numbers (one for arrival, one for service)
  if (prngSequence.length < customerCount * 2) {
    throw new Error(
      `Se necesitan al menos ${customerCount * 2} números aleatorios (tiene ${prngSequence.length}).`
    );
  }

  // Initialize servers
  const servers: ServerState[] = Array.from({ length: serverCount }, (_, i) => ({
    id: i + 1,
    busy: false,
    currentCustomer: null,
    busyUntil: 0,
    totalBusyTime: 0,
  }));

  // Initialize customers
  const customers: CustomerRecord[] = [];
  const events: SimEvent[] = [];
  const snapshots: SimulationSnapshot[] = [];
  const queue: number[] = []; // customer IDs waiting

  // Pre-compute inter-arrival and service times
  const interArrivalTimes: number[] = [];
  const serviceTimes: number[] = [];
  for (let i = 0; i < customerCount; i++) {
    const arrRandom = prngSequence[i * 2];
    const srvRandom = prngSequence[i * 2 + 1];
    interArrivalTimes.push(
      Math.round(generateTime(arrRandom, arrivalRate, distributionMode, arrivalTable) * 100) / 100
    );
    serviceTimes.push(
      Math.round(generateTime(srvRandom, serviceRate, distributionMode, serviceTable) * 100) / 100
    );
  }

  // Compute absolute arrival times
  const arrivalTimes: number[] = [];
  let cumulative = 0;
  for (let i = 0; i < customerCount; i++) {
    cumulative += interArrivalTimes[i];
    arrivalTimes.push(Math.round(cumulative * 100) / 100);
    customers.push({
      id: i + 1,
      arrivalTime: Math.round(cumulative * 100) / 100,
      waitTime: 0,
      serviceStart: 0,
      serviceEnd: 0,
      departureTime: 0,
      serverAssigned: 0,
      arrivalRandom: prngSequence[i * 2],
      serviceRandom: prngSequence[i * 2 + 1],
      interArrivalTime: interArrivalTimes[i],
      serviceTime: serviceTimes[i],
    });
  }

  // Event queue (sorted by time)
  const eventQueue: PendingEvent[] = [];

  // Schedule all arrivals
  for (let i = 0; i < customerCount; i++) {
    eventQueue.push({
      time: arrivalTimes[i],
      type: 'ARRIVAL',
      customerId: i + 1,
    });
  }

  // Sort by time, then arrivals before departures at same time
  const sortEvents = () => {
    eventQueue.sort((a, b) => {
      if (a.time !== b.time) return a.time - b.time;
      return a.type === 'ARRIVAL' ? -1 : 1;
    });
  };
  sortEvents();

  // Add initialization event
  events.push({
    time: 0,
    type: 'INIT',
    customerId: 0,
    description: 'Inicialización',
    action: 'Sistema vacío',
    nextEvent: formatNextEvents(eventQueue),
    queueLength: 0,
    systemCount: 0,
    queueContent: 'Vacía',
  });

  // Take snapshot
  const takeSnapshot = (eventIdx: number, currentEvent: SimEvent | null): SimulationSnapshot => ({
    clock: currentEvent?.time ?? 0,
    eventIndex: eventIdx,
    servers: servers.map((s) => ({ ...s })),
    queue: [...queue],
    customers: customers.map((c) => ({ ...c })),
    currentEvent,
  });

  snapshots.push(takeSnapshot(0, events[0]));

  let maxQueueLen = 0;
  let queueAreaAccum = 0;
  let lastEventTime = 0;

  // Process events
  while (eventQueue.length > 0) {
    const ev = eventQueue.shift()!;
    const cid = ev.customerId;
    const customer = customers[cid - 1];

    // Accumulate queue length over time
    queueAreaAccum += queue.length * (ev.time - lastEventTime);
    lastEventTime = ev.time;

    if (ev.type === 'ARRIVAL') {
      const freeServer = findFreeServer(servers);
      let description: string;
      let action: string;

      if (freeServer) {
        // Start service immediately
        freeServer.busy = true;
        freeServer.currentCustomer = cid;
        customer.serviceStart = ev.time;
        customer.waitTime = 0;
        customer.serverAssigned = freeServer.id;
        const serviceEndTime = Math.round((ev.time + customer.serviceTime) * 100) / 100;
        customer.serviceEnd = serviceEndTime;
        customer.departureTime = serviceEndTime;
        freeServer.busyUntil = serviceEndTime;

        // Schedule departure
        eventQueue.push({
          time: serviceEndTime,
          type: 'DEPARTURE',
          customerId: cid,
          serverId: freeServer.id,
        });
        sortEvents();

        description = `Llegada (C${cid})`;
        action = `Servidor ${freeServer.id} libre → ocupado. Inicia servicio`;
      } else {
        // All servers busy, enqueue
        queue.push(cid);
        maxQueueLen = Math.max(maxQueueLen, queue.length);

        description = `Llegada (C${cid})`;
        action = `Servidor(es) ocupado(s). Entra a cola`;
      }

      const systemCount =
        servers.filter((s) => s.busy).length + queue.length;

      const simEvent: SimEvent = {
        time: ev.time,
        type: 'ARRIVAL',
        customerId: cid,
        description,
        action,
        nextEvent: formatNextEvents(eventQueue),
        queueLength: queue.length,
        systemCount,
        queueContent: formatQueue(queue),
      };
      events.push(simEvent);
      snapshots.push(takeSnapshot(events.length - 1, simEvent));
    } else {
      // DEPARTURE
      const server = servers.find((s) => s.id === ev.serverId)!;
      server.totalBusyTime += customer.serviceTime;
      server.busy = false;
      server.currentCustomer = null;

      let description = `Salida (C${cid})`;
      let action: string;

      if (queue.length > 0) {
        // Dequeue next customer
        const nextCid = queue.shift()!;
        const nextCustomer = customers[nextCid - 1];
        nextCustomer.serviceStart = ev.time;
        nextCustomer.waitTime = Math.round((ev.time - nextCustomer.arrivalTime) * 100) / 100;
        nextCustomer.serverAssigned = server.id;
        const serviceEndTime = Math.round((ev.time + nextCustomer.serviceTime) * 100) / 100;
        nextCustomer.serviceEnd = serviceEndTime;
        nextCustomer.departureTime = serviceEndTime;

        server.busy = true;
        server.currentCustomer = nextCid;
        server.busyUntil = serviceEndTime;

        // Schedule departure for next customer
        eventQueue.push({
          time: serviceEndTime,
          type: 'DEPARTURE',
          customerId: nextCid,
          serverId: server.id,
        });
        sortEvents();

        action = `Atiende a C${nextCid}`;
      } else {
        action = 'Servidor libre';
      }

      const systemCount =
        servers.filter((s) => s.busy).length + queue.length;

      const simEvent: SimEvent = {
        time: ev.time,
        type: 'DEPARTURE',
        customerId: cid,
        serverId: server.id,
        description,
        action,
        nextEvent: formatNextEvents(eventQueue),
        queueLength: queue.length,
        systemCount,
        queueContent: formatQueue(queue),
      };
      events.push(simEvent);
      snapshots.push(takeSnapshot(events.length - 1, simEvent));
    }
  }

  // Compute stats
  const totalTime = customers.reduce(
    (max, c) => Math.max(max, c.departureTime),
    0
  );

  const completedCustomers = customers.filter((c) => c.departureTime > 0);
  const avgWait =
    completedCustomers.length > 0
      ? completedCustomers.reduce((s, c) => s + c.waitTime, 0) / completedCustomers.length
      : 0;
  const avgService =
    completedCustomers.length > 0
      ? completedCustomers.reduce((s, c) => s + c.serviceTime, 0) / completedCustomers.length
      : 0;
  const avgSystem =
    completedCustomers.length > 0
      ? completedCustomers.reduce((s, c) => s + (c.departureTime - c.arrivalTime), 0) /
        completedCustomers.length
      : 0;

  const serverUtilization = servers.map((s) =>
    totalTime > 0 ? Math.round((s.totalBusyTime / totalTime) * 10000) / 10000 : 0
  );

  const avgQueueLen =
    totalTime > 0 ? Math.round((queueAreaAccum / totalTime) * 10000) / 10000 : 0;

  const stats: SimulationStats = {
    avgWaitTime: Math.round(avgWait * 10000) / 10000,
    avgServiceTime: Math.round(avgService * 10000) / 10000,
    avgSystemTime: Math.round(avgSystem * 10000) / 10000,
    maxQueueLength: maxQueueLen,
    avgQueueLength: avgQueueLen,
    serverUtilization,
    totalSimulationTime: totalTime,
  };

  return { events, customers, snapshots, stats };
}
