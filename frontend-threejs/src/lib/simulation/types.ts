export type DistributionMode = 'exponential' | 'table';

export interface SimConfig {
  servers: number;
  arrivalRate: number;  // lambda
  serviceRate: number;  // mu
  customerCount: number;
  distributionMode: DistributionMode;
  // For table-based mode
  arrivalTable?: { from: number; to: number; value: number }[];
  serviceTable?: { from: number; to: number; value: number }[];
}

export interface CustomerRecord {
  id: number;
  arrivalTime: number;
  waitTime: number;
  serviceStart: number;
  serviceEnd: number;
  departureTime: number;
  serverAssigned: number;
  arrivalRandom: number;
  serviceRandom: number;
  interArrivalTime: number;
  serviceTime: number;
}

export interface ServerState {
  id: number;
  busy: boolean;
  currentCustomer: number | null;
  busyUntil: number;
  totalBusyTime: number;
}

export type EventType = 'ARRIVAL' | 'DEPARTURE' | 'INIT';

export interface SimEvent {
  time: number;
  type: EventType;
  customerId: number;
  serverId?: number;
  description: string;
  action: string;
  nextEvent: string;
  queueLength: number;
  systemCount: number;
  queueContent: string;
}

export interface SimulationSnapshot {
  clock: number;
  eventIndex: number;
  servers: ServerState[];
  queue: number[]; // customer IDs in queue
  customers: CustomerRecord[];
  currentEvent: SimEvent | null;
}

export interface SimulationResult {
  events: SimEvent[];
  customers: CustomerRecord[];
  snapshots: SimulationSnapshot[];
  stats: SimulationStats;
}

export interface SimulationStats {
  avgWaitTime: number;
  avgServiceTime: number;
  avgSystemTime: number;
  maxQueueLength: number;
  avgQueueLength: number;
  serverUtilization: number[];
  totalSimulationTime: number;
}
