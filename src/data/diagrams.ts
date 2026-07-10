import type { Diagram } from '../lib/types';
import { ARCHITECTURE_DIAGRAM } from './architecture';
import { NETWORKING_DIAGRAM } from './networking';
import { STORAGE_DIAGRAM } from './storage';
import { RBAC_DIAGRAM } from './rbac';
import { CICD_DIAGRAM } from './cicd';
import { TRAFFIC_DIAGRAM } from './traffic';
import { TLS_DIAGRAM } from './tls';
import { OBSERVABILITY_DIAGRAM } from './observability';

export const DIAGRAMS: Diagram[] = [
	ARCHITECTURE_DIAGRAM,
	NETWORKING_DIAGRAM,
	TRAFFIC_DIAGRAM,
	STORAGE_DIAGRAM,
	RBAC_DIAGRAM,
	TLS_DIAGRAM,
	CICD_DIAGRAM,
	OBSERVABILITY_DIAGRAM,
];

export function getDiagram(id: string): Diagram | undefined {
	return DIAGRAMS.find(d => d.id === id);
}
