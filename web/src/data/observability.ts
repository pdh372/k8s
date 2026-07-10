import type { Diagram } from '../lib/types';

/**
 * The three pillars of observability. Apps and nodes emit metrics, logs and
 * traces, each flowing through its own pipeline and converging in a
 * visualization layer (Grafana).
 */
export const OBSERVABILITY_DIAGRAM: Diagram = {
	id: 'observability',
	title: 'Observability',
	subtitle:
		'Metrics, logs and traces — the three pillars. Apps and nodes emit signals that flow through separate pipelines into dashboards.',
	viewBox: '0 0 1000 600',
	defaultSelected: 'prometheus',
	groups: {
		source: { color: '#34d399', label: 'Signal source' },
		metrics: { color: '#5B8DEF', label: 'Metrics' },
		consumer: { color: '#38bdf8', label: 'Autoscaling' },
		logs: { color: '#fbbf24', label: 'Logs' },
		traces: { color: '#f472b6', label: 'Traces' },
		viz: { color: '#a78bfa', label: 'Visualization' },
	},
	boxes: [
		{ x: 250, y: 45, w: 520, h: 175, label: 'Metrics', variant: 'dashed' },
		{ x: 250, y: 250, w: 520, h: 110, label: 'Logs', variant: 'dashed' },
		{ x: 250, y: 400, w: 520, h: 110, label: 'Traces', variant: 'dashed' },
	],
	nodes: [
		{
			id: 'pods',
			label: 'App Pods',
			group: 'source',
			x: 40,
			y: 110,
			w: 160,
			h: 70,
			tagline: 'Emit all three signals',
			details:
				'Your applications expose a /metrics endpoint (Prometheus format), write logs to stdout/stderr, and emit trace spans via an OpenTelemetry SDK.',
			questions: [
				{
					q: 'What are the three pillars of observability?',
					a: 'Metrics (numeric aggregates over time), logs (discrete events), and traces (the path of one request across services).',
				},
				{
					q: 'Where should a container write its logs?',
					a: "To stdout/stderr, so the node's log agent can collect them — don't manage log files inside the container.",
				},
			],
		},
		{
			id: 'node',
			label: 'Node / kubelet',
			group: 'source',
			x: 40,
			y: 360,
			w: 160,
			h: 70,
			tagline: 'cAdvisor resource metrics',
			details:
				'The kubelet embeds cAdvisor, which exposes CPU, memory and filesystem metrics per container and node — the source for resource metrics.',
			questions: [
				{
					q: 'Where do `kubectl top` numbers originate?',
					a: 'cAdvisor inside the kubelet, aggregated by metrics-server.',
				},
				{
					q: 'Which node-level signals matter most?',
					a: 'CPU, memory, disk and network per node and container, plus node conditions (e.g. MemoryPressure).',
				},
			],
		},
		{
			id: 'metricsserver',
			label: 'metrics-server',
			group: 'metrics',
			x: 280,
			y: 70,
			w: 170,
			h: 55,
			tagline: 'Live resource metrics',
			details:
				'A lightweight, in-memory aggregator of live CPU/memory metrics from the kubelets. It powers `kubectl top` and the HorizontalPodAutoscaler — it is not long-term storage.',
			questions: [
				{
					q: 'Is metrics-server a monitoring system?',
					a: "No — it's a short-lived, in-memory aggregator for autoscaling and `kubectl top`, with no history.",
				},
				{
					q: 'What breaks if metrics-server is down?',
					a: '`kubectl top` and CPU/memory-based HPA scaling stop working.',
				},
			],
		},
		{
			id: 'prometheus',
			label: 'Prometheus',
			group: 'metrics',
			x: 280,
			y: 140,
			w: 170,
			h: 55,
			tagline: 'Pull-based time series',
			details:
				'Prometheus scrapes /metrics endpoints on a schedule (targets found via Kubernetes service discovery), stores time series, and evaluates alerting rules.',
			questions: [
				{
					q: 'Is Prometheus push- or pull-based?',
					a: 'Pull — it scrapes targets it discovers. Short-lived jobs can push via a Pushgateway.',
				},
				{
					q: 'How do you get app metrics into Prometheus?',
					a: 'Expose a /metrics endpoint with a client library or exporter, and Prometheus scrapes it.',
				},
			],
		},
		{
			id: 'hpa',
			label: 'HPA / kubectl top',
			group: 'consumer',
			x: 560,
			y: 105,
			w: 180,
			h: 60,
			tagline: 'Consumes metrics',
			details:
				'Consumers of metrics. The HorizontalPodAutoscaler reads resource or custom metrics to scale replicas; `kubectl top` shows live usage.',
			questions: [
				{
					q: 'What metrics can the HPA scale on?',
					a: 'Resource metrics from metrics-server, plus custom/external metrics via the custom metrics API (e.g. a Prometheus adapter).',
				},
				{
					q: 'What happens if the metrics are unavailable?',
					a: "The HPA can't compute a target, so it holds the current replica count instead of scaling.",
				},
			],
		},
		{
			id: 'logagent',
			label: 'Log agent',
			group: 'logs',
			x: 280,
			y: 280,
			w: 190,
			h: 55,
			tagline: 'Per-node DaemonSet',
			details:
				'A per-node agent (Fluent Bit, Fluentd, Vector) that tails container log files, enriches them with pod/namespace labels, and ships them to a store.',
			questions: [
				{
					q: 'Why run the log agent as a DaemonSet?',
					a: 'So one agent per node collects logs from every container on that node.',
				},
				{
					q: 'What happens to logs when a Pod is deleted?',
					a: 'The local files vanish with the Pod — which is exactly why you ship them to a central store.',
				},
			],
		},
		{
			id: 'logstore',
			label: 'Log store',
			group: 'logs',
			x: 540,
			y: 280,
			w: 190,
			h: 55,
			tagline: 'Indexes & stores logs',
			details:
				'The backend that stores and lets you search logs — Loki, Elasticsearch/OpenSearch, or a cloud logging service.',
			questions: [
				{
					q: 'Loki vs Elasticsearch?',
					a: 'Loki indexes only labels (cheaper, integrates with Grafana); Elasticsearch does heavier full-text indexing.',
				},
				{
					q: 'How do you correlate a log line with a trace?',
					a: 'Include the trace ID in the log so you can jump between logs and the matching trace.',
				},
			],
		},
		{
			id: 'otel',
			label: 'OTel Collector',
			group: 'traces',
			x: 280,
			y: 430,
			w: 190,
			h: 55,
			tagline: 'Vendor-neutral pipeline',
			details:
				'The OpenTelemetry Collector receives spans (and optionally metrics/logs) from instrumented apps, processes and batches them, then exports to a backend.',
			questions: [
				{
					q: "What's the difference between a span and a trace?",
					a: 'A span is one timed operation; a trace is the tree of spans for a single request across services.',
				},
				{
					q: 'Why use the OpenTelemetry Collector?',
					a: 'A single vendor-neutral pipeline to receive, process and fan telemetry out to any backend.',
				},
			],
		},
		{
			id: 'tracestore',
			label: 'Trace store',
			group: 'traces',
			x: 540,
			y: 430,
			w: 200,
			h: 55,
			tagline: 'Stores & queries traces',
			details:
				'A distributed-tracing backend (Jaeger, Tempo, Zipkin) that stores traces and lets you find latency and errors across services.',
			questions: [
				{
					q: 'What do traces help you find?',
					a: 'Where time is spent in a request and which service caused an error along the call chain.',
				},
				{
					q: 'What is context propagation?',
					a: 'Passing the trace/span IDs (e.g. the W3C traceparent header) between services so their spans join one trace.',
				},
			],
		},
		{
			id: 'grafana',
			label: 'Grafana',
			group: 'viz',
			x: 820,
			y: 250,
			w: 160,
			h: 110,
			tagline: 'Unified dashboards',
			details:
				'The visualization layer. Grafana queries the metrics, logs and traces backends into unified dashboards and drives alerting.',
			questions: [
				{
					q: 'Can one Grafana show all three pillars?',
					a: 'Yes — add Prometheus, Loki and Tempo/Jaeger as data sources and correlate between them.',
				},
				{
					q: 'Where do alerts come from?',
					a: "Prometheus/Alertmanager rules, or Grafana's own alerting evaluating queries.",
				},
			],
		},
	],
	edges: [
		{ from: 'pods', to: 'prometheus' },
		{ from: 'pods', to: 'logagent' },
		{ from: 'pods', to: 'otel' },
		{ from: 'node', to: 'metricsserver' },
		{ from: 'node', to: 'prometheus' },
		{ from: 'metricsserver', to: 'hpa' },
		{ from: 'prometheus', to: 'grafana' },
		{ from: 'logagent', to: 'logstore' },
		{ from: 'logstore', to: 'grafana' },
		{ from: 'otel', to: 'tracestore' },
		{ from: 'tracestore', to: 'grafana' },
	],
};
